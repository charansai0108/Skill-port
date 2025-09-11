import EnhancedPageController from './enhancedPageController.js';

class AdminSystemController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'admin';
    }

    async renderDashboardContent() {
        console.log('⚙️ AdminSystemController: Rendering system management content...');
        
        try {
            await this.renderSystemMetrics();
            await this.renderSystemHealth();
            await this.renderSystemLogs();
            await this.renderSystemSettings();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ AdminSystemController: System management content rendered successfully');
            
        } catch (error) {
            console.error('❌ AdminSystemController: Error rendering system content:', error);
            throw error;
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

    async renderSystemHealth() {
        try {
            const health = await this.dataLoader.loadSystemHealth();
            this.updateSystemHealthUI(health);
        } catch (error) {
            console.error('Error loading system health:', error);
            this.showDefaultSystemHealth();
        }
    }

    async renderSystemLogs() {
        try {
            const logs = await this.dataLoader.loadSystemLogs(50);
            this.updateSystemLogsUI(logs);
        } catch (error) {
            console.error('Error loading system logs:', error);
            this.showDefaultSystemLogs();
        }
    }

    async renderSystemSettings() {
        try {
            const settings = await this.dataLoader.loadSystemSettings();
            this.updateSystemSettingsUI(settings);
        } catch (error) {
            console.error('Error loading system settings:', error);
            this.showDefaultSystemSettings();
        }
    }

    updateSystemMetricsUI(metrics) {
        const metricsElements = {
            'system-uptime': metrics.systemUptime || '0%',
            'cpu-usage': `${metrics.cpuUsage || 0}%`,
            'memory-usage': `${metrics.memoryUsage || 0}%`,
            'disk-usage': `${metrics.diskUsage || 0}%`,
            'network-traffic': `${metrics.networkTraffic || 0} MB/s`,
            'active-connections': metrics.activeConnections || 0,
            'api-requests-per-minute': metrics.apiRequestsPerMinute || 0,
            'database-connections': metrics.databaseConnections || 0
        };

        Object.entries(metricsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateSystemHealthUI(health) {
        const container = document.getElementById('system-health-list');
        if (!container) return;

        if (health.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="activity" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No system health data available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = health.map(service => `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${this.getHealthColor(service.status)}">
                        <i data-lucide="${this.getHealthIcon(service.status)}" class="w-4 h-4"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900">${service.name}</p>
                        <p class="text-xs text-gray-500">${service.description}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getHealthStatusColor(service.status)}">
                        ${service.status}
                    </span>
                    <p class="text-xs text-gray-500 mt-1">${service.responseTime || 'N/A'}ms</p>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateSystemLogsUI(logs) {
        const container = document.getElementById('system-logs-list');
        if (!container) return;

        if (logs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="file-text" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No system logs available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${this.getLogColor(log.level)}">
                        <i data-lucide="${this.getLogIcon(log.level)}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <h4 class="text-sm font-medium text-gray-900">${log.message}</h4>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getLogLevelColor(log.level)}">
                            ${log.level}
                        </span>
                    </div>
                    <p class="text-xs text-gray-500">${log.source} • ${this.formatDateTime(log.timestamp)}</p>
                    ${log.details ? `
                        <p class="text-xs text-gray-600 mt-1">${log.details}</p>
                    ` : ''}
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateSystemSettingsUI(settings) {
        const container = document.getElementById('system-settings-list');
        if (!container) return;

        const settingItems = [
            { key: 'maintenanceMode', label: 'Maintenance Mode', value: settings.maintenanceMode || false, type: 'toggle' },
            { key: 'registrationEnabled', label: 'Registration Enabled', value: settings.registrationEnabled || true, type: 'toggle' },
            { key: 'emailNotifications', label: 'Email Notifications', value: settings.emailNotifications || true, type: 'toggle' },
            { key: 'maxUsers', label: 'Max Users', value: settings.maxUsers || 10000, type: 'number' },
            { key: 'sessionTimeout', label: 'Session Timeout (minutes)', value: settings.sessionTimeout || 30, type: 'number' },
            { key: 'backupFrequency', label: 'Backup Frequency (hours)', value: settings.backupFrequency || 24, type: 'number' }
        ];

        container.innerHTML = settingItems.map(setting => `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                    <p class="text-sm font-medium text-gray-900">${setting.label}</p>
                    <p class="text-xs text-gray-500">${this.getSettingDescription(setting.key)}</p>
                </div>
                <div class="flex-shrink-0">
                    ${setting.type === 'toggle' ? `
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer" ${setting.value ? 'checked' : ''} 
                                   onchange="updateSystemSetting('${setting.key}', this.checked)">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    ` : `
                        <input type="number" value="${setting.value}" 
                               class="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                               onchange="updateSystemSetting('${setting.key}', this.value)">
                    `}
                </div>
            </div>
        `).join('');
    }

    setupFormHandlers() {
        // System settings form
        const settingsForm = document.getElementById('system-settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateSystemSettings();
            });
        }

        // Log filter
        const logFilter = document.getElementById('log-filter');
        if (logFilter) {
            logFilter.addEventListener('change', (e) => {
                this.filterLogs(e.target.value);
            });
        }
    }

    async updateSystemSettings() {
        try {
            const formData = new FormData(document.getElementById('system-settings-form'));
            const settingsData = {
                maintenanceMode: formData.get('maintenanceMode') === 'on',
                registrationEnabled: formData.get('registrationEnabled') === 'on',
                emailNotifications: formData.get('emailNotifications') === 'on',
                maxUsers: parseInt(formData.get('maxUsers')),
                sessionTimeout: parseInt(formData.get('sessionTimeout')),
                backupFrequency: parseInt(formData.get('backupFrequency'))
            };

            await this.firebaseService.updateSystemSettings(settingsData);
            this.showSuccessMessage('System settings updated successfully!');
            
        } catch (error) {
            console.error('Error updating system settings:', error);
            this.showErrorMessage('Failed to update system settings. Please try again.');
        }
    }

    async filterLogs(level) {
        try {
            const logs = await this.dataLoader.loadSystemLogs(50);
            let filteredLogs = logs;

            if (level !== 'all') {
                filteredLogs = logs.filter(log => log.level === level);
            }

            this.updateSystemLogsUI(filteredLogs);
            
        } catch (error) {
            console.error('Error filtering logs:', error);
        }
    }

    getHealthColor(status) {
        const colors = {
            'healthy': 'bg-green-100 text-green-600',
            'warning': 'bg-yellow-100 text-yellow-600',
            'error': 'bg-red-100 text-red-600',
            'offline': 'bg-gray-100 text-gray-600'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    }

    getHealthIcon(status) {
        const icons = {
            'healthy': 'check-circle',
            'warning': 'alert-triangle',
            'error': 'x-circle',
            'offline': 'wifi-off'
        };
        return icons[status?.toLowerCase()] || 'help-circle';
    }

    getHealthStatusColor(status) {
        const colors = {
            'healthy': 'bg-green-100 text-green-800',
            'warning': 'bg-yellow-100 text-yellow-800',
            'error': 'bg-red-100 text-red-800',
            'offline': 'bg-gray-100 text-gray-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getLogColor(level) {
        const colors = {
            'info': 'bg-blue-100 text-blue-600',
            'warning': 'bg-yellow-100 text-yellow-600',
            'error': 'bg-red-100 text-red-600',
            'debug': 'bg-gray-100 text-gray-600'
        };
        return colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    }

    getLogIcon(level) {
        const icons = {
            'info': 'info',
            'warning': 'alert-triangle',
            'error': 'x-circle',
            'debug': 'bug'
        };
        return icons[level?.toLowerCase()] || 'file-text';
    }

    getLogLevelColor(level) {
        const colors = {
            'info': 'bg-blue-100 text-blue-800',
            'warning': 'bg-yellow-100 text-yellow-800',
            'error': 'bg-red-100 text-red-800',
            'debug': 'bg-gray-100 text-gray-800'
        };
        return colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getSettingDescription(key) {
        const descriptions = {
            'maintenanceMode': 'Enable maintenance mode to restrict access',
            'registrationEnabled': 'Allow new user registrations',
            'emailNotifications': 'Send email notifications to users',
            'maxUsers': 'Maximum number of users allowed',
            'sessionTimeout': 'User session timeout in minutes',
            'backupFrequency': 'How often to backup system data'
        };
        return descriptions[key] || '';
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }

    // Default states
    showDefaultSystemMetrics() {
        const defaultMetrics = {
            systemUptime: '0%',
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            networkTraffic: 0,
            activeConnections: 0,
            apiRequestsPerMinute: 0,
            databaseConnections: 0
        };
        this.updateSystemMetricsUI(defaultMetrics);
    }

    showDefaultSystemHealth() {
        const container = document.getElementById('system-health-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading system health...</p>
                </div>
            `;
        }
    }

    showDefaultSystemLogs() {
        const container = document.getElementById('system-logs-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading system logs...</p>
                </div>
            `;
        }
    }

    showDefaultSystemSettings() {
        const container = document.getElementById('system-settings-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading system settings...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('⚙️ AdminSystemController: Setting up real-time listeners...');
        
        try {
            const metricsListener = this.dataLoader.setupSystemMetricsListener((metrics) => {
                console.log('⚙️ System metrics updated:', metrics);
                this.updateSystemMetricsUI(metrics);
            });
            this.realTimeListeners.push(metricsListener);

            console.log('✅ AdminSystemController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ AdminSystemController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('⚙️ AdminSystemController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminSystemController();
});

export default AdminSystemController;
