// Modern Navigation with Enhanced Interactions
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.querySelector('.scroll-progress');
    
    // Modern scroll progress indicator
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        if (scrollProgress) {
            scrollProgress.style.width = scrollPercent + '%';
        }
    }
    
    // Enhanced navbar scroll effects
    let lastScrollTop = 0;
    let scrollTimeout;
    
    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for styling
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll (improved logic)
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else if (scrollTop < lastScrollTop || scrollTop <= 100) {
            // Scrolling up or near top
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        
        // Update scroll progress
        updateScrollProgress();
    }
    
    // Throttled scroll handler for better performance
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateNavbar, 8);
    }, { passive: true });

    // Enhanced mobile menu toggle with modern animations
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            const isActive = hamburger.classList.contains('active');
            
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Enhanced body scroll prevention
            if (!isActive) {
                document.body.style.overflow = 'hidden';
                document.body.style.height = '100vh';
            } else {
                document.body.style.overflow = '';
                document.body.style.height = '';
            }
        });
    }

    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Enhanced smooth scrolling with offset calculation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = navbar.offsetHeight;
                const offsetTop = targetSection.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Add active state animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
    });
    
    // Modern Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const animationObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animations
    const animateElements = document.querySelectorAll('.about-card, .learning-item, .info-card, .section-title');
    animateElements.forEach(el => {
        animationObserver.observe(el);
    });

    // Enhanced Character Interactions
    const character = document.querySelector('.character-3d');
    let isAnimating = false;
    
    if (character) {
        // Advanced click interaction with bounce effect
        character.addEventListener('click', function(e) {
            if (!isAnimating) {
                isAnimating = true;
                
                // Create ripple effect at click position
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('div');
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background: rgba(0, 212, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: rippleEffect 0.6s linear;
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                `;
                
                this.appendChild(ripple);
                
                // Character animation sequence
                this.style.animation = 'none';
                this.style.transform = 'scale(1.2) rotateY(720deg)';
                this.style.filter = 'drop-shadow(0 15px 30px rgba(0, 212, 255, 0.6))';
                
                setTimeout(() => {
                    this.style.animation = 'floatAnimation 6s ease-in-out infinite';
                    this.style.transform = '';
                    this.style.filter = '';
                    ripple.remove();
                    isAnimating = false;
                }, 1000);
            }
        });
        
        // Enhanced mouse tracking with smoother movement
        let mouseX = 0, mouseY = 0;
        let charX = 0, charY = 0;
        
        character.addEventListener('mousemove', function(e) {
            if (!isAnimating) {
                const rect = this.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                mouseX = (e.clientX - centerX) / rect.width * 30;
                mouseY = (e.clientY - centerY) / rect.height * 30;
            }
        });
        
        // Smooth character movement animation
        function animateCharacter() {
            if (!isAnimating) {
                charX += (mouseX - charX) * 0.1;
                charY += (mouseY - charY) * 0.1;
                
                character.style.transform = `rotateY(${charX}deg) rotateX(${-charY}deg)`;
            }
            requestAnimationFrame(animateCharacter);
        }
        animateCharacter();
        
        character.addEventListener('mouseleave', function() {
            if (!isAnimating) {
                mouseX = 0;
                mouseY = 0;
            }
        });
    }
            if (!isAnimating) {
                isAnimating = true;
                this.style.animation = 'none';
                this.style.transform = 'scale(1.1) rotateY(360deg)';
                
                setTimeout(() => {
                    this.style.animation = 'floatAnimation 4s ease-in-out infinite';
                    this.style.transform = '';
                    isAnimating = false;
                }, 1000);
            }
        });

        // Mouse move effect on character
        character.addEventListener('mousemove', function(e) {
            if (!isAnimating) {
                const rect = this.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - centerX) / rect.width;
                const deltaY = (e.clientY - centerY) / rect.height;
                
                this.style.transform = `rotateY(${deltaX * 20}deg) rotateX(${-deltaY * 20}deg)`;
            }
        });

        character.addEventListener('mouseleave', function() {
            if (!isAnimating) {
                this.style.transform = '';
            }
        });
    }

    // CTA Button interactions
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
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

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate sections on scroll
    const animateElements = document.querySelectorAll('.about-card, .learning-item, .info-card');
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // Typewriter effect for subtitle
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) {
        const text = subtitle.textContent;
        subtitle.textContent = '';
        subtitle.style.borderRight = '2px solid #00d4ff';
        
        let index = 0;
        const typeWriter = () => {
            if (index < text.length) {
                subtitle.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 100);
            } else {
                setTimeout(() => {
                    subtitle.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        setTimeout(typeWriter, 2000);
    }

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.character-3d');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
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