/**
 * Analytics Module - Zenotika 2025
 * Google Analytics 4 (GA4) integration with privacy-first approach
 * 
 * Features:
 * - Page view tracking
 * - User interaction tracking
 * - Feature usage analytics
 * - Performance monitoring
 * - Privacy-compliant (GDPR/CCPA ready)
 * - Consent management
 */

/**
 * Analytics configuration
 * Replace MEASUREMENT_ID with your actual GA4 measurement ID (G-XXXXXXXXXX)
 */
const CONFIG = {
  measurementId: 'G-XXXXXXXXXX', // TODO: Replace with actual GA4 ID
  enabled: true,
  debug: false, // Set to true for development
  anonymizeIp: true,
  respectDoNotTrack: true,
  cookieFlags: 'SameSite=Strict;Secure',
  cookieExpires: 63072000, // 2 years in seconds
};

/**
 * AnalyticsManager class - Main analytics functionality
 */
class AnalyticsManager {
  constructor(config) {
    this.config = config;
    this.initialized = false;
    this.consent = this.loadConsent();
    this.queue = [];
    
    if (this.shouldInitialize()) {
      this.init();
    }
  }

  /**
   * Check if analytics should be initialized
   */
  shouldInitialize() {
    // Respect Do Not Track
    if (this.config.respectDoNotTrack) {
      const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
      if (dnt === '1' || dnt === 'yes') {
        console.info('[Analytics] Do Not Track is enabled. Analytics disabled.');
        return false;
      }
    }

    // Check consent (default to false - opt-in required)
    if (!this.consent.analytics) {
      console.info('[Analytics] User consent not given. Analytics disabled.');
      return false;
    }

    // Check if valid measurement ID
    if (!this.config.measurementId || this.config.measurementId === 'G-XXXXXXXXXX') {
      console.warn('[Analytics] Invalid measurement ID. Analytics disabled.');
      return false;
    }

    return this.config.enabled;
  }

  /**
   * Initialize Google Analytics 4
   */
  init() {
    if (this.initialized) return;

    try {
      // Load gtag.js script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag function
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        dataLayer.push(arguments);
      };

      gtag('js', new Date());
      gtag('config', this.config.measurementId, {
        anonymize_ip: this.config.anonymizeIp,
        cookie_flags: this.config.cookieFlags,
        cookie_expires: this.config.cookieExpires,
        send_page_view: false, // We'll handle manually
      });

      this.initialized = true;

      // Process queued events
      this.processQueue();

      // Track initial page view
      this.trackPageView();

      // Setup automatic event tracking
      this.setupAutoTracking();

      console.info('[Analytics] GA4 initialized successfully');
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
    }
  }

  /**
   * Process queued events
   */
  processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      this.trackEvent(event.name, event.params);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pagePath = null) {
    const params = {
      page_path: pagePath || window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
    };

    this.trackEvent('page_view', params);
  }

  /**
   * Track custom event
   * @param {string} eventName - Event name
   * @param {Object} params - Event parameters
   */
  trackEvent(eventName, params = {}) {
    if (!this.initialized) {
      // Queue event if not initialized
      this.queue.push({ name: eventName, params });
      return;
    }

    try {
      if (this.config.debug) {
        console.log('[Analytics] Event:', eventName, params);
      }

      gtag('event', eventName, params);
    } catch (error) {
      console.error('[Analytics] Event tracking failed:', error);
    }
  }

  /**
   * Track user interaction
   * @param {string} action - Interaction type (click, submit, etc.)
   * @param {string} category - Category (button, form, etc.)
   * @param {string} label - Label
   * @param {number} value - Optional value
   */
  trackInteraction(action, category, label, value = null) {
    const params = {
      event_category: category,
      event_label: label,
    };

    if (value !== null) {
      params.value = value;
    }

    this.trackEvent(action, params);
  }

  /**
   * Track feature usage
   * @param {string} feature - Feature name
   * @param {string} action - Action taken
   * @param {Object} metadata - Additional metadata
   */
  trackFeature(feature, action, metadata = {}) {
    this.trackEvent('feature_usage', {
      feature_name: feature,
      feature_action: action,
      ...metadata,
    });
  }

  /**
   * Track search
   * @param {string} query - Search query
   * @param {number} resultsCount - Number of results
   */
  trackSearch(query, resultsCount = 0) {
    this.trackEvent('search', {
      search_term: query,
      results_count: resultsCount,
    });
  }

  /**
   * Track timing/performance
   * @param {string} category - Timing category
   * @param {string} name - Metric name
   * @param {number} value - Time in milliseconds
   */
  trackTiming(category, name, value) {
    this.trackEvent('timing_complete', {
      timing_category: category,
      timing_name: name,
      timing_value: Math.round(value),
    });
  }

  /**
   * Track exception/error
   * @param {string} description - Error description
   * @param {boolean} fatal - Is fatal error
   */
  trackException(description, fatal = false) {
    this.trackEvent('exception', {
      description,
      fatal,
    });
  }

  /**
   * Set user properties
   * @param {Object} properties - User properties
   */
  setUserProperties(properties) {
    if (!this.initialized) return;

    try {
      gtag('set', 'user_properties', properties);
    } catch (error) {
      console.error('[Analytics] Set user properties failed:', error);
    }
  }

  /**
   * Setup automatic event tracking
   */
  setupAutoTracking() {
    // Track outbound links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // External link
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        this.trackInteraction('click', 'outbound_link', href);
      }

      // Download link
      if (href.match(/\.(pdf|zip|docx?|xlsx?|pptx?)$/i)) {
        this.trackInteraction('click', 'download', href);
      }

      // Email link
      if (href.startsWith('mailto:')) {
        this.trackInteraction('click', 'email', href.replace('mailto:', ''));
      }

      // Phone link
      if (href.startsWith('tel:')) {
        this.trackInteraction('click', 'phone', href.replace('tel:', ''));
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      const formId = form.id || form.name || 'unknown';
      
      this.trackInteraction('submit', 'form', formId);
    });

    // Track video plays (if any)
    document.querySelectorAll('video, audio').forEach((media) => {
      media.addEventListener('play', () => {
        const src = media.currentSrc || media.src;
        this.trackInteraction('play', media.tagName.toLowerCase(), src);
      });
    });

    // Track errors
    window.addEventListener('error', (e) => {
      this.trackException(`${e.message} at ${e.filename}:${e.lineno}:${e.colno}`, false);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackException(`Unhandled promise rejection: ${e.reason}`, false);
    });

    // Track performance metrics (Core Web Vitals)
    this.trackWebVitals();
  }

  /**
   * Track Core Web Vitals
   */
  trackWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackTiming('Web Vitals', 'LCP', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.trackTiming('Web Vitals', 'FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Report CLS on visibility change
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            this.trackTiming('Web Vitals', 'CLS', clsValue * 1000); // Convert to ms for consistency
          }
        });
      } catch (e) {
        // CLS not supported
      }
    }

    // Navigation Timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const connectTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;

        this.trackTiming('Performance', 'Page Load', pageLoadTime);
        this.trackTiming('Performance', 'Connect', connectTime);
        this.trackTiming('Performance', 'Render', renderTime);
      }, 0);
    });
  }

  /**
   * Load consent from localStorage
   */
  loadConsent() {
    try {
      const stored = localStorage.getItem('zenotika_analytics_consent');
      return stored ? JSON.parse(stored) : { analytics: false, marketing: false };
    } catch (error) {
      return { analytics: false, marketing: false };
    }
  }

  /**
   * Save consent to localStorage
   */
  saveConsent(consent) {
    try {
      localStorage.setItem('zenotika_analytics_consent', JSON.stringify(consent));
      this.consent = consent;
    } catch (error) {
      console.error('[Analytics] Failed to save consent:', error);
    }
  }

  /**
   * Grant consent and initialize analytics
   */
  grantConsent() {
    this.saveConsent({ analytics: true, marketing: false });
    
    if (!this.initialized && this.config.enabled) {
      this.init();
    }
  }

  /**
   * Revoke consent and disable analytics
   */
  revokeConsent() {
    this.saveConsent({ analytics: false, marketing: false });
    
    // Disable GA4
    if (this.initialized && window.gtag) {
      gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  }

  /**
   * Check if consent has been given
   */
  hasConsent() {
    return this.consent.analytics === true;
  }
}

// Export singleton instance
const analytics = new AnalyticsManager(CONFIG);

// Export for external use
export default analytics;

// Expose globally for easy access in console/debugging
if (typeof window !== 'undefined') {
  window.zenotika = window.zenotika || {};
  window.zenotika.analytics = analytics;
}
