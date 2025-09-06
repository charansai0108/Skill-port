/**
 * SkillPort Authentication Manager
 * Handles user authentication, session management, and role-based access
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) {
            console.log('🔐 AuthManager: Already initialized, skipping...');
            return;
        }
        
        this.checkAuthStatus();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    setupEventListeners() {
        // Listen for storage changes (e.g., token updates from other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'jwt_token') {
                this.checkAuthStatus();
            }
        });

        // Listen for custom auth events
        window.addEventListener('auth:login', () => this.checkAuthStatus());
        window.addEventListener('auth:logout', () => this.handleLogout());
    }

    async checkAuthStatus() {
        console.log('🔐 AuthManager: Starting authentication check...');
        
        try {
            // Wait for APIService to be available
            let retries = 0;
            while (!window.APIService && retries < 10) {
                console.log('🔐 AuthManager: Waiting for APIService...', retries);
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }
            
            if (!window.APIService) {
                console.error('🔐 AuthManager: APIService not available after 10 retries');
                this.handleUnauthenticated();
                return;
            }
            
            // Verify authentication with backend (uses httpOnly cookies)
            const response = await window.APIService.get('/auth/me');
            console.log('🔐 AuthManager: Authentication response:', response);
            
            // Standardized format: {success: true, data: {user: ...}}
            if (response && response.success && response.data && response.data.user) {
                this.currentUser = response.data.user;
                this.isAuthenticated = true;
                console.log('🔐 AuthManager: Authentication verified, user:', this.currentUser);
                this.handleAuthenticated();
            } else {
                console.log('🔐 AuthManager: Authentication invalid, handling unauthenticated');
                this.handleUnauthenticated();
            }
        } catch (error) {
            console.error('🔐 AuthManager: Auth check failed:', error);
            console.error('🔐 AuthManager: Error stack:', error.stack);
            this.handleUnauthenticated();
        }
    }

    handleAuthenticated() {
        console.log('🔐 AuthManager: handleAuthenticated called');
        // Update UI to show authenticated state
        this.updateAuthUI();
        
        // Redirect based on role if on login/register page
        if (this.shouldRedirect()) {
            console.log('🔐 AuthManager: Should redirect, calling redirectByRole');
            this.redirectByRole();
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('auth:authenticated', {
            detail: { user: this.currentUser }
        }));
    }

    handleUnauthenticated() {
        console.log('🔐 AuthManager: handleUnauthenticated called');
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Update UI to show unauthenticated state
        this.updateAuthUI();
        
        // Redirect to login if on protected page
        if (this.isProtectedPage()) {
            console.log('🔐 AuthManager: On protected page, redirecting to login');
            this.redirectToLogin();
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('auth:unauthenticated'));
    }

    handleInvalidToken() {
        // Clear any local data
        localStorage.removeItem('user_data');
        this.handleUnauthenticated();
        
        // Show notification
        if (window.notifications) {
            window.notifications.error({
                title: 'Session Expired',
                message: 'Your session has expired. Please log in again.'
            });
        }
    }

    // Enhanced logout functionality
    logout() {
        console.log('🔐 AuthManager: Logging out user...');
        
        // Clear local data (cookies are handled by backend)
        localStorage.removeItem('user_data');
        sessionStorage.clear();
        
        // Reset state
        this.isAuthenticated = false;
        this.currentUser = null;
        this.userRole = null;
        this.communityId = null;
        
        // Redirect to login
        this.redirectToLogin();
        
        // Show logout notification
        if (window.notifications) {
            window.notifications.success({
                title: 'Logged Out',
                message: 'You have been successfully logged out'
            });
        }
    }

    // Check if token is expired (now handled by httpOnly cookies)
    isTokenExpired() {
        // Token expiration is now handled by httpOnly cookies
        return false;
    }

    // Get stored user data
    getStoredUserData() {
        try {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('🔐 AuthManager: Error parsing stored user data:', error);
            return null;
        }
    }

    // Store user data
    storeUserData(userData) {
        try {
            localStorage.setItem('user_data', JSON.stringify(userData));
            console.log('🔐 AuthManager: User data stored successfully');
        } catch (error) {
            console.error('🔐 AuthManager: Error storing user data:', error);
        }
    }

    async login(email, password) {
        try {
            const loadingNotification = window.notifications?.showLoading(
                'Logging in...',
                'Please wait while we authenticate your account.'
            );

            const response = await window.APIService.login(email, password);
            
            window.notifications?.hideLoading(loadingNotification);

            if (response.success && response.data && response.data.user) {
                // Token is automatically set by APIService
                await this.checkAuthStatus();
                
                window.notifications?.success(
                    'Welcome back!',
                    `Successfully logged in as ${response.data.user.firstName}`
                );

                return { success: true, user: response.data.user };
            } else {
                window.notifications?.error(
                    'Login Failed',
                    response.message || 'Invalid email or password'
                );
                return { success: false, error: response.message };
            }
        } catch (error) {
            window.notifications?.hideLoading(loadingNotification);
            
            const errorMessage = window.APIService?.formatError(error) || 'Login failed';
            window.notifications?.error('Login Error', errorMessage);
            
            return { success: false, error: errorMessage };
        }
    }

    async register(userData) {
        try {
            const loadingNotification = window.notifications?.showLoading(
                'Creating Account...',
                'Please wait while we set up your account.'
            );

            const response = await window.APIService.register(userData);
            
            window.notifications?.hideLoading(loadingNotification);

            if (response.success) {
                window.notifications?.success(
                    'Account Created!',
                    'Please check your email for verification instructions.'
                );
                return { success: true, message: response.message };
            } else {
                window.notifications?.error(
                    'Registration Failed',
                    response.error || 'Failed to create account'
                );
                return { success: false, error: response.error };
            }
        } catch (error) {
            window.notifications?.hideLoading(loadingNotification);
            
            const errorMessage = window.APIService?.formatError(error) || 'Registration failed';
            window.notifications?.error('Registration Error', errorMessage);
            
            return { success: false, error: errorMessage };
        }
    }

    async logout() {
        try {
            const loadingNotification = window.notifications?.showLoading(
                'Logging out...',
                'Please wait while we log you out.'
            );

            await window.APIService.logout();
            
            window.notifications?.hideLoading(loadingNotification);
            
            // Clear local state
            this.currentUser = null;
            this.isAuthenticated = false;
            
            // Show success message
            window.notifications?.success(
                'Logged Out',
                'You have been successfully logged out.'
            );

            // Redirect to login
            setTimeout(() => {
                window.location.href = '/pages/auth/login.html';
            }, 1000);

        } catch (error) {
            window.notifications?.hideLoading(loadingNotification);
            
            // Even if logout fails, clear local state
            this.handleUnauthenticated();
            
            console.error('Logout error:', error);
        }
    }

    updateAuthUI() {
        // Update navigation based on auth status
        this.updateNavigation();
        
        // Update user info in header
        this.updateUserInfo();
        
        // Update protected content visibility
        this.updateProtectedContent();
    }

    updateNavigation() {
        const authNav = document.querySelector('.auth-nav');
        const userNav = document.querySelector('.user-nav');
        
        if (authNav && userNav) {
            if (this.isAuthenticated) {
                authNav.style.display = 'none';
                userNav.style.display = 'flex';
            } else {
                authNav.style.display = 'flex';
                userNav.style.display = 'none';
            }
        }
    }

    updateUserInfo() {
        if (!this.isAuthenticated || !this.currentUser) return;

        // Update user name in header
        const userNameElements = document.querySelectorAll('.user-name, .navbar-user-name');
        userNameElements.forEach(element => {
            element.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        });

        // Update user avatar
        const avatarElements = document.querySelectorAll('.user-avatar, .navbar-user-avatar');
        avatarElements.forEach(element => {
            if (this.currentUser.avatar) {
                element.src = this.currentUser.avatar;
            } else {
                // Use initials as fallback
                const initials = `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`;
                element.textContent = initials;
                element.classList.add('avatar-initials');
            }
        });

        // Update user role
        const roleElements = document.querySelectorAll('.user-role, .navbar-user-role');
        roleElements.forEach(element => {
            element.textContent = this.formatRole(this.currentUser.role);
        });
    }

    updateProtectedContent() {
        const protectedElements = document.querySelectorAll('[data-protected]');
        
        protectedElements.forEach(element => {
            const requiredRole = element.dataset.protected;
            
            if (this.hasAccess(requiredRole)) {
                element.style.display = '';
                element.classList.remove('hidden');
            } else {
                element.style.display = 'none';
                element.classList.add('hidden');
            }
        });
    }

    hasAccess(requiredRole) {
        if (!this.isAuthenticated) return false;
        
        if (requiredRole === 'any') return true;
        
        const userRole = this.currentUser.role;
        
        // Role hierarchy
        const roleHierarchy = {
            'community-admin': ['community-admin', 'mentor', 'student', 'personal'],
            'mentor': ['mentor', 'student', 'personal'],
            'student': ['student', 'personal'],
            'personal': ['personal']
        };
        
        return roleHierarchy[userRole]?.includes(requiredRole) || false;
    }

    formatRole(role) {
        const roleLabels = {
            'community-admin': 'Community Admin',
            'mentor': 'Mentor',
            'student': 'Student',
            'personal': 'Personal User'
        };
        
        return roleLabels[role] || role;
    }

    shouldRedirect() {
        const currentPath = window.location.pathname;
        return currentPath.includes('login.html') || 
               currentPath.includes('register.html') ||
               currentPath.includes('forgot-password.html');
    }

    redirectByRole() {
        if (!this.currentUser) return;

        const role = this.currentUser.role;
        const redirects = {
            'community-admin': '/pages/admin/admin-dashboard.html',
            'mentor': '/pages/mentor/mentor-dashboard.html',
            'student': '/pages/community/user-dashboard.html',
            'personal': '/pages/personal/student-dashboard.html'
        };

        const redirectUrl = redirects[role];
        if (redirectUrl && window.location.pathname !== redirectUrl) {
            window.location.href = redirectUrl;
        }
    }

    isProtectedPage() {
        const currentPath = window.location.pathname;
        const protectedPaths = [
            'pages/admin/',
            'pages/mentor/',
            'pages/community/',
            'pages/personal/'
        ];
        
        const isProtected = protectedPaths.some(path => currentPath.includes(path));
        console.log('🔐 AuthManager: isProtectedPage check - currentPath:', currentPath, 'isProtected:', isProtected);
        return isProtected;
    }

    redirectToLogin() {
        const currentPath = window.location.pathname;
        console.log('🔐 AuthManager: redirectToLogin called, currentPath:', currentPath);
        if (!currentPath.includes('login')) {
            console.log('🔐 AuthManager: Redirecting to login page');
            window.location.href = '/pages/auth/login.html';
        } else {
            console.log('🔐 AuthManager: Already on login page, not redirecting');
        }
    }

    // Utility methods
    getCurrentUser() {
        return this.currentUser;
    }

    getUserId() {
        return this.currentUser?._id;
    }

    getUserRole() {
        return this.currentUser?.role;
    }

    getUserCommunity() {
        return this.currentUser?.community;
    }

    isAdmin() {
        return this.currentUser?.role === 'community-admin';
    }

    isMentor() {
        return this.currentUser?.role === 'mentor';
    }

    isStudent() {
        return this.currentUser?.role === 'student';
    }

    isPersonalUser() {
        return this.currentUser?.role === 'personal';
    }

    // Check if user can access specific community
    canAccessCommunity(communityId) {
        if (!this.isAuthenticated) return false;
        
        // Admins can access all communities
        if (this.isAdmin()) return true;
        
        // Personal users cannot access communities (standalone users)
        if (this.isPersonalUser()) {
            return false;
        }
        
        // Check if user belongs to the community (for mentor/student)
        return this.currentUser.community === communityId;
    }

    // Check if user can manage specific contest
    canManageContest(contest) {
        if (!this.isAuthenticated) return false;
        
        // Admins can manage all contests
        if (this.isAdmin()) return true;
        
        // Contest creators can manage their contests
        if (contest.createdBy === this.getUserId()) return true;
        
        // Mentors can manage contests in their community
        if (this.isMentor() && contest.community === this.getUserCommunity()) {
            return true;
        }
        
        return false;
    }

    // Check if user can view specific user profile
    canViewProfile(userId) {
        if (!this.isAuthenticated) return false;
        
        // Users can always view their own profile
        if (userId === this.getUserId()) return true;
        
        // Admins can view all profiles
        if (this.isAdmin()) return true;
        
        // Mentors can view student profiles in their community
        if (this.isMentor()) {
            // This would need additional logic to check if the target user is in the same community
            return true;
        }
        
        return false;
    }
}

// Initialize AuthManager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Initializing AuthManager...');
    
    // Prevent multiple instances
    if (window.authManager) {
        console.log('🔐 AuthManager already initialized, skipping...');
        return;
    }
    
    // Wait for APIService to be ready
    setTimeout(() => {
        try {
            window.authManager = new AuthManager();
            window.AuthManager = window.authManager; // Also expose as uppercase for compatibility
        } catch (error) {
            console.error('🔐 Failed to initialize AuthManager:', error);
        }
    }, 100);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
