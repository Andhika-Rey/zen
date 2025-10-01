# 🧪 Zenotika 2025 Testing Checklist

**Date:** January 2025  
**Version:** 1.0 (Phase 1 - 2025 UX Polish)  
**Target:** https://andhika-rey.github.io/zen/

---

## 📋 Pre-Testing Setup

- [ ] GitHub Pages deployment is live (HTTP 200)
- [ ] DNS propagation complete (if custom domain)
- [ ] HTTPS certificate active
- [ ] All assets loading correctly

---

## ⌨️ Keyboard Shortcuts Testing

### Shortcut: `/` (Focus Search)
- [ ] Press `/` anywhere on the page
- [ ] Search input receives focus instantly
- [ ] Typing works immediately
- [ ] Doesn't trigger when in form fields
- [ ] Works with modifier keys (Ctrl+/)

### Shortcut: `t` (Toggle Theme)
- [ ] Press `t` to switch themes
- [ ] Dark mode activates smoothly
- [ ] Light mode restores correctly
- [ ] Theme persists on page reload
- [ ] Doesn't trigger when typing in forms

### Shortcut: `?` (Open Shortcuts Modal)
- [ ] Press `?` to open modal
- [ ] Modal displays all shortcuts
- [ ] Overlay darkens background
- [ ] Focus trapped within modal
- [ ] Doesn't trigger when in text areas

### Shortcut: `Esc` (Close Modal)
- [ ] `Esc` closes shortcuts modal
- [ ] Focus returns to previous element
- [ ] Works from any modal state
- [ ] Doesn't interfere with browser defaults

### Edge Cases
- [ ] Shortcuts work on all pages (home, materials, contact)
- [ ] No conflicts with browser shortcuts
- [ ] Screen readers announce state changes
- [ ] Works on non-US keyboard layouts

---

## ✅ Form Validation Testing

### Real-time Validation
Navigate to **Kontak** page and test the contact form:

#### Name Field
- [ ] Empty name shows error on blur
- [ ] Error message: "Nama harus diisi"
- [ ] Red error text appears below field
- [ ] Field border turns red
- [ ] `aria-invalid="true"` set
- [ ] Valid name clears error instantly

#### Email Field
- [ ] Empty email shows error
- [ ] Invalid format shows error (e.g., "test@")
- [ ] Non-UNIKOM email shows error (e.g., "test@gmail.com")
- [ ] Valid UNIKOM email passes (e.g., "student@unikom.ac.id")
- [ ] Error message: "Email harus dari domain @unikom.ac.id"
- [ ] Pattern: `^[^@\s]+@unikom\.ac\.id$` enforced
- [ ] Auto-suggest works (autocomplete="email")

#### Message Field
- [ ] Empty message shows error
- [ ] Error message: "Pesan harus diisi"
- [ ] Too short message shows error (<10 chars)
- [ ] Valid message (10+ chars) clears error

#### Form Submission
- [ ] All fields valid → form submits
- [ ] Any field invalid → form blocks submission
- [ ] Focus moves to first invalid field
- [ ] Success message appears after submit
- [ ] Form resets after successful submit

### Accessibility
- [ ] Errors announced to screen readers
- [ ] `aria-describedby` links to error messages
- [ ] Tab order logical (name → email → message → submit)
- [ ] High contrast error colors (WCAG AA)

---

## 💀 Skeleton Loading Testing

### Initial Load
- [ ] Navigate to **Beranda**
- [ ] Events section shows skeleton placeholders
- [ ] 3 skeleton cards visible
- [ ] Shimmer animation plays smoothly
- [ ] `aria-busy="true"` set during loading
- [ ] Skeleton matches actual card dimensions (no CLS)

### Loading Complete
- [ ] Real events replace skeletons after ~2s
- [ ] Transition is smooth (fade-in)
- [ ] `aria-busy="false"` set after load
- [ ] No layout shift (CLS = 0)
- [ ] Cards align perfectly with skeletons

### Slow Network
- [ ] Throttle to 3G in DevTools
- [ ] Skeletons appear immediately
- [ ] Users see structure while waiting
- [ ] No blank white screen
- [ ] Loading indicators show progress

---

## 🔍 Search Experience Testing

### Search Input
- [ ] Navigate to any page
- [ ] Locate search bar in header
- [ ] Input has label: "Cari"
- [ ] Placeholder: "Cari materi..."
- [ ] Hint visible: "/ untuk fokus pencarian"
- [ ] Hint styled with keyboard key (`.kbd`)

### Search Functionality
- [ ] Type query in search box
- [ ] Autocomplete OFF (no browser suggestions)
- [ ] Spellcheck OFF (technical terms)
- [ ] Press Enter → navigates to results
- [ ] Press `/` → focuses search instantly
- [ ] Clear button appears when typing
- [ ] Recent searches suggested (if implemented)

### Mobile
- [ ] Search bar responsive on small screens
- [ ] Keyboard opens with correct type (search)
- [ ] Search button large enough (44x44px)
- [ ] No zoom on focus (viewport configured)

---

## 🌐 Noscript Support Testing

### JavaScript Disabled
1. Open Chrome DevTools → Settings → Debugger → Disable JavaScript
2. Refresh page

- [ ] Yellow banner appears at top
- [ ] Banner message: "Situs ini membutuhkan JavaScript..."
- [ ] Banner styled with warning colors
- [ ] Banner accessible (ARIA role="alert")
- [ ] Critical content still visible (text, images)
- [ ] Forms still render (even if non-functional)
- [ ] Navigation menu accessible
- [ ] No blank page or broken layout

### Re-enable JavaScript
- [ ] Banner disappears
- [ ] All features work again
- [ ] No console errors
- [ ] Smooth recovery

---

## 📱 Responsive Design Testing

### Mobile (320px - 480px)
- [ ] Layout stacks vertically
- [ ] Text readable (min 16px)
- [ ] Buttons touch-friendly (44x44px)
- [ ] Keyboard shortcuts hint hidden on mobile
- [ ] Modal fills screen on small devices
- [ ] Form inputs full width
- [ ] No horizontal scroll

### Tablet (481px - 768px)
- [ ] 2-column grid for materials
- [ ] Sidebar collapsible
- [ ] Touch targets 48x48px
- [ ] Landscape mode optimized

### Desktop (769px+)
- [ ] 3-column grid for materials
- [ ] Sidebar fixed/sticky
- [ ] Keyboard shortcuts visible
- [ ] Hover states work
- [ ] Focus indicators clear

---

## 🎨 Theme Testing

### Dark Mode
- [ ] Press `t` or click theme toggle
- [ ] Background dark (#1a1a1a)
- [ ] Text light (#f5f5f5)
- [ ] Contrast ratio WCAG AAA (7:1+)
- [ ] Links visible in dark mode
- [ ] Form inputs styled correctly
- [ ] Modal readable

### Light Mode
- [ ] Press `t` again
- [ ] Background light (#ffffff)
- [ ] Text dark (#333333)
- [ ] All elements visible
- [ ] No contrast issues

### System Preference
- [ ] Check if respects OS theme on first visit
- [ ] User choice overrides system preference
- [ ] Choice persists in localStorage

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus order logical
- [ ] Focus indicators visible (outline)
- [ ] No keyboard traps
- [ ] Skip to main content link present
- [ ] All features keyboard-accessible

### Screen Reader Testing (NVDA/JAWS)
- [ ] Page title announced
- [ ] Headings read in order (h1 → h2 → h3)
- [ ] Form labels announced
- [ ] Error messages read aloud
- [ ] Button purposes clear
- [ ] Landmark regions identified
- [ ] `aria-live` regions work

### Color Contrast
- [ ] All text meets WCAG AA (4.5:1)
- [ ] Large text meets AAA (3:1)
- [ ] UI elements contrast 3:1
- [ ] Links distinguishable from text

### Motion
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Skeleton shimmer disables if needed
- [ ] Modal transitions smooth but not jarring

---

## 🚀 Performance Testing

### Lighthouse Audit
Run from Chrome DevTools → Lighthouse → Analyze page load

**Targets:**
- [ ] Performance: ≥95/100
- [ ] Accessibility: 100/100
- [ ] Best Practices: 100/100
- [ ] SEO: 100/100

**Core Web Vitals:**
- [ ] LCP (Largest Contentful Paint): <2.5s
- [ ] FID (First Input Delay): <100ms
- [ ] CLS (Cumulative Layout Shift): <0.1

### Network Testing
Throttle to **Fast 3G** in DevTools:

- [ ] Page loads in <5s
- [ ] Skeleton loaders appear immediately
- [ ] Critical CSS inlined
- [ ] JavaScript deferred
- [ ] Images lazy-loaded

### Bundle Size
Check in DevTools → Network tab:

- [ ] CSS: ~28KB (gzipped)
- [ ] JS: ~19KB (gzipped)
- [ ] Total JS+CSS: <50KB
- [ ] No unused code (Coverage tool)

---

## 🔒 Security Testing

### HTTPS
- [ ] All pages served over HTTPS
- [ ] No mixed content warnings
- [ ] Certificate valid
- [ ] Secure headers present (CSP, X-Frame-Options)

### Form Security
- [ ] Email pattern prevents XSS
- [ ] Name field sanitized
- [ ] No SQL injection risk (client-side only)
- [ ] CSRF protection (if backend added)

### Dependencies
- [ ] No known vulnerabilities (`npm audit`)
- [ ] All libraries up to date
- [ ] No unused dependencies

---

## 🌍 Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)
- [ ] Samsung Internet
- [ ] Firefox Android

### Features to Check
- [ ] CSS Grid layout
- [ ] Flexbox
- [ ] CSS Custom Properties (variables)
- [ ] ES6+ JavaScript (arrow functions, const/let)
- [ ] Fetch API
- [ ] Service Worker (if applicable)

---

## 📊 Analytics Testing (If Implemented)

### Event Tracking
- [ ] Pageview fires on load
- [ ] Keyboard shortcuts tracked
- [ ] Form submissions logged
- [ ] Theme toggles counted
- [ ] Search queries recorded

### Privacy
- [ ] Cookie consent banner present
- [ ] Opt-out mechanism works
- [ ] No PII collected
- [ ] IP addresses anonymized

---

## 🐛 Bug Reporting Template

If you find issues, report them with:

```markdown
**Title:** [Short description]

**Steps to Reproduce:**
1. Navigate to [page]
2. Click/type [action]
3. Observe [behavior]

**Expected:** [What should happen]
**Actual:** [What actually happens]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen size: 1920x1080
- Network: Fast 3G

**Screenshots:** [Attach if relevant]
**Console Errors:** [Paste from DevTools]
```

---

## ✅ Final Checklist

Before marking as DONE:

- [ ] All critical tests pass
- [ ] No console errors
- [ ] No 404s in Network tab
- [ ] Lighthouse score ≥95
- [ ] Accessibility audit clean
- [ ] Forms submit successfully
- [ ] All shortcuts work
- [ ] Mobile experience excellent
- [ ] Dark mode perfect
- [ ] Fast on slow networks

**Tested by:** _________________  
**Date:** _________________  
**Sign-off:** _________________

---

## 🎉 Success Criteria

This release is production-ready when:

✅ All keyboard shortcuts work flawlessly  
✅ Form validation prevents all invalid submissions  
✅ Skeleton loading eliminates layout shifts  
✅ Noscript users see graceful degradation  
✅ Lighthouse Performance >95  
✅ Lighthouse Accessibility = 100  
✅ Zero console errors  
✅ Mobile experience as good as desktop  
✅ All browsers supported  
✅ User feedback positive (NPS >50)

**Congratulations! The 2025 transformation is complete! 🚀**
