import EnhancedPageController from './enhancedPageController.js';

class PersonalDashboardController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'personal';
    }

    async renderDashboardContent() {
        console.log('🎯 PersonalDashboardController: Rendering personal dashboard content...');
        
        try {
            // Load and render recent projects
            await this.renderRecentProjects();
            
            // Load and render recent tasks
            await this.renderRecentTasks();
            
            // Load and render achievements
            await this.renderAchievements();
            
            // Load and render communities
            await this.renderCommunities();
            
            // Setup real-time listeners
            this.setupRealTimeListeners();
            
            console.log('✅ PersonalDashboardController: Personal dashboard content rendered successfully');
            
        } catch (error) {
            console.error('❌ PersonalDashboardController: Error rendering dashboard content:', error);
            throw error;
        }
    }

    async renderRecentProjects() {
        try {
            const projects = await this.dataLoader.loadUserProjects(this.currentUser.uid, 5);
            this.updateProjectsUI(projects);
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showDefaultProjects();
        }
    }

    async renderRecentTasks() {
        try {
            const tasks = await this.dataLoader.loadUserTasks(this.currentUser.uid, 5);
            this.updateTasksUI(tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showDefaultTasks();
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

    async renderCommunities() {
        try {
            const communities = await this.dataLoader.loadUserCommunities(this.currentUser.uid);
            this.updateCommunitiesUI(communities);
        } catch (error) {
            console.error('Error loading communities:', error);
            this.showDefaultCommunities();
        }
    }

    updateProjectsUI(projects) {
        const container = document.getElementById('recent-projects-list');
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="folder-plus" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No projects yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Create your first project
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">${project.title}</h3>
                        <p class="text-sm text-gray-600 mt-1">${project.description || 'No description'}</p>
                        <div class="flex items-center mt-2">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: ${project.progress || 0}%"></div>
                            </div>
                            <span class="text-xs text-gray-500 ml-2">${project.progress || 0}%</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(project.status)}">
                            ${project.status || 'In Progress'}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }

    updateTasksUI(tasks) {
        const container = document.getElementById('recent-tasks-list');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="check-circle" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No recent tasks</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}">
                        <i data-lucide="${task.completed ? 'check' : 'circle'}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${task.title}</p>
                    <p class="text-xs text-gray-500">${task.difficulty || 'Medium'} • ${task.platform || 'General'}</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="text-xs text-gray-500">${this.formatDate(task.createdAt)}</span>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateAchievementsUI(achievements) {
        const container = document.getElementById('achievements-list');
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
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateCommunitiesUI(communities) {
        const container = document.getElementById('communities-list');
        if (!container) return;

        if (communities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Not joined any communities yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Explore communities
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = communities.map(community => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <i data-lucide="users" class="w-5 h-5 text-blue-600"></i>
                    </div>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${community.name}</p>
                    <p class="text-xs text-gray-500">${community.memberCount || 0} members</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${community.role || 'Member'}
                    </span>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    // Default/Error State Methods
    showDefaultProjects() {
        const container = document.getElementById('recent-projects-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="folder-plus" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Loading projects...</p>
                </div>
            `;
        }
    }

    showDefaultTasks() {
        const container = document.getElementById('recent-tasks-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading tasks...</p>
                </div>
            `;
        }
    }

    showDefaultAchievements() {
        const container = document.getElementById('achievements-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="award" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Loading achievements...</p>
                </div>
            `;
        }
    }

    showDefaultCommunities() {
        const container = document.getElementById('communities-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Loading communities...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('🎯 PersonalDashboardController: Setting up real-time listeners...');
        
        try {
            // Listen for user stats changes
            const statsListener = this.dataLoader.setupUserStatsListener(this.currentUser.uid, (stats) => {
                console.log('📊 Stats updated:', stats);
                this.renderUserStats();
            });
            this.realTimeListeners.push(statsListener);

            // Listen for projects changes
            const projectsListener = this.dataLoader.setupUserProjectsListener(this.currentUser.uid, (projects) => {
                console.log('📁 Projects updated:', projects);
                this.updateProjectsUI(projects);
            });
            this.realTimeListeners.push(projectsListener);

            console.log('✅ PersonalDashboardController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ PersonalDashboardController: Error setting up real-time listeners:', error);
        }
    }

    // Cleanup
    destroy() {
        console.log('🎯 PersonalDashboardController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PersonalDashboardController();
});

export default PersonalDashboardController;