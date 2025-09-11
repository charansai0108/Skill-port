import EnhancedPageController from './enhancedPageController.js';

class MentorStudentsController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'mentor';
    }

    async renderDashboardContent() {
        console.log('👥 MentorStudentsController: Rendering students content...');
        
        try {
            await this.renderStudentsList();
            await this.renderStudentStats();
            await this.renderPendingRequests();
            await this.renderStudentProgress();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ MentorStudentsController: Students content rendered successfully');
            
        } catch (error) {
            console.error('❌ MentorStudentsController: Error rendering students content:', error);
            throw error;
        }
    }

    async renderStudentsList() {
        try {
            const students = await this.dataLoader.loadMentorStudents(this.currentUser.uid);
            this.updateStudentsListUI(students);
        } catch (error) {
            console.error('Error loading students list:', error);
            this.showDefaultStudentsList();
        }
    }

    async renderStudentStats() {
        try {
            const stats = await this.dataLoader.loadMentorStudentStats(this.currentUser.uid);
            this.updateStudentStatsUI(stats);
        } catch (error) {
            console.error('Error loading student stats:', error);
            this.showDefaultStudentStats();
        }
    }

    async renderPendingRequests() {
        try {
            const requests = await this.dataLoader.loadMentorRequests(this.currentUser.uid);
            this.updateRequestsUI(requests);
        } catch (error) {
            console.error('Error loading pending requests:', error);
            this.showDefaultRequests();
        }
    }

    async renderStudentProgress() {
        try {
            const progress = await this.dataLoader.loadStudentProgress(this.currentUser.uid);
            this.updateProgressUI(progress);
        } catch (error) {
            console.error('Error loading student progress:', error);
            this.showDefaultProgress();
        }
    }

    updateStudentsListUI(students) {
        const container = document.getElementById('students-list');
        if (!container) return;

        if (students.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="user-plus" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No students assigned yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="acceptStudentRequests()">
                        Accept student requests
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(student => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start space-x-3 mb-3">
                    <img src="${student.profileImage || '/images/default-avatar.png'}" 
                         alt="${student.name}" class="w-12 h-12 rounded-full object-cover">
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                            <h3 class="text-lg font-semibold text-gray-900">${student.name}</h3>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStudentStatusColor(student.status)}">
                                ${student.status}
                            </span>
                        </div>
                        <p class="text-sm text-gray-600">${student.university || 'University not specified'}</p>
                        <p class="text-xs text-gray-500">${student.major || 'Major not specified'}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                        <span class="text-gray-500">Sessions:</span>
                        <span class="font-medium text-gray-900 ml-2">${student.sessionsCompleted || 0}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Progress:</span>
                        <span class="font-medium text-gray-900 ml-2">${student.progress || 0}%</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Joined:</span>
                        <span class="font-medium text-gray-900 ml-2">${this.formatDate(student.joinedAt)}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Last Active:</span>
                        <span class="font-medium text-gray-900 ml-2">${this.formatDate(student.lastActiveAt)}</span>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        Next session: ${this.formatDate(student.nextSession) || 'Not scheduled'}
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewStudent('${student.id}')">
                            View Profile
                        </button>
                        <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="scheduleSession('${student.id}')">
                            Schedule Session
                        </button>
                        <button class="text-purple-600 hover:text-purple-700 text-sm font-medium" onclick="messageStudent('${student.id}')">
                            Message
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStudentStatsUI(stats) {
        const statsElements = {
            'total-students': stats.totalStudents || 0,
            'active-students': stats.activeStudents || 0,
            'new-students': stats.newStudents || 0,
            'average-progress': `${(stats.averageProgress || 0).toFixed(1)}%`,
            'sessions-this-month': stats.sessionsThisMonth || 0,
            'average-session-rating': stats.averageSessionRating ? stats.averageSessionRating.toFixed(1) : '0.0',
            'student-satisfaction': `${(stats.studentSatisfaction || 0).toFixed(1)}%`,
            'retention-rate': `${(stats.retentionRate || 0).toFixed(1)}%`
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateRequestsUI(requests) {
        const container = document.getElementById('pending-requests-list');
        if (!container) return;

        if (requests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="inbox" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No pending requests</p>
                    <p class="text-sm text-gray-400 mt-2">Student requests will appear here</p>
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
                        <p class="text-sm text-gray-600">${request.university || 'University not specified'}</p>
                        <p class="text-xs text-gray-500">${request.major || 'Major not specified'}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">${this.formatDate(request.requestedAt)}</div>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                        </span>
                    </div>
                </div>
                
                <div class="mb-3">
                    <p class="text-sm text-gray-700 mb-2">${request.message || 'No message provided'}</p>
                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Goals: ${request.learningGoals || 'Not specified'}</span>
                        <span>Experience: ${request.experienceLevel || 'Not specified'}</span>
                        <span>Availability: ${request.availability || 'Not specified'}</span>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        Requested: ${this.formatDate(request.requestedAt)}
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="acceptRequest('${request.id}')">
                            Accept
                        </button>
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewRequest('${request.id}')">
                            View Details
                        </button>
                        <button class="text-red-600 hover:text-red-700 text-sm font-medium" onclick="declineRequest('${request.id}')">
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateProgressUI(progress) {
        const container = document.getElementById('student-progress-list');
        if (!container) return;

        if (progress.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="trending-up" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No progress data available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = progress.map(student => `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <img src="${student.profileImage || '/images/default-avatar.png'}" 
                             alt="${student.name}" class="w-8 h-8 rounded-full object-cover">
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">${student.name}</h3>
                            <p class="text-xs text-gray-500">${student.currentTopic || 'No current topic'}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium text-gray-900">${student.progress}%</div>
                        <div class="text-xs text-gray-500">${student.sessionsCompleted} sessions</div>
                    </div>
                </div>
                
                <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${student.progress}%"></div>
                </div>
                
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>Last session: ${this.formatDate(student.lastSession)}</span>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700" onclick="viewProgress('${student.id}')">
                            View Details
                        </button>
                        <button class="text-green-600 hover:text-green-700" onclick="scheduleSession('${student.id}')">
                            Schedule
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupFormHandlers() {
        // Filter students
        const filterSelect = document.getElementById('student-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterStudents(e.target.value);
            });
        }

        // Search students
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchStudents(e.target.value);
            });
        }
    }

    async filterStudents(filter) {
        try {
            const students = await this.dataLoader.loadMentorStudents(this.currentUser.uid);
            let filteredStudents = students;

            if (filter !== 'all') {
                filteredStudents = students.filter(student => student.status === filter);
            }

            this.updateStudentsListUI(filteredStudents);
            
        } catch (error) {
            console.error('Error filtering students:', error);
        }
    }

    async searchStudents(query) {
        try {
            const students = await this.dataLoader.loadMentorStudents(this.currentUser.uid);
            let filteredStudents = students;

            if (query.trim()) {
                filteredStudents = students.filter(student => 
                    student.name.toLowerCase().includes(query.toLowerCase()) ||
                    student.university.toLowerCase().includes(query.toLowerCase()) ||
                    student.major.toLowerCase().includes(query.toLowerCase())
                );
            }

            this.updateStudentsListUI(filteredStudents);
            
        } catch (error) {
            console.error('Error searching students:', error);
        }
    }

    getStudentStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'suspended': 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    // Default states
    showDefaultStudentsList() {
        const container = document.getElementById('students-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading students...</p>
                </div>
            `;
        }
    }

    showDefaultStudentStats() {
        const defaultStats = {
            totalStudents: 0,
            activeStudents: 0,
            newStudents: 0,
            averageProgress: 0,
            sessionsThisMonth: 0,
            averageSessionRating: 0,
            studentSatisfaction: 0,
            retentionRate: 0
        };
        this.updateStudentStatsUI(defaultStats);
    }

    showDefaultRequests() {
        const container = document.getElementById('pending-requests-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading requests...</p>
                </div>
            `;
        }
    }

    showDefaultProgress() {
        const container = document.getElementById('student-progress-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading progress...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('👥 MentorStudentsController: Setting up real-time listeners...');
        
        try {
            const studentsListener = this.dataLoader.setupMentorStudentsListener(this.currentUser.uid, (students) => {
                console.log('👥 Students updated:', students);
                this.updateStudentsListUI(students);
            });
            this.realTimeListeners.push(studentsListener);

            console.log('✅ MentorStudentsController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ MentorStudentsController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('👥 MentorStudentsController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MentorStudentsController();
});

export default MentorStudentsController;
