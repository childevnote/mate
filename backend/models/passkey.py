
from sqlalchemy import Column, String, Integer, ForeignKey, BigInteger, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Passkey(Base):
    __tablename__ = "passkeys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    credential_id = Column(String, unique=True, index=True, nullable=False)
    public_key = Column(String, nullable=False)
    sign_count = Column(BigInteger, default=0)
    device_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="passkeys")

    
class PasskeyChallenge(Base):
    __tablename__ = "passkey_challenges"

    username = Column(String, primary_key=True, index=True) 
    challenge = Column(String, nullable=False)
    created_at = Column(BigInteger, nullable=False)