/**
 * Firebase API Service - Firebase-only data operations
 * Replaces the old Node.js backend with Firebase Firestore
 */

import firebaseService from './firebaseService.js';

class FirebaseAPIService {
    constructor() {
        console.log('🔥 Firebase API Service: Initialized with Firebase-only approach');
    }

    // User Management
    async getUserProfile() {
        if (!firebaseService.isUserAuthenticated()) {
            throw new Error('User not authenticated');
        }
        return {
            success: true,
            data: firebaseService.getCurrentUser()
        };
    }

    async updateUserProfile(userData) {
        return await firebaseService.updateUserProfile(userData);
    }

    // Community Management
    async getCommunities() {
        return await firebaseService.getCommunities();
    }

    async createCommunity(communityData) {
        return await firebaseService.createCommunity(communityData);
    }

    async joinCommunity(communityCode) {
        return await firebaseService.joinCommunity(communityCode);
    }

    async getCommunityDetails(communityId) {
        try {
            const communities = await firebaseService.getCommunities();
            if (communities.success) {
                const community = communities.data.find(c => c.id === communityId);
                if (community) {
                    return { success: true, data: community };
                }
            }
            return { success: false, message: 'Community not found' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Contest Management
    async getContests() {
        return await firebaseService.getContests();
    }

    async createContest(contestData) {
        return await firebaseService.createContest(contestData);
    }

    async getContestById(contestId) {
        try {
            const contests = await firebaseService.getContests();
            if (contests.success) {
                const contest = contests.data.find(c => c.id === contestId);
                if (contest) {
                    return { success: true, data: contest };
                }
            }
            return { success: false, message: 'Contest not found' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Submission Management
    async getSubmissions(contestId = null) {
        return await firebaseService.getSubmissions(contestId);
    }

    async submitContestEntry(contestId, submissionData) {
        return await firebaseService.submitContestEntry(contestId, submissionData);
    }

    // Analytics (simplified)
    async getAnalytics() {
        try {
            const [communities, contests, submissions] = await Promise.all([
                firebaseService.getCommunities(),
                firebaseService.getContests(),
                firebaseService.getSubmissions()
            ]);

            return {
                success: true,
                data: {
                    totalCommunities: communities.success ? communities.data.length : 0,
                    totalContests: contests.success ? contests.data.length : 0,
                    totalSubmissions: submissions.success ? submissions.data.length : 0,
                    totalUsers: 1 // Current user
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Admin functions (simplified)
    async getAllUsers() {
        // In a real app, you'd need admin permissions
        return { success: false, message: 'Admin functions not implemented yet' };
    }

    async getAllContests() {
        return await firebaseService.getContests();
    }

    // Personal Dashboard
    async getUserProjects() {
        return await firebaseService.getProjects();
    }

    async getProjects() {
        return await firebaseService.getProjects();
    }

    async getTasks() {
        return await firebaseService.getTasks();
    }

    async createTask(taskData) {
        return await firebaseService.createTask(taskData);
    }

    async updateTask(taskId, taskData) {
        return await firebaseService.updateTask(taskId, taskData);
    }

    async getUserStats() {
        try {
            const [submissions, contests, projects, communities] = await Promise.all([
                firebaseService.getSubmissions(),
                firebaseService.getContests(),
                firebaseService.getProjects(),
                firebaseService.getCommunities()
            ]);
            
            // Calculate stats
            const totalSubmissions = submissions.success ? submissions.data.length : 0;
            const totalContests = contests.success ? contests.data.length : 0;
            const totalProjects = projects.success ? projects.data.length : 0;
            const totalCommunities = communities.success ? communities.data.length : 0;
            
            // Calculate skill rating based on submissions and projects
            const skillRating = Math.min(2000, 1000 + (totalSubmissions * 10) + (totalProjects * 50));
            
            // Calculate day streak (mock for now)
            const dayStreak = Math.min(30, Math.floor(totalSubmissions / 2));
            
            // Calculate achievements
            const achievements = Math.min(10, Math.floor(totalSubmissions / 5) + Math.floor(totalProjects / 2));
            
            return {
                success: true,
                data: {
                    problemsSolved: totalSubmissions,
                    skillRating: skillRating,
                    dayStreak: dayStreak,
                    achievements: achievements,
                    totalProjects: totalProjects,
                    totalContests: totalContests,
                    joinedCommunities: totalCommunities,
                    weeklyProgress: {
                        monday: Math.floor(Math.random() * 8),
                        tuesday: Math.floor(Math.random() * 8),
                        wednesday: Math.floor(Math.random() * 8),
                        thursday: Math.floor(Math.random() * 8),
                        friday: Math.floor(Math.random() * 8),
                        saturday: Math.floor(Math.random() * 8),
                        sunday: Math.floor(Math.random() * 8)
                    },
                    skillBreakdown: [
                        { name: 'JavaScript', percentage: Math.min(100, 60 + (totalSubmissions * 2)) },
                        { name: 'Python', percentage: Math.min(100, 50 + (totalProjects * 5)) },
                        { name: 'React', percentage: Math.min(100, 70 + (totalSubmissions * 1)) },
                        { name: 'Node.js', percentage: Math.min(100, 65 + (totalProjects * 3)) },
                        { name: 'Database', percentage: Math.min(100, 55 + (totalSubmissions * 1.5)) },
                        { name: 'Mobile Development', percentage: Math.min(100, 40 + (totalProjects * 4)) }
                    ]
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Health check
    async healthCheck() {
        try {
            // Test Firebase connection
            const communities = await firebaseService.getCommunities();
            return {
                success: true,
                data: {
                    status: 'healthy',
                    firebase: 'connected',
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                data: {
                    status: 'unhealthy',
                    firebase: 'disconnected',
                    error: error.message
                }
            };
        }
    }

    // Utility methods for compatibility
    formatError(error) {
        if (error.message) {
            return error.message;
        }
        return 'An unexpected error occurred';
    }

    // Authentication status
    isAuthenticated() {
        return firebaseService.isUserAuthenticated();
    }

    getCurrentUser() {
        return firebaseService.getCurrentUser();
    }

    getUserRole() {
        return firebaseService.getUserRole();
    }
}

// Create and export singleton instance
const firebaseApiService = new FirebaseAPIService();
export default firebaseApiService;

// Also make it available globally for compatibility
window.APIService = firebaseApiService;
