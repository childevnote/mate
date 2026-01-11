import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "lib"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from api.v1.endpoints import community, users, login, passkey, auth

app = FastAPI(root_path="/default")

origins = [
    "http://localhost:3000",                      
    "https://main.d3tpdfp23uq4rz.amplifyapp.com", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,    
    allow_credentials=True,   
    allow_methods=["*"],      
    allow_headers=["*"],      
)

app.include_router(community.router, prefix="/api/v1/community", tags=["Community"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(login.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(passkey.router, prefix="/api/v1/auth/passkey", tags=["Passkey"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Email Auth"])

@app.get("/")
def health_check():
    return {"message": "FastAPI Server is Running"}

mangum_handler = Mangum(app)

def handler(event, context):
    # AWS EventBridge(CloudWatch Events)가 보내는 신호인지 확인
    if event.get("source") == "aws.events" and event.get("detail-type") == "Scheduled Event":
        print("Warmer ping received. Skipping application logic.")
        return {"statusCode": 200, "body": "pong"}

    # 그게 아니라면(진짜 유저의 HTTP 요청), FastAPI(Mangum)에게 넘긴다.
    return mangum_handler(event, context)