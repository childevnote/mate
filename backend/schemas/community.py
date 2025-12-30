from pydantic import BaseModel
from datetime import datetime

class PostBase(BaseModel):
    title: str
    content: str

class PostResponse(PostBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 
