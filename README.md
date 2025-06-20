# Talk to a Folder 🗂️💬

An AI-powered web application that lets you connect your Google Drive, index folders, and have intelligent conversations with your documents using RAG (Retrieval-Augmented Generation).

## Features

- **Google Drive Integration**: Authenticate with Google and access your folders
- **Document Processing**: Automatically extract and index text from various file types
- **AI Chat Interface**: Ask questions about your documents using GPT-4.1
- **Conversation Memory**: Maintains context across multiple messages
- **Modern UI**: ChatGPT-style interface with smooth animations
- **Multiple File Support**: TXT, PDF, DOCX, Google Docs, and more

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, shadcn/ui
- **Backend**: FastAPI (Python), OpenAI API, Google Drive API
- **AI**: GPT-4.1, text-embedding-3-large (latest embedding model)
- **Architecture**: RAG pipeline with vector embeddings and cosine similarity

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Google Cloud Console account
- OpenAI API account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd talk-to-a-folder

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Drive API
   - Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen if prompted
6. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
7. Download the client configuration or copy the Client ID and Client Secret

### 3. OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key in your account settings
3. Ensure you have credits/billing set up

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4.1
MAX_TOKENS=1500
TEMPERATURE=0.7

# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 5. Frontend Google Configuration

Update `frontend/src/config/google.js` with your Google Client ID:

```javascript
const CLIENT_ID = 'your_google_client_id_here'
```

### 6. Run the Application

Start the backend server:
```bash
cd backend
python main.py
# Server will run on http://localhost:8000
```

In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

## Usage

1. **Authentication**: Click "Continue with Google" to authenticate
2. **Index a Folder**: Paste a Google Drive folder URL in the header input
3. **Chat**: Once indexed, ask questions about your documents
4. **New Conversations**: Use the sidebar to start new chats or revisit previous ones

## Supported File Types

- Plain text files (.txt)
- Google Docs
- PDF files (basic support)
- Microsoft Word (.docx)
- CSV files
- HTML files
- RTF files

## Project Structure

```
talk-to-a-folder/
├── backend/
│   ├── main.py              # FastAPI server with all endpoints
│   ├── .env                 # Environment variables (create from .env.example)
│   ├── .env.example         # Environment template
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── config/          # Google API configuration
│   │   ├── lib/             # Utility functions
│   │   ├── App.jsx          # Main React component
│   │   └── index.css        # Global styles
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── .gitignore
└── README.md
```

## API Endpoints

- `POST /auth/google` - Authenticate with Google
- `POST /index` - Index a Google Drive folder
- `GET /index/{job_id}` - Check indexing status
- `POST /chat` - Send chat message
- `GET /chat/{job_id}/history` - Get conversation history
- `DELETE /chat/{job_id}/history` - Clear conversation history

## Development Notes

### RAG Pipeline
The application uses a sophisticated RAG (Retrieval-Augmented Generation) pipeline:
1. Documents are chunked into smaller pieces with overlap
2. Each chunk gets converted to embeddings using OpenAI's latest embedding model
3. User queries are embedded and matched against document chunks using cosine similarity
4. Relevant chunks are provided as context to GPT-4.1 for generating responses

### Conversation Memory
The system maintains conversation history (last 10 exchanges) to provide contextual responses that reference previous messages.

### Security Considerations
- OAuth tokens are validated on each API call
- Environment variables store sensitive credentials
- CORS is configured for local development
- File access is limited to user's authenticated Google Drive

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Verify Google Client ID and Secret are correct
   - Check that OAuth consent screen is configured
   - Ensure redirect URIs match exactly

2. **"Could not access folder"**
   - Make sure the folder is shared with your authenticated account
   - Check that the Google Drive API is enabled
   - Verify the folder URL format is correct

3. **OpenAI API errors**
   - Confirm API key is valid and has credits
   - Check that you have access to GPT-4.1 model
   - Verify API key permissions

4. **Module import errors**
   - Ensure all dependencies are installed
   - Check Python version compatibility
   - Verify virtual environment is activated

### Development Tips

- Use `console.log` statements for frontend debugging
- Check browser network tab for API call details
- Backend logs print to terminal for debugging
- Use `git status` to see what files have been modified

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and personal use.

## Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.