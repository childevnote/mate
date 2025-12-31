from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from core import security
from models.user import User
from schemas.token import LoginRequest, Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # 이메일로 유저 찾기
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # 유저가 없거나 비밀번호가 틀리면 에러
    if not user or not security.verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=400,
            detail="이메일 또는 비밀번호가 올바르지 않습니다."
        )
    
    # 맞으면 토큰 발급
    access_token = security.create_access_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }