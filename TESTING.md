# Testing Guide - Gig World Today

This guide will walk you through testing your website to ensure everything works correctly.

## 🧪 Quick Testing Checklist

After making any changes, run through this checklist:

### 1. Start the Development Server

```bash
npm run dev
```

Wait for the message: `✓ Ready in Xms` then open http://localhost:3000

### 2. Test Homepage (/)

- [ ] Page loads without errors
- [ ] Hero section displays "Find Gig Apps Hiring Near You"
- [ ] Search bar is visible and functional
- [ ] All 8 category cards display with icons
- [ ] Featured platforms section shows at least 3 platforms
- [ ] Footer displays correctly

**How to check:** Navigate to http://localhost:3000

### 3. Test Platform Directory (/platforms)

- [ ] Page loads and shows all platforms
- [ ] Platform count is correct (should show "Showing X platforms")
- [ ] Filter sidebar is visible on desktop
- [ ] Each platform card shows:
  - Platform name
  - Category badge
  - Waitlist status (Accepting/Waitlist/Closed)
  - Requirements (age, vehicle, background check)
  - Estimated hourly pay
- [ ] Cards are clickable and link to detail pages

**How to check:** Navigate to http://localhost:3000/platforms

### 4. Test Platform Detail Pages

Pick 2-3 platforms to test thoroughly:

- [ ] Page loads with platform name in title
- [ ] Breadcrumb navigation works (Home > Platforms > [Platform Name])
- [ ] All sections display:
  - Header with platform info and Apply button
  - Requirements section
  - Compensation section
  - Availability/Regions section
  - Quick Actions sidebar
  - Similar Platforms section
- [ ] External links work (website, iOS app, Android app)

**How to check:** Click on any platform card or visit:
- http://localhost:3000/platforms/doordash
- http://localhost:3000/platforms/ezcater
- http://localhost:3000/platforms/instacart

### 5. Test Mobile Responsiveness

Use browser dev tools to test different screen sizes:

```
Chrome/Edge: F12 > Toggle device toolbar (Ctrl+Shift+M)
Firefox: F12 > Responsive Design Mode (Ctrl+Shift+M)
```

Test these viewports:
- [ ] Mobile: 375x667 (iPhone SE)
- [ ] Tablet: 768x1024 (iPad)
- [ ] Desktop: 1920x1080

Check that:
- [ ] Navigation menu adapts (shows hamburger menu on mobile)
- [ ] Cards stack properly on mobile
- [ ] Text is readable on all sizes
- [ ] Buttons are tappable on mobile

### 6. Test Navigation

- [ ] Clicking "Gig World Today" logo goes to homepage
- [ ] "Browse Platforms" link goes to /platforms
- [ ] "Categories" link goes to /platforms
- [ ] "Find Gigs" button goes to /platforms
- [ ] Footer links are clickable
- [ ] Category cards link to filtered views

### 7. Check for Console Errors

Open browser console (F12 > Console tab):

- [ ] No red error messages
- [ ] No 404 errors for missing resources
- [ ] No TypeScript errors

## 🔍 Testing After Adding/Editing Content

### When You Add a New Platform

1. **Check JSON is valid:**
   ```bash
   npm run build
   ```
   This will catch any JSON syntax errors.

2. **Verify the platform appears:**
   - [ ] Shows in platform directory at /platforms
   - [ ] Detail page loads at /platforms/[slug]
   - [ ] All fields display correctly
   - [ ] No missing data warnings

3. **Test the platform card:**
   - [ ] Name displays
   - [ ] Category is correct
   - [ ] Waitlist status shows with right color
   - [ ] Pay range displays
   - [ ] Requirements show correctly

4. **Test the detail page:**
   - [ ] All sections populated with your data
   - [ ] Links work
   - [ ] Related platforms show up

### When You Modify Existing Platforms

1. **Save your file and wait for auto-reload:**
   The dev server will automatically refresh (hot reload)

2. **Verify your changes:**
   - [ ] Navigate to the platform's page
   - [ ] Confirm your edits appear
   - [ ] Check no fields broke

3. **Test different pages:**
   - [ ] Homepage (if platform is in featured section)
   - [ ] Platform directory
   - [ ] Platform detail page

### When You Add/Edit Categories

1. **Verify category appears:**
   - [ ] Shows on homepage in category grid
   - [ ] Icon displays correctly
   - [ ] Description is readable

2. **Test category filtering:**
   - [ ] Click category card
   - [ ] Should filter to platforms in that category

## 🏗️ Build Testing

Before deploying or committing major changes:

```bash
npm run build
```

This tests:
- [ ] TypeScript compiles without errors
- [ ] All pages generate successfully
- [ ] No build-time errors
- [ ] Production bundle is created

**Expected output:** Should see all pages listed with build sizes.

## 🔧 Linting

Check code quality:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

## 📸 Visual Testing

For visual changes (styles, layouts, colors):

1. **Take before screenshots:**
   - Open the page you're changing
   - Take screenshots of key areas

2. **Make your changes**

3. **Compare after screenshots:**
   - Refresh the page
   - Take new screenshots
   - Compare to ensure changes look good

4. **Test in multiple browsers:**
   - Chrome/Edge
   - Firefox
   - Safari (if available)

## 🐛 Common Issues and Fixes

### Page Won't Load / White Screen

**Check:**
1. Console for error messages (F12)
2. Terminal where `npm run dev` is running
3. JSON syntax in data files

**Fix:** Look at the error message and fix the syntax error.

### Platform Not Showing Up

**Check:**
1. Is the `slug` unique?
2. Is the JSON valid? (use a JSON validator)
3. Did you save the file?
4. Did the dev server reload?

**Fix:** Ensure JSON is valid and slug matches the URL.

### Images Not Loading

**Check:**
1. `logoUrl` path is correct
2. Image file exists in `public/logos/`

**Fix:** Verify the path starts with `/logos/` and the file exists.

### Styles Look Wrong

**Check:**
1. Tailwind classes are spelled correctly
2. No conflicting CSS

**Fix:** Check the component file for typos in class names.

## 📋 Testing Workflow

Recommended workflow when making changes:

1. **Start dev server:** `npm run dev`
2. **Make your change:** Edit file and save
3. **Check browser:** Auto-reloads, verify change
4. **Test manually:** Click around, test functionality
5. **Check console:** No errors
6. **Test mobile:** Use responsive mode
7. **Build test:** `npm run build` (before committing)
8. **Lint check:** `npm run lint` (before committing)

## 🎯 Pre-Deployment Checklist

Before deploying to production:

- [ ] All pages load without errors
- [ ] No console errors
- [ ] Build succeeds: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Mobile responsive works
- [ ] All links work
- [ ] Data is accurate and up-to-date
- [ ] Images load correctly
- [ ] SEO meta tags are correct

## 💡 Testing Tips

1. **Use browser dev tools** - Invaluable for debugging
2. **Test incrementally** - Make small changes and test immediately
3. **Keep dev server running** - Provides instant feedback
4. **Check on real mobile devices** - If possible, test on actual phones
5. **Test with different data** - Try edge cases (long names, missing fields)

---

**Need more help?** Check [UPDATING.md](UPDATING.md) for making changes to your website.
