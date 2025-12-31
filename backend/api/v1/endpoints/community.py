from fastapi import APIRouter, Depends, HTTPException
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

# 댓글 작성 API
@router.post("/comments", response_model=schemas.CommentResponse)
def create_comment(
    comment: schemas.CommentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user) # 🔐 로그인 필수
):
    return crud.create_comment(db=db, comment=comment, user_id=current_user.id)

# 특정 게시글의 댓글 목록 조회 API
@router.get("/posts/{post_id}/comments", response_model=List[schemas.CommentResponse])
def read_comments(
    post_id: int, 
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    return crud.get_comments_by_post(db, post_id=post_id, skip=skip, limit=limit)


# 좋아요 버튼 클릭
@router.post("/posts/{post_id}/like")
def like_post(
    post_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user) # 🔐 로그인 필수
):
    result = crud.toggle_like(db, post_id=post_id, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return result

# 스크랩 버튼 클릭
@router.post("/posts/{post_id}/scrap")
def scrap_post(
    post_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user) # 🔐 로그인 필수
):
    result = crud.toggle_scrap(db, post_id=post_id, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return result