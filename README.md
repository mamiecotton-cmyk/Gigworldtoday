# Gig World Today

> Your comprehensive directory for finding gig economy platforms

**Live at:** [gigworldtoday.com](https://gigworldtoday.com)

## 🎯 Overview

Gig World Today is a comprehensive directory website that helps gig workers discover platforms where they can find work opportunities. Compare requirements, pay rates, regional availability, and waitlist status across 30+ gig economy platforms.

### Key Features

- 📱 **30+ Platform Listings** - Food delivery, catering, rideshare, grocery delivery, and more
- 🔍 **Advanced Filtering** - Filter by location, vehicle requirements, age, background checks
- 💰 **Pay Comparisons** - See estimated hourly rates and payment frequencies
- 🗺️ **Regional Availability** - Check which platforms operate in your area
- 🚦 **Waitlist Status** - Know which platforms are currently accepting new workers
- 📊 **Detailed Requirements** - Understand what you need before applying

### Categories

- Catering Delivery (ezCater, DeliverThat, etc.)
- Food Delivery (DoorDash, Uber Eats, Grubhub)
- Grocery Delivery (Instacart, Shipt)
- Rideshare (Uber, Lyft)
- Package Delivery (Amazon Flex, Roadie)
- Quick Commerce (Gopuff)
- Task-Based (TaskRabbit, Handy)
- Pet Care (Rover, Wag)

## 🚀 Quick Start

**Want to see the website right now?** Check out the [QUICKSTART.md](QUICKSTART.md) guide!

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase-ready)
- **Deployment:** Vercel
- **Icons:** Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional, for database features)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mamiecotton-cmyk/Gigworldtoday.git
   cd Gigworldtoday
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
gigworldtoday/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Homepage
│   │   └── platforms/    # Platform pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and types
│   └── data/             # JSON data files
├── database/             # SQL schema and seeds
├── docs/                 # Documentation
├── public/               # Static assets
└── Configuration files
```

## 🗄️ Database

The project includes a PostgreSQL schema designed for Supabase. See [DATABASE.md](docs/DATABASE.md) for detailed setup instructions.

### Quick Database Setup

```bash
# Connect to your PostgreSQL database
psql -U postgres -d gigworldtoday

# Run schema
\i database/schema.sql

# Load seed data
\i database/seed.sql
```

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your repository to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel will auto-detect Next.js

2. **Configure environment variables**
   - Add your environment variables in Vercel dashboard
   - See `.env.example` for required variables

3. **Deploy**
   - Vercel automatically deploys on every push to main

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Documentation

- [SETUP.md](docs/SETUP.md) - Detailed setup instructions
- [DATABASE.md](docs/DATABASE.md) - Database configuration guide
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🔗 Links

- **Website:** [gigworldtoday.com](https://gigworldtoday.com)
- **Repository:** [github.com/mamiecotton-cmyk/Gigworldtoday](https://github.com/mamiecotton-cmyk/Gigworldtoday)

## 💡 Future Enhancements

- User accounts and saved searches
- Community platform reviews and ratings
- Email notifications for waitlist updates
- Blog with gig economy tips and news
- Advanced search with multiple filters
- Mobile app (iOS/Android)

---

Made with ❤️ for gig workers everywhere
