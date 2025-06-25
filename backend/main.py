from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- CORS Middleware Configuration ---
# This allows the React frontend (running on http://localhost:3000)
# to communicate with this backend.
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Video Forensics Search API"}

# Placeholder for future API endpoints
# e.g., @app.post("/upload_video/")
# e.g., @app.get("/search/")
