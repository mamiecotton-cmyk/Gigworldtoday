-- Add welcome_email_sent flag to avoid duplicate welcome emails
ALTER TABLE email_subscribers
  ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN NOT NULL DEFAULT false;

-- Ensure existing rows have a defined value
UPDATE email_subscribers SET welcome_email_sent = false WHERE welcome_email_sent IS NULL;
