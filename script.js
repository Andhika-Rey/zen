// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Modern Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Add smooth transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    });

    // Modern Search Toggle
    const searchToggle = document.querySelector('.search-toggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.querySelector('.search-close');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    
    function openSearch() {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput.focus(), 300);
    }
    
    function closeSearch() {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        searchInput.value = '';
    }
    
    searchToggle.addEventListener('click', openSearch);
    searchClose.addEventListener('click', closeSearch);
    
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });
    
    // Enhanced search functionality
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        // Add real search functionality here
        console.log('Searching for:', query);
    });
    
    // Suggestion tag clicks
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', function() {
            searchInput.value = this.textContent;
            searchInput.focus();
        });
    });
    
    // Search keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Animate hamburger bars
        const bars = hamburger.querySelectorAll('.bar');
        if (hamburger.classList.contains('active')) {
            bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });

    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Reset hamburger bars
            const bars = hamburger.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Enhanced navbar scroll effect with glassmorphism
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for enhanced glassmorphism
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Enhanced character interaction
    const character = document.querySelector('.character-3d');
    let isAnimating = false;
    
    if (character) {
        character.addEventListener('click', function() {
            if (!isAnimating) {
                isAnimating = true;
                this.style.animation = 'none';
                this.style.transform = 'scale(1.2) rotateY(720deg) rotateX(360deg)';
                this.style.transition = 'transform 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                
                setTimeout(() => {
                    this.style.animation = 'floatAnimation 6s ease-in-out infinite';
                    this.style.transform = '';
                    this.style.transition = 'all 0.5s ease-out';
                    isAnimating = false;
                }, 1500);
            }
        });

        // Enhanced mouse move effect on character with parallax
        character.addEventListener('mousemove', function(e) {
            if (!isAnimating) {
                const rect = this.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - centerX) / rect.width;
                const deltaY = (e.clientY - centerY) / rect.height;
                
                this.style.transform = `perspective(1000px) rotateY(${deltaX * 25}deg) rotateX(${-deltaY * 25}deg) scale(1.05)`;
            }
        });

        character.addEventListener('mouseleave', function() {
            if (!isAnimating) {
                this.style.transform = '';
            }
        });
    }

    // Enhanced CTA Button interactions with modern effects
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        // Add magnetic effect on hover
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translateY(-4px) scale(1.02) translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('click', function(e) {
            // Create modern ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.5;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            // Haptic feedback simulation
            this.style.transform = 'translateY(-2px) scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            setTimeout(() => {
                ripple.remove();
            }, 800);
        });
    });

    // Form submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Mengirim...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                submitBtn.textContent = 'Pesan Terkirim!';
                submitBtn.style.background = '#28a745';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    this.reset();
                }, 2000);
            }, 1500);
        });
    }

    // Enhanced Intersection Observer with modern animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Enhanced scroll animations with stagger effect
    const animateElements = document.querySelectorAll('.about-card, .learning-item, .info-card, .section-title');
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s, 
                              transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(el);
    });

    // Enhanced typewriter effect with cursor animation
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        const text = subtitle.textContent;
        subtitle.textContent = '';
        subtitle.style.position = 'relative';
        
        // Add cursor element
        const cursor = document.createElement('span');
        cursor.textContent = '|';
        cursor.style.color = 'var(--primary-400)';
        cursor.style.animation = 'blink 1s infinite';
        cursor.className = 'typing-cursor';
        
        let index = 0;
        const typeWriter = () => {
            if (index < text.length) {
                subtitle.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 80);
            } else {
                setTimeout(() => {
                    cursor.style.display = 'none';
                }, 2000);
            }
        };
        
        subtitle.appendChild(cursor);
        setTimeout(typeWriter, 1500);
    }

    // Enhanced parallax with performance optimization
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        const parallaxElements = document.querySelectorAll('.character-3d');
        parallaxElements.forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight && 
                element.getBoundingClientRect().bottom > 0) {
                element.style.transform = `translateY(${rate}px)`;
            }
        });
        
        ticking = false;
    }
    
    function requestParallaxUpdate() {
        if (!ticking && window.innerWidth > 768) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestParallaxUpdate, { passive: true });

    // Modern micro-interactions
    const addHoverSound = (element) => {
        element.addEventListener('mouseenter', () => {
            // Visual feedback only (no actual sound for accessibility)
            element.style.filter = 'brightness(1.1)';
        });
        element.addEventListener('mouseleave', () => {
            element.style.filter = '';
        });
    };

    // Add subtle hover effects to interactive elements
    document.querySelectorAll('.nav-link, .cta-button, .learning-item, .about-card').forEach(addHoverSound);

    // Enhanced form interactions
    const formInputs = document.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        const container = input.parentElement;
        
        input.addEventListener('focus', () => {
            container.style.transform = 'scale(1.02)';
            container.style.boxShadow = '0 0 0 2px rgba(0, 212, 255, 0.3)';
        });
        
        input.addEventListener('blur', () => {
            container.style.transform = '';
            container.style.boxShadow = '';
        });
    });

    // Smooth page transitions
    const pageLinks = document.querySelectorAll('a[href^="/"]');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href.includes('/materials/')) {
                e.preventDefault();
                
                // Add page transition effect
                document.body.style.opacity = '0.8';
                document.body.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    window.location.href = this.href;
                }, 300);
            }
        });
    });

    // Add modern tooltips to action buttons
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'modern-tooltip';
            tooltip.textContent = this.getAttribute('title');
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 10000;
                pointer-events: none;
                backdrop-filter: blur(10px);
                animation: fadeInUp 0.2s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
            }
        });
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Animate hero elements
        const heroElements = [
            document.querySelector('.zenotika-title'),
            document.querySelector('.hero-subtitle'),
            document.querySelector('.character-3d'),
            document.querySelector('.hero-description'),
            document.querySelector('.hero-cta')
        ];
        
        heroElements.forEach((element, index) => {
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.animation = `fadeInUp 0.8s ease forwards ${index * 0.2}s`;
            }
        });
    });

    // Easter egg - Konami code
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', function(e) {
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // Easter egg activated
                document.body.style.filter = 'hue-rotate(180deg)';
                setTimeout(() => {
                    document.body.style.filter = '';
                }, 3000);
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // Performance optimization: Preload critical resources
    const preloadLinks = [
        '/materials/program-dasar.html',
        '/materials/asd.html',
        '/materials/basis-data.html',
        '/materials/web.html'
    ];
    
    preloadLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
    });

    // Modern loading states for CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        if (button.href && button.href.includes('/materials/')) {
            button.addEventListener('click', function(e) {
                const originalText = this.textContent;
                this.style.pointerEvents = 'none';
                this.innerHTML = '<span style="opacity: 0.7;">Memuat...</span>';
                
                // Reset after delay (simulate loading)
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.pointerEvents = '';
                }, 1000);
            });
        }
    });

    // Dynamic: Announcement Bar and Events
    initDynamicContent();
});

// Additional CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: rippleEffect 0.6s linear;
        pointer-events: none;
    }

    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .loaded {
        overflow-x: hidden;
    }

    .character-3d:hover {
        cursor: pointer;
    }
`;
document.head.appendChild(style);

// --- Dynamic content loader ---
async function initDynamicContent() {
    try {
        const cfg = await fetchJson('/data/config.json');
        if (cfg) {
            setupAnnouncement(cfg.announcements || []);
            await setupEvents(cfg.events || {});
        }
    } catch (e) {
        // ignore dynamic failures to keep page working offline
    }
}

async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch failed');
    return res.json();
}

function setupAnnouncement(announcements) {
    const bar = document.getElementById('announcement-bar');
    if (!bar || !announcements.length) return;

    const today = new Date();
    const active = announcements.find(a => !a.until || new Date(a.until) >= today);
    if (!active) return;

    const textEl = bar.querySelector('.announcement-text');
    const cta = bar.querySelector('.announcement-cta');
    const dismiss = bar.querySelector('.announcement-dismiss');

    textEl.textContent = active.message;
    if (active.link) {
        cta.href = active.link;
        cta.style.display = 'inline-flex';
    } else {
        cta.style.display = 'none';
    }

    const dismissed = localStorage.getItem('zen_announce_dismissed');
    if (dismissed === active.message) return; // already dismissed current message

    bar.classList.remove('hidden');
    dismiss.addEventListener('click', () => {
        bar.classList.add('hidden');
        localStorage.setItem('zen_announce_dismissed', active.message);
    });
}

async function setupEvents(eventsCfg) {
    const grid = document.getElementById('events');
    const empty = document.getElementById('events-empty');
    if (!grid) return;

    let items = [];
    try {
        if (eventsCfg.source === 'csv' && eventsCfg.csvUrl) {
            const csv = await (await fetch(eventsCfg.csvUrl, { cache: 'no-store' })).text();
            items = parseCSV(csv);
        } else if (eventsCfg.jsonUrl) {
            items = await fetchJson(eventsCfg.jsonUrl);
        }
    } catch (e) {
        // ignore load error
    }

    // filter upcoming events
    const now = new Date();
    const upcoming = (items || []).filter(ev => {
        try { return new Date(ev.date) >= new Date(now.toDateString()); } catch { return false; }
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!upcoming.length) {
        if (empty) empty.hidden = false;
        return;
    }

    const frag = document.createDocumentFragment();
    upcoming.forEach(ev => {
        const card = document.createElement('div');
        card.className = 'info-card';
        const d = new Date(ev.date);
        const dateStr = d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'short' });
        card.innerHTML = `
            <div class="info-date">${dateStr}</div>
            <h4>${escapeHtml(ev.title || 'Acara')}</h4>
            <p>${escapeHtml(ev.description || '')}</p>
            ${ev.location ? `<p><strong>Lokasi:</strong> ${escapeHtml(ev.location)}</p>` : ''}
            ${ev.link ? `<p><a href="${ev.link}" target="_blank" rel="noopener">Detail/Daftar</a></p>` : ''}
        `;
        frag.appendChild(card);
    });
    grid.appendChild(frag);
}

function parseCSV(text) {
    // Expect header: date,title,description,location,link
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const header = lines[0].split(',').map(h => h.trim());
    const idx = (k) => header.indexOf(k);
    const out = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = splitCsvLine(lines[i]);
        out.push({
            date: cols[idx('date')] || '',
            title: cols[idx('title')] || '',
            description: cols[idx('description')] || '',
            location: cols[idx('location')] || '',
            link: cols[idx('link')] || ''
        });
    }
    return out;
}

function splitCsvLine(line) {
    const res = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
            else { inQuotes = !inQuotes; }
        } else if (ch === ',' && !inQuotes) {
            res.push(cur); cur = '';
        } else {
            cur += ch;
        }
    }
    res.push(cur);
    return res.map(s => s.trim());
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}