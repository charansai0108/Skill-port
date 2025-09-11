import EnhancedPageController from './enhancedPageController.js';

class PersonalTrackerController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'personal';
    }

    async renderDashboardContent() {
        console.log('📋 PersonalTrackerController: Rendering tracker page content...');
        
        try {
            await this.renderTasksList();
            await this.renderTaskStats();
            await this.renderTaskCategories();
            await this.renderTaskCalendar();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ PersonalTrackerController: Tracker page content rendered successfully');
            
        } catch (error) {
            console.error('❌ PersonalTrackerController: Error rendering tracker content:', error);
            throw error;
        }
    }

    async renderTasksList() {
        try {
            const tasks = await this.dataLoader.loadUserTasks(this.currentUser.uid);
            this.updateTasksListUI(tasks);
        } catch (error) {
            console.error('Error loading tasks list:', error);
            this.showDefaultTasksList();
        }
    }

    async renderTaskStats() {
        try {
            const stats = await this.dataLoader.loadTaskStats(this.currentUser.uid);
            this.updateTaskStatsUI(stats);
        } catch (error) {
            console.error('Error loading task stats:', error);
            this.showDefaultTaskStats();
        }
    }

    async renderTaskCategories() {
        try {
            const categories = await this.dataLoader.loadTaskCategories(this.currentUser.uid);
            this.updateCategoriesUI(categories);
        } catch (error) {
            console.error('Error loading task categories:', error);
            this.showDefaultCategories();
        }
    }

    async renderTaskCalendar() {
        try {
            const calendarData = await this.dataLoader.loadTaskCalendar(this.currentUser.uid);
            this.renderCalendar(calendarData);
        } catch (error) {
            console.error('Error loading task calendar:', error);
            this.showDefaultCalendar();
        }
    }

    updateTasksListUI(tasks) {
        const container = document.getElementById('tasks-list');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="check-square" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No tasks yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="showCreateTaskModal()">
                        Create your first task
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 mt-1">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                               class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                               onchange="toggleTask('${task.id}', this.checked)">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <h3 class="text-sm font-medium text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}">
                                ${task.title}
                            </h3>
                            <div class="flex items-center space-x-2">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getPriorityColor(task.priority)}">
                                    ${task.priority || 'Medium'}
                                </span>
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(task.status)}">
                                    ${task.status || 'Pending'}
                                </span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">${task.description || 'No description'}</p>
                        <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span class="flex items-center">
                                <i data-lucide="calendar" class="w-3 h-3 mr-1"></i>
                                ${this.formatDate(task.dueDate)}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="tag" class="w-3 h-3 mr-1"></i>
                                ${task.category || 'General'}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                                ${task.estimatedTime || 0} min
                            </span>
                        </div>
                    </div>
                    <div class="flex-shrink-0 flex items-center space-x-1">
                        <button class="text-blue-600 hover:text-blue-700 text-xs font-medium" onclick="editTask('${task.id}')">
                            Edit
                        </button>
                        <button class="text-red-600 hover:text-red-700 text-xs font-medium" onclick="deleteTask('${task.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateTaskStatsUI(stats) {
        const statsElements = {
            'total-tasks': stats.totalTasks || 0,
            'completed-tasks': stats.completedTasks || 0,
            'pending-tasks': stats.pendingTasks || 0,
            'overdue-tasks': stats.overdueTasks || 0,
            'completion-rate': `${(stats.completionRate || 0).toFixed(1)}%`,
            'average-completion-time': `${(stats.averageCompletionTime || 0).toFixed(1)} min`
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateCategoriesUI(categories) {
        const container = document.getElementById('task-categories');
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
                <span class="text-xs text-gray-500">${category.count} tasks</span>
            </div>
        `).join('');
    }

    renderCalendar(calendarData) {
        // Implementation for calendar view
        console.log('📅 Rendering task calendar:', calendarData);
    }

    setupFormHandlers() {
        // Create task form
        const createForm = document.getElementById('create-task-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createTask();
            });
        }

        // Filter tasks
        const filterSelect = document.getElementById('task-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterTasks(e.target.value);
            });
        }

        // Search tasks
        const searchInput = document.getElementById('task-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTasks(e.target.value);
            });
        }
    }

    async createTask() {
        try {
            const formData = new FormData(document.getElementById('create-task-form'));
            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                priority: formData.get('priority'),
                dueDate: formData.get('dueDate'),
                estimatedTime: parseInt(formData.get('estimatedTime')),
                status: 'Pending',
                completed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.firebaseService.createTask(this.currentUser.uid, taskData);
            this.showSuccessMessage('Task created successfully!');
            document.getElementById('create-task-form').reset();
            this.renderTasksList(); // Refresh the list
            
        } catch (error) {
            console.error('Error creating task:', error);
            this.showErrorMessage('Failed to create task. Please try again.');
        }
    }

    async toggleTask(taskId, completed) {
        try {
            await this.firebaseService.updateTask(this.currentUser.uid, taskId, { 
                completed: completed,
                status: completed ? 'Completed' : 'Pending',
                updatedAt: new Date()
            });
            
            this.showSuccessMessage(completed ? 'Task completed!' : 'Task marked as pending');
            this.renderTasksList(); // Refresh the list
            
        } catch (error) {
            console.error('Error toggling task:', error);
            this.showErrorMessage('Failed to update task. Please try again.');
        }
    }

    async filterTasks(filter) {
        try {
            const tasks = await this.dataLoader.loadUserTasks(this.currentUser.uid);
            let filteredTasks = tasks;

            if (filter !== 'all') {
                filteredTasks = tasks.filter(task => task.status === filter);
            }

            this.updateTasksListUI(filteredTasks);
            
        } catch (error) {
            console.error('Error filtering tasks:', error);
        }
    }

    async searchTasks(query) {
        try {
            const tasks = await this.dataLoader.loadUserTasks(this.currentUser.uid);
            let filteredTasks = tasks;

            if (query.trim()) {
                filteredTasks = tasks.filter(task => 
                    task.title.toLowerCase().includes(query.toLowerCase()) ||
                    task.description.toLowerCase().includes(query.toLowerCase())
                );
            }

            this.updateTasksListUI(filteredTasks);
            
        } catch (error) {
            console.error('Error searching tasks:', error);
        }
    }

    getPriorityColor(priority) {
        const colors = {
            'high': 'bg-red-100 text-red-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'low': 'bg-green-100 text-green-800'
        };
        return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getStatusColor(status) {
        const colors = {
            'completed': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'cancelled': 'bg-red-100 text-red-800'
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
    showDefaultTasksList() {
        const container = document.getElementById('tasks-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading tasks...</p>
                </div>
            `;
        }
    }

    showDefaultTaskStats() {
        const defaultStats = {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            overdueTasks: 0,
            completionRate: 0,
            averageCompletionTime: 0
        };
        this.updateTaskStatsUI(defaultStats);
    }

    showDefaultCategories() {
        const container = document.getElementById('task-categories');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i data-lucide="loader" class="w-4 h-4 text-gray-400 mx-auto mb-2 animate-spin"></i>
                    <p class="text-gray-500 text-sm">Loading categories...</p>
                </div>
            `;
        }
    }

    showDefaultCalendar() {
        console.log('📅 Showing default calendar');
    }

    setupRealTimeListeners() {
        console.log('📋 PersonalTrackerController: Setting up real-time listeners...');
        
        try {
            const tasksListener = this.dataLoader.setupUserTasksListener(this.currentUser.uid, (tasks) => {
                console.log('📋 Tasks updated:', tasks);
                this.updateTasksListUI(tasks);
            });
            this.realTimeListeners.push(tasksListener);

            console.log('✅ PersonalTrackerController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ PersonalTrackerController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('📋 PersonalTrackerController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PersonalTrackerController();
});

export default PersonalTrackerController;