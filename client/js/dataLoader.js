/**
 * Dynamic Data Loader
 * Handles loading and caching of dynamic data from backend APIs
 */

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.loadingPromises = new Map();
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('📊 DataLoader: Initializing...');
        
        try {
            // Wait for context manager to be ready
            await window.contextManager.waitForReady();
            
            this.isInitialized = true;
            console.log('📊 DataLoader: Initialization complete');
            
        } catch (error) {
            console.error('📊 DataLoader: Initialization failed:', error);
        }
    }

    // Get cached data or load from API
    async getData(key, loader, forceRefresh = false) {
        // Check cache first
        if (!forceRefresh && this.cache.has(key)) {
            const cached = this.cache.get(key);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log(`📊 DataLoader: Using cached data for ${key}`);
                return cached.data;
            }
        }

        // Check if already loading
        if (this.loadingPromises.has(key)) {
            console.log(`📊 DataLoader: Waiting for existing load for ${key}`);
            return this.loadingPromises.get(key);
        }

        // Load data
        const loadPromise = this.loadData(key, loader);
        this.loadingPromises.set(key, loadPromise);

        try {
            const data = await loadPromise;
            this.cache.set(key, {
                data,
                timestamp: Date.now()
            });
            return data;
        } finally {
            this.loadingPromises.delete(key);
        }
    }

    // Load data from API
    async loadData(key, loader) {
        console.log(`📊 DataLoader: Loading data for ${key}`);
        
        try {
            const data = await loader();
            console.log(`📊 DataLoader: Successfully loaded data for ${key}`);
            return data;
        } catch (error) {
            console.error(`📊 DataLoader: Failed to load data for ${key}:`, error);
            throw error;
        }
    }

    // Load community summary data
    async loadCommunitySummary(forceRefresh = false) {
        const communityId = window.contextManager.getCommunityId();
        if (!communityId) {
            throw new Error('No community ID available');
        }

        return this.getData(
            `community-summary-${communityId}`,
            () => window.APIService.getCommunitySummary(communityId),
            forceRefresh
        );
    }

    // Load community insights
    async loadCommunityInsights(forceRefresh = false) {
        const communityId = window.contextManager.getCommunityId();
        if (!communityId) {
            throw new Error('No community ID available');
        }

        return this.getData(
            `community-insights-${communityId}`,
            () => window.APIService.getCommunityInsights(communityId),
            forceRefresh
        );
    }

    // Load recent activity
    async loadRecentActivity(forceRefresh = false) {
        const communityId = window.contextManager.getCommunityId();
        if (!communityId) {
            throw new Error('No community ID available');
        }

        return this.getData(
            `recent-activity-${communityId}`,
            () => window.APIService.getRecentActivity(communityId),
            forceRefresh
        );
    }

    // Load recent users
    async loadRecentUsers(limit = 10, forceRefresh = false) {
        const communityId = window.contextManager.getCommunityId();
        if (!communityId) {
            throw new Error('No community ID available');
        }

        return this.getData(
            `recent-users-${communityId}-${limit}`,
            () => window.APIService.getRecentUsers(communityId, limit),
            forceRefresh
        );
    }

    // Load recent mentors
    async loadRecentMentors(limit = 10, forceRefresh = false) {
        const communityId = window.contextManager.getCommunityId();
        if (!communityId) {
            throw new Error('No community ID available');
        }

        return this.getData(
            `recent-mentors-${communityId}-${limit}`,
            () => window.APIService.getRecentMentors(communityId, limit),
            forceRefresh
        );
    }

    // Load all users (admin only)
    async loadAllUsers(params = {}, forceRefresh = false) {
        if (!window.contextManager.isAdmin()) {
            throw new Error('Access denied: Admin role required');
        }

        return this.getData(
            `all-users-${JSON.stringify(params)}`,
            () => window.APIService.getUsers(params),
            forceRefresh
        );
    }

    // Load contests
    async loadContests(params = {}, forceRefresh = false) {
        return this.getData(
            `contests-${JSON.stringify(params)}`,
            () => window.APIService.getContests(params),
            forceRefresh
        );
    }

    // Load analytics data
    async loadAnalytics(params = {}, forceRefresh = false) {
        if (!window.contextManager.isAdmin()) {
            throw new Error('Access denied: Admin role required');
        }

        return this.getData(
            `analytics-${JSON.stringify(params)}`,
            () => window.APIService.getAnalytics(params),
            forceRefresh
        );
    }

    // Load community analytics
    async loadCommunityAnalytics(forceRefresh = false) {
        const communityId = window.contextManager.getCommunityId();
        if (!communityId) {
            throw new Error('No community ID available');
        }

        return this.getData(
            `community-analytics-${communityId}`,
            () => window.APIService.getCommunityAnalytics(communityId),
            forceRefresh
        );
    }

    // Load dashboard data based on user role
    async loadDashboardData(forceRefresh = false) {
        const strategy = window.contextManager.getDataLoadingStrategy();
        const data = {};

        try {
            // Load common data
            if (strategy.loadCommunityData) {
                data.summary = await this.loadCommunitySummary(forceRefresh);
                data.insights = await this.loadCommunityInsights(forceRefresh);
            }

            if (strategy.loadContests) {
                data.contests = await this.loadContests({}, forceRefresh);
            }

            if (strategy.loadUsers) {
                data.users = await this.loadRecentUsers(10, forceRefresh);
            }

            if (strategy.loadMentors) {
                data.mentors = await this.loadRecentMentors(10, forceRefresh);
            }

            if (strategy.loadAnalytics) {
                data.analytics = await this.loadAnalytics({}, forceRefresh);
            }

            // Load activity data
            data.activity = await this.loadRecentActivity(forceRefresh);

            return data;

        } catch (error) {
            console.error('📊 DataLoader: Error loading dashboard data:', error);
            throw error;
        }
    }

    // Clear cache
    clearCache() {
        console.log('📊 DataLoader: Clearing cache...');
        this.cache.clear();
    }

    // Clear specific cache entry
    clearCacheEntry(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            console.log(`📊 DataLoader: Cleared cache entry: ${key}`);
        }
    }

    // Refresh all data
    async refreshAll() {
        console.log('📊 DataLoader: Refreshing all data...');
        this.clearCache();
        return this.loadDashboardData(true);
    }

    // Get cache status
    getCacheStatus() {
        const status = {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
            loading: Array.from(this.loadingPromises.keys())
        };
        
        console.log('📊 DataLoader: Cache status:', status);
        return status;
    }

    // Wait for initialization
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

    // Load all users (for admin)
    async loadAllUsers(options = {}, forceRefresh = false) {
        const key = `all-users-${JSON.stringify(options)}`;
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading all users...');
            return await window.APIService.getAllUsers(options);
        }, forceRefresh);
    }

    // Load all contests (for admin)
    async loadAllContests(options = {}, forceRefresh = false) {
        const key = `all-contests-${JSON.stringify(options)}`;
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading all contests...');
            return await window.APIService.getAllContests(options);
        }, forceRefresh);
    }

    // Load mentor-specific data
    async loadMentorData(forceRefresh = false) {
        const key = 'mentor-data';
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading mentor data...');
            
            const data = {};
            
            // Load mentor profile
            data.profile = await window.APIService.getUserProfile();
            
            // Load assigned students
            data.students = await window.APIService.getMentorStudents();
            
            // Load mentor contests
            data.contests = await window.APIService.getMentorContests();
            
            // Load mentor analytics
            data.analytics = await window.APIService.getMentorAnalytics();
            
            // Load recent activity
            data.recentActivity = await window.APIService.getMentorActivity();
            
            return data;
        }, forceRefresh);
    }

    // Load user contests
    async loadUserContests(options = {}, forceRefresh = false) {
        const key = `user-contests-${JSON.stringify(options)}`;
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading user contests...');
            return await window.APIService.getUserContests(options);
        }, forceRefresh);
    }

    // Load analytics data
    async loadAnalytics(options = {}, forceRefresh = false) {
        const key = `analytics-${JSON.stringify(options)}`;
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading analytics...');
            return await window.APIService.getAnalytics(options);
        }, forceRefresh);
    }

    // Load leaderboard data
    async loadLeaderboard(options = {}, forceRefresh = false) {
        const key = `leaderboard-${JSON.stringify(options)}`;
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading leaderboard...');
            return await window.APIService.getLeaderboard(options);
        }, forceRefresh);
    }

    // Load mentor contests data
    async loadMentorContests(options = {}, forceRefresh = false) {
        const key = `mentor-contests-${JSON.stringify(options)}`;
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading mentor contests...');
            return await window.APIService.getMentorContests(options);
        }, forceRefresh);
    }

    // Load mentor profile data
    async loadMentorProfile(forceRefresh = false) {
        const key = 'mentor-profile';
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading mentor profile...');
            return await window.APIService.getMentorProfile();
        }, forceRefresh);
    }

    // Load user profile data
    async loadUserProfile(forceRefresh = false) {
        const key = 'user-profile';
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading user profile...');
            return await window.APIService.getUserProfilePersonal();
        }, forceRefresh);
    }

    // Load user leaderboard data
    async loadUserLeaderboard(options = {}, forceRefresh = false) {
        const key = `user-leaderboard-${JSON.stringify(options)}`;
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading user leaderboard...');
            return await window.APIService.getUserLeaderboard(options);
        }, forceRefresh);
    }

    // Load community data
    async loadCommunityData(options = {}, forceRefresh = false) {
        const key = `community-data-${JSON.stringify(options)}`;
        return this.getData(key, async () => {
            console.log('📊 DataLoader: Loading community data...');
            return await window.APIService.getCommunityData(options);
        }, forceRefresh);
    }
}

// Initialize Data Loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Initializing DataLoader...');
    
    // Prevent multiple instances
    if (window.dataLoader) {
        console.log('📊 DataLoader already initialized, skipping...');
        return;
    }
    
    // Wait for other dependencies to be ready
    setTimeout(() => {
        try {
            window.dataLoader = new DataLoader();
        } catch (error) {
            console.error('📊 Failed to initialize DataLoader:', error);
        }
    }, 300);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
}
