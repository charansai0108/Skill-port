/**
 * Application Configuration
 * Environment-specific configuration management
 * Now reads from window.__SKILLPORT_CONFIG__ injected at build time
 */

class Config {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.loadConfig();
    }

    detectEnvironment() {
        // Detect environment based on hostname
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('firebaseapp.com') || hostname.includes('web.app')) {
            return 'production';
        } else {
            return 'staging';
        }
    }

    loadConfig() {
        // Check if config is injected via window object (for static hosting)
        if (window.__SKILLPORT_CONFIG__) {
            return window.__SKILLPORT_CONFIG__;
        }

        // Fallback to environment-specific configs
        const configs = {
            development: {
                firebase: {
                    apiKey: "AIzaSyAxcvIYVzwk8_0tX4fErmUxP0auFNyReFc",
                    authDomain: "skillport-a0c39.firebaseapp.com",
                    projectId: "skillport-a0c39",
                    storageBucket: "skillport-a0c39.firebasestorage.app",
                    messagingSenderId: "625176486393",
                    appId: "1:625176486393:web:9a832be086afbcaeb05d28"
                },
                api: {
                    baseUrl: 'http://localhost:5002/api',
                    timeout: 10000
                },
                logging: {
                    level: 'debug'
                }
            },
            staging: {
                firebase: {
                    apiKey: "AIzaSyAxcvIYVzwk8_0tX4fErmUxP0auFNyReFc",
                    authDomain: "skillport-a0c39.firebaseapp.com",
                    projectId: "skillport-a0c39",
                    storageBucket: "skillport-a0c39.firebasestorage.app",
                    messagingSenderId: "625176486393",
                    appId: "1:625176486393:web:9a832be086afbcaeb05d28"
                },
                api: {
                    baseUrl: 'https://skillport-staging-api.web.app/api/v1',
                    timeout: 15000
                },
                logging: {
                    level: 'info'
                }
            },
            production: {
                firebase: {
                    apiKey: "AIzaSyAxcvIYVzwk8_0tX4fErmUxP0auFNyReFc",
                    authDomain: "skillport-a0c39.firebaseapp.com",
                    projectId: "skillport-a0c39",
                    storageBucket: "skillport-a0c39.firebasestorage.app",
                    messagingSenderId: "625176486393",
                    appId: "1:625176486393:web:9a832be086afbcaeb05d28"
                },
                api: {
                    baseUrl: 'https://skillport-api.web.app/api/v1',
                    timeout: 20000
                },
                logging: {
                    level: 'error'
                }
            }
        };

        return configs[this.environment] || configs.development;
    }

    get(key) {
        return this.config[key];
    }

    getFirebaseConfig() {
        return this.config.firebase;
    }

    getApiConfig() {
        return this.config.api;
    }

    getLoggingConfig() {
        return this.config.logging;
    }

    isDevelopment() {
        return this.environment === 'development';
    }

    isProduction() {
        return this.environment === 'production';
    }
}

// Create and export singleton instance
const config = new Config();
export default config;
// Force reload: 1757559902
