from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models.community import Post
from schemas.community import PostResponse

router = APIRouter()

# GET /api/v1/community/posts
@router.get("/posts", response_model=List[PostResponse])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    게시글 목록 조회 API
    """
    # Django: Post.objects.all()[skip:skip+limit]
    posts = db.query(Post).offset(skip).limit(limit).all()
    return posts