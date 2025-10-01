// --- Imports ---
import searchModal from './src/search-modal.js';
import analytics from './src/analytics.js';

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
    const response = await fetch('/data/announcements.json', { cache: 'no-store' });
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

/**
 * Fetches and populates the community content grid.
 */
let communityData = [];
let activeTag = null;

const hasDocument = typeof document !== 'undefined';
const hasWindow = typeof window !== 'undefined';
const matchMediaAvailable = hasWindow && typeof window.matchMedia === 'function';
const reduceMotionMediaQuery = matchMediaAvailable ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
let shouldReduceMotion = reduceMotionMediaQuery ? reduceMotionMediaQuery.matches : false;
let hashFocusTimeoutId = null;

const getQueryParam = (key) => {
    if (!hasWindow || !key) return '';
    const value = new URLSearchParams(window.location.search).get(key);
    return value !== null ? value : '';
};

const updateQueryParam = (key, value) => {
    if (!hasWindow || typeof history === 'undefined' || typeof history.replaceState !== 'function' || !key) return;
    const url = new URL(window.location.href);
    const trimmedValue = typeof value === 'string' ? value.trim() : '';

    if (trimmedValue) {
        if (url.searchParams.get(key) === trimmedValue) {
            return;
        }
        url.searchParams.set(key, trimmedValue);
    } else {
        if (!url.searchParams.has(key)) {
            return;
        }
        url.searchParams.delete(key);
    }

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    history.replaceState(null, '', nextUrl);
};

const fadeInSelectors = '.fade-in, .feature-card, .learning-item, .info-card, .contact-info-card, .contact-form, .community-card, .footer-column';

let fadeInObserver = null;

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const intersectionCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.dataset.fadeObserved = 'done';
            observer.unobserve(entry.target);
        }
    });
};

const createFadeInObserver = () => {
    if (fadeInObserver) {
        fadeInObserver.disconnect();
        fadeInObserver = null;
    }

    if (shouldReduceMotion || typeof IntersectionObserver === 'undefined') {
        return;
    }

    fadeInObserver = new IntersectionObserver(intersectionCallback, observerOptions);
};

const observeFadeInTargets = (elements) => {
    if (!elements) return;
    const targets = Array.from(elements);
    if (targets.length === 0) return;

    if (shouldReduceMotion || !fadeInObserver) {
        targets.forEach(target => {
            target.classList.add('is-visible');
            target.dataset.fadeObserved = 'done';
        });
        return;
    }

    targets.forEach(target => {
        if (target.dataset.fadeObserved === 'pending' || target.dataset.fadeObserved === 'done') {
            return;
        }
        target.dataset.fadeObserved = 'pending';
        fadeInObserver.observe(target);
    });
};

const clearSpotlightCoordinates = (card) => {
    card.style.removeProperty('--x');
    card.style.removeProperty('--y');
};

const spotlightEventHandler = (event) => {
    const card = event.currentTarget;
    if (!card) return;

    if (shouldReduceMotion) {
        clearSpotlightCoordinates(card);
        return;
    }

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        clearSpotlightCoordinates(card);
        return;
    }

    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
};

const applySpotlightEffectToCards = (root = document) => {
    if (!hasDocument || !root || typeof root.querySelectorAll !== 'function') return;

    const cards = root.querySelectorAll('.feature-card, .learning-item, .community-card');
    cards.forEach(card => {
        if (card.dataset.spotlightBound === 'true') {
            if (shouldReduceMotion) {
                clearSpotlightCoordinates(card);
            }
            return;
        }

        card.addEventListener('mousemove', spotlightEventHandler);
        card.addEventListener('mouseleave', () => clearSpotlightCoordinates(card));
        card.dataset.spotlightBound = 'true';

        if (shouldReduceMotion) {
            clearSpotlightCoordinates(card);
        }
    });
};

const applyReduceMotionPreferences = () => {
    if (!hasDocument) return;

    document.documentElement.classList.toggle('prefers-reduced-motion', shouldReduceMotion);

    if (shouldReduceMotion) {
        if (fadeInObserver) {
            fadeInObserver.disconnect();
            fadeInObserver = null;
        }

        document.querySelectorAll(fadeInSelectors).forEach(target => {
            target.classList.add('is-visible');
            target.dataset.fadeObserved = 'done';
        });

        document.querySelectorAll('.feature-card, .learning-item, .community-card').forEach(clearSpotlightCoordinates);
    } else {
        createFadeInObserver();
        observeFadeInTargets(document.querySelectorAll(fadeInSelectors));
    }
};

if (reduceMotionMediaQuery) {
    const handleReduceMotionChange = (event) => {
        shouldReduceMotion = event.matches;
        applyReduceMotionPreferences();
        applySpotlightEffectToCards();
    };

    if (typeof reduceMotionMediaQuery.addEventListener === 'function') {
        reduceMotionMediaQuery.addEventListener('change', handleReduceMotionChange);
    } else if (typeof reduceMotionMediaQuery.addListener === 'function') {
        reduceMotionMediaQuery.addListener(handleReduceMotionChange);
    }
}

const showCommunityEmptyState = (message) => {
    const emptyMessage = document.getElementById('community-empty');
    if (!emptyMessage) return;

    const messageParagraph = emptyMessage.querySelector('p');
    if (messageParagraph) {
        messageParagraph.textContent = message;
    }

    emptyMessage.classList.remove('hidden');
    emptyMessage.hidden = false;
};

const loadCommunityContent = async () => {
    const grid = document.getElementById('community-grid');
    const emptyMessage = document.getElementById('community-empty');
    if (!grid) return;

    grid.setAttribute('aria-busy', 'true');
    if (emptyMessage) {
        emptyMessage.classList.add('hidden');
        emptyMessage.hidden = true;
    }

    try {
        const response = await fetch('/data/community.json', { cache: 'no-store' });
        if (!response.ok) {
            showCommunityEmptyState('Gagal memuat konten komunitas. Coba lagi nanti.');
            grid.setAttribute('aria-busy', 'false');
            return;
        }

        const items = await response.json();
        communityData = items;

        if (!items || items.length === 0) {
            showCommunityEmptyState('Belum ada konten komunitas yang dapat ditampilkan saat ini.');
            grid.setAttribute('aria-busy', 'false');
            return;
        }

        generateTagFilters(items);
        displayCommunityItems(items);
        initCommunitySearch();
        applyCommunityQueryState();

    } catch (error) {
        console.error('Failed to load community content:', error);
        showCommunityEmptyState('Terjadi kesalahan saat memuat konten komunitas.');
    } finally {
        grid.setAttribute('aria-busy', 'false');
    }
};

const generateTagFilters = (items) => {
    const tagFiltersContainer = document.getElementById('tag-filters');
    if (!tagFiltersContainer) return;

    tagFiltersContainer.innerHTML = '';
    activeTag = null;

    const allTags = new Set();
    items.forEach(item => {
        item.tags.forEach(tag => allTags.add(tag));
    });

    const allBtn = document.createElement('button');
    allBtn.className = 'tag-filter-btn active';
    allBtn.textContent = 'Semua';
    allBtn.setAttribute('data-tag', 'all');
    allBtn.setAttribute('aria-pressed', 'true');
    allBtn.setAttribute('aria-label', 'Filter: Tampilkan semua proyek');
    allBtn.type = 'button';
    allBtn.addEventListener('click', () => handleTagFilter('all'));
    tagFiltersContainer.appendChild(allBtn);

    [...allTags].sort((a, b) => a.localeCompare(b, 'id')).forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-filter-btn';
        btn.textContent = tag;
        btn.setAttribute('data-tag', tag);
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', `Filter: ${tag}`);
        btn.type = 'button';
        btn.addEventListener('click', () => handleTagFilter(tag));
        tagFiltersContainer.appendChild(btn);
    });
};

const handleTagFilter = (tag) => {
    activeTag = tag === 'all' ? null : tag;

    const buttons = document.querySelectorAll('.tag-filter-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-tag') === tag) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    });

    filterCommunityContent();
};

const initCommunitySearch = () => {
    const searchInput = document.getElementById('community-search');
    if (!searchInput) return;

    const handleSearch = () => {
        filterCommunityContent();
    };

    searchInput.addEventListener('input', debounce(handleSearch, 300));
};

const applyCommunityQueryState = () => {
    const searchInput = document.getElementById('community-search');
    const searchQuery = getQueryParam('komunitas');
    const tagQuery = getQueryParam('tag');

    if (searchInput && searchQuery) {
        searchInput.value = searchQuery;
    }

    if (tagQuery) {
        const buttons = document.querySelectorAll('.tag-filter-btn');
        const matchingButton = Array.from(buttons).find(btn => btn.dataset.tag === tagQuery);
        if (matchingButton) {
            handleTagFilter(tagQuery);
            return;
        }
    }

    handleTagFilter('all');
};

const filterCommunityContent = () => {
    const searchInput = document.getElementById('community-search');
    const rawSearchValue = searchInput ? searchInput.value.trim() : '';
    const searchTerm = rawSearchValue.toLowerCase();

    let filteredItems = [...communityData];

    if (activeTag) {
        filteredItems = filteredItems.filter(item => item.tags.includes(activeTag));
    }

        updateQueryParam('komunitas', rawSearchValue);
        updateQueryParam('tag', activeTag || '');
    if (searchTerm.length > 0) {
        filteredItems = filteredItems.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(searchTerm);
            const descMatch = item.description.toLowerCase().includes(searchTerm);
            const authorMatch = item.author.toLowerCase().includes(searchTerm);
            return titleMatch || descMatch || authorMatch;
        });
    }

    displayCommunityItems(filteredItems);
    observeFadeInTargets(document.querySelectorAll('.info-card, .contact-info-card, .contact-form'));
};

const displayCommunityItems = (items) => {
    const grid = document.getElementById('community-grid');
    const emptyMessage = document.getElementById('community-empty');
    if (!grid) return;

    grid.setAttribute('aria-busy', 'true');
    grid.innerHTML = '';

    if (items.length === 0) {
        showCommunityEmptyState('Tidak ada proyek yang sesuai dengan filter Anda.');
        grid.setAttribute('aria-busy', 'false');
        return;
    }

    if (emptyMessage) {
        emptyMessage.classList.add('hidden');
        emptyMessage.hidden = true;
    }

    const fragment = document.createDocumentFragment();
    const usedIds = new Set();

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'community-card';

        const manualId = item && typeof item.id === 'string' ? item.id.trim() : '';
        const baseId = manualId || slugify(item?.title, `community-card-${index + 1}`);
        let uniqueId = baseId || `community-card-${index + 1}`;
        let duplicateCounter = 2;

        while (usedIds.has(uniqueId)) {
            uniqueId = `${baseId || `community-card-${index + 1}`}-${duplicateCounter++}`;
        }

        usedIds.add(uniqueId);
        card.id = uniqueId;
        card.setAttribute('role', 'listitem');

        const pictureMarkup = createResponsivePictureMarkup(item.image, item.title);

        card.innerHTML = `
            ${pictureMarkup}
            <div class="card-content">
                <h3>${escapeHtml(item.title)}</h3>
                <p class="author">Oleh: ${escapeHtml(item.author)}</p>
                <p>${escapeHtml(item.description)}</p>
                <div class="card-tags">
                    ${item.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
                <a href="${escapeHtml(item.link)}" class="card-link" target="_blank" rel="noopener noreferrer">Lihat Proyek</a>
            </div>
        `;
        attachResponsiveImageHandlers(card, item.title);
        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
    applySpotlightEffectToCards(grid);
    observeFadeInTargets(grid.querySelectorAll('.community-card'));
    focusCommunityCardFromHash();
    grid.setAttribute('aria-busy', 'false');
};

const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

function slugify(value, fallback = '') {
    if (value === null || value === undefined) return fallback;
    const slug = value
        .toString()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    return slug || fallback;
}

const RESPONSIVE_IMAGE_WIDTHS = [360, 540, 720, 960, 1200];

const DEFAULT_FALLBACK_INITIAL = 'Z';

const getFallbackInitial = (title) => {
    const raw = (title || '').trim();
    if (!raw) return DEFAULT_FALLBACK_INITIAL;
    const firstChar = raw.charAt(0);
    const alphanumericMatch = firstChar.match(/[A-Za-z0-9]/);
    return (alphanumericMatch ? alphanumericMatch[0] : DEFAULT_FALLBACK_INITIAL).toUpperCase();
};

const createFallbackMarkup = (title) => {
    const safeTitleForAlt = `Gambar Proyek: ${title || 'Tanpa Judul'}`;
    const fallbackInitial = escapeHtml(getFallbackInitial(title));
    return `<div class="card-image card-image--fallback" role="img" aria-label="${escapeHtml(safeTitleForAlt)}">${fallbackInitial}</div>`;
};

const createFallbackElement = (title) => {
    const template = document.createElement('template');
    template.innerHTML = createFallbackMarkup(title).trim();
    return template.content.firstElementChild;
};

const buildOptimizedImageUrl = (url, { width, format } = {}) => {
    if (!url) return null;
    try {
        const optimizedUrl = new URL(url);
        optimizedUrl.searchParams.set('auto', 'format');
        optimizedUrl.searchParams.set('fit', 'crop');
        if (width) {
            optimizedUrl.searchParams.set('w', String(width));
            optimizedUrl.searchParams.set('q', width >= 960 ? '75' : '80');
        }
        if (format) {
            optimizedUrl.searchParams.set('fm', format);
        } else {
            optimizedUrl.searchParams.delete('fm');
        }
        return optimizedUrl.toString();
    } catch (error) {
        console.warn('Gagal mengoptimalkan URL gambar:', error);
        return url;
    }
};

const buildImageSrcSet = (url, format) => {
    const candidates = RESPONSIVE_IMAGE_WIDTHS.map(width => {
        const candidateUrl = buildOptimizedImageUrl(url, { width, format });
        if (!candidateUrl) return null;
        return `${escapeHtml(candidateUrl)} ${width}w`;
    }).filter(Boolean);
    return candidates.length > 0 ? candidates.join(', ') : '';
};

const createResponsivePictureMarkup = (url, title) => {
    const safeTitleForAlt = `Gambar Proyek: ${title || 'Tanpa Judul'}`;
    const sizesValue = '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 400px';

    if (!url) {
        return createFallbackMarkup(title);
    }

    const defaultSrc = escapeHtml(buildOptimizedImageUrl(url, { width: 960 }) || url);
    const webpSrcSet = buildImageSrcSet(url, 'webp');
    const fallbackSrcSet = buildImageSrcSet(url);
    const sizesAttr = escapeHtml(sizesValue);

    return `
        <picture>
            ${webpSrcSet ? `<source type="image/webp" srcset="${webpSrcSet}" sizes="${sizesAttr}">` : ''}
            ${fallbackSrcSet ? `<source type="image/jpeg" srcset="${fallbackSrcSet}" sizes="${sizesAttr}">` : ''}
            <img src="${defaultSrc}" alt="${escapeHtml(safeTitleForAlt)}" class="card-image" loading="lazy" decoding="async" fetchpriority="low">
        </picture>
    `;
};

const attachResponsiveImageHandlers = (card, title) => {
    if (!card) return;
    const picture = card.querySelector('picture');
    const image = picture ? picture.querySelector('img.card-image') : card.querySelector('img.card-image');
    if (!image) return;

    const markAsLoaded = () => {
        image.classList.add('is-loaded');
    };

    const replaceWithFallback = () => {
        const fallbackElement = createFallbackElement(title);
        if (!fallbackElement) return;

        if (picture && picture.parentNode) {
            picture.replaceWith(fallbackElement);
        } else if (image.parentNode) {
            image.replaceWith(fallbackElement);
        }
    };

    if (image.complete) {
        if (image.naturalWidth > 0) {
            markAsLoaded();
        } else {
            replaceWithFallback();
        }
    } else {
        image.addEventListener('load', markAsLoaded, { once: true });
        image.addEventListener('error', replaceWithFallback, { once: true });
    }
};

function restoreCardTabIndex(card) {
    if (!card || !card.dataset) return;
    const previous = card.dataset.prevTabindex;
    if (previous === undefined) return;
    if (previous === '') {
        card.removeAttribute('tabindex');
    } else {
        card.setAttribute('tabindex', previous);
    }
    delete card.dataset.prevTabindex;
}

function highlightCommunityCard(card) {
    if (!hasDocument || !card) return;

    document.querySelectorAll('.community-card.hash-focus').forEach(other => {
        if (other !== card) {
            other.classList.remove('hash-focus');
            restoreCardTabIndex(other);
        }
    });

    if (hashFocusTimeoutId) {
        clearTimeout(hashFocusTimeoutId);
        hashFocusTimeoutId = null;
    }

    const previousTabIndex = card.getAttribute('tabindex');
    if (previousTabIndex !== null) {
        card.dataset.prevTabindex = previousTabIndex;
    } else {
        card.dataset.prevTabindex = '';
        card.setAttribute('tabindex', '-1');
    }

    card.classList.add('hash-focus');

    requestAnimationFrame(() => {
        try {
            card.focus({ preventScroll: true });
        } catch (error) {
            card.focus();
        }
    });

    hashFocusTimeoutId = window.setTimeout(() => {
        card.classList.remove('hash-focus');
        restoreCardTabIndex(card);
        hashFocusTimeoutId = null;
    }, 2200);
}

function focusCommunityCardFromHash() {
    if (!hasWindow || !hasDocument) return;
    const hash = window.location.hash;
    if (!hash || hash.length <= 1) return;

    const cardId = decodeURIComponent(hash.slice(1));
    if (!cardId) return;

    const grid = document.getElementById('community-grid');
    if (!grid) return;

    const target = document.getElementById(cardId);
    if (!target || !grid.contains(target) || !target.classList.contains('community-card')) return;

    const behavior = shouldReduceMotion ? 'auto' : 'smooth';

    requestAnimationFrame(() => {
        try {
            target.scrollIntoView({ behavior, block: 'center' });
        } catch (error) {
            target.scrollIntoView({ behavior });
        }
        highlightCommunityCard(target);
    });
}

if (hasWindow) {
    window.addEventListener('hashchange', () => {
        focusCommunityCardFromHash();
    });
}

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
                const targetPosition = Math.max(offsetTop, 0);
                window.scrollTo({
                    top: targetPosition,
                    behavior: shouldReduceMotion ? 'auto' : 'smooth'
                });
            }
        });
    });

    requestAnimationFrame(() => {
        updateNavbarAndProgress();
        // --- Card Spotlight & Motion Preferences ---
        applyReduceMotionPreferences();
        applySpotlightEffectToCards();
    });

    // --- Theme Switcher ---
    const themeToggle = document.getElementById('theme-toggle');
    const prefersLightMediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
    const storedTheme = localStorage.getItem('theme');
    const detectedTheme = storedTheme
        || document.documentElement.dataset.theme
        || (prefersLightMediaQuery && prefersLightMediaQuery.matches ? 'light' : 'dark');

    const applyTheme = (theme) => {
        const resolvedTheme = theme === 'light' ? 'light' : 'dark';
        document.documentElement.dataset.theme = resolvedTheme;
        document.body.classList.toggle('light-mode', resolvedTheme === 'light');
        if (themeToggle) {
            themeToggle.checked = resolvedTheme === 'light';
        }
    };

    applyTheme(detectedTheme);

    if (!storedTheme && prefersLightMediaQuery) {
        prefersLightMediaQuery.addEventListener('change', (event) => {
            applyTheme(event.matches ? 'light' : 'dark');
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', function () {
            const newTheme = this.checked ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // --- Keyboard Shortcuts ---
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const openShortcuts = () => {
        if (!shortcutsModal) return;
        shortcutsModal.classList.remove('hidden');
        const firstFocusable = shortcutsModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
    };
    const closeShortcuts = () => {
        if (!shortcutsModal) return;
        shortcutsModal.classList.add('hidden');
    };
    document.addEventListener('keydown', (e) => {
        const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';

        if (key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const search = document.getElementById('material-search');
            if (search) {
                e.preventDefault();
                search.focus();
                search.select();
            }
        }
        if ((e.key === '?' || (e.shiftKey && e.key === '/')) && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            openShortcuts();
        }
        if (e.key === 'Escape') {
            closeShortcuts();
        }
        // Theme toggle shortcut: Ctrl/Cmd + Shift + X (avoid browser conflicts)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && key === 'x') {
            e.preventDefault();
            const current = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', current);
            document.documentElement.dataset.theme = current;
            document.body.classList.toggle('light-mode', current === 'light');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.checked = current === 'light';
        }
        // g then h => go home
    });
    // close modal by overlay or close button
    document.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeShortcuts));

    // --- Material Search Functionality ---
    const searchInput = document.getElementById('material-search');
    const learningItems = document.querySelectorAll('.learning-item');
    const noResultsMessage = document.getElementById('no-results');

    if (searchInput) {
        const handleSearch = () => {
            const rawValue = searchInput.value.trim();
            const searchTerm = rawValue.toLowerCase();
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

            if (noResultsMessage) {
                if (visibleItems === 0 && searchTerm.length > 0) {
                    noResultsMessage.classList.remove('hidden');
                } else {
                    noResultsMessage.classList.add('hidden');
                }
            }

            updateQueryParam('materi', rawValue);
        };

        const debouncedSearch = debounce(handleSearch, 300);
        searchInput.addEventListener('input', debouncedSearch);

        const initialQuery = getQueryParam('materi');
        if (initialQuery) {
            searchInput.value = initialQuery;
        }

        handleSearch();
    }

    // --- Form Submission & Validation ---
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        const nameInput = contactForm.querySelector('#name');
        const emailInput = contactForm.querySelector('#email');
        const messageInput = contactForm.querySelector('#message');
        const nameError = contactForm.querySelector('#name-error');
        const emailError = contactForm.querySelector('#email-error');
        const messageError = contactForm.querySelector('#message-error');

        const validateField = (input, errorEl, validator) => {
            const { valid, message } = validator(input.value);
            if (!valid) {
                input.setAttribute('aria-invalid', 'true');
                if (errorEl) {
                    errorEl.textContent = message;
                    errorEl.classList.remove('hidden');
                }
            } else {
                input.removeAttribute('aria-invalid');
                if (errorEl) {
                    errorEl.textContent = '';
                    errorEl.classList.add('hidden');
                }
            }
            return valid;
        };

        const nameValidator = (v) => ({ valid: v.trim().length >= 2, message: 'Nama minimal 2 karakter.' });
        const emailValidator = (v) => ({
            valid: /^[^@\s]+@mahasiswa\.unikom\.ac\.id$/i.test(v.trim()),
            message: 'Gunakan email kampus @mahasiswa.unikom.ac.id.'
        });
        const messageValidator = (v) => ({ valid: v.trim().length >= 10, message: 'Pesan minimal 10 karakter.' });

        ['input', 'blur'].forEach(evt => {
            if (nameInput) nameInput.addEventListener(evt, () => validateField(nameInput, nameError, nameValidator));
            if (emailInput) emailInput.addEventListener(evt, () => validateField(emailInput, emailError, emailValidator));
            if (messageInput) messageInput.addEventListener(evt, () => validateField(messageInput, messageError, messageValidator));
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const isNameOk = nameInput ? validateField(nameInput, nameError, nameValidator) : true;
            const isEmailOk = emailInput ? validateField(emailInput, emailError, emailValidator) : true;
            const isMessageOk = messageInput ? validateField(messageInput, messageError, messageValidator) : true;
            if (!(isNameOk && isEmailOk && isMessageOk)) {
                const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
                if (firstInvalid) firstInvalid.focus();
                
                // Show error toast
                if (window.toast) {
                    window.toast.error('Please fix the errors in the form', {
                        description: 'Check the highlighted fields and try again',
                        duration: 4000
                    });
                }
                return;
            }
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'Mengirim...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = 'Pesan Terkirim!';
                submitBtn.style.background = 'var(--color-accent)';
                
                // Show success toast with action
                if (window.toast) {
                    window.toast.success('Message sent successfully!', {
                        description: 'We\'ll get back to you within 24 hours',
                        duration: 5000,
                        action: {
                            label: 'Send Another',
                            name: 'send-another',
                            onClick: () => {
                                submitBtn.textContent = originalText;
                                submitBtn.disabled = false;
                                submitBtn.style.background = '';
                                contactForm.reset();
                                nameInput?.focus();
                            }
                        }
                    });
                }
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    this.reset();
                }, 2500);
            }, 1500);
        });
    }

    loadAnnouncement();

    if (document.getElementById('community-grid')) {
        loadCommunityContent();
    }

    // Events skeleton state toggle when content loaded (if implemented later)
    const eventsRegion = document.getElementById('events');
    if (eventsRegion) {
        // Mark busy false when DOM paints
        requestAnimationFrame(() => {
            eventsRegion.setAttribute('aria-busy', 'false');
        });
    }
});