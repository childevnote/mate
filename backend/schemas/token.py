from pydantic import BaseModel

# 로그인 요청 (클라이언트가 보낼 것)
class LoginRequest(BaseModel):
    email: str
    password: str

# 로그인 응답 (서버가 줄 것)
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"