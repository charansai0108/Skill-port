// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Global variables
let currentTasks = [];
let currentFilter = 'all';

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Load tasks from API
async function loadTasks() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            window.location.href = '../auth/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load tasks');
        }

        const data = await response.json();
        if (data.success) {
            currentTasks = data.data.tasks;
            updateTaskDisplay();
            loadTaskStats();
        }
    } catch (error) {
        console.error('Load tasks error:', error);
        showNotification('Failed to load tasks', 'error');
    }
}

// Load task statistics
async function loadTaskStats() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/tasks/stats/overview`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                updateStats(data.data.stats);
            }
        }
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

// Update statistics display
function updateStats(stats) {
    document.getElementById('totalTasks').textContent = stats.totalSubmissions || 0;
    document.getElementById('completedTasks').textContent = stats.status?.completed || 0;
    document.getElementById('inProgressTasks').textContent = stats.status?.in_progress || 0;
    document.getElementById('overdueTasks').textContent = stats.overdue || 0;
}

// Update task display
function updateTaskDisplay() {
    const taskList = document.getElementById('taskList');
    
    if (currentTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks yet</h3>
                <p>Start by adding your first task to track your progress</p>
                <button class="add-task-btn" onclick="openAddTaskModal()">Create First Task</button>
            </div>
        `;
        return;
    }

    // Filter tasks based on current filter
    let filteredTasks = currentTasks;
    if (currentFilter !== 'all') {
        if (currentFilter === 'overdue') {
            filteredTasks = currentTasks.filter(task => {
                if (!task.deadline || task.status === 'completed') return false;
                return new Date() > new Date(task.deadline);
            });
        } else {
            filteredTasks = currentTasks.filter(task => task.status === currentFilter);
        }
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <h3>No ${currentFilter.replace('_', ' ')} tasks</h3>
                <p>Try changing the filter or add new tasks</p>
            </div>
        `;
        return;
    }

    // Sort tasks by priority and deadline
    filteredTasks.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        return 0;
    });

    taskList.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
}

// Create task HTML
function createTaskHTML(task) {
    const isOverdue = task.deadline && new Date() > new Date(task.deadline) && task.status !== 'completed';
    const deadlineText = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline';
    
    return `
        <div class="task-item ${isOverdue ? 'overdue' : ''}" data-task-id="${task._id}">
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</div>
            </div>
            
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            
            <div class="task-meta">
                <div class="task-info">
                    <span>📅 ${deadlineText}</span>
                    <span>🏷️ ${task.category}</span>
                    ${task.progress > 0 ? `<span>📊 ${task.progress}%</span>` : ''}
                </div>
                
                <div class="task-actions">
                    ${task.status === 'todo' ? `<button class="action-btn btn-start" onclick="startTask('${task._id}')">Start</button>` : ''}
                    ${task.status === 'in_progress' ? `<button class="action-btn btn-complete" onclick="completeTask('${task._id}')">Complete</button>` : ''}
                    <button class="action-btn btn-edit" onclick="editTask('${task._id}')">Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteTask('${task._id}')">Delete</button>
                </div>
            </div>
        </div>
    `;
}

// Add new task
async function addTask(taskData) {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            showNotification('Please log in to add tasks', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Task added successfully!', 'success');
            document.getElementById('quickAddForm').reset();
            await loadTasks();
        } else {
            showNotification(data.message || 'Failed to add task', 'error');
        }
    } catch (error) {
        console.error('Add task error:', error);
        showNotification('Failed to add task', 'error');
    }
}

// Start task
async function startTask(taskId) {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/start`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Task started!', 'success');
            await loadTasks();
        }
    } catch (error) {
        console.error('Start task error:', error);
        showNotification('Failed to start task', 'error');
    }
}

// Complete task
async function completeTask(taskId) {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Task completed!', 'success');
            await loadTasks();
        }
    } catch (error) {
        console.error('Complete task error:', error);
        showNotification('Failed to complete task', 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('Task deleted successfully!', 'success');
            await loadTasks();
        }
    } catch (error) {
        console.error('Delete task error:', error);
        showNotification('Failed to delete task', 'error');
    }
}

// Edit task (placeholder for now)
function editTask(taskId) {
    showNotification('Edit functionality coming soon!', 'info');
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateTaskDisplay();
}

// Setup event listeners
function setupEventListeners() {
    // Quick add form
    document.getElementById('quickAddForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const taskData = {
            title: formData.get('taskTitle'),
            category: formData.get('taskCategory'),
            priority: formData.get('taskPriority'),
            deadline: formData.get('taskDeadline') || null,
            description: formData.get('taskDescription') || ''
        };
        
        addTask(taskData);
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterTasks(this.dataset.filter);
        });
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tasks page loaded');
    
    // Check authentication
    const token = localStorage.getItem('skillport_token');
    if (!token) {
        window.location.href = '../auth/login.html';
        return;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadTasks();
});
