import json
import time
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from webauthn import generate_registration_options, verify_registration_response
from webauthn import generate_authentication_options, verify_authentication_response
from webauthn.helpers import bytes_to_base64url, base64url_to_bytes, options_to_json

from database import get_db
from models.user import User
from models.passkey import Passkey, PasskeyChallenge
from core.webauthn_config import RP_ID, RP_NAME, ORIGIN
from core import security

from webauthn.helpers.structs import (
    PublicKeyCredentialCreationOptions, 
    PublicKeyCredentialRequestOptions,
    PublicKeyCredentialDescriptor,
    PublicKeyCredentialType         
)

router = APIRouter()

# ---- [Helper 함수] 챌린지 DB 관리 ----
def save_challenge(db: Session, username: str, challenge: bytes):
    """DB에 챌린지 저장 (기존 거 있으면 덮어쓰기)"""
    # bytes -> base64 string 변환 저장
    challenge_b64 = bytes_to_base64url(challenge)
    
    existing = db.query(PasskeyChallenge).filter(PasskeyChallenge.username == username).first()
    if existing:
        existing.challenge = challenge_b64
        existing.created_at = int(time.time())
    else:
        new_challenge = PasskeyChallenge(
            username=username,
            challenge=challenge_b64,
            created_at=int(time.time())
        )
        db.add(new_challenge)
    db.commit()

def get_and_delete_challenge(db: Session, username: str) -> bytes:
    """DB에서 챌린지 꺼내고 바로 삭제 (일회용)"""
    record = db.query(PasskeyChallenge).filter(PasskeyChallenge.username == username).first()
    
    if not record:
        return None
    
    # 2분(120초) 이상 지난 챌린지는 무효 처리
    if int(time.time()) - record.created_at > 120:
        db.delete(record)
        db.commit()
        return None

    challenge_bytes = base64url_to_bytes(record.challenge)
    
    # 꺼냈으면 삭제 (보안상 재사용 방지)
    db.delete(record)
    db.commit()
    
    return challenge_bytes


@router.post("/register/options")
def register_options(user_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    exclude_credentials = []
    for pk in user.passkeys:
        exclude_credentials.append(
            PublicKeyCredentialDescriptor(
                type=PublicKeyCredentialType.PUBLIC_KEY,
                id=base64url_to_bytes(pk.credential_id)
            )
        )
    options = generate_registration_options(
        rp_id=RP_ID,
        rp_name=RP_NAME,
        user_id=str(user.id).encode(),
        user_name=user.username,
        exclude_credentials=exclude_credentials,
    )

    # 메모리 대신 DB에 저장
    save_challenge(db, user.username, options.challenge)

    return json.loads(options_to_json(options))

@router.post("/register/verify")
def register_verify(
    username: str = Body(...),
    response: dict = Body(...),
    db: Session = Depends(get_db)
):
    # DB에서 꺼내오기
    expected_challenge = get_and_delete_challenge(db, username)
    if not expected_challenge:
        raise HTTPException(status_code=400, detail="Challenge not found or expired")

    try:
        verification = verify_registration_response(
            credential=response,
            expected_challenge=expected_challenge, # bytes 타입이어야 함
            expected_origin=ORIGIN,
            expected_rp_id=RP_ID,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification failed: {str(e)}")

    user = db.query(User).filter(User.username == username).first()
    
    new_passkey = Passkey(
        user_id=user.id,
        credential_id=bytes_to_base64url(verification.credential_id),
        public_key=verification.credential_public_key,
        sign_count=verification.sign_count,
        device_name="My Device"
    )
    db.add(new_passkey)
    db.commit()
    
    return {"status": "ok"}

@router.post("/login/options")
def login_options(username: str = Body(..., embed=True), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    allow_credentials = []
    for pk in user.passkeys:
        allow_credentials.append(
            PublicKeyCredentialDescriptor(
                type=PublicKeyCredentialType.PUBLIC_KEY,
                id=base64url_to_bytes(pk.credential_id)
            )
        )
    if not allow_credentials:
        raise HTTPException(status_code=400, detail="No passkeys registered")

    options = generate_authentication_options(
        rp_id=RP_ID,
        allow_credentials=allow_credentials,
    )

    # 메모리 대신 DB에 저장
    save_challenge(db, user.username, options.challenge)

    return json.loads(options_to_json(options))

@router.post("/login/verify")
def login_verify(
    username: str = Body(...),
    response: dict = Body(...),
    db: Session = Depends(get_db)
):
    # DB에서 꺼내오기
    expected_challenge = get_and_delete_challenge(db, username)
    if not expected_challenge:
        raise HTTPException(status_code=400, detail="Challenge not found or expired")

    user = db.query(User).filter(User.username == username).first()
    
    credential_id = response.get("id")
    passkey_record = db.query(Passkey).filter(Passkey.credential_id == credential_id).first()
    
    if not passkey_record:
        raise HTTPException(status_code=400, detail="Unknown passkey")

    try:
        verification = verify_authentication_response(
            credential=response,
            expected_challenge=expected_challenge,
            expected_origin=ORIGIN,
            expected_rp_id=RP_ID,
            credential_public_key=passkey_record.public_key,
            credential_current_sign_count=passkey_record.sign_count,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Login failed: {str(e)}")

    passkey_record.sign_count = verification.new_sign_count
    db.commit()

    access_token = security.create_access_token(user.id)
    refresh_token = security.create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }