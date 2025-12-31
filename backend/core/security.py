from passlib.context import CryptContext

# 비밀번호 암호화 알고리즘 설정 (bcrypt 사용)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """입력받은 비밀번호와 DB의 암호화된 비밀번호 비교"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """비밀번호 암호화 (회원가입 시 사용)"""
    return pwd_context.hash(password)