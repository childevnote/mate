import random
import string
import base64
import json
from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.orm import Session
from typing import List

# DB 및 모델
from database import get_db
from models.user import User
from models.passkey import Passkey, PasskeyChallenge
from schemas.user import PasskeyResponse
from core.security import create_access_token, create_refresh_token
from core.config import settings
from core.utils import get_device_name
from api.deps import get_current_user

# WebAuthn 라이브러리
from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    base64url_to_bytes,
    options_to_json
)
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    RegistrationCredential,
    AuthenticationCredential,
    AuthenticatorAttestationResponse, 
    AuthenticatorAssertionResponse    
)

router = APIRouter()

RP_ID = "localhost" 
RP_NAME = settings.RP_NAME or "Mate Community"


def get_webauthn_config(request: Request):
    return settings.RP_ID, settings.RP_ORIGIN


def clean_webauthn_data(data: dict) -> dict:
    # 1. 키 매핑 (Camel -> Snake)
    key_map = {
        "rawId": "raw_id", "authenticatorAttachment": "authenticator_attachment",
        "clientExtensionResults": "client_extension_results",
        "response": "response", "id": "id", "type": "type",
        "clientDataJSON": "client_data_json", "attestationObject": "attestation_object",
        "authenticatorData": "authenticator_data", "signature": "signature", "userHandle": "user_handle"
    }
    
    def map_keys(d):
        if not isinstance(d, dict): return d
        return {key_map.get(k, k): map_keys(v) for k, v in d.items()}

    cleaned = map_keys(data)

    # 2. 불필요한 필드 제거
    for field in ["client_extension_results", "transports"]:
        if field in cleaned:
            del cleaned[field]

    # 3. Base64URL -> Bytes 변환
    binary_fields = [
        "raw_id", "client_data_json", "attestation_object", 
        "authenticator_data", "signature", "user_handle" # user_handle 포함
    ]

    def decode_recursive(d):
        for k, v in d.items():
            if k in binary_fields and isinstance(v, str):
                try:
                    # 빈 문자열이면 None 처리
                    if not v:
                        d[k] = None
                    else:
                        d[k] = base64url_to_bytes(v)
                except Exception:
                    pass 
            elif isinstance(v, dict):
                decode_recursive(v)
    
    decode_recursive(cleaned)
    return cleaned


# --------------------------------------------------------------------------
# 1. 회원가입용 옵션 요청
# --------------------------------------------------------------------------
@router.post("/signup/options")
def signup_options(
    request: Request,
    username: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    rp_id, _ = get_webauthn_config(request)

    options = generate_registration_options(
        rp_id=rp_id,
        rp_name=RP_NAME,
        user_name=username,
        user_id=username.encode(),
        authenticator_selection=AuthenticatorSelectionCriteria(
            user_verification=UserVerificationRequirement.PREFERRED
        )
    )

    challenge_str = base64.urlsafe_b64encode(options.challenge).decode().rstrip("=")
    
    challenge_entry = PasskeyChallenge(
        username=username,
        challenge=challenge_str,
        created_at=int(options.timeout or 60000)
    )
    db.merge(challenge_entry)
    db.commit()

    return json.loads(options_to_json(options))


# --------------------------------------------------------------------------
# 2. 회원가입 검증 및 유저 생성
# --------------------------------------------------------------------------
@router.post("/signup/verify")
def signup_verify(
    request: Request,
    username: str = Body(...),
    nickname: str = Body(...),
    email: str = Body(...),
    university_id: int | None = Body(None),
    response: dict = Body(...),
    db: Session = Depends(get_db)
):
    challenge_entry = db.query(PasskeyChallenge).filter(PasskeyChallenge.username == username).first()
    if not challenge_entry:
        raise HTTPException(status_code=400, detail="요청이 만료되었습니다.")

    rp_id, origin = get_webauthn_config(request)

    try:
        data = clean_webauthn_data(response)

        auth_response = AuthenticatorAttestationResponse(
            client_data_json=data['response']['client_data_json'],
            attestation_object=data['response']['attestation_object']
        )

        credential = RegistrationCredential(
            id=data['id'],
            raw_id=data['raw_id'],
            response=auth_response,
            type=data['type'],
            authenticator_attachment=data.get('authenticator_attachment')
        )
        
        verification = verify_registration_response(
            credential=credential,
            expected_challenge=base64url_to_bytes(challenge_entry.challenge),
            expected_origin=origin,
            expected_rp_id=rp_id,
        )

        if db.query(User).filter(User.username == username).first():
            raise HTTPException(status_code=400, detail="이미 가입된 아이디입니다.")
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")
            
        new_user = User(
            username=username,
            nickname=nickname,
            email=email,
            university_id=university_id,
            is_active=True,
            is_student_verified=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        cred_id = base64.urlsafe_b64encode(verification.credential_id).decode().rstrip("=")
        pub_key = base64.b64encode(verification.credential_public_key).decode()
        
        device_name = get_device_name(request.headers.get("user-agent"))

        new_passkey = Passkey(
            user_id=new_user.id,
            credential_id=cred_id,
            public_key=pub_key, 
            sign_count=verification.sign_count,
            device_name=device_name
        )
        db.add(new_passkey)
        
        db.delete(challenge_entry)
        db.commit()

        access_token = create_access_token(data={"sub": str(new_user.id)})
        refresh_token = create_refresh_token(data={"sub": str(new_user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "username": new_user.username,
                "nickname": new_user.nickname,
                "email": new_user.email
            }
        }

    except Exception as e:
        print(f"\n❌ Signup Verify Error: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail="회원가입 검증 실패")


# --------------------------------------------------------------------------
# 3. 로그인용 옵션 요청
# --------------------------------------------------------------------------
@router.post("/login/options")
def login_options(
    request: Request,
    username: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="존재하지 않는 사용자입니다.")
    
    rp_id, _ = get_webauthn_config(request)

    options = generate_authentication_options(
        rp_id=rp_id,
        user_verification=UserVerificationRequirement.PREFERRED
    )

    challenge_str = base64.urlsafe_b64encode(options.challenge).decode().rstrip("=")
    
    challenge_entry = PasskeyChallenge(
        username=username,
        challenge=challenge_str,
        created_at=int(options.timeout or 60000)
    )
    db.merge(challenge_entry)
    db.commit()

    return json.loads(options_to_json(options))


# --------------------------------------------------------------------------
# 4. 로그인 검증
# --------------------------------------------------------------------------
@router.post("/login/verify")
def login_verify(
    request: Request,
    username: str = Body(...),
    response: dict = Body(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    
    challenge_entry = db.query(PasskeyChallenge).filter(PasskeyChallenge.username == username).first()
    if not challenge_entry:
        raise HTTPException(status_code=400, detail="요청 만료")

    user_passkeys = db.query(Passkey).filter(Passkey.user_id == user.id).all()
    input_cred_id = response.get("id")
    
    current_passkey = next((pk for pk in user_passkeys if pk.credential_id == input_cred_id), None)
    
    if not current_passkey:
        if user_passkeys: current_passkey = user_passkeys[0]
        else: raise HTTPException(status_code=400, detail="등록된 기기가 없습니다.")

    rp_id, origin = get_webauthn_config(request)

    try:
        stored_pub_key = base64.b64decode(current_passkey.public_key)

        data = clean_webauthn_data(response)

        # 🔥 user_handle 처리 강화
        user_handle = data['response'].get('user_handle')
        if user_handle == b"" or user_handle == "": 
            user_handle = None

        auth_response = AuthenticatorAssertionResponse(
            client_data_json=data['response']['client_data_json'],
            authenticator_data=data['response']['authenticator_data'],
            signature=data['response']['signature'],
            user_handle=user_handle
        )

        credential = AuthenticationCredential(
            id=data['id'],
            raw_id=data['raw_id'],
            response=auth_response,
            type=data['type'],
            authenticator_attachment=data.get('authenticator_attachment')
        )

        verification = verify_authentication_response(
            credential=credential,
            expected_challenge=base64url_to_bytes(challenge_entry.challenge),
            expected_origin=origin,
            expected_rp_id=rp_id,
            credential_public_key=stored_pub_key,
            credential_current_sign_count=current_passkey.sign_count
        )

        current_passkey.sign_count = verification.new_sign_count
        db.delete(challenge_entry)
        db.commit()

        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except Exception as e:
        print(f"❌ Login Verify Error: {e}")
        raise HTTPException(status_code=400, detail="로그인 인증 실패")


# --------------------------------------------------------------------------
# 5. 내 기기 목록 & 삭제
# --------------------------------------------------------------------------
@router.get("/list", response_model=List[PasskeyResponse])
def get_my_passkeys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    passkeys = db.query(Passkey).filter(Passkey.user_id == current_user.id).all()
    return passkeys

@router.delete("/{passkey_id}")
def delete_passkey(
    passkey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    passkey = db.query(Passkey).filter(
        Passkey.id == passkey_id,
        Passkey.user_id == current_user.id
    ).first()
    
    if not passkey:
        raise HTTPException(status_code=404, detail="기기를 찾을 수 없습니다.")
    
    count = db.query(Passkey).filter(Passkey.user_id == current_user.id).count()
    if count <= 1:
        raise HTTPException(status_code=400, detail="최소 하나의 기기는 유지해야 합니다.")

    db.delete(passkey)
    db.commit()
    return {"message": "기기가 삭제되었습니다."}