/**
 * SkillPort API Integration Layer
 * Handles all communication with the backend API
 */

class SkillPortAPI {
  constructor() {
    this.baseURL = window.SKILLPORT_CONFIG?.API_BASE_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('skillport_token');
    this.user = JSON.parse(localStorage.getItem('skillport_user') || 'null');
    
    // Setup interceptors
    this.setupInterceptors();
  }

  // Setup request/response interceptors
  setupInterceptors() {
    // Add auth token to all requests
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
        window.location.href = '../community-ui/index.html';
      }
      return response;
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      // Add auth header
      config = this.addAuthHeader(config);

      const response = await fetch(url, config);
      
      // Handle token expiration
      response = this.handleTokenExpiration(response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication Methods
  async login(identifier, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      if (response.success) {
        this.token = response.token;
        this.user = response.user;
        localStorage.setItem('skillport_token', this.token);
        localStorage.setItem('skillport_user', JSON.stringify(this.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.success) {
        this.token = response.token;
        this.user = response.user;
        localStorage.setItem('skillport_token', this.token);
        localStorage.setItem('skillport_user', JSON.stringify(this.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      if (this.token) {
        await this.request('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem('skillport_token');
      localStorage.removeItem('skillport_user');
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.request('/auth/me');
      if (response.success) {
        this.user = response.user;
        localStorage.setItem('skillport_user', JSON.stringify(this.user));
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await this.request('/auth/refresh', { method: 'POST' });
      if (response.success) {
        this.token = response.token;
        localStorage.setItem('skillport_token', this.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // User Management Methods
  async getUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/admin/users${queryParams ? `?${queryParams}` : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      throw error;
    }
  }

  async createUser(userData) {
    try {
      return await this.request('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      return await this.request(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      return await this.request(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw error;
    }
  }

  async activateUser(userId) {
    try {
      return await this.request(`/admin/users/${userId}/activate`, {
        method: 'POST'
      });
    } catch (error) {
      throw error;
    }
  }

  async suspendUser(userId) {
    try {
      return await this.request(`/admin/users/${userId}/suspend`, {
        method: 'POST'
      });
    } catch (error) {
      throw error;
    }
  }

  // Contest Methods
  async getContests(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/contests${queryParams ? `?${queryParams}` : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      throw error;
    }
  }

  async getContest(contestId) {
    try {
      return await this.request(`/contests/${contestId}`);
    } catch (error) {
      throw error;
    }
  }

  async createContest(contestData) {
    try {
      return await this.request('/contests', {
        method: 'POST',
        body: JSON.stringify(contestData)
      });
    } catch (error) {
      throw error;
    }
  }

  async updateContest(contestId, contestData) {
    try {
      return await this.request(`/contests/${contestId}`, {
        method: 'PUT',
        body: JSON.stringify(contestData)
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteContest(contestId) {
    try {
      return await this.request(`/contests/${contestId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw error;
    }
  }

  async joinContest(contestId) {
    try {
      return await this.request(`/contests/${contestId}/join`, {
        method: 'POST'
      });
    } catch (error) {
      throw error;
    }
  }

  async leaveContest(contestId) {
    try {
      return await this.request(`/contests/${contestId}/leave`, {
        method: 'POST'
      });
    } catch (error) {
      throw error;
    }
  }

  // Contest Participation Methods
  async getContestDetails(contestId) {
    try {
      return await this.request(`/contests/${contestId}`);
    } catch (error) {
      throw error;
    }
  }

  async getContestProblems(contestId) {
    try {
      return await this.request(`/contests/${contestId}/problems`);
    } catch (error) {
      throw error;
    }
  }

  async getUserContestProgress(contestId) {
    try {
      return await this.request(`/contests/${contestId}/progress`);
    } catch (error) {
      throw error;
    }
  }

  async submitContestSolution(contestId, problemId, solution) {
    try {
      return await this.request(`/contests/${contestId}/problems/${problemId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ solution })
      });
    } catch (error) {
      throw error;
    }
  }

  // Submission Methods
  async getSubmissions(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/submissions${queryParams ? `?${queryParams}` : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      throw error;
    }
  }

  async getSubmission(submissionId) {
    try {
      return await this.request(`/submissions/${submissionId}`);
    } catch (error) {
      throw error;
    }
  }

  async createSubmission(submissionData) {
    try {
      return await this.request('/submissions', {
        method: 'POST',
        body: JSON.stringify(submissionData)
      });
    } catch (error) {
      throw error;
    }
  }

  async updateSubmission(submissionId, submissionData) {
    try {
      return await this.request(`/submissions/${submissionId}`, {
        method: 'PUT',
        body: JSON.stringify(submissionData)
      });
    } catch (error) {
      throw error;
    }
  }

  async getFlaggedSubmissions(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/submissions/flagged${queryParams ? `?${queryParams}` : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      throw error;
    }
  }

  async flagSubmission(submissionId, flagData) {
    try {
      return await this.request(`/submissions/${submissionId}/flag`, {
        method: 'POST',
        body: JSON.stringify(flagData)
      });
    } catch (error) {
      throw error;
    }
  }

  async resolveFlag(submissionId, resolutionData) {
    try {
      return await this.request(`/submissions/${submissionId}/resolve-flag`, {
        method: 'POST',
        body: JSON.stringify(resolutionData)
      });
    } catch (error) {
      throw error;
    }
  }

  // Community Methods
  async getCommunities(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/communities${queryParams ? `?${queryParams}` : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      throw error;
    }
  }

  async getCommunity(communityId) {
    try {
      return await this.request(`/communities/${communityId}`);
    } catch (error) {
      throw error;
    }
  }

  async createCommunity(communityData) {
    try {
      return await this.request('/communities', {
        method: 'POST',
        body: JSON.stringify(communityData)
      });
    } catch (error) {
      throw error;
    }
  }

  async updateCommunity(communityId, communityData) {
    try {
      return await this.request(`/communities/${communityId}`, {
        method: 'PUT',
        body: JSON.stringify(communityData)
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteCommunity(communityId) {
    try {
      return await this.request(`/communities/${communityId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw error;
    }
  }

  async joinCommunity(communityId) {
    try {
      return await this.request(`/communities/${communityId}/join`, {
        method: 'POST'
      });
    } catch (error) {
      throw error;
    }
  }

  async leaveCommunity(communityId) {
    try {
      return await this.request(`/communities/${communityId}/leave`, {
        method: 'POST'
      });
    } catch (error) {
      throw error;
    }
  }

  // Analytics Methods
  async getDashboardStats() {
    try {
      return await this.request('/analytics/dashboard');
    } catch (error) {
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      return await this.request(`/analytics/users/${userId}/stats`);
    } catch (error) {
      throw error;
    }
  }

  async getContestStats(contestId) {
    try {
      return await this.request(`/analytics/contests/${contestId}/stats`);
    } catch (error) {
      throw error;
    }
  }

  async getLeaderboard(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/analytics/leaderboard${queryParams ? `?${queryParams}` : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Enhanced Analytics Methods
  async getAnalytics() {
    try {
      return await this.request('/analytics/overview');
    } catch (error) {
      throw error;
    }
  }

  async getUserGrowthData(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/analytics/user-growth${queryParams ? `?${queryParams}` : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      throw error;
    }
  }

  async getContestPerformanceData(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `/analytics/contest-performance${queryParams ? `?${queryParams}` : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      throw error;
    }
  }

  async getTopUsers(limit = 10) {
    try {
      return await this.request(`/analytics/top-users?limit=${limit}`);
    } catch (error) {
      throw error;
    }
  }

  async getRecentActivity(limit = 10) {
    try {
      return await this.request(`/analytics/recent-activity?limit=${limit}`);
    } catch (error) {
      throw error;
    }
  }

  async downloadReport(reportData) {
    try {
      return await this.request('/analytics/reports/download', {
        method: 'POST',
        body: JSON.stringify(reportData)
      });
    } catch (error) {
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      return await this.request('/analytics/system-health');
    } catch (error) {
      throw error;
    }
  }

  // Utility Methods
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  hasRole(role) {
    return this.user && this.user.role === role;
  }

  hasAnyRole(roles) {
    return this.user && roles.includes(this.user.role);
  }

  isAdmin() {
    return this.hasRole('admin');
  }

  isMentor() {
    return this.hasRole('mentor');
  }

  isStudent() {
    return this.hasRole('student');
  }

  // Error handling
  handleError(error, showNotification = true) {
    console.error('API Error:', error);
    
    if (showNotification) {
      const message = error.message || 'An unexpected error occurred';
      this.showNotification(message, 'error');
    }
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    };
  }

  // Notification system
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Set notification styles based on type
    switch (type) {
      case 'success':
        notification.className += ' bg-green-500 text-white';
        break;
      case 'error':
        notification.className += ' bg-red-500 text-white';
        break;
      case 'warning':
        notification.className += ' bg-yellow-500 text-black';
        break;
      default:
        notification.className += ' bg-blue-500 text-white';
    }
    
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  // File upload helper
  async uploadFile(file, endpoint = '/upload') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create global API instance
window.SkillPortAPI = new SkillPortAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillPortAPI;
}
