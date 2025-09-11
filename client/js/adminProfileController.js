import EnhancedPageController from './enhancedPageController.js';

class AdminProfileController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'admin';
    }

    async renderDashboardContent() {
        console.log('👤 AdminProfileController: Rendering admin profile content...');
        
        try {
            await this.renderAdminProfile();
            await this.renderAdminSettings();
            await this.renderAdminActivity();
            await this.renderAdminPreferences();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ AdminProfileController: Admin profile content rendered successfully');
            
        } catch (error) {
            console.error('❌ AdminProfileController: Error rendering admin profile content:', error);
            throw error;
        }
    }

    async renderAdminProfile() {
        try {
            const profile = await this.dataLoader.loadAdminProfile();
            this.updateAdminProfileUI(profile);
        } catch (error) {
            console.error('Error loading admin profile:', error);
            this.showDefaultAdminProfile();
        }
    }

    async renderAdminSettings() {
        try {
            const settings = await this.dataLoader.loadAdminSettings();
            this.updateAdminSettingsUI(settings);
        } catch (error) {
            console.error('Error loading admin settings:', error);
            this.showDefaultAdminSettings();
        }
    }

    async renderAdminActivity() {
        try {
            const activity = await this.dataLoader.loadAdminActivity(50);
            this.updateAdminActivityUI(activity);
        } catch (error) {
            console.error('Error loading admin activity:', error);
            this.showDefaultAdminActivity();
        }
    }

    async renderAdminPreferences() {
        try {
            const preferences = await this.dataLoader.loadAdminPreferences();
            this.updateAdminPreferencesUI(preferences);
        } catch (error) {
            console.error('Error loading admin preferences:', error);
            this.showDefaultAdminPreferences();
        }
    }

    updateAdminProfileUI(profile) {
        const profileElements = {
            'admin-name': profile.name || 'Admin User',
            'admin-email': profile.email || 'admin@skillport.com',
            'admin-role': profile.role || 'admin',
            'admin-joined': this.formatDate(profile.createdAt) || 'N/A',
            'admin-last-active': this.formatDate(profile.lastActiveAt) || 'N/A',
            'admin-permissions': profile.permissions?.join(', ') || 'All permissions',
            'admin-department': profile.department || 'Administration',
            'admin-phone': profile.phone || 'Not provided'
        };

        Object.entries(profileElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });

        // Update profile image
        const profileImage = document.getElementById('admin-profile-image');
        if (profileImage && profile.profileImage) {
            profileImage.src = profile.profileImage;
        }
    }

    updateAdminSettingsUI(settings) {
        const container = document.getElementById('admin-settings-list');
        if (!container) return;

        const settingItems = [
            { key: 'emailNotifications', label: 'Email Notifications', value: settings.emailNotifications || true, type: 'toggle' },
            { key: 'pushNotifications', label: 'Push Notifications', value: settings.pushNotifications || true, type: 'toggle' },
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', value: settings.twoFactorAuth || false, type: 'toggle' },
            { key: 'sessionTimeout', label: 'Session Timeout (minutes)', value: settings.sessionTimeout || 30, type: 'number' },
            { key: 'language', label: 'Language', value: settings.language || 'en', type: 'select', options: ['en', 'es', 'fr', 'de'] },
            { key: 'timezone', label: 'Timezone', value: settings.timezone || 'UTC', type: 'select', options: ['UTC', 'EST', 'PST', 'GMT'] }
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
                                   onchange="updateAdminSetting('${setting.key}', this.checked)">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    ` : setting.type === 'select' ? `
                        <select class="px-3 py-1 text-sm border border-gray-300 rounded" 
                                onchange="updateAdminSetting('${setting.key}', this.value)">
                            ${setting.options.map(option => `
                                <option value="${option}" ${option === setting.value ? 'selected' : ''}>${option}</option>
                            `).join('')}
                        </select>
                    ` : `
                        <input type="number" value="${setting.value}" 
                               class="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                               onchange="updateAdminSetting('${setting.key}', this.value)">
                    `}
                </div>
            </div>
        `).join('');
    }

    updateAdminActivityUI(activity) {
        const container = document.getElementById('admin-activity-list');
        if (!container) return;

        if (activity.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="activity" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No recent activity</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activity.map(item => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${this.getActivityColor(item.type)}">
                        <i data-lucide="${this.getActivityIcon(item.type)}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <h4 class="text-sm font-medium text-gray-900">${item.action}</h4>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getActivityTypeColor(item.type)}">
                            ${item.type}
                        </span>
                    </div>
                    <p class="text-xs text-gray-500">${item.description}</p>
                    <p class="text-xs text-gray-500 mt-1">${this.formatDateTime(item.timestamp)}</p>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateAdminPreferencesUI(preferences) {
        const container = document.getElementById('admin-preferences-list');
        if (!container) return;

        const preferenceItems = [
            { key: 'dashboardLayout', label: 'Dashboard Layout', value: preferences.dashboardLayout || 'grid', type: 'select', options: ['grid', 'list', 'compact'] },
            { key: 'theme', label: 'Theme', value: preferences.theme || 'light', type: 'select', options: ['light', 'dark', 'auto'] },
            { key: 'itemsPerPage', label: 'Items Per Page', value: preferences.itemsPerPage || 25, type: 'number' },
            { key: 'autoRefresh', label: 'Auto Refresh', value: preferences.autoRefresh || true, type: 'toggle' },
            { key: 'showNotifications', label: 'Show Notifications', value: preferences.showNotifications || true, type: 'toggle' },
            { key: 'compactMode', label: 'Compact Mode', value: preferences.compactMode || false, type: 'toggle' }
        ];

        container.innerHTML = preferenceItems.map(preference => `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                    <p class="text-sm font-medium text-gray-900">${preference.label}</p>
                    <p class="text-xs text-gray-500">${this.getPreferenceDescription(preference.key)}</p>
                </div>
                <div class="flex-shrink-0">
                    ${preference.type === 'toggle' ? `
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer" ${preference.value ? 'checked' : ''} 
                                   onchange="updateAdminPreference('${preference.key}', this.checked)">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    ` : preference.type === 'select' ? `
                        <select class="px-3 py-1 text-sm border border-gray-300 rounded" 
                                onchange="updateAdminPreference('${preference.key}', this.value)">
                            ${preference.options.map(option => `
                                <option value="${option}" ${option === preference.value ? 'selected' : ''}>${option}</option>
                            `).join('')}
                        </select>
                    ` : `
                        <input type="number" value="${preference.value}" 
                               class="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                               onchange="updateAdminPreference('${preference.key}', this.value)">
                    `}
                </div>
            </div>
        `).join('');
    }

    setupFormHandlers() {
        // Profile update form
        const profileForm = document.getElementById('admin-profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateAdminProfile();
            });
        }

        // Password change form
        const passwordForm = document.getElementById('admin-password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changeAdminPassword();
            });
        }
    }

    async updateAdminProfile() {
        try {
            const formData = new FormData(document.getElementById('admin-profile-form'));
            const profileData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                department: formData.get('department')
            };

            await this.firebaseService.updateAdminProfile(profileData);
            this.showSuccessMessage('Profile updated successfully!');
            
        } catch (error) {
            console.error('Error updating admin profile:', error);
            this.showErrorMessage('Failed to update profile. Please try again.');
        }
    }

    async changeAdminPassword() {
        try {
            const formData = new FormData(document.getElementById('admin-password-form'));
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            if (newPassword !== confirmPassword) {
                this.showErrorMessage('New passwords do not match.');
                return;
            }

            await this.firebaseService.changeAdminPassword(currentPassword, newPassword);
            this.showSuccessMessage('Password changed successfully!');
            document.getElementById('admin-password-form').reset();
            
        } catch (error) {
            console.error('Error changing admin password:', error);
            this.showErrorMessage('Failed to change password. Please try again.');
        }
    }

    getActivityColor(type) {
        const colors = {
            'login': 'bg-green-100 text-green-600',
            'logout': 'bg-gray-100 text-gray-600',
            'create': 'bg-blue-100 text-blue-600',
            'update': 'bg-yellow-100 text-yellow-600',
            'delete': 'bg-red-100 text-red-600',
            'system': 'bg-purple-100 text-purple-600'
        };
        return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    }

    getActivityIcon(type) {
        const icons = {
            'login': 'log-in',
            'logout': 'log-out',
            'create': 'plus',
            'update': 'edit',
            'delete': 'trash',
            'system': 'settings'
        };
        return icons[type?.toLowerCase()] || 'activity';
    }

    getActivityTypeColor(type) {
        const colors = {
            'login': 'bg-green-100 text-green-800',
            'logout': 'bg-gray-100 text-gray-800',
            'create': 'bg-blue-100 text-blue-800',
            'update': 'bg-yellow-100 text-yellow-800',
            'delete': 'bg-red-100 text-red-800',
            'system': 'bg-purple-100 text-purple-800'
        };
        return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getSettingDescription(key) {
        const descriptions = {
            'emailNotifications': 'Receive email notifications for important events',
            'pushNotifications': 'Receive push notifications in browser',
            'twoFactorAuth': 'Enable two-factor authentication for security',
            'sessionTimeout': 'Automatic logout after inactivity',
            'language': 'Interface language preference',
            'timezone': 'Time zone for displaying dates and times'
        };
        return descriptions[key] || '';
    }

    getPreferenceDescription(key) {
        const descriptions = {
            'dashboardLayout': 'How to display dashboard items',
            'theme': 'Visual theme for the interface',
            'itemsPerPage': 'Number of items to show per page',
            'autoRefresh': 'Automatically refresh data',
            'showNotifications': 'Display notification badges',
            'compactMode': 'Use compact interface layout'
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
    showDefaultAdminProfile() {
        const defaultProfile = {
            name: 'Admin User',
            email: 'admin@skillport.com',
            role: 'admin',
            joined: 'N/A',
            lastActive: 'N/A',
            permissions: 'All permissions',
            department: 'Administration',
            phone: 'Not provided'
        };
        this.updateAdminProfileUI(defaultProfile);
    }

    showDefaultAdminSettings() {
        const container = document.getElementById('admin-settings-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading admin settings...</p>
                </div>
            `;
        }
    }

    showDefaultAdminActivity() {
        const container = document.getElementById('admin-activity-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading admin activity...</p>
                </div>
            `;
        }
    }

    showDefaultAdminPreferences() {
        const container = document.getElementById('admin-preferences-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading admin preferences...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('👤 AdminProfileController: Setting up real-time listeners...');
        
        try {
            const profileListener = this.dataLoader.setupAdminProfileListener((profile) => {
                console.log('👤 Admin profile updated:', profile);
                this.updateAdminProfileUI(profile);
            });
            this.realTimeListeners.push(profileListener);

            console.log('✅ AdminProfileController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ AdminProfileController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('👤 AdminProfileController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminProfileController();
});

export default AdminProfileController;
