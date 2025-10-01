#!/bin/bash
# Build script for Zenotika production deployment
# Minifies CSS/JS and prepares optimized assets

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔨 Zenotika Production Build Pipeline${NC}"
echo "=========================================="
echo ""

# Configuration
BUILD_DIR="dist"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
VERSION=$(grep -o '"version": "[^"]*' package.json | cut -d'"' -f4)

echo -e "${GREEN}Version:${NC} $VERSION"
echo -e "${GREEN}Build Time:${NC} $TIMESTAMP"
echo ""

# Clean previous build
if [ -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
    rm -rf "$BUILD_DIR"
fi

mkdir -p "$BUILD_DIR"
mkdir -p "$BUILD_DIR/materials"
mkdir -p "$BUILD_DIR/data"
mkdir -p "$BUILD_DIR/docs"
mkdir -p "$BUILD_DIR/assets"

# Copy HTML files
echo -e "${GREEN}📄 Copying HTML files...${NC}"
cp index.html "$BUILD_DIR/"
cp community.html "$BUILD_DIR/"
cp materials/*.html "$BUILD_DIR/materials/"

# Copy data files
echo -e "${GREEN}📊 Copying data files...${NC}"
cp -r data/* "$BUILD_DIR/data/"

# Build Command Palette (Phase 2)
echo -e "${GREEN}⌨️  Building Command Palette module...${NC}"
npx esbuild src/command-palette.js \
    --bundle \
    --minify \
    --target=es2020 \
    --format=esm \
    --outfile="$BUILD_DIR/command-palette.js"

# Copy Command Palette CSS
cp src/command-palette.css "$BUILD_DIR/"

# Build Toast Notifications (Phase 2)
echo -e "${GREEN}🔔 Building Toast Notifications module...${NC}"
npx esbuild src/toast.js \
    --bundle \
    --minify \
    --target=es2020 \
    --format=esm \
    --outfile="$BUILD_DIR/toast.js"

# Copy Toast CSS
cp src/toast.css "$BUILD_DIR/"

# Build Advanced Search (Phase 2)
echo -e "${GREEN}🔍 Building Advanced Search module...${NC}"
npx esbuild src/search-modal.js \
    --bundle \
    --minify \
    --target=es2020 \
    --format=esm \
    --outfile="$BUILD_DIR/search-modal.js"

# Copy Search Modal CSS
mkdir -p "$BUILD_DIR/src"
cp src/search-modal.css "$BUILD_DIR/src/"

# Copy static assets
echo -e "${GREEN}🖼️  Copying static assets...${NC}"
cp icon.svg "$BUILD_DIR/"
cp manifest.json "$BUILD_DIR/"
cp robots.txt "$BUILD_DIR/"
cp sitemap.xml "$BUILD_DIR/"
cp netlify.toml "$BUILD_DIR/" 2>/dev/null || true

# Copy optimized images if they exist
if [ -d "assets/images/optimized" ]; then
    echo -e "${GREEN}🎨 Copying optimized images...${NC}"
    cp -r assets/images/optimized "$BUILD_DIR/assets/images/"
fi

# Minify CSS
echo -e "${GREEN}🎨 Minifying CSS...${NC}"
if command -v npx &> /dev/null; then
    # Use clean-css-cli (reliable and well-tested)
    if npx cleancss --version &> /dev/null 2>&1; then
        npx cleancss styles.css -o "$BUILD_DIR/styles.css" 2>/dev/null
        echo "  ✓ Using clean-css"
    elif npx lightningcss --version &> /dev/null 2>&1; then
        npx lightningcss --minify --bundle styles.css -o "$BUILD_DIR/styles.css"
        echo "  ✓ Using lightningcss"
    else
        # Fallback: copy without minification
        cp styles.css "$BUILD_DIR/"
        echo -e "  ${YELLOW}⚠️  No minifier found, using original CSS${NC}"
    fi
else
    cp styles.css "$BUILD_DIR/"
    echo -e "  ${YELLOW}⚠️  npx not available, using original CSS${NC}"
fi

# Minify JavaScript
echo -e "${GREEN}⚡ Minifying JavaScript...${NC}"
if command -v npx &> /dev/null; then
    if npx esbuild --version &> /dev/null 2>&1; then
        npx esbuild script.js --minify --target=es2020 --outfile="$BUILD_DIR/script.js"
        echo "  ✓ Using esbuild"
    elif npx terser --version &> /dev/null 2>&1; then
        npx terser script.js -o "$BUILD_DIR/script.js" --compress --mangle
        echo "  ✓ Using terser"
    else
        cp script.js "$BUILD_DIR/"
        echo -e "  ${YELLOW}⚠️  No minifier found, using original JS${NC}"
    fi
else
    cp script.js "$BUILD_DIR/"
    echo -e "  ${YELLOW}⚠️  npx not available, using original JS${NC}"
fi

# Update Service Worker with version
echo -e "${GREEN}⚙️  Updating Service Worker...${NC}"
SW_VERSION="v${VERSION}-${TIMESTAMP}"
sed "s/static-v3/static-${SW_VERSION}/g" sw.js | \
sed "s/dynamic-v3/dynamic-${SW_VERSION}/g" > "$BUILD_DIR/sw.js"
echo "  ✓ Cache version: $SW_VERSION"

# Calculate file sizes
echo ""
echo -e "${BLUE}📊 Build Statistics:${NC}"
echo "-------------------------------------------"

original_css=$(stat -f%z "styles.css" 2>/dev/null || stat -c%s "styles.css")
minified_css=$(stat -f%z "$BUILD_DIR/styles.css" 2>/dev/null || stat -c%s "$BUILD_DIR/styles.css")
css_savings=$(( (original_css - minified_css) * 100 / original_css ))

original_js=$(stat -f%z "script.js" 2>/dev/null || stat -c%s "script.js")
minified_js=$(stat -f%z "$BUILD_DIR/script.js" 2>/dev/null || stat -c%s "$BUILD_DIR/script.js")
js_savings=$(( (original_js - minified_js) * 100 / original_js ))

echo "CSS:"
echo "  Original:  $(numfmt --to=iec-i --suffix=B $original_css 2>/dev/null || echo "${original_css} bytes")"
echo "  Minified:  $(numfmt --to=iec-i --suffix=B $minified_css 2>/dev/null || echo "${minified_css} bytes")"
echo "  Savings:   ${css_savings}%"
echo ""
echo "JavaScript:"
echo "  Original:  $(numfmt --to=iec-i --suffix=B $original_js 2>/dev/null || echo "${original_js} bytes")"
echo "  Minified:  $(numfmt --to=iec-i --suffix=B $minified_js 2>/dev/null || echo "${minified_js} bytes")"
echo "  Savings:   ${js_savings}%"
echo ""

# Create build manifest
echo -e "${GREEN}📝 Creating build manifest...${NC}"
cat > "$BUILD_DIR/build-manifest.json" <<EOF
{
  "version": "$VERSION",
  "buildTime": "$TIMESTAMP",
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "files": {
    "css": {
      "original": $original_css,
      "minified": $minified_css,
      "savings": "${css_savings}%"
    },
    "js": {
      "original": $original_js,
      "minified": $minified_js,
      "savings": "${js_savings}%"
    }
  },
  "cacheVersion": "$SW_VERSION"
}
EOF

# Create deployment checklist
cat > "$BUILD_DIR/DEPLOY_CHECKLIST.md" <<EOF
# Deployment Checklist - v$VERSION

Build: $TIMESTAMP

## Pre-Deployment
- [ ] All tests passing
- [ ] No console errors in dev
- [ ] Service Worker updated with new cache version
- [ ] Lighthouse score checked (target: 95+)

## Deployment
- [ ] Files uploaded to hosting
- [ ] DNS/CDN cache cleared
- [ ] Service Worker registered correctly
- [ ] Test on production URL

## Post-Deployment
- [ ] Verify all pages load correctly
- [ ] Test Service Worker offline mode
- [ ] Check Search Console for errors
- [ ] Monitor analytics for issues

## Performance Targets
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Lighthouse Score > 95

---
Built on: $(date)
Cache Version: $SW_VERSION
EOF

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Build Complete!${NC}"
echo ""
echo "Output directory: $BUILD_DIR"
echo "Build manifest: $BUILD_DIR/build-manifest.json"
echo "Deploy checklist: $BUILD_DIR/DEPLOY_CHECKLIST.md"
echo ""
echo "Next steps:"
echo "1. Review build output in $BUILD_DIR"
echo "2. Test locally: cd $BUILD_DIR && python -m http.server 8080"
echo "3. Run Lighthouse audit"
echo "4. Deploy to production"
echo ""
