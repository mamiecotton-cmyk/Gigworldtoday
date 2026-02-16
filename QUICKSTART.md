# Quick Start Guide - Gig World Today

Want to see the website running locally? Follow these simple steps!

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages (Next.js, React, Tailwind CSS, etc.). Takes about 30-60 seconds.

### Step 2: Start the Development Server

```bash
npm run dev
```

The server will start on port 3000. You'll see a message like:
```
▲ Next.js 15.0.8
- Local:        http://localhost:3000
```

### Step 3: Open Your Browser

Open your browser and navigate to:
```
http://localhost:3000
```

🎉 **That's it!** The website is now running locally.

---

## 📱 What You'll See

- **Homepage** - Hero section, search bar, 8 category cards, and featured platforms
- **Browse Platforms** - Click "Browse Platforms" or visit `/platforms`
- **Platform Details** - Click any platform card to see full details

---

## 🛑 Stopping the Server

Press `Ctrl + C` in the terminal where the dev server is running.

---

## 🔧 Troubleshooting

### Port 3000 Already in Use?

If port 3000 is busy, you can use a different port:

```bash
PORT=3001 npm run dev
```

Then visit `http://localhost:3001`

### Fresh Start Needed?

If you encounter issues, try:

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 Next Steps

- **Edit Content** - Platform data is in `src/data/platforms.json`
- **Add Categories** - Categories are in `src/data/categories.json`
- **Customize Styles** - Tailwind config in `tailwind.config.js`
- **Build for Production** - Run `npm run build`

---

## 🆘 Need More Help?

- [SETUP.md](docs/SETUP.md) - Detailed setup guide
- [README.md](README.md) - Full documentation
- [DATABASE.md](docs/DATABASE.md) - Database setup
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deploy to production

---

**Questions?** Open an issue on GitHub!
