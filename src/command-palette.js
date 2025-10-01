/**
 * Command Palette - Universal Search & Quick Actions
 * Inspired by VSCode, Linear, and GitHub
 * 
 * Features:
 * - Fuzzy search across pages, materials, and actions
 * - Keyboard navigation (Cmd/Ctrl+Shift+K, arrows, enter, esc)
 * - Recent pages history
 * - Quick actions (theme toggle, copy link, etc.)
 * - Mobile responsive
 * 
 * @version 1.0.0
 * @author Zenotika Team
 */

import Fuse from 'fuse.js';

class CommandPalette {
    constructor() {
        this.isOpen = false;
        this.selectedIndex = 0;
        this.recentPages = this.loadRecentPages();
        this.searchResults = [];
        
        // Searchable index
        this.items = [
            // Pages
            { id: 'home', title: 'Beranda', category: 'Pages', icon: '🏠', url: '/', keywords: ['home', 'dashboard', 'utama'] },
            { id: 'experience', title: 'Experience Layer', category: 'Pages', icon: '🧭', url: '/#experience', keywords: ['experience', 'standar', 'profesional', 'ux'] },
            { id: 'community', title: 'Komunitas', category: 'Pages', icon: '👥', url: '/#community', keywords: ['community', 'forum', 'diskusi'] },
            { id: 'insights', title: 'Insights & Roadmap', category: 'Pages', icon: '📈', url: '/#insights', keywords: ['insight', 'roadmap', 'timeline'] },
            { id: 'contact', title: 'Kontak', category: 'Pages', icon: '📧', url: '/#contact', keywords: ['contact', 'email', 'hubungi'] },
            
            // Materials
            { id: 'mat-dasar', title: 'Pemrograman Dasar', category: 'Materials', icon: '📚', url: '/materials/program-dasar.html', keywords: ['programming', 'basics', 'logika', 'algoritma'] },
            { id: 'mat-asd', title: 'Struktur Data', category: 'Materials', icon: '📚', url: '/materials/asd.html', keywords: ['data structures', 'algorithm', 'sorting', 'searching'] },
            { id: 'mat-db', title: 'Basis Data', category: 'Materials', icon: '📚', url: '/materials/basis-data.html', keywords: ['database', 'sql', 'query', 'relational'] },
            { id: 'mat-web', title: 'Pengembangan Web', category: 'Materials', icon: '📚', url: '/materials/web.html', keywords: ['web development', 'html', 'css', 'javascript', 'frontend'] },
            
            // Quick Actions
            { id: 'action-theme', title: 'Toggle Theme', category: 'Actions', icon: '🌓', action: 'toggleTheme', keywords: ['dark mode', 'light mode', 'tema'] },
            { id: 'action-copy', title: 'Copy Current URL', category: 'Actions', icon: '🔗', action: 'copyUrl', keywords: ['copy', 'link', 'share', 'salin'] },
            { id: 'action-github', title: 'Open GitHub Repo', category: 'Actions', icon: '🐙', action: 'openGithub', keywords: ['github', 'repository', 'source code'] },
            { id: 'action-shortcuts', title: 'View Keyboard Shortcuts', category: 'Actions', icon: '⌨️', action: 'showShortcuts', keywords: ['keyboard', 'shortcuts', 'help'] },
        ];
        
        // Fuse.js configuration for fuzzy search
        this.fuse = new Fuse(this.items, {
            keys: ['title', 'keywords', 'category'],
            threshold: 0.4,
            includeScore: true,
            minMatchCharLength: 1,
        });
        
        this.init();
    }
    
    init() {
        this.createDOM();
        this.attachEventListeners();
    }
    
    createDOM() {
        // Create command palette overlay
        const overlay = document.createElement('div');
        overlay.id = 'command-palette-overlay';
        overlay.className = 'command-palette-overlay hidden';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'command-palette-title');
        
        overlay.innerHTML = `
            <div class="command-palette">
                <div class="command-palette-header">
                    <input 
                        type="text" 
                        id="command-palette-input"
                        class="command-palette-input"
                        placeholder="Quick actions or search..."
                        autocomplete="off"
                        spellcheck="false"
                        aria-label="Command palette search"
                        aria-autocomplete="list"
                        aria-controls="command-palette-results"
                        aria-activedescendant=""
                    />
                    <kbd class="command-palette-esc">Esc</kbd>
                </div>
                <div class="command-palette-body">
                    <div id="command-palette-results" class="command-palette-results" role="listbox"></div>
                </div>
                <div class="command-palette-footer">
                    <div class="command-palette-hint">
                        <kbd>↑</kbd><kbd>↓</kbd> Navigate
                        <kbd>Enter</kbd> Select
                        <kbd>Esc</kbd> Close
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Store references
        this.overlay = overlay;
        this.input = document.getElementById('command-palette-input');
        this.results = document.getElementById('command-palette-results');
    }
    
    attachEventListeners() {
        // Global keyboard shortcut (Cmd/Ctrl+Shift+K)
        document.addEventListener('keydown', (e) => {
            const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && key === 'k') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Click triggers (buttons/links with data attribute)
        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('[data-open-command-palette]');
            if (!trigger) return;
            event.preventDefault();
            this.open();
        });
        
        // Overlay click (close)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
        
        // Input events
        this.input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        this.input.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });
        
        // Prevent form submission
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }
    
    handleSearch(query) {
        if (query.trim() === '') {
            // Show recent pages when empty
            this.showRecentPages();
        } else {
            // Fuzzy search
            const results = this.fuse.search(query);
            this.searchResults = results.map(r => r.item);
            this.renderResults(this.searchResults);
        }
        this.selectedIndex = 0;
        this.updateSelection();
    }
    
    showRecentPages() {
        if (this.recentPages.length === 0) {
            this.searchResults = this.items.filter(item => item.category === 'Pages');
        } else {
            this.searchResults = this.recentPages
                .map(url => this.items.find(item => item.url === url))
                .filter(Boolean);
        }
        this.renderResults(this.searchResults, 'Recent Pages');
    }
    
    renderResults(items, title = null) {
        if (items.length === 0) {
            this.results.innerHTML = `
                <div class="command-palette-empty">
                    <span class="command-palette-empty-icon">🔍</span>
                    <p>No results found</p>
                    <p class="command-palette-empty-hint">Try a different search term</p>
                </div>
            `;
            return;
        }
        
        // Group by category
        const grouped = items.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});
        
        let html = '';
        
        if (title) {
            html += `<div class="command-palette-section-title">${title}</div>`;
        }
        
        Object.entries(grouped).forEach(([category, categoryItems]) => {
            html += `<div class="command-palette-section">`;
            html += `<div class="command-palette-category">${category}</div>`;
            categoryItems.forEach((item, index) => {
                const globalIndex = items.indexOf(item);
                html += `
                    <div 
                        class="command-palette-item" 
                        data-index="${globalIndex}"
                        role="option"
                        aria-selected="false"
                        id="command-item-${globalIndex}"
                    >
                        <span class="command-palette-icon">${item.icon}</span>
                        <span class="command-palette-title">${item.title}</span>
                        ${item.action ? '<kbd class="command-palette-badge">Action</kbd>' : ''}
                    </div>
                `;
            });
            html += `</div>`;
        });
        
        this.results.innerHTML = html;
        
        // Attach click handlers
        this.results.querySelectorAll('.command-palette-item').forEach(el => {
            el.addEventListener('click', () => {
                const index = parseInt(el.dataset.index);
                this.selectItem(index);
            });
        });
    }
    
    handleKeyNavigation(e) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.searchResults.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.searchResults.length > 0) {
                    this.selectItem(this.selectedIndex);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }
    
    updateSelection() {
        const items = this.results.querySelectorAll('.command-palette-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                this.input.setAttribute('aria-activedescendant', `command-item-${index}`);
            } else {
                item.classList.remove('selected');
                item.setAttribute('aria-selected', 'false');
            }
        });
    }
    
    selectItem(index) {
        const item = this.searchResults[index];
        if (!item) return;
        
        if (item.action) {
            // Execute action
            this.executeAction(item.action);
        } else if (item.url) {
            // Navigate to URL
            this.saveRecentPage(item.url);
            window.location.href = item.url;
        }
        
        this.close();
    }
    
    executeAction(actionName) {
        switch (actionName) {
            case 'toggleTheme':
                document.getElementById('theme-toggle')?.click();
                if (window.toast) {
                    window.toast.success('Theme changed!', { duration: 2000 });
                }
                break;
            case 'copyUrl':
                navigator.clipboard.writeText(window.location.href).then(() => {
                    if (window.toast) {
                        window.toast.success('URL copied to clipboard!');
                    }
                });
                break;
            case 'openGithub':
                window.open('https://github.com/Andhika-Rey/zen', '_blank');
                if (window.toast) {
                    window.toast.info('Opening GitHub repository...', { duration: 2000 });
                }
                break;
            case 'showShortcuts':
                document.getElementById('shortcuts-modal')?.classList.remove('hidden');
                break;
        }
    }
    
    saveRecentPage(url) {
        this.recentPages = this.recentPages.filter(u => u !== url);
        this.recentPages.unshift(url);
        this.recentPages = this.recentPages.slice(0, 10);
        localStorage.setItem('zenotika_recent_pages', JSON.stringify(this.recentPages));
    }
    
    loadRecentPages() {
        try {
            return JSON.parse(localStorage.getItem('zenotika_recent_pages') || '[]');
        } catch {
            return [];
        }
    }
    
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.overlay.classList.remove('hidden');
        this.input.value = '';
        this.selectedIndex = 0;
        this.showRecentPages();
        
        // Focus input with slight delay for animation
        setTimeout(() => {
            this.input.focus();
        }, 50);
        
        // Trap focus
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.overlay.classList.add('hidden');
        this.input.value = '';
        this.results.innerHTML = '';
        
        // Release focus trap
        document.body.style.overflow = '';
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.commandPalette = new CommandPalette();
    });
} else {
    window.commandPalette = new CommandPalette();
}

export default CommandPalette;
