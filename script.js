// --- Imports ---
import searchModal from './src/search-modal.js';
import analytics from './src/analytics.js';

// --- Environment Guards ---
const hasWindow = typeof window !== 'undefined';
const hasDocument = typeof document !== 'undefined';
const reduceMotionMediaQuery = hasWindow && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
let shouldReduceMotion = reduceMotionMediaQuery ? reduceMotionMediaQuery.matches : false;

let eventsData = [];
let activeEventsFilter = 'upcoming';
const EVENT_FILTER_QUERY_KEY = 'acara';
const VALID_EVENT_FILTERS = new Set(['all', 'upcoming', 'past']);
let communityData = [];
let activeTag = null;

// --- Utility Functions ---
/**
 * Debounce function to limit the rate at which a function gets called.
 * @param {Function} func The function to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

const escapeRegExp = (value) => {
    if (typeof value !== 'string') return '';
    return value.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
};

const parseISODate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) => {
    const clone = new Date(date);
    clone.setHours(0, 0, 0, 0);
    return clone;
};

const getEventDateMetadata = (dateString) => {
    const date = parseISODate(dateString);
    if (!date) {
        return {
            day: '--',
            month: 'TBD',
            formatted: 'Tanggal akan diumumkan',
            relative: '',
            status: 'upcoming'
        };
    }

    const dayFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric' });
    const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });
    const fullFormatter = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const today = startOfDay(new Date());
    const eventDay = startOfDay(date);
    const diffDays = Math.round((eventDay - today) / (1000 * 60 * 60 * 24));

    let relative = '';
    let status = 'upcoming';
    if (diffDays === 0) {
        relative = 'Berlangsung hari ini';
        status = 'today';
    } else if (diffDays === 1) {
        relative = 'Besok';
    } else if (diffDays > 1 && diffDays <= 30) {
        relative = `Dalam ${diffDays} hari`;
    } else if (diffDays > 30 && diffDays <= 90) {
        relative = `Dalam ${Math.round(diffDays / 7)} minggu`;
    } else if (diffDays === -1) {
        relative = 'Kemarin';
        status = 'past';
    } else if (diffDays < -1 && diffDays >= -7) {
        relative = `${Math.abs(diffDays)} hari lalu`;
        status = 'past';
    } else if (diffDays < -7) {
        relative = 'Telah berlangsung';
        status = 'past';
    }

    const monthLabel = monthFormatter.format(date).toUpperCase();

    return {
        day: dayFormatter.format(date),
        month: monthLabel,
        formatted: fullFormatter.format(date),
        relative,
        status,
        timestamp: date.getTime()
    };
};

const getStatusLabel = (status, relative) => {
    if (status === 'today') return 'Berlangsung hari ini';
    if (status === 'past') return relative || 'Telah berlangsung';
    return relative || 'Segera';
};

const createEventCard = (event) => {
    const {
        title = 'Acara Komunitas',
        description = '',
        location = 'Lokasi menyusul',
        link = '',
        date,
        metadata: cachedMetadata
    } = event || {};

    const metadata = cachedMetadata || getEventDateMetadata(date);
    const { day, month, formatted, relative, status } = metadata;

    const card = document.createElement('article');
    card.classList.add('info-card', 'fade-in', 'event-card');
    if (status) {
        card.classList.add(`event-${status}`);
    }
    card.dataset.fadeObserved = 'pending';
    card.dataset.eventStatus = status;

    const dateColumn = document.createElement('div');
    dateColumn.className = 'info-date';

    const dayEl = document.createElement('span');
    dayEl.className = 'info-day';
    dayEl.textContent = day;

    const monthEl = document.createElement('span');
    monthEl.className = 'info-month';
    monthEl.textContent = month;

    dateColumn.append(dayEl, monthEl);

    const details = document.createElement('div');
    details.className = 'info-details';

    const header = document.createElement('div');
    header.className = 'info-header';

    const titleEl = document.createElement('h4');
    titleEl.textContent = title;

    const chip = document.createElement('span');
    chip.classList.add('info-chip');
    if (status) {
        chip.classList.add(`info-chip--${status}`);
    }
    chip.textContent = getStatusLabel(status, relative);

    header.append(titleEl, chip);
    details.appendChild(header);

    if (description) {
        const descEl = document.createElement('p');
        descEl.textContent = description;
        details.appendChild(descEl);
    }

    const metaList = document.createElement('ul');
    metaList.className = 'info-meta';

    const formattedItem = document.createElement('li');
    formattedItem.innerHTML = '<span aria-hidden="true">📅</span>';
    const formattedText = document.createElement('span');
    formattedText.textContent = formatted;
    formattedItem.appendChild(formattedText);
    metaList.appendChild(formattedItem);

    if (relative) {
        const relativeItem = document.createElement('li');
        relativeItem.innerHTML = '<span aria-hidden="true">⏰</span>';
        const relativeText = document.createElement('span');
        relativeText.textContent = relative;
        relativeItem.appendChild(relativeText);
        metaList.appendChild(relativeItem);
    }

    if (location) {
        const locationItem = document.createElement('li');
        locationItem.innerHTML = '<span aria-hidden="true">📍</span>';
        const locationText = document.createElement('span');
        locationText.textContent = location;
        locationItem.appendChild(locationText);
        metaList.appendChild(locationItem);
    }

    details.appendChild(metaList);

    if (link) {
        const linkEl = document.createElement('a');
        linkEl.className = 'info-link';
        linkEl.href = link;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        linkEl.textContent = 'Lihat detail';
        linkEl.setAttribute('aria-label', `${title} — detail acara`);
        details.appendChild(linkEl);
    }

    card.append(dateColumn, details);
    return card;
};

/**
 * Fetches and populates the announcement bar from a JSON data source.
 * This function is designed to be self-contained and resilient to errors.
 */
const loadAnnouncement = async () => {
    const announcementBar = document.getElementById('announcement-bar');
    if (!announcementBar) return;

    try {
        const response = await fetch('/data/announcements.json', { cache: 'no-store' });
        if (!response.ok) {
            console.error(`Failed to fetch announcements: ${response.statusText}`);
            return;
        }

        const rawData = await response.json();
        const resolveAnnouncement = (payload) => {
            if (!payload) return null;
            if (Array.isArray(payload)) {
                return payload.find(item => item && item.active !== false) || payload[0];
            }
            if (payload.latest) return payload.latest;
            if (payload.announcement) return payload.announcement;
            return payload;
        };

        const announcement = resolveAnnouncement(rawData);
        if (!announcement || announcement.active === false) return;

        const announcementId = announcement.id || announcement.identifier || '';
        const dismissedKey = 'zen_announcement_dismissed';
        try {
            const dismissedId = hasWindow ? window.localStorage.getItem(dismissedKey) : null;
            if (announcementId && dismissedId === announcementId) {
                return;
            }
        } catch (storageError) {
            console.warn('Unable to read announcement dismissal state:', storageError);
        }

        const message = announcement.message || announcement.text || announcement.title || '';
        if (!message) return;
        const ctaLabel = announcement.cta || announcement.cta_text || 'Lihat';
        const ctaLink = announcement.link || announcement.cta_link || announcement.url || '';

        const textEl = announcementBar.querySelector('.announcement-text');
        const ctaEl = announcementBar.querySelector('.announcement-cta');
        const dismissBtn = announcementBar.querySelector('.announcement-dismiss');

        if (textEl) textEl.textContent = message;
        if (ctaEl) {
            if (ctaLink) {
                ctaEl.href = ctaLink;
                ctaEl.textContent = ctaLabel;
                ctaEl.classList.remove('hidden');
            } else {
                ctaEl.classList.add('hidden');
            }
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                announcementBar.classList.add('hidden');
                announcementBar.setAttribute('aria-hidden', 'true');
                if (announcementId && hasWindow) {
                    try {
                        window.localStorage.setItem(dismissedKey, announcementId);
                    } catch (storageError) {
                        console.warn('Unable to persist announcement dismissal:', storageError);
                    }
                }
            });
        }

        announcementBar.dataset.announcementId = announcementId;
        announcementBar.classList.remove('hidden');
        announcementBar.setAttribute('aria-hidden', 'false');
    } catch (error) {
        console.error('Failed to fetch announcements:', error);
    }
};

const loadEvents = async () => {
    const eventsRegion = document.getElementById('events');
    const emptyState = document.getElementById('events-empty');
    const summaryElement = document.getElementById('events-summary');
    const filterButtons = document.querySelectorAll('[data-events-filter]');
    if (!eventsRegion) return;

    if (emptyState && !emptyState.dataset.defaultMessage) {
        const messageEl = emptyState.querySelector('p');
        if (messageEl) {
            emptyState.dataset.defaultMessage = messageEl.textContent;
        }
    }

    const emptyMessages = {
        all: 'Belum ada agenda komunitas yang bisa ditayangkan saat ini.',
        upcoming: 'Tidak ada acara mendatang untuk saat ini. Cek kembali sebentar lagi!',
        past: 'Belum ada arsip acara yang tersedia.'
    };

    const setBusy = (state) => eventsRegion.setAttribute('aria-busy', state ? 'true' : 'false');
    const hideEmptyState = () => {
        if (!emptyState) return;
        emptyState.hidden = true;
        emptyState.classList.add('hidden');
    };
    const showEmptyState = (message) => {
        if (!emptyState) return;
        const paragraph = emptyState.querySelector('p');
        if (paragraph) {
            paragraph.textContent = message || emptyState.dataset.defaultMessage || paragraph.textContent;
        }
        emptyState.hidden = false;
        emptyState.classList.remove('hidden');
    };
    const removeSkeletons = () => {
        eventsRegion.querySelectorAll('.info-card.skeleton').forEach(card => card.remove());
    };
    const removeExistingCards = () => {
        eventsRegion.querySelectorAll('.info-card:not(.skeleton)').forEach(card => card.remove());
    };
    const updateSummary = (filter, count) => {
        if (!summaryElement) return;
        const variants = {
            all: count > 0 ? `Menampilkan ${count} agenda komunitas.` : 'Agenda komunitas belum tersedia.',
            upcoming: count > 0 ? `Menampilkan ${count} acara mendatang.` : 'Tidak ada acara mendatang saat ini.',
            past: count > 0 ? `Menampilkan ${count} arsip acara.` : 'Belum ada arsip acara.'
        };
        summaryElement.textContent = variants[filter] || variants.all;
    };
    const getCounts = () => {
        const upcomingCount = eventsData.filter(event => event.metadata?.status !== 'past').length;
        const pastCount = eventsData.length - upcomingCount;
        return {
            all: eventsData.length,
            upcoming: upcomingCount,
            past: pastCount
        };
    };
    const updateFilterButtons = (counts, activeFilter) => {
        filterButtons.forEach(button => {
            const filter = button.dataset.eventsFilter || 'all';
            const count = counts[filter] ?? 0;
            const countBadge = button.querySelector('.events-filter-count');
            if (countBadge) {
                countBadge.textContent = count;
            }
            button.setAttribute('aria-pressed', filter === activeFilter ? 'true' : 'false');
            button.classList.toggle('active', filter === activeFilter);
            const label = button.querySelector('.events-filter-label')?.textContent || 'Filter';
            button.setAttribute('aria-label', `${label} (${count} acara)`);
        });
    };

    const normalizeFilter = (value) => {
        if (!value) return null;
        const normalized = value.trim().toLowerCase();
        if (normalized.length === 0) return null;
        return VALID_EVENT_FILTERS.has(normalized) ? normalized : null;
    };

    const initialFilterParam = getQueryParam(EVENT_FILTER_QUERY_KEY);
    const queryFilter = normalizeFilter(initialFilterParam);
    if (queryFilter) {
        activeEventsFilter = queryFilter;
    } else if (initialFilterParam) {
        updateQueryParam(EVENT_FILTER_QUERY_KEY, '');
    }

    updateFilterButtons(getCounts(), activeEventsFilter);

    const getFilteredEvents = (filter) => {
        if (filter === 'all') return [...eventsData];
        if (filter === 'past') {
            return eventsData.filter(event => event.metadata?.status === 'past');
        }
        return eventsData.filter(event => event.metadata?.status !== 'past');
    };

    const renderEvents = (filter = activeEventsFilter) => {
        const effectiveFilter = normalizeFilter(filter) || 'upcoming';
        updateQueryParam(EVENT_FILTER_QUERY_KEY, effectiveFilter === 'upcoming' ? '' : effectiveFilter);
        activeEventsFilter = effectiveFilter;
        removeExistingCards();

        const filteredEvents = getFilteredEvents(effectiveFilter);
        if (filteredEvents.length === 0) {
            showEmptyState(emptyMessages[effectiveFilter] || emptyMessages.all);
            updateSummary(effectiveFilter, 0);
            updateFilterButtons(getCounts(), effectiveFilter);
            return;
        }

        hideEmptyState();
        const fragment = document.createDocumentFragment();
        filteredEvents.forEach(event => {
            const card = createEventCard(event);
            fragment.appendChild(card);
        });

        eventsRegion.appendChild(fragment);
        observeFadeInTargets(eventsRegion.querySelectorAll('.info-card'));
        updateSummary(effectiveFilter, filteredEvents.length);
        updateFilterButtons(getCounts(), effectiveFilter);
    };

    const attachFilterListeners = () => {
        filterButtons.forEach(button => {
            if (button.dataset.filterBound === 'true') return;
            button.addEventListener('click', () => {
                const filter = button.dataset.eventsFilter || 'all';
                renderEvents(filter);
            });
            button.dataset.filterBound = 'true';
        });
    };

    attachFilterListeners();

    try {
        setBusy(true);
        hideEmptyState();
        if (summaryElement) {
            summaryElement.textContent = 'Memuat agenda komunitas...';
        }

        const response = await fetch('/data/events.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
        }

        const rawEvents = await response.json();
        const events = Array.isArray(rawEvents) ? rawEvents.filter(item => item && item.title) : [];

        removeSkeletons();

        const upcomingEvents = [];
        const pastEvents = [];

        events.forEach(event => {
            const metadata = getEventDateMetadata(event.date);
            const enriched = { ...event, metadata };
            if (metadata.status === 'past') {
                pastEvents.push(enriched);
            } else {
                upcomingEvents.push(enriched);
            }
        });

        upcomingEvents.sort((a, b) => (a.metadata?.timestamp ?? Infinity) - (b.metadata?.timestamp ?? Infinity));
        pastEvents.sort((a, b) => (b.metadata?.timestamp ?? 0) - (a.metadata?.timestamp ?? 0));

        eventsData = [...upcomingEvents, ...pastEvents];

        renderEvents(activeEventsFilter);
    } catch (error) {
        console.error('Failed to load events:', error);
        removeSkeletons();
        eventsData = [];
        showEmptyState('Gagal memuat daftar acara. Coba segarkan halaman nanti.');
        updateFilterButtons(getCounts(), activeEventsFilter);
        updateSummary('all', 0);
    } finally {
        setBusy(false);
        eventsRegion.classList.remove('requires-js');
    }
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

const getQueryParam = (key) => {
    if (!hasWindow || !key) return '';
    try {
        const url = new URL(window.location.href);
        return url.searchParams.get(key) ?? '';
    } catch (error) {
        console.warn('Unable to read query parameter:', error);
        return '';
    }
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

        const modalParam = getQueryParam('forumModal');
        if (modalParam && forumThreadMap.has(modalParam)) {
            if (!isForumModalOpen || forumModalActiveThreadId !== modalParam) {
                openForumModal(modalParam);
            }
        } else if (isForumModalOpen) {
            closeForumModal({ restoreFocus: false });
        }
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

const forumModalFocusableSelector = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getForumModalElements = () => {
    if (forumModalElements) return forumModalElements;
    const root = document.getElementById('forum-modal');
    if (!root) return null;

    const container = root.querySelector('.forum-modal-container');
    if (!container) return null;

    forumModalElements = {
        root,
        container,
        overlay: root.querySelector('.forum-modal-overlay'),
        closeButton: root.querySelector('.forum-modal-close'),
        category: root.querySelector('#forum-modal-category'),
        title: root.querySelector('#forum-modal-title'),
        subtitle: root.querySelector('#forum-modal-subtitle'),
        meta: root.querySelector('#forum-modal-meta'),
        tags: root.querySelector('#forum-modal-tags'),
        highlight: root.querySelector('#forum-modal-highlight'),
        body: root.querySelector('#forum-modal-body'),
        replies: root.querySelector('#forum-modal-replies')
    };

    return forumModalElements;
};

const getForumModalFocusableElements = () => {
    const elements = getForumModalElements();
    if (!elements) return [];
    return Array.from(elements.container.querySelectorAll(forumModalFocusableSelector)).filter((el) => {
        const isDisabled = el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true';
        const isHidden = el.offsetParent === null && !(el instanceof HTMLElement && el === elements.container);
        return !isDisabled && !isHidden;
    });
};

function handleForumModalKeydown(event) {
    if (!isForumModalOpen) return;
    const elements = getForumModalElements();
    if (!elements) return;

    if (event.key === 'Escape') {
        event.preventDefault();
        closeForumModal();
        return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getForumModalFocusableElements();
    if (focusable.length === 0) {
        event.preventDefault();
        elements.container.focus({ preventScroll: true });
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
        if (active === first || !elements.container.contains(active)) {
            event.preventDefault();
            last.focus();
        }
    } else if (active === last) {
        event.preventDefault();
        first.focus();
    }
}

function renderForumModalContent(thread) {
    const elements = getForumModalElements();
    if (!elements) return;

    const {
        category,
        title,
        subtitle,
        meta,
        tags,
        highlight,
        body,
        replies
    } = elements;

    if (category) {
        if (thread.category) {
            category.textContent = thread.category;
            category.hidden = false;
        } else {
            category.hidden = true;
        }
    }

    if (title) {
        title.textContent = thread.title || 'Diskusi';
    }

    if (subtitle) {
        subtitle.textContent = thread.excerpt || '';
        subtitle.classList.toggle('hidden', !thread.excerpt);
    }

    if (meta) {
        meta.innerHTML = '';

        const metaItems = [];
        if (thread.author && thread.author.name) {
            const role = thread.author.role ? ` • ${thread.author.role}` : '';
            metaItems.push({ icon: '👤', label: `${thread.author.name}${role}` });
        } else {
            metaItems.push({ icon: '👤', label: 'Pengguna anonim' });
        }

        const voteDisplay = getThreadVoteDisplay(thread.id);
        metaItems.push({ icon: '👍', label: `${voteDisplay} dukungan` });

        if (Number.isFinite(thread.replies)) {
            metaItems.push({ icon: '💬', label: `${thread.replies} balasan` });
        }

        if (thread.createdAt) {
            metaItems.push({
                icon: '📅',
                label: `Diposting ${formatRelativeTime(thread.createdAt) || 'baru saja'}`,
                title: formatAbsoluteDate(thread.createdAt, { withTime: true })
            });
        }

        if (thread.lastActivity) {
            metaItems.push({
                icon: '🕒',
                label: `Aktivitas ${formatRelativeTime(thread.lastActivity) || 'baru saja'}`,
                title: formatAbsoluteDate(thread.lastActivity, { withTime: true })
            });
        }

        metaItems.forEach(({ icon, label, title: itemTitle }) => {
            const span = document.createElement('span');
            if (itemTitle) {
                span.title = itemTitle;
            }
            if (icon) {
                const iconSpan = document.createElement('span');
                iconSpan.textContent = icon;
                iconSpan.setAttribute('aria-hidden', 'true');
                span.appendChild(iconSpan);
            }
            span.appendChild(document.createTextNode(` ${label}`));
            meta.appendChild(span);
        });
    }

    if (tags) {
        tags.innerHTML = '';
        if (Array.isArray(thread.tags) && thread.tags.length > 0) {
            thread.tags.forEach(tagValue => {
                const tagEl = document.createElement('span');
                tagEl.className = 'thread-tag';
                tagEl.textContent = `#${tagValue}`;
                tags.appendChild(tagEl);
            });
            tags.hidden = false;
        } else {
            tags.hidden = true;
        }
    }

    if (highlight) {
        if (thread.highlightReply && thread.highlightReply.author && thread.highlightReply.summary) {
            const author = escapeHtml(thread.highlightReply.author);
            const summary = escapeHtml(thread.highlightReply.summary);
            highlight.innerHTML = `<strong>${author}</strong>: ${summary}`;
            highlight.hidden = false;
        } else {
            highlight.innerHTML = '';
            highlight.hidden = true;
        }
    }

    if (body) {
        body.innerHTML = '';
        if (Array.isArray(thread.body) && thread.body.length > 0) {
            thread.body.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                body.appendChild(p);
            });
        } else {
            const p = document.createElement('p');
            p.textContent = 'Detail diskusi belum tersedia.';
            body.appendChild(p);
        }
    }

    if (replies) {
        replies.innerHTML = '';
        if (Array.isArray(thread.posts) && thread.posts.length > 0) {
            thread.posts.forEach(post => {
                const reply = document.createElement('article');
                reply.className = 'forum-reply';
                if (post.isAnswer) {
                    reply.classList.add('is-answer');
                }

                const header = document.createElement('header');
                header.className = 'forum-reply-header';

                const authorName = document.createElement('strong');
                authorName.textContent = post.author?.name || 'Kontributor';
                header.appendChild(authorName);

                if (post.author?.role) {
                    const role = document.createElement('span');
                    role.className = 'forum-reply-role';
                    role.textContent = post.author.role;
                    header.appendChild(role);
                }

                if (post.isAnswer) {
                    const answerBadge = document.createElement('span');
                    answerBadge.className = 'forum-reply-answer';
                    answerBadge.innerHTML = '<span aria-hidden="true">✓</span> Jawaban terverifikasi';
                    header.appendChild(answerBadge);
                }

                if (post.createdAt) {
                    const postDate = new Date(post.createdAt);
                    if (!Number.isNaN(postDate.getTime())) {
                        const timeEl = document.createElement('time');
                        timeEl.dateTime = postDate.toISOString();
                        timeEl.textContent = formatRelativeTime(post.createdAt) || '';
                        timeEl.title = formatAbsoluteDate(post.createdAt, { withTime: true });
                        header.appendChild(timeEl);
                    }
                }

                reply.appendChild(header);

                if (Array.isArray(post.content) && post.content.length > 0) {
                    post.content.forEach(block => {
                        const paragraph = document.createElement('p');
                        paragraph.textContent = block;
                        reply.appendChild(paragraph);
                    });
                }

                replies.appendChild(reply);
            });
        } else {
            const emptyState = document.createElement('div');
            emptyState.className = 'forum-reply-empty';
            emptyState.textContent = 'Belum ada balasan. Jadilah yang pertama memberi insight!';
            replies.appendChild(emptyState);
        }
    }
}

function openForumModal(threadId) {
    initForumModal();
    const elements = getForumModalElements();
    if (!elements) return;
    const thread = forumThreadMap.get(threadId);
    if (!thread) {
        console.warn('Thread tidak ditemukan untuk modal:', threadId);
        return;
    }

    renderForumModalContent(thread);

    forumModalPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    forumModalBodyWasLocked = document.body.classList.contains('no-scroll');
    forumModalActiveThreadId = threadId;

    elements.root.hidden = false;
    elements.root.classList.remove('hidden');
    elements.root.classList.add('is-visible');
    elements.root.setAttribute('aria-hidden', 'false');
    elements.container.setAttribute('tabindex', '-1');

    if (!forumModalBodyWasLocked) {
        document.body.classList.add('no-scroll');
    }

    isForumModalOpen = true;
    document.addEventListener('keydown', handleForumModalKeydown, true);

    requestAnimationFrame(() => {
        elements.container.focus({ preventScroll: true });
    });

    updateQueryParam('forumModal', threadId);

    if (analytics && typeof analytics.trackEvent === 'function') {
        analytics.trackEvent('forum_modal_opened', { thread_id: threadId });
    }
}

function closeForumModal({ restoreFocus = true } = {}) {
    const elements = getForumModalElements();
    if (!elements || !isForumModalOpen) return;

    elements.root.classList.remove('is-visible');
    elements.root.classList.add('hidden');
    elements.root.hidden = true;
    elements.root.setAttribute('aria-hidden', 'true');
    elements.container.removeAttribute('tabindex');

    if (!forumModalBodyWasLocked) {
        document.body.classList.remove('no-scroll');
    }

    document.removeEventListener('keydown', handleForumModalKeydown, true);
    isForumModalOpen = false;
    forumModalActiveThreadId = '';

    updateQueryParam('forumModal', '');

    if (restoreFocus && forumModalPreviousFocus) {
        try {
            forumModalPreviousFocus.focus({ preventScroll: true });
        } catch (error) {
            forumModalPreviousFocus.focus();
        }
    }
    forumModalPreviousFocus = null;
    forumModalBodyWasLocked = false;
}

function initForumModal() {
    const elements = getForumModalElements();
    if (!elements) return;
    if (elements.root.dataset.modalInitialized === 'true') return;

    const closers = elements.root.querySelectorAll('[data-close-forum-modal]');
    closers.forEach((closer) => {
        closer.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeForumModal();
        });
    });

    elements.root.addEventListener('click', (event) => {
        if (event.target === elements.root) {
            closeForumModal();
        }
    });

    elements.container.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    elements.root.dataset.modalInitialized = 'true';
}

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

        const actions = document.createElement('div');
        actions.className = 'thread-actions';

        const detailButton = document.createElement('button');
        detailButton.type = 'button';
        detailButton.className = 'thread-detail-btn';
        detailButton.setAttribute('aria-label', `Lihat detail diskusi ${thread.title}`);
        const detailIcon = document.createElement('span');
        detailIcon.className = 'icon';
        detailIcon.setAttribute('aria-hidden', 'true');
        detailIcon.textContent = '🔍';
        detailButton.appendChild(detailIcon);
        detailButton.appendChild(document.createTextNode(' Lihat detail diskusi'));
        detailButton.addEventListener('click', () => openForumModal(thread.id));
        actions.appendChild(detailButton);

        content.appendChild(actions);

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

    const modalParam = getQueryParam('forumModal');
    if (modalParam && forumThreadMap.has(modalParam)) {
        if (!isForumModalOpen || forumModalActiveThreadId !== modalParam) {
            requestAnimationFrame(() => openForumModal(modalParam));
        }
    } else if (isForumModalOpen && modalParam !== forumModalActiveThreadId) {
        closeForumModal({ restoreFocus: false });
    }
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

    if (isForumModalOpen && forumModalActiveThreadId === threadId) {
        renderForumModalContent(thread);
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
    const resultsCounter = document.getElementById('materials-results');
    const totalLearningItems = learningItems.length;

    if (searchInput) {
        const ensureOriginalCopy = (element) => {
            if (element && !element.dataset.originalText) {
                element.dataset.originalText = element.textContent;
            }
        };

        const formatCount = (count) => `${count} materi`;

        const updateResultsCounter = (visibleCount, rawQuery) => {
            if (!resultsCounter) return;
            const trimmed = rawQuery.trim();

            if (visibleCount === 0 && trimmed.length > 0) {
                resultsCounter.textContent = `0 dari ${totalLearningItems} materi cocok untuk "${trimmed}".`;
                return;
            }

            if (trimmed.length === 0) {
                resultsCounter.textContent = `Menampilkan ${formatCount(totalLearningItems)} terkurasi.`;
                return;
            }

            if (visibleCount === totalLearningItems) {
                resultsCounter.textContent = `Menampilkan semua ${formatCount(totalLearningItems)} untuk pencarian Anda.`;
                return;
            }

            resultsCounter.textContent = `Menampilkan ${formatCount(visibleCount)} dari ${formatCount(totalLearningItems)}.`;
        };

        const highlightText = (element, query) => {
            if (!element) return;
            ensureOriginalCopy(element);
            const original = element.dataset.originalText || '';
            const trimmedQuery = query.trim();

            const tokens = trimmedQuery.split(/\s+/).filter(token => token.length >= 2);
            if (tokens.length === 0) {
                element.textContent = original;
                return;
            }

            const regex = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi');
            element.innerHTML = original.replace(regex, '<mark>$1</mark>');
        };

        const resetHighlights = (element) => {
            if (!element) return;
            if (!element.dataset.originalText) {
                element.dataset.originalText = element.textContent;
            }
            element.textContent = element.dataset.originalText;
        };

        if (noResultsMessage && !noResultsMessage.dataset.defaultMessage) {
            noResultsMessage.dataset.defaultMessage = noResultsMessage.textContent;
        }

        const handleSearch = () => {
            const rawValue = searchInput.value;
            const trimmedValue = rawValue.trim();
            const searchTerm = trimmedValue.toLowerCase();
            let visibleItems = 0;

            learningItems.forEach(item => {
                const tags = item.dataset.tags.toLowerCase();
                const content = item.textContent.toLowerCase();
                const matches = searchTerm.length === 0 || tags.includes(searchTerm) || content.includes(searchTerm);

                if (matches) {
                    item.classList.remove('hidden');
                    visibleItems++;
                } else {
                    item.classList.add('hidden');
                }

                const titleEl = item.querySelector('.learning-content h4');
                const descEl = item.querySelector('.learning-content p');

                if (trimmedValue.length >= 2 && matches) {
                    highlightText(titleEl, trimmedValue);
                    highlightText(descEl, trimmedValue);
                } else {
                    resetHighlights(titleEl);
                    resetHighlights(descEl);
                }
            });

            if (noResultsMessage) {
                if (visibleItems === 0 && searchTerm.length > 0) {
                    noResultsMessage.classList.remove('hidden');
                    noResultsMessage.textContent = `Tidak ada materi yang cocok dengan pencarian "${trimmedValue}".`;
                } else {
                    noResultsMessage.classList.add('hidden');
                    noResultsMessage.textContent = noResultsMessage.dataset.defaultMessage || '';
                }
            }

            updateResultsCounter(visibleItems, rawValue);
            updateQueryParam('materi', rawValue);
        };

        const debouncedSearch = debounce(handleSearch, 300);
        searchInput.addEventListener('input', debouncedSearch);

        const initialQuery = getQueryParam('materi');
        if (initialQuery) {
            searchInput.value = initialQuery;
        }

        handleSearch();
    } else if (resultsCounter) {
        resultsCounter.textContent = `Menampilkan ${learningItems.length} materi terkurasi.`;
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

        const nameValidator = (v) => ({ valid: v.trim().length >= 2, message: 'Nama lengkap minimal 2 karakter.' });
        const campusEmailPattern = /^[^@\s]+@(mahasiswa\.)?unikom\.ac\.id$/i;
        const emailValidator = (v) => ({
            valid: campusEmailPattern.test(v.trim()),
            message: 'Gunakan email kampus @mahasiswa.unikom.ac.id atau @unikom.ac.id.'
        });
        const messageValidator = (v) => ({
            valid: v.trim().length >= 15,
            message: 'Pesan minimal 15 karakter agar kami memahami kebutuhan Anda.'
        });

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

    initForumModal();
    loadAnnouncement();
    loadEvents();

    if (document.getElementById('community-grid')) {
        loadCommunityContent();
    }

    if (document.getElementById('forum-threads')) {
        loadForumThreads();
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