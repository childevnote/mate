from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

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
    return crud.create_post(db=db, post=post, user_id=current_user.id)

@router.get("/posts", response_model=List[schemas.PostResponse])
def read_posts(
    page: int = 1,
    limit: int = 10, 
    sort: str = "latest", 
    category: str = None, 
    search: str = None,
    db: Session = Depends(get_db)
):
    # 페이지 번호를 건너뛸 개수(skip)로 변환
    skip = (page - 1) * limit

    if sort == "best":
        return crud.get_best_posts(db, skip=skip, limit=limit)
    return crud.get_posts(db, skip=skip, limit=limit, category=category)

# 게시글 상세 조회
@router.get("/posts/{post_id}", response_model=schemas.PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db)):
    post = crud.get_post(db, post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return post

# 댓글 작성
@router.post("/comments", response_model=schemas.CommentResponse)
def create_comment(
    comment: schemas.CommentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return crud.create_comment(db=db, comment=comment, user_id=current_user.id)

# 댓글 목록 조회 (405 에러 해결)
@router.get("/comments", response_model=List[schemas.CommentResponse])
def read_comments(
    post: int,    # 프론트엔드가 보내는 쿼리 파라미터 이름 (?post=9)
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    # crud 함수 호출 시 post_id 인자에 post 값을 전달
    return crud.get_comments_by_post(db, post_id=post, skip=skip, limit=limit)

# 좋아요 버튼 클릭
@router.post("/posts/{post_id}/like")
def like_post(
    post_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
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
    current_user: User = Depends(deps.get_current_user)
):
    result = crud.toggle_scrap(db, post_id=post_id, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return result