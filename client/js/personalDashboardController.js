/**
 * Personal Dashboard Controller - Firebase Integration
 * Handles personal dashboard functionality using Firebase Firestore
 */
import firebaseService from './firebaseService.js';
import logger from './logger.js';
import PageController from './pageController.js';

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
            console.log('🎯 PersonalDashboardController: Loading dashboard data...');
            this.showLoading();
            
            // Get current user
            const user = window.authManager.currentUser;
            if (!user) {
                throw new Error('No authenticated user found');
            }

            // Load user profile and stats from Firestore
            await this.loadUserProfile(user.uid);
            
            // Load tasks
            await this.loadTasks(user.uid);
            
            // Load projects
            await this.loadProjects(user.uid);
            
            // Load achievements
            await this.loadAchievements(user.uid);
            
            // Update UI with loaded data
            this.updateDashboardUI();
            
            this.hideLoading();
            console.log('🎯 PersonalDashboardController: Dashboard data loaded successfully');
            
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Failed to load dashboard data:', error);
            logger.error('PersonalDashboardController: Failed to load dashboard data', error);
            this.hideLoading();
            this.handleError(error);
        }
    }

    async loadUserProfile(uid) {
        try {
            console.log('🎯 PersonalDashboardController: Loading user profile for:', uid);
            
            // Get user document from Firestore
            const userDoc = await firebaseService.getUserDocument(uid);
            
            if (userDoc) {
                this.userStats = {
                    firstName: userDoc.name?.split(' ')[0] || 'User',
                    lastName: userDoc.name?.split(' ')[1] || '',
                    email: userDoc.email || 'N/A',
                    profileImage: userDoc.profileImage || '',
                    streak: userDoc.streak || 0,
                    submissions: userDoc.submissions || 0,
                    problemsSolved: userDoc.problemsSolved || 0,
                    skillRating: userDoc.skillRating || 0,
                    createdAt: userDoc.createdAt,
                    updatedAt: userDoc.updatedAt
                };
                console.log('🎯 PersonalDashboardController: User profile loaded:', this.userStats);
            } else {
                // Create default user stats if document doesn't exist
                this.userStats = {
                    firstName: 'User',
                    lastName: '',
                    email: 'N/A',
                    profileImage: '',
                    streak: 0,
                    submissions: 0,
                    problemsSolved: 0,
                    skillRating: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                console.log('🎯 PersonalDashboardController: Using default user stats');
            }
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading user profile:', error);
            logger.error('PersonalDashboardController: Error loading user profile', error);
            
            // Fallback to basic user data
            this.userStats = {
                firstName: 'User',
                lastName: '',
                email: 'N/A',
                profileImage: '',
                streak: 0,
                submissions: 0,
                problemsSolved: 0,
                skillRating: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
    }

    async loadTasks(uid) {
        try {
            console.log('🎯 PersonalDashboardController: Loading tasks for:', uid);
            
            // Load tasks from Firestore subcollection
            const tasks = await firebaseService.getUserTasks(uid);
            
            if (tasks && tasks.length > 0) {
                this.tasks = tasks;
                console.log('🎯 PersonalDashboardController: Tasks loaded:', tasks.length);
            } else {
                this.tasks = [];
                console.log('🎯 PersonalDashboardController: No tasks found');
            }
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading tasks:', error);
            logger.error('PersonalDashboardController: Error loading tasks', error);
            this.tasks = [];
        }
    }

    async loadProjects(uid) {
        try {
            console.log('🎯 PersonalDashboardController: Loading projects for:', uid);
            
            // Load projects from Firestore subcollection
            const projects = await firebaseService.getUserProjects(uid);
            
            if (projects && projects.length > 0) {
                this.projects = projects;
                console.log('🎯 PersonalDashboardController: Projects loaded:', projects.length);
            } else {
                this.projects = [];
                console.log('🎯 PersonalDashboardController: No projects found');
            }
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading projects:', error);
            logger.error('PersonalDashboardController: Error loading projects', error);
            this.projects = [];
        }
    }

    async loadAchievements(uid) {
        try {
            console.log('🎯 PersonalDashboardController: Loading achievements for:', uid);
            
            // Load achievements from Firestore subcollection
            const achievements = await firebaseService.getUserAchievements(uid);
            
            if (achievements && achievements.length > 0) {
                this.achievements = achievements;
                console.log('🎯 PersonalDashboardController: Achievements loaded:', achievements.length);
            } else {
                this.achievements = [];
                console.log('🎯 PersonalDashboardController: No achievements found');
            }
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error loading achievements:', error);
            logger.error('PersonalDashboardController: Error loading achievements', error);
            this.achievements = [];
        }
    }

    updateDashboardUI() {
        try {
            console.log('🎯 PersonalDashboardController: Updating dashboard UI...');
            
            // Update user stats
            this.renderUserStats();
            
            // Update tasks
            this.renderTasks();
            
            // Update projects
            this.renderProjects();
            
            // Update achievements
            this.renderAchievements();
            
            console.log('🎯 PersonalDashboardController: Dashboard UI updated successfully');
        } catch (error) {
            console.error('🎯 PersonalDashboardController: Error updating dashboard UI:', error);
            logger.error('PersonalDashboardController: Error updating dashboard UI', error);
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
            problemsSolvedElement.textContent = this.userStats.problemsSolved || 0;
        }
        
        const submissionsElement = document.getElementById('total-submissions-student');
        if (submissionsElement) {
            submissionsElement.textContent = this.userStats.submissions || 0;
        }
        
        const dayStreakElement = document.getElementById('day-streak-student');
        if (dayStreakElement) {
            dayStreakElement.textContent = this.userStats.streak || 0;
        }
        
        const skillRatingElement = document.getElementById('skill-rating-student');
        if (skillRatingElement) {
            skillRatingElement.textContent = this.userStats.skillRating || 0;
        }
        
        // Update page title
        if (this.userStats.firstName) {
            document.title = `${this.userStats.firstName}'s Dashboard - SkillPort`;
        }
        
        console.log('✅ PersonalDashboardController: User stats rendered:', {
            firstName: this.userStats.firstName,
            lastName: this.userStats.lastName,
            email: this.userStats.email,
            problemsSolved: this.userStats.problemsSolved,
            submissions: this.userStats.submissions,
            streak: this.userStats.streak,
            skillRating: this.userStats.skillRating
        });
    }

    renderTasks() {
        const container = document.getElementById('recent-tasks-list');
        if (!container) return;

        if (!this.tasks || this.tasks.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No tasks found</p>';
            return;
        }

        container.innerHTML = this.tasks.slice(0, 5).map(task => `
            <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 ${task.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center">
                    <i data-lucide="${task.status === 'completed' ? 'check-circle' : 'clock'}" class="w-4 h-4 ${task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${task.title || 'Untitled Task'}</p>
                    <p class="text-xs text-gray-500">${task.dueDate ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() : 'No due date'}</p>
                </div>
            </div>
        `).join('');

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    renderProjects() {
        const container = document.getElementById('recent-projects-list');
        if (!container) return;

        if (!this.projects || this.projects.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No projects found</p>';
            return;
        }

        container.innerHTML = this.projects.slice(0, 3).map(project => `
            <div class="project-card p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900">${project.title || 'Untitled Project'}</h4>
                    <span class="text-xs px-2 py-1 rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${project.status || 'active'}</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">${project.description || 'No description available'}</p>
                ${project.repoUrl ? `<a href="${project.repoUrl}" target="_blank" class="text-blue-600 text-xs hover:underline">View Repository</a>` : ''}
            </div>
        `).join('');
    }

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        if (!this.achievements || this.achievements.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No achievements found</p>';
            return;
        }

        container.innerHTML = this.achievements.map(achievement => `
            <div class="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i data-lucide="trophy" class="w-5 h-5 text-yellow-600"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-medium text-yellow-900">${achievement.title || 'Achievement'}</h4>
                    <p class="text-sm text-yellow-700">${achievement.description || 'No description available'}</p>
                    <p class="text-xs text-yellow-600">Earned: ${achievement.earnedAt ? new Date(achievement.earnedAt.seconds * 1000).toLocaleDateString() : 'Recently'}</p>
                </div>
                <i data-lucide="check-circle" class="w-5 h-5 text-yellow-600"></i>
            </div>
        `).join('');

        if (window.lucide) {
            window.lucide.createIcons();
        }
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

// Make PersonalDashboardController available globally
window.PersonalDashboardController = PersonalDashboardController;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.personalDashboardController = new PersonalDashboardController();
});
