/**
 * SkillPort Data Manager
 * Replaces static data with real API calls to the backend
 */

class DataManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    init() {
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        // Check if user is authenticated
        if (window.authManager?.isAuthenticated) {
            this.loadInitialData();
        } else {
            // Listen for authentication events
            window.addEventListener('auth:authenticated', () => {
                this.loadInitialData();
            });
        }
    }

    async loadInitialData() {
        try {
            // Load user-specific data based on role
            const userRole = window.authManager.getUserRole();
            
            switch (userRole) {
                case 'community-admin':
                    await this.loadAdminData();
                    break;
                case 'mentor':
                    await this.loadMentorData();
                    break;
                case 'student':
                    await this.loadStudentData();
                    break;
                case 'personal':
                    await this.loadPersonalData();
                    break;
            }
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    // ===== CACHE MANAGEMENT =====

    setCache(key, data, timeout = this.cacheTimeout) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            timeout
        });
    }

    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > cached.timeout) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    // ===== ADMIN DATA MANAGEMENT =====

    async loadAdminData() {
        try {
            const loadingNotification = window.notifications?.showLoading(
                'Loading Admin Dashboard...',
                'Fetching community and contest data.'
            );

            // Load community data
            const communityData = await this.getCommunityData();
            
            // Load contest data
            const contestData = await this.getContestData();
            
            // Load user analytics
            const analyticsData = await this.getCommunityAnalytics();

            window.notifications?.hideLoading(loadingNotification);

            // Update UI with real data
            this.updateAdminDashboard(communityData, contestData, analyticsData);

        } catch (error) {
            console.error('Failed to load admin data:', error);
            window.notifications?.error('Data Load Error', 'Failed to load admin dashboard data');
        }
    }

    async getCommunityData() {
        const cacheKey = 'community_data';
        let data = this.getCache(cacheKey);

        if (!data) {
            try {
                const response = await window.APIService.getCommunities();
                if (response.success) {
                    data = response.data;
                    this.setCache(cacheKey, data);
                }
            } catch (error) {
                console.error('Failed to fetch community data:', error);
                throw error;
            }
        }

        return data;
    }

    async getContestData() {
        const cacheKey = 'contest_data';
        let data = this.getCache(cacheKey);

        if (!data) {
            try {
                const response = await window.APIService.getContests();
                if (response.success) {
                    data = response.data;
                    this.setCache(cacheKey, data);
                }
            } catch (error) {
                console.error('Failed to fetch contest data:', error);
                throw error;
            }
        }

        return data;
    }

    async getCommunityAnalytics() {
        const communityId = window.authManager.getUserCommunity();
        if (!communityId) return null;

        const cacheKey = `analytics_${communityId}`;
        let data = this.getCache(cacheKey);

        if (!data) {
            try {
                const response = await window.APIService.getCommunityAnalytics(communityId);
                if (response.success) {
                    data = response.data;
                    this.setCache(cacheKey, data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics data:', error);
                throw error;
            }
        }

        return data;
    }

    updateAdminDashboard(communityData, contestData, analyticsData) {
        // Update community stats
        this.updateCommunityStats(communityData);
        
        // Update contest list
        this.updateContestList(contestData);
        
        // Update analytics
        this.updateAnalytics(analyticsData);
        
        // Update recent activity
        this.updateRecentActivity(contestData, communityData);
    }

    updateCommunityStats(communityData) {
        const statsElements = document.querySelectorAll('[data-stat]');
        
        statsElements.forEach(element => {
            const statType = element.dataset.stat;
            const community = communityData?.communities?.[0]; // Assuming single community for now
            
            if (community) {
                switch (statType) {
                    case 'total-students':
                        element.textContent = community.stats?.totalStudents || 0;
                        break;
                    case 'total-mentors':
                        element.textContent = community.stats?.totalMentors || 0;
                        break;
                    case 'total-contests':
                        element.textContent = community.stats?.totalContests || 0;
                        break;
                    case 'total-projects':
                        element.textContent = community.stats?.totalProjects || 0;
                        break;
                    case 'average-progress':
                        element.textContent = `${community.stats?.averageProgress || 0}%`;
                        break;
                }
            }
        });
    }

    updateContestList(contestData) {
        const contestContainer = document.querySelector('.contest-list, .contests-grid');
        if (!contestContainer || !contestData?.contests) return;

        const contestHTML = contestData.contests.map(contest => `
            <div class="contest-card" data-contest-id="${contest._id}">
                <div class="contest-header">
                    <h3 class="contest-title">${contest.title}</h3>
                    <span class="contest-status ${contest.status}">${contest.status}</span>
                </div>
                <p class="contest-description">${contest.description}</p>
                <div class="contest-meta">
                    <span class="contest-type">${contest.type}</span>
                    <span class="contest-difficulty">${contest.difficulty}</span>
                    <span class="contest-category">${contest.category}</span>
                </div>
                <div class="contest-timing">
                    <div class="contest-date">
                        <span class="label">Start:</span>
                        <span class="value">${this.formatDate(contest.startTime)}</span>
                    </div>
                    <div class="contest-duration">
                        <span class="label">Duration:</span>
                        <span class="value">${contest.duration} minutes</span>
                    </div>
                </div>
                <div class="contest-actions">
                    <button class="btn btn-primary" onclick="viewContest('${contest._id}')">
                        View Details
                    </button>
                    <button class="btn btn-secondary" onclick="editContest('${contest._id}')">
                        Edit
                    </button>
                </div>
            </div>
        `).join('');

        contestContainer.innerHTML = contestHTML;
    }

    updateAnalytics(analyticsData) {
        if (!analyticsData) return;

        // Update charts and analytics displays
        this.updateProgressChart(analyticsData.progressData);
        this.updateParticipationChart(analyticsData.participationData);
        this.updatePerformanceMetrics(analyticsData.metrics);
    }

    updateRecentActivity(contestData, communityData) {
        const activityContainer = document.querySelector('.recent-activity');
        if (!activityContainer) return;

        // Combine recent activities from contests and community
        const activities = [];
        
        if (contestData?.contests) {
            contestData.contests.forEach(contest => {
                activities.push({
                    type: 'contest',
                    title: contest.title,
                    description: `Contest ${contest.status}`,
                    timestamp: contest.createdAt,
                    icon: '🏆'
                });
            });
        }

        // Sort by timestamp
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const activityHTML = activities.slice(0, 5).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <h4 class="activity-title">${activity.title}</h4>
                    <p class="activity-description">${activity.description}</p>
                    <span class="activity-time">${this.formatRelativeTime(activity.timestamp)}</span>
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activityHTML;
    }

    // ===== MENTOR DATA MANAGEMENT =====

    async loadMentorData() {
        try {
            const loadingNotification = window.notifications?.showLoading(
                'Loading Mentor Dashboard...',
                'Fetching student and contest data.'
            );

            // Load assigned students
            const studentsData = await this.getAssignedStudents();
            
            // Load contests
            const contestData = await this.getContestData();

            window.notifications?.hideLoading(loadingNotification);

            // Update UI with real data
            this.updateMentorDashboard(studentsData, contestData);

        } catch (error) {
            console.error('Failed to load mentor data:', error);
            window.notifications?.error('Data Load Error', 'Failed to load mentor dashboard data');
        }
    }

    async getAssignedStudents() {
        const communityId = window.authManager.getUserCommunity();
        if (!communityId) return [];

        const cacheKey = `mentor_students_${communityId}`;
        let data = this.getCache(cacheKey);

        if (!data) {
            try {
                // This would need a specific endpoint for mentor's assigned students
                const response = await window.APIService.getCommunities({ 
                    id: communityId,
                    includeStudents: true 
                });
                if (response.success) {
                    data = response.data;
                    this.setCache(cacheKey, data);
                }
            } catch (error) {
                console.error('Failed to fetch assigned students:', error);
                throw error;
            }
        }

        return data;
    }

    updateMentorDashboard(studentsData, contestData) {
        // Update student list
        this.updateStudentList(studentsData);
        
        // Update contest data
        this.updateContestList(contestData);
        
        // Update mentor-specific analytics
        this.updateMentorAnalytics(studentsData);
    }

    // ===== STUDENT DATA MANAGEMENT =====

    async loadStudentData() {
        try {
            const loadingNotification = window.notifications?.showLoading(
                'Loading Student Dashboard...',
                'Fetching progress and contest data.'
            );

            // Load user progress
            const progressData = await this.getUserProgress();
            
            // Load available contests
            const contestData = await this.getContestData();
            
            // Load community data
            const communityData = await this.getCommunityData();

            window.notifications?.hideLoading(loadingNotification);

            // Update UI with real data
            this.updateStudentDashboard(progressData, contestData, communityData);

        } catch (error) {
            console.error('Failed to load student data:', error);
            window.notifications?.error('Data Load Error', 'Failed to load student dashboard data');
        }
    }

    async getUserProgress() {
        const userId = window.authManager.getUserId();
        if (!userId) return null;

        const cacheKey = `user_progress_${userId}`;
        let data = this.getCache(cacheKey);

        if (!data) {
            try {
                const response = await window.APIService.getUserProgress(userId);
                if (response.success) {
                    data = response.data;
                    this.setCache(cacheKey, data);
                }
            } catch (error) {
                console.error('Failed to fetch user progress:', error);
                throw error;
            }
        }

        return data;
    }

    updateStudentDashboard(progressData, contestData, communityData) {
        // Update progress tracking
        this.updateProgressTracking(progressData);
        
        // Update available contests
        this.updateAvailableContests(contestData);
        
        // Update community info
        this.updateCommunityInfo(communityData);
        
        // Update achievements
        this.updateAchievements(progressData);
    }

    // ===== PERSONAL USER DATA MANAGEMENT =====

    async loadPersonalData() {
        try {
            const loadingNotification = window.notifications?.showLoading(
                'Loading Personal Dashboard...',
                'Fetching projects and progress data.'
            );

            // Load personal projects
            const projectsData = await this.getPersonalProjects();
            
            // Load personal progress
            const progressData = await this.getUserProgress();

            window.notifications?.hideLoading(loadingNotification);

            // Update UI with real data
            this.updatePersonalDashboard(projectsData, progressData);

        } catch (error) {
            console.error('Failed to load personal data:', error);
            window.notifications?.error('Data Load Error', 'Failed to load personal dashboard data');
        }
    }

    async getPersonalProjects() {
        const userId = window.authManager.getUserId();
        if (!userId) return [];

        const cacheKey = `personal_projects_${userId}`;
        let data = this.getCache(cacheKey);

        if (!data) {
            try {
                const response = await window.APIService.getProjects({ userId });
                if (response.success) {
                    data = response.data;
                    this.setCache(cacheKey, data);
                }
            } catch (error) {
                console.error('Failed to fetch personal projects:', error);
                throw error;
            }
        }

        return data;
    }

    updatePersonalDashboard(projectsData, progressData) {
        // Update project list
        this.updateProjectList(projectsData);
        
        // Update progress tracking
        this.updateProgressTracking(progressData);
        
        // Update personal stats
        this.updatePersonalStats(progressData);
    }

    // ===== UTILITY METHODS =====

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatRelativeTime(dateString) {
        if (!dateString) return 'N/A';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }

    // ===== CHART UPDATES =====

    updateProgressChart(progressData) {
        // Implementation would depend on the charting library being used
        // This is a placeholder for chart updates
        console.log('Updating progress chart with:', progressData);
    }

    updateParticipationChart(participationData) {
        // Implementation would depend on the charting library being used
        console.log('Updating participation chart with:', participationData);
    }

    updatePerformanceMetrics(metrics) {
        // Update performance metric displays
        const metricElements = document.querySelectorAll('[data-metric]');
        
        metricElements.forEach(element => {
            const metricType = element.dataset.metric;
            const value = metrics?.[metricType];
            
            if (value !== undefined) {
                element.textContent = typeof value === 'number' ? value.toFixed(1) : value;
            }
        });
    }

    // ===== PUBLIC METHODS FOR PAGE INTEGRATION =====

    // These methods can be called from HTML pages to update specific sections

    async updateAdminContestData() {
        try {
            const contestData = await this.getContestData();
            this.updateContestList(contestData);
        } catch (error) {
            console.error('Failed to update admin contest data:', error);
        }
    }

    async updateMentorContestData() {
        try {
            const contestData = await this.getContestData();
            this.updateContestList(contestData);
        } catch (error) {
            console.error('Failed to update mentor contest data:', error);
        }
    }

    async updateUserContestData() {
        try {
            const contestData = await this.getContestData();
            this.updateAvailableContests(contestData);
        } catch (error) {
            console.error('Failed to update user contest data:', error);
        }
    }

    async updateStudentProgress() {
        try {
            const progressData = await this.getUserProgress();
            this.updateProgressTracking(progressData);
        } catch (error) {
            console.error('Failed to update student progress:', error);
        }
    }

    async updateStatsData() {
        try {
            const analyticsData = await this.getCommunityAnalytics();
            this.updateAnalytics(analyticsData);
        } catch (error) {
            console.error('Failed to update stats data:', error);
        }
    }

    async updateProjectData() {
        try {
            const projectsData = await this.getPersonalProjects();
            this.updateProjectList(projectsData);
        } catch (error) {
            console.error('Failed to update project data:', error);
        }
    }

    // ===== PUBLIC STATS METHODS =====

    getAdminStats() {
        // Return default stats for landing page
        return {
            totalUsers: 10500,
            problemsSolved: 125000,
            successRate: 95
        };
    }

    handleContactSubmit(contactData) {
        // Handle contact form submission
        try {
            // In a real app, this would send to backend
            console.log('Contact form data:', contactData);
            
            return {
                success: true,
                message: 'Thank you for your message! We\'ll get back to you soon.'
            };
        } catch (error) {
            console.error('Contact form error:', error);
            return {
                success: false,
                message: 'Sorry, there was an error sending your message. Please try again.'
            };
        }
    }

    // ===== REFRESH METHODS =====

    async refreshData(type = 'all') {
        try {
            // Clear relevant cache
            if (type === 'all' || type === 'community') {
                this.clearCache('community_data');
            }
            if (type === 'all' || type === 'contest') {
                this.clearCache('contest_data');
            }
            if (type === 'all' || type === 'progress') {
                this.clearCache('user_progress_' + window.authManager.getUserId());
            }

            // Reload data based on user role
            const userRole = window.authManager.getUserRole();
            
            switch (userRole) {
                case 'community-admin':
                    await this.loadAdminData();
                    break;
                case 'mentor':
                    await this.loadMentorData();
                    break;
                case 'student':
                    await this.loadStudentData();
                    break;
                case 'personal':
                    await this.loadPersonalData();
                    break;
            }

            window.notifications?.success('Data Refreshed', 'Dashboard data has been updated');

        } catch (error) {
            console.error('Failed to refresh data:', error);
            window.notifications?.error('Refresh Failed', 'Failed to refresh dashboard data');
        }
    }
}

// Create global instance
window.DataManager = new DataManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
