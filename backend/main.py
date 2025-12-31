import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "lib"))

from fastapi import FastAPI
from mangum import Mangum

from fastapi import FastAPI
from api.v1.endpoints import community
from mangum import Mangum
from api.v1.endpoints import community, users

app = FastAPI()

app.include_router(community.router, prefix="/api/v1/community", tags=["Community"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])

@app.get("/")
def health_check():
    return {"message": "FastAPI Server is Running"}


handler = Mangum(app)
