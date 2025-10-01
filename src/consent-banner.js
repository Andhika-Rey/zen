/**
 * Cookie Consent Banner - Zenotika 2025
 * GDPR/CCPA compliant cookie consent UI
 */

import analytics from './analytics.js';

export class ConsentBanner {
  constructor() {
    this.consent = this.loadConsent();
    
    // Don't show banner if consent already given/denied
    if (this.consent.decided) {
      return;
    }

    this.createBanner();
    this.show();
  }

  createBanner() {
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="consent-content">
        <div class="consent-icon">
          🍪
        </div>
        <div class="consent-text">
          <h3>Privasi & Cookie</h3>
          <p>
            Kami menggunakan cookies dan Google Analytics untuk meningkatkan pengalaman Anda.
            Data digunakan untuk memahami bagaimana platform ini digunakan dan melakukan perbaikan.
          </p>
          <p class="consent-note">
            Kami menghormati privasi Anda. Tidak ada data personal yang dikumpulkan.
            <a href="#privacy-policy" class="consent-link">Kebijakan Privasi</a>
          </p>
        </div>
        <div class="consent-actions">
          <button class="consent-btn consent-btn-primary" id="consent-accept">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Terima Semua
          </button>
          <button class="consent-btn consent-btn-secondary" id="consent-deny">
            Hanya yang Diperlukan
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    this.banner = banner;

    // Attach event listeners
    document.getElementById('consent-accept').addEventListener('click', () => {
      this.accept();
    });

    document.getElementById('consent-deny').addEventListener('click', () => {
      this.deny();
    });
  }

  show() {
    if (!this.banner) return;
    
    // Small delay for better UX
    setTimeout(() => {
      this.banner.classList.add('visible');
    }, 1000);
  }

  hide() {
    if (!this.banner) return;
    
    this.banner.classList.add('hiding');
    setTimeout(() => {
      this.banner.remove();
    }, 300);
  }

  accept() {
    this.saveConsent({ analytics: true, decided: true });
    analytics.grantConsent();
    this.hide();
    
    // Show success toast if available
    if (window.zenotika && window.zenotika.toast) {
      window.zenotika.toast.show({
        type: 'success',
        message: 'Terima kasih! Preferensi cookie Anda telah disimpan.',
        duration: 3000,
      });
    }
  }

  deny() {
    this.saveConsent({ analytics: false, decided: true });
    analytics.revokeConsent();
    this.hide();
    
    // Show info toast if available
    if (window.zenotika && window.zenotika.toast) {
      window.zenotika.toast.show({
        type: 'info',
        message: 'Preferensi cookie Anda telah disimpan. Hanya cookie esensial yang aktif.',
        duration: 3000,
      });
    }
  }

  loadConsent() {
    try {
      const stored = localStorage.getItem('zenotika_cookie_consent');
      return stored ? JSON.parse(stored) : { analytics: false, decided: false };
    } catch (error) {
      return { analytics: false, decided: false };
    }
  }

  saveConsent(consent) {
    try {
      localStorage.setItem('zenotika_cookie_consent', JSON.stringify(consent));
      this.consent = consent;
    } catch (error) {
      console.error('[Consent] Failed to save consent:', error);
    }
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ConsentBanner();
  });
} else {
  new ConsentBanner();
}

export default ConsentBanner;
