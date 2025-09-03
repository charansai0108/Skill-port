/**
 * SkillPort Authentication Manager
 * Handles user authentication, session management, and role-based access
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
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
        const token = localStorage.getItem('jwt_token');
        
        if (!token) {
            this.handleUnauthenticated();
            return;
        }

        try {
            // Verify token with backend
            const response = await window.APIService.getUserProfile();
            
            if (response.success) {
                this.currentUser = response.data;
                this.isAuthenticated = true;
                this.handleAuthenticated();
            } else {
                this.handleInvalidToken();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.handleInvalidToken();
        }
    }

    handleAuthenticated() {
        // Update UI to show authenticated state
        this.updateAuthUI();
        
        // Redirect based on role if on login/register page
        if (this.shouldRedirect()) {
            this.redirectByRole();
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('auth:authenticated', {
            detail: { user: this.currentUser }
        }));
    }

    handleUnauthenticated() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Update UI to show unauthenticated state
        this.updateAuthUI();
        
        // Redirect to login if on protected page
        if (this.isProtectedPage()) {
            this.redirectToLogin();
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('auth:unauthenticated'));
    }

    handleInvalidToken() {
        localStorage.removeItem('jwt_token');
        this.handleUnauthenticated();
        
        // Show notification
        if (window.notifications) {
            window.notifications.error(
                'Session Expired',
                'Your session has expired. Please log in again.'
            );
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

            if (response.success) {
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
                    response.error || 'Invalid email or password'
                );
                return { success: false, error: response.error };
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
            'student': '/pages/user/user-dashboard.html',
            'personal': '/skillport-personal/student-dashboard'
        };

        const redirectUrl = redirects[role];
        if (redirectUrl && window.location.pathname !== redirectUrl) {
            window.location.href = redirectUrl;
        }
    }

    isProtectedPage() {
        const currentPath = window.location.pathname;
        const protectedPaths = [
            '/admin/',
            '/mentor/',
            '/user/',
            '/skillport-personal/'
        ];
        
        return protectedPaths.some(path => currentPath.includes(path));
    }

    redirectToLogin() {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html')) {
            window.location.href = '/pages/auth/login.html';
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
        
        // Personal users can't access communities
        if (this.isPersonalUser()) return false;
        
        // Check if user belongs to the community
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

// Create global instance
window.authManager = new AuthManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
