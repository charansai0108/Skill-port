import EnhancedPageController from './enhancedPageController.js';

class PersonalProjectsController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'personal';
    }

    async renderDashboardContent() {
        console.log('📁 PersonalProjectsController: Rendering projects page content...');
        
        try {
            await this.renderProjectsList();
            await this.renderProjectStats();
            await this.renderProjectCategories();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ PersonalProjectsController: Projects page content rendered successfully');
            
        } catch (error) {
            console.error('❌ PersonalProjectsController: Error rendering projects content:', error);
            throw error;
        }
    }

    async renderProjectsList() {
        try {
            const projects = await this.dataLoader.loadUserProjects(this.currentUser.uid);
            this.updateProjectsListUI(projects);
        } catch (error) {
            console.error('Error loading projects list:', error);
            this.showDefaultProjectsList();
        }
    }

    async renderProjectStats() {
        try {
            const stats = await this.dataLoader.loadProjectStats(this.currentUser.uid);
            this.updateProjectStatsUI(stats);
        } catch (error) {
            console.error('Error loading project stats:', error);
            this.showDefaultProjectStats();
        }
    }

    async renderProjectCategories() {
        try {
            const categories = await this.dataLoader.loadProjectCategories(this.currentUser.uid);
            this.updateCategoriesUI(categories);
        } catch (error) {
            console.error('Error loading project categories:', error);
            this.showDefaultCategories();
        }
    }

    updateProjectsListUI(projects) {
        const container = document.getElementById('projects-list');
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="folder-plus" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No projects yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="showCreateProjectModal()">
                        Create your first project
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">${project.title}</h3>
                        <p class="text-gray-600 mb-3">${project.description || 'No description'}</p>
                        <div class="flex items-center space-x-4 text-sm text-gray-500">
                            <span class="flex items-center">
                                <i data-lucide="calendar" class="w-4 h-4 mr-1"></i>
                                ${this.formatDate(project.createdAt)}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="tag" class="w-4 h-4 mr-1"></i>
                                ${project.category || 'General'}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="clock" class="w-4 h-4 mr-1"></i>
                                ${project.estimatedHours || 0}h
                            </span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(project.status)}">
                            ${project.status || 'In Progress'}
                        </span>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>${project.progress || 0}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${project.progress || 0}%"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewProject('${project.id}')">
                            View
                        </button>
                        <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="editProject('${project.id}')">
                            Edit
                        </button>
                        <button class="text-red-600 hover:text-red-700 text-sm font-medium" onclick="deleteProject('${project.id}')">
                            Delete
                        </button>
                    </div>
                    <div class="text-xs text-gray-500">
                        Last updated: ${this.formatDate(project.updatedAt)}
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateProjectStatsUI(stats) {
        const statsElements = {
            'total-projects': stats.totalProjects || 0,
            'completed-projects': stats.completedProjects || 0,
            'in-progress-projects': stats.inProgressProjects || 0,
            'total-hours': stats.totalHours || 0,
            'average-completion-time': `${(stats.averageCompletionTime || 0).toFixed(1)} days`,
            'success-rate': `${(stats.successRate || 0).toFixed(1)}%`
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateCategoriesUI(categories) {
        const container = document.getElementById('project-categories');
        if (!container) return;

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 text-sm">No categories yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(category => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full" style="background-color: ${category.color || '#3b82f6'}"></div>
                    <span class="text-sm text-gray-900">${category.name}</span>
                </div>
                <span class="text-xs text-gray-500">${category.count} projects</span>
            </div>
        `).join('');
    }

    setupFormHandlers() {
        // Create project form
        const createForm = document.getElementById('create-project-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createProject();
            });
        }

        // Filter projects
        const filterSelect = document.getElementById('project-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterProjects(e.target.value);
            });
        }

        // Search projects
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProjects(e.target.value);
            });
        }
    }

    async createProject() {
        try {
            const formData = new FormData(document.getElementById('create-project-form'));
            const projectData = {
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                estimatedHours: parseInt(formData.get('estimatedHours')),
                status: 'In Progress',
                progress: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.firebaseService.createProject(this.currentUser.uid, projectData);
            this.showSuccessMessage('Project created successfully!');
            document.getElementById('create-project-form').reset();
            this.renderProjectsList(); // Refresh the list
            
        } catch (error) {
            console.error('Error creating project:', error);
            this.showErrorMessage('Failed to create project. Please try again.');
        }
    }

    async filterProjects(filter) {
        try {
            const projects = await this.dataLoader.loadUserProjects(this.currentUser.uid);
            let filteredProjects = projects;

            if (filter !== 'all') {
                filteredProjects = projects.filter(project => project.status === filter);
            }

            this.updateProjectsListUI(filteredProjects);
            
        } catch (error) {
            console.error('Error filtering projects:', error);
        }
    }

    async searchProjects(query) {
        try {
            const projects = await this.dataLoader.loadUserProjects(this.currentUser.uid);
            let filteredProjects = projects;

            if (query.trim()) {
                filteredProjects = projects.filter(project => 
                    project.title.toLowerCase().includes(query.toLowerCase()) ||
                    project.description.toLowerCase().includes(query.toLowerCase())
                );
            }

            this.updateProjectsListUI(filteredProjects);
            
        } catch (error) {
            console.error('Error searching projects:', error);
        }
    }

    getStatusColor(status) {
        const colors = {
            'completed': 'bg-green-100 text-green-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800',
            'on-hold': 'bg-gray-100 text-gray-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
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
    showDefaultProjectsList() {
        const container = document.getElementById('projects-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading projects...</p>
                </div>
            `;
        }
    }

    showDefaultProjectStats() {
        const defaultStats = {
            totalProjects: 0,
            completedProjects: 0,
            inProgressProjects: 0,
            totalHours: 0,
            averageCompletionTime: 0,
            successRate: 0
        };
        this.updateProjectStatsUI(defaultStats);
    }

    showDefaultCategories() {
        const container = document.getElementById('project-categories');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i data-lucide="loader" class="w-4 h-4 text-gray-400 mx-auto mb-2 animate-spin"></i>
                    <p class="text-gray-500 text-sm">Loading categories...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('📁 PersonalProjectsController: Setting up real-time listeners...');
        
        try {
            const projectsListener = this.dataLoader.setupUserProjectsListener(this.currentUser.uid, (projects) => {
                console.log('📁 Projects updated:', projects);
                this.updateProjectsListUI(projects);
            });
            this.realTimeListeners.push(projectsListener);

            console.log('✅ PersonalProjectsController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ PersonalProjectsController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('📁 PersonalProjectsController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PersonalProjectsController();
});

export default PersonalProjectsController;