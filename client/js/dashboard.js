/**
 * Dynamic Admin Dashboard Controller
 * Fetches real data from backend APIs and renders dynamic content
 */

class DynamicAdminDashboard extends PageController {
    constructor() {
        super();
    }

    // Override the base class initialization
    async initializePage() {
        console.log('📊 Dynamic Dashboard: Initializing page-specific functionality...');
        
        try {
            // Render all dashboard sections
            await this.renderDashboard();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('📊 Dynamic Dashboard: Error initializing page:', error);
            throw error;
        }
    }

    // Render the entire dashboard
    async renderDashboard() {
        console.log('📊 Dynamic Dashboard: Rendering dashboard...');
        
        try {
            // Render statistics cards
            this.renderStatistics();
            
            // Render recent users
            this.renderRecentUsers();
            
            // Render recent mentors
            this.renderRecentMentors();
            
            // Render recent activity
            this.renderRecentActivity();
            
            // Render community insights
            this.renderCommunityInsights();
            
            // Render additional sections
            this.renderAdditionalSections();
            
        } catch (error) {
            console.error('📊 Dynamic Dashboard: Error rendering dashboard:', error);
            throw error;
        }
    }

    // Render statistics cards
    renderStatistics() {
        const summaryData = this.data.summary?.data;
        if (!summaryData) {
            console.log('📊 Dynamic Dashboard: No summary data available');
            return;
        }

        const stats = [
            {
                label: 'Total Users',
                value: summaryData.userStats?.total || 0,
                growth: summaryData.userStats?.growth || 0,
                growthLabel: 'this week',
                icon: 'users',
                color: 'blue'
            },
            {
                label: 'Active Mentors',
                value: summaryData.roleStats?.mentors || 0,
                growth: summaryData.roleStats?.mentorGrowth || 0,
                growthLabel: 'this month',
                icon: 'graduation-cap',
                color: 'amber'
            },
            {
                label: 'Active Contests',
                value: summaryData.contestStats?.active || 0,
                growth: summaryData.contestStats?.growth || 0,
                growthLabel: 'this month',
                icon: 'trophy',
                color: 'purple'
            },
            {
                label: 'Problems Solved',
                value: summaryData.submissionStats?.totalSolved || 0,
                growth: summaryData.submissionStats?.growth || 0,
                growthLabel: 'this week',
                icon: 'target',
                color: 'green'
            }
        ];

        // Update individual stat elements
        window.uiHelpers.updateText('total-users', stats[0].value);
        window.uiHelpers.updateText('active-mentors', stats[1].value);
        window.uiHelpers.updateText('active-contests', stats[2].value);
        window.uiHelpers.updateText('problems-solved', stats[3].value);

        // Update growth indicators
        this.updateGrowthIndicator('users-growth', stats[0].growth, stats[0].growthLabel);
        this.updateGrowthIndicator('mentors-growth', stats[1].growth, stats[1].growthLabel);
        this.updateGrowthIndicator('contests-growth', stats[2].growth, stats[2].growthLabel);
        this.updateGrowthIndicator('problems-growth', stats[3].growth, stats[3].growthLabel);
    }

    // Update growth indicator
    updateGrowthIndicator(elementId, growth, label) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.textContent = `${growth >= 0 ? '+' : ''}${growth} ${label}`;
        element.className = `text-xs ${growth >= 0 ? 'text-green-600' : 'text-red-600'} mt-1`;
    }

    // Render recent users
    renderRecentUsers() {
        const usersData = this.data.users?.data?.users;
        if (!usersData) {
            window.uiHelpers.showEmpty('recent-users', 'No recent users');
            return;
        }

        window.uiHelpers.renderUserList('recent-users', usersData);
    }

    // Render recent mentors
    renderRecentMentors() {
        const mentorsData = this.data.mentors?.data?.mentors;
        if (!mentorsData) {
            window.uiHelpers.showEmpty('recent-mentors', 'No recent mentors');
            return;
        }

        window.uiHelpers.renderMentorList('recent-mentors', mentorsData);
    }

    // Render recent activity
    renderRecentActivity() {
        const activityData = this.data.activity?.data?.activities;
        if (!activityData) {
            window.uiHelpers.showEmpty('recent-activity', 'No recent activity');
            return;
        }

        window.uiHelpers.renderActivityFeed('recent-activity', activityData);
    }

    // Render community insights
    renderCommunityInsights() {
        const insightsData = this.data.insights?.data;
        if (!insightsData) {
            console.log('📊 Dynamic Dashboard: No insights data available');
            return;
        }

        // Update insight values
        window.uiHelpers.updateText('active-users-today', insightsData.activeUsersToday || 0);
        window.uiHelpers.updateText('new-registrations', insightsData.newRegistrations || 0);
        window.uiHelpers.updateText('community-posts', insightsData.communityPosts || 0);
        window.uiHelpers.updateText('contest-submissions', insightsData.contestSubmissions || 0);
    }

    // Render additional sections
    renderAdditionalSections() {
        // Render alerts and notifications
        this.renderAlertsAndNotifications();
        
        // Render contest management
        this.renderContestManagement();
        
        // Render performance metrics
        this.renderPerformanceMetrics();
        
        // Render community health
        this.renderCommunityHealth();
    }

    // Render alerts and notifications
    renderAlertsAndNotifications() {
        // This would render real alert data from the backend
        console.log('📊 Dynamic Dashboard: Rendering alerts and notifications...');
        // Implementation would go here
    }

    // Render contest management
    renderContestManagement() {
        // This would render real contest data from the backend
        console.log('📊 Dynamic Dashboard: Rendering contest management...');
        // Implementation would go here
    }

    // Render performance metrics
    renderPerformanceMetrics() {
        // This would render real performance data from the backend
        console.log('📊 Dynamic Dashboard: Rendering performance metrics...');
        // Implementation would go here
    }

    // Render community health
    renderCommunityHealth() {
        // This would render real community health data from the backend
        console.log('📊 Dynamic Dashboard: Rendering community health...');
        // Implementation would go here
    }

    // Setup real-time updates
    setupRealTimeUpdates() {
        console.log('📊 Dynamic Dashboard: Setting up real-time updates...');
        
        // Refresh dashboard data every 30 seconds
        setInterval(() => {
            console.log('📊 Dynamic Dashboard: Refreshing data...');
            this.refresh();
        }, 30000);
    }

    // Setup event listeners
    setupEventListeners() {
        console.log('📊 Dynamic Dashboard: Setting up event listeners...');
        
        // Add refresh button functionality
        const refreshButton = document.getElementById('refresh-dashboard');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refresh();
            });
        }

        // Add logout button functionality
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                window.authManager.logout();
            });
        }
    }
}

// Initialize dynamic dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Initializing Dynamic Admin Dashboard...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            window.dynamicDashboard = new DynamicAdminDashboard();
        } catch (error) {
            console.error('📊 Failed to initialize Dynamic Dashboard:', error);
        }
    }, 1000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicAdminDashboard;
}