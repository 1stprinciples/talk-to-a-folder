# Talk to a Folder

Connect to Google Drive and chat with your folders using AI.

## MVP Version 2 - Current Features (🔥 NOW WITH REAL AI!)

✅ **React UI** - Clean, responsive interface  
✅ **Mock Google OAuth** - Simulated authentication flow  
✅ **Real OpenAI Integration** - GPT-4o-mini for intelligent responses  
✅ **Document Processing** - Text chunking and embedding generation  
✅ **RAG Pipeline** - Retrieval-Augmented Generation with real context  
✅ **Vector Search** - Cosine similarity for finding relevant content  
✅ **Smart Citations** - Links back to source documents  
✅ **Error Handling** - Graceful fallbacks and informative messages  

## Quick Start

1. **Set up OpenAI API Key**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your OpenAI API key:
   # OPENAI_API_KEY=your_actual_api_key_here
   ```

2. **Install Backend Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run Both Services**
   ```bash
   cd ..
   ./run_dev.sh
   ```

5. **Open in Browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## How to Test Real AI

1. **Add your OpenAI API key** to `backend/.env`
2. Click "Sign in with Google" (mock authentication)
3. Paste any Google Drive folder URL and click "Index Folder"
4. Ask intelligent questions:
   - "What is this project about?"
   - "What technologies are used in the backend?"
   - "How do I set up the development environment?"
   - "What are the key features mentioned?"
   - "Explain the RAG pipeline"

The AI will now give real, contextual answers based on the mock documents!

## What's New in Version 2

🔥 **Real AI**: OpenAI GPT-4o-mini integration  
🔥 **Document Processing**: Text chunking with embeddings  
🔥 **Vector Search**: Semantic similarity matching  
🔥 **Smart Context**: RAG pipeline with relevant content retrieval  
🔥 **Citations**: See which documents informed the answer  

## Next Steps (MVP Version 3)

- Real Google OAuth integration
- Actual Google Drive API calls
- Support for PDF, DOCX, and more file types
- Streaming responses
- Better citation links
- Progress tracking for indexing

## Architecture

- **Frontend**: React + Vite + Axios
- **Backend**: FastAPI + Uvicorn + OpenAI
- **AI**: OpenAI GPT-4o-mini + text-embedding-3-small
- **Vector Search**: Scikit-learn cosine similarity
- **Storage**: In-memory (documents + embeddings)
- **Processing**: Text chunking with overlap

## Environment Variables

```bash
# backend/.env
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4o-mini
MAX_TOKENS=1500
TEMPERATURE=0.7
```