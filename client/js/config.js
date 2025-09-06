/**
 * Frontend Configuration
 * Centralized configuration for API endpoints and environment variables
 */

class Config {
    constructor() {
        this.apiBaseURL = this.getApiBaseURL();
        this.csrfTokenURL = this.getCSRFTokenURL();
        this.healthCheckURL = this.getHealthCheckURL();
    }

    getApiBaseURL() {
        // Check for environment-specific API URL
        if (window.API_BASE_URL) {
            return window.API_BASE_URL;
        }
        
        // Default to localhost for development
        return 'http://localhost:5001/api/v1';
    }

    getCSRFTokenURL() {
        return this.apiBaseURL.replace('/api/v1', '/api/csrf-token');
    }

    getHealthCheckURL() {
        return this.apiBaseURL.replace('/api/v1', '/health');
    }

    getApiHealthURL() {
        return `${this.apiBaseURL}/health`;
    }
}

// Create global config instance
window.Config = new Config();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
