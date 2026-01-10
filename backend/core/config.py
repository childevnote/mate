import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Mate Backend"
    
    # 데이터베이스 설정
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    # JWT 보안 설정
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7)) # 7일
    
    # WebAuthn(패스키) 설정 (배포시 실제 도메인으로 변경 필수)
    RP_ID: str = os.getenv("RP_ID", "localhost")
    RP_NAME: str = "Mate Community"
    RP_ORIGIN: str = os.getenv("RP_ORIGIN", "http://localhost:3000")

settings = Settings()