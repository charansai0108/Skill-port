/**
 * SkillPort Notification System
 * Provides user-friendly notifications for API responses
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.createContainer();
        this.injectStyles();
    }

    createContainer() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createContainer();
            });
            return;
        }
        
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    injectStyles() {
        const styles = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            }

            .notification {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                margin-bottom: 12px;
                padding: 16px 20px;
                border-left: 4px solid #3B82F6;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification.success {
                border-left-color: #10B981;
                background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%);
            }

            .notification.error {
                border-left-color: #EF4444;
                background: linear-gradient(135deg, #FEF2F2 0%, #FEF2F2 100%);
            }

            .notification.warning {
                border-left-color: #F59E0B;
                background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
            }

            .notification.info {
                border-left-color: #3B82F6;
                background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
            }

            .notification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #1F2937;
                margin: 0;
            }

            .notification-close {
                background: none;
                border: none;
                color: #6B7280;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
                font-size: 16px;
                line-height: 1;
            }

            .notification-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #374151;
            }

            .notification-message {
                font-size: 13px;
                color: #4B5563;
                margin: 0;
                line-height: 1.4;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: #3B82F6;
                border-radius: 0 0 12px 12px;
                transition: width linear;
            }

            .notification.success .notification-progress {
                background: #10B981;
            }

            .notification.error .notification-progress {
                background: #EF4444;
            }

            .notification.warning .notification-progress {
                background: #F59E0B;
            }

            .notification.info .notification-progress {
                background: #3B82F6;
            }

            @media (max-width: 768px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
                
                .notification {
                    margin-bottom: 8px;
                    padding: 14px 16px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    show(options = {}) {
        const {
            title = 'Notification',
            message = '',
            type = 'info',
            duration = 5000,
            closable = true,
            action = null
        } = options;

        const notification = this.createNotification({
            title,
            message,
            type,
            closable,
            action,
            duration
        });

        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-remove after duration
        if (duration && duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    createNotification({ title, message, type, closable, action, duration = 5000 }) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const progress = document.createElement('div');
        progress.className = 'notification-progress';
        progress.style.width = '100%';

        notification.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">${title}</h4>
                ${closable ? '<button class="notification-close">&times;</button>' : ''}
            </div>
            <p class="notification-message">${message}</p>
            ${action ? `<div class="notification-action">${action}</div>` : ''}
        `;

        // Add progress bar
        notification.appendChild(progress);

        // Add close functionality
        if (closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                this.remove(notification);
            });
        }

        // Animate progress bar
        if (duration > 0) {
            setTimeout(() => {
                progress.style.width = '0%';
            }, 100);
        }

        return notification;
    }

    remove(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.remove('show');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    removeAll() {
        this.notifications.forEach(notification => {
            this.remove(notification);
        });
    }

    // Convenience methods
    success(title, message, options = {}) {
        return this.show({ title, message, type: 'success', ...options });
    }

    error(title, message, options = {}) {
        return this.show({ title, message, type: 'error', ...options });
    }

    warning(title, message, options = {}) {
        return this.show({ title, message, type: 'warning', ...options });
    }

    info(title, message, options = {}) {
        return this.show({ title, message, type: 'info', ...options });
    }

    // API response handler
    handleAPIResponse(response, options = {}) {
        const {
            successTitle = 'Success!',
            errorTitle = 'Error',
            showSuccess = true,
            showError = true
        } = options;

        if (response.success && showSuccess) {
            this.success(successTitle, response.message || 'Operation completed successfully');
        } else if (!response.success && showError) {
            this.error(errorTitle, response.error || 'Something went wrong');
        }

        return response;
    }

    // Loading notification
    showLoading(title = 'Loading...', message = 'Please wait while we process your request.') {
        return this.show({
            title,
            message,
            type: 'info',
            duration: 0,
            closable: false
        });
    }

    // Hide loading notification
    hideLoading(notification) {
        if (notification) {
            this.remove(notification);
        }
    }
}

// Create global instance
window.notifications = new NotificationSystem();

// Global function for backward compatibility
window.showNotification = (message, type = 'info', title = '') => {
    return window.notifications.show({
        title: title || (type === 'error' ? 'Error' : 'Notification'),
        message,
        type
    });
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
