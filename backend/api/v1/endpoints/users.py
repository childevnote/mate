from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List  

from database import get_db
from api import deps        
from models.user import User  


import schemas.user as user_schemas        
import crud.crud_users as user_crud

import schemas.community as community_schemas 
from crud import crud_community

router = APIRouter()

# 아이디 중복 검사
@router.get("/check-username")
def check_username(username: str, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_username(db, username=username)
    if user:
        return {"isAvailable": False, "message": "이미 사용 중인 아이디입니다."}
    return {"isAvailable": True, "message": "사용 가능한 아이디입니다."}

# 회원가입 
@router.post("/register", response_model=user_schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: user_schemas.UserCreate, db: Session = Depends(get_db)):
    # 이메일 중복 체크
    if user_crud.get_user_by_email(db, email=user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 가입된 이메일입니다."
        )
    
    # 아이디 중복 체크
    if user_crud.get_user_by_username(db, username=user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 아이디입니다."
        )

    # 유저 생성
    return user_crud.create_user(db=db, user=user)


# 내 프로필 조회 (로그인 테스트용으로도 좋음)
@router.get("/me", response_model=user_schemas.UserResponse)
def read_user_me(current_user: User = Depends(deps.get_current_user)):
    return current_user

# 내가 쓴 글 목록
@router.get("/me/posts", response_model=List[community_schemas.PostResponse])
def read_own_posts(
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return crud_community.get_my_posts(db, user_id=current_user.id, skip=skip, limit=limit)

# 내가 스크랩한 글 목록
@router.get("/me/scraps", response_model=List[community_schemas.PostResponse])
def read_own_scraps(
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return crud_community.get_my_scraps(db, user_id=current_user.id, skip=skip, limit=limit)