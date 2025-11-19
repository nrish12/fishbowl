# Vercel Deployment Checklist for mystle.app

## Critical: Environment Variables Must Be Set

Your mystle.app website is failing because **environment variables are not configured in Vercel**.

### Step 1: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (mystle.app)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

#### Required Variables

```
VITE_SUPABASE_URL=https://gopbvdtgionfrlquvaqq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcGJ2ZHRnaW9uZnJscXV2YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjI0NTgsImV4cCI6MjA3NzgzODQ1OH0.K2fFbKKZHWtbHIJgQySa700506nZL2P5obzhE00VZI8
```

#### Optional Variables (if you have them configured)

```
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GA_MEASUREMENT_ID=your_ga_id
VITE_ADSENSE_CLIENT_ID=your_adsense_id
```

**IMPORTANT:** Make sure to apply these to **all environments** (Production, Preview, Development)

### Step 2: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Select **Redeploy**
4. Check "Use existing Build Cache" (optional)
5. Click **Redeploy**

OR simply push a new commit to trigger a deployment.

### Step 3: Verify Deployment

After redeployment:

1. Visit `https://mystle.app` - should load the homepage
2. Try creating a custom challenge
3. Click the generated short URL
4. It should redirect to `/play` and load the challenge

### Troubleshooting

If short URLs still don't work:

1. Open browser console (F12) on mystle.app
2. Visit a short URL like `https://mystle.app/s/6Nmetn`
3. Check console logs for errors
4. Verify the logs show your Supabase URL

### Why This Happens

- **Locally:** Environment variables are loaded from `.env` file
- **On Vercel:** Environment variables must be set in Vercel's dashboard
- **Without them:** The app can't connect to Supabase, so short URLs fail

### Current Status

- ✅ Edge functions are deployed and working
- ✅ Database tables exist
- ✅ Short URL redirect code is correct
- ❌ Vercel environment variables not set (THIS IS THE ISSUE)

Once you add the environment variables and redeploy, everything will work!
