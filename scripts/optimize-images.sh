#!/bin/bash
# Image Optimization Script for Zenotika
# Converts local images to WebP and optimizes for web delivery

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directories
INPUT_DIR="${1:-./assets/images}"
OUTPUT_DIR="${2:-./assets/images/optimized}"

echo -e "${GREEN}🖼️  Zenotika Image Optimization Pipeline${NC}"
echo "=================================================="
echo ""

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo -e "${YELLOW}⚠️  cwebp not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install webp
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y webp
    else
        echo -e "${RED}❌ Please install webp manually: https://developers.google.com/speed/webp/download${NC}"
        exit 1
    fi
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to convert image to WebP
convert_to_webp() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local name="${filename%.*}"
    local output_file="$OUTPUT_DIR/${name}.webp"
    
    echo -e "${GREEN}✓${NC} Converting: $filename"
    
    # Convert with quality 80 (good balance)
    cwebp -q 80 "$input_file" -o "$output_file" -quiet
    
    # Get file sizes
    local original_size=$(stat -f%z "$input_file" 2>/dev/null || stat -c%s "$input_file")
    local webp_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file")
    local savings=$(( (original_size - webp_size) * 100 / original_size ))
    
    echo "  Original: $(numfmt --to=iec-i --suffix=B $original_size) → WebP: $(numfmt --to=iec-i --suffix=B $webp_size) (${savings}% smaller)"
}

# Function to create responsive sizes
create_responsive_sizes() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local name="${filename%.*}"
    
    # Responsive breakpoints
    local widths=(360 540 720 960 1200)
    
    for width in "${widths[@]}"; do
        local output_file="$OUTPUT_DIR/${name}-${width}w.webp"
        echo -e "${GREEN}✓${NC} Creating ${width}px version"
        
        # Use ImageMagick if available, otherwise skip resizing
        if command -v convert &> /dev/null; then
            convert "$input_file" -resize "${width}x" -quality 80 - | cwebp -q 80 - -o "$output_file" -quiet
        else
            echo -e "${YELLOW}  ⚠️  ImageMagick not installed, skipping resize${NC}"
            break
        fi
    done
}

# Process all images in input directory
total_files=0
processed_files=0

if [ -d "$INPUT_DIR" ]; then
    echo -e "${GREEN}📁 Scanning: $INPUT_DIR${NC}"
    echo ""
    
    for file in "$INPUT_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
        if [ -f "$file" ]; then
            total_files=$((total_files + 1))
            convert_to_webp "$file"
            
            # Optionally create responsive sizes
            # Uncomment next line to enable:
            # create_responsive_sizes "$file"
            
            processed_files=$((processed_files + 1))
            echo ""
        fi
    done
else
    echo -e "${RED}❌ Input directory not found: $INPUT_DIR${NC}"
    echo "Creating directory structure..."
    mkdir -p "$INPUT_DIR"
    echo -e "${YELLOW}📝 Place your images in $INPUT_DIR and run again${NC}"
    exit 0
fi

# Summary
echo "=================================================="
if [ $processed_files -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No images found to process${NC}"
    echo "Place JPG/PNG images in: $INPUT_DIR"
else
    echo -e "${GREEN}✅ Optimization complete!${NC}"
    echo "Processed: $processed_files files"
    echo "Output: $OUTPUT_DIR"
    echo ""
    echo "Next steps:"
    echo "1. Review optimized images in $OUTPUT_DIR"
    echo "2. Update image paths in your HTML/JSON files"
    echo "3. Test loading performance with new WebP images"
fi
