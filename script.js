// --- Utility Functions ---
/**
 * Debounce function to limit the rate at which a function gets called.
 * @param {Function} func The function to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

/**
 * Fetches and populates the announcement bar from a JSON data source.
 * This function is designed to be self-contained and resilient to errors.
 */
const loadAnnouncement = async () => {
    const announcementBar = document.getElementById('announcement-bar');
    if (!announcementBar) return;

    try {
        // Use a cache-busting query parameter for development, can be removed in production
        const response = await fetch(`/data/announcements.json?v=${new Date().getTime()}`);
        if (!response.ok) {
            // Don't show an error to the user, just log it for the developer.
            console.error(`Failed to fetch announcements: ${response.statusText}`);
            return;
        }

        const data = await response.json();
        const announcement = data.latest;

        if (announcement && announcement.active) {
            const dismissedKey = `announcement_dismissed_${announcement.id}`;
            if (localStorage.getItem(dismissedKey) === 'true') {
                return; // Don't show if dismissed
            }

            const textEl = announcementBar.querySelector('.announcement-text');
            const ctaEl = announcementBar.querySelector('.announcement-cta');
            const dismissButton = announcementBar.querySelector('.announcement-dismiss');

            textEl.textContent = announcement.text;
            ctaEl.textContent = announcement.cta_text;
            ctaEl.href = announcement.cta_link;

            announcementBar.classList.remove('hidden');

            // Use { once: true } to ensure the event listener is added only once.
            dismissButton.addEventListener('click', () => {
                announcementBar.classList.add('hidden');
                localStorage.setItem(dismissedKey, 'true');
            }, { once: true });
        }
    } catch (error) {
        console.error('An error occurred while loading the announcement:', error);
    }
};

// --- Modern UI/UX Interactions for Zenotika 2025 ---
document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.querySelector(".navbar");
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const progressBar = document.querySelector('.progress-bar');

    // --- Navbar & Progress Bar ---
    const updateNavbarAndProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        // Progress bar
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }

        // Navbar background on scroll
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active nav link highlighting
        let currentSection = "";
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop - navbar.offsetHeight - 50;
            if (scrollTop >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSection) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener("scroll", updateNavbarAndProgress);
    updateNavbarAndProgress(); // Initial call

    // --- Mobile Navigation ---
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        document.body.classList.toggle('no-scroll'); // Prevent scrolling when menu is open
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            document.body.classList.remove('no-scroll');
        });
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - navbar.offsetHeight;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Card Spotlight Effect ---
    const cards = document.querySelectorAll('.about-card, .learning-item');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });

    // --- Intersection Observer for Fade-in Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.about-card, .learning-item, .info-card, .contact-form, .footer p').forEach(el => {
        fadeInObserver.observe(el);
    });

    // --- Theme Switcher ---
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.checked = true;
        } else {
            document.body.classList.remove('light-mode');
            themeToggle.checked = false;
        }
    };

    applyTheme(currentTheme);

    themeToggle.addEventListener('change', function() {
        const newTheme = this.checked ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- Material Search Functionality ---
    const searchInput = document.getElementById('material-search');
    const learningItems = document.querySelectorAll('.learning-item');
    const noResultsMessage = document.getElementById('no-results');

    if (searchInput) {
        const handleSearch = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            let visibleItems = 0;

            learningItems.forEach(item => {
                const tags = item.dataset.tags.toLowerCase();
                if (tags.includes(searchTerm)) {
                    item.classList.remove('hidden');
                    visibleItems++;
                } else {
                    item.classList.add('hidden');
                }
            });

            if (visibleItems === 0 && searchTerm.length > 0) {
                noResultsMessage.classList.remove('hidden');
            } else {
                noResultsMessage.classList.add('hidden');
            }
        };

        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // --- Form Submission ---
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Mengirim...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = 'Pesan Terkirim!';
                submitBtn.style.background = 'var(--accent-glow)';
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    this.reset();
                }, 2500);
            }, 1500);
        });
    }

    /**
     * Initializes all dynamic content loaders for the site.
     * This acts as an orchestrator for fetching and displaying content from the /data/ directory.
     */
    const initDynamicContent = () => {
        loadAnnouncement();
        // Future loaders like loadEvents() can be added here.
    };

    initDynamicContent();
});