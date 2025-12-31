from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# 공통 속성
class UserBase(BaseModel):
    email: EmailStr
    username: str
    nickname: str

# 회원가입 요청 (Client -> Server)
class UserCreate(UserBase):
    password: str

# 로그인 응답 / 회원 정보 조회 (Server -> Client)
class UserResponse(UserBase):
    id: int
    is_active: bool
    is_student_verified: bool
    date_joined: datetime
    # university: Optional[str] = None

    class Config:
        from_attributes = True

class CheckCodeRequest(BaseModel):
    email: EmailStr
    code: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str