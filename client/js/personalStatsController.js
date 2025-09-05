/**
 * Personal Stats Controller
 * Handles personal statistics and analytics for individual users
 */
class PersonalStatsController extends PageController {
    constructor() {
        super();
        this.statsData = null;
        this.chartData = null;
    }

    async init() {
        console.log('📊 PersonalStatsController: Initializing...');
        await super.init();
        
        if (!this.isAuthenticated) {
            console.log('📊 PersonalStatsController: User not authenticated, redirecting to login');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        await this.loadStatsData();
        this.setupEventListeners();
        console.log('📊 PersonalStatsController: Initialization complete');
    }

    async loadStatsData() {
        try {
            this.showLoading();
            
            // Load user stats
            await this.loadUserStats();
            
            // Load progress data
            await this.loadProgressData();
            
            // Load platform stats
            await this.loadPlatformStats();
            
            this.hideLoading();
        } catch (error) {
            console.error('📊 PersonalStatsController: Error loading stats data:', error);
            this.showError('Failed to load statistics data');
        }
    }

    async loadUserStats() {
        try {
            const response = await window.APIService.getUserProfilePersonal();
            if (response.success) {
                this.statsData = response.data;
                this.renderUserStats();
            }
        } catch (error) {
            console.error('📊 PersonalStatsController: Error loading user stats:', error);
        }
    }

    async loadProgressData() {
        try {
            const response = await window.APIService.getUserProgress();
            if (response.success) {
                this.chartData = response.data.progress || [];
                this.renderProgressCharts();
            }
        } catch (error) {
            console.error('📊 PersonalStatsController: Error loading progress data:', error);
        }
    }

    async loadPlatformStats() {
        try {
            // Mock platform stats - in real implementation, this would come from API
            const platformStats = {
                leetcode: { solved: 45, total: 2000, difficulty: { easy: 20, medium: 20, hard: 5 } },
                hackerrank: { solved: 12, total: 500, difficulty: { easy: 8, medium: 3, hard: 1 } },
                gfg: { solved: 8, total: 300, difficulty: { easy: 5, medium: 2, hard: 1 } },
                interviewbit: { solved: 3, total: 150, difficulty: { easy: 2, medium: 1, hard: 0 } }
            };
            
            this.renderPlatformStats(platformStats);
        } catch (error) {
            console.error('📊 PersonalStatsController: Error loading platform stats:', error);
        }
    }

    renderUserStats() {
        if (!this.statsData) return;

        // Update main stats
        window.uiHelpers.updateText('total-problems-solved', this.statsData.problemsSolved || 0);
        window.uiHelpers.updateText('current-streak', this.statsData.streak || 0);
        window.uiHelpers.updateText('user-level', this.statsData.level || 1);
        window.uiHelpers.updateText('total-points', this.statsData.totalPoints || 0);
        window.uiHelpers.updateText('contests-participated', this.statsData.contestsParticipated || 0);
        window.uiHelpers.updateText('average-rating', this.statsData.averageRating || 0);
        
        // Update progress bars
        this.updateProgressBars();
    }

    updateProgressBars() {
        const totalProblems = this.statsData.problemsSolved || 0;
        const level = this.statsData.level || 1;
        const nextLevelProblems = level * 50; // Assuming 50 problems per level
        
        const progressPercentage = Math.min((totalProblems / nextLevelProblems) * 100, 100);
        const progressBar = document.getElementById('level-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
        
        const progressText = document.getElementById('level-progress-text');
        if (progressText) {
            progressText.textContent = `${totalProblems}/${nextLevelProblems} problems`;
        }
    }

    renderProgressCharts() {
        // Render weekly progress chart
        this.renderWeeklyChart();
        
        // Render difficulty distribution
        this.renderDifficultyChart();
        
        // Render platform comparison
        this.renderPlatformChart();
    }

    renderWeeklyChart() {
        const container = document.getElementById('weekly-progress-chart');
        if (!container) return;

        // Mock weekly data
        const weeklyData = [
            { day: 'Mon', problems: 3 },
            { day: 'Tue', problems: 5 },
            { day: 'Wed', problems: 2 },
            { day: 'Thu', problems: 7 },
            { day: 'Fri', problems: 4 },
            { day: 'Sat', problems: 6 },
            { day: 'Sun', problems: 1 }
        ];

        const maxProblems = Math.max(...weeklyData.map(d => d.problems));
        
        container.innerHTML = weeklyData.map(day => {
            const height = (day.problems / maxProblems) * 100;
            return `
                <div class="flex flex-col items-center space-y-2">
                    <div class="w-8 bg-blue-200 rounded-t" style="height: ${height}px; min-height: 4px;">
                        <div class="w-full bg-blue-600 rounded-t" style="height: 100%;"></div>
                    </div>
                    <span class="text-xs text-gray-600">${day.day}</span>
                    <span class="text-xs font-medium text-gray-900">${day.problems}</span>
                </div>
            `;
        }).join('');
    }

    renderDifficultyChart() {
        const container = document.getElementById('difficulty-chart');
        if (!container) return;

        const difficultyData = [
            { level: 'Easy', count: 25, color: 'bg-green-500' },
            { level: 'Medium', count: 15, color: 'bg-yellow-500' },
            { level: 'Hard', count: 5, color: 'bg-red-500' }
        ];

        const total = difficultyData.reduce((sum, item) => sum + item.count, 0);

        container.innerHTML = difficultyData.map(item => {
            const percentage = (item.count / total) * 100;
            return `
                <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div class="flex items-center space-x-3">
                        <div class="w-4 h-4 ${item.color} rounded"></div>
                        <span class="font-medium text-gray-900">${item.level}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-600">${item.count}</span>
                        <span class="text-xs text-gray-500">(${percentage.toFixed(1)}%)</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderPlatformChart() {
        const container = document.getElementById('platform-chart');
        if (!container) return;

        const platformData = [
            { name: 'LeetCode', solved: 45, total: 2000, color: 'bg-orange-500' },
            { name: 'HackerRank', solved: 12, total: 500, color: 'bg-green-500' },
            { name: 'GeeksforGeeks', solved: 8, total: 300, color: 'bg-blue-500' },
            { name: 'InterviewBit', solved: 3, total: 150, color: 'bg-purple-500' }
        ];

        container.innerHTML = platformData.map(platform => {
            const percentage = (platform.solved / platform.total) * 100;
            return `
                <div class="p-4 rounded-lg border border-gray-200">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 ${platform.color} rounded"></div>
                            <span class="font-medium text-gray-900">${platform.name}</span>
                        </div>
                        <span class="text-sm text-gray-600">${platform.solved}/${platform.total}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="${platform.color} h-2 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${percentage.toFixed(1)}% complete</p>
                </div>
            `;
        }).join('');
    }

    renderPlatformStats(platformStats) {
        const container = document.getElementById('platform-stats');
        if (!container) return;

        container.innerHTML = Object.entries(platformStats).map(([platform, stats]) => `
            <div class="p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 capitalize">${platform}</h3>
                    <span class="text-2xl font-bold text-blue-600">${stats.solved}</span>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Easy</span>
                        <span class="font-medium">${stats.difficulty.easy}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Medium</span>
                        <span class="font-medium">${stats.difficulty.medium}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Hard</span>
                        <span class="font-medium">${stats.difficulty.hard}</span>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Total Available</span>
                        <span class="font-medium">${stats.total}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Add any interactive elements
        const exportBtn = document.getElementById('export-stats-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportStats());
        }

        const refreshBtn = document.getElementById('refresh-stats-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadStatsData());
        }
    }

    async exportStats() {
        try {
            const response = await window.APIService.exportUserData();
            if (response.success) {
                // Create download link
                const blob = new Blob([JSON.stringify(this.statsData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'skillport-stats.json';
                a.click();
                URL.revokeObjectURL(url);
                
                this.showSuccess('Statistics exported successfully');
            } else {
                this.showError('Failed to export statistics');
            }
        } catch (error) {
            console.error('📊 PersonalStatsController: Error exporting stats:', error);
            this.showError('Failed to export statistics');
        }
    }

    showLoading() {
        const loadingElements = document.querySelectorAll('.loading-placeholder');
        loadingElements.forEach(el => {
            el.innerHTML = '<div class="animate-pulse bg-gray-200 h-4 rounded"></div>';
        });
    }

    hideLoading() {
        const loadingElements = document.querySelectorAll('.loading-placeholder');
        loadingElements.forEach(el => {
            el.innerHTML = '';
        });
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.personalStatsController = new PersonalStatsController();
});
