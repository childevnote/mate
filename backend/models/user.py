from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)   # 학교명
    domain = Column(String, unique=True, nullable=False) # 메일 도메인

    users = relationship("User", back_populates="university")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    # 기본 정보
    username = Column(String, unique=True, index=True, nullable=False) # 아이디
    password = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    nickname = Column(String, unique=True, nullable=False)
    
    # 상태
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    date_joined = Column(DateTime(timezone=True), server_default=func.now())

    # 학교 인증 관련
    school_email = Column(String, unique=True, nullable=True)
    is_student_verified = Column(Boolean, default=False)

    # FK
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    
    # 관계 설정
    university = relationship("University", back_populates="users")
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")

class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False) # 인증코드
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())