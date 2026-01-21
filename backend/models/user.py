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
    email = Column(String, unique=True, index=True, nullable=True)

    # 2. 인증 정보
    password = Column(String, nullable=True)
    
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
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")

    liked_posts = relationship("PostLike", back_populates="user", cascade="all, delete-orphan")
    scrapped_posts = relationship("PostScrap", back_populates="user", cascade="all, delete-orphan")

    passkeys = relationship("Passkey", back_populates="user", cascade="all, delete-orphan")


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    purpose = Column(String, default="register", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())