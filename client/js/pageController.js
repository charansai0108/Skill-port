/**
 * Page Controller Base Class
 * Base class for all dynamic pages with authentication, data loading, and error handling
 */

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
        if (!window.authManager.isAuthenticated) {
            console.log(`🎮 ${this.constructor.name}: User not authenticated, redirecting to login`);
            window.location.href = '/pages/auth/login';
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
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageController;
}
