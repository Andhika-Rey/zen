/**
 * Advanced Search Modal - Zenotika 2025
 * Full-screen search experience with instant results
 */

import searchEngine from './search-engine.js';

export class SearchModal {
  constructor() {
    this.isOpen = false;
    this.currentQuery = '';
    this.selectedIndex = 0;
    this.results = [];
    this.currentFilter = 'all';
    
    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
  }

  createModal() {
    const modal = document.createElement('div');
    modal.id = 'advanced-search-modal';
    modal.className = 'search-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'search-modal-title');
    modal.innerHTML = `
      <div class="search-modal-overlay"></div>
      <div class="search-modal-content">
        <div class="search-modal-header">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM17.5 17.5l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              type="text"
              id="advanced-search-input"
              class="search-modal-input"
              placeholder="Search materials, events, features..."
              autocomplete="off"
              spellcheck="false"
              aria-label="Advanced search input"
            />
            <button class="search-clear-btn" aria-label="Clear search" hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <button class="search-close-btn" aria-label="Close search modal">
            <span class="kbd">Esc</span>
          </button>
        </div>

        <div class="search-modal-filters">
          <button class="search-filter-btn active" data-filter="all">
            All Results
          </button>
          <button class="search-filter-btn" data-filter="learning">
            📚 Materials
          </button>
          <button class="search-filter-btn" data-filter="page">
            📄 Pages
          </button>
          <button class="search-filter-btn" data-filter="feature">
            ⚡ Features
          </button>
          <button class="search-filter-btn" data-filter="info">
            💡 Info
          </button>
        </div>

        <div class="search-modal-body">
          <div id="search-results" class="search-results">
            <!-- Results will be injected here -->
          </div>

          <div id="search-empty" class="search-empty" hidden>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2" opacity="0.2"/>
              <path d="M32 20v24M32 48v.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <h3>No results found</h3>
            <p>Try different keywords or check the filters above</p>
          </div>

          <div id="search-initial" class="search-initial">
            <div class="search-section">
              <h4 class="search-section-title">Recent Searches</h4>
              <div id="recent-searches" class="search-chips">
                <!-- Recent searches will be injected here -->
              </div>
            </div>

            <div class="search-section">
              <h4 class="search-section-title">Popular Searches</h4>
              <div id="popular-searches" class="search-chips">
                <!-- Popular searches will be injected here -->
              </div>
            </div>

            <div class="search-section">
              <h4 class="search-section-title">Keyboard Shortcuts</h4>
              <div class="search-shortcuts">
                <div class="shortcut-item">
                  <span class="shortcut-keys">
                    <span class="kbd">↑</span>
                    <span class="kbd">↓</span>
                  </span>
                  <span>Navigate results</span>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-keys">
                    <span class="kbd">Enter</span>
                  </span>
                  <span>Open selected result</span>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-keys">
                    <span class="kbd">Esc</span>
                  </span>
                  <span>Close search</span>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-keys">
                    <span class="kbd">Ctrl</span> + <span class="kbd">K</span>
                  </span>
                  <span>Command Palette (alternative)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="search-modal-footer">
          <div class="search-stats">
            <span id="search-stats-text">Start typing to search</span>
          </div>
          <div class="search-footer-actions">
            <button class="link-btn" id="clear-history-btn">
              Clear History
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modal = modal;
    this.input = modal.querySelector('#advanced-search-input');
    this.resultsContainer = modal.querySelector('#search-results');
    this.emptyState = modal.querySelector('#search-empty');
    this.initialState = modal.querySelector('#search-initial');
    this.statsText = modal.querySelector('#search-stats-text');
    this.clearBtn = modal.querySelector('.search-clear-btn');
  }

  attachEventListeners() {
    // Open/close
    const closeBtn = this.modal.querySelector('.search-close-btn');
    const overlay = this.modal.querySelector('.search-modal-overlay');
    
    closeBtn.addEventListener('click', () => this.close());
    overlay.addEventListener('click', () => this.close());

    // Search input
    this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));
    
    // Clear button
    this.clearBtn.addEventListener('click', () => {
      this.input.value = '';
      this.handleSearch('');
      this.input.focus();
    });

    // Filters
    const filterBtns = this.modal.querySelectorAll('.search-filter-btn');
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.handleSearch(this.currentQuery);
      });
    });

    // Clear history
    const clearHistoryBtn = this.modal.querySelector('#clear-history-btn');
    clearHistoryBtn.addEventListener('click', () => {
      searchEngine.clearHistory();
      this.renderInitialState();
    });

    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Global keyboard shortcut (Ctrl+Shift+F or Cmd+Shift+F)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        this.open();
      }
    });
  }

  handleSearch(query) {
    this.currentQuery = query;
    this.selectedIndex = 0;

    // Show/hide clear button
    this.clearBtn.hidden = !query;

    // Show initial state if empty
    if (!query || query.trim() === '') {
      this.renderInitialState();
      return;
    }

    // Perform search
    const options = {
      limit: 50,
      includeHistory: false,
    };

    if (this.currentFilter !== 'all') {
      options.category = this.currentFilter;
    }

    this.results = searchEngine.search(query, options);

    // Render results
    this.renderResults();
  }

  renderResults() {
    // Hide initial state
    this.initialState.hidden = true;

    if (this.results.length === 0) {
      this.resultsContainer.hidden = true;
      this.emptyState.hidden = false;
      this.statsText.textContent = 'No results found';
      return;
    }

    // Show results
    this.resultsContainer.hidden = false;
    this.emptyState.hidden = true;

    // Update stats
    this.statsText.textContent = `${this.results.length} result${
      this.results.length === 1 ? '' : 's'
    } found`;

    // Render result items
    this.resultsContainer.innerHTML = this.results
      .map((result, index) => this.renderResultItem(result, index))
      .join('');

    // Attach click listeners
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((item, index) => {
      item.addEventListener('click', () => this.selectResult(index));
    });
  }

  renderResultItem(result, index) {
    const isSelected = index === this.selectedIndex;
    const categoryIcon = this.getCategoryIcon(result.category);
    const highlightedTitle = searchEngine.highlightMatches(
      result.title,
      this.currentQuery
    );
    const highlightedDescription = searchEngine.highlightMatches(
      result.description,
      this.currentQuery
    );

    return `
      <div class="search-result-item ${isSelected ? 'selected' : ''}" data-index="${index}">
        <div class="result-icon">${categoryIcon}</div>
        <div class="result-content">
          <h4 class="result-title">${highlightedTitle}</h4>
          <p class="result-description">${highlightedDescription}</p>
          ${result.tags ? `
            <div class="result-tags">
              ${result.tags.slice(0, 3).map((tag) => `
                <span class="result-tag">${tag}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="result-meta">
          <span class="result-category">${result.category}</span>
          ${result.score ? `
            <span class="result-score" title="Relevance score">
              ${Math.round(result.score * 100)}%
            </span>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderInitialState() {
    this.resultsContainer.hidden = true;
    this.emptyState.hidden = true;
    this.initialState.hidden = false;
    this.statsText.textContent = 'Start typing to search';

    // Render recent searches
    const recentSearches = searchEngine.getRecentSearches();
    const recentContainer = this.modal.querySelector('#recent-searches');
    
    if (recentSearches.length > 0) {
      recentContainer.innerHTML = recentSearches
        .map((search) => `
          <button class="search-chip" data-query="${search.title}">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate(45 7 7)"/>
            </svg>
            ${search.title}
          </button>
        `)
        .join('');

      // Attach click listeners
      recentContainer.querySelectorAll('.search-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const query = chip.dataset.query;
          this.input.value = query;
          this.handleSearch(query);
        });
      });
    } else {
      recentContainer.innerHTML = '<p class="empty-text">No recent searches</p>';
    }

    // Render popular searches
    const popularSearches = searchEngine.getPopularSearches();
    const popularContainer = this.modal.querySelector('#popular-searches');
    
    popularContainer.innerHTML = popularSearches
      .map((query) => `
        <button class="search-chip" data-query="${query}">
          🔥 ${query}
        </button>
      `)
      .join('');

    // Attach click listeners
    popularContainer.querySelectorAll('.search-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        this.input.value = query;
        this.handleSearch(query);
      });
    });
  }

  handleKeyboard(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }

    if (this.results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = Math.min(
        this.selectedIndex + 1,
        this.results.length - 1
      );
      this.updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.updateSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.selectResult(this.selectedIndex);
    }
  }

  updateSelection() {
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  selectResult(index) {
    const result = this.results[index];
    if (!result) return;

    // Navigate to URL
    if (result.url && result.url !== '#') {
      window.location.href = result.url;
    }

    this.close();
  }

  getCategoryIcon(category) {
    const icons = {
      learning: '📚',
      page: '📄',
      feature: '⚡',
      info: '💡',
      history: '🕒',
    };
    return icons[category] || '📌';
  }

  open() {
    this.isOpen = true;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus input
    setTimeout(() => {
      this.input.focus();
    }, 100);

    // Render initial state
    this.renderInitialState();
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear input
    this.input.value = '';
    this.currentQuery = '';
    this.selectedIndex = 0;
    this.results = [];

    // Reset filter
    const filterBtns = this.modal.querySelectorAll('.search-filter-btn');
    filterBtns.forEach((btn) => btn.classList.remove('active'));
    filterBtns[0].classList.add('active');
    this.currentFilter = 'all';
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

// Export singleton instance
export default new SearchModal();
