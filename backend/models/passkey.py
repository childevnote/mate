
from sqlalchemy import Column, String, Integer, ForeignKey, LargeBinary, BigInteger
from sqlalchemy.orm import relationship
from database import Base

class Passkey(Base):
    __tablename__ = "passkeys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # WebAuthn 필수 정보
    # credential_id: 기기를 식별하는 고유 ID (긴 문자열)
    credential_id = Column(String, unique=True, index=True, nullable=False)
    
    # public_key: 서버에 저장되는 공개키 (검증용, 바이너리 데이터)
    public_key = Column(LargeBinary, nullable=False)
    
    # sign_count: 해킹 방지용 카운터 (몇 번 로그인했는지)
    sign_count = Column(BigInteger, default=0)
    
    # 어떤 기기인지 (예: "Kevin's MacBook")
    device_name = Column(String, nullable=True)

    user = relationship("User", back_populates="passkeys")

    
class PasskeyChallenge(Base):
    """
    서버리스 환경을 위해 Challenge를 잠시 저장하는 테이블
    """
    __tablename__ = "passkey_challenges"

    # username이나 user_id를 키로 사용 (여기서는 username 사용)
    username = Column(String, primary_key=True, index=True) 
    challenge = Column(String, nullable=False) # base64로 인코딩된 챌린지
    created_at = Column(BigInteger, nullable=False) # 생성 시간 (타임스탬프)