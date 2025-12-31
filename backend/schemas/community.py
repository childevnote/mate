from pydantic import BaseModel, Field, computed_field
from datetime import datetime
from typing import Optional, List

class PostBase(BaseModel):
    title: str
    content: str
    category: str = "FREE"
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
    comment_count: int
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

    class Config:
        from_attributes = True