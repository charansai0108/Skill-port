/**
 * Context Manager
 * Manages user role, community context, and page-specific data loading
 */

class ContextManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.communityId = null;
        this.communityData = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('🎯 ContextManager: Initializing...');
        
        try {
            // Wait for AuthManager to be ready
            if (window.authManager && window.authManager.isInitialized !== false) {
                await this.loadUserContext();
            } else {
                // Wait for AuthManager to be available with a maximum retry limit
                if (this.retryCount === undefined) {
                    this.retryCount = 0;
                }
                
                if (this.retryCount < 50) { // Maximum 5 seconds of retries
                    this.retryCount++;
                    setTimeout(() => this.init(), 100);
                    return;
                } else {
                    console.error('🎯 ContextManager: AuthManager not available after maximum retries');
                    return;
                }
            }
            
            this.isInitialized = true;
            console.log('🎯 ContextManager: Initialization complete');
            
            // Dispatch context ready event
            window.dispatchEvent(new CustomEvent('context:ready', {
                detail: {
                    user: this.currentUser,
                    role: this.userRole,
                    communityId: this.communityId
                }
            }));
            
        } catch (error) {
            console.error('🎯 ContextManager: Initialization failed:', error);
        }
    }

    async loadUserContext() {
        console.log('🎯 ContextManager: Loading user context...');
        
        try {
            // Get user data from AuthManager
            if (window.authManager.isAuthenticated && window.authManager.currentUser) {
                this.currentUser = window.authManager.currentUser;
                this.userRole = this.currentUser.role;
                this.communityId = this.currentUser.community?.id || this.currentUser.community?._id;
                
                console.log('🎯 ContextManager: User context loaded:', {
                    role: this.userRole,
                    communityId: this.communityId,
                    user: this.currentUser
                });
                
                // Load community data if available
                if (this.communityId) {
                    await this.loadCommunityData();
                }
            } else {
                console.log('🎯 ContextManager: No authenticated user found');
            }
            
        } catch (error) {
            console.error('🎯 ContextManager: Error loading user context:', error);
        }
    }

    async loadCommunityData() {
        if (!this.communityId) return;
        
        try {
            console.log('🎯 ContextManager: Loading community data for:', this.communityId);
            
            // Load community summary data
            const summaryResponse = await window.APIService.getCommunitySummary(this.communityId);
            if (summaryResponse.success) {
                this.communityData = {
                    ...this.communityData,
                    summary: summaryResponse.data
                };
            }
            
            // Load community insights
            const insightsResponse = await window.APIService.getCommunityInsights(this.communityId);
            if (insightsResponse.success) {
                this.communityData = {
                    ...this.communityData,
                    insights: insightsResponse.data
                };
            }
            
            console.log('🎯 ContextManager: Community data loaded:', this.communityData);
            
        } catch (error) {
            console.error('🎯 ContextManager: Error loading community data:', error);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get user role
    getUserRole() {
        return this.userRole;
    }

    // Get community ID
    getCommunityId() {
        return this.communityId;
    }

    // Get community data
    getCommunityData() {
        return this.communityData;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.userRole === role;
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

    // Get role-specific dashboard path
    getDashboardPath() {
        const rolePaths = {
            'community-admin': '/pages/admin/admin-dashboard.html',
            'mentor': '/pages/mentor/mentor-dashboard.html',
            'student': '/pages/student/user-dashboard.html',
            'personal': '/pages/personal/index.html'
        };
        
        return rolePaths[this.userRole] || '/pages/auth/login.html';
    }

    // Get role-specific page permissions
    canAccessPage(pagePath) {
        const adminPages = ['/pages/admin/'];
        const mentorPages = ['/pages/mentor/', '/pages/admin/'];
        const studentPages = ['/pages/student/', '/pages/mentor/'];
        const personalPages = ['/pages/personal/'];
        
        switch (this.userRole) {
            case 'community-admin':
                return true; // Admin can access all pages
            case 'mentor':
                return mentorPages.some(prefix => pagePath.startsWith(prefix));
            case 'student':
                return studentPages.some(prefix => pagePath.startsWith(prefix));
            case 'personal':
                // Personal users can only access their personal dashboard
                return personalPages.some(prefix => pagePath.startsWith(prefix));
            default:
                return false;
        }
    }

    // Get role-specific data loading strategy
    getDataLoadingStrategy() {
        const strategies = {
            'community-admin': {
                loadUsers: true,
                loadMentors: true,
                loadContests: true,
                loadAnalytics: true,
                loadCommunityData: true
            },
            'mentor': {
                loadUsers: false,
                loadMentors: true,
                loadContests: true,
                loadAnalytics: false,
                loadCommunityData: false
            },
            'student': {
                loadUsers: false,
                loadMentors: false,
                loadContests: true,
                loadAnalytics: false,
                loadCommunityData: false
            }
        };
        
        return strategies[this.userRole] || strategies['student'];
    }

    // Refresh context data
    async refresh() {
        console.log('🎯 ContextManager: Refreshing context...');
        
        try {
            await this.loadUserContext();
            
            // Dispatch refresh event
            window.dispatchEvent(new CustomEvent('context:refreshed', {
                detail: {
                    user: this.currentUser,
                    role: this.userRole,
                    communityId: this.communityId
                }
            }));
            
        } catch (error) {
            console.error('🎯 ContextManager: Error refreshing context:', error);
        }
    }

    // Clear context
    clear() {
        console.log('🎯 ContextManager: Clearing context...');
        
        this.currentUser = null;
        this.userRole = null;
        this.communityId = null;
        this.communityData = null;
        this.isInitialized = false;
        
        // Dispatch clear event
        window.dispatchEvent(new CustomEvent('context:cleared'));
    }

    // Wait for context to be ready
    async waitForReady() {
        if (this.isInitialized) {
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }
}

// Initialize Context Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Initializing ContextManager...');
    
    // Prevent multiple instances
    if (window.contextManager) {
        console.log('🎯 ContextManager already initialized, skipping...');
        return;
    }
    
    // Wait for AuthManager to be ready
    setTimeout(() => {
        try {
            window.contextManager = new ContextManager();
        } catch (error) {
            console.error('🎯 Failed to initialize ContextManager:', error);
        }
    }, 200);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextManager;
}
