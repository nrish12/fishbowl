# Domain Setup Guide for mystle.app

## Overview
You own: **mystle.app** (on Porkbun)
Your app needs: **HTTPS** (required for all .app domains)

## Step 1: Choose Your Hosting Provider

Since you're already using Supabase for the backend, I recommend **Vercel** or **Netlify** for hosting the frontend. Both provide:
- ✅ Free tier
- ✅ Automatic HTTPS/SSL
- ✅ Easy custom domain setup
- ✅ Automatic deployments from Git
- ✅ Built-in CDN

### Option A: Vercel (Recommended)

1. **Sign up at https://vercel.com**
   - Use GitHub/GitLab to sign in

2. **Deploy your project**
   - Connect your GitHub repository (if you have one)
   - OR upload your project files
   - Build command: `npm run build`
   - Output directory: `dist`
   - Framework preset: Vite

3. **Your app will get a temporary URL like**: `your-project.vercel.app`

### Option B: Netlify

1. **Sign up at https://netlify.com**
   - Use GitHub/GitLab to sign in

2. **Deploy your project**
   - Connect your repository or drag & drop the `dist` folder
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Your app will get a temporary URL like**: `your-project.netlify.app`

---

## Step 2: Get DNS Records from Your Hosting Provider

### If using Vercel:
1. Go to your project settings
2. Click "Domains"
3. Click "Add Domain"
4. Enter: `mystle.app`
5. Vercel will show you the DNS records you need to add

**Typical Vercel DNS records:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### If using Netlify:
1. Go to "Domain settings"
2. Click "Add custom domain"
3. Enter: `mystle.app`
4. Netlify will show you the DNS records

**Typical Netlify DNS records:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

---

## Step 3: Configure DNS in Porkbun

1. **Login to Porkbun**: https://porkbun.com/account/login

2. **Go to your domain**: Click on "mystle.app"

3. **Click "DNS Records"**

4. **Add the A Record**:
   - Type: `A`
   - Host: `@` (or leave blank)
   - Answer: `[IP from your hosting provider]`
   - TTL: `600` (10 minutes)

5. **Add the CNAME Record for www**:
   - Type: `CNAME`
   - Host: `www`
   - Answer: `[CNAME from your hosting provider]`
   - TTL: `600`

6. **Optional - Add CNAME for apex domain** (if your host requires it):
   - Some hosts use CNAME for everything
   - Follow their specific instructions

7. **Save all changes**

---

## Step 4: Wait for DNS Propagation

- **Typical time**: 5-30 minutes
- **Maximum time**: 48 hours (rarely takes this long)
- **Check propagation**: https://www.whatsmydns.net/#A/mystle.app

---

## Step 5: Enable HTTPS in Your Hosting Provider

### Vercel:
- ✅ Automatic! SSL certificate is issued automatically
- Vercel uses Let's Encrypt
- HTTPS will be enabled within minutes of DNS pointing correctly

### Netlify:
- ✅ Automatic! SSL certificate is issued automatically
- Netlify also uses Let's Encrypt
- HTTPS will be enabled once DNS propagates

---

## Step 6: Verify Everything Works

1. **Test HTTP redirect**:
   - Visit: `http://mystle.app`
   - Should redirect to: `https://mystle.app` ✅

2. **Test www redirect**:
   - Visit: `https://www.mystle.app`
   - Should redirect to: `https://mystle.app` ✅

3. **Check SSL certificate**:
   - Click the padlock icon in browser
   - Should show "Connection is secure" ✅

4. **Test SSL Labs**:
   - Visit: https://www.ssllabs.com/ssltest/analyze.html?d=mystle.app
   - Should get an A or A+ rating

---

## Alternative: Supabase Hosting (If Available)

Supabase recently added hosting capabilities. If you want everything in one place:

1. Check if your Supabase project has hosting enabled
2. Deploy using the Supabase CLI
3. Configure custom domain in Supabase dashboard

---

## Troubleshooting

### "DNS_PROBE_FINISHED_NXDOMAIN"
- DNS records not propagated yet
- Wait longer or check DNS records are correct

### "Your connection is not private"
- SSL certificate not issued yet
- Wait 5-10 minutes after DNS propagates
- Hosting provider will auto-issue certificate

### "This site can't be reached"
- DNS records incorrect
- Check A record points to correct IP
- Check CNAME record points to correct host

### .app domain specific issues
- ✅ All .app domains REQUIRE HTTPS by Google
- ✅ This is enforced at the browser level
- ✅ HTTP will not work at all
- ✅ Your hosting provider handles this automatically

---

## After Domain is Live

1. **Update Google Search Console**:
   - Add property for https://mystle.app
   - Submit sitemap: https://mystle.app/sitemap.xml

2. **Update any external links**:
   - Social media profiles
   - Email signatures
   - Documentation

3. **Monitor your site**:
   - Check analytics
   - Test all functionality
   - Verify social media sharing works

---

## Quick Summary

1. ✅ Domain references updated to mystle.app in code
2. ⏳ Choose hosting (Vercel/Netlify recommended)
3. ⏳ Deploy your app to hosting
4. ⏳ Get DNS records from hosting provider
5. ⏳ Add DNS records in Porkbun
6. ⏳ Wait for DNS propagation (5-30 mins)
7. ⏳ HTTPS certificate auto-issued
8. ✅ Visit https://mystle.app and celebrate!

**Need help with any step? Let me know which hosting provider you choose!**
