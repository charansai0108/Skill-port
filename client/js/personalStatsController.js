import EnhancedPageController from './enhancedPageController.js';

class PersonalStatsController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'personal';
    }

    async renderDashboardContent() {
        console.log('📊 PersonalStatsController: Rendering stats page content...');
        
        try {
            await this.renderStatsOverview();
            await this.renderProgressCharts();
            await this.renderAchievements();
            await this.renderActivityTimeline();
            
            this.setupRealTimeListeners();
            
            console.log('✅ PersonalStatsController: Stats page content rendered successfully');
            
        } catch (error) {
            console.error('❌ PersonalStatsController: Error rendering stats content:', error);
            throw error;
        }
    }

    async renderStatsOverview() {
        try {
            const stats = await this.dataLoader.loadUserStats(this.currentUser.uid);
            this.updateStatsOverviewUI(stats);
        } catch (error) {
            console.error('Error loading stats overview:', error);
            this.showDefaultStatsOverview();
        }
    }

    async renderProgressCharts() {
        try {
            const progressData = await this.dataLoader.loadProgressData(this.currentUser.uid);
            this.renderCharts(progressData);
        } catch (error) {
            console.error('Error loading progress data:', error);
            this.showDefaultCharts();
        }
    }

    async renderAchievements() {
        try {
            const achievements = await this.dataLoader.loadUserAchievements(this.currentUser.uid);
            this.updateAchievementsUI(achievements);
        } catch (error) {
            console.error('Error loading achievements:', error);
            this.showDefaultAchievements();
        }
    }

    async renderActivityTimeline() {
        try {
            const timeline = await this.dataLoader.loadActivityTimeline(this.currentUser.uid);
            this.updateTimelineUI(timeline);
        } catch (error) {
            console.error('Error loading activity timeline:', error);
            this.showDefaultTimeline();
        }
    }

    updateStatsOverviewUI(stats) {
        const statsElements = {
            'total-problems': stats.totalProblems || 0,
            'problems-solved': stats.problemsSolved || 0,
            'accuracy-rate': `${(stats.accuracyRate || 0).toFixed(1)}%`,
            'current-streak': stats.currentStreak || 0,
            'longest-streak': stats.longestStreak || 0,
            'total-hours': stats.totalHours || 0,
            'average-time': `${(stats.averageTime || 0).toFixed(1)} min`,
            'skill-level': stats.skillLevel || 'Beginner'
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    renderCharts(progressData) {
        // Implementation for charts (Chart.js, D3.js, etc.)
        console.log('📊 Rendering progress charts:', progressData);
    }

    updateAchievementsUI(achievements) {
        const container = document.getElementById('achievements-stats-list');
        if (!container) return;

        if (achievements.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="award" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No achievements yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = achievements.map(achievement => `
            <div class="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <i data-lucide="award" class="w-5 h-5 text-yellow-600"></i>
                    </div>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">${achievement.title}</p>
                    <p class="text-xs text-gray-600">${achievement.description}</p>
                    <p class="text-xs text-gray-500 mt-1">${this.formatDate(achievement.earnedAt)}</p>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateTimelineUI(timeline) {
        const container = document.getElementById('activity-timeline');
        if (!container) return;

        if (timeline.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="timeline" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No activity timeline available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = timeline.map(item => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <i data-lucide="${this.getTimelineIcon(item.type)}" class="w-4 h-4 text-blue-600"></i>
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

    getTimelineIcon(type) {
        const icons = {
            'problem_solved': 'check-circle',
            'streak_milestone': 'flame',
            'achievement_earned': 'award',
            'skill_improved': 'trending-up',
            'project_completed': 'folder-check'
        };
        return icons[type] || 'activity';
    }

    // Default states
    showDefaultStatsOverview() {
        const defaultStats = {
            totalProblems: 0,
            problemsSolved: 0,
            accuracyRate: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalHours: 0,
            averageTime: 0,
            skillLevel: 'Beginner'
        };
        this.updateStatsOverviewUI(defaultStats);
    }

    showDefaultCharts() {
        console.log('📊 Showing default charts');
    }

    showDefaultAchievements() {
        const container = document.getElementById('achievements-stats-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading achievements...</p>
                </div>
            `;
        }
    }

    showDefaultTimeline() {
        const container = document.getElementById('activity-timeline');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading timeline...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('📊 PersonalStatsController: Setting up real-time listeners...');
        
        try {
            const statsListener = this.dataLoader.setupUserStatsListener(this.currentUser.uid, (stats) => {
                console.log('📊 Stats updated:', stats);
                this.updateStatsOverviewUI(stats);
            });
            this.realTimeListeners.push(statsListener);

            console.log('✅ PersonalStatsController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ PersonalStatsController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('📊 PersonalStatsController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PersonalStatsController();
});

export default PersonalStatsController;