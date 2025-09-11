import EnhancedPageController from './enhancedPageController.js';

class AdminDashboardController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'admin';
    }

    async renderDashboardContent() {
        console.log('👑 AdminDashboardController: Rendering admin dashboard content...');
        
        try {
            // Load and render admin-specific content
            await this.renderAdminStats();
            await this.renderSystemMetrics();
            await this.renderUserManagement();
            await this.renderRecentActivity();
            await this.renderSystemAlerts();
            
            // Setup real-time listeners
            this.setupRealTimeListeners();
            
            console.log('✅ AdminDashboardController: Admin dashboard content rendered successfully');
            
        } catch (error) {
            console.error('❌ AdminDashboardController: Error rendering dashboard content:', error);
            throw error;
        }
    }

    async renderAdminStats() {
        try {
            const stats = await this.dataLoader.loadAdminStats();
            this.updateAdminStatsUI(stats);
        } catch (error) {
            console.error('Error loading admin stats:', error);
            this.showDefaultAdminStats();
        }
    }

    async renderSystemMetrics() {
        try {
            const metrics = await this.dataLoader.loadSystemMetrics();
            this.updateSystemMetricsUI(metrics);
        } catch (error) {
            console.error('Error loading system metrics:', error);
            this.showDefaultSystemMetrics();
        }
    }

    async renderUserManagement() {
        try {
            const users = await this.dataLoader.loadAllUsers(50);
            this.updateUserManagementUI(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showDefaultUserManagement();
        }
    }

    async renderRecentActivity() {
        try {
            const activity = await this.dataLoader.loadRecentActivity(20);
            this.updateRecentActivityUI(activity);
        } catch (error) {
            console.error('Error loading recent activity:', error);
            this.showDefaultRecentActivity();
        }
    }

    async renderSystemAlerts() {
        try {
            const alerts = await this.dataLoader.loadSystemAlerts();
            this.updateSystemAlertsUI(alerts);
        } catch (error) {
            console.error('Error loading system alerts:', error);
            this.showDefaultSystemAlerts();
        }
    }

    updateAdminStatsUI(stats) {
        const statsElements = {
            'total-users': stats.totalUsers || 0,
            'active-users': stats.activeUsers || 0,
            'total-mentors': stats.totalMentors || 0,
            'total-students': stats.totalStudents || 0,
            'total-sessions': stats.totalSessions || 0,
            'system-uptime': stats.systemUptime || '0%',
            'storage-used': stats.storageUsed || '0 GB',
            'api-requests': stats.apiRequests || 0
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateSystemMetricsUI(metrics) {
        const container = document.getElementById('system-metrics-list');
        if (!container) return;

        if (metrics.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="activity" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No system metrics available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = metrics.map(metric => `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-gray-900">${metric.name}</h3>
                    <span class="text-sm text-gray-500">${metric.value}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${metric.percentage}%"></div>
                </div>
                <p class="text-xs text-gray-500 mt-2">${metric.description}</p>
            </div>
        `).join('');
    }

    updateUserManagementUI(users) {
        const container = document.getElementById('user-management-list');
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No users found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <img src="${user.profileImage || '/images/default-avatar.png'}" alt="${user.name}" class="w-10 h-10 rounded-full object-cover">
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${user.name}</p>
                    <p class="text-xs text-gray-500">${user.email} • ${user.role}</p>
                </div>
                <div class="flex-shrink-0 flex space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getUserStatusColor(user.status)}">
                        ${user.status || 'Active'}
                    </span>
                    <button class="text-blue-600 hover:text-blue-700 text-xs font-medium" onclick="editUser('${user.id}')">
                        Edit
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateRecentActivityUI(activity) {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        if (activity.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="clock" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No recent activity</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activity.map(item => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <i data-lucide="${this.getActivityIcon(item.type)}" class="w-4 h-4 text-blue-600"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm text-gray-900">${item.description}</p>
                    <p class="text-xs text-gray-500 mt-1">${this.formatDateTime(item.timestamp)}</p>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateSystemAlertsUI(alerts) {
        const container = document.getElementById('system-alerts-list');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="check-circle" class="w-12 h-12 text-green-500 mx-auto mb-4"></i>
                    <p class="text-gray-500">No system alerts</p>
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${this.getAlertColor(alert.severity)}">
                        <i data-lucide="${this.getAlertIcon(alert.severity)}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${alert.title}</p>
                    <p class="text-xs text-gray-600 mt-1">${alert.description}</p>
                    <p class="text-xs text-gray-500 mt-1">${this.formatDateTime(alert.timestamp)}</p>
                </div>
                <div class="flex-shrink-0">
                    <button class="text-blue-600 hover:text-blue-700 text-xs font-medium" onclick="dismissAlert('${alert.id}')">
                        Dismiss
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    // Utility Methods
    getUserStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'suspended': 'bg-red-100 text-red-800',
            'pending': 'bg-yellow-100 text-yellow-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getActivityIcon(type) {
        const icons = {
            'user_registration': 'user-plus',
            'user_login': 'log-in',
            'user_logout': 'log-out',
            'session_created': 'calendar',
            'session_completed': 'check-circle',
            'system_error': 'alert-triangle',
            'system_warning': 'alert-circle'
        };
        return icons[type] || 'activity';
    }

    getAlertColor(severity) {
        const colors = {
            'critical': 'bg-red-100 text-red-600',
            'high': 'bg-orange-100 text-orange-600',
            'medium': 'bg-yellow-100 text-yellow-600',
            'low': 'bg-blue-100 text-blue-600'
        };
        return colors[severity?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    }

    getAlertIcon(severity) {
        const icons = {
            'critical': 'alert-triangle',
            'high': 'alert-circle',
            'medium': 'info',
            'low': 'info'
        };
        return icons[severity?.toLowerCase()] || 'info';
    }

    // Default/Error State Methods
    showDefaultAdminStats() {
        const defaultStats = {
            totalUsers: 0,
            activeUsers: 0,
            totalMentors: 0,
            totalStudents: 0,
            totalSessions: 0,
            systemUptime: '0%',
            storageUsed: '0 GB',
            apiRequests: 0
        };
        this.updateAdminStatsUI(defaultStats);
    }

    showDefaultSystemMetrics() {
        const container = document.getElementById('system-metrics-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading system metrics...</p>
                </div>
            `;
        }
    }

    showDefaultUserManagement() {
        const container = document.getElementById('user-management-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading users...</p>
                </div>
            `;
        }
    }

    showDefaultRecentActivity() {
        const container = document.getElementById('recent-activity-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading recent activity...</p>
                </div>
            `;
        }
    }

    showDefaultSystemAlerts() {
        const container = document.getElementById('system-alerts-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading system alerts...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('👑 AdminDashboardController: Setting up real-time listeners...');
        
        try {
            // Listen for admin stats changes
            const statsListener = this.dataLoader.setupAdminStatsListener((stats) => {
                console.log('📊 Admin stats updated:', stats);
                this.updateAdminStatsUI(stats);
            });
            this.realTimeListeners.push(statsListener);

            // Listen for system alerts changes
            const alertsListener = this.dataLoader.setupSystemAlertsListener((alerts) => {
                console.log('🚨 System alerts updated:', alerts);
                this.updateSystemAlertsUI(alerts);
            });
            this.realTimeListeners.push(alertsListener);

            console.log('✅ AdminDashboardController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ AdminDashboardController: Error setting up real-time listeners:', error);
        }
    }

    // Cleanup
    destroy() {
        console.log('👑 AdminDashboardController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboardController();
});

export default AdminDashboardController;
