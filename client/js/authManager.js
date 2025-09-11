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

    handleAuthStateChange(isAuthenticated, user, status) {
        console.log('🔐 AuthManager: Auth state changed:', isAuthenticated ? 'User logged in' : 'User logged out', 'Status:', status);
        
        // Handle verification status first
        if (status === 'otp-not-verified') {
            console.log('⚠️ AuthManager: OTP not verified, redirecting to login...');
            this.isAuthenticated = false;
            this.currentUser = null;
            
            // Redirect to login page with verification message
            if (window.location.pathname !== '/pages/auth/login.html') {
                window.location.href = '/pages/auth/login.html?message=otp-not-verified';
            }
            return;
        }
        
        // Handle legacy email verification status
        if (status === 'email-not-verified') {
            console.log('⚠️ AuthManager: Email not verified, redirecting to login...');
            this.isAuthenticated = false;
            this.currentUser = null;
            
            // Redirect to login page with verification message
            if (window.location.pathname !== '/pages/auth/login.html') {
                window.location.href = '/pages/auth/login.html?message=email-not-verified';
            }
            return;
        }
        
        this.isAuthenticated = isAuthenticated;
        this.currentUser = user;
        
        if (isAuthenticated) {
            this.handleAuthenticated().catch(error => {
                console.error('🔐 AuthManager: Error in handleAuthenticated:', error);
                this.handleUnauthenticated();
            });
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

    async handleAuthenticated() {
        console.log('🔐 AuthManager: handleAuthenticated called');
        console.log('🔐 AuthManager: Current user in handleAuthenticated:', this.currentUser);
        
        try {
            console.log('✅ AuthManager: User authenticated, proceeding with authentication');
            
            // Load user data from Firestore to get role and other profile information
            console.log('🔐 AuthManager: Loading user data from Firestore...');
            const { default: firebaseService } = await import('./firebaseService.js');
            await firebaseService.loadUserData(this.currentUser.uid);
            
            // Update currentUser with Firestore data (including role)
            this.currentUser = firebaseService.currentUser;
            console.log('🔐 AuthManager: User data loaded, role:', this.currentUser?.role);
            
            // Check if user is on a protected page
            if (this.isProtectedPage(window.location.pathname)) {
                console.log('🔐 AuthManager: User on protected page, allowing access');
            }
        } catch (error) {
            console.error('🔐 AuthManager: Error in handleAuthenticated:', error);
            // Fallback: redirect to login on error
            window.location.href = '/pages/auth/login.html?message=internal-error';
            return;
        }
        
        // Update UI to show authenticated state
        this.updateAuthUI();
        
        // Don't redirect during registration flow - let the registration process handle redirects
        if (window.location.pathname.includes('/register.html')) {
            console.log('🔐 AuthManager: On registration page, skipping redirect logic');
            return;
        }
        
        // Always check for redirect based on user role
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
        
        // Check if user is on a protected page
        if (this.isProtectedPage(window.location.pathname)) {
            console.log('🔐 AuthManager: User on protected page but not authenticated, letting page controller handle it');
            // Let the page controller handle the authentication check
            return;
        }
        
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
        
        // Clear local data
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
        
        // Always redirect from auth pages, but allow manual access to login
        if (currentPath.includes('register.html') ||
            currentPath.includes('forgot-password.html')) {
            console.log('🔐 AuthManager: On auth page, should redirect');
            return true;
        }
        
        // For login page, allow access if user explicitly wants to login (with ?force=true)
        if (currentPath.includes('login.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('force') === 'true') {
                console.log('🔐 AuthManager: Force login requested, allowing access to login page');
                return false;
            }
            console.log('🔐 AuthManager: On login page, should redirect to dashboard');
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
            console.log('🔐 AuthManager: No current user, redirecting to login');
            window.location.href = '/pages/auth/login.html';
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
        
        if (!role || role === 'undefined') {
            console.warn("No role found for user. Redirecting to profile completion page.");
            // Prefer to send user to a safe profile completion page so they can set role and profile
            // Create this page if it doesn't exist: /pages/auth/complete-profile.html
            window.location.href = "/pages/auth/complete-profile.html?message=role-not-set";
            return;
        }
        
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

    // Check if a page requires authentication
    isProtectedPage(path = window.location.pathname) {
        const protectedPaths = [
            '/pages/personal/',
            '/pages/admin/',
            '/pages/mentor/',
            '/pages/student/'
        ];
        
        return protectedPaths.some(protectedPath => path.startsWith(protectedPath));
    }

    // Get user data from Firestore
    async getUserDataFromFirestore() {
        try {
            if (!this.currentUser) return null;
            
            const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
            const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
            const db = getFirestore();
            
            const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            return userDoc.exists() ? userDoc.data() : null;
        } catch (error) {
            console.error('Error getting user data from Firestore:', error);
            return null;
        }
    }

    // Check if user is verified (OTP or email)
    async isUserVerified() {
        try {
            if (!this.currentUser) return false;
            
            // Reload user to get fresh emailVerified status
            await this.currentUser.reload();
            
            // Get user data from Firestore
            const userData = await this.getUserDataFromFirestore();
            
            const isOtpVerified = userData?.otpVerified === true;
            const isEmailVerified = this.currentUser.emailVerified === true;
            
            console.log('🔐 AuthManager: Verification status:', {
                isOtpVerified,
                isEmailVerified,
                userId: this.currentUser.uid
            });
            
            return isOtpVerified || isEmailVerified;
        } catch (error) {
            console.error('🔐 AuthManager: Error checking verification status:', error);
            return false;
        }
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
// Cache buster: 1757559542
// Force reload: 1757560254274560000
