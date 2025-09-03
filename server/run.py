#!/usr/bin/env python3
"""
Simple script to run the FastAPI server.
Usage: python run.py
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Starting Book Learning API...")
    print("📚 Make sure your .env file has GROQ_API_KEY set!")
    print("🌐 API will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔄 Use Ctrl+C to stop the server")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
