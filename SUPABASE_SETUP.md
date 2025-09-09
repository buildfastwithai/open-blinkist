# Supabase Integration Setup Guide

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Existing API Configuration
NEXT_PUBLIC_API_URL=https://hammerhead-app-53pie.ondigitalocean.app
```

### 2. Database Table Creation

Run the following SQL in your Supabase SQL Editor to create the `open_blinkist` table:

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

## 📊 Table Schema Details

### Column Information

| Column Name          | Data Type   | Description                               | Constraints                                        |
| -------------------- | ----------- | ----------------------------------------- | -------------------------------------------------- |
| `id`                 | BIGSERIAL   | Primary key, auto-incrementing            | PRIMARY KEY                                        |
| `created_at`         | TIMESTAMPTZ | Record creation timestamp                 | DEFAULT NOW()                                      |
| `updated_at`         | TIMESTAMPTZ | Record last update timestamp              | DEFAULT NOW(), auto-updated                        |
| `book_name`          | TEXT        | Name of the book being analyzed           | NOT NULL                                           |
| `author`             | TEXT        | Book author (extracted from API response) | NULLABLE                                           |
| `role`               | TEXT        | User's selected role/profession           | NOT NULL                                           |
| `num_insights`       | INTEGER     | Number of insights requested              | NOT NULL, DEFAULT 5, CHECK (1-10)                  |
| `response_data`      | JSONB       | Complete API response data                | NULLABLE, structured JSON                          |
| `processing_time_ms` | INTEGER     | Time taken to process request             | NULLABLE                                           |
| `api_endpoint`       | TEXT        | API endpoint used                         | NULLABLE                                           |
| `user_ip`            | INET        | User's IP address                         | NULLABLE                                           |
| `user_agent`         | TEXT        | User's browser information                | NULLABLE                                           |
| `status`             | TEXT        | Processing status                         | NOT NULL, CHECK ('pending', 'completed', 'failed') |
| `error_message`      | TEXT        | Error details if status is 'failed'       | NULLABLE                                           |

### Sample Response Data Structure

The `response_data` JSONB column stores the complete API response:

```json
{
  "book_name": "Atomic Habits",
  "author": "James Clear",
  "role": "professional",
  "key_theme": "Building systems and habits for long-term success",
  "key_insights": [
    {
      "heading": "The Power of 1% Better",
      "bullet_points": [
        "Small improvements compound over time",
        "Focus on systems, not goals"
      ],
      "application": "Start with tiny changes in your daily routine"
    }
  ]
}
```

## 🔧 How It Works

### 1. Form Submission Flow

1. User fills out the form (book name, role, insights count)
2. Form data is immediately saved to Supabase with status 'pending'
3. API request is made to your FastAPI backend
4. Response is stored in the `response_data` column
5. Status is updated to 'completed' with processing time

### 2. Error Handling

- If API fails, status is set to 'failed' with error message
- Database operations are wrapped in try-catch blocks
- User sees appropriate error messages

### 3. Data Analytics

You can now query your Supabase database to get insights:

```sql
-- Most popular books
SELECT book_name, COUNT(*) as requests
FROM open_blinkist
WHERE status = 'completed'
GROUP BY book_name
ORDER BY requests DESC;

-- Average processing time
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

## 🛡️ Security & Privacy

### Row Level Security (RLS)

- RLS is enabled on the table
- Current policy allows all operations (modify as needed)
- Consider restricting based on user authentication

### Data Privacy

- User IP and User Agent are optional fields
- Consider GDPR compliance if collecting personal data
- Add data retention policies as needed

## 🚀 Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the Project URL and Public anon key
5. Add them to your `.env.local` file

## 🔍 Monitoring & Analytics

You can create views for better analytics:

```sql
-- Create a view for daily analytics
CREATE VIEW daily_analytics AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_requests,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_requests,
  AVG(processing_time_ms) as avg_processing_time
FROM open_blinkist
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## ✅ Installation Complete!

Your Next.js app now:

- ✅ Saves all form submissions to Supabase
- ✅ Stores API responses and metadata
- ✅ Tracks processing times and success rates
- ✅ Handles errors gracefully
- ✅ Provides comprehensive analytics capabilities

The app will continue to work even if Supabase is temporarily unavailable - it will just log errors and continue with the normal flow.
