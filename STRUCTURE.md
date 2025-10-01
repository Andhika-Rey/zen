    # 📁 Zenotika Repository Structure

Complete directory structure and file organization guide.

**Last Updated:** October 1, 2025  
**Version:** 3.1.0

---

## 🌳 Directory Tree

```
zen/
├── 📄 Root Configuration Files
│   ├── package.json              # NPM dependencies and scripts
│   ├── package-lock.json         # Lock file for dependencies
│   ├── .gitignore                # Git ignore rules
│   ├── netlify.toml              # Netlify deployment config
│   ├── manifest.json             # PWA manifest
│   ├── robots.txt                # SEO robots file
│   ├── sitemap.xml               # SEO sitemap
│   └── icon.svg                  # Favicon
│
├── 📄 Root Documentation
│   ├── README.md                 # Main project readme
│   ├── CHANGELOG.md              # Version history
│   ├── QUICK_START.md            # 5-minute quick start guide
│   └── SHOWCASE_2025.md          # Features showcase
│
├── 📂 src/                       # Source code (Phase 2 features)
│   ├── command-palette.js        # Command palette module (487 lines)
│   ├── command-palette.css       # Command palette styles (368 lines)
│   ├── toast.js                  # Toast notification system (336 lines)
│   ├── toast.css                 # Toast styles (296 lines)
│   ├── search-engine.js          # Search engine with lunr.js (369 lines)
│   ├── search-modal.js           # Search modal UI (531 lines)
│   ├── search-modal.css          # Search modal styles (551 lines)
│   ├── analytics.js              # GA4 analytics integration (427 lines)
│   ├── consent-banner.js         # Cookie consent banner (125 lines)
│   └── consent-banner.css        # Consent banner styles (235 lines)
│
├── 📂 scripts/                   # Build and utility scripts
│   ├── build.sh                  # Production build pipeline
│   ├── optimize-images.sh        # Image optimization script
│   └── monitor-deployment.sh     # Deployment monitoring
│
├── 📂 docs/                      # Documentation (organized)
│   ├── README.md                 # Documentation index
│   ├── project-reports/          # Project status reports
│   │   ├── PROJECT_COMPLETE.md
│   │   ├── PHASE_2_FINAL_REPORT.md
│   │   ├── PHASE_2_PROGRESS.md
│   │   └── STATUS_REPORT.md
│   ├── features/                 # Feature documentation
│   │   ├── ANALYTICS_SETUP.md
│   │   └── 2025_TRANSFORMATION.md
│   ├── guides/                   # Development guides
│   │   ├── BUILD.md
│   │   ├── PERFORMANCE.md
│   │   ├── TESTING_CHECKLIST.md
│   │   └── VALIDATION.md
│   ├── deployment/               # Deployment guides
│   │   ├── DEPLOYMENT.md
│   │   ├── DEPLOYMENT_CHECKLIST_2025.md
│   │   └── GITHUB_PAGES_FIX.md
│   └── archive/                  # Historical docs
│       └── (deprecated files)
│
├── 📂 assets/                    # Static assets
│   ├── images/                   # Images and graphics
│   │   ├── optimized/            # Optimized images
│   │   └── (original images)
│   └── (other assets)
│
├── 📂 data/                      # JSON data files
│   └── announcements.json        # Announcement data
│
├── 📂 materials/                 # Learning materials pages
│   ├── program-dasar.html        # Programming basics
│   ├── asd.html                  # Data structures
│   ├── basis-data.html           # Databases
│   └── web.html                  # Web development
│
├── 📂 dist/                      # Production build output
│   ├── (minified CSS)
│   ├── (minified JS)
│   ├── (optimized assets)
│   └── (built files)
│
├── 📄 Main Files
│   ├── index.html                # Main homepage
│   ├── community.html            # Community page
│   ├── script.js                 # Main JavaScript
│   ├── styles.css                # Main CSS
│   └── sw.js                     # Service Worker
│
└── 📂 .github/                   # GitHub-specific files
    └── (GitHub config files)
```

---

## 📦 File Categories

### 🎨 Frontend Files

**HTML**
- `index.html` - Main homepage (25KB)
- `community.html` - Community page (13KB)
- `materials/*.html` - Learning material pages

**CSS**
- `styles.css` - Main stylesheet (37KB → 28KB minified)
- `src/*.css` - Component stylesheets (Phase 2)

**JavaScript**
- `script.js` - Core functionality (35KB → 16KB minified)
- `src/*.js` - Feature modules (Phase 2)
- `sw.js` - Service worker (PWA)

### 🔧 Configuration Files

- `package.json` - NPM configuration & scripts
- `netlify.toml` - Netlify deployment settings
- `manifest.json` - PWA manifest
- `.gitignore` - Git exclusions

### 📚 Documentation Files

**Root Docs (User-facing)**
- `README.md` - Project overview
- `QUICK_START.md` - Quick start guide
- `SHOWCASE_2025.md` - Features showcase
- `CHANGELOG.md` - Version history

**docs/ (Organized by category)**
- See [docs/README.md](../docs/README.md) for complete index

### 🛠️ Build & Deployment

**Build Pipeline**
- `scripts/build.sh` - Production build
- `scripts/optimize-images.sh` - Image optimization

**Build Output**
- `dist/` - Production-ready files

### 📊 Data Files

- `data/announcements.json` - Dynamic announcements
- `sitemap.xml` - SEO sitemap
- `robots.txt` - Search engine rules

---

## 🎯 File Organization Principles

### 1. **Separation of Concerns**
- Source code in `src/`
- Documentation in `docs/`
- Build output in `dist/`
- Scripts in `scripts/`

### 2. **Modular Architecture**
- Each feature = separate module
- CSS + JS paired together
- Independent features = independent files

### 3. **Clear Naming**
- Descriptive filenames
- Consistent naming conventions
- No abbreviations (except common ones)

### 4. **Documentation Co-location**
- Feature docs with related code
- Build docs with build scripts
- User docs in root

---

## 📏 File Size Guidelines

### Production Files (Minified)

| File | Original | Minified | Savings |
|------|----------|----------|---------|
| styles.css | 37KB | 28KB | 24% |
| script.js | 35KB | 16KB | 54% |
| command-palette.js | 34KB | 26KB | 24% |
| search-modal.js | 62KB | 48KB | 23% |

### Total Bundle Sizes

- **Phase 1 (Initial):** 47KB
- **Phase 2 (Features):** 107KB
- **Total Bundle:** 154KB
- **Initial Load:** 94KB (60KB lazy-loaded)

---

## 🔍 Key Directories Explained

### `/src/` - Source Code (Phase 2)

Contains all Phase 2 feature modules:
- **Modular ESM format** - Tree-shakeable
- **Paired CSS files** - Component styles
- **Self-contained** - No external dependencies (except libraries)

**Purpose:** Keep Phase 2 features separate from Phase 1 core

### `/docs/` - Documentation

Organized by category:
- **project-reports/** - Status and completion
- **features/** - Feature-specific guides
- **guides/** - Development tutorials
- **deployment/** - Deployment instructions
- **archive/** - Historical reference

**Purpose:** Easy navigation for different audiences

### `/scripts/` - Build Scripts

Automation scripts:
- **build.sh** - Main production build
- **optimize-images.sh** - Image compression
- **monitor-deployment.sh** - Deployment checks

**Purpose:** Reproducible builds and deployments

### `/dist/` - Build Output

Production-ready files:
- Minified CSS/JS
- Optimized images
- Copied static assets
- Build manifest

**Purpose:** Deploy this folder to production

### `/materials/` - Content Pages

Learning material HTML pages:
- Programming basics
- Data structures
- Databases
- Web development

**Purpose:** Educational content structure

---

## 🚀 Build Pipeline Flow

```
Source Files (src/, *.html, *.css, *.js)
    ↓
scripts/build.sh
    ↓
1. Clean dist/
2. Copy HTML files
3. Bundle & minify JavaScript (esbuild)
4. Minify CSS (clean-css)
5. Copy static assets
6. Generate build manifest
    ↓
dist/ (Production Ready)
    ↓
Deploy to:
- GitHub Pages
- Netlify
- Vercel
```

---

## 📊 Code Statistics

### Lines of Code (Production)

| Category | Lines | Files |
|----------|-------|-------|
| JavaScript | 3,845 | 10 |
| CSS | 2,296 | 10 |
| HTML | 400 | 6 |
| **Total** | **6,541** | **26** |

### Documentation

| Category | Lines | Files |
|----------|-------|-------|
| Project Reports | 1,200+ | 6 |
| Feature Docs | 600+ | 2 |
| Guides | 400+ | 4 |
| Deployment | 171+ | 3 |
| **Total** | **2,371+** | **23** |

---

## 🎨 Asset Organization

### Images

```
assets/images/
├── optimized/          # Compressed for production
│   ├── hero-bg.webp
│   └── (other optimized images)
└── (original images)   # Source files
```

**Optimization:**
- WebP format for modern browsers
- PNG/JPG fallbacks
- Responsive sizes

---

## 🔧 Configuration Files Explained

### `package.json`
- NPM dependencies (fuse.js, lunr, esbuild, etc.)
- Build scripts
- Project metadata

### `netlify.toml`
- Build command
- Publish directory
- Redirect rules
- Headers configuration

### `manifest.json`
- PWA configuration
- App name and icons
- Theme colors
- Display settings

### `.gitignore`
- `node_modules/` - Dependencies
- `dist/` - Build output
- Temporary files

---

## 📱 Progressive Web App (PWA) Files

- `manifest.json` - App manifest
- `sw.js` - Service worker
- `icon.svg` - App icon

**Features:**
- Offline support
- Install prompt
- Fast loading

---

## 🔒 Security Files

- `robots.txt` - Control search engine crawling
- `.gitignore` - Prevent sensitive files in git
- HTTPS enforced in deployment

---

## 🎯 Best Practices Followed

1. ✅ **Modular Structure** - Easy to maintain
2. ✅ **Clear Naming** - Self-documenting
3. ✅ **Separated Concerns** - Source vs build vs docs
4. ✅ **Version Control** - Everything tracked
5. ✅ **Documentation** - Comprehensive guides
6. ✅ **Build Pipeline** - Automated & reproducible
7. ✅ **Asset Optimization** - Fast loading

---

## 🆘 Finding Files

**Looking for...**

- **Feature code?** → Check `/src/`
- **Main website?** → `index.html`, `script.js`, `styles.css`
- **Documentation?** → `/docs/` (organized by category)
- **Build output?** → `/dist/`
- **Build scripts?** → `/scripts/`
- **Configuration?** → Root directory (`.json`, `.toml`)

---

## 📞 Questions?

Can't find a file? Structure unclear?

- Check `/docs/README.md` for doc index
- Check this file (`STRUCTURE.md`)
- Open an issue on GitHub
- Email: support@zenotika.unikom.ac.id

---

**Document Version:** 1.0  
**Last Updated:** October 1, 2025  
**Maintained by:** Zenotika Development Team
