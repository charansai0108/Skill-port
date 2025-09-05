/**
 * UI Helper Functions
 * Reusable functions for dynamic UI updates, data rendering, and state management
 */

class UIHelpers {
    constructor() {
        this.loadingStates = new Map();
        this.errorStates = new Map();
    }

    // Show loading state for an element
    showLoading(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Store original content
        this.loadingStates.set(elementId, element.innerHTML);

        // Show loading content
        element.innerHTML = `
            <div class="flex items-center justify-center p-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span class="ml-2 text-sm text-gray-600">${message}</span>
            </div>
        `;
    }

    // Hide loading state and restore original content
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const originalContent = this.loadingStates.get(elementId);
        if (originalContent) {
            element.innerHTML = originalContent;
            this.loadingStates.delete(elementId);
        }
    }

    // Show error state for an element
    showError(elementId, message = 'An error occurred') {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Store original content
        this.errorStates.set(elementId, element.innerHTML);

        // Show error content
        element.innerHTML = `
            <div class="flex items-center justify-center p-4 text-red-600">
                <i data-lucide="alert-circle" class="w-5 h-5 mr-2"></i>
                <span class="text-sm">${message}</span>
            </div>
        `;

        // Recreate icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Hide error state and restore original content
    hideError(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const originalContent = this.errorStates.get(elementId);
        if (originalContent) {
            element.innerHTML = originalContent;
            this.errorStates.delete(elementId);
        }
    }

    // Show empty state for an element
    showEmpty(elementId, message = 'No data available', icon = 'inbox') {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-gray-500">
                <i data-lucide="${icon}" class="w-12 h-12 mb-4"></i>
                <p class="text-sm">${message}</p>
            </div>
        `;

        // Recreate icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Update text content of an element
    updateText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    // Update inner HTML of an element
    updateHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }

    // Render a list of items
    renderList(containerId, items, itemRenderer, emptyMessage = 'No items found') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!items || items.length === 0) {
            this.showEmpty(containerId, emptyMessage);
            return;
        }

        const html = items.map(itemRenderer).join('');
        container.innerHTML = html;

        // Recreate icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Render a table
    renderTable(containerId, data, columns, emptyMessage = 'No data available') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            this.showEmpty(containerId, emptyMessage);
            return;
        }

        const tableHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            ${columns.map(col => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col.header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.map(row => `
                            <tr class="hover:bg-gray-50">
                                ${columns.map(col => `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${col.render ? col.render(row) : row[col.key]}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    // Render statistics cards
    renderStatsCards(containerId, stats) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cardsHTML = stats.map(stat => `
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-${stat.color || 'blue'}-500 rounded-md flex items-center justify-center">
                            <i data-lucide="${stat.icon}" class="w-5 h-5 text-white"></i>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">${stat.label}</dt>
                            <dd class="text-lg font-medium text-gray-900">${stat.value}</dd>
                            ${stat.growth !== undefined ? `
                                <dd class="text-xs ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}">
                                    ${stat.growth >= 0 ? '+' : ''}${stat.growth} ${stat.growthLabel || 'this week'}
                                </dd>
                            ` : ''}
                        </dl>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = cardsHTML;

        // Recreate icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Render activity feed
    renderActivityFeed(containerId, activities) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!activities || activities.length === 0) {
            this.showEmpty(containerId, 'No recent activity');
            return;
        }

        const activitiesHTML = activities.map(activity => `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-${this.getActivityColor(activity.type)}-100 rounded-full flex items-center justify-center">
                        <i data-lucide="${this.getActivityIcon(activity.type)}" class="w-4 h-4 text-${this.getActivityColor(activity.type)}-600"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">${activity.description}</p>
                    <p class="text-xs text-gray-500">${this.formatTimeAgo(activity.timestamp)}</p>
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;

        // Recreate icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Render user list
    renderUserList(containerId, users) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!users || users.length === 0) {
            this.showEmpty(containerId, 'No users found');
            return;
        }

        const usersHTML = users.map(user => `
            <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        ${user.firstName?.charAt(0) || 'U'}
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">${user.firstName || ''} ${user.lastName || ''}</p>
                    <p class="text-xs text-gray-500">${user.email || ''}</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="text-xs text-gray-500">${this.formatTimeAgo(user.createdAt)}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = usersHTML;
    }

    // Render mentor list
    renderMentorList(containerId, mentors) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!mentors || mentors.length === 0) {
            this.showEmpty(containerId, 'No mentors found');
            return;
        }

        const mentorsHTML = mentors.map(mentor => `
            <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        ${mentor.firstName?.charAt(0) || 'M'}
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">${mentor.firstName || ''} ${mentor.lastName || ''}</p>
                    <p class="text-xs text-gray-500">${mentor.skills?.[0]?.name || 'Expert'} • ${mentor.contestPerformance?.problemsSolved || 0} students</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="text-xs ${mentor.status === 'active' ? 'text-green-600' : 'text-gray-500'}">${mentor.status || 'unknown'}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = mentorsHTML;
    }

    // Utility functions
    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    getActivityColor(type) {
        const colors = {
            'user_created': 'green',
            'contest_created': 'blue',
            'mentor_assigned': 'purple',
            'contest_completed': 'amber',
            'submission_flagged': 'red'
        };
        return colors[type] || 'blue';
    }

    getActivityIcon(type) {
        const icons = {
            'user_created': 'user-plus',
            'contest_created': 'trophy',
            'mentor_assigned': 'graduation-cap',
            'contest_completed': 'target',
            'submission_flagged': 'flag'
        };
        return icons[type] || 'activity';
    }

    // Show notification
    showNotification(type, title, message) {
        if (window.notifications) {
            window.notifications[type](title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }

    // Show success notification
    showSuccess(title, message) {
        this.showNotification('success', title, message);
    }

    // Show error notification
    showError(title, message) {
        this.showNotification('error', title, message);
    }

    // Show info notification
    showInfo(title, message) {
        this.showNotification('info', title, message);
    }
}

// Initialize UI Helpers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Initializing UIHelpers...');
    
    // Prevent multiple instances
    if (window.uiHelpers) {
        console.log('🎨 UIHelpers already initialized, skipping...');
        return;
    }
    
    try {
        window.uiHelpers = new UIHelpers();
    } catch (error) {
        console.error('🎨 Failed to initialize UIHelpers:', error);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIHelpers;
}
