import EnhancedPageController from './enhancedPageController.js';

class MentorSessionsController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'mentor';
    }

    async renderDashboardContent() {
        console.log('📅 MentorSessionsController: Rendering sessions content...');
        
        try {
            await this.renderSessionsList();
            await this.renderSessionStats();
            await this.renderSessionRequests();
            await this.renderSessionCalendar();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ MentorSessionsController: Sessions content rendered successfully');
            
        } catch (error) {
            console.error('❌ MentorSessionsController: Error rendering sessions content:', error);
            throw error;
        }
    }

    async renderSessionsList() {
        try {
            const sessions = await this.dataLoader.loadMentorSessions(this.currentUser.uid);
            this.updateSessionsListUI(sessions);
        } catch (error) {
            console.error('Error loading sessions list:', error);
            this.showDefaultSessionsList();
        }
    }

    async renderSessionStats() {
        try {
            const stats = await this.dataLoader.loadSessionStats(this.currentUser.uid);
            this.updateSessionStatsUI(stats);
        } catch (error) {
            console.error('Error loading session stats:', error);
            this.showDefaultSessionStats();
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

    async renderSessionCalendar() {
        try {
            const calendarData = await this.dataLoader.loadSessionCalendar(this.currentUser.uid);
            this.renderCalendar(calendarData);
        } catch (error) {
            console.error('Error loading session calendar:', error);
            this.showDefaultCalendar();
        }
    }

    updateSessionsListUI(sessions) {
        const container = document.getElementById('sessions-list');
        if (!container) return;

        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="calendar" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No sessions scheduled yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="scheduleNewSession()">
                        Schedule your first session
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = sessions.map(session => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h3 class="text-lg font-semibold text-gray-900">${session.title}</h3>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getSessionStatusColor(session.status)}">
                                ${session.status}
                            </span>
                        </div>
                        <div class="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <span class="flex items-center">
                                <i data-lucide="user" class="w-3 h-3 mr-1"></i>
                                ${session.studentName}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                                ${session.duration} minutes
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="calendar" class="w-3 h-3 mr-1"></i>
                                ${this.formatDateTime(session.scheduledAt)}
                            </span>
                        </div>
                        <p class="text-sm text-gray-600">${session.description || 'No description provided'}</p>
                    </div>
                    <div class="flex-shrink-0 text-right">
                        <div class="text-sm text-gray-500">${this.formatDate(session.scheduledAt)}</div>
                        <div class="text-xs text-gray-400">${this.formatTime(session.scheduledAt)}</div>
                    </div>
                </div>
                
                ${session.status === 'Completed' ? `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center text-green-800">
                                <i data-lucide="check-circle" class="w-4 h-4 mr-2"></i>
                                <span class="text-sm font-medium">Session Completed</span>
                            </div>
                            <div class="text-sm text-green-700">
                                Rating: ${session.studentRating || 'Not rated'} ⭐
                            </div>
                        </div>
                        ${session.notes ? `
                            <p class="text-xs text-green-600 mt-2">${session.notes}</p>
                        ` : ''}
                    </div>
                ` : session.status === 'Cancelled' ? `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <div class="flex items-center text-red-800">
                            <i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>
                            <span class="text-sm font-medium">Session Cancelled</span>
                        </div>
                        ${session.cancellationReason ? `
                            <p class="text-xs text-red-600 mt-2">Reason: ${session.cancellationReason}</p>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        ${session.type || 'General Session'} • ${session.platform || 'Video Call'}
                    </div>
                    <div class="flex space-x-2">
                        ${session.status === 'Scheduled' ? `
                            <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="startSession('${session.id}')">
                                Start Session
                            </button>
                            <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="editSession('${session.id}')">
                                Edit
                            </button>
                            <button class="text-red-600 hover:text-red-700 text-sm font-medium" onclick="cancelSession('${session.id}')">
                                Cancel
                            </button>
                        ` : session.status === 'Completed' ? `
                            <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewSessionDetails('${session.id}')">
                                View Details
                            </button>
                            <button class="text-purple-600 hover:text-purple-700 text-sm font-medium" onclick="scheduleFollowUp('${session.id}')">
                                Schedule Follow-up
                            </button>
                        ` : `
                            <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewSessionDetails('${session.id}')">
                                View Details
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateSessionStatsUI(stats) {
        const statsElements = {
            'total-sessions': stats.totalSessions || 0,
            'completed-sessions': stats.completedSessions || 0,
            'upcoming-sessions': stats.upcomingSessions || 0,
            'cancelled-sessions': stats.cancelledSessions || 0,
            'average-rating': stats.averageRating ? stats.averageRating.toFixed(1) : '0.0',
            'total-hours': stats.totalHours || 0,
            'this-month-sessions': stats.thisMonthSessions || 0,
            'completion-rate': `${(stats.completionRate || 0).toFixed(1)}%`
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateSessionRequestsUI(requests) {
        const container = document.getElementById('session-requests-list');
        if (!container) return;

        if (requests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="message-square" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No session requests</p>
                    <p class="text-sm text-gray-400 mt-2">Student session requests will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = requests.map(request => `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-start space-x-3 mb-3">
                    <img src="${request.studentProfileImage || '/images/default-avatar.png'}" 
                         alt="${request.studentName}" class="w-10 h-10 rounded-full object-cover">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">${request.studentName}</h3>
                        <p class="text-sm text-gray-600">${request.topic}</p>
                        <p class="text-xs text-gray-500">${request.preferredTime} • ${request.duration} minutes</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">${this.formatDate(request.requestedAt)}</div>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                        </span>
                    </div>
                </div>
                
                <div class="mb-3">
                    <p class="text-sm text-gray-700">${request.message || 'No message provided'}</p>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        Requested: ${this.formatDate(request.requestedAt)}
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="acceptSessionRequest('${request.id}')">
                            Accept
                        </button>
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewSessionRequest('${request.id}')">
                            View Details
                        </button>
                        <button class="text-red-600 hover:text-red-700 text-sm font-medium" onclick="declineSessionRequest('${request.id}')">
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCalendar(calendarData) {
        // Implementation for calendar view
        console.log('📅 Rendering session calendar:', calendarData);
    }

    setupFormHandlers() {
        // Schedule session form
        const scheduleForm = document.getElementById('schedule-session-form');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.scheduleSession();
            });
        }

        // Filter sessions
        const filterSelect = document.getElementById('session-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterSessions(e.target.value);
            });
        }

        // Search sessions
        const searchInput = document.getElementById('session-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchSessions(e.target.value);
            });
        }
    }

    async scheduleSession() {
        try {
            const formData = new FormData(document.getElementById('schedule-session-form'));
            const sessionData = {
                title: formData.get('title'),
                description: formData.get('description'),
                studentId: formData.get('studentId'),
                scheduledAt: new Date(formData.get('scheduledAt')),
                duration: parseInt(formData.get('duration')),
                type: formData.get('type'),
                platform: formData.get('platform'),
                status: 'Scheduled',
                createdAt: new Date()
            };

            await this.firebaseService.scheduleSession(this.currentUser.uid, sessionData);
            this.showSuccessMessage('Session scheduled successfully!');
            document.getElementById('schedule-session-form').reset();
            this.renderSessionsList(); // Refresh the list
            
        } catch (error) {
            console.error('Error scheduling session:', error);
            this.showErrorMessage('Failed to schedule session. Please try again.');
        }
    }

    async filterSessions(filter) {
        try {
            const sessions = await this.dataLoader.loadMentorSessions(this.currentUser.uid);
            let filteredSessions = sessions;

            if (filter !== 'all') {
                filteredSessions = sessions.filter(session => session.status === filter);
            }

            this.updateSessionsListUI(filteredSessions);
            
        } catch (error) {
            console.error('Error filtering sessions:', error);
        }
    }

    async searchSessions(query) {
        try {
            const sessions = await this.dataLoader.loadMentorSessions(this.currentUser.uid);
            let filteredSessions = sessions;

            if (query.trim()) {
                filteredSessions = sessions.filter(session => 
                    session.title.toLowerCase().includes(query.toLowerCase()) ||
                    session.studentName.toLowerCase().includes(query.toLowerCase()) ||
                    session.description.toLowerCase().includes(query.toLowerCase())
                );
            }

            this.updateSessionsListUI(filteredSessions);
            
        } catch (error) {
            console.error('Error searching sessions:', error);
        }
    }

    getSessionStatusColor(status) {
        const colors = {
            'scheduled': 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'rescheduled': 'bg-purple-100 text-purple-800'
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
    showDefaultSessionsList() {
        const container = document.getElementById('sessions-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading sessions...</p>
                </div>
            `;
        }
    }

    showDefaultSessionStats() {
        const defaultStats = {
            totalSessions: 0,
            completedSessions: 0,
            upcomingSessions: 0,
            cancelledSessions: 0,
            averageRating: 0,
            totalHours: 0,
            thisMonthSessions: 0,
            completionRate: 0
        };
        this.updateSessionStatsUI(defaultStats);
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

    showDefaultCalendar() {
        console.log('📅 Showing default calendar');
    }

    setupRealTimeListeners() {
        console.log('📅 MentorSessionsController: Setting up real-time listeners...');
        
        try {
            const sessionsListener = this.dataLoader.setupMentorSessionsListener(this.currentUser.uid, (sessions) => {
                console.log('📅 Sessions updated:', sessions);
                this.updateSessionsListUI(sessions);
            });
            this.realTimeListeners.push(sessionsListener);

            console.log('✅ MentorSessionsController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ MentorSessionsController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('📅 MentorSessionsController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MentorSessionsController();
});

export default MentorSessionsController;
