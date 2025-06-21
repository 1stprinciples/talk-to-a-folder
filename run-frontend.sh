#!/bin/bash

echo "🚀 Starting Talk-to-a-Folder Frontend..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Check if Google Client ID is configured
if grep -q "your_google_client_id_here" src/config/google.js 2>/dev/null; then
    echo "⚠️  Warning: Google Client ID not configured in src/config/google.js"
    echo "   Please update the CLIENT_ID in frontend/src/config/google.js"
fi

# Start the Vite development server
echo "🎯 Starting Vite dev server on http://localhost:5173"
npm run dev