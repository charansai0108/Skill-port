/**
 * Personal Dashboard Controller - Firebase Integration
 * Handles personal dashboard functionality using Firebase Firestore
 */
import firebaseService from './firebaseService.js';

class PersonalDashboardController extends PageController {
    constructor() {
        super();
        this.userStats = null;
        this.recentActivity = [];
        this.goals = [];
        this.achievements = [];
        this.codingPlatforms = [];
    }

    async init() {
        console.log('🎯 PersonalDashboardController: Initializing with Firebase...');
        
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
            
            // Load coding platforms
            await this.loadCodingPlatforms();
            
            this.hideLoading();
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadUserStats() {
        try {
            // Get user data from Firebase Auth and Firestore
            const currentUser = firebaseService.getCurrentUser();
            if (currentUser) {
                this.userStats = {
                    firstName: currentUser.firstName || currentUser.displayName?.split(' ')[0] || 'User',
                    lastName: currentUser.lastName || currentUser.displayName?.split(' ')[1] || '',
                    email: currentUser.email,
                    totalPoints: currentUser.totalPoints || 0,
                    streak: currentUser.streak || 0,
                    problemsSolved: currentUser.problemsSolved || 0,
                    skillRating: currentUser.skillRating || 0,
                    communities: currentUser.communities || 0
                };
                this.renderUserStats();
            }
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading user stats:', error);
        }
    }

    async loadRecentActivity() {
        try {
            // Load recent activity from Firestore
            const response = await firebaseService.getTasks();
            if (response.success) {
                this.recentActivity = response.data.slice(0, 5).map(task => ({
                    type: task.title || 'Task Completed',
                    createdAt: task.createdAt?.toDate() || new Date(),
                    description: task.description || ''
                }));
                this.renderRecentActivity();
            }
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading recent activity:', error);
        }
    }

    async loadGoals() {
        try {
            // Load goals from Firestore or use default goals
            const currentUser = firebaseService.getCurrentUser();
            this.goals = [
                { 
                    id: 1, 
                    title: 'Solve 50 LeetCode problems', 
                    progress: currentUser?.leetcodeProblems || 0, 
                    target: 50, 
                    type: 'leetcode' 
                },
                { 
                    id: 2, 
                    title: 'Complete 10 HackerRank challenges', 
                    progress: currentUser?.hackerrankProblems || 0, 
                    target: 10, 
                    type: 'hackerrank' 
                },
                { 
                    id: 3, 
                    title: 'Master 5 data structures', 
                    progress: currentUser?.dataStructuresLearned || 0, 
                    target: 5, 
                    type: 'learning' 
                }
            ];
            this.renderGoals();
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading goals:', error);
        }
    }

    async loadAchievements() {
        try {
            // Load achievements from Firestore or use default achievements
            const currentUser = firebaseService.getCurrentUser();
            this.achievements = [
                { 
                    id: 1, 
                    title: 'First Problem Solved', 
                    description: 'Solved your first coding problem', 
                    icon: 'trophy', 
                    earned: (currentUser?.problemsSolved || 0) > 0 
                },
                { 
                    id: 2, 
                    title: 'Week Streak', 
                    description: 'Solved problems for 7 consecutive days', 
                    icon: 'flame', 
                    earned: (currentUser?.streak || 0) >= 7 
                },
                { 
                    id: 3, 
                    title: 'Algorithm Master', 
                    description: 'Solved 100 algorithm problems', 
                    icon: 'brain', 
                    earned: (currentUser?.problemsSolved || 0) >= 100 
                }
            ];
            this.renderAchievements();
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading achievements:', error);
        }
    }

    async loadCodingPlatforms() {
        try {
            // Load coding platform progress from Firestore
            const currentUser = firebaseService.getCurrentUser();
            this.codingPlatforms = [
                {
                    name: 'LeetCode',
                    easy: currentUser?.leetcodeEasy || 0,
                    medium: currentUser?.leetcodeMedium || 0,
                    hard: currentUser?.leetcodeHard || 0,
                    total: (currentUser?.leetcodeEasy || 0) + (currentUser?.leetcodeMedium || 0) + (currentUser?.leetcodeHard || 0)
                },
                {
                    name: 'GeeksforGeeks',
                    easy: currentUser?.gfgEasy || 0,
                    medium: currentUser?.gfgMedium || 0,
                    hard: currentUser?.gfgHard || 0,
                    total: (currentUser?.gfgEasy || 0) + (currentUser?.gfgMedium || 0) + (currentUser?.gfgHard || 0)
                },
                {
                    name: 'HackerRank',
                    easy: currentUser?.hackerrankEasy || 0,
                    medium: currentUser?.hackerrankMedium || 0,
                    hard: currentUser?.hackerrankHard || 0,
                    total: (currentUser?.hackerrankEasy || 0) + (currentUser?.hackerrankMedium || 0) + (currentUser?.hackerrankHard || 0)
                },
                {
                    name: 'InterviewBit',
                    easy: currentUser?.interviewbitEasy || 0,
                    medium: currentUser?.interviewbitMedium || 0,
                    hard: currentUser?.interviewbitHard || 0,
                    total: (currentUser?.interviewbitEasy || 0) + (currentUser?.interviewbitMedium || 0) + (currentUser?.interviewbitHard || 0)
                }
            ];
            this.renderCodingPlatforms();
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading coding platforms:', error);
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

    renderCodingPlatforms() {
        // Update the coding platforms section with dynamic data
        const platforms = this.codingPlatforms || [];
        
        // Update LeetCode card
        const leetcodeCard = document.querySelector('[data-platform="leetcode"]');
        if (leetcodeCard && platforms[0]) {
            const leetcode = platforms[0];
            const easySpan = leetcodeCard.querySelector('[data-difficulty="easy"]');
            const mediumSpan = leetcodeCard.querySelector('[data-difficulty="medium"]');
            const hardSpan = leetcodeCard.querySelector('[data-difficulty="hard"]');
            const totalSpan = leetcodeCard.querySelector('[data-total]');
            
            if (easySpan) easySpan.textContent = leetcode.easy;
            if (mediumSpan) mediumSpan.textContent = leetcode.medium;
            if (hardSpan) hardSpan.textContent = leetcode.hard;
            if (totalSpan) totalSpan.textContent = leetcode.total;
        }
        
        // Update GeeksforGeeks card
        const gfgCard = document.querySelector('[data-platform="gfg"]');
        if (gfgCard && platforms[1]) {
            const gfg = platforms[1];
            const easySpan = gfgCard.querySelector('[data-difficulty="easy"]');
            const mediumSpan = gfgCard.querySelector('[data-difficulty="medium"]');
            const hardSpan = gfgCard.querySelector('[data-difficulty="hard"]');
            const totalSpan = gfgCard.querySelector('[data-total]');
            
            if (easySpan) easySpan.textContent = gfg.easy;
            if (mediumSpan) mediumSpan.textContent = gfg.medium;
            if (hardSpan) hardSpan.textContent = gfg.hard;
            if (totalSpan) totalSpan.textContent = gfg.total;
        }
        
        // Update HackerRank card
        const hackerrankCard = document.querySelector('[data-platform="hackerrank"]');
        if (hackerrankCard && platforms[2]) {
            const hackerrank = platforms[2];
            const easySpan = hackerrankCard.querySelector('[data-difficulty="easy"]');
            const mediumSpan = hackerrankCard.querySelector('[data-difficulty="medium"]');
            const hardSpan = hackerrankCard.querySelector('[data-difficulty="hard"]');
            const totalSpan = hackerrankCard.querySelector('[data-total]');
            
            if (easySpan) easySpan.textContent = hackerrank.easy;
            if (mediumSpan) mediumSpan.textContent = hackerrank.medium;
            if (hardSpan) hardSpan.textContent = hackerrank.hard;
            if (totalSpan) totalSpan.textContent = hackerrank.total;
        }
        
        // Update InterviewBit card
        const interviewbitCard = document.querySelector('[data-platform="interviewbit"]');
        if (interviewbitCard && platforms[3]) {
            const interviewbit = platforms[3];
            const easySpan = interviewbitCard.querySelector('[data-difficulty="easy"]');
            const mediumSpan = interviewbitCard.querySelector('[data-difficulty="medium"]');
            const hardSpan = interviewbitCard.querySelector('[data-difficulty="hard"]');
            const totalSpan = interviewbitCard.querySelector('[data-total]');
            
            if (easySpan) easySpan.textContent = interviewbit.easy;
            if (mediumSpan) mediumSpan.textContent = interviewbit.medium;
            if (hardSpan) hardSpan.textContent = interviewbit.hard;
            if (totalSpan) totalSpan.textContent = interviewbit.total;
        }
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
