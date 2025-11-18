# Production Deployment Checklist

## Before Going Live

### 1. Domain Configuration
Update the following files with your actual domain name (replace `YOURDOMAIN.COM`):

- [ ] `index.html` - Update all meta tags (Open Graph, Twitter, canonical URL, structured data)
- [ ] `public/robots.txt` - Update sitemap URL
- [ ] `public/sitemap.xml` - Update all URL entries

### 2. Social Media Images
**CRITICAL:** The current social media images are SVG files incorrectly named as .png

Current files:
- `public/og-image.png` - Actually SVG
- `public/twitter-image.png` - Actually SVG

You need to:
- [ ] Create actual PNG images (1200x630px for Open Graph)
- [ ] Create actual PNG images (1200x600px for Twitter)
- [ ] Replace the existing files with proper PNG format
- [ ] Test on Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- [ ] Test on Twitter Card Validator: https://cards-dev.twitter.com/validator

### 3. Google Analytics
- [ ] Create Google Analytics 4 property
- [ ] Add measurement ID to `.env` file: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
- [ ] Verify tracking is working in GA4 dashboard

### 4. Google AdSense (Optional)
- [ ] Apply for Google AdSense account
- [ ] Get approved
- [ ] Add client ID to `.env` file: `VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXX`
- [ ] Create ad units in AdSense dashboard
- [ ] Update ad slot IDs in your components

### 5. Environment Variables
Ensure all required environment variables are set:

Frontend (.env):
- [ ] `VITE_SUPABASE_URL` - Already configured
- [ ] `VITE_SUPABASE_ANON_KEY` - Already configured
- [ ] `VITE_GA_MEASUREMENT_ID` - Add when ready
- [ ] `VITE_ADSENSE_CLIENT_ID` - Add when ready
- [ ] `VITE_SENTRY_DSN` - Optional, for error tracking

Supabase Edge Functions (set in Supabase Dashboard):
- [ ] `OPENAI_API_KEY` - Required for AI features
- [ ] `UPSTASH_REDIS_REST_URL` - Optional, for better rate limiting
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Optional, for better rate limiting

### 6. Rate Limiting (Recommended)
To prevent API abuse and control OpenAI costs:

- [ ] Sign up for Upstash Redis: https://upstash.com/
- [ ] Create a Redis database
- [ ] Add credentials to Supabase Edge Functions secrets
- [ ] Current limits: 10 req/min for challenge creation, 20 req/min for hints

Without Redis, rate limiting uses in-memory storage (resets on function restart).

### 7. Database & Edge Functions
- [ ] All migrations applied
- [ ] All edge functions deployed
- [ ] RLS policies tested
- [ ] Daily challenge cron job verified (runs at midnight UTC)

### 8. Testing Checklist
- [ ] Test daily challenge flow
- [ ] Test custom challenge creation
- [ ] Test sharing functionality
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Verify analytics tracking
- [ ] Test rate limiting (try rapid requests)
- [ ] Check error handling (network failures, timeouts)

### 9. Performance Optimization
Already implemented:
- ✅ Request timeouts (prevents hanging)
- ✅ Rate limiting on AI functions (prevents bill explosion)
- ✅ Silent analytics failures (doesn't break UX)
- ✅ Debounce utilities (prevents double-clicks)
- ✅ Database indexes on analytics tables

### 10. SEO & Social
- [ ] Submit sitemap to Google Search Console
- [ ] Verify robots.txt is accessible
- [ ] Test structured data with Google's Rich Results Test
- [ ] Share a test post on social media to verify OG images work

## Post-Launch Monitoring

### Week 1
- [ ] Monitor Supabase usage (database, edge functions)
- [ ] Check OpenAI API costs
- [ ] Review error logs in Sentry (if configured)
- [ ] Monitor rate limit hits
- [ ] Check analytics for user behavior

### Ongoing
- [ ] Review daily challenge quality
- [ ] Monitor server costs
- [ ] Check for abuse patterns
- [ ] Update content moderation as needed

## Known Limitations
1. **Rate limiting without Redis:** In-memory only, resets on function restart
2. **OpenAI costs:** Monitor usage, each challenge creation = 2-3 API calls
3. **Social images:** Must be real PNGs for proper preview on social platforms

## Support Resources
- Supabase Dashboard: https://app.supabase.com
- OpenAI Usage: https://platform.openai.com/usage
- Upstash Console: https://console.upstash.com
- Google Analytics: https://analytics.google.com
