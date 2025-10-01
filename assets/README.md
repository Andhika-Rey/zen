# Assets Directory

This directory stores local image assets for the Zenotika platform.

## Structure

```
assets/
├── images/              # Original source images
│   ├── hero/           # Hero section images
│   ├── icons/          # Custom icons
│   └── projects/       # Local project thumbnails
└── images/optimized/   # WebP optimized output (auto-generated)
```

## Usage

### Adding New Images

1. Place original images in appropriate subdirectory
2. Run optimization script:
   ```bash
   npm run optimize:images
   ```
3. Optimized WebP images will be in `images/optimized/`

### Current Strategy

- **External images** (Unsplash): Already optimized via URL parameters
- **Local images**: Use optimization pipeline before deployment
- **SVG icons**: Keep as-is (already optimized)

## Optimization Commands

```bash
# Optimize all images
npm run optimize:images

# Custom paths
./scripts/optimize-images.sh ./assets/images/hero ./assets/images/optimized/hero

# Check if WebP tools are installed
npm run check:webp
```

## Best Practices

1. **Original images**: Keep in `assets/images/` (for version control)
2. **Optimized images**: Generated in `assets/images/optimized/`
3. **Git ignore**: Add `optimized/` to `.gitignore` if builds are automated
4. **Max dimensions**: 2400px width for hero images, 1200px for cards
5. **Format**: Accept JPG/PNG source, outputs WebP

## See Also

- [Image Optimization Guide](../docs/IMAGE_OPTIMIZATION.md)
- [Performance Guide](../docs/PERFORMANCE.md)
