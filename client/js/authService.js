/**
 * Centralized Authentication Service
 * Provides consistent authentication checks and user management
 */

import { signInWithGoogle, signInWithFacebook, signOut as firebaseSignOut } from './services/firebaseClient.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.userRole = null;
        this.authStateListeners = [];
        this.firebaseService = null;
        
        // Initialize Firebase service connection
        this.initializeFirebase();
    }

    async initializeFirebase() {
        try {
            // Use dynamic import to avoid initialization order issues
            const firebaseModule = await import('./firebaseService.js');
            this.firebaseService = firebaseModule.default;
            
            if (this.firebaseService && this.firebaseService.onAuthStateChange) {
                this.firebaseService.onAuthStateChange((user, authenticated, status) => {
                    this.handleAuthStateChange(user, authenticated, status);
                });
                console.log('✅ Firebase initialized in AuthService');
            } else {
                console.warn('⚠️ Firebase service not available, retrying...');
                setTimeout(() => this.initializeFirebase(), 500);
            }
        } catch (error) {
            console.error('Error initializing Firebase in AuthService:', error);
            // Retry after a longer delay
            setTimeout(() => this.initializeFirebase(), 1000);
        }
    }

    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 20;
        
        while (!this.firebaseService && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!this.firebaseService) {
            throw new Error('Firebase service not available after waiting');
        }
    }

    async register(email, password, userData) {
        try {
            await this.waitForFirebase();
            const result = await this.firebaseService.registerUser(email, password, userData);
            return { success: true, data: result };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    async login(email, password) {
        try {
            await this.waitForFirebase();
            const result = await this.firebaseService.signInUser(email, password);
            return { success: true, data: result };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            if (this.firebaseService) {
                await this.firebaseService.signOutUser();
            }
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    handleAuthStateChange(user, authenticated, status) {
        this.currentUser = user;
        this.isAuthenticated = authenticated;
        this.userRole = user?.role || null;
        
        // Handle verification status
        if (status === 'otp-not-verified') {
            console.log('⚠️ OTP not verified, redirecting to login...');
            // Redirect to login page with verification message
            if (window.location.pathname !== '/pages/auth/login.html') {
                window.location.href = '/pages/auth/login.html?message=otp-not-verified';
            }
            return;
        }
        
        // Handle legacy email verification status
        if (status === 'email-not-verified') {
            console.log('⚠️ Email not verified, redirecting to login...');
            // Redirect to login page with verification message
            if (window.location.pathname !== '/pages/auth/login.html') {
                window.location.href = '/pages/auth/login.html?message=email-not-verified';
            }
            return;
        }
        
        // Notify all listeners
        this.authStateListeners.forEach(listener => {
            try {
                listener(user, authenticated, this.userRole);
            } catch (error) {
                console.error('Auth state listener error:', error);
            }
        });
    }

    // Standardized authentication check
    requireAuth() {
        if (!this.isAuthenticated) {
            throw new Error('Authentication required');
        }
        return this.currentUser;
    }

    // Standardized role-based access check
    requireRole(allowedRoles) {
        const user = this.requireAuth();
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        if (!this.userRole || !roles.includes(this.userRole)) {
            throw new Error(`Access denied. Required roles: ${roles.join(', ')}`);
        }
        return user;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.isAuthenticated && this.userRole === role;
    }

    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        return this.isAuthenticated && roles.includes(this.userRole);
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('community-admin');
    }

    // Check if user is mentor
    isMentor() {
        return this.hasRole('mentor');
    }

    // Check if user is student
    isStudent() {
        return this.hasRole('student');
    }

    // Check if user is personal user
    isPersonal() {
        return this.hasRole('personal');
    }

    // Get current user safely
    getCurrentUser() {
        if (!this.isAuthenticated) {
            return null;
        }
        return { ...this.currentUser };
    }

    // Get user ID safely
    getUserId() {
        return this.isAuthenticated ? this.currentUser?.uid : null;
    }

    // Get user role safely
    getUserRole() {
        return this.userRole;
    }

    // Check if user belongs to a specific community
    belongsToCommunity(communityId) {
        return this.isAuthenticated && this.currentUser?.community === communityId;
    }

    // Subscribe to auth state changes
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    // Async wrapper for Firebase operations with auth check
    async withAuth(operation) {
        try {
            this.requireAuth();
            return await operation();
        } catch (error) {
            if (error.message === 'Authentication required') {
                throw new Error('Please log in to perform this action');
            }
            throw error;
        }
    }

    // Async wrapper for role-based operations
    async withRole(allowedRoles, operation) {
        try {
            this.requireRole(allowedRoles);
            return await operation();
        } catch (error) {
            if (error.message.includes('Access denied')) {
                throw new Error('You do not have permission to perform this action');
            }
            throw error;
        }
    }

    // Validate user permissions for community operations
    validateCommunityAccess(communityId, requiredRole = null) {
        const user = this.requireAuth();
        
        // Check if user belongs to the community
        if (!this.belongsToCommunity(communityId)) {
            throw new Error('You are not a member of this community');
        }
        
        // Check role if specified
        if (requiredRole && !this.hasRole(requiredRole)) {
            throw new Error(`This action requires ${requiredRole} role`);
        }
        
        return user;
    }

    // Get user's accessible communities
    getAccessibleCommunities() {
        if (!this.isAuthenticated) {
            return [];
        }
        
        // For now, return user's community if they have one
        return this.currentUser?.community ? [this.currentUser.community] : [];
    }

    // Check if user can perform admin actions
    canPerformAdminActions() {
        return this.isAdmin();
    }

    // Check if user can manage contests
    canManageContests(contestData = null) {
        if (this.isAdmin()) {
            return true;
        }
        
        if (this.isMentor() && contestData) {
            return contestData.createdBy === this.getUserId() || 
                   contestData.community === this.currentUser?.community;
        }
        
        return false;
    }

    // Check if user can view submissions
    canViewSubmissions(submissionData = null) {
        if (this.isAdmin()) {
            return true;
        }
        
        if (submissionData) {
            // Users can view their own submissions
            if (submissionData.userId === this.getUserId()) {
                return true;
            }
            
            // Mentors can view submissions in their community
            if (this.isMentor() && submissionData.community === this.currentUser?.community) {
                return true;
            }
        }
        
        return false;
    }

    // Social Authentication Methods
    async loginWithGoogle() {
        try {
            const result = await signInWithGoogle();
            if (result.success) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                this.notifyAuthStateListeners(result.user, true);
            }
            return result;
        } catch (error) {
            console.error('AuthService: Google login error:', error);
            return { success: false, error: error.message };
        }
    }

    async loginWithFacebook() {
        try {
            const result = await signInWithFacebook();
            if (result.success) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                this.notifyAuthStateListeners(result.user, true);
            }
            return result;
        } catch (error) {
            console.error('AuthService: Facebook login error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const result = await firebaseSignOut();
            if (result.success) {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.userRole = null;
                this.notifyAuthStateListeners(null, false);
            }
            return result;
        } catch (error) {
            console.error('AuthService: Sign out error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
// Cache buster: 1757559537
// Force reload: 1757560250762955000
console.log('CACHE BUST TEST: ' + Date.now());
