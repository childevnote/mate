from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from api import deps
from models.user import User
import schemas.community as schemas
from crud import crud_community as crud

router = APIRouter()

# 게시글 작성
@router.post("/posts", response_model=schemas.PostResponse)
def create_post(
    post: schemas.PostCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user) 
):
    # user_id=1 (삭제) ➔ current_user.id (진짜 유저 ID)
    return crud.create_post(db=db, post=post, user_id=current_user.id)

# 게시글 목록 조회 (누구나 볼 수 있음 - 자물쇠 없음)
@router.get("/posts", response_model=List[schemas.PostResponse])
def read_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_posts(db, skip=skip, limit=limit)