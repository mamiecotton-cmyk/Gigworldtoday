# Updating Guide - Gig World Today

This guide shows you how to update and customize your website.

## 📝 Quick Reference

- **Add/Edit Platforms:** Edit `src/data/platforms.json`
- **Add/Edit Categories:** Edit `src/data/categories.json`
- **Change Styles:** Edit component files in `src/components/`
- **Change Colors:** Edit `tailwind.config.js`
- **Edit Pages:** Files in `src/app/`

## 🆕 Adding a New Platform

### Step 1: Open the Platforms File

```bash
# Open in your text editor
src/data/platforms.json
```

### Step 2: Add Your Platform

Copy this template and add it to the array:

```json
{
  "id": "yourplatform",
  "slug": "yourplatform",
  "name": "Your Platform Name",
  "description": "Brief description of what workers do on this platform.",
  "logoUrl": "/logos/yourplatform.png",
  "websiteUrl": "https://www.yourplatform.com",
  "iosAppUrl": "https://apps.apple.com/app/yourplatform",
  "androidAppUrl": "https://play.google.com/store/apps/details?id=com.yourplatform",
  "categories": ["food_delivery"],
  "minAge": 18,
  "backgroundCheckRequired": true,
  "vehicleTypes": ["car", "bike"],
  "licenseRequired": false,
  "insuranceRequired": false,
  "equipmentNeeded": ["smartphone", "insulated bag"],
  "otherRequirements": "Must be able to lift 30 lbs",
  "countries": ["USA"],
  "regions": {
    "USA": {
      "status": "Available nationwide",
      "cities": ["New York", "Los Angeles", "Chicago"],
      "waitlistStatus": "open"
    }
  },
  "payModel": "per_delivery",
  "estimatedPayMin": 5,
  "estimatedPayMax": 15,
  "estimatedHourlyMin": 15,
  "estimatedHourlyMax": 25,
  "tipsAllowed": true,
  "paymentFrequency": "weekly",
  "deliveryType": "on_demand",
  "setupRequired": false,
  "lastUpdated": "2024-02-16",
  "dataSources": ["official_website"],
  "verificationStatus": "verified"
}
```

### Step 3: Customize the Fields

**Required Fields:**
- `id`: Unique identifier (lowercase, no spaces)
- `slug`: URL-friendly name (used in /platforms/[slug])
- `name`: Display name
- `description`: What the platform does
- `categories`: Array of category IDs (see categories.json)
- `countries`: Array of countries where available

**Important Fields:**
- `minAge`: Minimum age requirement
- `vehicleTypes`: ["none", "bike", "car", "suv", "van"]
- `waitlistStatus`: "open", "waitlist", "closed", or "unknown"
- `payModel`: "per_delivery", "per_order", "hourly", or "per_task"
- `paymentFrequency`: "daily", "weekly", "instant", or "monthly"

### Step 4: Save and Test

1. Save the file
2. The dev server will auto-reload
3. Check http://localhost:3000/platforms
4. Your new platform should appear!
5. Click it to test the detail page

### Common Issues:

**Platform doesn't appear?**
- Check JSON syntax (use a JSON validator)
- Ensure the slug is unique
- Make sure you saved the file

**JSON syntax error?**
- Check all commas (need comma between objects, no comma after last one)
- Ensure all quotes are correct
- No trailing commas

## ✏️ Editing Existing Platforms

### Step 1: Find the Platform

Open `src/data/platforms.json` and search for the platform by name or slug.

### Step 2: Make Your Changes

Common edits:
- Update pay rates: Change `estimatedPayMin/Max` or `estimatedHourlyMin/Max`
- Change waitlist status: Update `waitlistStatus` in regions
- Add cities: Add to `cities` array in regions
- Update requirements: Change `minAge`, `vehicleTypes`, etc.
- Update description: Edit the `description` field

### Step 3: Verify

1. Save the file
2. Refresh the browser (or wait for auto-reload)
3. Check the platform's page
4. Verify your changes appear correctly

## 🏷️ Adding a New Category

### Step 1: Open Categories File

```bash
src/data/categories.json
```

### Step 2: Add Category

```json
{
  "id": "your_category",
  "name": "Your Category Name",
  "slug": "your-category",
  "description": "What this category includes.",
  "icon": "🚀",
  "sortOrder": 9
}
```

**Field Guide:**
- `id`: Unique ID (lowercase, use underscores)
- `slug`: URL-friendly (lowercase, use hyphens)
- `name`: Display name
- `icon`: Emoji icon to show on homepage
- `sortOrder`: Where it appears (1-10)

### Step 3: Use the Category

When adding platforms, use the category ID in the `categories` array:

```json
"categories": ["your_category"]
```

## 🎨 Changing Colors and Styles

### Change Primary Color

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',   // Lightest
        100: '#e0f2fe',
        // ... edit these values
        600: '#0284c7',  // Main color (used most)
        700: '#0369a1',  // Darker
        // ...
      },
    },
  },
}
```

**Quick color picker:** Use https://uicolors.app/create to generate a palette.

### Change Component Styles

Components are in `src/components/`:

**Example - Change Header Background:**

Edit `src/components/Header.tsx`:

```tsx
// Find this line:
<header className="bg-white shadow-sm border-b">

// Change to:
<header className="bg-blue-600 shadow-sm border-b">
```

**Common style changes:**
- `bg-[color]`: Background color
- `text-[color]`: Text color
- `p-[size]`: Padding
- `m-[size]`: Margin
- `rounded-[size]`: Border radius
- `shadow-[size]`: Shadow

## 📄 Editing Page Content

### Homepage Content

Edit `src/app/page.tsx`:

**Change hero title:**
```tsx
<h1 className="...">
  Find Gig Apps Hiring
  <span className="text-primary-600"> Near You</span>
</h1>
```

**Change hero description:**
```tsx
<p className="...">
  Discover 30+ gig economy platforms...
</p>
```

### Platform Directory Page

Edit `src/app/platforms/page.tsx`:

**Change page title:**
```tsx
<h1 className="...">
  Browse All Platforms
</h1>
```

**Change description:**
```tsx
<p className="...">
  Discover {platforms.length} gig opportunities...
</p>
```

## 🖼️ Adding Platform Logos

### Step 1: Prepare Your Image

- Format: PNG or JPG
- Size: 200x200 pixels (square) recommended
- Background: Transparent PNG works best
- Name: `platformname.png` (lowercase, no spaces)

### Step 2: Add to Public Folder

```bash
# Place file here:
public/logos/yourplatform.png
```

### Step 3: Reference in Platform Data

In `platforms.json`:

```json
"logoUrl": "/logos/yourplatform.png"
```

**Note:** Path must start with `/logos/`

## 🔧 Common Updates

### Update Platform Pay Rates

```json
"estimatedPayMin": 15,
"estimatedPayMax": 30,
"estimatedHourlyMin": 18,
"estimatedHourlyMax": 35
```

### Change Waitlist Status

```json
"regions": {
  "USA": {
    "status": "Available nationwide",
    "waitlistStatus": "open"  // Change to: "waitlist", "closed", or "unknown"
  }
}
```

### Add More Cities

```json
"regions": {
  "USA": {
    "status": "Available in select cities",
    "cities": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
    "waitlistStatus": "open"
  }
}
```

### Change Requirements

```json
"minAge": 21,
"backgroundCheckRequired": true,
"vehicleTypes": ["car", "suv"],
"licenseRequired": true,
"insuranceRequired": true,
"equipmentNeeded": ["insulated bag", "smartphone", "cooler"]
```

## 🚀 Workflow for Making Updates

### Recommended Process:

1. **Start dev server:** `npm run dev`
2. **Make one change at a time**
3. **Save the file**
4. **Check in browser immediately**
5. **Verify the change looks correct**
6. **Move to next change**

### For Multiple Changes:

1. **List what you want to change**
2. **Make changes one by one**
3. **Test each change**
4. **Before committing:**
   - Run `npm run build` to check for errors
   - Run `npm run lint` to check code quality
   - Test all pages manually

## ✅ Testing Your Updates

After making updates, follow the [TESTING.md](TESTING.md) guide to verify:

- [ ] Your changes appear correctly
- [ ] No errors in console
- [ ] All pages still load
- [ ] Mobile view still works
- [ ] Build succeeds

## 📋 Update Checklist

Before considering your update complete:

- [ ] Made the changes to data files
- [ ] Saved all files
- [ ] Tested in browser
- [ ] Checked console for errors
- [ ] Verified mobile responsiveness
- [ ] Ran `npm run build` successfully
- [ ] Committed changes to git

## 💡 Tips

1. **Make small changes** - Easier to debug if something breaks
2. **Test immediately** - Don't make 10 changes then test
3. **Keep dev server running** - Get instant feedback
4. **Use browser dev tools** - Inspect elements to see what's wrong
5. **Valid JSON** - Use a JSON validator if unsure about syntax
6. **Backup before major changes** - Commit to git regularly

## 🆘 Getting Unstuck

### JSON Syntax Error?

Use an online JSON validator:
- https://jsonlint.com/
- Copy your JSON, paste it in, click Validate

### Can't See Your Changes?

1. Did you save the file?
2. Is the dev server running?
3. Did the page auto-reload? (Refresh manually if not)
4. Check browser console for errors
5. Check terminal where dev server runs

### Website Broke?

1. Check terminal - look for error messages
2. Check browser console - look for errors
3. Review your last change
4. Undo your last change and try again
5. Run `npm run build` to see detailed errors

---

**Need help testing?** See [TESTING.md](TESTING.md) for comprehensive testing guide.

**Need help with setup?** See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.
