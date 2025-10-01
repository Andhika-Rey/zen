# 🖼️ Image Optimization Guide

## Overview

Zenotika menggunakan strategi hybrid untuk optimasi gambar:
- **External Images**: Unsplash dengan query parameters untuk optimasi otomatis
- **Local Images**: WebP conversion + responsive sizes untuk asset internal

---

## 🌐 External Images (Unsplash)

### Current Implementation

Community cards menggunakan Unsplash dengan auto-optimization:

```javascript
// Example URL from community.json
"image": "https://images.unsplash.com/photo-xxx?q=80&w=870&auto=format&fit=crop"
```

### URL Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `q` | 80 | Quality (0-100) |
| `w` | 360-1200 | Width constraint |
| `auto=format` | - | Auto WebP/AVIF delivery |
| `fit=crop` | - | Smart cropping |

### Responsive Breakpoints

The `createResponsivePictureMarkup()` function generates:

```javascript
const RESPONSIVE_IMAGE_WIDTHS = [360, 540, 720, 960, 1200];
```

This creates `<picture>` elements with:
- Multiple `<source>` tags for different viewports
- Fallback `<img>` for older browsers
- Lazy loading via Intersection Observer

---

## 🎨 Local Images (WebP Pipeline)

### Prerequisites

```bash
# Install WebP tools
sudo apt-get update
sudo apt-get install -y webp imagemagick

# Or via npm
npm run setup:tools
```

### Quick Start

```bash
# Optimize all images in default directory
npm run optimize:images

# Specify custom directories
npm run optimize:images:responsive ./assets/images ./assets/images/optimized

# Or direct script
./scripts/optimize-images.sh ./path/to/images ./output/path
```

### What the Script Does

1. **Converts to WebP** with quality 80 (optimal balance)
2. **Creates responsive sizes**: 360px, 540px, 720px, 960px, 1200px
3. **Reports savings**: Shows original vs. optimized file sizes
4. **Preserves originals**: Outputs to separate directory

### Example Output

```
🖼️  Zenotika Image Optimization Pipeline
==================================================

✓ Converting: hero-banner.jpg
  Original: 2.4 MiB → WebP: 420 KiB (82% smaller)

✓ Creating 360px version
✓ Creating 540px version
✓ Creating 720px version
✓ Creating 960px version
✓ Creating 1200px version

✅ Optimization complete!
Processed: 1 files
Output: ./assets/images/optimized
```

---

## 📐 Responsive Image Usage

### HTML Pattern

```html
<picture>
  <source 
    media="(max-width: 540px)"
    srcset="image-360w.webp 360w, image-540w.webp 540w"
    sizes="100vw"
  />
  <source 
    media="(max-width: 960px)"
    srcset="image-720w.webp 720w, image-960w.webp 960w"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  <source 
    srcset="image-1200w.webp 1200w"
    sizes="33vw"
  />
  <img 
    src="image-960w.webp" 
    alt="Description"
    loading="lazy"
    class="card-image"
  />
</picture>
```

### JavaScript Dynamic Generation

Already implemented in `script.js`:

```javascript
const pictureMarkup = createResponsivePictureMarkup(
  item.image,  // Unsplash URL
  item.title   // Alt text
);
```

This function:
- Generates optimized `<picture>` elements
- Adds responsive `srcset` attributes
- Includes error handling with fallback monogram
- Implements lazy loading

---

## 🎯 Best Practices

### 1. Image Sizing

```javascript
// ❌ Don't load full-size images
<img src="large-photo-5000px.jpg" width="300" />

// ✅ Do use appropriate sizes
<img 
  srcset="photo-300w.webp 300w, photo-600w.webp 600w"
  sizes="(max-width: 768px) 100vw, 300px"
  src="photo-600w.webp"
/>
```

### 2. Format Priority

1. **WebP** - Modern browsers (90%+ support)
2. **AVIF** - Cutting-edge (80%+ support, better compression)
3. **JPEG/PNG** - Fallback for legacy browsers

### 3. Lazy Loading

```html
<!-- Native lazy loading -->
<img src="image.webp" loading="lazy" alt="..." />

<!-- Intersection Observer (for more control) -->
<img data-src="image.webp" class="lazy-load" alt="..." />
```

Our implementation uses Intersection Observer for better control and fallback support.

### 4. Compression Quality

| Use Case | Quality | Notes |
|----------|---------|-------|
| Hero images | 85-90 | High visibility |
| Card thumbnails | 75-80 | Balanced |
| Background patterns | 60-70 | Less critical |
| Icons (PNG → WebP) | 90-95 | Sharp edges |

---

## 📊 Performance Impact

### Before Optimization
- JPEG @ 2.4 MB = 2400 KB
- 4 images = 9.6 MB total

### After Optimization
- WebP @ 420 KB each
- 4 images = 1.68 MB total
- **82% reduction** 🎉

### Responsive Gains
- Mobile (360w): ~120 KB
- Tablet (720w): ~280 KB
- Desktop (1200w): ~420 KB

Users only download what they need for their viewport!

---

## 🔧 Troubleshooting

### Script fails with "cwebp not found"

```bash
# Ubuntu/Debian
sudo apt-get install webp

# macOS
brew install webp

# Verify installation
cwebp -version
```

### ImageMagick warnings for responsive sizes

Responsive size creation requires ImageMagick. If not critical:

```bash
# Comment out in script (line ~78)
# create_responsive_sizes "$file"
```

Or install:

```bash
sudo apt-get install imagemagick
```

### Permission denied

```bash
chmod +x scripts/optimize-images.sh
```

---

## 🚀 Next Steps

### Phase 1: Local Assets ✅
- [x] Create optimization script
- [x] Add npm commands
- [x] Document usage

### Phase 2: Integration (Next)
- [ ] Create `assets/images` directory structure
- [ ] Optimize any local project images
- [ ] Update paths in HTML/JSON
- [ ] Add WebP support checks

### Phase 3: Advanced (Future)
- [ ] Implement AVIF format support
- [ ] Add automated CI/CD optimization
- [ ] Create image CDN integration
- [ ] Implement blur-up technique for placeholders

---

## 📚 Resources

- [WebP Documentation](https://developers.google.com/speed/webp)
- [MDN: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [web.dev: Fast load times](https://web.dev/fast/)
- [Unsplash Image API](https://unsplash.com/documentation#dynamically-resizable-images)

---

**Last Updated:** October 1, 2025  
**Maintainer:** Zenotika Team
