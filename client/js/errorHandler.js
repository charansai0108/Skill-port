/**
 * Centralized Error Handling Service
 * Provides consistent error handling and error boundaries
 */

import logger from './logger.js';
import config from './config.js';

class ErrorHandler {
    constructor() {
        this.setupGlobalErrorHandlers();
    }

    setupGlobalErrorHandlers() {
        // Global JavaScript error handler
        window.addEventListener('error', (event) => {
            this.handleError(event.error, {
                type: 'javascript',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                message: event.message
            });
        });

        // Global unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'promise',
                message: 'Unhandled Promise Rejection'
            });
        });

        // Global fetch error handler
        this.setupFetchErrorHandler();
    }

    setupFetchErrorHandler() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (!response.ok) {
                    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                    error.status = response.status;
                    error.response = response;
                    this.handleError(error, {
                        type: 'fetch',
                        url: args[0],
                        status: response.status
                    });
                }
                
                return response;
            } catch (error) {
                this.handleError(error, {
                    type: 'fetch',
                    url: args[0]
                });
                throw error;
            }
        };
    }

    handleError(error, context = {}) {
        // Log the error
        logger.error('Application Error', {
            error: error.message,
            stack: error.stack,
            context
        });

        // Show user-friendly error message
        this.showUserError(error, context);

        // Send to error reporting service in production
        if (config.isProduction()) {
            this.reportError(error, context);
        }
    }

    showUserError(error, context) {
        let userMessage = 'An unexpected error occurred. Please try again.';

        // Determine user-friendly message based on error type
        if (context.type === 'fetch') {
            if (context.status === 401) {
                userMessage = 'Please log in to continue.';
            } else if (context.status === 403) {
                userMessage = 'You do not have permission to perform this action.';
            } else if (context.status === 404) {
                userMessage = 'The requested resource was not found.';
            } else if (context.status >= 500) {
                userMessage = 'Server error. Please try again later.';
            } else if (context.status === 0) {
                userMessage = 'Network error. Please check your connection.';
            }
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            userMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('Firebase')) {
            userMessage = 'Authentication error. Please log in again.';
        }

        // Show error notification
        this.showErrorNotification(userMessage, error);
    }

    showErrorNotification(message, error) {
        // Remove existing error notifications
        const existingNotifications = document.querySelectorAll('.error-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .error-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .error-icon {
                font-size: 20px;
                flex-shrink: 0;
            }
            .error-message {
                flex: 1;
                color: #c33;
                font-weight: 500;
            }
            .error-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .error-close:hover {
                color: #666;
            }
        `;
        document.head.appendChild(style);

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    async reportError(error, context) {
        try {
            const errorReport = {
                message: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                userId: this.getCurrentUserId()
            };

            // Send to error reporting service
            await fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorReport)
            });
        } catch (reportingError) {
            logger.error('Failed to report error', reportingError);
        }
    }

    getCurrentUserId() {
        try {
            return window.authService?.getUserId() || 'anonymous';
        } catch {
            return 'anonymous';
        }
    }

    // Create error boundary for components
    createErrorBoundary(componentName) {
        return {
            catch: (error, errorInfo) => {
                logger.errorBoundary(error, componentName, errorInfo);
                this.showUserError(error, {
                    type: 'component',
                    component: componentName,
                    errorInfo
                });
            }
        };
    }

    // Handle API errors consistently
    handleApiError(error, operation) {
        const context = {
            type: 'api',
            operation,
            status: error.status,
            url: error.url
        };

        this.handleError(error, context);
    }

    // Handle authentication errors
    handleAuthError(error) {
        const context = {
            type: 'authentication',
            message: error.message
        };

        logger.security('Authentication error', context);
        this.handleError(error, context);

        // Redirect to login if needed
        if (error.message.includes('token') || error.message.includes('expired')) {
            setTimeout(() => {
                window.location.href = '/pages/auth/login.html';
            }, 2000);
        }
    }

    // Handle validation errors
    handleValidationError(errors, formName) {
        const context = {
            type: 'validation',
            form: formName,
            errors
        };

        logger.warn('Validation error', context);
        
        // Show validation errors to user
        this.showValidationErrors(errors);
    }

    showValidationErrors(errors) {
        // Remove existing validation errors
        const existingErrors = document.querySelectorAll('.validation-error');
        existingErrors.forEach(error => error.remove());

        // Show each validation error
        Object.keys(errors).forEach(field => {
            const errorMessage = errors[field];
            const fieldElement = document.querySelector(`[name="${field}"]`);
            
            if (fieldElement) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'validation-error';
                errorDiv.textContent = errorMessage;
                errorDiv.style.cssText = `
                    color: #c33;
                    font-size: 14px;
                    margin-top: 4px;
                `;
                
                fieldElement.parentNode.insertBefore(errorDiv, fieldElement.nextSibling);
                
                // Add error styling to field
                fieldElement.style.borderColor = '#c33';
                
                // Remove error styling on input
                fieldElement.addEventListener('input', () => {
                    fieldElement.style.borderColor = '';
                    errorDiv.remove();
                });
            }
        });
    }

    // Handle network errors
    handleNetworkError(error) {
        const context = {
            type: 'network',
            message: error.message
        };

        this.handleError(error, context);
    }

    // Handle Firebase errors
    handleFirebaseError(error) {
        const context = {
            type: 'firebase',
            code: error.code,
            message: error.message
        };

        logger.error('Firebase error', context);
        this.handleError(error, context);
    }

    // Retry mechanism for failed operations
    async retry(operation, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                logger.warn(`Operation failed, retrying (${attempt}/${maxRetries})`, {
                    error: error.message,
                    attempt
                });
                
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }

    // Safe async wrapper
    async safeAsync(operation, fallback = null) {
        try {
            return await operation();
        } catch (error) {
            this.handleError(error, { type: 'async' });
            return fallback;
        }
    }

    // Safe sync wrapper
    safeSync(operation, fallback = null) {
        try {
            return operation();
        } catch (error) {
            this.handleError(error, { type: 'sync' });
            return fallback;
        }
    }
}

// Create and export singleton instance
const errorHandler = new ErrorHandler();
export default errorHandler;
