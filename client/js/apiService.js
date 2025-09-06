/**
 * API Service - Firebase Migration Wrapper
 * This file provides backward compatibility while migrating to Firebase-only approach
 * All methods now redirect to firebaseService
 */

import firebaseService from './firebaseService.js';

class APIService {
    constructor() {
        console.log('🌐 API Service: Using Firebase migration wrapper');
    }

    // User Management
    async getUserProfile() {
        return await firebaseService.getUserProfile();
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
        return await firebaseService.getCommunityDetails(communityId);
    }

    // Contest Management
    async getContests() {
        return await firebaseService.getContests();
    }

    async createContest(contestData) {
        return await firebaseService.createContest(contestData);
    }

    async getContestById(contestId) {
        return await firebaseService.getContestById(contestId);
    }

    // Submission Management
    async getSubmissions(contestId = null) {
        return await firebaseService.getSubmissions(contestId);
    }

    async submitContestEntry(contestId, submissionData) {
        return await firebaseService.submitContestEntry(contestId, submissionData);
    }

    // Task Management
    async getTasks() {
        return await firebaseService.getTasks();
    }

    async createTask(taskData) {
        return await firebaseService.createTask(taskData);
    }

    async updateTask(taskId, taskData) {
        return await firebaseService.updateTask(taskId, taskData);
    }

    async deleteTask(taskId) {
        return await firebaseService.deleteTask(taskId);
    }

    // Project Management
    async getProjects() {
        return await firebaseService.getProjects();
    }

    async createProject(projectData) {
        return await firebaseService.createProject(projectData);
    }

    async updateProject(projectId, projectData) {
        return await firebaseService.updateProject(projectId, projectData);
    }

    async deleteProject(projectId) {
        return await firebaseService.deleteProject(projectId);
    }

    // Statistics and Analytics
    async getUserStats(userId = null) {
        return await firebaseService.getUserStats(userId);
    }

    async getCommunityStats(communityId) {
        return await firebaseService.getCommunityStats(communityId);
    }

    async getAnalytics() {
        return await firebaseService.getAnalytics();
    }

    // Feedback Management
    async getFeedbackRequests() {
        return await firebaseService.getFeedbackRequests();
    }

    async createFeedbackRequest(feedbackData) {
        return await firebaseService.createFeedbackRequest(feedbackData);
    }

    // Health Check
    async healthCheck() {
        return {
            success: true,
            message: 'API Service running with Firebase',
            data: {
                timestamp: new Date().toISOString(),
                backend: 'Firebase'
            }
        };
    }
}

// Create global instance
window.APIService = new APIService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}