/**
 * Personal Projects Controller
 * Handles personal project management for individual users
 */
import firebaseService from './firebaseService.js';
import logger from './logger.js';
import PageController from './pageController.js';

class PersonalProjectsController extends PageController {
    constructor() {
        super();
        this.projects = [];
        this.currentProject = null;
    }

    async init() {
        console.log('📁 PersonalProjectsController: Initializing...');
        await super.init();
        
        if (!this.isAuthenticated) {
            console.log('📁 PersonalProjectsController: User not authenticated, redirecting to login');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        await this.loadProjects();
        this.setupEventListeners();
        console.log('📁 PersonalProjectsController: Initialization complete');
    }

    async loadProjects() {
        try {
            this.showLoading();
            
            // Get current user
            const user = window.authManager.currentUser;
            if (!user) {
                throw new Error('No authenticated user found');
            }

            // Load projects from Firestore
            this.projects = await firebaseService.getUserProjects(user.uid);
            this.renderProjects();
            
            this.hideLoading();
        } catch (error) {
            console.error('📁 PersonalProjectsController: Error loading projects:', error);
            logger.error('PersonalProjectsController: Error loading projects', error);
            this.hideLoading();
            this.showError('Failed to load projects');
        }
    }

    renderProjects() {
        const container = document.getElementById('projects-list');
        if (!container) return;

        if (this.projects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="folder-plus" class="w-8 h-8 text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p class="text-gray-500 mb-4">Start building your portfolio by creating your first project</p>
                    <button onclick="window.personalProjectsController.showCreateProjectModal()" 
                            class="btn-primary px-4 py-2 rounded-lg text-white">
                        Create Project
                    </button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = this.projects.map(project => `
            <div class="project-card p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                 onclick="window.personalProjectsController.viewProject('${project.id}')">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">${project.title}</h3>
                        <p class="text-gray-600 text-sm mb-3">${project.description || 'No description provided'}</p>
                        <div class="flex items-center space-x-4 text-sm text-gray-500">
                            <span class="flex items-center">
                                <i data-lucide="calendar" class="w-4 h-4 mr-1"></i>
                                ${window.uiHelpers.formatDateTime(project.createdAt)}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="tag" class="w-4 h-4 mr-1"></i>
                                ${project.category || 'General'}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="git-branch" class="w-4 h-4 mr-1"></i>
                                ${project.status || 'In Progress'}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="event.stopPropagation(); window.personalProjectsController.editProject('${project.id}')"
                                class="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.personalProjectsController.deleteProject('${project.id}')"
                                class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        ${project.technologies ? project.technologies.map(tech => `
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${tech}</span>
                        `).join('') : ''}
                    </div>
                    <div class="flex items-center space-x-2">
                        ${project.githubUrl ? `
                            <a href="${project.githubUrl}" target="_blank" 
                               onclick="event.stopPropagation()"
                               class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <i data-lucide="github" class="w-4 h-4"></i>
                            </a>
                        ` : ''}
                        ${project.liveUrl ? `
                            <a href="${project.liveUrl}" target="_blank" 
                               onclick="event.stopPropagation()"
                               class="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <i data-lucide="external-link" class="w-4 h-4"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    setupEventListeners() {
        // Create project button
        const createBtn = document.getElementById('create-project-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateProjectModal());
        }

        // Search functionality
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterProjects(e.target.value));
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByCategory(e.target.dataset.category));
        });
    }

    showCreateProjectModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="create-project-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Create New Project</h3>
                        <button onclick="window.personalProjectsController.hideCreateProjectModal()"
                                class="text-gray-400 hover:text-gray-600">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <form id="create-project-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                            <input type="text" name="title" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" rows="3"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select name="category"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="Web Development">Web Development</option>
                                    <option value="Mobile App">Mobile App</option>
                                    <option value="Desktop App">Desktop App</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Machine Learning">Machine Learning</option>
                                    <option value="Game Development">Game Development</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="Planning">Planning</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="On Hold">On Hold</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Technologies (comma-separated)</label>
                            <input type="text" name="technologies" placeholder="React, Node.js, MongoDB"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                                <input type="url" name="githubUrl"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
                                <input type="url" name="liveUrl"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" onclick="window.personalProjectsController.hideCreateProjectModal()"
                                    class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                Cancel
                            </button>
                            <button type="submit"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        lucide.createIcons();

        // Add form submit handler
        document.getElementById('create-project-form').addEventListener('submit', (e) => this.handleCreateProject(e));
    }

    hideCreateProjectModal() {
        const modal = document.getElementById('create-project-modal');
        if (modal) {
            modal.remove();
        }
    }

    async handleCreateProject(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            status: formData.get('status'),
            technologies: formData.get('technologies').split(',').map(t => t.trim()).filter(t => t),
            githubUrl: formData.get('githubUrl'),
            liveUrl: formData.get('liveUrl')
        };

        try {
            const response = await window.APIService.createProject(projectData);
            if (response.success) {
                this.projects.unshift(response.data.project);
                this.renderProjects();
                this.hideCreateProjectModal();
                this.showSuccess('Project created successfully');
            } else {
                this.showError('Failed to create project');
            }
        } catch (error) {
            console.error('📁 PersonalProjectsController: Error creating project:', error);
            this.showError('Failed to create project');
        }
    }

    async editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        // Similar to create modal but with pre-filled data
        console.log('📁 PersonalProjectsController: Edit project', projectId);
        // Implementation would be similar to create modal
    }

    async deleteProject(projectId) {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await window.APIService.deleteProject(projectId);
            if (response.success) {
                this.projects = this.projects.filter(p => p.id !== projectId);
                this.renderProjects();
                this.showSuccess('Project deleted successfully');
            } else {
                this.showError('Failed to delete project');
            }
        } catch (error) {
            console.error('📁 PersonalProjectsController: Error deleting project:', error);
            this.showError('Failed to delete project');
        }
    }

    viewProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        // Navigate to project detail view or show in modal
        console.log('📁 PersonalProjectsController: View project', projectId);
    }

    filterProjects(searchTerm) {
        const filteredProjects = this.projects.filter(project =>
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.technologies && project.technologies.some(tech => 
                tech.toLowerCase().includes(searchTerm.toLowerCase())
            ))
        );
        
        this.renderFilteredProjects(filteredProjects);
    }

    filterByCategory(category) {
        if (category === 'all') {
            this.renderProjects();
            return;
        }
        
        const filteredProjects = this.projects.filter(project => project.category === category);
        this.renderFilteredProjects(filteredProjects);
    }

    renderFilteredProjects(projects) {
        const container = document.getElementById('projects-list');
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="search" class="w-8 h-8 text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p class="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Use the same rendering logic as renderProjects but with filtered data
        const originalProjects = this.projects;
        this.projects = projects;
        this.renderProjects();
        this.projects = originalProjects;
    }

    showLoading() {
        const container = document.getElementById('projects-list');
        if (container) {
            container.innerHTML = `
                <div class="space-y-4">
                    ${Array(3).fill().map(() => `
                        <div class="p-6 rounded-lg border border-gray-200 animate-pulse">
                            <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading is handled by renderProjects
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

// Make PersonalProjectsController available globally
window.PersonalProjectsController = PersonalProjectsController;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.personalProjectsController = new PersonalProjectsController();
});
