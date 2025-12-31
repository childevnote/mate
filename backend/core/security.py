from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
import os

ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1시간
ALGORITHM = "HS256"
# .env에 SECRET_KEY가 없으면 임시 키를 씁니다 (배포 시엔 꼭 .env에 넣으세요!)
SECRET_KEY = os.getenv("SECRET_KEY", "mate-backend-secret-key-2025")
# 비밀번호 암호화 알고리즘 설정 (bcrypt 사용)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """입력받은 비밀번호와 DB의 암호화된 비밀번호 비교"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """비밀번호 암호화 (회원가입 시 사용)"""
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any]) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 토큰에 담을 정보 (여기선 user_id를 'sub'라는 이름으로 담습니다)
    to_encode = {"exp": expire, "sub": str(subject)}
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt