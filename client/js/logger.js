/**
 * Centralized Logging Service
 * Provides consistent logging across the application with security considerations
 */

import config from './config.js';

class Logger {
    constructor() {
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        // Initialize with a safe default, then update when config is available
        this.logLevel = this.logLevels.ERROR;
        this.initializeLogLevel();
    }

    initializeLogLevel() {
        // Try immediately, then retry after a short delay
        this.tryInitializeLogLevel();
        setTimeout(() => this.tryInitializeLogLevel(), 100);
    }

    tryInitializeLogLevel() {
        try {
            this.logLevel = this.getLogLevel();
        } catch (error) {
            // Keep the default ERROR level if config is not available
            // Don't log this warning to avoid infinite loops
        }
    }

    getLogLevel() {
        try {
            const configLevel = config.getLoggingConfig().level;
            return this.logLevels[configLevel.toUpperCase()] || this.logLevels.ERROR;
        } catch (error) {
            // Fallback to ERROR level if config is not available
            return this.logLevels.ERROR;
        }
    }

    shouldLog(level) {
        return level <= this.logLevel;
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const levelName = Object.keys(this.logLevels)[level];
        
        let formattedMessage = `[${timestamp}] [${levelName}] ${message}`;
        
        if (data) {
            // Sanitize sensitive data
            const sanitizedData = this.sanitizeData(data);
            formattedMessage += ` | Data: ${JSON.stringify(sanitizedData)}`;
        }
        
        return formattedMessage;
    }

    sanitizeData(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }

        const sensitiveKeys = [
            'password', 'token', 'secret', 'key', 'auth', 'credential',
            'email', 'phone', 'ssn', 'creditCard', 'apiKey'
        ];

        const sanitized = { ...data };
        
        Object.keys(sanitized).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
                sanitized[key] = '[REDACTED]';
            } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
                sanitized[key] = this.sanitizeData(sanitized[key]);
            }
        });

        return sanitized;
    }

    error(message, data = null) {
        if (this.shouldLog(this.logLevels.ERROR)) {
            const formattedMessage = this.formatMessage(this.logLevels.ERROR, message, data);
            console.error(formattedMessage);
            
            // In production, you might want to send errors to a logging service
            if (config.isProduction()) {
                this.sendToLoggingService('error', message, data);
            }
        }
    }

    warn(message, data = null) {
        if (this.shouldLog(this.logLevels.WARN)) {
            const formattedMessage = this.formatMessage(this.logLevels.WARN, message, data);
            console.warn(formattedMessage);
        }
    }

    info(message, data = null) {
        if (this.shouldLog(this.logLevels.INFO)) {
            const formattedMessage = this.formatMessage(this.logLevels.INFO, message, data);
            console.log(formattedMessage);
        }
    }

    debug(message, data = null) {
        if (this.shouldLog(this.logLevels.DEBUG)) {
            const formattedMessage = this.formatMessage(this.logLevels.DEBUG, message, data);
            console.log(formattedMessage);
        }
    }

    // Security-specific logging
    security(message, data = null) {
        const formattedMessage = this.formatMessage(this.logLevels.WARN, `SECURITY: ${message}`, data);
        console.warn(formattedMessage);
        
        // Always log security events, regardless of log level
        if (config.isProduction()) {
            this.sendToLoggingService('security', message, data);
        }
    }

    // Authentication logging
    auth(message, data = null) {
        this.info(`AUTH: ${message}`, data);
    }

    // API logging
    api(method, url, status, data = null) {
        this.info(`API: ${method} ${url} - ${status}`, data);
    }

    // Performance logging
    performance(operation, duration, data = null) {
        this.info(`PERF: ${operation} took ${duration}ms`, data);
    }

    // User action logging
    userAction(action, userId, data = null) {
        this.info(`USER: ${action} by ${userId}`, data);
    }

    // Error boundary logging
    errorBoundary(error, component, props = null) {
        this.error(`ERROR BOUNDARY: ${component}`, {
            error: error.message,
            stack: error.stack,
            props: this.sanitizeData(props)
        });
    }

    // Send to external logging service (placeholder)
    async sendToLoggingService(level, message, data) {
        try {
            // In a real implementation, you would send to services like:
            // - Sentry
            // - LogRocket
            // - Firebase Crashlytics
            // - Custom logging endpoint
            
            const logEntry = {
                level,
                message,
                data: this.sanitizeData(data),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                userId: this.getCurrentUserId()
            };

            // Example: Send to Firebase Functions logging endpoint
            if (config.isProduction()) {
                await fetch('/api/logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(logEntry)
                });
            }
        } catch (error) {
            // Don't log logging errors to avoid infinite loops
            console.error('Failed to send log to external service:', error);
        }
    }

    getCurrentUserId() {
        // Get current user ID from auth service
        try {
            return window.authService?.getUserId() || 'anonymous';
        } catch {
            return 'anonymous';
        }
    }

    // Create a child logger with additional context
    child(context) {
        return {
            error: (message, data) => this.error(`${context}: ${message}`, data),
            warn: (message, data) => this.warn(`${context}: ${message}`, data),
            info: (message, data) => this.info(`${context}: ${message}`, data),
            debug: (message, data) => this.debug(`${context}: ${message}`, data),
            security: (message, data) => this.security(`${context}: ${message}`, data),
            auth: (message, data) => this.auth(`${context}: ${message}`, data),
            api: (method, url, status, data) => this.api(method, url, status, data),
            performance: (operation, duration, data) => this.performance(`${context}: ${operation}`, duration, data),
            userAction: (action, userId, data) => this.userAction(`${context}: ${action}`, userId, data)
        };
    }
}

// Create and export singleton instance
const logger = new Logger();
export default logger;
