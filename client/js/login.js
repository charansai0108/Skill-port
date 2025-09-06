/**
 * SkillPort Login Handler - Firebase Integration
 * Handles user authentication using Firebase Authentication
 * Provides secure authentication with automatic token management
 */

import firebaseService from './firebaseService.js';

class LoginHandler {
    constructor() {
        this.isProcessing = false;
        this.init();
    }

    init() {
        console.log('🔐 LoginHandler: Initializing...');
        this.setupEventListeners();
        this.checkExistingAuth();
        console.log('🔐 LoginHandler: Initialization complete');
    }

    setupEventListeners() {
        console.log('🔐 LoginHandler: Setting up event listeners...');
        
        // Handle form submission - CRITICAL: Prevent page reload
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('🔐 LoginHandler: Form found, adding submit listener');
            loginForm.addEventListener('submit', (e) => {
                console.log('🔐 LoginHandler: Form submit event triggered');
                this.handleLogin(e);
            });
        } else {
            console.error('🔐 LoginHandler: Form not found!');
        }

        // Handle login button click as backup
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            console.log('🔐 LoginHandler: Button found, adding click listener');
            loginButton.addEventListener('click', (e) => {
                console.log('🔐 LoginHandler: Button click event triggered');
                // Don't prevent default here - let form handle it
                // This is just a backup in case form submission fails
            });
        } else {
            console.error('🔐 LoginHandler: Button not found!');
        }
    }

    checkExistingAuth() {
        console.log('🔐 LoginHandler: Checking existing Firebase authentication...');
        if (firebaseService.default.isUserAuthenticated()) {
            console.log('🔐 LoginHandler: User already authenticated via Firebase, redirecting...');
            this.redirectByRole(firebaseService.default.getCurrentUser());
        } else {
            console.log('🔐 LoginHandler: User not authenticated');
        }
    }

    async handleLogin(event) {
        // CRITICAL: Prevent default form submission to avoid page reload
        event.preventDefault();
        event.stopPropagation();
        
        console.log('🔐 LoginHandler: Login attempt initiated');
        console.log('🔐 LoginHandler: Event type:', event.type);
        console.log('🔐 LoginHandler: Event target:', event.target);
        
        // Prevent multiple simultaneous login attempts
        if (this.isProcessing) {
            console.log('🔐 LoginHandler: Already processing, ignoring request');
            return;
        }
        
        this.isProcessing = true;
        
        try {
            // Get form data
            const email = document.getElementById('email')?.value?.trim();
            const password = document.getElementById('password')?.value?.trim();
            
            console.log('🔐 LoginHandler: Email:', email);
            console.log('🔐 LoginHandler: Password length:', password ? password.length : 0);
            
            // Validate input
            if (!email || !password) {
                console.log('🔐 LoginHandler: Validation failed: missing email or password');
                this.showError('Please enter both email and password');
                return;
            }

            // Validate email format
            if (!this.isValidEmail(email)) {
                console.log('🔐 LoginHandler: Validation failed: invalid email format');
                this.showError('Please enter a valid email address');
                return;
            }

            // Show loading state
            this.setLoadingState(true);
            
            console.log('🔐 LoginHandler: Attempting Firebase login for:', email);
            
            // Make Firebase login call
            const response = await firebaseService.default.login(email, password);
            
            console.log('🔐 LoginHandler: Firebase login response received:', response);
            
            if (response && response.success) {
                console.log('🔐 LoginHandler: Firebase login successful, processing...');
                await this.handleLoginSuccess(response);
            } else {
                console.log('🔐 LoginHandler: Firebase login failed:', response?.message || 'Unknown error');
                this.handleLoginError(response?.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('🔐 LoginHandler: Login error:', error);
            console.error('🔐 LoginHandler: Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Handle specific error types
            if (error.message && error.message.includes('Failed to fetch')) {
                this.handleLoginError('Firebase service not available. Please check your connection.');
            } else if (error.message && error.message.includes('NetworkError')) {
                this.handleLoginError('Network error. Please check your internet connection.');
            } else {
                this.handleLoginError(error.message || 'Network error occurred');
            }
        } finally {
            this.setLoadingState(false);
            this.isProcessing = false;
        }
    }

    async handleLoginSuccess(response) {
        console.log('🔐 LoginHandler: Processing successful Firebase login...');
        console.log('🔐 LoginHandler: Response data:', response);
        
        try {
            // Firebase handles authentication state automatically
            console.log('🔐 LoginHandler: Firebase authentication successful');

            // Show success message
            this.showSuccess('Login successful! Redirecting...');

            // Firebase auth state change will handle the redirect automatically
            // No need for manual redirect here as AuthManager will handle it
            console.log('🔐 LoginHandler: Firebase auth state change will handle redirect');
            
        } catch (error) {
            console.error('🔐 LoginHandler: Error in handleLoginSuccess:', error);
            console.error('🔐 LoginHandler: Error stack:', error.stack);
            this.showError('Error processing login success: ' + error.message);
        }
    }

    handleLoginError(errorMessage) {
        console.error('🔐 LoginHandler: Login failed:', errorMessage);
        this.showError(errorMessage);
    }

    redirectByRole(responseData) {
        console.log('🔐 LoginHandler: redirectByRole called with responseData:', responseData);
        
        // Extract user data from the response structure
        const user = responseData.data?.user || responseData.user || responseData;
        
        if (!user || !user.role) {
            console.error('🔐 LoginHandler: No user or role found for redirect');
            console.error('🔐 LoginHandler: Response data:', responseData);
            console.error('🔐 LoginHandler: User object:', user);
            this.showError('Invalid user data received');
            return;
        }

        console.log('🔐 LoginHandler: Redirecting user with role:', user.role);
        console.log('🔐 LoginHandler: User details:', {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        });
        
        // CRITICAL: Use correct URLs with .html extension
        const redirectUrls = {
            'community-admin': '/pages/admin/admin-dashboard.html',
            'mentor': '/pages/mentor/mentor-dashboard.html',
            'student': '/pages/student/user-dashboard.html',
            'personal': '/pages/personal/student-dashboard.html'
        };

        const redirectUrl = redirectUrls[user.role];
        
        if (redirectUrl) {
            console.log('🔐 LoginHandler: Redirecting to:', redirectUrl);
            console.log('🔐 LoginHandler: Current location:', window.location.href);
            
            // CRITICAL: Use a more reliable redirect method
            try {
                // Ensure we have a full URL
                const fullRedirectUrl = redirectUrl.startsWith('http') ? redirectUrl : `${window.location.origin}${redirectUrl}`;
                console.log('🔐 LoginHandler: Full redirect URL:', fullRedirectUrl);
                
                // Method 1: Direct assignment with full URL
                console.log('🔐 LoginHandler: Setting window.location.href...');
                window.location.href = fullRedirectUrl;
                console.log('🔐 LoginHandler: Redirect command executed');
                
                // Method 2: Immediate backup with assign
                setTimeout(() => {
                    console.log('🔐 LoginHandler: Trying window.location.assign...');
                    window.location.assign(fullRedirectUrl);
                }, 50);
                
                // Method 3: Backup with replace
                setTimeout(() => {
                    console.log('🔐 LoginHandler: Trying window.location.replace...');
                    window.location.replace(fullRedirectUrl);
                }, 100);
                
                // Method 4: Force redirect with top.location (for iframes)
                setTimeout(() => {
                    console.log('🔐 LoginHandler: Trying top.location...');
                    if (window.top) {
                        window.top.location.href = fullRedirectUrl;
                    }
                }, 150);
                
                // Method 5: Create a link and click it (most reliable)
                setTimeout(() => {
                    console.log('🔐 LoginHandler: Trying link click method...');
                    const link = document.createElement('a');
                    link.href = fullRedirectUrl;
                    link.target = '_self';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, 200);
                
                // Method 6: Force reload with new URL
                setTimeout(() => {
                    console.log('🔐 LoginHandler: Trying force reload...');
                    window.location = fullRedirectUrl;
                }, 250);
                
                // Method 7: Use history.pushState and then reload
                setTimeout(() => {
                    console.log('🔐 LoginHandler: Trying history.pushState...');
                    history.pushState(null, '', fullRedirectUrl);
                    window.location.reload();
                }, 300);
                
                // Method 8: Use document.location
                setTimeout(() => {
                    console.log('🔐 LoginHandler: Trying document.location...');
                    document.location = fullRedirectUrl;
                }, 350);
                
                // Method 9: Use window.open and close current window
                setTimeout(() => {
                    console.log('🔐 LoginHandler: Trying window.open method...');
                    window.open(fullRedirectUrl, '_self');
                }, 400);
                
                // Method 10: Force redirect with meta refresh
                setTimeout(() => {
                    console.log('🔐 LoginHandler: Trying meta refresh...');
                    const meta = document.createElement('meta');
                    meta.httpEquiv = 'refresh';
                    meta.content = '0; url=' + fullRedirectUrl;
                    document.head.appendChild(meta);
                }, 450);
                
            } catch (error) {
                console.error('🔐 LoginHandler: Redirect error:', error);
                this.showError('Redirect failed: ' + error.message);
            }
        } else {
            console.error('🔐 LoginHandler: Unknown user role:', user.role);
            console.error('🔐 LoginHandler: Available roles:', Object.keys(redirectUrls));
            this.showError('Unknown user role: ' + user.role);
        }
    }

    setLoadingState(isLoading) {
        console.log('🔐 LoginHandler: Setting loading state:', isLoading);
        
        const loginButton = document.getElementById('loginButton');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (loginButton) {
            loginButton.disabled = isLoading;
            loginButton.textContent = isLoading ? 'Logging in...' : 'Sign In';
            loginButton.style.opacity = isLoading ? '0.7' : '1';
        }
        
        if (emailInput) emailInput.disabled = isLoading;
        if (passwordInput) passwordInput.disabled = isLoading;
    }

    showSuccess(message) {
        console.log('🔐 LoginHandler: Success message:', message);
        this.showAlert(message, 'success');
    }

    showError(message) {
        console.log('🔐 LoginHandler: Error message:', message);
        this.showAlert(message, 'error');
    }

    showAlert(message, type = 'info') {
        console.log('🔐 LoginHandler: Showing alert:', message, 'Type:', type);
        
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.login-alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `login-alert fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg`;
        
        const colors = {
            success: 'bg-green-100 border-green-500 text-green-700 border-l-4',
            error: 'bg-red-100 border-red-500 text-red-700 border-l-4',
            info: 'bg-blue-100 border-blue-500 text-blue-700 border-l-4'
        };
        
        alertDiv.className += ` ${colors[type] || colors.info}`;
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <span class="flex-1 font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg hover:opacity-70">&times;</button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Utility method to clear authentication
    static clearAuth() {
        console.log('🔐 LoginHandler: Clearing authentication...');
        // Clear local data
        localStorage.removeItem('user_data');
        if (window.authManager) {
            window.authManager.currentUser = null;
            window.authManager.isAuthenticated = false;
        }
        console.log('🔐 LoginHandler: Authentication cleared');
    }

    // Utility method to test redirect
    static testRedirect() {
        console.log('🔐 LoginHandler: Testing redirect...');
        window.location.href = 'pages/admin/admin-dashboard.html';
    }
}

// CRITICAL: Initialize login handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 DOM loaded, initializing login handler...');
    
    // Wait a bit to ensure all scripts are loaded
    setTimeout(() => {
        try {
            window.loginHandler = new LoginHandler();
            console.log('🔐 LoginHandler: Successfully initialized');
        } catch (error) {
            console.error('🔐 LoginHandler: Initialization failed:', error);
        }
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginHandler;
}