/**
 * SkillPort API Service
 * Connects frontend to backend APIs
 */

class APIService {
    constructor() {
        this.baseURL = 'http://localhost:5001/api/v1';
        this.token = localStorage.getItem('jwt_token');
        this.setupInterceptors();
    }

    // Setup request/response interceptors
    setupInterceptors() {
        // Add token to requests if available
        this.addAuthHeader = (config) => {
            if (this.token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        };

        // Handle token expiration
        this.handleTokenExpiration = (response) => {
            if (response.status === 401) {
                this.logout();
                window.location.href = '/pages/auth/login.html';
            }
            return response;
        };
    }

    // Update token
    setToken(token) {
        this.token = token;
        localStorage.setItem('jwt_token', token);
    }

    // Clear token
    clearToken() {
        this.token = null;
        localStorage.removeItem('jwt_token');
    }

    // Logout (removed duplicate - see line 139 for main logout method)

    // Generic request method
    async request(endpoint, options = {}) {
        try {
            const config = this.addAuthHeader({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            this.handleTokenExpiration(response);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // ===== AUTHENTICATION ENDPOINTS =====

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.success) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async verifyOTP(email, otp, password) {
        return await this.request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp, password })
        });
    }

    async resendOTP(email) {
        return await this.request('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async forgotPassword(email) {
        return await this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(resetToken, newPassword) {
        return await this.request(`/auth/reset-password/${resetToken}`, {
            method: 'POST',
            body: JSON.stringify({ password: newPassword })
        });
    }

    async changePassword(currentPassword, newPassword) {
        return await this.request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ 
                currentPassword, 
                newPassword 
            })
        });
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.clearToken();
            window.location.href = '/pages/auth/login.html';
        }
    }

    // ===== USER MANAGEMENT ENDPOINTS =====

    async getUserProfile() {
        return await this.request('/users/profile');
    }

    async updateProfile(profileData) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async getUserDashboard() {
        return await this.request('/users/dashboard');
    }

    async getUserById(userId) {
        return await this.request(`/users/${userId}`);
    }

    async updatePreferences(preferences) {
        return await this.request('/users/preferences', {
            method: 'PUT',
            body: JSON.stringify(preferences)
        });
    }

    async getUserProgress(userId) {
        return await this.request(`/users/${userId}/progress`);
    }

    async getLeaderboard() {
        return await this.request('/users/leaderboard/community');
    }

    // ===== COMMUNITY MANAGEMENT ENDPOINTS =====

    async getCommunities(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/communities?${queryString}` : '/communities';
        return await this.request(endpoint);
    }

    async getCommunityById(communityId) {
        return await this.request(`/communities/${communityId}`);
    }

    async getCommunityDashboard(communityId) {
        return await this.request(`/communities/${communityId}/dashboard`);
    }

    async getCommunityAnalytics(communityId) {
        return await this.request(`/communities/${communityId}/analytics`);
    }

    async joinCommunity(communityId, joinData) {
        return await this.request(`/communities/${communityId}/join`, {
            method: 'POST',
            body: JSON.stringify(joinData)
        });
    }

    async createCommunity(communityData) {
        return await this.request('/communities', {
            method: 'POST',
            body: JSON.stringify(communityData)
        });
    }

    async updateCommunity(communityId, updateData) {
        return await this.request(`/communities/${communityId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async deleteCommunity(communityId) {
        return await this.request(`/communities/${communityId}`, {
            method: 'DELETE'
        });
    }

    // ===== CONTEST MANAGEMENT ENDPOINTS =====

    async getContests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/contests?${queryString}` : '/contests';
        return await this.request(endpoint);
    }

    async getContestById(contestId) {
        return await this.request(`/contests/${contestId}`);
    }

    async createContest(contestData) {
        return await this.request('/contests', {
            method: 'POST',
            body: JSON.stringify(contestData)
        });
    }

    async updateContest(contestId, updateData) {
        return await this.request(`/contests/${contestId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async deleteContest(contestId) {
        return await this.request(`/contests/${contestId}`, {
            method: 'DELETE'
        });
    }

    async registerForContest(contestId) {
        return await this.request(`/contests/${contestId}/register`, {
            method: 'POST'
        });
    }

    async getContestLeaderboard(contestId) {
        return await this.request(`/contests/${contestId}/leaderboard`);
    }

    async getContestSubmissions(contestId) {
        return await this.request(`/contests/${contestId}/submissions`);
    }

    async getUpcomingContests() {
        return await this.request('/contests/upcoming');
    }

    // ===== PROJECT MANAGEMENT ENDPOINTS =====

    async getProjects(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/projects?${queryString}` : '/projects';
        return await this.request(endpoint);
    }

    async getProjectById(projectId) {
        return await this.request(`/projects/${projectId}`);
    }

    async createProject(projectData) {
        return await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }

    async updateProject(projectId, updateData) {
        return await this.request(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    async deleteProject(projectId) {
        return await this.request(`/projects/${projectId}`, {
            method: 'DELETE'
        });
    }

    async getTrendingProjects() {
        return await this.request('/projects/trending');
    }

    async getProjectStats(projectId) {
        return await this.request(`/projects/stats/${projectId}`);
    }

    // ===== PROGRESS & ANALYTICS ENDPOINTS =====

    async getUserProgress(userId) {
        return await this.request(`/progress/user/${userId}`);
    }

    async updateProgress(progressData) {
        return await this.request('/progress', {
            method: 'POST',
            body: JSON.stringify(progressData)
        });
    }

    async getCommunityAnalytics(communityId) {
        return await this.request(`/analytics/community/${communityId}`);
    }

    async getUserAnalytics(userId) {
        return await this.request(`/analytics/user/${userId}`);
    }

    // ===== EXTENSION INTEGRATION ENDPOINTS =====

    async syncExtensionData(extensionData) {
        return await this.request('/extension/sync', {
            method: 'POST',
            headers: {
                'X-Extension-Token': localStorage.getItem('extension_token') || 'default_token'
            },
            body: JSON.stringify(extensionData)
        });
    }

    async getExtensionProgress() {
        return await this.request('/extension/progress');
    }

    async getExtensionSettings() {
        return await this.request('/extension/settings');
    }

    async updateExtensionSettings(settings) {
        return await this.request('/extension/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    // ===== FILE UPLOAD ENDPOINTS =====

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        return await this.request('/upload/avatar', {
            method: 'POST',
            headers: {}, // Let browser set content-type for FormData
            body: formData
        });
    }

    async uploadProjectFiles(projectId, files) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        return await this.request(`/upload/project/${projectId}/files`, {
            method: 'POST',
            headers: {}, // Let browser set content-type for FormData
            body: formData
        });
    }

    // ===== UTILITY METHODS =====

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Get user role from token
    getUserRole() {
        if (!this.token) return null;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            return payload.role;
        } catch (error) {
            return null;
        }
    }

    // Check if user has specific role
    hasRole(role) {
        const userRole = this.getUserRole();
        return userRole === role;
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
    isPersonalUser() {
        return this.hasRole('personal');
    }

    // Get user ID from token
    getUserId() {
        if (!this.token) return null;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            return payload.id;
        } catch (error) {
            return null;
        }
    }

    // Get community ID from token
    getCommunityId() {
        if (!this.token) return null;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            return payload.community;
        } catch (error) {
            return null;
        }
    }

    // Format API error messages
    formatError(error) {
        if (error.message) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        return 'An unexpected error occurred';
    }

    // Handle API errors gracefully
    handleError(error, fallbackMessage = 'Something went wrong') {
        console.error('API Error:', error);
        
        const errorMessage = this.formatError(error);
        
        // Show user-friendly error message
        if (window.showNotification) {
            window.showNotification(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
        
        return {
            success: false,
            error: errorMessage,
            fallback: fallbackMessage
        };
    }
}

// Create global instance
window.APIService = new APIService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}
