from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# [중간 테이블] 좋아요 (User <-> Post)
post_likes = Table(
    "post_likes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
)

# [중간 테이블] 스크랩 (User <-> Post)
post_scraps = Table(
    "post_scraps",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
)

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    
    # 카테고리 (FREE, INFO, GATHERING)
    category = Column(String, default="FREE", nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    
    # 조회수 & 이미지 경로
    view_count = Column(Integer, default=0)
    image = Column(String, nullable=True) # S3 URL이나 경로 저장
    
    # 시간
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 작성자 (FK)
    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts")

    # 댓글 관계
    comments = relationship("Comment", back_populates="post", cascade="all, delete")

    # 다대다 관계 설정 (secondary로 중간 테이블 지정)
    liked_by = relationship("User", secondary=post_likes, backref="liked_posts")
    scrapped_by = relationship("User", secondary=post_scraps, backref="scrapped_posts")

    @property
    def comment_count(self):
        return len(self.comments)
    
    @property
    def like_count(self):
        return len(self.liked_by)

    @property
    def scrap_count(self):
        return len(self.scrapped_by)

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
    post_id = Column(Integer, ForeignKey("posts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))

    # 대댓글 (Self Reference)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)

    # 관계 설정
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
    
    # 대댓글 구조 (부모 -> 자식들)
    parent = relationship("Comment", remote_side=[id], backref="replies")

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

    @property
    def reply_count(self):
        return len(self.replies)