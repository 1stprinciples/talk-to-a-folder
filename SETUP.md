# Quick Setup Guide 🚀

This guide will get you up and running with Talk-to-a-Folder in just a few minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.8+ installed
- [ ] OpenAI API account with credits
- [ ] Google Cloud Console access
- [ ] Tesseract OCR installed (for PDF OCR support)

## Step-by-Step Setup

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd talk-to-a-folder
```

### 2. Backend Setup
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Install Tesseract OCR (for PDF processing)
# macOS: brew install tesseract
# Ubuntu: sudo apt-get install tesseract-ocr
# Windows: Download from GitHub releases
```

### 3. Frontend Setup
```bash
# Install Node.js dependencies
cd ../frontend
npm install
cd ..
```

### 4. Get API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy the key (starts with `sk-`)

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable APIs (Google Drive API, OAuth2 API)
3. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized origins: `http://localhost:5173`
   - Authorized redirects: `http://localhost:5173`
4. Copy Client ID and Client Secret

### 5. Configure Environment

Edit `backend/.env`:
```env
OPENAI_API_KEY=sk-your-actual-openai-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MODEL_NAME=gpt-4.1
```

Edit `frontend/src/config/google.js`:
```javascript
const CLIENT_ID = 'your-google-client-id-here'
```

### 6. Run the Application

**Option A: Manual (two terminals)**
```bash
# Terminal 1 - Backend
./run-backend.sh

# Terminal 2 - Frontend  
./run-frontend.sh
```

**Option B: Background processes**
```bash
# Start backend in background
./run-backend.sh &

# Start frontend
./run-frontend.sh
```

### 7. Open and Test

1. Open http://localhost:5173
2. Click "Continue with Google"
3. Paste a Google Drive folder URL
4. Start chatting with your documents!

## Troubleshooting

### "Authentication failed"
- Check Google Client ID/Secret are correct
- Verify OAuth consent screen is set up
- Ensure redirect URIs match exactly

### "OpenAI API error"
- Verify API key is valid and has credits
- Check you have access to GPT-4.1

### "Could not access folder"
- Ensure folder is accessible to your Google account
- Try a publicly shared folder first
- Check Google Drive API is enabled

### "Module not found" errors
- Run `pip install -r requirements.txt` in backend/
- Run `npm install` in frontend/
- Check Python/Node versions

### "OCR extraction failed"
- Install Tesseract: `brew install tesseract` (macOS)
- Ubuntu: `sudo apt-get install tesseract-ocr`
- Verify: `tesseract --version`

## Next Steps

- Test with different file types (TXT, DOCX, PDFs with OCR, HTML)
- Try uploading scanned PDFs to test OCR functionality
- Ask complex questions about your documents
- Use the sidebar to manage multiple conversations
- Explore the conversation memory feature

## Need Help?

Check the main README.md for detailed documentation, or create an issue in the repository.