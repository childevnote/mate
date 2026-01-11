from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from schemas.user import PasskeyResponse
import random
import string
import base64

# DB 및 모델 관련
from database import get_db
from models.user import User, Passkey
from core.security import create_access_token, create_refresh_token
from core.config import settings

from api.deps import get_current_user

router = APIRouter()

# --------------------------------------------------------------------------
# 1. 회원가입용 옵션 요청 (아이디 중복 확인 및 챌린지 생성)
# --------------------------------------------------------------------------
@router.post("/signup/options")
def signup_options(
    username: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    # 1. 이미 존재하는 아이디인지 확인
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    # 2. Challenge 생성
    challenge = "".join(random.choices(string.ascii_letters + string.digits, k=32))
    
    return {
        "challenge": challenge,
        "rp": {
            "name": settings.RP_NAME,
            "id": settings.RP_ID,
        },
        "user": {
            "id": base64.urlsafe_b64encode(username.encode()).decode().rstrip("="),
            "name": username,
            "displayName": username,
        },
        "pubKeyCredParams": [
            {"type": "public-key", "alg": -7}, # ES256
            {"type": "public-key", "alg": -257}, # RS256
        ],
        "timeout": 60000,
        "attestation": "none",
        "excludeCredentials": [],
        "authenticatorSelection": {
            "authenticatorAttachment": "platform",
            "userVerification": "required",
            "residentKey": "required"
        }
    }

# --------------------------------------------------------------------------
# 2. 회원가입 검증 및 유저 생성
# --------------------------------------------------------------------------
@router.post("/signup/verify")
def signup_verify(
    username: str = Body(...),
    nickname: str = Body(...),
    email: str = Body(...),
    university_id: int | None = Body(None),
    response: dict = Body(...),
    db: Session = Depends(get_db)
):
    # 1. 아이디 중복 재확인 (방어 로직)
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="이미 가입된 아이디입니다.")

    # 이메일 중복 확인
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")

    # 3. 유저 DB 생성
    new_user = User(
        username=username,
        nickname=nickname,
        email=email,
        password=None,
        university_id=university_id,
        is_active=True,
        is_student_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. 패스키 정보 저장
    new_passkey = Passkey(
        user_id=new_user.id,
        credential_id=response.get("id", "dummy_id"),
        public_key="dummy_public_key",
        sign_count=0
    )
    db.add(new_passkey)
    db.commit()

    # 5. 토큰 발급
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

# --------------------------------------------------------------------------
# 3. 로그인용 옵션 요청
# --------------------------------------------------------------------------
@router.post("/login/options")
def login_options(
    username: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="존재하지 않는 사용자입니다.")
    
    challenge = "".join(random.choices(string.ascii_letters + string.digits, k=32))

    return {
        "challenge": challenge,
        "rpId": settings.RP_ID,
        "timeout": 60000,
        "userVerification": "required",
    }

# --------------------------------------------------------------------------
# 4. 로그인 검증
# --------------------------------------------------------------------------
@router.post("/login/verify")
def login_verify(
    username: str = Body(...),
    response: dict = Body(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    
    # 검증 성공 시 토큰 발급
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# --------------------------------------------------------------------------
# 5. 내 기기(패스키) 목록 조회
# --------------------------------------------------------------------------
@router.get("/list", response_model=List[PasskeyResponse])
def get_my_passkeys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    passkeys = db.query(Passkey).filter(Passkey.user_id == current_user.id).all()
    return passkeys

# --------------------------------------------------------------------------
# 6. 기기(패스키) 삭제
# --------------------------------------------------------------------------
@router.delete("/{passkey_id}")
def delete_passkey(
    passkey_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 내 패스키인지 확인
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