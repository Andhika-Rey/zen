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

    document.querySelectorAll('.about-card, .learning-item, .info-card, .contact-info, .contact-form').forEach(el => {
        el.classList.add('fade-in-element');
        fadeInObserver.observe(el);
    });

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

    // --- Dynamic Content Loader ---
    initDynamicContent();
});

// --- Dynamic Content Functions ---
async function initDynamicContent() {
    try {
        const cfg = await fetchJson(resolveBaseUrl("data/config.json"));
        if (cfg) {
            setupAnnouncement(cfg.announcements || []);
            await setupEvents(cfg.events || {});
        }
    } catch (e) {
        console.error("Failed to load dynamic content:", e);
    }
}

async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed for ${url}`);
    return res.json();
}

function setupAnnouncement(announcements) {
    const bar = document.getElementById("announcement-bar");
    if (!bar || !announcements.length) return;

    const today = new Date();
    const active = announcements.find(a => !a.until || new Date(a.until) >= today);
    if (!active) return;

    const textEl = bar.querySelector(".announcement-text");
    const cta = bar.querySelector(".announcement-cta");
    const dismiss = bar.querySelector(".announcement-dismiss");

    textEl.textContent = active.message;
    if (active.link) {
        cta.href = active.link;
        cta.style.display = "inline-flex";
    } else {
        cta.style.display = "none";
    }

    const dismissedKey = `zen_announce_dismissed_${active.message}`;
    if (localStorage.getItem(dismissedKey)) return;

    bar.classList.remove("hidden");
    dismiss.addEventListener("click", () => {
        bar.classList.add("hidden");
        localStorage.setItem(dismissedKey, 'true');
    });
}

async function setupEvents(eventsCfg) {
    const grid = document.getElementById("events");
    const empty = document.getElementById("events-empty");
    if (!grid) return;

    let items = [];
    try {
        if (eventsCfg.source === 'csv' && eventsCfg.csvUrl) {
            const csv = await (await fetch(eventsCfg.csvUrl, { cache: "no-store" })).text();
            items = parseCSV(csv);
        } else if (eventsCfg.jsonUrl) {
            const url = eventsCfg.jsonUrl.startsWith("http") ? eventsCfg.jsonUrl : resolveBaseUrl(eventsCfg.jsonUrl.replace(/^\//, ""));
            items = await fetchJson(url);
        }
    } catch (e) {
        console.error("Failed to load events:", e);
    }

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
        const card = document.createElement("div");
        card.className = "info-card fade-in-element";
        const d = new Date(ev.date);
        const dateStr = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
        card.innerHTML = `
            <div class="info-date">${dateStr}</div>
            <div class="info-details">
                <h4>${escapeHtml(ev.title || "Acara")}</h4>
                <p>${escapeHtml(ev.description || "")}</p>
                ${ev.location ? `<p class="location"><strong>Lokasi:</strong> ${escapeHtml(ev.location)}</p>` : ""}
            </div>
            ${ev.link ? `<a href="${ev.link}" target="_blank" rel="noopener" class="info-cta">Detail</a>` : ""}
        `;
        frag.appendChild(card);
    });
    grid.appendChild(frag);
    
    // Re-observe newly added elements
    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.fade-in-element').forEach(el => fadeInObserver.observe(el));
}

function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const header = lines[0].split(",").map(h => h.trim().toLowerCase());
    const out = [];
    for (let i = 1; i < lines.length; i++) {
        const values = splitCsvLine(lines[i]);
        const entry = {};
        header.forEach((h, index) => {
            entry[h] = values[index] || "";
        });
        out.push(entry);
    }
    return out;
}

function splitCsvLine(line) {
    const res = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && (i === 0 || line[i - 1] !== '\\')) {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            res.push(cur.trim());
            cur = "";
        } else {
            cur += ch;
        }
    }
    res.push(cur.trim());
    return res;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function resolveBaseUrl(path) {
    const base = document.baseURI || location.origin + "/";
    try {
        return new URL(path, base).toString();
    } catch {
        return path;
    }
}
