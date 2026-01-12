from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class PostLike(Base):
    __tablename__ = "post_likes"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    
    # 관계 설정 (역참조)
    post = relationship("Post", back_populates="likes")
    user = relationship("models.user.User", back_populates="liked_posts")

class PostScrap(Base):
    __tablename__ = "post_scraps"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    
    # 관계 설정
    post = relationship("Post", back_populates="scraps")
    user = relationship("models.user.User", back_populates="scrapped_posts")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    
    # 카테고리 (FREE, INFO, GATHERING)
    category = Column(String, default="FREE", nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    
    # 조회수 & 이미지 경로
    view_count = Column(Integer, default=0)
    image = Column(String, nullable=True) 

    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    scrap_count = Column(Integer, default=0)
    
    # 시간
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 작성자 (FK)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    author = relationship("User", back_populates="posts")


    # 댓글
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

    # 좋아요/스크랩
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
    scraps = relationship("PostScrap", back_populates="post", cascade="all, delete-orphan")


    @property
    def author_nickname(self):
        if self.author:
            return getattr(self.author, "nickname", self.author.email.split("@")[0])
        return "알수없음"

    @property
    def author_university(self):
        if self.author and hasattr(self.author, "university") and self.author.university:
            return self.author.university.name
        return "소속없음"


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # FK (글, 작성자)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"))
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    # 대댓글 (Self Reference)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)

    # 관계 설정
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
    
    # 대댓글 구조 (부모 -> 자식들)
    parent = relationship("Comment", remote_side=[id], backref="replies")
    
    @property
    def reply_count(self):
        return len(self.replies)

    @property
    def author_nickname(self):
        if self.author:
            return getattr(self.author, "nickname", self.author.email.split("@")[0])
        return "알수없음"

    @property
    def author_university(self):
        if self.author and hasattr(self.author, "university") and self.author.university:
            return self.author.university.name
        return "소속없음"