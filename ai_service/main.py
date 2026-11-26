from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.routes import router
import os

app = FastAPI(title="AI CCTV Surveillance API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("outputs", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

@app.get("/")
def home():
    return {
        "status": "online",
        "service": "AI CCTV Surveillance API",
        "version": "2.0.0"
    }

app.include_router(router)
app.mount("/videos", StaticFiles(directory="outputs"), name="videos")
