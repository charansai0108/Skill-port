import EnhancedPageController from './enhancedPageController.js';

class StudentLearningController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'student';
    }

    async renderDashboardContent() {
        console.log('📚 StudentLearningController: Rendering learning content...');
        
        try {
            await this.renderLearningProgress();
            await this.renderCourses();
            await this.renderLearningMaterials();
            await this.renderLearningGoals();
            await this.renderStudyPlan();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ StudentLearningController: Learning content rendered successfully');
            
        } catch (error) {
            console.error('❌ StudentLearningController: Error rendering learning content:', error);
            throw error;
        }
    }

    async renderLearningProgress() {
        try {
            const progress = await this.dataLoader.loadLearningProgress(this.currentUser.uid);
            this.updateLearningProgressUI(progress);
        } catch (error) {
            console.error('Error loading learning progress:', error);
            this.showDefaultLearningProgress();
        }
    }

    async renderCourses() {
        try {
            const courses = await this.dataLoader.loadStudentCourses(this.currentUser.uid);
            this.updateCoursesUI(courses);
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showDefaultCourses();
        }
    }

    async renderLearningMaterials() {
        try {
            const materials = await this.dataLoader.loadLearningMaterials(this.currentUser.uid);
            this.updateMaterialsUI(materials);
        } catch (error) {
            console.error('Error loading learning materials:', error);
            this.showDefaultMaterials();
        }
    }

    async renderLearningGoals() {
        try {
            const goals = await this.dataLoader.loadLearningGoals(this.currentUser.uid);
            this.updateLearningGoalsUI(goals);
        } catch (error) {
            console.error('Error loading learning goals:', error);
            this.showDefaultLearningGoals();
        }
    }

    async renderStudyPlan() {
        try {
            const studyPlan = await this.dataLoader.loadStudyPlan(this.currentUser.uid);
            this.updateStudyPlanUI(studyPlan);
        } catch (error) {
            console.error('Error loading study plan:', error);
            this.showDefaultStudyPlan();
        }
    }

    updateLearningProgressUI(progress) {
        const container = document.getElementById('learning-progress-list');
        if (!container) return;

        if (progress.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="book-open" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No learning progress yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="startLearning()">
                        Start learning
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = progress.map(topic => `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i data-lucide="${this.getTopicIcon(topic.category)}" class="w-5 h-5 text-blue-600"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900">${topic.name}</h3>
                            <p class="text-sm text-gray-500">${topic.category}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium text-gray-900">${topic.progress}%</div>
                        <div class="text-xs text-gray-500">${topic.completedLessons}/${topic.totalLessons} lessons</div>
                    </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${topic.progress}%"></div>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>Last studied: ${this.formatDate(topic.lastStudied)}</span>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700" onclick="continueTopic('${topic.id}')">
                            Continue
                        </button>
                        <button class="text-green-600 hover:text-green-700" onclick="reviewTopic('${topic.id}')">
                            Review
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateCoursesUI(courses) {
        const container = document.getElementById('courses-list');
        if (!container) return;

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="graduation-cap" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No courses enrolled yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="browseCourses()">
                        Browse courses
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = courses.map(course => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 mb-1">${course.title}</h3>
                        <p class="text-sm text-gray-600 mb-2">${course.description}</p>
                        <div class="flex items-center space-x-4 text-xs text-gray-500">
                            <span class="flex items-center">
                                <i data-lucide="user" class="w-3 h-3 mr-1"></i>
                                ${course.instructor}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                                ${course.duration} hours
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="star" class="w-3 h-3 mr-1"></i>
                                ${course.rating}
                            </span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getCourseStatusColor(course.status)}">
                            ${course.status}
                        </span>
                    </div>
                </div>
                
                <div class="mb-3">
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>${course.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-green-600 h-2 rounded-full" style="width: ${course.progress}%"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        ${course.completedModules}/${course.totalModules} modules completed
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="continueCourse('${course.id}')">
                            Continue
                        </button>
                        <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="viewCourse('${course.id}')">
                            View
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateMaterialsUI(materials) {
        const container = document.getElementById('materials-list');
        if (!container) return;

        if (materials.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="file-text" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No learning materials available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = materials.map(material => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <i data-lucide="${this.getMaterialIcon(material.type)}" class="w-5 h-5 text-purple-600"></i>
                    </div>
                </div>
                <div class="ml-3 flex-1">
                    <h3 class="text-sm font-medium text-gray-900">${material.title}</h3>
                    <p class="text-xs text-gray-500">${material.type} • ${material.duration || 'N/A'}</p>
                </div>
                <div class="flex-shrink-0 flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getMaterialStatusColor(material.status)}">
                        ${material.status}
                    </span>
                    <button class="text-blue-600 hover:text-blue-700 text-xs font-medium" onclick="accessMaterial('${material.id}')">
                        Access
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateLearningGoalsUI(goals) {
        const container = document.getElementById('learning-goals-list');
        if (!container) return;

        if (goals.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="target" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No learning goals set yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="setLearningGoal()">
                        Set a goal
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">${goal.title}</h3>
                        <p class="text-sm text-gray-600 mt-1">${goal.description}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getGoalStatusColor(goal.status)}">
                        ${goal.status}
                    </span>
                </div>
                <div class="mb-3">
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>${goal.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${goal.progress}%"></div>
                    </div>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>Target: ${this.formatDate(goal.targetDate)}</span>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700" onclick="editGoal('${goal.id}')">Edit</button>
                        <button class="text-red-600 hover:text-red-700" onclick="deleteGoal('${goal.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStudyPlanUI(studyPlan) {
        const container = document.getElementById('study-plan');
        if (!container) return;

        if (!studyPlan || !studyPlan.schedule) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="calendar" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No study plan created yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="createStudyPlan()">
                        Create study plan
                    </button>
                </div>
            `;
            return;
        }

        const today = new Date();
        const todaySchedule = studyPlan.schedule[today.toISOString().split('T')[0]];

        if (!todaySchedule) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="calendar" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No study session scheduled for today</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="scheduleStudy()">
                        Schedule study session
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Today's Study Plan</h3>
                <div class="space-y-3">
                    ${todaySchedule.map(session => `
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <i data-lucide="${this.getSessionIcon(session.type)}" class="w-4 h-4 text-blue-600"></i>
                                </div>
                            </div>
                            <div class="ml-3 flex-1">
                                <h4 class="text-sm font-medium text-gray-900">${session.title}</h4>
                                <p class="text-xs text-gray-500">${session.duration} minutes • ${session.topic}</p>
                            </div>
                            <div class="flex-shrink-0">
                                <span class="text-xs text-gray-500">${session.time}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-4 flex space-x-2">
                    <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="startStudySession()">
                        Start Study Session
                    </button>
                    <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="modifyStudyPlan()">
                        Modify Plan
                    </button>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    setupFormHandlers() {
        // Learning goal form
        const goalForm = document.getElementById('learning-goal-form');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addLearningGoal();
            });
        }

        // Study plan form
        const studyPlanForm = document.getElementById('study-plan-form');
        if (studyPlanForm) {
            studyPlanForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createStudyPlan();
            });
        }

        // Filter courses
        const filterSelect = document.getElementById('course-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterCourses(e.target.value);
            });
        }
    }

    async addLearningGoal() {
        try {
            const formData = new FormData(document.getElementById('learning-goal-form'));
            const goalData = {
                title: formData.get('title'),
                description: formData.get('description'),
                targetDate: formData.get('targetDate'),
                priority: formData.get('priority'),
                category: formData.get('category'),
                status: 'Active',
                progress: 0,
                createdAt: new Date()
            };

            await this.firebaseService.addLearningGoal(this.currentUser.uid, goalData);
            this.showSuccessMessage('Learning goal added successfully!');
            document.getElementById('learning-goal-form').reset();
            this.renderLearningGoals(); // Refresh the list
            
        } catch (error) {
            console.error('Error adding learning goal:', error);
            this.showErrorMessage('Failed to add learning goal. Please try again.');
        }
    }

    async createStudyPlan() {
        try {
            const formData = new FormData(document.getElementById('study-plan-form'));
            const studyPlanData = {
                name: formData.get('name'),
                duration: parseInt(formData.get('duration')),
                topics: formData.get('topics').split(',').map(t => t.trim()),
                schedule: this.generateSchedule(formData),
                createdAt: new Date()
            };

            await this.firebaseService.createStudyPlan(this.currentUser.uid, studyPlanData);
            this.showSuccessMessage('Study plan created successfully!');
            document.getElementById('study-plan-form').reset();
            this.renderStudyPlan(); // Refresh the plan
            
        } catch (error) {
            console.error('Error creating study plan:', error);
            this.showErrorMessage('Failed to create study plan. Please try again.');
        }
    }

    generateSchedule(formData) {
        // Generate a study schedule based on form data
        const schedule = {};
        const startDate = new Date(formData.get('startDate'));
        const duration = parseInt(formData.get('duration'));
        
        for (let i = 0; i < duration; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            
            schedule[dateKey] = [
                {
                    time: '09:00',
                    title: 'Morning Study Session',
                    duration: 60,
                    type: 'study',
                    topic: 'Core Concepts'
                },
                {
                    time: '14:00',
                    title: 'Practice Session',
                    duration: 45,
                    type: 'practice',
                    topic: 'Problem Solving'
                }
            ];
        }
        
        return schedule;
    }

    async filterCourses(filter) {
        try {
            const courses = await this.dataLoader.loadStudentCourses(this.currentUser.uid);
            let filteredCourses = courses;

            if (filter !== 'all') {
                filteredCourses = courses.filter(course => course.status === filter);
            }

            this.updateCoursesUI(filteredCourses);
            
        } catch (error) {
            console.error('Error filtering courses:', error);
        }
    }

    // Utility methods
    getTopicIcon(category) {
        const icons = {
            'programming': 'code',
            'algorithms': 'cpu',
            'data-structures': 'database',
            'web-development': 'globe',
            'mobile-development': 'smartphone',
            'databases': 'server',
            'networking': 'network'
        };
        return icons[category?.toLowerCase()] || 'book';
    }

    getCourseStatusColor(status) {
        const colors = {
            'enrolled': 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'paused': 'bg-gray-100 text-gray-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getMaterialIcon(type) {
        const icons = {
            'video': 'play',
            'document': 'file-text',
            'quiz': 'help-circle',
            'assignment': 'clipboard',
            'book': 'book-open'
        };
        return icons[type?.toLowerCase()] || 'file';
    }

    getMaterialStatusColor(status) {
        const colors = {
            'completed': 'bg-green-100 text-green-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'not-started': 'bg-gray-100 text-gray-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getGoalStatusColor(status) {
        const colors = {
            'active': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'paused': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getSessionIcon(type) {
        const icons = {
            'study': 'book-open',
            'practice': 'code',
            'review': 'refresh-cw',
            'quiz': 'help-circle'
        };
        return icons[type?.toLowerCase()] || 'book';
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
    showDefaultLearningProgress() {
        const container = document.getElementById('learning-progress-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading learning progress...</p>
                </div>
            `;
        }
    }

    showDefaultCourses() {
        const container = document.getElementById('courses-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading courses...</p>
                </div>
            `;
        }
    }

    showDefaultMaterials() {
        const container = document.getElementById('materials-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading materials...</p>
                </div>
            `;
        }
    }

    showDefaultLearningGoals() {
        const container = document.getElementById('learning-goals-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading learning goals...</p>
                </div>
            `;
        }
    }

    showDefaultStudyPlan() {
        const container = document.getElementById('study-plan');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading study plan...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('📚 StudentLearningController: Setting up real-time listeners...');
        
        try {
            const progressListener = this.dataLoader.setupLearningProgressListener(this.currentUser.uid, (progress) => {
                console.log('📚 Learning progress updated:', progress);
                this.updateLearningProgressUI(progress);
            });
            this.realTimeListeners.push(progressListener);

            console.log('✅ StudentLearningController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ StudentLearningController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('📚 StudentLearningController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudentLearningController();
});

export default StudentLearningController;
