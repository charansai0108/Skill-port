/**
 * SkillPort Login Handler - Complete Fix
 * Handles user authentication, token storage, and role-based redirects
 * Fixes all frontend issues that prevent successful login and redirect
 */

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
        console.log('🔐 LoginHandler: Checking existing authentication...');
        const token = localStorage.getItem('jwt_token');
        if (token && window.authManager) {
            console.log('🔐 LoginHandler: Existing token found, checking authentication...');
            window.authManager.checkAuthStatus().then(() => {
                if (window.authManager.isAuthenticated) {
                    console.log('🔐 LoginHandler: User already authenticated, redirecting...');
                    this.redirectByRole(window.authManager.currentUser);
                }
            }).catch(error => {
                console.error('🔐 LoginHandler: Auth check failed:', error);
                // Clear invalid token
                localStorage.removeItem('jwt_token');
            });
        } else {
            console.log('🔐 LoginHandler: No existing token found');
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
            
            console.log('🔐 LoginHandler: Attempting login for:', email);
            console.log('🔐 LoginHandler: APIService available:', !!window.APIService);
            
            // Make login API call
            const response = await window.APIService.login(email, password);
            
            console.log('🔐 LoginHandler: Login response received:', response);
            
            if (response && response.success) {
                console.log('🔐 LoginHandler: Login successful, processing...');
                await this.handleLoginSuccess(response);
            } else {
                console.log('🔐 LoginHandler: Login failed:', response?.error || 'Unknown error');
                this.handleLoginError(response?.error || 'Login failed');
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
                this.handleLoginError('Backend server not running. Please start the backend server first.');
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
        console.log('🔐 LoginHandler: Processing successful login...');
        console.log('🔐 LoginHandler: Response data:', response.data);
        
        try {
            // CRITICAL: Store token securely in localStorage
            if (response.data && response.data.token) {
                localStorage.setItem('jwt_token', response.data.token);
                console.log('🔐 LoginHandler: Token stored successfully:', response.data.token.substring(0, 20) + '...');
                
                // Verify token was stored
                const storedToken = localStorage.getItem('jwt_token');
                if (storedToken === response.data.token) {
                    console.log('🔐 LoginHandler: Token storage verified');
                } else {
                    console.error('🔐 LoginHandler: Token storage verification failed!');
                    this.showError('Failed to store authentication token');
                    return;
                }
            } else {
                console.error('🔐 LoginHandler: No token in response!');
                this.showError('No authentication token received');
                return;
            }

            // Update AuthManager
            if (window.authManager) {
                console.log('🔐 LoginHandler: Updating AuthManager...');
                await window.authManager.checkAuthStatus();
                console.log('🔐 LoginHandler: AuthManager updated, isAuthenticated:', window.authManager.isAuthenticated);
                
                if (!window.authManager.isAuthenticated) {
                    console.error('🔐 LoginHandler: AuthManager not authenticated after token storage!');
                    this.showError('Authentication verification failed');
                    return;
                }
                
                // Store user data
                if (window.authManager.currentUser) {
                    window.authManager.storeUserData(window.authManager.currentUser);
                    console.log('🔐 LoginHandler: User data stored successfully');
                }
            } else {
                console.error('🔐 LoginHandler: AuthManager not available!');
                this.showError('Authentication system not available');
                return;
            }

            // Show success message
            this.showSuccess('Login successful! Redirecting...');

            // CRITICAL: Ensure redirect happens after token is processed
            setTimeout(() => {
                console.log('🔐 LoginHandler: About to redirect by role...');
                this.redirectByRole(response.data);
            }, 1000); // Increased delay to ensure everything is processed
            
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
            'student': '/pages/user/user-dashboard.html',
            'personal': '/skillport-personal/student-dashboard.html'
        };

        const redirectUrl = redirectUrls[user.role];
        
        if (redirectUrl) {
            console.log('🔐 LoginHandler: Redirecting to:', redirectUrl);
            console.log('🔐 LoginHandler: Current location:', window.location.href);
            
            // CRITICAL: Multiple redirect methods to ensure it works
            try {
                // Method 1: Direct assignment
                console.log('🔐 LoginHandler: Setting window.location.href...');
                window.location.href = redirectUrl;
                console.log('🔐 LoginHandler: Redirect command executed');
                
                // Method 2: Backup with assign (in case href fails)
                setTimeout(() => {
                    if (window.location.pathname.includes('login')) {
                        console.log('🔐 LoginHandler: Redirect failed, trying window.location.assign...');
                        window.location.assign(redirectUrl);
                    }
                }, 2000);
                
                // Method 3: Backup with replace (in case assign fails)
                setTimeout(() => {
                    if (window.location.pathname.includes('login')) {
                        console.log('🔐 LoginHandler: Redirect failed, trying window.location.replace...');
                        window.location.replace(redirectUrl);
                    }
                }, 4000);
                
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
        localStorage.removeItem('jwt_token');
        if (window.authManager) {
            window.authManager.currentUser = null;
            window.authManager.isAuthenticated = false;
        }
        console.log('🔐 LoginHandler: Authentication cleared');
    }

    // Utility method to test redirect
    static testRedirect() {
        console.log('🔐 LoginHandler: Testing redirect...');
        window.location.href = '/pages/admin/admin-dashboard';
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