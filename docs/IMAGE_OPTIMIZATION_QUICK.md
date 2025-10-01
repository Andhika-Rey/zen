# 🚀 Quick Reference - Image Optimization

## One-Line Commands

```bash
# Check if tools are installed
npm run check:webp

# Install required tools (Ubuntu/Debian)
npm run setup:tools

# Optimize images in default directory
npm run optimize:images

# Optimize with custom paths
./scripts/optimize-images.sh ./input/path ./output/path

# Make script executable (if needed)
chmod +x scripts/optimize-images.sh
```

---

## File Structure After Optimization

```
assets/
├── images/
│   ├── hero-banner.jpg          ← Original (keep in git)
│   ├── project-thumbnail.png    ← Original (keep in git)
│   └── optimized/               ← Generated (gitignored)
│       ├── hero-banner.webp
│       ├── hero-banner-360w.webp
│       ├── hero-banner-540w.webp
│       ├── hero-banner-720w.webp
│       ├── hero-banner-960w.webp
│       └── hero-banner-1200w.webp
```

---

## HTML Usage Patterns

### Basic WebP

```html
<img src="assets/images/optimized/image.webp" alt="Description" loading="lazy" />
```

### Responsive Picture

```html
<picture>
  <source 
    media="(max-width: 540px)"
    srcset="image-360w.webp 360w, image-540w.webp 540w"
  />
  <source 
    media="(max-width: 960px)"
    srcset="image-720w.webp 720w, image-960w.webp 960w"
  />
  <source srcset="image-1200w.webp" />
  <img src="image-960w.webp" alt="Description" loading="lazy" />
</picture>
```

### With Fallback

```html
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" />
</picture>
```

---

## JavaScript Dynamic Generation

Already implemented in `script.js`:

```javascript
// For external images (Unsplash)
const markup = createResponsivePictureMarkup(imageUrl, altText);

// For local images - use same function with local paths
const localMarkup = createResponsivePictureMarkup(
  '/assets/images/optimized/hero-360w.webp',
  'Hero Image'
);
```

---

## Compression Quality Guide

| Image Type | Quality | Use Case |
|------------|---------|----------|
| Hero / Feature | 85-90 | High visibility, large |
| Card Thumbnails | 75-80 | Balanced (default) |
| Backgrounds | 60-70 | Less critical |
| Icons | 90-95 | Sharp edges needed |

Edit script line 36 to change quality:

```bash
cwebp -q 80 "$input_file" -o "$output_file"
#       ↑ Change this value (0-100)
```

---

## Performance Expectations

### Typical Savings

| Original Format | Size | WebP Size | Savings |
|----------------|------|-----------|---------|
| JPEG (high quality) | 2.4 MB | 420 KB | ~82% |
| PNG (24-bit) | 1.8 MB | 280 KB | ~84% |
| PNG (8-bit) | 520 KB | 180 KB | ~65% |

### Responsive Sizes

| Viewport | Image Width | Typical Size |
|----------|-------------|--------------|
| Mobile | 360px | ~120 KB |
| Tablet | 720px | ~280 KB |
| Desktop | 1200px | ~420 KB |

---

## Troubleshooting

### "cwebp: command not found"

```bash
# Ubuntu/Debian
sudo apt-get install webp

# macOS
brew install webp
```

### "convert: command not found" (for responsive sizes)

```bash
# Ubuntu/Debian
sudo apt-get install imagemagick

# macOS
brew install imagemagick
```

### Script won't run

```bash
chmod +x scripts/optimize-images.sh
```

### No images found

```bash
# Check directory exists
ls -la assets/images/

# Add some test images
# Then run again
npm run optimize:images
```

---

## Testing Optimized Images

### Browser DevTools

1. Open Network tab
2. Reload page
3. Filter by "Img"
4. Check sizes transferred

**Expected:**
- WebP format served to modern browsers
- Correct size based on viewport
- Lazy loaded images only load when scrolled into view

### Lighthouse Audit

```bash
npx lighthouse https://your-site.com --view
```

**Target Scores:**
- Performance: 90+
- Opportunities: "Serve images in next-gen formats" should be green

---

## Integration Checklist

- [x] Optimization script created (`scripts/optimize-images.sh`)
- [x] npm commands configured (`package.json`)
- [x] Documentation written (`docs/IMAGE_OPTIMIZATION.md`)
- [x] Assets directory structure (`assets/images/`)
- [x] Gitignore updated (`.gitignore`)
- [ ] Run optimization on existing local images
- [ ] Update HTML/JSON with optimized paths
- [ ] Test in multiple browsers
- [ ] Verify lazy loading works
- [ ] Check mobile performance

---

**See Full Documentation:** [docs/IMAGE_OPTIMIZATION.md](../docs/IMAGE_OPTIMIZATION.md)
