import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.routes import router

app = FastAPI(title="AI CCTV Surveillance API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve absolute directory paths relative to this file
SERVICE_ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SERVICE_ROOT, "outputs")
UPLOAD_DIR = os.path.join(SERVICE_ROOT, "uploads")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def home():
    return {
        "status": "online",
        "service": "AI CCTV Surveillance API",
        "version": "2.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ai-surveillance-service",
        "version": "2.0.0"
    }


app.include_router(router)
app.mount("/videos", StaticFiles(directory=OUTPUT_DIR), name="videos")
