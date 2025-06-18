from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from datetime import datetime
from dotenv import load_dotenv
import openai
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import asyncio

# Load environment variables
load_dotenv()

app = FastAPI(title="Talk to a Folder API")

# OpenAI Configuration
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "1500"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

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
document_store = {}  # Store document chunks and embeddings
embeddings_cache = {}  # Cache for document embeddings

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

# Helper functions for AI integration
async def get_embedding(text: str) -> List[float]:
    """Get OpenAI embedding for text"""
    try:
        import openai
        response = openai.Embedding.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response['data'][0]['embedding']
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return []

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk.strip())
    
    return chunks

async def find_relevant_chunks(query: str, job_id: str, top_k: int = 3) -> List[Dict]:
    """Find most relevant document chunks for a query"""
    if job_id not in document_store:
        return []
    
    # Get query embedding
    query_embedding = await get_embedding(query)
    if not query_embedding:
        return []
    
    # Calculate similarities
    chunks_data = document_store[job_id]
    similarities = []
    
    for chunk_data in chunks_data:
        if chunk_data.get("embedding"):
            similarity = cosine_similarity(
                [query_embedding], 
                [chunk_data["embedding"]]
            )[0][0]
            similarities.append((similarity, chunk_data))
    
    # Sort by similarity and return top_k
    similarities.sort(key=lambda x: x[0], reverse=True)
    return [data for _, data in similarities[:top_k]]

async def generate_answer(query: str, context_chunks: List[Dict]) -> str:
    """Generate answer using OpenAI with context"""
    try:
        # Prepare context
        context = "\n\n".join([
            f"From {chunk['file_name']}: {chunk['text']}" 
            for chunk in context_chunks
        ])
        
        # Create prompt
        prompt = f"""You are a helpful assistant that answers questions about documents in a Google Drive folder.

Context from the documents:
{context}

Question: {query}

Please provide a clear, accurate answer based on the context provided. If the context doesn't contain enough information to answer the question, say so honestly."""

        response = openai.ChatCompletion.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a helpful assistant for document Q&A."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE
        )
        
        return response['choices'][0]['message']['content']
        
    except Exception as e:
        print(f"Error generating answer: {e}")
        return f"I apologize, but I encountered an error while processing your question: {str(e)}"

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
    
    job_id = f"job_{len(folder_data) + 1}"
    
    # For MVP Version 2: Create mock documents with actual content
    mock_documents = [
        {
            "name": "project_overview.txt",
            "id": "1",
            "type": "text/plain",
            "content": """Project Overview: Talk to a Folder

This project is a web application that allows users to authenticate with Google Drive and chat with their folder contents using AI. The system uses React for the frontend, FastAPI for the backend, and OpenAI for intelligent responses.

Key features include:
- Google OAuth authentication
- Document indexing and embedding
- AI-powered question answering
- Real-time chat interface

The project is built in MVP phases, starting with basic functionality and gradually adding more sophisticated features like real Google Drive integration and advanced RAG capabilities."""
        },
        {
            "name": "technical_specs.txt", 
            "id": "2",
            "type": "text/plain",
            "content": """Technical Specifications

Frontend:
- React with Vite
- Axios for API calls
- Responsive CSS design
- Local storage for session management

Backend:
- FastAPI with Python
- OpenAI API integration
- In-memory storage for MVP
- CORS enabled for frontend communication

AI/ML:
- OpenAI GPT-4o-mini for text generation
- text-embedding-3-small for document embeddings
- Cosine similarity for document retrieval
- RAG (Retrieval Augmented Generation) pipeline

Deployment:
- Local development setup
- Environment variable configuration
- Docker support planned for production"""
        },
        {
            "name": "user_guide.txt",
            "id": "3", 
            "type": "text/plain",
            "content": """User Guide

Getting Started:
1. Click 'Sign in with Google' to authenticate
2. Paste a Google Drive folder URL
3. Click 'Index Folder' to process documents
4. Start asking questions about your files

Example Questions:
- "What is this project about?"
- "What technologies are used?"
- "How do I set up the development environment?"
- "What are the key features?"

Tips:
- Be specific in your questions for better results
- Ask about content, summaries, or technical details
- The AI can reference multiple documents in its answers

Troubleshooting:
- If you get generic responses, make sure your OpenAI API key is set
- Refresh the page if authentication seems stuck
- Check browser console for any error messages"""
        }
    ]
    
    # Process documents and create embeddings
    document_chunks = []
    
    try:
        for doc in mock_documents:
            content = doc["content"]
            chunks = chunk_text(content)
            
            for i, chunk in enumerate(chunks):
                # Get embedding for each chunk
                embedding = await get_embedding(chunk)
                
                chunk_data = {
                    "file_name": doc["name"],
                    "file_id": doc["id"],
                    "chunk_id": f"{doc['id']}_chunk_{i}",
                    "text": chunk,
                    "embedding": embedding
                }
                document_chunks.append(chunk_data)
        
        # Store processed documents
        document_store[job_id] = document_chunks
        
        folder_data[job_id] = {
            "folder_url": request.folder_url,
            "status": "completed",
            "files": [{"name": doc["name"], "id": doc["id"], "type": doc["type"]} for doc in mock_documents],
            "chunks_count": len(document_chunks)
        }
        
        return IndexResponse(job_id=job_id, status="completed")
        
    except Exception as e:
        print(f"Error processing documents: {e}")
        # Fallback to basic storage without embeddings
        folder_data[job_id] = {
            "folder_url": request.folder_url,
            "status": "failed",
            "error": str(e),
            "files": []
        }
        return IndexResponse(job_id=job_id, status="failed")

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
    
    # Check if we have any indexed folders for this session
    user_job_ids = [job_id for job_id, data in folder_data.items() 
                    if data.get("status") == "completed"]
    
    if not user_job_ids:
        return ChatResponse(
            answer="Please index a folder first by pasting a Google Drive URL and clicking 'Index Folder'.",
            citations=[]
        )
    
    # Use the most recent job for now (in a full app, you'd track per-session)
    current_job_id = user_job_ids[-1]
    
    try:
        # Use RAG pipeline for intelligent responses
        relevant_chunks = await find_relevant_chunks(request.message, current_job_id)
        
        if not relevant_chunks:
            # Fallback if no relevant chunks found
            answer = "I couldn't find relevant information in your indexed documents to answer that question. Try asking about the project overview, technical specifications, or user guide."
        else:
            # Generate AI response with context
            answer = await generate_answer(request.message, relevant_chunks)
        
        # Create citations from relevant chunks
        citations = []
        seen_files = set()
        for chunk in relevant_chunks:
            file_name = chunk["file_name"]
            if file_name not in seen_files:
                citations.append({
                    "file_name": file_name,
                    "file_id": chunk["file_id"],
                    "chunk_id": chunk["chunk_id"]
                })
                seen_files.add(file_name)
        
        return ChatResponse(answer=answer, citations=citations)
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return ChatResponse(
            answer=f"I apologize, but I encountered an error while processing your question. Please make sure your OpenAI API key is properly configured. Error: {str(e)}",
            citations=[]
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)