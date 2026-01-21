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

class PostListResponse(BaseModel):
    id: int
    category: str
    title: str
    
    # 작성자 정보
    author_id: int
    author_nickname: str
    author_university: Optional[str] = None
    
    # 조회수와 시간
    view_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# 상세용 응답 (무거운 버전)
class PostResponse(PostListResponse):
    is_author: bool = False      # 본인 글 여부
    content: str
    image: Optional[str] = None  # 이미지
    
    comment_count: int           # 댓글 수
    like_count: int              # 좋아요 수
    scrap_count: int             # 스크랩 수
    
    is_liked: bool = False       # 좋아요 여부
    is_scrapped: bool = False    # 스크랩 여부


# 댓글 기본 틀
class CommentBase(BaseModel):
    content: str
    post_id: int
    parent_id: Optional[int] = None  # 대댓글일 경우 부모 댓글 ID

# 댓글 작성 요청 (Request)
class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None
    post_id: int

# 댓글 응답 (Response) 
class CommentResponse(CommentBase):
    id: int
    author_id: int
    created_at: datetime
    author_nickname: str
    author_university: Optional[str] = None
    reply_count: int
    is_author: bool = False
    post_title: Optional[str] = None
    post_id: Optional[int] = None
    is_deleted: bool

    class Config:
        from_attributes = True