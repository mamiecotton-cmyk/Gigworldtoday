-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Outbound click tracking table
CREATE TABLE IF NOT EXISTS outbound_clicks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_url text NOT NULL,
  link_type text NOT NULL,
  label text,
  source_page text,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX idx_outbound_clicks_created_at ON outbound_clicks (created_at);
CREATE INDEX idx_outbound_clicks_link_type ON outbound_clicks (link_type);
CREATE INDEX idx_outbound_clicks_source_page ON outbound_clicks (source_page);
CREATE INDEX idx_outbound_clicks_destination_url ON outbound_clicks (destination_url);
