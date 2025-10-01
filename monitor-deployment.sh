#!/bin/bash

# Zenotika GitHub Pages Deployment Monitor
# Usage: ./monitor-deployment.sh

echo "🔍 Monitoring GitHub Pages deployment..."
echo "📍 URL: https://andhika-rey.github.io/zen/"
echo "⏰ Started: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

MAX_ATTEMPTS=20
ATTEMPT=0
SLEEP_INTERVAL=10

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    
    # Get HTTP status code
    STATUS=$(curl -sI https://andhika-rey.github.io/zen/ | grep "^HTTP" | awk '{print $2}')
    
    echo "[$ATTEMPT/$MAX_ATTEMPTS] Status: $STATUS ($(date '+%H:%M:%S'))"
    
    if [ "$STATUS" = "200" ]; then
        echo ""
        echo "✅ SUCCESS! GitHub Pages is now LIVE!"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🎉 Deployment Complete!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "🌐 Live URL: https://andhika-rey.github.io/zen/"
        echo "📊 Local Preview: http://localhost:3005"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Open live site in browser"
        echo "2. Test all keyboard shortcuts (/, t, ?, Esc)"
        echo "3. Run Lighthouse audit (Chrome DevTools)"
        echo "4. Follow docs/TESTING_CHECKLIST.md"
        echo "5. Collect user feedback"
        echo ""
        echo "🚀 Lighthouse Quick Command:"
        echo "   Chrome DevTools → Lighthouse → 'Analyze page load'"
        echo ""
        echo "🎯 Target Scores:"
        echo "   Performance: ≥95/100"
        echo "   Accessibility: 100/100"
        echo "   Best Practices: 100/100"
        echo "   SEO: 100/100"
        echo ""
        
        # Try to open in browser (if $BROWSER is set)
        if [ -n "$BROWSER" ]; then
            echo "🌐 Opening in browser..."
            "$BROWSER" https://andhika-rey.github.io/zen/ &
        fi
        
        exit 0
    elif [ "$STATUS" = "404" ]; then
        echo "   ⏳ Still deploying... (waiting ${SLEEP_INTERVAL}s)"
    else
        echo "   ⚠️  Unexpected status: $STATUS"
    fi
    
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        sleep $SLEEP_INTERVAL
    fi
done

echo ""
echo "⏰ Timeout after $((MAX_ATTEMPTS * SLEEP_INTERVAL)) seconds"
echo ""
echo "📝 Deployment might be taking longer than expected."
echo "   Possible reasons:"
echo "   - GitHub Actions queue is busy"
echo "   - Large build artifacts"
echo "   - Repository settings need verification"
echo ""
echo "🔧 Troubleshooting:"
echo "1. Check GitHub Actions: https://github.com/Andhika-Rey/zen/actions"
echo "2. Verify Pages settings: Settings → Pages → Source: main branch"
echo "3. Check build logs for errors"
echo "4. Manual check: curl -sI https://andhika-rey.github.io/zen/"
echo ""
exit 1
