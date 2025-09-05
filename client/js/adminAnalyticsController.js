/**
 * Admin Analytics Controller
 * Manages analytics and reporting functionality for admins
 */

class AdminAnalyticsController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('📊 Admin Analytics Controller: Initializing...');
        
        try {
            // Load analytics data
            await this.loadAnalyticsData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('📊 Admin Analytics Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadAnalyticsData() {
        console.log('📊 Admin Analytics Controller: Loading analytics data...');
        
        try {
            this.setLoadingState(true);
            
            // Load comprehensive analytics data
            const analyticsData = await window.dataLoader.loadAnalytics();
            
            this.setData(analyticsData);
            
            // Render analytics
            this.renderAnalytics(analyticsData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    renderAnalytics(data) {
        console.log('📊 Admin Analytics Controller: Rendering analytics...');
        
        // Render user analytics
        this.renderUserAnalytics(data.userAnalytics);
        
        // Render role analytics
        this.renderRoleAnalytics(data.roleAnalytics);
        
        // Render growth metrics
        this.renderGrowthMetrics(data.growthMetrics);
        
        // Render contest analytics
        this.renderContestAnalytics(data.contestAnalytics);
        
        // Render activity analytics
        this.renderActivityAnalytics(data.activityAnalytics);
    }

    renderUserAnalytics(userAnalytics) {
        if (!userAnalytics) return;
        
        // Update user statistics cards
        window.uiHelpers.updateText('total-users', userAnalytics.total || 0);
        window.uiHelpers.updateText('active-users', userAnalytics.active || 0);
        window.uiHelpers.updateText('pending-users', userAnalytics.pending || 0);
        window.uiHelpers.updateText('suspended-users', userAnalytics.suspended || 0);
        window.uiHelpers.updateText('new-this-month', userAnalytics.newThisMonth || 0);
        window.uiHelpers.updateText('active-this-month', userAnalytics.activeThisMonth || 0);
        
        // Update growth percentages
        const totalGrowth = userAnalytics.total > 0 ? ((userAnalytics.newThisMonth / userAnalytics.total) * 100).toFixed(1) : 0;
        window.uiHelpers.updateText('user-growth-percentage', `${totalGrowth}%`);
    }

    renderRoleAnalytics(roleAnalytics) {
        if (!roleAnalytics) return;
        
        // Update role distribution
        window.uiHelpers.updateText('total-admins', roleAnalytics.communityAdmin || 0);
        window.uiHelpers.updateText('total-mentors', roleAnalytics.mentor || 0);
        window.uiHelpers.updateText('total-students', roleAnalytics.student || 0);
        window.uiHelpers.updateText('total-personal', roleAnalytics.personal || 0);
        
        // Render role distribution chart
        this.renderRoleChart(roleAnalytics);
    }

    renderGrowthMetrics(growthMetrics) {
        if (!growthMetrics) return;
        
        // Update growth metrics
        window.uiHelpers.updateText('monthly-growth', growthMetrics.monthlyGrowth || 0);
        window.uiHelpers.updateText('active-user-rate', `${growthMetrics.activeUserRate || 0}%`);
        window.uiHelpers.updateText('retention-rate', `${growthMetrics.retentionRate || 0}%`);
        window.uiHelpers.updateText('engagement-score', growthMetrics.engagementScore || 0);
    }

    renderContestAnalytics(contestAnalytics) {
        if (!contestAnalytics) return;
        
        // Update contest statistics
        window.uiHelpers.updateText('total-contests', contestAnalytics.total || 0);
        window.uiHelpers.updateText('active-contests', contestAnalytics.active || 0);
        window.uiHelpers.updateText('completed-contests', contestAnalytics.completed || 0);
        window.uiHelpers.updateText('total-participants', contestAnalytics.totalParticipants || 0);
        window.uiHelpers.updateText('avg-participation', contestAnalytics.avgParticipation || 0);
        
        // Render contest performance chart
        this.renderContestChart(contestAnalytics);
    }

    renderActivityAnalytics(activityAnalytics) {
        if (!activityAnalytics) return;
        
        // Update activity metrics
        window.uiHelpers.updateText('daily-active-users', activityAnalytics.dailyActive || 0);
        window.uiHelpers.updateText('weekly-active-users', activityAnalytics.weeklyActive || 0);
        window.uiHelpers.updateText('monthly-active-users', activityAnalytics.monthlyActive || 0);
        window.uiHelpers.updateText('avg-session-duration', activityAnalytics.avgSessionDuration || 0);
        
        // Render activity timeline
        this.renderActivityTimeline(activityAnalytics.timeline);
    }

    renderRoleChart(roleAnalytics) {
        const chartContainer = document.getElementById('role-distribution-chart');
        if (!chartContainer) return;
        
        const data = [
            { label: 'Admins', value: roleAnalytics.communityAdmin || 0, color: '#3B82F6' },
            { label: 'Mentors', value: roleAnalytics.mentor || 0, color: '#10B981' },
            { label: 'Students', value: roleAnalytics.student || 0, color: '#F59E0B' },
            { label: 'Personal', value: roleAnalytics.personal || 0, color: '#8B5CF6' }
        ];
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        const chartHtml = data.map(item => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return `
                <div class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center space-x-3">
                        <div class="w-4 h-4 rounded-full" style="background-color: ${item.color}"></div>
                        <span class="text-sm font-medium text-gray-700">${item.label}</span>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-semibold text-gray-900">${item.value}</div>
                        <div class="text-xs text-gray-500">${percentage}%</div>
                    </div>
                </div>
            `;
        }).join('');
        
        window.uiHelpers.updateHTML('role-distribution-chart', chartHtml);
    }

    renderContestChart(contestAnalytics) {
        const chartContainer = document.getElementById('contest-performance-chart');
        if (!chartContainer) return;
        
        const data = [
            { label: 'Total Contests', value: contestAnalytics.total || 0, color: '#3B82F6' },
            { label: 'Active Contests', value: contestAnalytics.active || 0, color: '#10B981' },
            { label: 'Completed Contests', value: contestAnalytics.completed || 0, color: '#F59E0B' }
        ];
        
        const chartHtml = data.map(item => `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div class="flex items-center space-x-3">
                    <div class="w-4 h-4 rounded-full" style="background-color: ${item.color}"></div>
                    <span class="text-sm font-medium text-gray-700">${item.label}</span>
                </div>
                <div class="text-lg font-semibold text-gray-900">${item.value}</div>
            </div>
        `).join('');
        
        window.uiHelpers.updateHTML('contest-performance-chart', chartHtml);
    }

    renderActivityTimeline(timeline) {
        const timelineContainer = document.getElementById('activity-timeline');
        if (!timelineContainer || !timeline) return;
        
        const timelineHtml = timeline.map(activity => `
            <div class="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i data-lucide="activity" class="w-4 h-4 text-blue-600"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${activity.description}</p>
                    <p class="text-xs text-gray-500">${window.uiHelpers.formatTimeAgo(activity.timestamp)}</p>
                </div>
                <div class="text-sm font-medium text-gray-900">${activity.count}</div>
            </div>
        `).join('');
        
        window.uiHelpers.updateHTML('activity-timeline', timelineHtml);
    }

    setupEventListeners() {
        console.log('📊 Admin Analytics Controller: Setting up event listeners...');
        
        // Refresh button
        const refreshButton = document.getElementById('refresh-analytics');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadAnalyticsData();
            });
        }
        
        // Date range filters
        const dateRangeButtons = document.querySelectorAll('[data-date-range]');
        dateRangeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const range = e.target.dataset.dateRange;
                this.filterByDateRange(range);
            });
        });
        
        // Export buttons
        const exportButton = document.getElementById('export-analytics');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportAnalytics();
            });
        }
    }

    async filterByDateRange(range) {
        console.log('📊 Admin Analytics Controller: Filtering by date range:', range);
        
        try {
            this.setLoadingState(true);
            
            // Load filtered analytics data
            const analyticsData = await window.dataLoader.loadAnalytics({ dateRange: range });
            
            // Re-render with filtered data
            this.renderAnalytics(analyticsData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('📊 Admin Analytics Controller: Error filtering analytics:', error);
        }
    }

    async exportAnalytics() {
        console.log('📊 Admin Analytics Controller: Exporting analytics...');
        
        try {
            const response = await window.APIService.exportAnalytics();
            
            if (response.success) {
                // Create download link
                const blob = new Blob([response.data], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                window.uiHelpers.showSuccess('Success', 'Analytics data exported successfully');
            } else {
                window.uiHelpers.showError('Error', 'Failed to export analytics data');
            }
            
        } catch (error) {
            console.error('📊 Admin Analytics Controller: Error exporting analytics:', error);
            window.uiHelpers.showError('Error', 'Failed to export analytics data');
        }
    }

    setupRealTimeUpdates() {
        console.log('📊 Admin Analytics Controller: Setting up real-time updates...');
        
        // Refresh analytics data every 5 minutes
        setInterval(() => {
            console.log('📊 Admin Analytics Controller: Refreshing analytics data...');
            this.loadAnalyticsData();
        }, 300000); // 5 minutes
    }
}

// Initialize admin analytics controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Initializing Admin Analytics Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            // Check if we're on the admin analytics page
            if (window.location.pathname.includes('/admin/admin-analytics')) {
                window.adminAnalyticsController = new AdminAnalyticsController();
            }
        } catch (error) {
            console.error('📊 Failed to initialize Admin Analytics Controller:', error);
        }
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAnalyticsController;
}
