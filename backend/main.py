import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "lib"))

from fastapi import FastAPI
from mangum import Mangum
from api.v1.endpoints import community, users, login

app = FastAPI()

app.include_router(community.router, prefix="/api/v1/community", tags=["Community"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(login.router, prefix="/api/v1/auth", tags=["auth"])
@app.get("/")
def health_check():
    return {"message": "FastAPI Server is Running"}


handler = Mangum(app)
