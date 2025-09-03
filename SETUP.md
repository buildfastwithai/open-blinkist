# 📚 Book Learnings App - Complete Setup Guide

A Blinkist-like application that extracts key insights from books and converts them into engaging conversations using AI.

## 🏗️ Architecture

- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Backend**: FastAPI with Python
- **AI**: Groq API for book summarization and conversation generation
- **Audio**: Web Speech API for text-to-speech

## 🚀 Quick Start

### 1. Backend Setup (FastAPI)

```bash
# Navigate to server directory
cd server

# Install Python dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Start the backend server
python run.py
```

The API will be available at:

- **Server**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### 2. Frontend Setup (Next.js)

```bash
# Navigate to project root (if in server directory)
cd ..

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at:

- **App**: http://localhost:3000

## 🔑 Environment Variables

### Backend (.env in `/server` directory)

```
GROQ_API_KEY=your_groq_api_key_here
```

**Get your Groq API key:**

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Create an API key
4. Copy it to your `.env` file

## 📖 How to Use

1. **Open the app** at http://localhost:3000
2. **Enter a book title** (e.g., "Atomic Habits", "Deep Work", "The Lean Startup")
3. **Select your role** (Startup Founder, Software Engineer, etc.)
4. **Choose number of insights** (3-7)
5. **Click "Generate Book Insights"**
6. **View the structured summary** with key insights
7. **Switch to conversation view** for a Socratic dialogue
8. **Play audio** to listen to the conversation

## 🎯 Features

### ✅ Completed Features

- [x] **Book Summarization**: AI-powered extraction of key insights
- [x] **Role-based Customization**: Tailored insights for different professions
- [x] **Structured Output**: Well-organized summaries with bullet points
- [x] **Conversation Generation**: Socratic dialogue between author and user
- [x] **Audio Playback**: Text-to-speech for conversations
- [x] **Beautiful UI**: Modern, responsive design with dark mode support
- [x] **Error Handling**: Comprehensive error management
- [x] **Loading States**: User feedback during AI processing

### 🚀 API Endpoints

#### `POST /summarize_book`

Generate structured book insights for a specific role.

**Request:**

```json
{
  "book_name": "Atomic Habits",
  "role": "startup founder",
  "num_insights": 5
}
```

**Response:**

```json
{
  "book_name": "Atomic Habits",
  "author": "James Clear",
  "role": "startup founder",
  "key_insights": [
    {
      "heading": "The 1% Rule",
      "bullet_points": [
        "Small improvements compound over time",
        "Focus on systems, not goals"
      ],
      "application": "Apply to product development cycles"
    }
  ],
  "key_theme": "Building better habits through small changes"
}
```

#### `POST /convert_to_conversation`

Convert book summary into Socratic dialogue.

#### `POST /full_book_experience`

Get both summary and conversation in one request.

#### `GET /health`

Check API health and configuration.

## 🛠️ Tech Stack

### Backend

- **FastAPI**: Modern, fast web framework
- **Pydantic**: Data validation and serialization
- **LangChain**: AI orchestration framework
- **Groq**: High-performance language models
- **Python-dotenv**: Environment variable management

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Web Speech API**: Browser-native text-to-speech

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Automatic system preference detection
- **Gradient Backgrounds**: Beautiful visual design
- **Loading Animations**: Smooth user experience
- **Error States**: User-friendly error handling
- **Step-by-step Flow**: Clear progression through the app

## 🔧 Development

### Running in Development Mode

**Backend (with auto-reload):**

```bash
cd server
python run.py
```

**Frontend (with hot reload):**

```bash
npm run dev
```

### API Testing

Use the built-in Swagger UI at http://localhost:8000/docs to test endpoints interactively.

### Customization

1. **Change AI Model**: Edit `main.py` and modify the `model` parameter in `ChatOpenAI`
2. **Add New Roles**: Update the role dropdown in `page.tsx`
3. **Modify Prompts**: Edit the prompt templates in `main.py`
4. **Styling**: Customize Tailwind classes in `page.tsx`

## 🚨 Troubleshooting

### Common Issues

1. **"GROQ_API_KEY not found"**

   - Ensure `.env` file exists in `/server` directory
   - Check API key is correctly formatted

2. **CORS Errors**

   - Make sure both frontend (3000) and backend (8000) are running
   - Check CORS settings in `main.py`

3. **Module Not Found Errors**

   - Run `pip install -r requirements.txt` in `/server` directory

4. **Speech Synthesis Not Working**
   - Use a modern browser (Chrome, Safari, Firefox)
   - Ensure audio permissions are granted

### API Health Check

Visit http://localhost:8000/health to verify backend status.

## 📦 Deployment

### Backend Deployment

```bash
# Production server
pip install gunicorn
gunicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment

```bash
# Build for production
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.
