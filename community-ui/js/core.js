// Core JavaScript utilities for SkillPort Community UI
class SkillPortCore {
    constructor() {
        this.apiBase = 'http://localhost:5001/api';
        this.token = localStorage.getItem('skillport_token');
        this.user = JSON.parse(localStorage.getItem('skillport_user') || 'null');
        this.isAuthenticated = !!this.token;
        
        this.initializeEventListeners();
        this.checkAuthenticationStatus();
    }

    // Initialize global event listeners
    initializeEventListeners() {
        // Logout button
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="logout"]')) {
                this.logout();
            }
        });

        // Mobile menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="toggle-menu"]')) {
                this.toggleMobileMenu();
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-menu') && !e.target.matches('[data-action="toggle-menu"]')) {
                this.closeMobileMenu();
            }
        });

        // Auto-hide alerts after 5 seconds
        document.addEventListener('DOMContentLoaded', () => {
            this.autoHideAlerts();
        });
    }

    // Check authentication status and update UI
    checkAuthenticationStatus() {
        if (this.isAuthenticated) {
            this.showAuthenticatedUI();
        } else {
            this.showUnauthenticatedUI();
        }
    }

    // Show authenticated user UI
    showAuthenticatedUI() {
        const authElements = document.querySelectorAll('[data-auth="required"]');
        const unauthElements = document.querySelectorAll('[data-auth="unauthorized"]');
        
        authElements.forEach(el => el.style.display = 'block');
        unauthElements.forEach(el => el.style.display = 'none');

        // Update user info in navigation
        if (this.user) {
            const userElements = document.querySelectorAll('[data-user="name"]');
            const userAvatarElements = document.querySelectorAll('[data-user="avatar"]');
            
            userElements.forEach(el => {
                el.textContent = `${this.user.firstName} ${this.user.lastName}`;
            });

            if (this.user.profilePicture) {
                userAvatarElements.forEach(el => {
                    el.src = this.user.profilePicture;
                    el.alt = `${this.user.firstName} ${this.user.lastName}`;
                });
            }
        }
    }

    // Show unauthenticated user UI
    showUnauthenticatedUI() {
        const authElements = document.querySelectorAll('[data-auth="required"]');
        const unauthElements = document.querySelectorAll('[data-auth="unauthorized"]');
        
        authElements.forEach(el => el.style.display = 'none');
        unauthElements.forEach(el => el.style.display = 'block');
    }

    // API request helper
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        };

        const requestOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        try {
            const response = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.success) {
                this.token = response.data.token;
                this.user = response.data.user;
                this.isAuthenticated = true;
                
                localStorage.setItem('skillport_token', this.token);
                localStorage.setItem('skillport_user', JSON.stringify(this.user));
                
                this.showAuthenticatedUI();
                
                return response;
            }
        } catch (error) {
            this.showAlert(error.message || 'Login failed', 'error');
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await this.apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (response.success) {
                this.token = response.data.token;
                this.user = response.data.user;
                this.isAuthenticated = true;
                
                localStorage.setItem('skillport_token', this.token);
                localStorage.setItem('skillport_user', JSON.stringify(this.user));
                
                this.showAuthenticatedUI();
                this.showAlert('Registration successful! Please verify your email.', 'success');
                
                return response.data;
            }
        } catch (error) {
            this.showAlert(error.message || 'Registration failed', 'error');
            throw error;
        }
    }

    async logout() {
        try {
            await this.apiRequest('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.token = null;
            this.user = null;
            this.isAuthenticated = false;
            
            localStorage.removeItem('skillport_token');
            localStorage.removeItem('skillport_user');
            
            this.showUnauthenticatedUI();
            this.showAlert('Logged out successfully', 'success');
            
            // Redirect to home page
            window.location.href = '/';
        }
    }

    async sendOTP(email, type = 'verification') {
        try {
            const response = await this.apiRequest('/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ email, type })
            });

            if (response.success) {
                this.showAlert(`OTP sent to ${email}`, 'success');
                return response.data;
            }
        } catch (error) {
            this.showAlert(error.message || 'Failed to send OTP', 'error');
            throw error;
        }
    }

    async verifyOTP(email, otp, type = 'verification') {
        try {
            const response = await this.apiRequest('/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ email, otp, type })
            });

            if (response.success) {
                if (type === 'verification' && response.data.token) {
                    this.token = response.data.token;
                    this.user = response.data.user;
                    this.isAuthenticated = true;
                    
                    localStorage.setItem('skillport_token', this.token);
                    localStorage.setItem('skillport_user', JSON.stringify(this.user));
                    
                    this.showAuthenticatedUI();
                }
                
                this.showAlert('OTP verified successfully!', 'success');
                return response.data;
            }
        } catch (error) {
            this.showAlert(error.message || 'OTP verification failed', 'error');
            throw error;
        }
    }

    async forgotPassword(email) {
        try {
            const response = await this.apiRequest('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            if (response.success) {
                this.showAlert('Password reset email sent successfully', 'success');
                return response.data;
            }
        } catch (error) {
            this.showAlert(error.message || 'Failed to send password reset email', 'error');
            throw error;
        }
    }

    async resetPassword(token, password) {
        try {
            const response = await this.apiRequest('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, password })
            });

            if (response.success) {
                this.showAlert('Password reset successfully', 'success');
                return response.data;
            }
        } catch (error) {
            this.showAlert(error.message || 'Password reset failed', 'error');
            throw error;
        }
    }

    // User profile methods
    async getProfile() {
        try {
            const response = await this.apiRequest('/users/profile');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await this.apiRequest('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            if (response.success) {
                this.user = { ...this.user, ...response.data };
                localStorage.setItem('skillport_user', JSON.stringify(this.user));
                this.showAlert('Profile updated successfully', 'success');
                return response.data;
            }
        } catch (error) {
            this.showAlert(error.message || 'Profile update failed', 'error');
            throw error;
        }
    }

    // Community methods
    async getCommunities(page = 1, limit = 10, filters = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...filters
            });

            const response = await this.apiRequest(`/communities?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Get communities error:', error);
            throw error;
        }
    }

    async getCommunity(id) {
        try {
            const response = await this.apiRequest(`/communities/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get community error:', error);
            throw error;
        }
    }

    async joinCommunity(id) {
        try {
            const response = await this.apiRequest(`/communities/${id}/join`, {
                method: 'POST'
            });

            if (response.success) {
                this.showAlert('Successfully joined the community!', 'success');
                return response.data;
            }
        } catch (error) {
            this.showAlert(error.message || 'Failed to join community', 'error');
            throw error;
        }
    }

    async leaveCommunity(id) {
        try {
            const response = await this.apiRequest(`/communities/${id}/leave`, {
                method: 'POST'
            });

            if (response.success) {
                this.showAlert('Successfully left the community', 'success');
                return response.data;
            }
        } catch (error) {
            this.showAlert(error.message || 'Failed to leave community', 'error');
            throw error;
        }
    }

    // Contest methods
    async getContests(page = 1, limit = 10, filters = {}) {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...filters
            });

            const response = await this.apiRequest(`/contests?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Get contests error:', error);
            throw error;
        }
    }

    async getContest(id) {
        try {
            const response = await this.apiRequest(`/contests/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get contest error:', error);
            throw error;
        }
    }

    async joinContest(id) {
        try {
            const response = await this.apiRequest(`/contests/${id}/join`, {
                method: 'POST'
            });

            if (response.success) {
                this.showAlert('Successfully joined the contest!', 'success');
                return response.data;
            }
        } catch (error) {
            this.showAlert(error.message || 'Failed to join contest', 'error');
            throw error;
        }
    }

    // Analytics methods
    async getDashboardAnalytics() {
        try {
            const response = await this.apiRequest('/analytics/dashboard');
            return response.data;
        } catch (error) {
            console.error('Get dashboard analytics error:', error);
            throw error;
        }
    }

    async getLeaderboard(sortBy = 'problemsSolved', page = 1, limit = 20) {
        try {
            const queryParams = new URLSearchParams({
                sortBy,
                page: page.toString(),
                limit: limit.toString()
            });

            const response = await this.apiRequest(`/analytics/leaderboard?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Get leaderboard error:', error);
            throw error;
        }
    }

    // UI utility methods
    showAlert(message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('alert-container') || this.createAlertContainer();
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <span class="alert-message">${message}</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        alertContainer.appendChild(alert);

        // Auto-remove after duration
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, duration);

        return alert;
    }

    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alert-container';
        container.className = 'alert-container';
        document.body.appendChild(container);
        return container;
    }

    autoHideAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, 5000);
        });
    }

    // Loading state management
    showLoading(element, text = 'Loading...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.add('loading');
            element.setAttribute('data-loading-text', text);
            element.innerHTML = `<div class="loading-spinner">${text}</div>`;
        }
    }

    hideLoading(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.remove('loading');
            element.innerHTML = element.getAttribute('data-original-content') || '';
        }
    }

    // Mobile menu management
    toggleMobileMenu() {
        const menu = document.querySelector('.mobile-menu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const menu = document.querySelector('.mobile-menu');
        if (menu) {
            menu.classList.remove('active');
        }
    }

    // Form validation
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
        field.classList.add('error');
    }

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.classList.remove('error');
    }

    // Navigation helpers
    navigateTo(page, params = {}) {
        const url = new URL(page, window.location.origin);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        window.location.href = url.toString();
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize core functionality
const skillPort = new SkillPortCore();

// Export for use in other modules
window.skillPort = skillPort;

// Global utility functions
window.showAlert = (message, type, duration) => skillPort.showAlert(message, type, duration);
window.formatDate = (dateString) => skillPort.formatDate(dateString);
window.formatNumber = (num) => skillPort.formatNumber(num);
