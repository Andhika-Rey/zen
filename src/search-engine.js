/**
 * Advanced Search Engine - Zenotika 2025
 * Full-text search with lunr.js, instant results, and smart ranking
 */

import lunr from 'lunr';

/**
 * Search index data - represents all searchable content
 * In production, this would be generated from markdown/HTML files
 */
const searchData = [
  // Materials
  {
    id: 'material-1',
    title: 'Pemrograman Dasar',
    description: 'Fondasi logika, struktur kontrol, dan gaya penulisan kode bersih',
    content: 'Pemrograman dasar mencakup konsep fundamental seperti variabel, tipe data, operator, struktur kontrol (if, switch, loop), fungsi, dan algoritma dasar. Pelajari cara menulis kode yang bersih, efisien, dan mudah dipelihara.',
    url: '/materials/program-dasar.html',
    category: 'learning',
    tags: ['pemrograman', 'dasar', 'logika', 'algoritma', 'coding'],
  },
  {
    id: 'material-2',
    title: 'Struktur Data',
    description: 'Optimalkan kinerja aplikasi dengan struktur data modern',
    content: 'Pelajari struktur data fundamental seperti array, linked list, stack, queue, tree, graph, dan hash table. Pahami kompleksitas waktu dan ruang, serta kapan menggunakan struktur data yang tepat untuk optimasi performa aplikasi.',
    url: '/materials/asd.html',
    category: 'learning',
    tags: ['algoritma', 'struktur', 'data', 'asd', 'performance'],
  },
  {
    id: 'material-3',
    title: 'Basis Data',
    description: 'Rancang skema, kueri performa tinggi, dan otomasi migrasi',
    content: 'Kuasai desain database relasional, normalisasi, SQL query optimization, indexing, transaction management, dan migration strategies. Pelajari juga NoSQL databases untuk use case modern.',
    url: '/materials/basis-data.html',
    category: 'learning',
    tags: ['basis', 'data', 'database', 'sql', 'nosql'],
  },
  {
    id: 'material-4',
    title: 'Pengembangan Web',
    description: 'Front-end reaktif, aksesibilitas, dan best practice DevOps',
    content: 'Pelajari HTML5, CSS3, JavaScript modern (ES6+), framework reaktif (React, Vue), responsive design, accessibility (a11y), web performance, SEO, dan DevOps practices untuk deployment aplikasi web.',
    url: '/materials/web.html',
    category: 'learning',
    tags: ['web', 'development', 'html', 'css', 'javascript', 'react'],
  },

  // Pages
  {
    id: 'page-home',
    title: 'Zenotika - Platform Pembelajaran Informatika',
    description: 'Hub kolaboratif untuk mahasiswa informatika UNIKOM',
    content: 'Zenotika adalah platform pembelajaran kolaboratif yang dirancang khusus untuk mahasiswa Informatika Universitas Komputer Indonesia. Akses materi berkualitas, ikuti event kampus, dan bergabung dengan komunitas developer.',
    url: '/',
    category: 'page',
    tags: ['home', 'zenotika', 'unikom', 'informatika'],
  },
  {
    id: 'page-about',
    title: 'Tentang Zenotika',
    description: 'Misi, visi, dan tim di balik platform',
    content: 'Zenotika didirikan dengan misi memberdayakan mahasiswa informatika melalui pembelajaran kolaboratif. Kami percaya bahwa pengetahuan tumbuh ketika dibagikan. Tim kami terdiri dari mahasiswa, alumni, dan dosen yang berdedikasi.',
    url: '#about',
    category: 'page',
    tags: ['tentang', 'about', 'misi', 'visi', 'tim'],
  },
  {
    id: 'page-experience',
    title: 'Experience Layer 2025',
    description: 'Standar profesional dengan performa cepat dan keamanan data',
    content: 'Experience layer menyatukan adaptive learning engine, privacy-first analytics, dan collaboration suite yang siap mendukung skenario enterprise dan komunitas kampus.',
    url: '#experience',
    category: 'page',
    tags: ['experience', 'ux', 'profesional', '2025', 'analytics'],
  },
  {
    id: 'page-insights',
    title: 'Insights & Roadmap',
    description: 'Roadmap 2025 dan testimoni mahasiswa',
    content: 'Dengarkan pengalaman mahasiswa, lihat roadmap rilis Zenotika, dan rencanakan kontribusi Anda berdasarkan prioritas produk terbaru.',
    url: '#insights',
    category: 'page',
    tags: ['insight', 'roadmap', 'timeline', 'testimoni'],
  },

  // Features
  {
    id: 'feature-command-palette',
    title: 'Command Palette',
    description: 'Universal search dengan fuzzy matching',
  content: 'Tekan Cmd+Shift+K atau Ctrl+Shift+K untuk membuka Command Palette. Cari halaman, actions, atau navigasi cepat ke materi pembelajaran. Mendukung fuzzy search dan keyboard navigation.',
    url: '#',
    category: 'feature',
    tags: ['command', 'palette', 'search', 'keyboard', 'shortcut'],
  },
  {
    id: 'feature-toast',
    title: 'Toast Notifications',
    description: 'Notifikasi real-time untuk user feedback',
    content: 'Sistem notifikasi modern dengan 4 tipe (success, error, warning, info), auto-dismiss, dan action buttons. Zero dependencies, fully accessible dengan ARIA.',
    url: '#',
    category: 'feature',
    tags: ['toast', 'notification', 'feedback', 'ui'],
  },
  {
    id: 'feature-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Navigasi cepat dengan keyboard',
  content: 'Gunakan / untuk focus search, Ctrl+Shift+X untuk toggle theme, ? untuk help modal, Esc untuk close modals. Navigasi penuh tanpa mouse.',
    url: '#',
    category: 'feature',
    tags: ['keyboard', 'shortcuts', 'accessibility', 'navigation'],
  },

  // Common searches
  {
    id: 'search-tutorial',
    title: 'Tutorial dan Panduan',
    description: 'Langkah demi langkah belajar konsep baru',
    content: 'Akses tutorial interaktif dengan contoh kode, latihan, dan project-based learning. Cocok untuk pemula hingga advanced.',
    url: '/materials',
    category: 'info',
    tags: ['tutorial', 'panduan', 'belajar', 'latihan'],
  },
  {
    id: 'search-event',
    title: 'Event dan Workshop',
    description: 'Kegiatan kampus dan komunitas',
    content: 'Ikuti workshop, webinar, hackathon, dan pertemuan komunitas. Kesempatan networking dan belajar dari praktisi industri.',
    url: '#info',
    category: 'info',
    tags: ['event', 'workshop', 'webinar', 'hackathon', 'komunitas'],
  },
  {
    id: 'search-contact',
    title: 'Kontak dan Kolaborasi',
    description: 'Hubungi tim Zenotika',
    content: 'Punya pertanyaan atau ingin kolaborasi? Hubungi kami via email, Discord, atau GitHub. Kami terbuka untuk kontribusi dan partnership.',
    url: '#contact',
    category: 'info',
    tags: ['kontak', 'contact', 'kolaborasi', 'partnership'],
  },
];

/**
 * Build lunr search index
 */
function buildSearchIndex() {
  return lunr(function () {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('description', { boost: 5 });
    this.field('content', { boost: 2 });
    this.field('tags', { boost: 3 });
    this.field('category');

    // Add documents to index
    searchData.forEach((doc) => {
      this.add({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        content: doc.content,
        tags: Array.isArray(doc.tags) ? doc.tags.join(' ') : doc.tags,
        category: doc.category,
      });
    });
  });
}

/**
 * SearchEngine class - main search functionality
 */
export class SearchEngine {
  constructor() {
    this.index = buildSearchIndex();
    this.data = searchData;
    this.searchHistory = this.loadSearchHistory();
    this.maxHistoryItems = 10;
  }

  /**
   * Perform search with lunr
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Search results
   */
  search(query, options = {}) {
    const {
      category = null,
      limit = 20,
      includeHistory = true,
    } = options;

    // Return history if query is empty
    if (!query || query.trim() === '') {
      return includeHistory ? this.getRecentSearches() : [];
    }

    try {
      // Search with lunr
      const results = this.index.search(query);

      // Map results to full data
      let mappedResults = results.map((result) => {
        const doc = this.data.find((d) => d.id === result.ref);
        return {
          ...doc,
          score: result.score,
          matches: result.matchData?.metadata || {},
        };
      });

      // Filter by category if specified
      if (category) {
        mappedResults = mappedResults.filter((r) => r.category === category);
      }

      // Limit results
      mappedResults = mappedResults.slice(0, limit);

      // Add search to history
      if (query.trim()) {
        this.addToHistory(query);
      }

      return mappedResults;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * Get suggestions based on partial query
   * @param {string} query - Partial query
   * @returns {Array} Suggestions
   */
  getSuggestions(query) {
    if (!query || query.length < 2) return [];

    try {
      // Search with wildcard
      const wildcardQuery = `${query}*`;
      const results = this.index.search(wildcardQuery);

      return results.slice(0, 5).map((result) => {
        const doc = this.data.find((d) => d.id === result.ref);
        return {
          text: doc.title,
          category: doc.category,
          url: doc.url,
        };
      });
    } catch (error) {
      console.error('Suggestion error:', error);
      return [];
    }
  }

  /**
   * Search by category
   * @param {string} category - Category name
   * @returns {Array} Results
   */
  searchByCategory(category) {
    return this.data.filter((doc) => doc.category === category);
  }

  /**
   * Search by tags
   * @param {Array} tags - Tags to search
   * @returns {Array} Results
   */
  searchByTags(tags) {
    return this.data.filter((doc) => {
      return tags.some((tag) => doc.tags.includes(tag));
    });
  }

  /**
   * Add query to search history
   * @param {string} query - Search query
   */
  addToHistory(query) {
    const normalized = query.trim().toLowerCase();
    
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter((q) => q !== normalized);
    
    // Add to beginning
    this.searchHistory.unshift(normalized);
    
    // Limit size
    this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
    
    // Save to localStorage
    this.saveSearchHistory();
  }

  /**
   * Get recent searches
   * @returns {Array} Recent searches
   */
  getRecentSearches() {
    return this.searchHistory.map((query) => ({
      id: `history-${query}`,
      title: query,
      description: 'Recent search',
      category: 'history',
      url: '#',
      isHistory: true,
    }));
  }

  /**
   * Clear search history
   */
  clearHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  /**
   * Load search history from localStorage
   * @returns {Array} Search history
   */
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('zenotika_search_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load search history:', error);
      return [];
    }
  }

  /**
   * Save search history to localStorage
   */
  saveSearchHistory() {
    try {
      localStorage.setItem(
        'zenotika_search_history',
        JSON.stringify(this.searchHistory)
      );
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  /**
   * Highlight matching terms in text
   * @param {string} text - Text to highlight
   * @param {string} query - Search query
   * @returns {string} HTML with highlights
   */
  highlightMatches(text, query) {
    if (!query || !text) return text;

    const terms = query.toLowerCase().split(/\s+/);
    let highlighted = text;

    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(
        regex,
        '<mark class="search-highlight">$1</mark>'
      );
    });

    return highlighted;
  }

  /**
   * Get all available categories
   * @returns {Array} Categories
   */
  getCategories() {
    const categories = [...new Set(this.data.map((doc) => doc.category))];
    return categories.map((cat) => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: this.data.filter((doc) => doc.category === cat).length,
    }));
  }

  /**
   * Get popular searches
   * @returns {Array} Popular searches
   */
  getPopularSearches() {
    return [
      'pemrograman dasar',
      'struktur data',
      'basis data',
      'web development',
      'event',
    ];
  }
}

// Export singleton instance
export default new SearchEngine();
