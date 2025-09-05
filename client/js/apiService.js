/**
 * Enhanced API Service
 * Comprehensive API communication layer with error handling, authentication, and role management
 */

class APIService {
    constructor() {
        this.baseURL = 'http://localhost:5001/api/v1';
        this.timeout = 10000; // 10 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    // Get authentication headers
    getAuthHeaders() {
        const token = localStorage.getItem('jwt_token');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    // Make HTTP request with retry logic
    async makeRequest(url, options = {}) {
        const config = {
            method: 'GET',
            headers: this.getAuthHeaders(),
            timeout: this.timeout,
            ...options
        };

        // Add body for POST/PUT requests
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🌐 API Request (attempt ${attempt}): ${config.method} ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                console.log(`🌐 API Response: ${response.status} ${response.statusText}`);
                
                // Handle different response types
                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }
                
                // Handle HTTP errors
                if (!response.ok) {
                    throw new APIError(
                        data.error || `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        data
                    );
                }
                
                return data;
                
            } catch (error) {
                lastError = error;
                console.error(`🌐 API Request failed (attempt ${attempt}):`, error);
                
                // Don't retry on authentication errors or client errors
                if (error instanceof APIError && (error.status === 401 || error.status === 403 || error.status < 500)) {
                    throw error;
                }
                
                // Wait before retry (except on last attempt)
                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        throw lastError;
    }

    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // GET request
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        return this.makeRequest(url.toString());
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.makeRequest(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            body: data
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.makeRequest(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            body: data
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.makeRequest(`${this.baseURL}${endpoint}`, {
            method: 'DELETE'
        });
    }

    // Authentication endpoints
    async login(email, password) {
        return this.post('/auth/login', { email, password });
    }

    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async getUserProfile() {
        return this.get('/users/profile');
    }

    // Community endpoints
    async getCommunitySummary(communityId) {
        return this.get(`/community/${communityId}/summary`);
    }

    async getCommunityInsights(communityId) {
        return this.get(`/community/${communityId}/insights`);
    }

    async getRecentActivity(communityId) {
        return this.get(`/community/${communityId}/recent-activity`);
    }

    async getRecentUsers(communityId, limit = 10) {
        return this.get(`/community/${communityId}/users`, { limit, sort: '-createdAt' });
    }

    async getRecentMentors(communityId, limit = 10) {
        return this.get(`/community/${communityId}/mentors`, { limit, sort: '-createdAt' });
    }

    // User management endpoints
    async getUsers(params = {}) {
        return this.get('/users', params);
    }

    async getUserById(userId) {
        return this.get(`/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.put(`/users/${userId}`, userData);
    }

    async deleteUser(userId) {
        return this.delete(`/users/${userId}`);
    }

    // Contest endpoints
    async getContests(params = {}) {
        return this.get('/contests', params);
    }

    async getContestById(contestId) {
        return this.get(`/contests/${contestId}`);
    }

    async createContest(contestData) {
        return this.post('/contests', contestData);
    }

    async updateContest(contestId, contestData) {
        return this.put(`/contests/${contestId}`, contestData);
    }

    async deleteContest(contestId) {
        return this.delete(`/contests/${contestId}`);
    }

    // Analytics endpoints
    async getAnalytics(params = {}) {
        return this.get('/analytics/dashboard', params);
    }

    async getCommunityAnalytics(communityId) {
        return this.get(`/analytics/community/${communityId}`);
    }

    // Admin endpoints
    async getAdminUsers(params = {}) {
        return this.get('/admin/users', params);
    }

    async getAdminAnalytics() {
        return this.get('/admin/analytics');
    }

    // Token management
    setToken(token) {
        if (token) {
            localStorage.setItem('jwt_token', token);
            console.log('🔐 API Service: Token stored successfully');
        } else {
            localStorage.removeItem('jwt_token');
            console.log('🔐 API Service: Token removed');
        }
    }

    getToken() {
        return localStorage.getItem('jwt_token');
    }

    clearToken() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        console.log('🔐 API Service: All tokens cleared');
    }

    // Logout user (deactivate database session)
    async logout() {
        try {
            const response = await this.makeRequest('POST', '/auth/logout');
            console.log('🔐 API Service: Logout successful');
            return response;
        } catch (error) {
            console.error('🔐 API Service: Logout failed:', error);
            throw error;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            console.error('🔐 API Service: Error checking token:', error);
            return false;
        }
    }

    // Get user role from token
    getUserRole() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role;
        } catch (error) {
            console.error('🔐 API Service: Error getting user role:', error);
            return null;
        }
    }

    // Get community ID from token
    getCommunityId() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.community;
        } catch (error) {
            console.error('🔐 API Service: Error getting community ID:', error);
            return null;
        }
    }

    // Admin API methods
    async getAllUsers(options = {}) {
        const queryParams = new URLSearchParams(options).toString();
        return this.get(`/users?${queryParams}`);
    }

    async getUserById(userId) {
        return this.get(`/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.put(`/users/${userId}`, userData);
    }

    async deleteUser(userId) {
        return this.delete(`/users/${userId}`);
    }

    async getAllContests(options = {}) {
        const queryParams = new URLSearchParams(options).toString();
        return this.get(`/contests?${queryParams}`);
    }

    async getContestById(contestId) {
        return this.get(`/contests/${contestId}`);
    }

    async createContest(contestData) {
        return this.post('/contests', contestData);
    }

    async updateContest(contestId, contestData) {
        return this.put(`/contests/${contestId}`, contestData);
    }

    async deleteContest(contestId) {
        return this.delete(`/contests/${contestId}`);
    }

    // Mentor API methods
    async getMentorStudents() {
        return this.get('/mentor/students');
    }

    async getMentorContests() {
        return this.get('/mentor/contests');
    }

    async getMentorAnalytics() {
        return this.get('/mentor/analytics');
    }

    async getMentorActivity() {
        return this.get('/mentor/activity');
    }

    // User API methods
    async getUserContests(options = {}) {
        const queryParams = new URLSearchParams(options).toString();
        return this.get(`/user/contests?${queryParams}`);
    }

    async registerForContest(contestId) {
        return this.post(`/contests/${contestId}/register`);
    }

    async getContestResults(contestId) {
        return this.get(`/contests/${contestId}/results`);
    }

    // Analytics endpoints
    async getAnalytics(params = {}) {
        return this.get('/admin/analytics', params);
    }

    async exportAnalytics(params = {}) {
        return this.get('/admin/analytics/export', params);
    }

    // Leaderboard endpoints
    async getLeaderboard(params = {}) {
        return this.get('/leaderboard', params);
    }

    async exportLeaderboard(params = {}) {
        return this.get('/leaderboard/export', params);
    }

    // Mentor-specific endpoints
    async getMentorContests(params = {}) {
        return this.get('/mentor/contests', params);
    }

    async getMentorProfile() {
        return this.get('/mentor/profile');
    }

    async updateMentorProfile(data) {
        return this.put('/mentor/profile', data);
    }

    async duplicateContest(contestId) {
        return this.post(`/contests/${contestId}/duplicate`);
    }

    // Personal user endpoints
    async getUserProfilePersonal() {
        return this.get('/personal/profile');
    }

    async updateUserProfilePersonal(data) {
        return this.put('/personal/profile', data);
    }

    async getUserProgress() {
        return this.get('/personal/progress');
    }

    async getUserProjects() {
        return this.get('/personal/projects');
    }

    async createUserProject(data) {
        return this.post('/personal/projects', data);
    }

    async updateUserProject(projectId, data) {
        return this.put(`/personal/projects/${projectId}`, data);
    }

    async deleteUserProject(projectId) {
        return this.delete(`/personal/projects/${projectId}`);
    }

    async getUserStats() {
        return this.get('/personal/stats');
    }

    async getUserCommunities() {
        return this.get('/personal/communities');
    }

    async getUserLeaderboard(params = {}) {
        return this.get('/user/leaderboard', params);
    }

    async exportUserData() {
        return this.get('/user/export');
    }

    async deleteAccount(data) {
        return this.delete('/user/account', data);
    }

    // Community endpoints
    async getCommunityData(params = {}) {
        return this.get('/community/data', params);
    }

    async joinCommunity() {
        return this.post('/community/join');
    }

    async leaveCommunity() {
        return this.delete('/community/leave');
    }

    async joinEvent(eventId) {
        return this.post(`/events/${eventId}/join`);
    }

    // Common endpoints
    async changePassword(data) {
        return this.put('/auth/change-password', data);
    }

    async uploadAvatar(formData) {
        return this.post('/upload/avatar', formData, true);
    }

    // Personal Dashboard API Methods
    async getUserProjects() {
        return this.get('/users/projects');
    }

    async createProject(projectData) {
        return this.post('/users/projects', projectData);
    }

    async deleteProject(projectId) {
        return this.delete(`/users/projects/${projectId}`);
    }

    async getUserSubmissions() {
        return this.get('/users/submissions');
    }

    async getUserCommunities() {
        return this.get('/users/communities');
    }

    async updateUserPreferences(preferences) {
        return this.put('/users/preferences', preferences);
    }
}

// Custom API Error class
class APIError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// Initialize API Service
window.APIService = new APIService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIService, APIError };
}