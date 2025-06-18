from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from datetime import datetime

app = FastAPI(title="Talk to a Folder API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary in-memory storage for MVP
sessions = {}
folder_data = {}

class AuthRequest(BaseModel):
    code: str

class IndexRequest(BaseModel):
    session_id: str
    folder_url: str

class ChatRequest(BaseModel):
    session_id: str
    message: str

class AuthResponse(BaseModel):
    session_id: str

class IndexResponse(BaseModel):
    job_id: str
    status: str

class ChatResponse(BaseModel):
    answer: str
    citations: List[Dict] = []

@app.get("/")
async def root():
    return {"message": "Talk to a Folder API is running"}

@app.post("/auth/google", response_model=AuthResponse)
async def auth_google(request: AuthRequest):
    # For MVP, just create a mock session
    session_id = f"session_{len(sessions) + 1}_{int(datetime.now().timestamp())}"
    sessions[session_id] = {
        "created_at": datetime.now().isoformat(),
        "auth_code": request.code,
        "authenticated": True
    }
    return AuthResponse(session_id=session_id)

@app.post("/index", response_model=IndexResponse)
async def index_folder(request: IndexRequest):
    if request.session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # For MVP, just simulate folder processing
    job_id = f"job_{len(folder_data) + 1}"
    folder_data[job_id] = {
        "folder_url": request.folder_url,
        "status": "completed",  # Simulate immediate completion for MVP
        "files": [
            {"name": "document1.txt", "id": "1", "type": "text/plain"},
            {"name": "report.pdf", "id": "2", "type": "application/pdf"},
            {"name": "presentation.pptx", "id": "3", "type": "application/vnd.ms-powerpoint"}
        ]
    }
    
    return IndexResponse(job_id=job_id, status="completed")

@app.get("/index/{job_id}")
async def get_index_status(job_id: str):
    if job_id not in folder_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "job_id": job_id,
        "status": folder_data[job_id]["status"],
        "files_count": len(folder_data[job_id]["files"])
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if request.session_id not in sessions:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Mock RAG responses for MVP
    mock_responses = {
        "hello": "Hello! I can help you with questions about your Google Drive folder.",
        "what files": "I found 3 files in your folder: document1.txt, report.pdf, and presentation.pptx.",
        "summary": "Based on the files in your folder, this appears to be a project folder with documentation and presentations.",
        "default": f"I understand you're asking: '{request.message}'. In the full version, I'll search through your files to provide a detailed answer with citations."
    }
    
    # Simple keyword matching for MVP
    message_lower = request.message.lower()
    if "hello" in message_lower or "hi" in message_lower:
        response = mock_responses["hello"]
    elif "files" in message_lower or "what" in message_lower:
        response = mock_responses["what files"]
    elif "summary" in message_lower:
        response = mock_responses["summary"]
    else:
        response = mock_responses["default"]
    
    return ChatResponse(
        answer=response,
        citations=[{"file_name": "document1.txt", "file_id": "1"}]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)