#!/bin/bash

echo "🚀 Starting Talk-to-a-Folder Backend..."

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found"
    echo "📝 Please copy backend/.env.example to backend/.env and add your API keys"
    echo "   cp backend/.env.example backend/.env"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if Python requirements are installed
echo "🔍 Checking Python dependencies..."
if ! python -c "import fastapi, openai, google.oauth2" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start the FastAPI server
echo "🎯 Starting FastAPI server on http://localhost:8000"
python main.py