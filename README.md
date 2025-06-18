# Talk to a Folder

Connect to Google Drive and chat with your folders using AI.

## MVP Version 1 - Current Features

✅ **Basic React UI** - Clean, responsive interface  
✅ **Mock Google OAuth** - Simulated authentication flow  
✅ **Folder URL Input** - Paste Google Drive folder links  
✅ **Chat Interface** - Real-time messaging with the AI  
✅ **Mock RAG Responses** - Simulated AI responses for testing  
✅ **FastAPI Backend** - RESTful API with CORS support  

## Quick Start

1. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Run Both Services**
   ```bash
   ./run_dev.sh
   ```

4. **Open in Browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## How to Test

1. Click "Sign in with Google" (mock authentication)
2. Paste any Google Drive folder URL
3. Click "Index Folder" 
4. Start chatting with mock responses:
   - Try: "hello", "what files", "summary"
   - Any other question gets a generic response

## Next Steps (MVP Version 2)

- Real Google OAuth integration
- Actual Google Drive API calls
- Text extraction from documents
- OpenAI embeddings and real RAG
- File citations and links

## Architecture

- **Frontend**: React + Vite + Axios
- **Backend**: FastAPI + Uvicorn
- **Storage**: In-memory (for MVP)
- **AI**: Mock responses → OpenAI GPT-4 (next version)