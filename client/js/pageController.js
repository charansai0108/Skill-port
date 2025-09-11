/**
 * Page Controller Base Class
 * Base class for all dynamic pages with authentication, data loading, and error handling
 */

// Simple APIError class for error handling
class APIError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = 'APIError';
        this.status = status;
    }
}

class PageController {
    constructor() {
        this.isInitialized = false;
        this.isLoading = false;
        this.data = {};
        this.error = null;
        this.init();
    }

    async init() {
        console.log(`🎮 ${this.constructor.name}: Initializing...`);
        
        try {
            // Wait for all dependencies to be ready
            await this.waitForDependencies();
            
            // Check authentication
            await this.checkAuthentication();
            
            // Check page permissions
            this.checkPagePermissions();
            
            // Load page data
            await this.loadPageData();
            
            // Initialize page-specific functionality
            await this.initializePage();
            
            this.isInitialized = true;
            console.log(`🎮 ${this.constructor.name}: Initialization complete`);
            
        } catch (error) {
            console.error(`🎮 ${this.constructor.name}: Initialization failed:`, error);
            this.handleError(error);
        }
    }

    // Wait for all dependencies to be ready
    async waitForDependencies() {
        const dependencies = [
            window.authManager,
            window.contextManager,
            window.dataLoader,
            window.uiHelpers
        ];

        for (const dep of dependencies) {
            if (dep && dep.waitForReady) {
                await dep.waitForReady();
            }
        }
    }

    // Check authentication
    async checkAuthentication() {
        // Wait for AuthManager to be available
        let retries = 0;
        while (!window.authManager && retries < 10) {
            console.log(`🎮 ${this.constructor.name}: Waiting for AuthManager...`, retries);
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!window.authManager) {
            console.error(`🎮 ${this.constructor.name}: AuthManager not available after 10 retries`);
            window.location.href = '/pages/auth/login.html';
            return;
        }
        
        if (!window.authManager.isAuthenticated) {
            console.log(`🎮 ${this.constructor.name}: User not authenticated, showing login prompt`);
            this.showLoginPrompt();
            return;
        }

        // Check if token is expired
        if (window.authManager.isTokenExpired()) {
            console.log(`🎮 ${this.constructor.name}: Token expired, redirecting to login`);
            window.authManager.logout();
            return;
        }
    }

    // Check page permissions
    checkPagePermissions() {
        const currentPath = window.location.pathname;
        
        if (!window.contextManager.canAccessPage(currentPath)) {
            console.log(`🎮 ${this.constructor.name}: Access denied for path: ${currentPath}`);
            window.uiHelpers.showError('Access Denied', 'You do not have permission to access this page');
            
            // Redirect to appropriate dashboard
            const dashboardPath = window.contextManager.getDashboardPath();
            setTimeout(() => {
                window.location.href = dashboardPath;
            }, 2000);
            return;
        }
    }

    // Load page data (to be overridden by subclasses)
    async loadPageData() {
        console.log(`🎮 ${this.constructor.name}: Loading page data...`);
        
        try {
            this.setLoadingState(true);
            
            // Load dashboard data by default
            this.data = await window.dataLoader.loadDashboardData();
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    // Initialize page-specific functionality (to be overridden by subclasses)
    async initializePage() {
        console.log(`🎮 ${this.constructor.name}: Initializing page-specific functionality...`);
        // Override in subclasses
    }

    // Set loading state
    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        
        if (isLoading) {
            this.showLoadingStates();
        } else {
            this.hideLoadingStates();
        }
    }

    // Show loading states for all loading elements
    showLoadingStates() {
        const loadingElements = document.querySelectorAll('[data-loading]');
        loadingElements.forEach(element => {
            const elementId = element.id || `loading-${Math.random().toString(36).substr(2, 9)}`;
            if (!element.id) element.id = elementId;
            window.uiHelpers.showLoading(elementId, 'Loading...');
        });
    }

    // Hide loading states
    hideLoadingStates() {
        const loadingElements = document.querySelectorAll('[data-loading]');
        loadingElements.forEach(element => {
            if (element.id) {
                window.uiHelpers.hideLoading(element.id);
            }
        });
    }

    // Handle errors
    handleError(error) {
        console.error(`🎮 ${this.constructor.name}: Error:`, error);
        
        this.error = error;
        this.setLoadingState(false);
        
        // Show error notification
        if (error instanceof APIError) {
            if (error.status === 401 || error.status === 403) {
                window.uiHelpers.showError('Authentication Error', 'Please log in again');
                setTimeout(() => {
                    window.authManager.logout();
                }, 2000);
            } else {
                window.uiHelpers.showError('API Error', error.message);
            }
        } else {
            window.uiHelpers.showError('Error', error.message || 'An unexpected error occurred');
        }
        
        // Show error states for all error elements
        this.showErrorStates();
    }

    // Show error states for all error elements
    showErrorStates() {
        const errorElements = document.querySelectorAll('[data-error]');
        errorElements.forEach(element => {
            const elementId = element.id || `error-${Math.random().toString(36).substr(2, 9)}`;
            if (!element.id) element.id = elementId;
            window.uiHelpers.showError(elementId, this.error?.message || 'An error occurred');
        });
    }

    // Refresh page data
    async refresh() {
        console.log(`🎮 ${this.constructor.name}: Refreshing page data...`);
        
        try {
            await this.loadPageData();
            await this.initializePage();
            
            window.uiHelpers.showSuccess('Success', 'Data refreshed successfully');
            
        } catch (error) {
            this.handleError(error);
        }
    }

    // Get current user
    getCurrentUser() {
        return window.contextManager.getCurrentUser();
    }

    // Get user role
    getUserRole() {
        return window.contextManager.getUserRole();
    }

    // Get community ID
    getCommunityId() {
        return window.contextManager.getCommunityId();
    }

    // Check if user has specific role
    hasRole(role) {
        return window.contextManager.hasRole(role);
    }

    // Check if user is admin
    isAdmin() {
        return window.contextManager.isAdmin();
    }

    // Check if user is mentor
    isMentor() {
        return window.contextManager.isMentor();
    }

    // Check if user is student
    isStudent() {
        return window.contextManager.isStudent();
    }

    // Get page data
    getData() {
        return this.data;
    }

    // Set page data
    setData(data) {
        this.data = { ...this.data, ...data };
    }

    // Check if page is initialized
    isReady() {
        return this.isInitialized && !this.isLoading;
    }

    // Wait for page to be ready
    async waitForReady() {
        if (this.isReady()) {
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.isReady()) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    // Show login prompt for unauthenticated users
    showLoginPrompt() {
        console.log(`🎮 ${this.constructor.name}: Showing login prompt`);
        
        // Create a login overlay
        const overlay = document.createElement('div');
        overlay.id = 'login-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        const loginCard = document.createElement('div');
        loginCard.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;
        
        loginCard.innerHTML = `
            <h2 style="margin-bottom: 1rem; color: #1f2937; font-size: 1.5rem; font-weight: 600;">
                🔐 Login Required
            </h2>
            <p style="margin-bottom: 1.5rem; color: #6b7280;">
                Please log in to access your dashboard
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="login-btn" style="
                    background: #3b82f6;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                ">Login</button>
                <button id="register-btn" style="
                    background: #10b981;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                ">Register</button>
            </div>
        `;
        
        overlay.appendChild(loginCard);
        document.body.appendChild(overlay);
        
        // Add event listeners
        document.getElementById('login-btn').addEventListener('click', () => {
            window.location.href = '/pages/auth/login.html';
        });
        
        document.getElementById('register-btn').addEventListener('click', () => {
            window.location.href = '/pages/auth/register.html';
        });
        
        // Close overlay when clicking outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
}

// Export for module systems
export default PageController;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageController;
}
