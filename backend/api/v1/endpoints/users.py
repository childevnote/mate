from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from database import get_db
import schemas.user as schemas
import crud.crud_users as crud

router = APIRouter()

# 아이디 중복 검사
@router.get("/check-username")
def check_username(username: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=username)
    if user:
        return {"isAvailable": False, "message": "이미 사용 중인 아이디입니다."}
    return {"isAvailable": True, "message": "사용 가능한 아이디입니다."}

# 회원가입 
@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 이메일 중복 체크
    if crud.get_user_by_email(db, email=user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 가입된 이메일입니다."
        )
    
    # 아이디 중복 체크
    if crud.get_user_by_username(db, username=user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 아이디입니다."
        )

    # 유저 생성
    return crud.create_user(db=db, user=user)