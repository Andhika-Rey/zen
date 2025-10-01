/**
 * Toast Notification System
 * Beautiful, accessible, non-intrusive feedback
 * 
 * Features:
 * - Multiple toast types (success, error, warning, info)
 * - Auto-dismiss with progress bar
 * - Action buttons (undo, dismiss)
 * - Queue management (max 3 visible)
 * - Smooth animations
 * - Mobile responsive
 * - ARIA compliant
 * 
 * @version 1.0.0
 * @author Zenotika Team
 */

class ToastNotification {
    constructor() {
        this.toasts = [];
        this.maxToasts = 3;
        this.defaultDuration = 5000; // 5 seconds
        this.container = null;
        
        this.init();
    }
    
    init() {
        this.createContainer();
    }
    
    createContainer() {
        // Create toast container
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Notifications');
        container.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(container);
        this.container = container;
    }
    
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {object} options - Configuration options
     * @returns {string} Toast ID
     */
    show(message, options = {}) {
        const config = {
            type: options.type || 'info',
            duration: options.duration !== undefined ? options.duration : this.defaultDuration,
            action: options.action || null,
            dismissible: options.dismissible !== false,
            icon: options.icon || this.getDefaultIcon(options.type || 'info'),
            ...options
        };
        
        // Remove oldest toast if at max
        if (this.toasts.length >= this.maxToasts) {
            this.remove(this.toasts[0].id);
        }
        
        const toast = this.createToast(message, config);
        this.toasts.push(toast);
        this.container.appendChild(toast.element);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.element.classList.add('toast-show');
        });
        
        // Auto-dismiss
        if (config.duration > 0) {
            toast.progressInterval = this.startProgress(toast, config.duration);
            toast.dismissTimeout = setTimeout(() => {
                this.remove(toast.id);
            }, config.duration);
        }
        
        return toast.id;
    }
    
    createToast(message, config) {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const element = document.createElement('div');
        element.id = id;
        element.className = `toast toast-${config.type}`;
        element.setAttribute('role', 'status');
        element.setAttribute('aria-live', config.type === 'error' ? 'assertive' : 'polite');
        
        let html = `
            <div class="toast-content">
                <span class="toast-icon">${config.icon}</span>
                <div class="toast-message-wrapper">
                    <div class="toast-message">${message}</div>
                    ${config.description ? `<div class="toast-description">${config.description}</div>` : ''}
                </div>
            </div>
            <div class="toast-actions">
        `;
        
        // Add action button if provided
        if (config.action) {
            html += `
                <button 
                    class="toast-action-btn" 
                    data-action="${config.action.name}"
                    aria-label="${config.action.label}"
                >
                    ${config.action.label}
                </button>
            `;
        }
        
        // Add dismiss button if dismissible
        if (config.dismissible) {
            html += `
                <button 
                    class="toast-close-btn" 
                    aria-label="Close notification"
                    title="Close"
                >
                    ×
                </button>
            `;
        }
        
        html += `</div>`;
        
        // Add progress bar if auto-dismiss
        if (config.duration > 0) {
            html += `<div class="toast-progress"><div class="toast-progress-bar"></div></div>`;
        }
        
        element.innerHTML = html;
        
        // Attach event listeners
        const actionBtn = element.querySelector('.toast-action-btn');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                if (config.action.onClick) {
                    config.action.onClick();
                }
                this.remove(id);
            });
        }
        
        const closeBtn = element.querySelector('.toast-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.remove(id);
            });
        }
        
        return {
            id,
            element,
            config,
            progressInterval: null,
            dismissTimeout: null
        };
    }
    
    startProgress(toast, duration) {
        const progressBar = toast.element.querySelector('.toast-progress-bar');
        if (!progressBar) return null;
        
        const startTime = Date.now();
        
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            progressBar.style.width = `${100 - progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 16); // ~60fps
        
        return interval;
    }
    
    remove(id) {
        const toastIndex = this.toasts.findIndex(t => t.id === id);
        if (toastIndex === -1) return;
        
        const toast = this.toasts[toastIndex];
        
        // Clear timers
        if (toast.dismissTimeout) {
            clearTimeout(toast.dismissTimeout);
        }
        if (toast.progressInterval) {
            clearInterval(toast.progressInterval);
        }
        
        // Animate out
        toast.element.classList.add('toast-hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.element.parentNode) {
                toast.element.parentNode.removeChild(toast.element);
            }
            this.toasts.splice(toastIndex, 1);
        }, 300);
    }
    
    removeAll() {
        [...this.toasts].forEach(toast => this.remove(toast.id));
    }
    
    getDefaultIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
    
    // Convenience methods
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }
    
    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }
    
    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }
    
    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }
    
    // Promise-based toast (for async operations)
    async promise(promise, messages = {}) {
        const loadingId = this.info(messages.loading || 'Loading...', { duration: 0 });
        
        try {
            const result = await promise;
            this.remove(loadingId);
            this.success(messages.success || 'Success!');
            return result;
        } catch (error) {
            this.remove(loadingId);
            this.error(messages.error || 'Something went wrong');
            throw error;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.toast = new ToastNotification();
    });
} else {
    window.toast = new ToastNotification();
}

// Export for module usage
export default ToastNotification;
