// Enhanced DataLoader for Firebase Firestore Operations
class EnhancedDataLoader {
    constructor() {
        this.isReady = false;
        this.firebaseService = null;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    async init() {
        console.log('📊 EnhancedDataLoader: Initializing...');
        
        try {
            // Wait for Firebase service to be available
            await this.waitForFirebaseService();
            
            this.isReady = true;
            console.log('✅ EnhancedDataLoader: Initialized successfully');
            
        } catch (error) {
            console.error('❌ EnhancedDataLoader: Initialization failed:', error);
            throw error;
        }
    }

    async waitForFirebaseService() {
        let retries = 0;
        const maxRetries = 10;
        
        while (retries < maxRetries) {
            try {
                const { default: firebaseService } = await import('./firebaseService.js');
                this.firebaseService = firebaseService;
                console.log('✅ EnhancedDataLoader: Firebase service ready');
                break;
            } catch (error) {
                retries++;
                console.log(`📊 EnhancedDataLoader: Waiting for Firebase service... ${retries}/${maxRetries}`);
                
                if (retries >= maxRetries) {
                    throw new Error('Firebase service not available after maximum retries');
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    // User Data Methods
    async loadUserData(userId) {
        const cacheKey = `user_${userId}`;
        
        if (this.isCacheValid(cacheKey)) {
            console.log('📊 EnhancedDataLoader: Returning cached user data');
            return this.cache.get(cacheKey);
        }

        try {
            console.log(`📊 EnhancedDataLoader: Loading user data for ${userId}`);
            
            const userData = await this.firebaseService.getUserProfile(userId);
            const stats = await this.firebaseService.getUserStats(userId);
            
            const completeUserData = {
                ...userData,
                stats: stats
            };
            
            this.setCache(cacheKey, completeUserData);
            console.log('✅ EnhancedDataLoader: User data loaded successfully');
            
            return completeUserData;
            
        } catch (error) {
            console.error('❌ EnhancedDataLoader: Error loading user data:', error);
            throw error;
        }
    }

    async loadUserProfile(userId) {
        try {
            return await this.firebaseService.getUserProfile(userId);
        } catch (error) {
            console.error('Error loading user profile:', error);
            throw error;
        }
    }

    async loadUserStats(userId) {
        try {
            return await this.firebaseService.getUserStats(userId);
        } catch (error) {
            console.error('Error loading user stats:', error);
            throw error;
        }
    }

    async loadUserProjects(userId, limit = 10) {
        try {
            return await this.firebaseService.getUserProjects(userId, limit);
        } catch (error) {
            console.error('Error loading user projects:', error);
            throw error;
        }
    }

    async loadUserTasks(userId, limit = 10) {
        try {
            return await this.firebaseService.getUserTasks(userId, limit);
        } catch (error) {
            console.error('Error loading user tasks:', error);
            throw error;
        }
    }

    async loadUserAchievements(userId) {
        try {
            return await this.firebaseService.getUserAchievements(userId);
        } catch (error) {
            console.error('Error loading user achievements:', error);
            throw error;
        }
    }

    async loadUserCommunities(userId) {
        try {
            return await this.firebaseService.getUserCommunities(userId);
        } catch (error) {
            console.error('Error loading user communities:', error);
            throw error;
        }
    }

    // Student-Specific Methods
    async loadStudentStats(userId) {
        try {
            const stats = await this.firebaseService.getUserStats(userId);
            return {
                totalProblems: stats.totalProblems || 0,
                problemsSolved: stats.problemsSolved || 0,
                accuracyRate: stats.accuracyRate || 0,
                studyHours: stats.studyHours || 0,
                currentStreak: stats.currentStreak || 0,
                longestStreak: stats.longestStreak || 0,
                mentorSessions: stats.mentorSessions || 0,
                studyGroupMeetings: stats.studyGroupMeetings || 0
            };
        } catch (error) {
            console.error('Error loading student stats:', error);
            throw error;
        }
    }

    async loadStudentSubmissions(userId, limit = 10) {
        try {
            return await this.firebaseService.getUserSubmissions(userId, limit);
        } catch (error) {
            console.error('Error loading student submissions:', error);
            throw error;
        }
    }

    async loadLearningProgress(userId) {
        try {
            return await this.firebaseService.getLearningProgress(userId);
        } catch (error) {
            console.error('Error loading learning progress:', error);
            throw error;
        }
    }

    async loadMentorConnections(userId) {
        try {
            return await this.firebaseService.getMentorConnections(userId);
        } catch (error) {
            console.error('Error loading mentor connections:', error);
            throw error;
        }
    }

    async loadStudyGroups(userId) {
        try {
            return await this.firebaseService.getStudyGroups(userId);
        } catch (error) {
            console.error('Error loading study groups:', error);
            throw error;
        }
    }

    // Mentor-Specific Methods
    async loadMentorStats(userId) {
        try {
            const stats = await this.firebaseService.getUserStats(userId);
            return {
                totalStudents: stats.totalStudents || 0,
                activeStudents: stats.activeStudents || 0,
                sessionsCompleted: stats.sessionsCompleted || 0,
                averageRating: stats.averageRating || 0,
                totalHours: stats.totalHours || 0,
                specialization: stats.specialization || 'General'
            };
        } catch (error) {
            console.error('Error loading mentor stats:', error);
            throw error;
        }
    }

    async loadMentorStudents(userId) {
        try {
            return await this.firebaseService.getMentorStudents(userId);
        } catch (error) {
            console.error('Error loading mentor students:', error);
            throw error;
        }
    }

    async loadMentorSessions(userId, limit = 10) {
        try {
            return await this.firebaseService.getMentorSessions(userId, limit);
        } catch (error) {
            console.error('Error loading mentor sessions:', error);
            throw error;
        }
    }

    // Admin-Specific Methods
    async loadAdminStats() {
        try {
            return await this.firebaseService.getAdminStats();
        } catch (error) {
            console.error('Error loading admin stats:', error);
            throw error;
        }
    }

    async loadAllUsers(limit = 50) {
        try {
            return await this.firebaseService.getAllUsers(limit);
        } catch (error) {
            console.error('Error loading all users:', error);
            throw error;
        }
    }

    async loadSystemMetrics() {
        try {
            return await this.firebaseService.getSystemMetrics();
        } catch (error) {
            console.error('Error loading system metrics:', error);
            throw error;
        }
    }

    // Real-time Listeners
    setupUserStatsListener(userId, callback) {
        try {
            return this.firebaseService.setupUserStatsListener(userId, callback);
        } catch (error) {
            console.error('Error setting up user stats listener:', error);
            throw error;
        }
    }

    setupUserProjectsListener(userId, callback) {
        try {
            return this.firebaseService.setupUserProjectsListener(userId, callback);
        } catch (error) {
            console.error('Error setting up user projects listener:', error);
            throw error;
        }
    }

    setupStudentStatsListener(userId, callback) {
        try {
            return this.firebaseService.setupUserStatsListener(userId, (stats) => {
                const studentStats = {
                    totalProblems: stats.totalProblems || 0,
                    problemsSolved: stats.problemsSolved || 0,
                    accuracyRate: stats.accuracyRate || 0,
                    studyHours: stats.studyHours || 0,
                    currentStreak: stats.currentStreak || 0,
                    longestStreak: stats.longestStreak || 0,
                    mentorSessions: stats.mentorSessions || 0,
                    studyGroupMeetings: stats.studyGroupMeetings || 0
                };
                callback(studentStats);
            });
        } catch (error) {
            console.error('Error setting up student stats listener:', error);
            throw error;
        }
    }

    setupSubmissionsListener(userId, callback) {
        try {
            return this.firebaseService.setupSubmissionsListener(userId, callback);
        } catch (error) {
            console.error('Error setting up submissions listener:', error);
            throw error;
        }
    }

    setupMentorStatsListener(userId, callback) {
        try {
            return this.firebaseService.setupUserStatsListener(userId, (stats) => {
                const mentorStats = {
                    totalStudents: stats.totalStudents || 0,
                    activeStudents: stats.activeStudents || 0,
                    sessionsCompleted: stats.sessionsCompleted || 0,
                    averageRating: stats.averageRating || 0,
                    totalHours: stats.totalHours || 0,
                    specialization: stats.specialization || 'General'
                };
                callback(mentorStats);
            });
        } catch (error) {
            console.error('Error setting up mentor stats listener:', error);
            throw error;
        }
    }

    // Cache Management
    isCacheValid(key) {
        const cached = this.cache.get(key);
        if (!cached) return false;
        
        const now = Date.now();
        return (now - cached.timestamp) < this.cacheTimeout;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
        console.log('📊 EnhancedDataLoader: Cache cleared');
    }

    // Utility Methods
    formatDate(timestamp) {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    formatTime(timestamp) {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString();
    }

    formatDateTime(timestamp) {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    }
}

// Create global instance
window.dataLoader = new EnhancedDataLoader();

export default EnhancedDataLoader;
