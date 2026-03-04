-- Add featured_last_date column to platforms table
ALTER TABLE platforms
ADD COLUMN IF NOT EXISTS featured_last_date timestamp with time zone DEFAULT NULL;

-- Index for efficient "oldest featured" queries
CREATE INDEX IF NOT EXISTS idx_platforms_featured_last_date ON platforms (featured_last_date NULLS FIRST);
