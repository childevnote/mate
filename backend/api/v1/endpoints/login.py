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
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # 유저가 없거나 비밀번호가 틀리면 401 에러
    if not user or not security.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # ✅ [수정] 토큰 2개 생성 (Access + Refresh)
    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token, 
        "token_type": "bearer"
    }

# 토큰 갱신 (리프레시 토큰을 주면 -> 새 액세스 토큰을 줌)
@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    try:
        # 토큰 해독 (security.py에 있는 키와 알고리즘 사용)
        payload = jwt.decode(
            refresh_token, 
            security.SECRET_KEY, 
            algorithms=[security.ALGORITHM]
        )
        
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        # 검증: "user_id가 없거나", "토큰 타입이 refresh가 아니면" 탈락
        if user_id is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")
        
        # DB에 유저가 실제로 존재하는지 재확인 (보안 강화)
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="존재하지 않는 사용자입니다.")
            
        # 모든 게 정상이면 새 액세스 토큰 발급
        new_access_token = security.create_access_token(subject=user.id)
        
        return {
            "access_token": new_access_token,
            "refresh_token": refresh_token, # 기존 리프레시 토큰 재사용 (원하시면 새로 발급도 가능)
            "token_type": "bearer"
        }
        
    except JWTError:
        # 토큰 시간이 만료되었거나 조작된 경우
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰이 만료되었거나 유효하지 않습니다."
        )