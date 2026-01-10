from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    domain = Column(String, unique=True, nullable=False)

    users = relationship("User", back_populates="university")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. 필수 정보
    username = Column(String, unique=True, index=True, nullable=False)
    nickname = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True) # 필수지만 nullable=True (로직에서 제어)

    # 2. 인증 정보
    password = Column(String, nullable=True) # 패스키 유저는 NULL
    
    # 3. 학교/학생 인증
    school_email = Column(String, unique=True, nullable=True)
    is_student_verified = Column(Boolean, default=False)

    # 4. 계정 상태
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    date_joined = Column(DateTime(timezone=True), server_default=func.now())

    # 5. 관계
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    
    university = relationship("University", back_populates="users")
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    
    passkeys = relationship("Passkey", back_populates="user")

class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 🔥 [신규 추가] Passkey 모델 정의
class Passkey(Base):
    __tablename__ = "passkeys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # WebAuthn Credential ID (긴 문자열)
    credential_id = Column(String, unique=True, index=True, nullable=False)
    
    # Public Key (검증용 공개키)
    public_key = Column(String, nullable=False)
    
    # 서명 카운트 (보안용)
    sign_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="passkeys")