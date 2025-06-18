#!/bin/bash

# Kill existing processes
pkill -f "uvicorn main:app"
pkill -f "npm run dev"

echo "Starting Talk-to-a-Folder MVP..."

# Start backend
echo "Starting FastAPI backend..."
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting React frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Backend running at http://localhost:8000"
echo "✅ Frontend running at http://localhost:5173"
echo ""
echo "To stop both services, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup INT

# Wait for processes
wait