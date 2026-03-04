-- Add status column to email_subscribers
-- Default to 'active' so all existing subscribers are included
ALTER TABLE email_subscribers
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Update any rows that might have NULL status (shouldn't happen with DEFAULT, but just in case)
UPDATE email_subscribers SET status = 'active' WHERE status IS NULL;
