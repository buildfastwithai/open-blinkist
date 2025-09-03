# Book Learning API Server

A FastAPI-based server that provides a Blinkist-like API for extracting book insights and converting them into Socratic dialogues.

## Features

- 📚 Extract key insights from books tailored to specific roles/professions
- 💬 Convert book summaries into engaging Socratic dialogues
- 🚀 Built with FastAPI for high performance
- 🔄 Uses Groq API for AI-powered content generation
- 📖 Structured responses using Pydantic models

## Prerequisites

- Python 3.9 or higher
- GROQ API key

## Setup

### 1. Create Virtual Environment

```bash
cd server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Create a `.env` file in the server directory:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

## Running the Application

### Development Mode (Uvicorn)

```bash
# Activate virtual environment
source venv/bin/activate

# Run with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode (Gunicorn)

```bash
# Activate virtual environment
source venv/bin/activate

# Run with Gunicorn (4 workers)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Background/Daemon Mode

```bash
# Run as daemon
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --daemon --pid gunicorn.pid

# Stop daemon
kill $(cat gunicorn.pid)
```

## API Endpoints

### Health Check

- `GET /` - Basic health check
- `GET /health` - Detailed health check with Groq configuration status

### Book Processing

- `POST /summarize_book` - Generate structured book summary
- `POST /convert_to_conversation` - Convert summary to Socratic dialogue
- `POST /full_book_experience` - Complete pipeline (summary + conversation)

### Interactive Documentation

- `GET /docs` - Swagger UI documentation
- `GET /redoc` - ReDoc documentation

## API Usage Examples

### Summarize a Book

```bash
curl -X POST "http://localhost:8000/summarize_book" \
  -H "Content-Type: application/json" \
  -d '{
    "book_name": "Atomic Habits",
    "role": "software engineer",
    "num_insights": 5
  }'
```

### Full Book Experience

```bash
curl -X POST "http://localhost:8000/full_book_experience" \
  -H "Content-Type: application/json" \
  -d '{
    "book_name": "The Lean Startup",
    "role": "entrepreneur",
    "num_insights": 4
  }'
```

## Request/Response Models

### BookRequest

```json
{
  "book_name": "string",
  "role": "string (default: professional)",
  "num_insights": "integer (3-7, default: 5)"
}
```

### BookSummary Response

```json
{
  "book_name": "string",
  "author": "string",
  "role": "string",
  "key_insights": [
    {
      "heading": "string",
      "bullet_points": ["string"],
      "application": "string"
    }
  ],
  "key_theme": "string"
}
```

## Configuration

### Gunicorn Configuration Options

- **Workers**: `-w 4` (adjust based on CPU cores)
- **Worker Class**: `-k uvicorn.workers.UvicornWorker` (required for FastAPI)
- **Binding**: `--bind 0.0.0.0:8000`
- **Daemon Mode**: `--daemon` for background execution
- **PID File**: `--pid gunicorn.pid` for process management

### CORS Configuration

The API is configured to accept requests from:

- `http://localhost:3000` (Next.js development)
- `http://127.0.0.1:3000`

## Troubleshooting

### Common Issues

1. **GROQ_API_KEY not found**

   - Ensure `.env` file exists with valid API key
   - Check environment variable is properly loaded

2. **Port already in use**

   - Kill existing processes: `pkill -f "gunicorn main:app"`
   - Or use different port: `--bind 0.0.0.0:8001`

3. **Module import errors**
   - Ensure virtual environment is activated
   - Verify all dependencies installed: `pip install -r requirements.txt`

### Logs and Debugging

```bash
# Run with verbose logging
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --log-level debug

# Check running processes
ps aux | grep gunicorn

# Monitor logs in real-time
tail -f access.log
```

## Project Structure

```
server/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── .env               # Environment variables (create this)
├── venv/              # Virtual environment (created by setup)
└── __pycache__/       # Python cache files
```

## Development

### Adding New Dependencies

```bash
# Activate environment
source venv/bin/activate

# Install package
pip install package_name

# Update requirements
pip freeze > requirements.txt
```

### Code Style

The project follows Python best practices:

- Type hints with Pydantic models
- Structured error handling
- Clear separation of concerns
- Comprehensive documentation

## License

This project is part of the Open Blinkist application.
