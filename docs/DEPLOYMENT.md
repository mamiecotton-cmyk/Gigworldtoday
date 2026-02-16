# Deployment Guide - Gig World Today

Complete guide to deploying Gig World Today to production using Vercel.

## Overview

This guide covers deploying the Next.js application to Vercel with the custom domain gigworldtoday.com. Vercel is the recommended platform as it's built by the Next.js team and provides the best performance and developer experience.

## Prerequisites

- GitHub account with access to the repository
- Vercel account (free tier is sufficient to start)
- Domain name: gigworldtoday.com
- (Optional) Supabase account for database

## Vercel Deployment

### Step 1: Connect Repository to Vercel

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or log in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose `mamiecotton-cmyk/Gigworldtoday`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Click "Deploy"**
   - Vercel will automatically build and deploy
   - Initial deployment takes 2-3 minutes
   - You'll get a temporary URL: `gigworldtoday.vercel.app`

### Step 2: Configure Environment Variables

1. **Navigate to Project Settings**
   - Go to your project dashboard
   - Click "Settings"
   - Select "Environment Variables"

2. **Add Required Variables**

   For basic deployment (JSON data only):
   ```
   NEXT_PUBLIC_SITE_URL=https://gigworldtoday.com
   ```

   For database integration (optional):
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://gigworldtoday.com
   ```

3. **Apply to Environments**
   - Check: Production, Preview, Development
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Select "Redeploy"

### Step 3: Connect Custom Domain

1. **Add Domain**
   - Go to project "Settings"
   - Click "Domains"
   - Enter: `gigworldtoday.com`
   - Click "Add"

2. **Add WWW Subdomain**
   - Click "Add Domain" again
   - Enter: `www.gigworldtoday.com`
   - Click "Add"
   - Vercel will automatically redirect www to root

3. **Configure DNS**
   
   In your domain registrar (GoDaddy, Namecheap, etc.):

   **For Root Domain (gigworldtoday.com):**
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`
   
   **For WWW:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

   **Alternative (using CNAME for root):**
   If your registrar supports ANAME/ALIAS records:
   - Type: `CNAME` or `ALIAS`
   - Name: `@`
   - Value: `cname.vercel-dns.com`

4. **Wait for DNS Propagation**
   - Usually takes 1-2 hours
   - Can take up to 48 hours
   - Check status in Vercel dashboard

5. **Enable HTTPS**
   - Vercel automatically provisions SSL certificate
   - HTTPS is enforced by default
   - Certificate auto-renews

### Step 4: Verify Deployment

1. **Test the Site**
   - Visit https://gigworldtoday.com
   - Check all pages load correctly:
     - Homepage: `/`
     - Platforms: `/platforms`
     - Platform details: `/platforms/doordash`

2. **Check Mobile Responsiveness**
   - Use browser dev tools
   - Test on actual devices

3. **Verify SEO**
   - View page source
   - Confirm meta tags are present
   - Check Open Graph tags

## Database Deployment (Supabase)

If using PostgreSQL database:

### Step 1: Set Up Supabase Project

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization
   - Enter project details
   - Select region (choose closest to users)
   - Set database password (save this!)

2. **Run Schema**
   - Navigate to SQL Editor
   - Copy `database/schema.sql`
   - Paste and run

3. **Load Seed Data**
   - Copy `database/seed.sql`
   - Paste and run in SQL Editor

### Step 2: Connect to Vercel

1. **Get Credentials**
   - Project Settings → API
   - Copy Project URL
   - Copy anon/public key

2. **Add to Vercel**
   - Vercel Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Save and redeploy

### Step 3: Enable Row Level Security (Optional)

Supabase tables are publicly readable by default. To restrict access:

```sql
-- Enable RLS on platforms table
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" 
ON platforms FOR SELECT 
TO public 
USING (true);

-- Repeat for categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON categories FOR SELECT 
TO public 
USING (true);
```

## Automatic Deployments

### GitHub Integration

Vercel automatically deploys when you push to GitHub:

- **Main Branch** → Production deployment
- **Other Branches** → Preview deployments
- **Pull Requests** → Preview deployments with unique URLs

### Deployment Workflow

```
1. Push code to GitHub
   ↓
2. Vercel detects change
   ↓
3. Runs build command
   ↓
4. Deploys to global CDN
   ↓
5. Live in 30-60 seconds
```

## Performance Optimization

### Next.js Configuration

Already configured in `next.config.js`:
- Image optimization
- Automatic code splitting
- Static generation for platform pages

### Caching

Vercel automatically handles:
- Static asset caching
- CDN distribution
- Image optimization

### Monitoring

1. **Vercel Analytics**
   - Enable in project settings
   - Track page views and Web Vitals
   - Free tier: 100k page views/month

2. **Speed Insights**
   - Real User Monitoring (RUM)
   - Core Web Vitals tracking
   - Performance scores

## Environment-Specific Configuration

### Development
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Preview (Vercel)
```
NEXT_PUBLIC_SITE_URL=https://gigworldtoday-git-branch-name.vercel.app
```

### Production
```
NEXT_PUBLIC_SITE_URL=https://gigworldtoday.com
```

## Troubleshooting

### Build Failures

1. **Check Build Logs**
   - Vercel Dashboard → Deployments
   - Click on failed deployment
   - Review build logs

2. **Common Issues**
   - Missing environment variables
   - TypeScript errors
   - Import path issues
   - Missing dependencies

3. **Fix and Redeploy**
   - Fix issues locally
   - Test with `npm run build`
   - Push to GitHub

### Domain Not Working

1. **Check DNS Settings**
   - Use [dnschecker.org](https://dnschecker.org)
   - Verify A record points to Vercel IP
   - Confirm CNAME for www

2. **Check Vercel Status**
   - Vercel Dashboard → Domains
   - Should show "Valid Configuration"
   - SSL should show "Active"

3. **Clear DNS Cache**
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```

### Slow Performance

1. **Check Vercel Analytics**
   - Identify slow pages
   - Review build output

2. **Optimize Images**
   - Use Next.js Image component
   - Serve images from CDN
   - Use appropriate formats (WebP)

3. **Review Database Queries**
   - Check query performance
   - Add database indexes
   - Use caching when appropriate

## Rollback Deployment

If something goes wrong:

1. **Instant Rollback**
   - Vercel Dashboard → Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Git Revert**
   - Revert commit in Git
   - Push to GitHub
   - Vercel auto-deploys

## Custom Build Settings

### Build Command Overrides

In `vercel.json` (optional):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Environment-Specific Builds

```json
{
  "build": {
    "env": {
      "NEXT_PUBLIC_SITE_URL": "https://gigworldtoday.com"
    }
  }
}
```

## Monitoring and Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm update
   npm audit fix
   ```

2. **Monitor Performance**
   - Check Vercel Analytics weekly
   - Review Core Web Vitals
   - Monitor error logs

3. **Update Platform Data**
   - Keep platform information current
   - Verify waitlist status
   - Update pay rates

4. **SEO Monitoring**
   - Google Search Console
   - Check indexing status
   - Monitor search performance

## Scaling

Vercel automatically scales based on traffic:

- **Free Tier:** 100GB bandwidth, unlimited requests
- **Pro Tier:** 1TB bandwidth, advanced features
- **Enterprise:** Custom limits

For most gig directory sites, free tier is sufficient initially.

## Alternative Deployment Options

While Vercel is recommended, alternatives include:

### Netlify
- Similar to Vercel
- Good Next.js support
- Easy DNS management

### AWS Amplify
- AWS ecosystem integration
- More complex setup
- Good for AWS users

### Self-Hosted
- VPS (DigitalOcean, Linode)
- Requires more DevOps knowledge
- Use PM2 for process management
- Nginx for reverse proxy

## Next Steps

After successful deployment:

1. **Submit to Search Engines**
   - Google Search Console
   - Bing Webmaster Tools
   - Submit sitemap

2. **Set Up Analytics**
   - Google Analytics
   - Vercel Analytics
   - Track user behavior

3. **Monitor Uptime**
   - UptimeRobot (free)
   - Check domain every 5 minutes
   - Email alerts for downtime

4. **Plan Updates**
   - Regular content updates
   - New platform additions
   - Feature improvements

---

Congratulations! Your site is now live at **gigworldtoday.com** 🎉

For support, check [Vercel Documentation](https://vercel.com/docs) or [Next.js Documentation](https://nextjs.org/docs).
