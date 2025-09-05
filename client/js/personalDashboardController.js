/**
 * Personal Dashboard Controller
 * Handles personal dashboard functionality for individual users
 */
class PersonalDashboardController extends PageController {
    constructor() {
        super();
        this.userStats = null;
        this.recentActivity = [];
        this.goals = [];
        this.achievements = [];
    }

    async init() {
        console.log('🎯 PersonalDashboardController: Initializing...');
        
        // Wait for AuthManager to be available
        let retries = 0;
        while (!window.authManager && retries < 10) {
            console.log('🎯 PersonalDashboardController: Waiting for AuthManager...', retries);
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!window.authManager) {
            console.error('🎯 PersonalDashboardController: AuthManager not available after 10 retries');
            window.location.href = '/pages/auth/login.html';
            return;
        }
        
        await super.init();
        
        // Give AuthManager a moment to complete authentication
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!window.authManager.isAuthenticated) {
            console.log('🎯 PersonalDashboardController: User not authenticated, redirecting to login');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        await this.loadDashboardData();
        this.setupEventListeners();
        console.log('🎯 PersonalDashboardController: Initialization complete');
    }

    async loadDashboardData() {
        try {
            this.showLoading();
            
            // Load user stats
            await this.loadUserStats();
            
            // Load recent activity
            await this.loadRecentActivity();
            
            // Load goals
            await this.loadGoals();
            
            // Load achievements
            await this.loadAchievements();
            
            this.hideLoading();
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadUserStats() {
        try {
            const response = await window.APIService.getUserProfile();
            if (response.success) {
                // Handle different response formats from different endpoints
                this.userStats = response.data.user || response.data;
                this.renderUserStats();
            }
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading user stats:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const response = await window.APIService.getUserProgress();
            if (response.success) {
                this.recentActivity = response.data.progress || [];
                this.renderRecentActivity();
            }
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading recent activity:', error);
        }
    }

    async loadGoals() {
        try {
            // Mock goals data - in real implementation, this would come from API
            this.goals = [
                { id: 1, title: 'Solve 50 LeetCode problems', progress: 35, target: 50, type: 'leetcode' },
                { id: 2, title: 'Complete 10 HackerRank challenges', progress: 7, target: 10, type: 'hackerrank' },
                { id: 3, title: 'Master 5 data structures', progress: 3, target: 5, type: 'learning' }
            ];
            this.renderGoals();
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading goals:', error);
        }
    }

    async loadAchievements() {
        try {
            // Mock achievements data
            this.achievements = [
                { id: 1, title: 'First Problem Solved', description: 'Solved your first coding problem', icon: 'trophy', earned: true },
                { id: 2, title: 'Week Streak', description: 'Solved problems for 7 consecutive days', icon: 'flame', earned: true },
                { id: 3, title: 'Algorithm Master', description: 'Solved 100 algorithm problems', icon: 'brain', earned: false }
            ];
            this.renderAchievements();
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading achievements:', error);
        }
    }

    renderUserStats() {
        if (!this.userStats) return;

        // Update user info - use actual element IDs from HTML
        const firstNameElement = document.getElementById('userFirstName');
        if (firstNameElement) {
            firstNameElement.textContent = this.userStats.firstName || 'User';
        }
        
        // Update stats - use actual element IDs from HTML
        const problemsSolvedElement = document.getElementById('problems-solved-student');
        if (problemsSolvedElement) {
            problemsSolvedElement.textContent = this.userStats.totalPoints || 0;
        }
        
        const totalPointsElement = document.getElementById('total-points-student');
        if (totalPointsElement) {
            totalPointsElement.textContent = this.userStats.totalPoints || 0;
        }
        
        const dayStreakElement = document.getElementById('day-streak-student');
        if (dayStreakElement) {
            dayStreakElement.textContent = this.userStats.streak || 0;
        }
        
        // Update page title
        if (this.userStats.firstName) {
            document.title = `${this.userStats.firstName}'s Dashboard - SkillPort`;
        }
        
        console.log('✅ PersonalDashboardController: User stats rendered:', {
            firstName: this.userStats.firstName,
            lastName: this.userStats.lastName,
            email: this.userStats.email,
            totalPoints: this.userStats.totalPoints,
            streak: this.userStats.streak
        });
    }

    renderRecentActivity() {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        if (this.recentActivity.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No recent activity</p>';
            return;
        }

        container.innerHTML = this.recentActivity.slice(0, 5).map(activity => `
            <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i data-lucide="check" class="w-4 h-4 text-green-600"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${activity.type || 'Problem Solved'}</p>
                    <p class="text-xs text-gray-500">${window.uiHelpers.formatDateTime(activity.createdAt)}</p>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    renderGoals() {
        const container = document.getElementById('goals-list');
        if (!container) return;

        container.innerHTML = this.goals.map(goal => {
            const percentage = Math.round((goal.progress / goal.target) * 100);
            return `
                <div class="goal-card p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-gray-900">${goal.title}</h4>
                        <span class="text-sm text-gray-500">${goal.progress}/${goal.target}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">${percentage}% complete</p>
                </div>
            `;
        }).join('');
    }

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        container.innerHTML = this.achievements.map(achievement => `
            <div class="flex items-center space-x-3 p-3 rounded-lg ${achievement.earned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}">
                <div class="w-10 h-10 ${achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'} rounded-full flex items-center justify-center">
                    <i data-lucide="${achievement.icon}" class="w-5 h-5 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-medium ${achievement.earned ? 'text-yellow-900' : 'text-gray-500'}">${achievement.title}</h4>
                    <p class="text-sm ${achievement.earned ? 'text-yellow-700' : 'text-gray-400'}">${achievement.description}</p>
                </div>
                ${achievement.earned ? '<i data-lucide="check-circle" class="w-5 h-5 text-yellow-600"></i>' : ''}
            </div>
        `).join('');

        lucide.createIcons();
    }

    setupEventListeners() {
        // Add goal click handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.goal-card')) {
                const goalCard = e.target.closest('.goal-card');
                this.handleGoalClick(goalCard);
            }
        });

        // Add achievement click handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.achievement-item')) {
                const achievementItem = e.target.closest('.achievement-item');
                this.handleAchievementClick(achievementItem);
            }
        });
    }

    handleGoalClick(goalCard) {
        // Handle goal interaction
        console.log('🎯 PersonalDashboardController: Goal clicked');
    }

    handleAchievementClick(achievementItem) {
        // Handle achievement interaction
        console.log('🎯 PersonalDashboardController: Achievement clicked');
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
    window.personalDashboardController = new PersonalDashboardController();
});
