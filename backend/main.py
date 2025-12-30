from fastapi import FastAPI
from api.v1.endpoints import community

app = FastAPI()

app.include_router(community.router, prefix="/api/v1/community", tags=["Community"])

@app.get("/")
def health_check():
    return {"message": "FastAPI Server is Running"}