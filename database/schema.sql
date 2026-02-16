-- Gig World Today Database Schema
-- PostgreSQL Schema for platform and category data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Platforms table
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  ios_app_url TEXT,
  android_app_url TEXT,
  
  -- Classification
  categories TEXT[] NOT NULL,
  
  -- Requirements
  min_age INTEGER,
  background_check_required BOOLEAN DEFAULT false,
  vehicle_types TEXT[],
  license_required BOOLEAN DEFAULT false,
  insurance_required BOOLEAN DEFAULT false,
  equipment_needed TEXT[],
  other_requirements TEXT,
  
  -- Availability
  countries TEXT[],
  regions JSONB,
  waitlist_status TEXT,
  
  -- Compensation
  pay_model TEXT,
  estimated_pay_min DECIMAL(10,2),
  estimated_pay_max DECIMAL(10,2),
  estimated_hourly_min DECIMAL(10,2),
  estimated_hourly_max DECIMAL(10,2),
  tips_allowed BOOLEAN DEFAULT false,
  payment_frequency TEXT,
  
  -- Work details
  delivery_type TEXT,
  setup_required BOOLEAN DEFAULT false,
  
  -- Metadata
  last_updated TIMESTAMP DEFAULT NOW(),
  data_sources TEXT[],
  verification_status TEXT DEFAULT 'needs_verification',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_platforms_categories ON platforms USING GIN(categories);
CREATE INDEX idx_platforms_waitlist ON platforms(waitlist_status);
CREATE INDEX idx_platforms_countries ON platforms USING GIN(countries);
CREATE INDEX idx_platforms_vehicle_types ON platforms USING GIN(vehicle_types);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_platforms_slug ON platforms(slug);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON platforms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE platforms IS 'Stores information about gig economy platforms';
COMMENT ON TABLE categories IS 'Categories for organizing gig platforms';
COMMENT ON COLUMN platforms.regions IS 'JSON object containing regional availability and waitlist status';
COMMENT ON COLUMN platforms.verification_status IS 'Status: verified, community, needs_verification';
