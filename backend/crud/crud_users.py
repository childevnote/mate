from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate
from core.security import get_password_hash

# 유저 조회 (username으로) - 중복 가입 방지용
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

# 유저 조회 (email로)
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# 유저 조회 (ID로)
def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

# 유저 생성 (회원가입)
def create_user(db: Session, user: UserCreate):
    # 비밀번호 암호화
    hashed_password = get_password_hash(user.password)
    
    db_user = User(
        username=user.username,
        email=user.email,
        nickname=user.nickname,
        password=hashed_password,
        is_active=True,
        is_student_verified=False # 기본값 미인증
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user