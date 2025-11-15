#!/bin/bash

# Hotel Management System Startup Script

echo "🏨 Starting Hotel Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to start backend
start_backend() {
    echo "🚀 Starting backend server..."
    cd backend
    
    # Check if .env exists
    if [ ! -f .env ]; then
        echo "📝 Creating .env file from template..."
        cp env.example .env
        echo "⚠️  Please update the .env file with your configuration before running again."
        exit 1
    fi

    # Read backend port from .env (default 4000)
    BACKEND_PORT=$(grep -E '^PORT=' .env | head -n1 | cut -d'=' -f2)
    if [ -z "$BACKEND_PORT" ]; then BACKEND_PORT=4000; fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    # Seed database if needed
    echo "🌱 Seeding database..."
    npm run seed
    
    # Start backend server
    echo "🔧 Starting backend server on port $BACKEND_PORT..."
    npm run dev &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting frontend server..."
    cd ../frontend
    
    # Check if .env exists
    if [ ! -f .env ]; then
        echo "📝 Creating .env file from template..."
        cp env.example .env
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend server
    echo "🎨 Starting frontend server on port 5137..."
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
}

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start both servers
start_backend
sleep 3
start_frontend

echo "✅ Hotel Management System is running!"
echo "🌐 Frontend: http://localhost:5137"
echo "🔧 Backend API: http://localhost:${BACKEND_PORT:-4000}"
echo "📊 Default login: admin / admin123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
