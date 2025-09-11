/**
 * Personal Tracker Controller
 * Handles problem tracking and submission monitoring for personal users
 */
import firebaseService from './firebaseService.js';
import logger from './logger.js';
import PageController from './pageController.js';

class PersonalTrackerController extends PageController {
    constructor() {
        super();
        this.submissions = [];
        this.trackingStats = {};
        this.platforms = ['leetcode', 'hackerrank', 'gfg', 'interviewbit'];
    }

    async init() {
        console.log('📈 PersonalTrackerController: Initializing...');
        await super.init();
        
        if (!this.isAuthenticated) {
            console.log('📈 PersonalTrackerController: User not authenticated, redirecting to login');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        await this.loadTrackingData();
        this.setupEventListeners();
        this.initializeExtensionConnection();
        console.log('📈 PersonalTrackerController: Initialization complete');
    }

    async loadTrackingData() {
        try {
            this.showLoading();
            
            // Get current user
            const user = window.authManager.currentUser;
            if (!user) {
                throw new Error('No authenticated user found');
            }

            // Load tasks from Firestore
            this.tasks = await firebaseService.getUserTasks(user.uid);
            
            // Load user stats for tracking
            const userDoc = await firebaseService.getUserDocument(user.uid);
            if (userDoc) {
                this.trackingStats = {
                    streak: userDoc.streak || 0,
                    submissions: userDoc.submissions || 0,
                    problemsSolved: userDoc.problemsSolved || 0,
                    skillRating: userDoc.skillRating || 0
                };
            } else {
                this.trackingStats = {
                    streak: 0,
                    submissions: 0,
                    problemsSolved: 0,
                    skillRating: 0
                };
            }
            
            this.renderTrackingData();
            this.hideLoading();
        } catch (error) {
            console.error('📈 PersonalTrackerController: Error loading tracking data:', error);
            logger.error('PersonalTrackerController: Error loading tracking data', error);
            this.hideLoading();
            this.showError('Failed to load tracking data');
        }
    }

    async loadSubmissions() {
        try {
            const response = await window.APIService.getUserSubmissions();
            if (response.success) {
                this.submissions = response.data.submissions || [];
                this.renderSubmissions();
            }
        } catch (error) {
            console.error('📈 PersonalTrackerController: Error loading submissions:', error);
        }
    }

    async loadTrackingStats() {
        try {
            // Mock tracking stats - in real implementation, this would come from API
            this.trackingStats = {
                totalSubmissions: this.submissions.length,
                successfulSubmissions: this.submissions.filter(s => s.status === 'accepted').length,
                platformStats: {
                    leetcode: { total: 45, accepted: 40, rejected: 5 },
                    hackerrank: { total: 12, accepted: 10, rejected: 2 },
                    gfg: { total: 8, accepted: 6, rejected: 2 },
                    interviewbit: { total: 3, accepted: 2, rejected: 1 }
                },
                dailyStreak: 7,
                weeklyGoal: 10,
                weeklyProgress: 7
            };
            
            this.renderTrackingStats();
        } catch (error) {
            console.error('📈 PersonalTrackerController: Error loading tracking stats:', error);
        }
    }

    renderSubmissions() {
        const container = document.getElementById('submissions-list');
        if (!container) return;

        if (this.submissions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="code" class="w-8 h-8 text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                    <p class="text-gray-500 mb-4">Start solving problems to see your submissions here</p>
                    <div class="flex justify-center space-x-4">
                        <a href="https://leetcode.com" target="_blank" 
                           class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            LeetCode
                        </a>
                        <a href="https://hackerrank.com" target="_blank" 
                           class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            HackerRank
                        </a>
                    </div>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = this.submissions.slice(0, 20).map(submission => `
            <div class="submission-card p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 ${this.getPlatformColor(submission.platform)} rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-sm">${submission.platform.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-900">${submission.problemTitle}</h4>
                            <p class="text-sm text-gray-500 capitalize">${submission.platform}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 ${this.getStatusColor(submission.status)} text-xs rounded-full">
                            ${submission.status}
                        </span>
                        <span class="text-sm text-gray-500">
                            ${window.uiHelpers.formatDateTime(submission.submittedAt)}
                        </span>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm text-gray-600">
                    <span>Language: ${submission.language}</span>
                    <span>Runtime: ${submission.runtime || 'N/A'}</span>
                    <span>Memory: ${submission.memory || 'N/A'}</span>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    renderTrackingStats() {
        // Render main stats
        window.uiHelpers.updateText('total-submissions', this.trackingStats.totalSubmissions);
        window.uiHelpers.updateText('successful-submissions', this.trackingStats.successfulSubmissions);
        window.uiHelpers.updateText('daily-streak', this.trackingStats.dailyStreak);
        
        // Calculate success rate
        const successRate = this.trackingStats.totalSubmissions > 0 
            ? Math.round((this.trackingStats.successfulSubmissions / this.trackingStats.totalSubmissions) * 100)
            : 0;
        window.uiHelpers.updateText('success-rate', `${successRate}%`);

        // Render platform stats
        this.renderPlatformStats();
        
        // Render weekly progress
        this.renderWeeklyProgress();
    }

    renderPlatformStats() {
        const container = document.getElementById('platform-stats');
        if (!container) return;

        container.innerHTML = Object.entries(this.trackingStats.platformStats).map(([platform, stats]) => {
            const successRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;
            return `
                <div class="platform-stat p-4 rounded-lg border border-gray-200">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <div class="w-6 h-6 ${this.getPlatformColor(platform)} rounded flex items-center justify-center">
                                <span class="text-white font-bold text-xs">${platform.charAt(0).toUpperCase()}</span>
                            </div>
                            <span class="font-medium text-gray-900 capitalize">${platform}</span>
                        </div>
                        <span class="text-sm text-gray-600">${successRate}%</span>
                    </div>
                    <div class="space-y-1">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Total</span>
                            <span class="font-medium">${stats.total}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Accepted</span>
                            <span class="font-medium text-green-600">${stats.accepted}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Rejected</span>
                            <span class="font-medium text-red-600">${stats.rejected}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderWeeklyProgress() {
        const container = document.getElementById('weekly-progress');
        if (!container) return;

        const progress = this.trackingStats.weeklyProgress;
        const goal = this.trackingStats.weeklyGoal;
        const percentage = Math.min((progress / goal) * 100, 100);

        container.innerHTML = `
            <div class="p-4 rounded-lg border border-gray-200">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900">Weekly Goal</h4>
                    <span class="text-sm text-gray-600">${progress}/${goal}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                </div>
                <p class="text-xs text-gray-500">${Math.round(percentage)}% complete</p>
            </div>
        `;
    }

    getPlatformColor(platform) {
        const colors = {
            leetcode: 'bg-orange-500',
            hackerrank: 'bg-green-500',
            gfg: 'bg-blue-500',
            interviewbit: 'bg-purple-500'
        };
        return colors[platform] || 'bg-gray-500';
    }

    getStatusColor(status) {
        const colors = {
            accepted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
            error: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    setupEventListeners() {
        // Refresh data button
        const refreshBtn = document.getElementById('refresh-tracker-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTrackingData());
        }

        // Export data button
        const exportBtn = document.getElementById('export-tracker-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportTrackingData());
        }

        // Platform filter buttons
        const platformFilters = document.querySelectorAll('.platform-filter');
        platformFilters.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByPlatform(e.target.dataset.platform));
        });
    }

    initializeExtensionConnection() {
        // Check if extension is installed and connected
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            this.checkExtensionStatus();
        } else {
            this.showExtensionNotInstalled();
        }
    }

    async checkExtensionStatus() {
        try {
            // Send message to extension to check status
            const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
            if (response && response.connected) {
                this.showExtensionConnected();
            } else {
                this.showExtensionNotConnected();
            }
        } catch (error) {
            console.log('📈 PersonalTrackerController: Extension not available');
            this.showExtensionNotInstalled();
        }
    }

    showExtensionConnected() {
        const container = document.getElementById('extension-status');
        if (container) {
            container.innerHTML = `
                <div class="p-4 rounded-lg border border-green-200 bg-green-50">
                    <div class="flex items-center space-x-2">
                        <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
                        <span class="text-green-800 font-medium">Extension Connected</span>
                    </div>
                    <p class="text-green-700 text-sm mt-1">Your submissions are being tracked automatically</p>
                </div>
            `;
            lucide.createIcons();
        }
    }

    showExtensionNotConnected() {
        const container = document.getElementById('extension-status');
        if (container) {
            container.innerHTML = `
                <div class="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                    <div class="flex items-center space-x-2">
                        <i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-600"></i>
                        <span class="text-yellow-800 font-medium">Extension Not Connected</span>
                    </div>
                    <p class="text-yellow-700 text-sm mt-1">Please refresh the extension or check your connection</p>
                </div>
            `;
            lucide.createIcons();
        }
    }

    showExtensionNotInstalled() {
        const container = document.getElementById('extension-status');
        if (container) {
            container.innerHTML = `
                <div class="p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <div class="flex items-center space-x-2">
                        <i data-lucide="download" class="w-5 h-5 text-blue-600"></i>
                        <span class="text-blue-800 font-medium">Install Extension</span>
                    </div>
                    <p class="text-blue-700 text-sm mt-1">Install the SkillPort extension to automatically track your submissions</p>
                    <button onclick="window.personalTrackerController.installExtension()" 
                            class="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Install Extension
                    </button>
                </div>
            `;
            lucide.createIcons();
        }
    }

    installExtension() {
        // Open extension installation page
        window.open('https://chrome.google.com/webstore/detail/skillport-tracker', '_blank');
    }

    filterByPlatform(platform) {
        if (platform === 'all') {
            this.renderSubmissions();
            return;
        }

        const filteredSubmissions = this.submissions.filter(s => s.platform === platform);
        this.renderFilteredSubmissions(filteredSubmissions);
    }

    renderFilteredSubmissions(submissions) {
        const container = document.getElementById('submissions-list');
        if (!container) return;

        if (submissions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="search" class="w-8 h-8 text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                    <p class="text-gray-500">Try selecting a different platform or time period</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Use the same rendering logic as renderSubmissions but with filtered data
        const originalSubmissions = this.submissions;
        this.submissions = submissions;
        this.renderSubmissions();
        this.submissions = originalSubmissions;
    }

    async exportTrackingData() {
        try {
            const response = await window.APIService.exportUserData();
            if (response.success) {
                // Create download link
                const data = {
                    submissions: this.submissions,
                    stats: this.trackingStats,
                    exportedAt: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'skillport-tracking-data.json';
                a.click();
                URL.revokeObjectURL(url);
                
                this.showSuccess('Tracking data exported successfully');
            } else {
                this.showError('Failed to export tracking data');
            }
        } catch (error) {
            console.error('📈 PersonalTrackerController: Error exporting data:', error);
            this.showError('Failed to export tracking data');
        }
    }

    showLoading() {
        const container = document.getElementById('submissions-list');
        if (container) {
            container.innerHTML = `
                <div class="space-y-4">
                    ${Array(5).fill().map(() => `
                        <div class="p-4 rounded-lg border border-gray-200 animate-pulse">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                <div class="flex-1">
                                    <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                    <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading is handled by renderSubmissions
    }

    showSuccess(message) {
        if (window.notifications) {
            window.notifications.success({
                title: 'Success',
                message: message
            });
        }
    }

    showError(message) {
        if (window.notifications) {
            window.notifications.error({
                title: 'Error',
                message: message
            });
        }
    }
}

// Make PersonalTrackerController available globally
window.PersonalTrackerController = PersonalTrackerController;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.personalTrackerController = new PersonalTrackerController();
});
