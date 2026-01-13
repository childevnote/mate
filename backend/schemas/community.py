from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class CategoryType(str, Enum):
    INFO = "INFO"         # 정보
    FREE = "FREE"         # 자유
    PROMO = "PROMO"       # 홍보
    QUESTION = "QUESTION" # 질문
    HUMOR = "HUMOR"       # 유머
    STUDY = "STUDY"       # 스터디
    MARKET = "MARKET"     # 장터

class PostBase(BaseModel):
    title: str
    content: str
    category: CategoryType
    image: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    title: str
    content: str
    category: str
    image: Optional[str] = None
    view_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    author_id: int
    author_nickname: str
    is_author: bool = False
    comment_count: int
    like_count: int
    scrap_count: int
    is_liked: bool = False
    is_scrapped: bool = False
    class Config:
        from_attributes = True



# 댓글 기본 틀
class CommentBase(BaseModel):
    content: str
    post_id: int
    parent_id: Optional[int] = None  # 대댓글일 경우 부모 댓글 ID

# 댓글 작성 요청 (Request)
class CommentCreate(CommentBase):
    pass

# 댓글 응답 (Response) 
class CommentResponse(CommentBase):
    id: int
    author_id: int
    created_at: datetime
    author_nickname: str
    author_university: str
    reply_count: int
    is_author: bool = False
    class Config:
        from_attributes = True