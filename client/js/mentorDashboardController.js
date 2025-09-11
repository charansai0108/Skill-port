import EnhancedPageController from './enhancedPageController.js';

class MentorDashboardController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'mentor';
    }

    async renderDashboardContent() {
        console.log('👨‍🏫 MentorDashboardController: Rendering mentor dashboard content...');
        
        try {
            // Load and render mentor-specific content
            await this.renderMentorStats();
            await this.renderMentorStudents();
            await this.renderRecentSessions();
            await this.renderSessionRequests();
            await this.renderMentorResources();
            
            // Setup real-time listeners
            this.setupRealTimeListeners();
            
            console.log('✅ MentorDashboardController: Mentor dashboard content rendered successfully');
            
        } catch (error) {
            console.error('❌ MentorDashboardController: Error rendering dashboard content:', error);
            throw error;
        }
    }

    async renderMentorStats() {
        try {
            const stats = await this.dataLoader.loadMentorStats(this.currentUser.uid);
            this.updateMentorStatsUI(stats);
        } catch (error) {
            console.error('Error loading mentor stats:', error);
            this.showDefaultMentorStats();
        }
    }

    async renderMentorStudents() {
        try {
            const students = await this.dataLoader.loadMentorStudents(this.currentUser.uid);
            this.updateStudentsUI(students);
        } catch (error) {
            console.error('Error loading mentor students:', error);
            this.showDefaultStudents();
        }
    }

    async renderRecentSessions() {
        try {
            const sessions = await this.dataLoader.loadMentorSessions(this.currentUser.uid, 10);
            this.updateSessionsUI(sessions);
        } catch (error) {
            console.error('Error loading recent sessions:', error);
            this.showDefaultSessions();
        }
    }

    async renderSessionRequests() {
        try {
            const requests = await this.dataLoader.loadSessionRequests(this.currentUser.uid);
            this.updateSessionRequestsUI(requests);
        } catch (error) {
            console.error('Error loading session requests:', error);
            this.showDefaultSessionRequests();
        }
    }

    async renderMentorResources() {
        try {
            const resources = await this.dataLoader.loadMentorResources(this.currentUser.uid);
            this.updateResourcesUI(resources);
        } catch (error) {
            console.error('Error loading mentor resources:', error);
            this.showDefaultResources();
        }
    }

    updateMentorStatsUI(stats) {
        const statsElements = {
            'total-students': stats.totalStudents || 0,
            'active-students': stats.activeStudents || 0,
            'sessions-completed': stats.sessionsCompleted || 0,
            'average-rating': stats.averageRating ? stats.averageRating.toFixed(1) : '0.0',
            'total-hours': stats.totalHours || 0,
            'specialization': stats.specialization || 'General'
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateStudentsUI(students) {
        const container = document.getElementById('mentor-students-list');
        if (!container) return;

        if (students.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="user-plus" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No students assigned yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Accept student requests
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(student => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <img src="${student.profileImage || '/images/default-avatar.png'}" alt="${student.name}" class="w-10 h-10 rounded-full object-cover">
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${student.name}</p>
                    <p class="text-xs text-gray-500">${student.currentLevel || 'Beginner'} • ${student.specialization || 'General'}</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getStudentStatusColor(student.status)}">
                        ${student.status || 'Active'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    updateSessionsUI(sessions) {
        const container = document.getElementById('recent-sessions-list');
        if (!container) return;

        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="calendar" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No recent sessions</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Schedule a session
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = sessions.map(session => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${this.getSessionStatusColor(session.status)}">
                        <i data-lucide="${this.getSessionIcon(session.status)}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${session.studentName}</p>
                    <p class="text-xs text-gray-500">${session.topic} • ${session.duration} minutes</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="text-xs text-gray-500">${this.formatDate(session.scheduledAt)}</span>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateSessionRequestsUI(requests) {
        const container = document.getElementById('session-requests-list');
        if (!container) return;

        if (requests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="message-square" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No pending session requests</p>
                </div>
            `;
            return;
        }

        container.innerHTML = requests.map(request => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <img src="${request.studentProfileImage || '/images/default-avatar.png'}" alt="${request.studentName}" class="w-10 h-10 rounded-full object-cover">
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${request.studentName}</p>
                    <p class="text-xs text-gray-500">${request.topic} • ${request.preferredTime}</p>
                </div>
                <div class="flex-shrink-0 flex space-x-2">
                    <button class="text-green-600 hover:text-green-700 text-xs font-medium" onclick="acceptSessionRequest('${request.id}')">
                        Accept
                    </button>
                    <button class="text-red-600 hover:text-red-700 text-xs font-medium" onclick="declineSessionRequest('${request.id}')">
                        Decline
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateResourcesUI(resources) {
        const container = document.getElementById('mentor-resources-list');
        if (!container) return;

        if (resources.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="book" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No resources available</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Add resources
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = resources.map(resource => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <i data-lucide="${this.getResourceIcon(resource.type)}" class="w-5 h-5 text-blue-600"></i>
                    </div>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${resource.title}</p>
                    <p class="text-xs text-gray-500">${resource.type} • ${resource.downloadCount || 0} downloads</p>
                </div>
                <div class="flex-shrink-0">
                    <button class="text-blue-600 hover:text-blue-700 text-xs font-medium">
                        View
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    // Utility Methods
    getStudentStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'suspended': 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getSessionStatusColor(status) {
        const colors = {
            'completed': 'bg-green-100 text-green-600',
            'scheduled': 'bg-blue-100 text-blue-600',
            'cancelled': 'bg-red-100 text-red-600',
            'in-progress': 'bg-yellow-100 text-yellow-600'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
    }

    getSessionIcon(status) {
        const icons = {
            'completed': 'check-circle',
            'scheduled': 'calendar',
            'cancelled': 'x-circle',
            'in-progress': 'clock'
        };
        return icons[status?.toLowerCase()] || 'calendar';
    }

    getResourceIcon(type) {
        const icons = {
            'document': 'file-text',
            'video': 'play',
            'link': 'external-link',
            'image': 'image',
            'code': 'code'
        };
        return icons[type?.toLowerCase()] || 'file';
    }

    // Default/Error State Methods
    showDefaultMentorStats() {
        const defaultStats = {
            totalStudents: 0,
            activeStudents: 0,
            sessionsCompleted: 0,
            averageRating: 0,
            totalHours: 0,
            specialization: 'General'
        };
        this.updateMentorStatsUI(defaultStats);
    }

    showDefaultStudents() {
        const container = document.getElementById('mentor-students-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading students...</p>
                </div>
            `;
        }
    }

    showDefaultSessions() {
        const container = document.getElementById('recent-sessions-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading sessions...</p>
                </div>
            `;
        }
    }

    showDefaultSessionRequests() {
        const container = document.getElementById('session-requests-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading session requests...</p>
                </div>
            `;
        }
    }

    showDefaultResources() {
        const container = document.getElementById('mentor-resources-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading resources...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('👨‍🏫 MentorDashboardController: Setting up real-time listeners...');
        
        try {
            // Listen for mentor stats changes
            const statsListener = this.dataLoader.setupMentorStatsListener(this.currentUser.uid, (stats) => {
                console.log('📊 Mentor stats updated:', stats);
                this.updateMentorStatsUI(stats);
            });
            this.realTimeListeners.push(statsListener);

            // Listen for session requests changes
            const requestsListener = this.dataLoader.setupSessionRequestsListener(this.currentUser.uid, (requests) => {
                console.log('📝 Session requests updated:', requests);
                this.updateSessionRequestsUI(requests);
            });
            this.realTimeListeners.push(requestsListener);

            console.log('✅ MentorDashboardController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ MentorDashboardController: Error setting up real-time listeners:', error);
        }
    }

    // Cleanup
    destroy() {
        console.log('👨‍🏫 MentorDashboardController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MentorDashboardController();
});

export default MentorDashboardController;