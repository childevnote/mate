from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database import get_db
from core import security
from models.user import User
from schemas.token import Token

router = APIRouter()

# 그인 (토큰 2개 세트 발급)
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # 유저가 없거나 비밀번호가 틀리면 401 에러
    if not user or not security.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.", # 메시지도 수정
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token, 
        "token_type": "bearer"
    }

# 토큰 갱신
@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    try:
        # 1. 토큰 해독
        payload = jwt.decode(
            refresh_token, 
            security.settings.SECRET_KEY,
            algorithms=[security.settings.ALGORITHM]
        )
        
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")
        
        # 2. DB 유저 확인
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise HTTPException(status_code=401, detail="존재하지 않는 사용자입니다.")
            
        # 3. 새 액세스 토큰 발급
        new_access_token = security.create_access_token(subject=user.id)
        
        return {
            "access_token": new_access_token,
            "refresh_token": refresh_token, # 기존 리프레시 토큰 재사용 (Rotation 안 함)
            "token_type": "bearer"
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰이 만료되었거나 유효하지 않습니다."
        )