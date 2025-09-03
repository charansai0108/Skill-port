// Frontend API Service for connecting to backend
// This file provides a JavaScript service to be included in frontend pages

class SkillPortAPI {
    constructor() {
        this.baseURL = 'http://localhost:5001/api/v1';
        this.token = localStorage.getItem('token');
        
        // Set up default headers
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        };
    }

    // Update token and headers
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Remove token
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
        delete this.defaultHeaders['Authorization'];
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: this.defaultHeaders,
            ...options,
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            
            // Handle authentication errors
            if (error.message.includes('401') || error.message.includes('token')) {
                this.clearToken();
                // Redirect to login if not already there
                if (!window.location.pathname.includes('login')) {
                    window.location.href = '/community-ui/pages/auth/login.html';
                }
            }
            
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // File upload request
    async uploadFile(endpoint, formData) {
        const headers = { ...this.defaultHeaders };
        delete headers['Content-Type']; // Let browser set content-type for FormData
        
        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers
        });
    }

    // Authentication methods
    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async verifyOTP(email, otp, password) {
        const response = await this.post('/auth/verify-otp', { email, otp, password });
        if (response.data.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async resendOTP(email) {
        return this.post('/auth/resend-otp', { email });
    }

    async login(email, password) {
        const response = await this.post('/auth/login', { email, password });
        if (response.data.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } finally {
            this.clearToken();
        }
    }

    async forgotPassword(email) {
        return this.post('/auth/forgot-password', { email });
    }

    async resetPassword(token, password) {
        const response = await this.post(`/auth/reset-password/${token}`, { password });
        if (response.data.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async changePassword(currentPassword, newPassword) {
        return this.put('/auth/change-password', { currentPassword, newPassword });
    }

    async getCurrentUser() {
        return this.get('/auth/me');
    }

    // User methods
    async getUserProfile() {
        return this.get('/users/profile');
    }

    async updateUserProfile(profileData) {
        return this.put('/users/profile', profileData);
    }

    async updateUserPreferences(preferences) {
        return this.put('/users/preferences', preferences);
    }

    async updatePlatforms(platformsData) {
        return this.put('/users/platforms', platformsData);
    }

    async getUserDashboard() {
        return this.get('/users/dashboard');
    }

    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/users${queryString ? '?' + queryString : ''}`);
    }

    async getUser(userId) {
        return this.get(`/users/${userId}`);
    }

    async createMentor(mentorData) {
        return this.post('/users/mentors', mentorData);
    }

    async addStudentsToBatch(emails, batchCode) {
        return this.post('/users/students/batch', { emails, batchCode });
    }

    async getUserProgress(userId) {
        return this.get(`/users/${userId}/progress`);
    }

    async updateUserStatus(userId, status) {
        return this.put(`/users/${userId}/status`, { status });
    }

    async deleteUser(userId) {
        return this.delete(`/users/${userId}`);
    }

    async getLeaderboard(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/users/leaderboard/community${queryString ? '?' + queryString : ''}`);
    }

    // Community methods
    async getCommunities(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/communities${queryString ? '?' + queryString : ''}`);
    }

    async getCommunity(communityId) {
        return this.get(`/communities/${communityId}`);
    }

    async joinCommunity(communityId, joinData = {}) {
        return this.post(`/communities/${communityId}/join`, joinData);
    }

    async updateCommunity(communityId, communityData) {
        return this.put(`/communities/${communityId}`, communityData);
    }

    async getCommunityDashboard(communityId) {
        return this.get(`/communities/${communityId}/dashboard`);
    }

    async addBatch(communityId, batchData) {
        return this.post(`/communities/${communityId}/batches`, batchData);
    }

    async updateBatch(communityId, batchId, batchData) {
        return this.put(`/communities/${communityId}/batches/${batchId}`, batchData);
    }

    async deleteBatch(communityId, batchId) {
        return this.delete(`/communities/${communityId}/batches/${batchId}`);
    }

    async assignMentorToBatch(communityId, batchId, mentorId) {
        return this.post(`/communities/${communityId}/batches/${batchId}/mentors`, { mentorId });
    }

    async removeMentorFromBatch(communityId, batchId, mentorId) {
        return this.delete(`/communities/${communityId}/batches/${batchId}/mentors/${mentorId}`);
    }

    async getCommunityAnalytics(communityId, period = '30d') {
        return this.get(`/communities/${communityId}/analytics?period=${period}`);
    }

    // Contest methods
    async getContests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/contests${queryString ? '?' + queryString : ''}`);
    }

    async getUpcomingContests(limit = 10) {
        return this.get(`/contests/upcoming?limit=${limit}`);
    }

    async getContest(contestId) {
        return this.get(`/contests/${contestId}`);
    }

    async createContest(contestData) {
        return this.post('/contests', contestData);
    }

    async updateContest(contestId, contestData) {
        return this.put(`/contests/${contestId}`, contestData);
    }

    async registerForContest(contestId, teamData = null) {
        return this.post(`/contests/${contestId}/register`, { teamData });
    }

    async submitSolution(contestId, problemIndex, language, code) {
        return this.post(`/contests/${contestId}/submit`, { problemIndex, language, code });
    }

    async getContestLeaderboard(contestId) {
        return this.get(`/contests/${contestId}/leaderboard`);
    }

    async getContestSubmissions(contestId) {
        return this.get(`/contests/${contestId}/submissions`);
    }

    async addClarification(contestId, problemIndex, question) {
        return this.post(`/contests/${contestId}/clarifications`, { problemIndex, question });
    }

    async answerClarification(contestId, clarificationId, answer, isPublic = false) {
        return this.put(`/contests/${contestId}/clarifications/${clarificationId}`, { answer, isPublic });
    }

    async getContestClarifications(contestId) {
        return this.get(`/contests/${contestId}/clarifications`);
    }

    async deleteContest(contestId) {
        return this.delete(`/contests/${contestId}`);
    }

    // Project methods
    async getProjects(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/projects${queryString ? '?' + queryString : ''}`);
    }

    async getTrendingProjects(limit = 10, days = 7) {
        return this.get(`/projects/trending?limit=${limit}&days=${days}`);
    }

    async getProject(projectId) {
        return this.get(`/projects/${projectId}`);
    }

    async createProject(projectData) {
        return this.post('/projects', projectData);
    }

    async updateProject(projectId, projectData) {
        return this.put(`/projects/${projectId}`, projectData);
    }

    async addCollaborator(projectId, userId, role = 'collaborator', permissions = {}) {
        return this.post(`/projects/${projectId}/collaborators`, { userId, role, permissions });
    }

    async updateCollaboratorPermissions(projectId, userId, permissions, role = null) {
        return this.put(`/projects/${projectId}/collaborators/${userId}`, { permissions, role });
    }

    async removeCollaborator(projectId, userId) {
        return this.delete(`/projects/${projectId}/collaborators/${userId}`);
    }

    async addProjectReview(projectId, rating, comment = '', isPublic = true) {
        return this.post(`/projects/${projectId}/reviews`, { rating, comment, isPublic });
    }

    async completeFeature(projectId, featureId) {
        return this.put(`/projects/${projectId}/features/${featureId}/complete`);
    }

    async completeMilestone(projectId, milestoneId) {
        return this.put(`/projects/${projectId}/milestones/${milestoneId}/complete`);
    }

    async getProjectStats(userId) {
        return this.get(`/projects/stats/${userId}`);
    }

    async searchProjects(query, filters = {}) {
        const params = { q: query, ...filters };
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/projects/search?${queryString}`);
    }

    async deleteProject(projectId) {
        return this.delete(`/projects/${projectId}`);
    }

    // Progress methods
    async getProgress(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/progress${queryString ? '?' + queryString : ''}`);
    }

    async getUserProgressData(userId) {
        return this.get(`/progress/user/${userId}`);
    }

    async createOrUpdateProgress(progressData) {
        return this.post('/progress', progressData);
    }

    async updateProgress(progressId, progressData) {
        return this.put(`/progress/${progressId}`, progressData);
    }

    async addWeeklyProgress(progressId, problemsSolved, timeSpent = 0, points = 0) {
        return this.post(`/progress/${progressId}/weekly`, { problemsSolved, timeSpent, points });
    }

    async addAchievement(progressId, type, title, description = '', points = 0) {
        return this.post(`/progress/${progressId}/achievements`, { type, title, description, points });
    }

    async getProgressLeaderboard(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/progress/leaderboard${queryString ? '?' + queryString : ''}`);
    }

    async getProgressAnalytics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/progress/analytics${queryString ? '?' + queryString : ''}`);
    }

    async updateGoals(progressId, goals) {
        return this.put(`/progress/${progressId}/goals`, goals);
    }

    async deleteProgress(progressId) {
        return this.delete(`/progress/${progressId}`);
    }

    // Extension methods (for personal users)
    async generateExtensionToken() {
        return this.post('/extension/token');
    }

    async verifyExtension(extensionVersion, browserInfo) {
        return this.post('/extension/verify', { extensionVersion, browserInfo });
    }

    async syncExtensionProgress(platform, data, timestamp) {
        return this.post('/extension/sync', { platform, data, timestamp });
    }

    async getExtensionProgress() {
        return this.get('/extension/progress');
    }

    async submitExtensionSolution(solutionData) {
        return this.post('/extension/solution', solutionData);
    }

    async getExtensionSettings() {
        return this.get('/extension/settings');
    }

    async updateExtensionSettings(settings) {
        return this.put('/extension/settings', settings);
    }

    async getExtensionStats(period = '30d') {
        return this.get(`/extension/stats?period=${period}`);
    }

    // Upload methods
    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);
        return this.uploadFile('/upload/avatar', formData);
    }

    async uploadProjectFiles(projectId, files) {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return this.uploadFile(`/upload/project/${projectId}/files`, formData);
    }

    async uploadProjectImages(projectId, images, captions = [], primaryIndex = 0) {
        const formData = new FormData();
        images.forEach(image => formData.append('images', image));
        formData.append('captions', JSON.stringify(captions));
        formData.append('primaryIndex', primaryIndex);
        return this.uploadFile(`/upload/project/${projectId}/images`, formData);
    }

    async uploadCertificate(file, certificateData) {
        const formData = new FormData();
        formData.append('certificate', file);
        Object.keys(certificateData).forEach(key => {
            formData.append(key, certificateData[key]);
        });
        return this.uploadFile('/upload/certificate', formData);
    }

    async uploadCommunityBranding(communityId, logo = null, banner = null) {
        const formData = new FormData();
        if (logo) formData.append('logo', logo);
        if (banner) formData.append('banner', banner);
        return this.uploadFile(`/upload/community/${communityId}/branding`, formData);
    }

    async deleteFile(fileUrl, type) {
        return this.delete('/upload/file', { fileUrl, type });
    }

    async getFileInfo(fileUrl) {
        return this.get(`/upload/info?fileUrl=${encodeURIComponent(fileUrl)}`);
    }

    async getUploadLimits() {
        return this.get('/upload/limits');
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    getToken() {
        return this.token;
    }

    // Handle page redirects based on user role
    redirectToDashboard(user) {
        const redirects = {
            'personal': '/skillport-personal/student-dashboard.html',
            'community-admin': '/community-ui/pages/admin/admin-dashboard.html',
            'mentor': '/community-ui/pages/mentor/mentor-dashboard.html',
            'student': '/community-ui/pages/user/user-dashboard.html'
        };
        
        const redirectUrl = redirects[user.role];
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    }

    // Error handling helper
    handleError(error, showAlert = true) {
        console.error('SkillPort API Error:', error);
        
        if (showAlert) {
            alert(error.message || 'An error occurred. Please try again.');
        }
        
        return error;
    }
}

// Create global instance
window.skillPort = new SkillPortAPI();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillPortAPI;
}
