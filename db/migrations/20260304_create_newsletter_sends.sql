-- Track every newsletter send
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject     TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  recipients  INTEGER NOT NULL DEFAULT 0,
  sent        INTEGER NOT NULL DEFAULT 0,
  failed      INTEGER NOT NULL DEFAULT 0,
  is_test     BOOLEAN NOT NULL DEFAULT false,
  sent_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_newsletter_sends_sent_at ON newsletter_sends (sent_at DESC);
