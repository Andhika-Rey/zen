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
let forumData = [];
let forumThreadMap = new Map();
let forumVoteState = {};
let activeForumCategory = 'all';
let forumSortMode = 'trending';
let forumSearchTerm = '';
let forumSearchRaw = '';
let initialForumFocusHandled = false;

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

const getLocalizedGreeting = (date = new Date()) => {
    const hours = date.getHours();
    if (hours >= 5 && hours < 11) return 'Selamat pagi';
    if (hours >= 11 && hours < 15) return 'Selamat siang';
    if (hours >= 15 && hours < 19) return 'Selamat sore';
    return 'Selamat malam';
};

const formatStatValue = (value, element) => {
    if (!element) return;
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const format = element.dataset.format || 'number';
    let displayValue = Math.round(value);

    if (!Number.isFinite(displayValue)) {
        displayValue = value;
    }

    if (format === 'compact') {
        const formatter = new Intl.NumberFormat('id-ID', {
            notation: 'compact',
            maximumFractionDigits: 1
        });
        displayValue = formatter.format(value);
    } else {
        const formatter = new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 0
        });
        displayValue = formatter.format(Math.round(value));
    }

    element.textContent = `${prefix}${displayValue}${suffix}`;
};

const animateStatCounter = (element) => {
    if (!element || element.dataset.animated === 'true') return;

    const targetValue = Number(element.dataset.countTarget);
    if (!Number.isFinite(targetValue)) {
        return;
    }

    if (shouldReduceMotion) {
        formatStatValue(targetValue, element);
        element.dataset.animated = 'true';
        return;
    }

    const duration = 1300;
    const start = performance.now();

    const step = (timestamp) => {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = targetValue * eased;
        formatStatValue(current, element);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            formatStatValue(targetValue, element);
            element.dataset.animated = 'true';
        }
    };

    requestAnimationFrame(step);
};

const initStatCounters = () => {
    if (!hasDocument) return;
    const counters = document.querySelectorAll('.stat-card strong[data-count-target]');
    if (counters.length === 0) return;

    if (shouldReduceMotion || typeof IntersectionObserver === 'undefined') {
        counters.forEach(counter => {
            const target = Number(counter.dataset.countTarget);
            formatStatValue(Number.isFinite(target) ? target : 0, counter);
            counter.dataset.animated = 'true';
        });
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStatCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.55, rootMargin: '0px 0px -10%' });

    counters.forEach(counter => observer.observe(counter));
};

const initHeroGreeting = () => {
    if (!hasDocument || !hasWindow) return;
    const greetingElement = document.getElementById('hero-greeting');
    const buildTimeElement = document.getElementById('hero-build-time');

    const updateGreeting = () => {
        if (!greetingElement) return;
        const greeting = getLocalizedGreeting();
        greetingElement.textContent = `${greeting}, mari jelajahi inovasi terbaru Zenotika.`;
    };

    updateGreeting();
    window.setInterval(updateGreeting, 60 * 1000);

    if (buildTimeElement && typeof performance !== 'undefined' && performance.getEntriesByType) {
        const updateBuildTime = () => {
            const navigationEntries = performance.getEntriesByType('navigation');
            const entry = navigationEntries && navigationEntries[0];
            const durationMs = entry ? entry.duration : performance.now();
            const seconds = Math.max(0.3, durationMs / 1000);
            const formatter = new Intl.NumberFormat('id-ID', {
                minimumFractionDigits: seconds < 10 ? 1 : 0,
                maximumFractionDigits: seconds < 10 ? 1 : 0
            });
            buildTimeElement.textContent = `${formatter.format(seconds)}s load`;
        };

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(updateBuildTime, { timeout: 1200 });
        } else {
            window.setTimeout(updateBuildTime, 600);
        }
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
        focusForumThreadFromQuery({ force: true });
    });
}

const getStoredForumVotes = () => {
    if (!hasWindow) return {};
    try {
        const stored = localStorage.getItem('forum_votes');
        if (!stored) return {};
        const parsed = JSON.parse(stored);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.warn('Gagal membaca forum votes dari localStorage:', error);
        return {};
    }
};

const saveStoredForumVotes = (state) => {
    if (!hasWindow) return;
    try {
        localStorage.setItem('forum_votes', JSON.stringify(state));
    } catch (error) {
        console.warn('Gagal menyimpan forum votes ke localStorage:', error);
    }
};

const getThreadVoteDisplay = (threadId) => {
    const thread = forumThreadMap.get(threadId);
    if (!thread) return 0;
    const baseVotes = Number.isFinite(thread.upvotes) ? thread.upvotes : 0;
    const userVote = forumVoteState[threadId] ? 1 : 0;
    return baseVotes + userVote;
};

const formatRelativeTime = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    let diffInSeconds = (date.getTime() - now.getTime()) / 1000;
    const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });
    const divisions = [
        { amount: 60, unit: 'second' },
        { amount: 60, unit: 'minute' },
        { amount: 24, unit: 'hour' },
        { amount: 7, unit: 'day' },
        { amount: 4.34524, unit: 'week' },
        { amount: 12, unit: 'month' },
        { amount: Number.POSITIVE_INFINITY, unit: 'year' }
    ];

    for (const division of divisions) {
        if (Math.abs(diffInSeconds) < division.amount) {
            return rtf.format(Math.round(diffInSeconds), division.unit);
        }
        diffInSeconds /= division.amount;
    }
    return rtf.format(Math.round(diffInSeconds), 'year');
};

const formatAbsoluteDate = (dateInput, { withTime = false } = {}) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';

    const options = withTime
        ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { day: 'numeric', month: 'short', year: 'numeric' };

    return new Intl.DateTimeFormat('id-ID', options).format(date);
};

const loadForumThreads = async () => {
    const list = document.getElementById('forum-threads');
    const emptyState = document.getElementById('forum-empty');
    if (!list) return;

    list.setAttribute('aria-busy', 'true');
    if (emptyState) {
        emptyState.classList.add('hidden');
        emptyState.hidden = true;
    }

    try {
        const response = await fetch('/data/forum.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const items = await response.json();
        forumData = Array.isArray(items) ? items : [];
        forumThreadMap = new Map(forumData.map(thread => [thread.id, thread]));
        forumVoteState = getStoredForumVotes();
        activeForumCategory = 'all';
        forumSortMode = 'trending';
        forumSearchRaw = '';
        forumSearchTerm = '';

        renderForumCategoryFilters(forumData);
        applyForumQueryState();
        initForumSearchAndSort();
        filterForumThreads();
    } catch (error) {
        console.error('Gagal memuat data forum:', error);
        if (emptyState) {
            const heading = emptyState.querySelector('h3');
            if (heading) {
                heading.textContent = 'Forum sementara tidak tersedia';
            }
            const description = emptyState.querySelector('p');
            if (description) {
                description.textContent = 'Terjadi kendala saat memuat data forum. Coba muat ulang halaman atau kembali beberapa saat lagi.';
            }
            emptyState.classList.remove('hidden');
            emptyState.hidden = false;
        }
        list.setAttribute('aria-busy', 'false');
    }
};

const renderForumCategoryFilters = (threads) => {
    const container = document.getElementById('forum-categories');
    if (!container) return;

    container.innerHTML = '';

    const createButton = (label, value) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'forum-category-btn';
        button.dataset.category = value;
        button.textContent = label;
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-checked', 'false');
        button.addEventListener('click', () => {
            setActiveForumCategory(value);
            filterForumThreads();
        });
        return button;
    };

    container.appendChild(createButton('Semua', 'all'));

    const categories = [...new Set(threads.map(thread => thread.category).filter(Boolean))];
    categories.sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));
    categories.forEach(category => {
        container.appendChild(createButton(category, category));
    });

    setActiveForumCategory(activeForumCategory);
};

const setActiveForumCategory = (value) => {
    activeForumCategory = value && value !== 'all' ? value : 'all';
    const buttons = document.querySelectorAll('.forum-category-btn');
    buttons.forEach(btn => {
        const isActive = btn.dataset.category === activeForumCategory;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
};

const initForumSearchAndSort = () => {
    const searchInput = document.getElementById('forum-search-input');
    if (searchInput) {
        const handler = debounce(() => {
            forumSearchRaw = searchInput.value || '';
            forumSearchTerm = forumSearchRaw.trim().toLowerCase();
            filterForumThreads();
        }, 300);
        searchInput.addEventListener('input', handler);
    }

    const sortSelect = document.getElementById('forum-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (event) => {
            const value = event.target.value;
            forumSortMode = value;
            filterForumThreads();
        });
    }
};

const applyForumQueryState = () => {
    const searchParam = getQueryParam('forum');
    const categoryParam = getQueryParam('forumKategori');
    const sortParam = getQueryParam('forumSort');

    const searchInput = document.getElementById('forum-search-input');
    if (searchParam && searchInput) {
        forumSearchRaw = searchParam;
        forumSearchTerm = searchParam.trim().toLowerCase();
        searchInput.value = searchParam;
    }

    const allowedSorts = new Set(['trending', 'newest', 'unanswered']);
    if (allowedSorts.has(sortParam)) {
        forumSortMode = sortParam;
    }

    const sortSelect = document.getElementById('forum-sort-select');
    if (sortSelect) {
        sortSelect.value = forumSortMode;
    }

    if (categoryParam && forumData.some(thread => thread.category === categoryParam)) {
        activeForumCategory = categoryParam;
    }

    setActiveForumCategory(activeForumCategory);
};

const threadMatchesSearchTerm = (thread, term) => {
    if (!term) return true;
    const haystack = [
        thread.title,
        thread.excerpt,
        thread.category,
        thread.author?.name,
        thread.author?.role,
        ...(Array.isArray(thread.tags) ? thread.tags : [])
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(term);
};

const filterForumThreads = (afterRender) => {
    if (!Array.isArray(forumData)) return;

    let filtered = [...forumData];

    if (activeForumCategory !== 'all') {
        filtered = filtered.filter(thread => thread.category === activeForumCategory);
    }

    if (forumSearchTerm) {
        filtered = filtered.filter(thread => threadMatchesSearchTerm(thread, forumSearchTerm));
    }

    if (forumSortMode === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (forumSortMode === 'unanswered') {
        filtered = filtered.filter(thread => !thread.answered);
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
        filtered.sort((a, b) => computeForumScore(b) - computeForumScore(a));
    }

    renderForumThreads(filtered, afterRender);

    updateQueryParam('forum', forumSearchRaw);
    updateQueryParam('forumKategori', activeForumCategory === 'all' ? '' : activeForumCategory);
    updateQueryParam('forumSort', forumSortMode === 'trending' ? '' : forumSortMode);
};

const computeForumScore = (thread) => {
    const voteTotal = getThreadVoteDisplay(thread.id);
    const replyWeight = Number.isFinite(thread.replies) ? thread.replies * 1.2 : 0;
    const answeredBoost = thread.answered ? 5 : 0;
    const recencyBoost = (() => {
        const activity = new Date(thread.lastActivity || thread.createdAt || Date.now());
        const hoursSince = (Date.now() - activity.getTime()) / (1000 * 60 * 60);
        if (!Number.isFinite(hoursSince) || hoursSince <= 0) return 0;
        return Math.max(0, 24 - Math.min(hoursSince, 72)) * 0.5;
    })();
    return voteTotal * 2 + replyWeight + answeredBoost + recencyBoost;
};

const renderForumThreads = (threads, afterRender) => {
    const list = document.getElementById('forum-threads');
    const emptyState = document.getElementById('forum-empty');
    if (!list) return;

    list.innerHTML = '';

    if (!threads || threads.length === 0) {
        if (emptyState) {
            emptyState.classList.remove('hidden');
            emptyState.hidden = false;
        }
        list.setAttribute('aria-busy', 'false');
        return;
    }

    if (emptyState) {
        emptyState.classList.add('hidden');
        emptyState.hidden = true;
    }

    const fragment = document.createDocumentFragment();
    const numberFormatter = new Intl.NumberFormat('id-ID');

    threads.forEach(thread => {
        const article = document.createElement('article');
        article.className = 'forum-thread';
        article.dataset.threadId = thread.id;
        if (thread.id) {
            article.id = thread.id;
        }
        article.setAttribute('role', 'listitem');

        const voteWrapper = document.createElement('div');
        voteWrapper.className = 'thread-vote';

        const voteButton = document.createElement('button');
        voteButton.type = 'button';
        voteButton.className = 'vote-button';
        voteButton.innerHTML = '▲';
        const hasVoted = Boolean(forumVoteState[thread.id]);
        if (hasVoted) {
            voteButton.classList.add('active');
        }
        voteButton.setAttribute('aria-pressed', hasVoted ? 'true' : 'false');
        voteButton.setAttribute('aria-label', `Dukung diskusi: ${thread.title}`);
        voteButton.addEventListener('click', () => toggleForumVote(thread.id));

        const voteCount = document.createElement('span');
        voteCount.className = 'vote-count';
        voteCount.textContent = numberFormatter.format(getThreadVoteDisplay(thread.id));

        voteWrapper.appendChild(voteButton);
        voteWrapper.appendChild(voteCount);

        const content = document.createElement('div');
        content.className = 'thread-content';

        const meta = document.createElement('div');
        meta.className = 'thread-meta';

        const categoryPill = document.createElement('span');
        categoryPill.className = 'category-pill';
        categoryPill.textContent = thread.category;
        meta.appendChild(categoryPill);

        if (thread.answered) {
            const answeredBadge = document.createElement('span');
            answeredBadge.className = 'answered';
            answeredBadge.textContent = '✓ Terjawab';
            meta.appendChild(answeredBadge);
        }

        const authorInfo = document.createElement('span');
        const authorName = thread.author?.name ? escapeHtml(thread.author.name) : 'Pengguna Anonim';
        const authorRole = thread.author?.role ? ` • ${escapeHtml(thread.author.role)}` : '';
        authorInfo.innerHTML = `Oleh ${authorName}${authorRole}`;
        meta.appendChild(authorInfo);

        const createdAt = formatRelativeTime(thread.createdAt);
        if (createdAt) {
            const createdSpan = document.createElement('span');
            createdSpan.textContent = `Diposting ${createdAt}`;
            createdSpan.title = formatAbsoluteDate(thread.createdAt, { withTime: true });
            meta.appendChild(createdSpan);
        }

        const titleEl = document.createElement('h3');
        titleEl.className = 'thread-title';
        const titleLink = document.createElement('a');
        titleLink.href = `#${thread.id}`;
        titleLink.textContent = thread.title;
        titleLink.addEventListener('click', (event) => {
            event.preventDefault();
            updateQueryParam('forumThread', thread.id);
            if (hasWindow && typeof history !== 'undefined' && typeof history.replaceState === 'function') {
                const url = new URL(window.location.href);
                url.hash = thread.id;
                history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
            }
            focusForumThreadFromQuery({ force: true, targetId: thread.id });
        });
        titleEl.appendChild(titleLink);

        const excerpt = document.createElement('p');
        excerpt.className = 'thread-excerpt';
        excerpt.textContent = thread.excerpt;

        const tagsWrapper = document.createElement('div');
        tagsWrapper.className = 'thread-tags';
        (thread.tags || []).forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'thread-tag';
            tagEl.textContent = `#${tag}`;
            tagsWrapper.appendChild(tagEl);
        });

        const stats = document.createElement('div');
        stats.className = 'thread-stats';

        const repliesSpan = document.createElement('span');
        repliesSpan.innerHTML = `💬 ${numberFormatter.format(thread.replies || 0)} balasan`;
        stats.appendChild(repliesSpan);

        const activitySpan = document.createElement('span');
        const lastActivity = thread.lastActivity || thread.createdAt;
        const relativeActivity = formatRelativeTime(lastActivity);
        activitySpan.textContent = relativeActivity ? `🕒 Update ${relativeActivity}` : '🕒 Aktivitas terbaru belum tersedia';
        activitySpan.title = formatAbsoluteDate(lastActivity, { withTime: true });
        stats.appendChild(activitySpan);

        const postedSpan = document.createElement('span');
        postedSpan.textContent = `📅 ${formatAbsoluteDate(thread.createdAt)}`;
        stats.appendChild(postedSpan);

        content.appendChild(meta);
        content.appendChild(titleEl);
        content.appendChild(excerpt);
        if (thread.tags && thread.tags.length > 0) {
            content.appendChild(tagsWrapper);
        }
        content.appendChild(stats);

        if (thread.highlightReply && thread.highlightReply.author && thread.highlightReply.summary) {
            const highlight = document.createElement('div');
            highlight.className = 'thread-highlight';
            highlight.innerHTML = `<strong>${escapeHtml(thread.highlightReply.author)}</strong>: ${escapeHtml(thread.highlightReply.summary)}`;
            content.appendChild(highlight);
        }

        article.appendChild(voteWrapper);
        article.appendChild(content);

        fragment.appendChild(article);
    });

    list.appendChild(fragment);
    list.setAttribute('aria-busy', 'false');
    observeFadeInTargets(list.querySelectorAll('.forum-thread'));

    if (typeof afterRender === 'function') {
        afterRender();
    }

    focusForumThreadFromQuery();
};

const ensureForumThreadVisible = (thread, targetId) => {
    let modified = false;

    const targetCategory = thread.category || 'all';
    if (activeForumCategory !== 'all' && activeForumCategory !== targetCategory) {
        setActiveForumCategory(targetCategory);
        modified = true;
    }

    if (forumSortMode === 'unanswered' && thread.answered) {
        forumSortMode = 'trending';
        const sortSelect = document.getElementById('forum-sort-select');
        if (sortSelect) {
            sortSelect.value = forumSortMode;
        }
        modified = true;
    }

    if (forumSearchTerm && !threadMatchesSearchTerm(thread, forumSearchTerm)) {
        forumSearchTerm = '';
        forumSearchRaw = '';
        const searchInput = document.getElementById('forum-search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        modified = true;
    }

    if (modified) {
        filterForumThreads(() => focusForumThreadFromQuery({ force: true, targetId }));
    }

    return modified;
};

const updateForumVoteUI = (threadId) => {
    const threadElement = document.querySelector(`.forum-thread[data-thread-id="${threadId}"]`);
    if (!threadElement) return;
    const voteButton = threadElement.querySelector('.vote-button');
    const voteCount = threadElement.querySelector('.vote-count');
    if (!voteButton || !voteCount) return;

    const hasVoted = Boolean(forumVoteState[threadId]);
    voteButton.classList.toggle('active', hasVoted);
    voteButton.setAttribute('aria-pressed', hasVoted ? 'true' : 'false');

    const numberFormatter = new Intl.NumberFormat('id-ID');
    voteCount.textContent = numberFormatter.format(getThreadVoteDisplay(threadId));
};

const toggleForumVote = (threadId) => {
    const thread = forumThreadMap.get(threadId);
    if (!thread) return;

    const wasActive = Boolean(forumVoteState[threadId]);
    if (wasActive) {
        delete forumVoteState[threadId];
    } else {
        forumVoteState[threadId] = true;
    }

    saveStoredForumVotes(forumVoteState);

    const focusAfterRender = () => {
        const voteBtn = document.querySelector(`.forum-thread[data-thread-id="${threadId}"] .vote-button`);
        if (voteBtn) {
            voteBtn.focus({ preventScroll: true });
        }
    };

    if (forumSortMode === 'trending') {
        filterForumThreads(focusAfterRender);
    } else {
        updateForumVoteUI(threadId);
        focusAfterRender();
    }

    if (window.toastSystem) {
        toastSystem.show(
            wasActive ? 'Dukungan Anda telah dibatalkan.' : 'Terima kasih! Diskusi ini kini ada di daftar dukungan Anda.',
            wasActive ? 'info' : 'success'
        );
    }

    if (window.analytics && typeof analytics.trackEvent === 'function') {
        analytics.trackEvent(wasActive ? 'forum_vote_removed' : 'forum_vote_added', {
            thread_id: threadId,
            vote_total: getThreadVoteDisplay(threadId),
            sort_mode: forumSortMode
        });
    }
};

const focusForumThreadFromQuery = ({ force = false, targetId: overrideId } = {}) => {
    if (!force && initialForumFocusHandled) return;

    let targetId = typeof overrideId === 'string' ? overrideId : '';
    if (!targetId) {
        targetId = getQueryParam('forumThread');
    }

    if (!targetId && hasWindow) {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            targetId = decodeURIComponent(hash.slice(1));
        }
    }

    if (!targetId) {
        if (!force) {
            initialForumFocusHandled = true;
        }
        return;
    }

    const normalizedId = targetId.replace(/^#/, '');
    const threadElement = document.querySelector(`.forum-thread[data-thread-id="${normalizedId}"]`);
    if (!threadElement) {
        const threadData = forumThreadMap.get(normalizedId);
        if (threadData && ensureForumThreadVisible(threadData, normalizedId)) {
            return;
        }

        if (!force) {
            initialForumFocusHandled = true;
        }
        return;
    }

    initialForumFocusHandled = true;

    if (getQueryParam('forumThread') !== normalizedId) {
        updateQueryParam('forumThread', normalizedId);
    }

    if (hasWindow && typeof history !== 'undefined' && typeof history.replaceState === 'function') {
        const currentHash = window.location.hash ? window.location.hash.slice(1) : '';
        if (currentHash !== normalizedId) {
            const url = new URL(window.location.href);
            url.hash = normalizedId;
            history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
        }
    }

    const behavior = shouldReduceMotion ? 'auto' : 'smooth';

    requestAnimationFrame(() => {
        try {
            threadElement.scrollIntoView({ behavior, block: 'center' });
        } catch (error) {
            threadElement.scrollIntoView({ behavior });
        }

        const focusTarget = threadElement.querySelector('.vote-button') || threadElement;
        try {
            focusTarget.focus({ preventScroll: true });
        } catch (error) {
            focusTarget.focus();
        }
    });
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
        initStatCounters();
    });

    initHeroGreeting();

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

    // --- Quick Access Launcher ---
    const quickAccess = document.getElementById('quick-access');
    const quickToggle = document.getElementById('quick-access-toggle');
    const quickPanel = document.getElementById('quick-access-panel');

    if (quickAccess && quickToggle && quickPanel) {
        const openQuickAccess = () => {
            quickAccess.classList.add('active');
            quickPanel.classList.remove('hidden');
            quickToggle.setAttribute('aria-expanded', 'true');
        };

        const closeQuickAccess = ({ focusToggle = false } = {}) => {
            quickAccess.classList.remove('active');
            quickPanel.classList.add('hidden');
            quickToggle.setAttribute('aria-expanded', 'false');
            if (focusToggle) {
                quickToggle.focus();
            }
        };

        quickToggle.addEventListener('click', (event) => {
            event.preventDefault();
            if (quickAccess.classList.contains('active')) {
                closeQuickAccess();
            } else {
                openQuickAccess();
            }
        });

        quickPanel.addEventListener('click', (event) => {
            const actionButton = event.target.closest('[data-action]');
            if (!actionButton) return;

            const action = actionButton.dataset.action;
            closeQuickAccess();

            if (action === 'palette' && window.commandPalette && typeof window.commandPalette.open === 'function') {
                window.commandPalette.open();
                return;
            }

            if (action === 'search' && searchModal && typeof searchModal.open === 'function') {
                searchModal.open();
                return;
            }

            if (action === 'top') {
                window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
            }
        });

        document.addEventListener('click', (event) => {
            if (!quickAccess.contains(event.target) && quickAccess.classList.contains('active')) {
                closeQuickAccess();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && quickAccess.classList.contains('active')) {
                event.preventDefault();
                closeQuickAccess({ focusToggle: true });
            }
        });

        window.setTimeout(() => {
            quickAccess.classList.add('is-visible');
        }, 800);
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

    if (document.getElementById('forum-threads')) {
        loadForumThreads();
    }

    // Events skeleton state toggle when content loaded (if implemented later)
    const eventsRegion = document.getElementById('events');
    if (eventsRegion) {
        // Mark busy false when DOM paints
        requestAnimationFrame(() => {
            eventsRegion.setAttribute('aria-busy', 'false');
        });
    }

    // --- Merch Store Interest Tracking ---
    initMerchStore();
});

/**
 * Initialize merch store interest tracking with localStorage persistence
 */
function initMerchStore() {
    const interestButtons = document.querySelectorAll('.merch-interest-btn');

    if (!interestButtons.length) return;
    const countElements = {};
    const progressElements = {};
    const baselineCounts = {};
    const goalCounts = {};

    // Load interest counts from localStorage
    const loadInterestCounts = () => {
        const counts = JSON.parse(localStorage.getItem('merch_interests') || '{}');
        return {
            jaket: counts.jaket || 0,
            jersey: counts.jersey || 0
        };
    };

    // Save interest counts to localStorage
    const saveInterestCounts = (counts) => {
        localStorage.setItem('merch_interests', JSON.stringify(counts));
    };

    // Check if user already showed interest
    const getUserInterests = () => {
        const interests = JSON.parse(localStorage.getItem('user_merch_interests') || '[]');
        return interests;
    };

    // Save user interest
    const saveUserInterest = (product) => {
        const interests = getUserInterests();
        if (!interests.includes(product)) {
            interests.push(product);
            localStorage.setItem('user_merch_interests', JSON.stringify(interests));
        }
    };

    // Remove user interest
    const removeUserInterest = (product) => {
        const interests = getUserInterests();
        const filtered = interests.filter(p => p !== product);
        localStorage.setItem('user_merch_interests', JSON.stringify(filtered));
    };

    // Initialize counts display
    const counts = loadInterestCounts();
    const userInterests = getUserInterests();

    document.querySelectorAll('.merch-count').forEach(countEl => {
        const card = countEl.closest('.merch-card');
        if (!card) return;
        const btn = card.querySelector('.merch-interest-btn');
        if (!btn) return;
        const product = btn.dataset.product;

        const baseCount = parseInt(countEl.dataset.base || '0', 10);
        const goalCount = parseInt(countEl.dataset.goal || '50', 10);

        baselineCounts[product] = baseCount;
        goalCounts[product] = goalCount;
        countElements[product] = countEl;

        const progressEl = card.querySelector(`.merch-progress[data-product="${product}"]`);
        if (progressEl) {
            progressElements[product] = progressEl;
        }

        const storedIncrement = counts[product] || 0;
        const displayValue = Math.max(0, baseCount + storedIncrement);

        const strongEl = countEl.querySelector('strong');
        if (strongEl) {
            strongEl.textContent = displayValue;
        }
        countEl.dataset.count = displayValue;
        updateProgressBar(product, displayValue, goalCount, progressElements[product]);

        // Restore button state if user already interested
        if (userInterests.includes(product)) {
            btn.classList.add('interested');
            btn.textContent = 'Sudah Daftar';
            btn.setAttribute('aria-pressed', 'true');
        }
        else {
            btn.setAttribute('aria-pressed', 'false');
        }
    });

    // Handle interest button clicks
    interestButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const product = this.dataset.product;
            const card = this.closest('.merch-card');
            const countEl = card.querySelector('.merch-count');
            const progressEl = progressElements[product];
            const isInterested = this.classList.contains('interested');

            let counts = loadInterestCounts();
            const base = baselineCounts[product] || 0;
            const goal = goalCounts[product] || 50;
            const strongEl = countEl?.querySelector('strong');
            const previousDisplay = base + (counts[product] || 0);

            if (isInterested) {
                // Remove interest
                counts[product] = Math.max(0, (counts[product] || 0) - 1);
                this.classList.remove('interested');
                this.textContent = 'Daftar Minat';
                this.setAttribute('aria-pressed', 'false');
                removeUserInterest(product);
                const newDisplay = base + (counts[product] || 0);
                animateCount(strongEl, previousDisplay, newDisplay);
                countEl.dataset.count = newDisplay;
                updateProgressBar(product, newDisplay, goal, progressEl);

                // Track event
                if (window.analytics) {
                    analytics.trackEvent('merch_interest_removed', {
                        product: product,
                        new_count: Math.max(0, newDisplay)
                    });
                }

                if (window.toastSystem) {
                    toastSystem.show(
                        'Anda telah membatalkan minat untuk produk ini. Tidak masalah, Anda tetap bisa kembali kapan saja.',
                        'info'
                    );
                }
            } else {
                // Add interest
                counts[product] = (counts[product] || 0) + 1;
                this.classList.add('interested');
                this.textContent = 'Sudah Daftar';
                this.setAttribute('aria-pressed', 'true');
                saveUserInterest(product);

                const newDisplay = base + (counts[product] || 0);

                // Show toast notification
                if (window.toastSystem) {
                    toastSystem.show(
                        `Terima kasih! Anda telah terdaftar untuk ${product === 'jaket' ? 'Jaket Angkatan' : 'Jersey Futsal'}. 
                        Kami akan menginformasikan detail pemesanan via email kampus.`,
                        'success'
                    );
                }

                // Track event
                if (window.analytics) {
                    analytics.trackEvent('merch_interest_added', {
                        product: product,
                        new_count: newDisplay
                    });
                }

                // Animate count
                animateCount(strongEl, previousDisplay, newDisplay);
                countEl.dataset.count = newDisplay;
                updateProgressBar(product, newDisplay, goal, progressEl);
            }

            // Save and update display
            saveInterestCounts(counts);
        });
    });
}

/**
 * Animate counter with easing
 */
function animateCount(targetEl, start, end) {
    if (!targetEl) return;
    const duration = 600;
    const startTime = performance.now();

    const easeOutQuad = t => t * (2 - t);

    const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutQuad(progress);
        const current = Math.round(start + (end - start) * easedProgress);

        targetEl.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    };

    requestAnimationFrame(updateCount);
}

function updateProgressBar(product, displayValue, goal, progressEl) {
    if (!progressEl) return;
    const effectiveGoal = goal || parseInt(progressEl.getAttribute('aria-valuemax') || '50', 10);
    const boundedDisplay = Math.max(0, displayValue);
    const ratio = Math.min(boundedDisplay / effectiveGoal, 1);
    const percent = Math.round(ratio * 100);

    const fillEl = progressEl.querySelector('.progress-fill');
    if (fillEl) {
        fillEl.style.width = `${percent}%`;
    }

    progressEl.setAttribute('aria-valuenow', Math.min(boundedDisplay, effectiveGoal));
    const statusEl = progressEl.querySelector('.progress-status');
    const goalEl = progressEl.querySelector('.progress-goal');

    if (statusEl) {
        if (boundedDisplay >= effectiveGoal) {
            statusEl.textContent = 'Target terpenuhi! Produksi batch pertama siap dimulai.';
        } else {
            const remaining = effectiveGoal - boundedDisplay;
            statusEl.textContent = `${remaining} minat lagi menuju produksi`;
        }
    }

    if (goalEl) {
        goalEl.textContent = `Progress: ${boundedDisplay}/${effectiveGoal} (${percent}%)`;
    }
}