# Setup Guide - Gig World Today

Complete guide to setting up Gig World Today locally for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **PostgreSQL** (optional, for database features) - [Download](https://www.postgresql.org/)
- A code editor (VS Code recommended)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mamiecotton-cmyk/Gigworldtoday.git
cd Gigworldtoday
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- ESLint

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database (optional - only needed if using PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/gigworldtoday
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Note:** The database is optional. The app works with JSON data files by default.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Verify Installation

Open your browser and navigate to:
- Homepage: http://localhost:3000
- Platforms: http://localhost:3000/platforms
- Platform Detail: http://localhost:3000/platforms/doordash

## Database Setup (Optional)

If you want to use PostgreSQL instead of JSON files:

### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gigworldtoday;

# Exit psql
\q
```

### Run Schema and Seed Data

```bash
# Run schema
psql -U postgres -d gigworldtoday -f database/schema.sql

# Load seed data
psql -U postgres -d gigworldtoday -f database/seed.sql
```

See [DATABASE.md](DATABASE.md) for more details.

## Using Supabase (Alternative)

If you prefer using Supabase instead of local PostgreSQL:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Copy your credentials**
   - Project URL
   - Anon/Public key

3. **Update .env file**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run SQL in Supabase SQL Editor**
   - Copy contents of `database/schema.sql`
   - Paste and run in Supabase SQL Editor
   - Copy contents of `database/seed.sql`
   - Paste and run in Supabase SQL Editor

## Development Tips

### Hot Reload

Next.js supports hot module replacement. Changes to your code will automatically refresh the browser.

### TypeScript

The project uses TypeScript strict mode. Run type checking:

```bash
npx tsc --noEmit
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint -- --fix
```

### Tailwind CSS

Tailwind classes are automatically purged in production. Use the Tailwind config in `tailwind.config.js` to customize:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* your colors */ }
      }
    }
  }
}
```

## Common Issues and Solutions

### Port 3000 Already in Use

If port 3000 is already in use:

```bash
# Use a different port
PORT=3001 npm run dev
```

### Module Not Found Errors

Clear node modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Ensure all dependencies are installed:

```bash
npm install @types/react @types/node --save-dev
```

### Build Errors

Clear Next.js cache:

```bash
rm -rf .next
npm run dev
```

## Project Structure Explained

```
gigworldtoday/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx          # Root layout with SEO
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Global styles
│   │   └── platforms/          # Platform pages
│   │       ├── page.tsx        # Platform directory
│   │       └── [slug]/
│   │           └── page.tsx    # Individual platform detail
│   │
│   ├── components/             # React components
│   │   ├── Header.tsx          # Site navigation
│   │   ├── Hero.tsx            # Homepage hero
│   │   ├── SearchBar.tsx       # Search input
│   │   ├── CategoryGrid.tsx    # Category cards
│   │   ├── PlatformCard.tsx    # Platform card
│   │   └── FilterSidebar.tsx   # Filter options
│   │
│   ├── lib/                    # Utilities
│   │   ├── types.ts            # TypeScript types
│   │   ├── data.ts             # Data fetching
│   │   └── constants.ts        # App constants
│   │
│   └── data/                   # JSON data
│       ├── platforms.json      # Platform data
│       └── categories.json     # Category data
│
├── database/                   # Database files
│   ├── schema.sql              # PostgreSQL schema
│   └── seed.sql                # Seed data
│
├── docs/                       # Documentation
│   ├── SETUP.md                # This file
│   ├── DATABASE.md             # Database guide
│   └── DEPLOYMENT.md           # Deployment guide
│
├── public/                     # Static files
│   └── logos/                  # Platform logos
│
└── Configuration files
    ├── next.config.js          # Next.js config
    ├── tailwind.config.js      # Tailwind config
    ├── tsconfig.json           # TypeScript config
    ├── .eslintrc.json          # ESLint config
    └── package.json            # Dependencies
```

## Next Steps

- Review the [DATABASE.md](DATABASE.md) for database setup
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
- Start building new features!

## Getting Help

- Check the [README.md](../README.md) for project overview
- Review existing code in `src/` directory
- Open an issue on GitHub for bugs or questions

---

Happy coding! 🚀
