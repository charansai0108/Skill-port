/**
 * SkillPort Authentication Manager
 * Handles user authentication, session management, and role-based access
 * Now uses Firebase Authentication for secure authentication
 */

import firebaseService from './firebaseService.js';

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
        
        // Listen for Firebase auth state changes
        firebaseService.onAuthStateChange((user, isAuthenticated) => {
            this.handleAuthStateChange(isAuthenticated, user);
        });
        
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('🔐 AuthManager: Initialized with Firebase Authentication');
    }

    setupEventListeners() {
        // Listen for custom auth events
        window.addEventListener('auth:login', () => this.handleLogin());
        window.addEventListener('auth:logout', () => this.handleLogout());
    }

    handleAuthStateChange(isAuthenticated, user) {
        console.log('🔐 AuthManager: Auth state changed:', isAuthenticated ? 'User logged in' : 'User logged out');
        
        this.isAuthenticated = isAuthenticated;
        this.currentUser = user;
        
        if (isAuthenticated) {
            this.handleAuthenticated();
        } else {
            this.handleUnauthenticated();
        }
    }

    // This method is now handled by Firebase auth state changes
    async checkAuthStatus() {
        // Firebase handles authentication state automatically
        // This method is kept for compatibility but is no longer needed
        console.log('🔐 AuthManager: checkAuthStatus called - handled by Firebase auth state changes');
        return this.isAuthenticated;
    }

    handleAuthenticated() {
        console.log('🔐 AuthManager: handleAuthenticated called');
        console.log('🔐 AuthManager: Current user in handleAuthenticated:', this.currentUser);
        
        // Update UI to show authenticated state
        this.updateAuthUI();
        
        // Force redirect for community-admin users
        if (this.currentUser && this.currentUser.role === 'community-admin') {
            console.log('🔐 AuthManager: Community-admin detected, forcing redirect to admin dashboard');
            const currentPath = window.location.pathname;
            if (!currentPath.includes('admin-dashboard')) {
                console.log('🔐 AuthManager: Redirecting community-admin to admin dashboard');
                window.location.href = '/pages/admin/admin-dashboard.html';
                return;
            }
        }
        
        // Always check for redirect, regardless of current page
        console.log('🔐 AuthManager: Checking if should redirect...');
        if (this.shouldRedirect()) {
            console.log('🔐 AuthManager: Should redirect, calling redirectByRole');
            this.redirectByRole();
        } else {
            console.log('🔐 AuthManager: No redirect needed');
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
        
        // Redirect to login if on protected page OR if not on login/register pages
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('login') || currentPath.includes('register') || currentPath.includes('forgot-password');
        const isProtected = this.isProtectedPage();
        
        console.log('🔐 AuthManager: Redirect check - currentPath:', currentPath, 'isProtected:', isProtected, 'isAuthPage:', isAuthPage);
        
        if (isProtected || (!isAuthPage && currentPath !== '/')) {
            console.log('🔐 AuthManager: Redirecting to login');
            this.redirectToLogin();
        } else {
            console.log('🔐 AuthManager: Not redirecting - staying on current page');
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

            const response = await firebaseService.login(email, password);
            
            window.notifications?.hideLoading(loadingNotification);

            if (response.success && response.user) {
                window.notifications?.success(
                    'Welcome back!',
                    `Successfully logged in as ${response.user.firstName || response.user.displayName}`
                );

                return { success: true, user: response.user };
            } else {
                window.notifications?.error(
                    'Login Failed',
                    response.message || 'Invalid email or password'
                );
                return { success: false, error: response.message };
            }
        } catch (error) {
            window.notifications?.hideLoading(loadingNotification);
            
            const errorMessage = error.message || 'Login failed';
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

            const response = await firebaseService.register(userData);
            
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
                    response.message || 'Failed to create account'
                );
                return { success: false, error: response.message };
            }
        } catch (error) {
            window.notifications?.hideLoading(loadingNotification);
            
            const errorMessage = error.message || 'Registration failed';
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

            const response = await firebaseService.logout();
            
            window.notifications?.hideLoading(loadingNotification);
            
            if (response.success) {
                // Show success message
                window.notifications?.success(
                    'Logged Out',
                    'You have been successfully logged out.'
                );

                // Redirect to login
                setTimeout(() => {
                    window.location.href = '/pages/auth/login.html';
                }, 1000);
            } else {
                window.notifications?.error(
                    'Logout Error',
                    response.message || 'Failed to log out'
                );
            }

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
        console.log('🔐 AuthManager: shouldRedirect check - currentPath:', currentPath);
        console.log('🔐 AuthManager: shouldRedirect check - currentUser:', this.currentUser);
        
        // Always redirect from auth pages
        if (currentPath.includes('login.html') || 
            currentPath.includes('register.html') ||
            currentPath.includes('forgot-password.html')) {
            console.log('🔐 AuthManager: On auth page, should redirect');
            return true;
        }
        
        // Also redirect if user is on wrong dashboard for their role
        if (this.currentUser && this.currentUser.role) {
            const role = this.currentUser.role;
            console.log('🔐 AuthManager: User role:', role);
            
            const validDashboardPaths = {
                'community-admin': '/pages/admin/admin-dashboard.html',
                'mentor': '/pages/mentor/mentor-dashboard.html',
                'student': '/pages/student/user-dashboard.html',
                'personal': '/pages/personal/student-dashboard.html'
            };
            
            const correctDashboard = validDashboardPaths[role];
            console.log('🔐 AuthManager: Correct dashboard for role', role, ':', correctDashboard);
            
            if (correctDashboard && !currentPath.includes(correctDashboard.replace('.html', ''))) {
                console.log('🔐 AuthManager: User is on wrong dashboard, should redirect');
                return true;
            } else {
                console.log('🔐 AuthManager: User is on correct dashboard, no redirect needed');
            }
        } else {
            console.log('🔐 AuthManager: No current user or role, no redirect needed');
        }
        
        return false;
    }

    redirectByRole() {
        if (!this.currentUser) {
            console.log('🔐 AuthManager: No current user, skipping redirect');
            return;
        }

        const role = this.currentUser.role;
        const currentPath = window.location.pathname;
        
        console.log('🔐 AuthManager: Current user:', this.currentUser);
        console.log('🔐 AuthManager: User role:', role);
        console.log('🔐 AuthManager: Current path:', currentPath);
        
        // Don't redirect if already on a valid dashboard page
        const validDashboardPaths = [
            '/pages/admin/admin-dashboard.html',
            '/pages/mentor/mentor-dashboard.html', 
            '/pages/student/user-dashboard.html',
            '/pages/personal/student-dashboard.html'
        ];
        
        if (validDashboardPaths.some(path => currentPath.includes(path.replace('.html', '')))) {
            console.log('🔐 AuthManager: Already on valid dashboard, skipping redirect');
            return;
        }

        const redirects = {
            'community-admin': '/pages/admin/admin-dashboard.html',
            'mentor': '/pages/mentor/mentor-dashboard.html',
            'student': '/pages/student/user-dashboard.html',
            'personal': '/pages/personal/student-dashboard.html'
        };

        const redirectUrl = redirects[role];
        console.log('🔐 AuthManager: Redirect URL for role', role, ':', redirectUrl);
        
        if (redirectUrl && currentPath !== redirectUrl) {
            console.log('🔐 AuthManager: Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
        } else {
            console.log('🔐 AuthManager: No redirect needed or invalid role');
        }
    }

    isProtectedPage() {
        const currentPath = window.location.pathname;
        const protectedPaths = [
            'pages/admin/',
            'pages/mentor/',
            'pages/student/',
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
        return this.currentUser?.uid;
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

    // Get Firebase ID token for API calls
    async getIdToken() {
        return await firebaseService.getIdToken();
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
