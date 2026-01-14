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

# 내가 쓴 글 조회
@router.get("/posts/me", response_model=List[schemas.PostListResponse])
def read_my_posts(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return crud.get_my_posts(db, user_id=current_user.id, skip=skip, limit=limit)

# 내가 스크랩한 글 조회
@router.get("/posts/scrapped", response_model=List[schemas.PostListResponse])
def read_my_scraps(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return crud.get_my_scraps(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/posts", response_model=List[schemas.PostListResponse])
def read_posts(
    page: int = 1,
    limit: int = 10, 
    sort: str = "latest", 
    category: str = None, 
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(deps.get_current_user_optional)
):
    user_id = current_user.id if current_user else None

    skip = (page - 1) * limit

    if sort == "best":
        return crud.get_best_posts(db, skip=skip, limit=limit)
    
    return crud.get_posts(db, skip=skip, limit=limit, category=category, user_id=user_id)

# 게시글 상세 조회
@router.get("/posts/{post_id}", response_model=schemas.PostResponse)
def read_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(deps.get_current_user_optional) 
):
    user_id = current_user.id if current_user else None
    
    post = crud.get_post(db, post_id=post_id, user_id=user_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

# 게시글 삭제
@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    result = crud.delete_post(db, post_id=post_id, user_id=current_user.id)
    
    if result == "not_found":
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    elif result == "not_authorized":
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")
        
    return {"status": "success", "message": "게시글이 삭제되었습니다."}

# 댓글 작성
@router.post("/comments", response_model=schemas.CommentResponse)
def create_comment(
    comment: schemas.CommentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return crud.create_comment(db=db, comment=comment, user_id=current_user.id)

# 댓글 목록 조회 
@router.get("/comments", response_model=List[schemas.CommentResponse])
def read_comments(
    post: Optional[int] = None,
    author: Optional[int] = None,
    skip: int = 0, 
    limit: int = 50, 
    db: Session = Depends(get_db)
):
    if post:
        return crud.get_comments_by_post(db, post_id=post, skip=skip, limit=limit)
    elif author:
        return crud.get_comments_by_author(db, user_id=author, skip=skip, limit=limit)
    else:
        return []
    
# 댓글 삭제
@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    result = crud.delete_comment(db, comment_id=comment_id, user_id=current_user.id)
    
    if result == "not_found":
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")
    elif result == "not_authorized":
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")
        
    return {"status": "success", "message": "댓글이 삭제되었습니다."}
    
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