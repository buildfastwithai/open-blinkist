# 📚 Open Blinkist - Book Insights & AI Conversations

A Blinkist-like application that extracts key insights from books and converts them into engaging conversations using AI. Built with Next.js frontend and FastAPI backend.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: FastAPI with Python
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API for book summarization and conversation generation
- **Audio**: Web Speech API for text-to-speech

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Groq API key
- Supabase account (optional)

### 1. Backend Setup (FastAPI)

```bash
# Navigate to server directory
cd server

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

Create `.env` file in `/server` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
```

**Get your Groq API key:**

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Create an API key
4. Copy it to your `.env` file

```bash
# Start the backend server
python run.py
# OR for production:
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
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

### 3. Database Setup (Optional - Supabase)

Create `.env.local` file in project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Existing API Configuration
NEXT_PUBLIC_API_URL=https://hammerhead-app-53pie.ondigitalocean.app
```

**Getting Supabase Credentials:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the Project URL and Public anon key

**Database Schema:**
Run this SQL in your Supabase SQL Editor:

```sql
-- Database schema for open_blinkist table
CREATE TABLE open_blinkist (
  -- Primary key and timestamps
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Form input data
  book_name TEXT NOT NULL,
  author TEXT,
  role TEXT NOT NULL,
  num_insights INTEGER NOT NULL DEFAULT 5,

  -- API response data stored as JSON
  response_data JSONB,

  -- Metadata and tracking
  processing_time_ms INTEGER,
  api_endpoint TEXT,
  user_ip INET,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,

  -- Constraints
  CONSTRAINT valid_num_insights CHECK (num_insights > 0 AND num_insights <= 10)
);

-- Create indexes for better query performance
CREATE INDEX idx_open_blinkist_created_at ON open_blinkist(created_at DESC);
CREATE INDEX idx_open_blinkist_status ON open_blinkist(status);
CREATE INDEX idx_open_blinkist_book_name ON open_blinkist(book_name);
CREATE INDEX idx_open_blinkist_role ON open_blinkist(role);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_open_blinkist_updated_at
    BEFORE UPDATE ON open_blinkist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE open_blinkist ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on open_blinkist" ON open_blinkist
  FOR ALL USING (true);
```

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
- [x] **Database Integration**: Supabase for data storage and analytics

## 🚀 API Endpoints

### Health Check

- `GET /` - Basic health check
- `GET /health` - Detailed health check with Groq configuration status

### Book Processing

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

### Interactive Documentation

- `GET /docs` - Swagger UI documentation
- `GET /redoc` - ReDoc documentation

## 🛠️ Tech Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Web Speech API**: Browser-native text-to-speech

### Backend

- **FastAPI**: Modern, fast web framework
- **Pydantic**: Data validation and serialization
- **LangChain**: AI orchestration framework
- **Groq**: High-performance language models
- **Python-dotenv**: Environment variable management

### Database

- **Supabase**: PostgreSQL with real-time subscriptions
- **Row Level Security**: Built-in security features

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
source venv/bin/activate
python run.py
```

**Frontend (with hot reload):**

```bash
npm run dev
```

### API Testing

Use the built-in Swagger UI at http://localhost:8000/docs to test endpoints interactively.

### Example API Calls

```bash
# Summarize a Book
curl -X POST "http://localhost:8000/summarize_book" \
  -H "Content-Type: application/json" \
  -d '{
    "book_name": "Atomic Habits",
    "role": "software engineer",
    "num_insights": 5
  }'

# Full Book Experience
curl -X POST "http://localhost:8000/full_book_experience" \
  -H "Content-Type: application/json" \
  -d '{
    "book_name": "The Lean Startup",
    "role": "entrepreneur",
    "num_insights": 4
  }'
```

## 📊 Database Analytics

Query your Supabase database for insights:

```sql
-- Most popular books
SELECT book_name, COUNT(*) as requests
FROM open_blinkist
WHERE status = 'completed'
GROUP BY book_name
ORDER BY requests DESC;

-- Average processing time by role
SELECT role, AVG(processing_time_ms) as avg_time_ms
FROM open_blinkist
WHERE status = 'completed'
GROUP BY role;

-- Success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM open_blinkist
GROUP BY status;
```

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
   - Ensure virtual environment is activated

4. **Speech Synthesis Not Working**

   - Use a modern browser (Chrome, Safari, Firefox)
   - Ensure audio permissions are granted

5. **Port already in use**
   - Kill existing processes: `pkill -f "gunicorn main:app"`
   - Or use different port: `--bind 0.0.0.0:8001`

### API Health Check

Visit http://localhost:8000/health to verify backend status.

### Logs and Debugging

```bash
# Run with verbose logging
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --log-level debug

# Check running processes
ps aux | grep gunicorn

# Monitor logs in real-time
tail -f access.log
```

## 📦 Deployment

### Backend Deployment

```bash
# Production server with Gunicorn
cd server
source venv/bin/activate
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Background/Daemon mode
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --daemon --pid gunicorn.pid

# Stop daemon
kill $(cat gunicorn.pid)
```

### Frontend Deployment

```bash
# Build for production
npm run build
npm start
```

### Vercel Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🛡️ Security & Privacy

### Row Level Security (RLS)

- RLS is enabled on the database table
- Current policy allows all operations (modify as needed)
- Consider restricting based on user authentication

### Data Privacy

- User IP and User Agent are optional fields
- Consider GDPR compliance if collecting personal data
- Add data retention policies as needed

## 🔧 Customization

1. **Change AI Model**: Edit `main.py` and modify the `model` parameter in `ChatOpenAI`
2. **Add New Roles**: Update the role dropdown in `page.tsx`
3. **Modify Prompts**: Edit the prompt templates in `main.py`
4. **Styling**: Customize Tailwind classes in `page.tsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - learn about FastAPI features
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features
- [Groq Documentation](https://console.groq.com/docs/quickstart) - learn about Groq AI models
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
