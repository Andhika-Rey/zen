# Analytics Setup Guide - Zenotika 2025

Complete guide for Google Analytics 4 (GA4) integration with privacy-first approach.

## 📊 Overview

Zenotika uses Google Analytics 4 (GA4) to understand user behavior and improve the platform. Our implementation is:

- **Privacy-First**: GDPR/CCPA compliant with consent management
- **Opt-In**: Analytics only run after user consent
- **Transparent**: Clear cookie banner explaining data usage
- **Minimal**: Only essential metrics tracked
- **Secure**: IP anonymization enabled by default

## 🚀 Quick Setup

### Step 1: Get GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property (or use existing)
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)

### Step 2: Configure Measurement ID

Edit `src/analytics.js` and replace the placeholder:

```javascript
const CONFIG = {
  measurementId: 'G-XXXXXXXXXX', // Replace with your actual GA4 ID
  enabled: true,
  // ... other settings
};
```

### Step 3: Build and Deploy

```bash
npm run build
cd dist && python -m http.server 8080
```

That's it! Analytics will start tracking once users give consent.

## 📈 What Gets Tracked

### Automatic Events

1. **Page Views**
   - URL path
   - Page title
   - Referrer

2. **User Interactions**
   - Outbound link clicks
   - File downloads (PDF, ZIP, etc.)
   - Email link clicks
   - Phone link clicks
   - Form submissions

3. **Core Web Vitals**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
   - Page load time
   - Connection time
   - Render time

4. **Errors**
   - JavaScript errors
   - Unhandled promise rejections

### Custom Events

**Feature Usage Tracking:**
```javascript
// Command Palette usage
analytics.trackFeature('command_palette', 'opened');
analytics.trackFeature('command_palette', 'search', { query: 'pemrograman' });

// Toast notifications
analytics.trackFeature('toast', 'shown', { type: 'success' });

// Advanced Search
analytics.trackFeature('search', 'performed', { results: 10 });
```

**Search Tracking:**
```javascript
analytics.trackSearch('struktur data', 8); // query, results count
```

**Custom Interactions:**
```javascript
analytics.trackInteraction('click', 'button', 'download-material');
```

## 🔒 Privacy & Consent

### Cookie Consent Banner

Users see a consent banner on first visit:
- **Accept All**: Enable analytics tracking
- **Essential Only**: Disable analytics, only session cookies

Consent is stored in `localStorage`:
```javascript
{
  "analytics": true,  // User accepted analytics
  "decided": true     // User made a choice (don't show banner again)
}
```

### User Rights

Users can revoke consent anytime:
```javascript
// In browser console
zenotika.analytics.revokeConsent();
```

Check consent status:
```javascript
zenotika.analytics.hasConsent(); // true or false
```

### Data Collection

**What we collect:**
- Page views and navigation paths
- Feature usage (anonymous)
- Performance metrics
- Error logs (no personal data)

**What we DON'T collect:**
- Personal identifiable information (PII)
- Form field values
- Passwords or sensitive data
- IP addresses (anonymized)

### GDPR Compliance

✅ Opt-in consent required
✅ Clear privacy notice
✅ Easy consent withdrawal
✅ IP anonymization
✅ Data retention controls
✅ Cookie transparency

## ⚙️ Configuration Options

Edit `src/analytics.js` CONFIG object:

```javascript
const CONFIG = {
  // Your GA4 Measurement ID (REQUIRED)
  measurementId: 'G-XXXXXXXXXX',
  
  // Enable/disable analytics globally
  enabled: true,
  
  // Debug mode (logs events to console)
  debug: false, // Set to true for development
  
  // Anonymize IP addresses (GDPR compliance)
  anonymizeIp: true,
  
  // Respect browser Do Not Track setting
  respectDoNotTrack: true,
  
  // Cookie settings
  cookieFlags: 'SameSite=Strict;Secure',
  cookieExpires: 63072000, // 2 years in seconds
};
```

## 📊 GA4 Dashboard Setup

### Recommended Reports

1. **Engagement Overview**
   - Active users
   - Sessions
   - Engagement time
   - Top pages

2. **Feature Usage**
   - Custom event: `feature_usage`
   - Breakdown by `feature_name`
   - Top actions per feature

3. **Search Analytics**
   - Custom event: `search`
   - Top search terms
   - Results count distribution

4. **Performance**
   - Custom event: `timing_complete`
   - Web Vitals metrics (LCP, FID, CLS)
   - Page load times

### Custom Dimensions

Create these in GA4 Admin:

1. `feature_name` (Event-scoped)
2. `feature_action` (Event-scoped)
3. `timing_category` (Event-scoped)
4. `timing_name` (Event-scoped)

### Recommended Goals

1. Form submissions
2. Material page views
3. Search performed
4. Command Palette usage

## 🛠️ Advanced Usage

### Track Custom Events

```javascript
import analytics from './src/analytics.js';

// Track custom event
analytics.trackEvent('video_play', {
  video_title: 'Intro to Algorithms',
  video_duration: 300,
});

// Track timing
analytics.trackTiming('Search', 'Query Time', 245); // ms

// Track error
analytics.trackException('Failed to load data', false);

// Set user properties
analytics.setUserProperties({
  user_role: 'student',
  department: 'computer_science',
});
```

### Integrate with Features

**Command Palette:**
```javascript
// In command-palette.js
import analytics from './src/analytics.js';

function openPalette() {
  palette.open();
  analytics.trackFeature('command_palette', 'opened');
}

function executeCommand(command) {
  // Execute command...
  analytics.trackFeature('command_palette', 'command_executed', {
    command_name: command.name,
  });
}
```

**Search Modal:**
```javascript
// In search-modal.js
import analytics from './src/analytics.js';

function handleSearch(query) {
  const results = searchEngine.search(query);
  analytics.trackSearch(query, results.length);
  
  if (results.length === 0) {
    analytics.trackEvent('search_no_results', { query });
  }
}
```

## 🐛 Debugging

### Enable Debug Mode

```javascript
// src/analytics.js
const CONFIG = {
  debug: true, // Enable debug logging
  // ...
};
```

All events will be logged to console:
```
[Analytics] Event: page_view {page_path: "/", page_title: "Zenotika"}
[Analytics] Event: feature_usage {feature_name: "command_palette", ...}
```

### Test in Development

```bash
# Build and serve locally
npm run build
cd dist && python -m http.server 8080

# Open browser and check:
# 1. Consent banner appears
# 2. Accept consent
# 3. Check Network tab for gtag.js requests
# 4. Open Console and type: zenotika.analytics
```

### Verify GA4 Integration

1. Open GA4 Real-time reports
2. Navigate your site
3. See events appear in real-time
4. Check event parameters

### Common Issues

**Analytics not loading:**
- Check `measurementId` is correct (starts with `G-`)
- Verify consent was given
- Check browser console for errors

**Events not appearing:**
- Ensure debug mode shows events
- Check GA4 property settings
- Verify filters in GA4 aren't blocking events

**Consent banner not showing:**
- Check if consent already given (localStorage)
- Clear localStorage: `localStorage.clear()`
- Reload page

## 📱 Mobile Considerations

All analytics features work on mobile:
- Consent banner responsive
- Touch-friendly buttons
- Efficient tracking (no performance impact)

## 🔐 Security

- No sensitive data tracked
- HTTPS only (Secure cookies)
- SameSite=Strict cookies
- Content Security Policy compatible
- No third-party trackers

## 📚 Resources

- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [gtag.js Reference](https://developers.google.com/analytics/devguides/collection/gtagjs)
- [GDPR Compliance Guide](https://support.google.com/analytics/answer/9019185)
- [Core Web Vitals](https://web.dev/vitals/)

## 🆘 Support

Questions or issues?
- Email: support@zenotika.unikom.ac.id
- GitHub: [Open an issue](https://github.com/Andhika-Rey/zen/issues)
- Discord: [Join community](https://discord.gg/zenotika)

---

**Last Updated:** October 1, 2025  
**Version:** 3.1.0  
**Status:** Phase 2 Complete ✅
