-- Database schema for open_blinkist table
-- Run this SQL in your Supabase SQL editor to create the table

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
  
  -- Indexes for better query performance
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

-- Enable Row Level Security (RLS) - optional but recommended
ALTER TABLE open_blinkist ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for now (you can make this more restrictive later)
CREATE POLICY "Allow all operations on open_blinkist" ON open_blinkist
  FOR ALL USING (true);

-- Grant permissions to authenticated users (optional)
-- GRANT ALL ON open_blinkist TO authenticated;
-- GRANT ALL ON open_blinkist TO anon;
