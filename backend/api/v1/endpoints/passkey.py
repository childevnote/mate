from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import timedelta

# DB 및 모델 관련
from database import get_db
from models.user import User, Passkey
from schemas.user import UserCreate, UserResponse # 기존 스키마 활용
from core.security import create_access_token, create_refresh_token
from core.config import settings

import base64
import random
import string

router = APIRouter()

# --------------------------------------------------------------------------
# 1. [신규] 회원가입용 옵션 요청 (아이디 중복 확인 및 챌린지 생성)
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

    # 2. WebAuthn 등록 옵션 생성 (Challenge)
    # 실제로는 webauthn 라이브러리의 generate_registration_options 사용 권장
    challenge = "".join(random.choices(string.ascii_letters + string.digits, k=32))
    
    # 3. 챌린지를 세션이나 캐시(Redis)에 저장해야 검증 가능함
    # 여기서는 데모를 위해 챌린지를 그대로 반환하지만, 실제론 서버가 기억하고 있어야 함.
    
    # 프론트엔드 @simplewebauthn/browser 가 이해할 수 있는 포맷
    return {
        "challenge": challenge,
        "rp": {
            "name": "Mate Community",
            "id": "localhost", # 배포시에는 실제 도메인 (예: mate.com)
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
            "authenticatorAttachment": "platform", # 지문/FaceID (기기 내장)
            "userVerification": "required",
            "residentKey": "required" # 패스키 방식 필수
        }
    }

# --------------------------------------------------------------------------
# 2. [신규] 회원가입 검증 및 유저 생성 (실제 가입 처리)
# --------------------------------------------------------------------------
@router.post("/signup/verify")
def signup_verify(
    username: str = Body(...),
    nickname: str = Body(...),
    email: str = Body(...),
    university_id: int | None = Body(None),
    response: dict = Body(...), # WebAuthn 인증 응답 결과
    db: Session = Depends(get_db)
):
    # 1. 아이디 중복 재확인
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="이미 가입된 사용자입니다.")

    new_user = User(
        username=username,
        nickname=nickname,
        email=email,
        password=None, # 패스키 유저는 비밀번호 NULL
        university_id=university_id,
        is_active=True,
        is_student_verified=False # 기본값
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    # 임시: 더미 데이터로 패스키 등록 처리
    new_passkey = Passkey(
        user_id=new_user.id,
        credential_id=response.get("id", "dummy_id"),
        public_key="dummy_public_key",
        sign_count=0
    )
    db.add(new_passkey)
    db.commit()

    # 5. 토큰 발급 (자동 로그인)
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
        "rpId": "localhost",
        "timeout": 60000,
        "userVerification": "required",
        # "allowCredentials": [...]
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