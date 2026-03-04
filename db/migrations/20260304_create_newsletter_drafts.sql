-- Newsletter drafts table
CREATE TABLE IF NOT EXISTS newsletter_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_newsletter_drafts_updated ON newsletter_drafts (updated_at DESC);
