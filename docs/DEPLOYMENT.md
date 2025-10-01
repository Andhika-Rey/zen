# 🚀 Deployment Guide - Zenotika

## 📋 Pre-Deployment Checklist

### 1. Content & Configuration
- [ ] Update `data/announcements.json` dengan pengumuman terbaru
- [ ] Update `data/community.json` dengan proyek terbaru
- [ ] Verifikasi semua link internal berfungsi
- [ ] Test pada berbagai devices & browsers

### 2. Performance
- [ ] Run Lighthouse audit (target: 90+ score)
- [ ] Verify Service Worker berfungsi (offline mode)
- [ ] Check load time < 3s pada 3G connection
- [ ] Optimize images (WebP format recommended)

### 3. SEO & Meta
- [ ] Verify `sitemap.xml` mencakup semua pages
- [ ] Check `robots.txt` configuration
- [ ] Validate Open Graph meta tags
- [ ] Test share preview (WhatsApp, Twitter, Facebook)

### 4. Accessibility
- [ ] Keyboard navigation works properly
- [ ] Screen reader compatibility (NVDA/JAWS)
- [ ] Color contrast meets WCAG AA standards
- [ ] All images have alt text

---

## 🌐 Deployment Options

### Option 1: GitHub Pages (Recommended)

**Pros:**
- ✅ Gratis & unlimited bandwidth
- ✅ SSL/HTTPS otomatis
- ✅ Custom domain support
- ✅ Terintegrasi dengan GitHub workflow

**Setup:**
```bash
# 1. Push ke GitHub
git add .
git commit -m "Deploy Zenotika"
git push origin main

# 2. Enable GitHub Pages
# Go to: Settings > Pages > Source: main branch
```

**Custom Domain:**
```bash
# 1. Buat file CNAME
echo "zenotika.unikom.ac.id" > CNAME

# 2. Update DNS records di domain provider
# Type: CNAME
# Name: zenotika (atau subdomain sesuai kebijakan UNIKOM)
# Value: username.github.io

# Catatan: karena ini subdomain kampus, koordinasikan dengan tim TI UNIKOM
# untuk menambahkan record CNAME atau membuat delegasi subdomain.
```

**GitHub Actions (Auto Deploy):**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

### Option 2: Netlify

**Pros:**
- ✅ Deploy preview untuk setiap PR
- ✅ Serverless functions support
- ✅ Form handling built-in
- ✅ Split testing capabilities

**Setup:**
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Initialize
netlify init

# 4. Deploy
netlify deploy --prod
```

**netlify.toml** (sudah ada di project):
```toml
[build]
  publish = "."
  command = "echo 'No build needed - static site'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: Vercel

**Pros:**
- ✅ Zero-config deployment
- ✅ Edge network for speed
- ✅ Analytics built-in
- ✅ Excellent DX

**Setup:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Deploy to production
vercel --prod
```

**vercel.json:**
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🔄 CI/CD Workflow

### Automated Deployment Process:

```
1. Developer pushes to `main` branch
   ↓
2. GitHub Actions triggers
   ↓
3. Run tests & build (if needed)
   ↓
4. Deploy to staging (optional)
   ↓
5. Run smoke tests
   ↓
6. Deploy to production
   ↓
7. Notify team (Slack/Discord)
```

### Example: Full CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://zenotika-staging.netlify.app
          uploadArtifacts: true

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        run: |
          # Your deployment script
          echo "Deploying to production..."
```

---

## 📊 Post-Deployment Monitoring

### 1. Analytics Setup

**Google Analytics 4:**
```html
<!-- Add to <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Umami (Privacy-friendly alternative):**
```html
<script async defer data-website-id="xxx" src="https://umami.is/script.js"></script>
```

### 2. Error Tracking

**Sentry (Optional):**
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "your-dsn",
  tracesSampleRate: 1.0,
});
```

### 3. Uptime Monitoring

**Tools:**
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 🔐 Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Security headers configured
- [ ] Content Security Policy (CSP) implemented
- [ ] Input validation for all forms
- [ ] XSS protection enabled
- [ ] No sensitive data in client-side code
- [ ] API keys stored in environment variables

### Security Headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

---

## 🎯 Rollback Strategy

### Manual Rollback (GitHub Pages):
```bash
# 1. Identify last working commit
git log --oneline

# 2. Revert to that commit
git revert <commit-hash>

# 3. Push
git push origin main
```

### Automated Rollback (Netlify/Vercel):
```bash
# Netlify
netlify rollback

# Vercel
vercel rollback
```

---

## 📱 PWA Distribution

### Android (TWA - Trusted Web Activity):
1. Use Bubblewrap: https://github.com/GoogleChromeLabs/bubblewrap
2. Generate APK/AAB
3. Publish to Google Play Store

### iOS (Add to Home Screen):
- Users can manually add via Safari share menu
- Icon & splash screen dari `manifest.json`

---

## 📝 Maintenance Schedule

### Daily:
- Monitor error logs
- Check uptime status

### Weekly:
- Review analytics
- Update content (announcements, community projects)
- Check for broken links

### Monthly:
- Security updates
- Performance audit
- Dependency updates
- Backup data

---

## 🆘 Troubleshooting

### Issue: Service Worker not updating
```javascript
// Force update in console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  window.location.reload();
});
```

### Issue: CSS/JS not loading
- Clear browser cache
- Check file paths (case-sensitive)
- Verify CORS headers

### Issue: Images not loading
- Check file formats supported
- Verify file permissions
- Check CDN configuration

---

## 📞 Support & Resources

- **Documentation**: `/docs` folder
- **Issues**: GitHub Issues
- **Community**: Create Discord/Telegram group
- **Updates**: Follow deployment log in `CHANGELOG.md`

---

**Last Updated**: October 2025
