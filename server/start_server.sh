#!/bin/bash

# Script to start the FastAPI backend server with virtual environment

echo "🚀 Starting Book Learning API Server..."
echo "================================================"

# Activate virtual environment
source book_learning_env/bin/activate

# Check if .env file exists and has API key
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your GROQ_API_KEY"
    exit 1
fi

# Check if API key is set
if grep -q "your_groq_api_key_here" .env; then
    echo "⚠️  WARNING: Please update your GROQ_API_KEY in the .env file"
    echo "Current .env content:"
    cat .env
    echo ""
    echo "Get your API key from: https://console.groq.com/"
    echo "Then replace 'your_groq_api_key_here' with your actual key"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📚 Virtual environment activated"

# Get port from environment variable or default to 8080
PORT=${PORT:-8080}

echo "🌐 Starting server on http://localhost:${PORT}"
echo "📖 API docs will be available at http://localhost:${PORT}/docs"
echo "🔄 Use Ctrl+C to stop the server"
echo ""

# Start the server
python run.py
