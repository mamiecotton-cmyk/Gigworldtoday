# Database Guide - Gig World Today

Complete guide to setting up and managing the PostgreSQL database for Gig World Today.

## Overview

Gig World Today uses PostgreSQL as its database backend. The schema is designed to work seamlessly with Supabase, a hosted PostgreSQL service.

**Note:** The database is optional. The application works with JSON data files by default (`src/data/*.json`).

## Database Schema

The database consists of two main tables:

### 1. Categories Table

Stores gig work categories (food delivery, catering, rideshare, etc.)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Fields:**
- `id` - Unique identifier (UUID)
- `slug` - URL-friendly identifier (e.g., "food-delivery")
- `name` - Display name (e.g., "Food Delivery")
- `description` - Category description
- `icon` - Emoji icon for display
- `sort_order` - Display order on the site

### 2. Platforms Table

Stores gig platform information

```sql
CREATE TABLE platforms (
  id UUID PRIMARY KEY,
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
  background_check_required BOOLEAN,
  vehicle_types TEXT[],
  license_required BOOLEAN,
  insurance_required BOOLEAN,
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
  tips_allowed BOOLEAN,
  payment_frequency TEXT,
  
  -- Work details
  delivery_type TEXT,
  setup_required BOOLEAN,
  
  -- Metadata
  last_updated TIMESTAMP,
  data_sources TEXT[],
  verification_status TEXT,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Key Fields:**
- `regions` - JSONB field storing regional availability and waitlist status
- `categories` - Array of category IDs this platform belongs to
- `vehicle_types` - Array of accepted vehicle types
- `verification_status` - Data verification level: verified, community, needs_verification

## Local PostgreSQL Setup

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gigworldtoday;

# Create user (optional)
CREATE USER giguser WITH PASSWORD 'yourpassword';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gigworldtoday TO giguser;

# Exit
\q
```

### 3. Run Schema

```bash
# Run schema file
psql -U postgres -d gigworldtoday -f database/schema.sql

# Or if using custom user
psql -U giguser -d gigworldtoday -f database/schema.sql
```

### 4. Load Seed Data

```bash
psql -U postgres -d gigworldtoday -f database/seed.sql
```

### 5. Verify Setup

```bash
# Connect to database
psql -U postgres -d gigworldtoday

# List tables
\dt

# View platforms
SELECT name, categories, min_age FROM platforms;

# Exit
\q
```

## Supabase Setup

Supabase provides a hosted PostgreSQL database with additional features like authentication and real-time subscriptions.

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Note your Project URL and API keys

### 2. Configure Database

1. Navigate to the **SQL Editor** in Supabase dashboard
2. Copy the contents of `database/schema.sql`
3. Paste into the SQL editor
4. Click "Run"

### 3. Load Seed Data

1. Still in the SQL Editor
2. Copy the contents of `database/seed.sql`
3. Paste into the SQL editor
4. Click "Run"

### 4. Update Environment Variables

Edit your `.env` file:

```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

Get these values from:
- Settings → Database → Connection string (DATABASE_URL)
- Settings → API → Project URL (SUPABASE_URL)
- Settings → API → anon public key (SUPABASE_ANON_KEY)

## Connecting to Database from Next.js

### Using Supabase Client

Install Supabase client:

```bash
npm install @supabase/supabase-js
```

Create a Supabase client (`src/lib/supabase.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

Query platforms:

```typescript
import { supabase } from '@/lib/supabase';

async function getPlatforms() {
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
}
```

### Using Raw SQL

For more complex queries:

```typescript
const { data, error } = await supabase
  .rpc('search_platforms', { 
    search_query: 'delivery' 
  });
```

## Common Queries

### Get All Platforms

```sql
SELECT * FROM platforms ORDER BY name;
```

### Get Platforms by Category

```sql
SELECT * FROM platforms 
WHERE 'food_delivery' = ANY(categories);
```

### Get Platforms Accepting New Workers

```sql
SELECT * FROM platforms 
WHERE waitlist_status = 'open';
```

### Get Platforms by Vehicle Type

```sql
SELECT * FROM platforms 
WHERE 'car' = ANY(vehicle_types);
```

### Search Platforms

```sql
SELECT * FROM platforms 
WHERE name ILIKE '%delivery%' 
   OR description ILIKE '%delivery%';
```

### Get Platform with Regional Data

```sql
SELECT 
  name,
  regions->'USA'->>'status' as usa_status,
  regions->'USA'->>'waitlistStatus' as usa_waitlist
FROM platforms
WHERE slug = 'doordash';
```

## Indexes

The schema includes several indexes for performance:

- `idx_platforms_categories` - GIN index on categories array
- `idx_platforms_waitlist` - Index on waitlist_status
- `idx_platforms_countries` - GIN index on countries array
- `idx_platforms_vehicle_types` - GIN index on vehicle_types array
- `idx_categories_slug` - Index on category slug
- `idx_platforms_slug` - Index on platform slug

## Triggers

The schema includes automatic timestamp triggers:

- `update_platforms_updated_at` - Updates `updated_at` on platform changes
- `update_categories_updated_at` - Updates `updated_at` on category changes

## Data Management

### Adding a New Platform

```sql
INSERT INTO platforms (
  slug, name, description, website_url,
  categories, min_age, background_check_required,
  vehicle_types, countries, regions,
  pay_model, tips_allowed, payment_frequency,
  delivery_type, verification_status
) VALUES (
  'newplatform',
  'New Platform',
  'Description here',
  'https://example.com',
  ARRAY['food_delivery'],
  18,
  true,
  ARRAY['car'],
  ARRAY['USA'],
  '{"USA": {"status": "Available", "waitlistStatus": "open"}}'::jsonb,
  'per_delivery',
  true,
  'weekly',
  'on_demand',
  'needs_verification'
);
```

### Updating Platform Data

```sql
UPDATE platforms
SET 
  estimated_hourly_min = 20,
  estimated_hourly_max = 30,
  last_updated = NOW()
WHERE slug = 'doordash';
```

### Deleting Old Data

```sql
DELETE FROM platforms
WHERE verification_status = 'needs_verification'
  AND last_updated < NOW() - INTERVAL '6 months';
```

## Backup and Restore

### Backup Database

```bash
# Local PostgreSQL
pg_dump -U postgres gigworldtoday > backup.sql

# Supabase (requires connection details)
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

### Restore Database

```bash
# Local PostgreSQL
psql -U postgres -d gigworldtoday < backup.sql
```

## Troubleshooting

### Connection Refused

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql
```

### Permission Denied

```bash
# Grant privileges
psql -U postgres
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO giguser;
```

### Cannot Create Extension

```bash
# Connect as superuser
psql -U postgres -d gigworldtoday
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## Next Steps

- Review [SETUP.md](SETUP.md) for full application setup
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Explore Supabase features like Row Level Security and real-time subscriptions

---

For more help, see the [PostgreSQL documentation](https://www.postgresql.org/docs/) or [Supabase documentation](https://supabase.com/docs).
