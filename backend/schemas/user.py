from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --------------------------------------
# 1. 기본 유저 스키마
# --------------------------------------
class UserBase(BaseModel):
    email: EmailStr 
    username: str
    nickname: str
    university_id: Optional[int] = None # 학교 선택은 옵션

# --------------------------------------
# 2. 회원가입/생성 관련 (Client -> Server)
# --------------------------------------
class UserCreate(UserBase):
    pass 


class EmailSendRequest(BaseModel):
    """인증번호 발송 요청"""
    email: EmailStr

class EmailVerifyRequest(BaseModel):
    """인증번호 검증 요청"""
    email: EmailStr
    code: str

# --------------------------------------
# 4. 응답용 스키마 (Server -> Client)
# --------------------------------------
class UserResponse(UserBase):
    id: int
    is_active: bool
    is_student_verified: bool
    date_joined: datetime
    university_name: Optional[str] = None 
    school_email: Optional[str] = None
    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str