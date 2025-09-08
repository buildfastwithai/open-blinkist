#!/usr/bin/env python3
"""
Production startup script for Digital Ocean App Platform
This ensures the app starts with the correct port configuration
"""

import os
import uvicorn
from main import app

if __name__ == "__main__":
    # Get port from environment variable (DO App Platform sets this)
    port = int(os.getenv("PORT", 8080))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting OpenBlinkist API in production mode...")
    print(f"🌐 Binding to {host}:{port}")
    print(f"📚 GROQ_API_KEY configured: {bool(os.getenv('GROQ_API_KEY'))}")
    
    # Production settings
    uvicorn.run(
        app, 
        host=host, 
        port=port, 
        reload=False,  # Disable auto-reload in production
        log_level="info",
        access_log=True
    )
