# Example: Testing and Updating Your Website

This is a practical walkthrough showing you how to test and update your website.

## Scenario: Adding a New Gig Platform

Let's walk through adding a new platform called "Gopuff" step by step.

### Step 1: Start Testing Environment

```bash
# Ensure dependencies are installed
npm install

# Start the development server
npm run dev
```

**What you'll see:**
```
▲ Next.js 15.0.8
- Local:        http://localhost:3000
- Ready in 2.3s
```

Open your browser to **http://localhost:3000**

### Step 2: Test Current Website

Before making changes, verify everything works:

**Homepage Checklist:**
- [ ] Hero section displays
- [ ] 8 categories show with emojis
- [ ] Featured platforms appear (3 cards)
- [ ] Navigation works

**Platform Directory:**
- [ ] Visit http://localhost:3000/platforms
- [ ] Count current platforms (should be 5)
- [ ] All cards display correctly

**Take Note:** Currently showing 5 platforms.

### Step 3: Add New Platform Data

Open `src/data/platforms.json` in your editor.

Add this new platform at the end of the array (before the closing `]`):

```json
,
{
  "id": "gopuff",
  "slug": "gopuff",
  "name": "Gopuff",
  "description": "Deliver convenience items, snacks, drinks, and everyday essentials in minutes. Work flexible hours with instant payments.",
  "logoUrl": "/logos/gopuff.png",
  "websiteUrl": "https://gopuff.com/drivers",
  "iosAppUrl": "https://apps.apple.com/us/app/gopuff-driver",
  "androidAppUrl": "https://play.google.com/store/apps/details?id=com.gopuff.driver",
  "categories": ["quick_commerce"],
  "minAge": 21,
  "backgroundCheckRequired": true,
  "vehicleTypes": ["car"],
  "licenseRequired": true,
  "insuranceRequired": true,
  "equipmentNeeded": ["smartphone"],
  "otherRequirements": "Must have reliable vehicle and smartphone",
  "countries": ["USA"],
  "regions": {
    "USA": {
      "status": "Available in 650+ cities",
      "cities": ["New York", "Los Angeles", "Miami", "Philadelphia", "Phoenix"],
      "waitlistStatus": "open"
    }
  },
  "payModel": "per_delivery",
  "estimatedPayMin": 8,
  "estimatedPayMax": 20,
  "estimatedHourlyMin": 13,
  "estimatedHourlyMax": 22,
  "tipsAllowed": true,
  "paymentFrequency": "instant",
  "deliveryType": "on_demand",
  "setupRequired": false,
  "lastUpdated": "2024-02-16",
  "dataSources": ["official_website"],
  "verificationStatus": "verified"
}
```

**Important:** Make sure you have a comma after the previous platform entry!

### Step 4: Save and Check Auto-Reload

1. **Save the file** (Ctrl+S or Cmd+S)
2. **Watch the terminal** - You should see:
   ```
   ⚠ Compiled with warnings in 1.2s
   ```
3. **Browser auto-reloads** - The page refreshes automatically

### Step 5: Test Your New Platform

**Platform Directory Test:**
1. Visit http://localhost:3000/platforms
2. Look for "Gopuff" in the list
3. Should now show "Showing 6 platforms" (was 5 before)

**Platform Card Test:**
Check the Gopuff card shows:
- [ ] Name: "Gopuff"
- [ ] Category badge: "quick commerce"
- [ ] Status: Green "Accepting" badge
- [ ] Requirements: "21+ years", "car", "Background check"
- [ ] Pay: "$13-$22/hr estimated"

**Detail Page Test:**
1. Click on the Gopuff card
2. Should navigate to http://localhost:3000/platforms/gopuff
3. Verify all sections display:
   - [ ] Header with platform name and "Apply Now" button
   - [ ] Requirements section (age, vehicle, background check, etc.)
   - [ ] Compensation section (pay model, rates, tips, payment frequency)
   - [ ] Availability section (USA with 650+ cities)
   - [ ] Quick Actions sidebar with links
   - [ ] Similar platforms at bottom

### Step 6: Test on Mobile

1. Open browser dev tools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select "iPhone SE" or similar
4. Check:
   - [ ] Platform card stacks vertically
   - [ ] Text is readable
   - [ ] Buttons are tappable
   - [ ] Navigation adapts (shows menu icon)

### Step 7: Check Console for Errors

1. Open browser console (F12 > Console tab)
2. Look for any red errors
3. Should see only info messages (ignore React DevTools message)

**If you see errors:**
- Red error? Check your JSON syntax
- 404 error? Check file paths
- TypeScript error? Check data types match

### Step 8: Build Test

Before committing, test that the build works:

```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (11/11)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    166 B         106 kB
├ ○ /platforms                           162 B         106 kB
├ ● /platforms/[slug]                    166 B         106 kB
│   ├ /platforms/gopuff                  [NEW!]
│   ├ /platforms/ezcater
│   └ [+4 more paths]
```

Look for your new platform in the list!

### Step 9: Verify Changes

**Manual Testing Checklist:**
- [x] Platform appears in directory
- [x] Platform count increased
- [x] Card displays correctly
- [x] Detail page loads
- [x] All data shows correctly
- [x] Mobile view works
- [x] No console errors
- [x] Build succeeds

## Example 2: Updating Platform Pay Rates

Say DoorDash increased their pay rates. Here's how to update:

### Step 1: Find the Platform

Open `src/data/platforms.json` and search for "doordash" (Ctrl+F or Cmd+F)

### Step 2: Update the Rates

Find these fields and update them:

```json
"estimatedPayMin": 5,         // Change to: 7
"estimatedPayMax": 15,        // Change to: 18
"estimatedHourlyMin": 15,     // Change to: 18
"estimatedHourlyMax": 25,     // Change to: 28
"lastUpdated": "2024-02-16"   // Update to today's date
```

### Step 3: Save and Test

1. Save the file
2. Navigate to http://localhost:3000/platforms/doordash
3. Check compensation section shows new rates
4. Check platform card shows updated hourly estimate

### Step 4: Verify on Multiple Pages

- [ ] Homepage (if DoorDash is featured)
- [ ] Platform directory listing
- [ ] Platform detail page

## Example 3: Changing Waitlist Status

If a platform stops accepting new drivers:

### Update the Status

In `platforms.json`, find the platform and change:

```json
"regions": {
  "USA": {
    "status": "Not currently accepting new drivers",
    "waitlistStatus": "closed"  // Change from "open" to "closed"
  }
}
```

### Test the Change

1. Save file
2. Check the platform card - badge should be red "Closed"
3. Check detail page shows updated status

## Testing Checklist Template

Use this for any update:

```markdown
## Testing [Feature/Change Name]

**Before Making Changes:**
- [ ] Took screenshots of current state
- [ ] Noted current behavior
- [ ] Dev server is running

**Made Changes:**
- [ ] Edited file: _______________
- [ ] Saved file
- [ ] Saw auto-reload in browser

**Testing:**
- [ ] Change appears correctly
- [ ] No console errors
- [ ] Page still loads
- [ ] Navigation works
- [ ] Mobile view works

**Final Checks:**
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] All pages tested
- [ ] Ready to commit
```

## Quick Testing Tips

1. **Keep dev server running** - See changes instantly
2. **Check console immediately** - Catch errors fast
3. **Test on multiple pages** - Ensure changes propagate
4. **Use browser dev tools** - Inspect and debug
5. **Build before committing** - Catch build-time errors
6. **Test incrementally** - One change at a time

## Common Workflows

### Daily Development Workflow

```bash
# Morning
npm run dev                    # Start server

# Make changes
# Edit files → Save → Check browser

# Before lunch/end of day
npm run build                  # Test build
npm run lint                   # Check code quality
git add .
git commit -m "Description"
git push
```

### Quick Update Workflow

```bash
# Already have server running?
# Just edit file → save → check browser

# New to today?
npm run dev                    # Start server
# Edit → Save → Check
```

### Testing a Feature Workflow

```bash
npm run dev                    # Start server
# Implement feature
# Test manually (click around)
# Check console for errors
# Test mobile view
npm run build                  # Final verification
```

---

**More Details:**
- Full testing guide: [TESTING.md](../TESTING.md)
- Update instructions: [UPDATING.md](../UPDATING.md)
