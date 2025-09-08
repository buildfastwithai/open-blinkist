#!/usr/bin/env python3
"""
Simple script to run the FastAPI server.
Usage: python run.py
"""

import os
import uvicorn
from main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    
    print("🚀 Starting Book Learning API...")
    print("📚 Make sure your .env file has GROQ_API_KEY set!")
    print(f"🌐 API will be available at: http://localhost:{port}")
    print(f"📖 API Documentation: http://localhost:{port}/docs")
    print("🔄 Use Ctrl+C to stop the server")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port, 
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
