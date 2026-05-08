from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # 수신자
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # 알림 유형: "comment" | "like" | "system"
    type = Column(String, nullable=False)

    # 알림 제목 & 본문
    title = Column(String, nullable=False)
    body = Column(String, nullable=False)

    # 연관 컨텐츠
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)

    # 읽음 여부
    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    post = relationship("Post")
