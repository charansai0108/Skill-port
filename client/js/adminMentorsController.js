import EnhancedPageController from './enhancedPageController.js';

class AdminMentorsController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'admin';
    }

    async renderDashboardContent() {
        console.log('👨‍🏫 AdminMentorsController: Rendering mentors management content...');
        
        try {
            await this.renderMentorsList();
            await this.renderMentorStats();
            await this.renderMentorApplications();
            await this.renderMentorPerformance();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ AdminMentorsController: Mentors management content rendered successfully');
            
        } catch (error) {
            console.error('❌ AdminMentorsController: Error rendering mentors content:', error);
            throw error;
        }
    }

    async renderMentorsList() {
        try {
            const mentors = await this.dataLoader.loadMentors(100);
            this.updateMentorsListUI(mentors);
        } catch (error) {
            console.error('Error loading mentors list:', error);
            this.showDefaultMentorsList();
        }
    }

    async renderMentorStats() {
        try {
            const stats = await this.dataLoader.loadMentorStats();
            this.updateMentorStatsUI(stats);
        } catch (error) {
            console.error('Error loading mentor stats:', error);
            this.showDefaultMentorStats();
        }
    }

    async renderMentorApplications() {
        try {
            const applications = await this.dataLoader.loadMentorApplications(50);
            this.updateApplicationsUI(applications);
        } catch (error) {
            console.error('Error loading mentor applications:', error);
            this.showDefaultApplications();
        }
    }

    async renderMentorPerformance() {
        try {
            const performance = await this.dataLoader.loadMentorPerformance();
            this.updatePerformanceUI(performance);
        } catch (error) {
            console.error('Error loading mentor performance:', error);
            this.showDefaultPerformance();
        }
    }

    updateMentorsListUI(mentors) {
        const container = document.getElementById('mentors-list');
        if (!container) return;

        if (mentors.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No mentors found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = mentors.map(mentor => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start space-x-3 mb-3">
                    <img src="${mentor.profileImage || '/images/default-avatar.png'}" 
                         alt="${mentor.name}" class="w-12 h-12 rounded-full object-cover">
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                            <h3 class="text-lg font-semibold text-gray-900">${mentor.name}</h3>
                            <div class="flex items-center space-x-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(mentor.status)}">
                                    ${mentor.status}
                                </span>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getRatingColor(mentor.rating)}">
                                    ⭐ ${mentor.rating || 'N/A'}
                                </span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">${mentor.email}</p>
                        <p class="text-xs text-gray-500">${mentor.specialization || 'General'}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                        <span class="text-gray-500">Students:</span>
                        <span class="font-medium text-gray-900 ml-2">${mentor.studentsCount || 0}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Sessions:</span>
                        <span class="font-medium text-gray-900 ml-2">${mentor.sessionsCompleted || 0}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Experience:</span>
                        <span class="font-medium text-gray-900 ml-2">${mentor.experience || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Joined:</span>
                        <span class="font-medium text-gray-900 ml-2">${this.formatDate(mentor.createdAt)}</span>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        ID: ${mentor.id}
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewMentor('${mentor.id}')">
                            View
                        </button>
                        <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="editMentor('${mentor.id}')">
                            Edit
                        </button>
                        <button class="text-purple-600 hover:text-purple-700 text-sm font-medium" onclick="approveMentor('${mentor.id}')">
                            Approve
                        </button>
                        <button class="text-red-600 hover:text-red-700 text-sm font-medium" onclick="suspendMentor('${mentor.id}')">
                            Suspend
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateMentorStatsUI(stats) {
        const statsElements = {
            'total-mentors': stats.totalMentors || 0,
            'active-mentors': stats.activeMentors || 0,
            'pending-mentors': stats.pendingMentors || 0,
            'suspended-mentors': stats.suspendedMentors || 0,
            'total-students': stats.totalStudents || 0,
            'total-sessions': stats.totalSessions || 0,
            'average-rating': stats.averageRating || 'N/A',
            'completion-rate': `${stats.completionRate || 0}%`
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateApplicationsUI(applications) {
        const container = document.getElementById('mentor-applications-list');
        if (!container) return;

        if (applications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="file-text" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No mentor applications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = applications.map(application => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <i data-lucide="user-plus" class="w-4 h-4 text-blue-600"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <h4 class="text-sm font-medium text-gray-900">${application.name}</h4>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getStatusColor(application.status)}">
                            ${application.status}
                        </span>
                    </div>
                    <p class="text-xs text-gray-500">${application.email}</p>
                    <p class="text-xs text-gray-500">${application.specialization}</p>
                    <p class="text-xs text-gray-500 mt-1">${this.formatDateTime(application.createdAt)}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="approveApplication('${application.id}')">
                        Approve
                    </button>
                    <button class="text-red-600 hover:text-red-700 text-sm font-medium" onclick="rejectApplication('${application.id}')">
                        Reject
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updatePerformanceUI(performance) {
        const container = document.getElementById('mentor-performance-list');
        if (!container) return;

        if (performance.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="trending-up" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No performance data available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = performance.map(mentor => `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex items-center space-x-3">
                    <img src="${mentor.profileImage || '/images/default-avatar.png'}" 
                         alt="${mentor.name}" class="w-8 h-8 rounded-full object-cover">
                    <div>
                        <p class="text-sm font-medium text-gray-900">${mentor.name}</p>
                        <p class="text-xs text-gray-500">${mentor.specialization}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">${mentor.rating || 'N/A'}</div>
                    <div class="text-xs text-gray-500">rating</div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">${mentor.sessionsCompleted || 0}</div>
                    <div class="text-xs text-gray-500">sessions</div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">${mentor.studentsCount || 0}</div>
                    <div class="text-xs text-gray-500">students</div>
                </div>
            </div>
        `).join('');
    }

    setupFormHandlers() {
        // Filter mentors
        const filterSelect = document.getElementById('mentor-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterMentors(e.target.value);
            });
        }

        // Search mentors
        const searchInput = document.getElementById('mentor-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMentors(e.target.value);
            });
        }
    }

    async filterMentors(filter) {
        try {
            const mentors = await this.dataLoader.loadMentors(100);
            let filteredMentors = mentors;

            if (filter !== 'all') {
                filteredMentors = mentors.filter(mentor => mentor.status === filter);
            }

            this.updateMentorsListUI(filteredMentors);
            
        } catch (error) {
            console.error('Error filtering mentors:', error);
        }
    }

    async searchMentors(query) {
        try {
            const mentors = await this.dataLoader.loadMentors(100);
            let filteredMentors = mentors;

            if (query.trim()) {
                filteredMentors = mentors.filter(mentor => 
                    mentor.name.toLowerCase().includes(query.toLowerCase()) ||
                    mentor.email.toLowerCase().includes(query.toLowerCase()) ||
                    mentor.specialization?.toLowerCase().includes(query.toLowerCase())
                );
            }

            this.updateMentorsListUI(filteredMentors);
            
        } catch (error) {
            console.error('Error searching mentors:', error);
        }
    }

    getStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'suspended': 'bg-red-100 text-red-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getRatingColor(rating) {
        if (rating >= 4.5) return 'bg-green-100 text-green-800';
        if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800';
        if (rating >= 2.5) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
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
    showDefaultMentorsList() {
        const container = document.getElementById('mentors-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading mentors...</p>
                </div>
            `;
        }
    }

    showDefaultMentorStats() {
        const defaultStats = {
            totalMentors: 0,
            activeMentors: 0,
            pendingMentors: 0,
            suspendedMentors: 0,
            totalStudents: 0,
            totalSessions: 0,
            averageRating: 'N/A',
            completionRate: 0
        };
        this.updateMentorStatsUI(defaultStats);
    }

    showDefaultApplications() {
        const container = document.getElementById('mentor-applications-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading applications...</p>
                </div>
            `;
        }
    }

    showDefaultPerformance() {
        const container = document.getElementById('mentor-performance-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading performance data...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('👨‍🏫 AdminMentorsController: Setting up real-time listeners...');
        
        try {
            const mentorsListener = this.dataLoader.setupMentorsListener((mentors) => {
                console.log('👨‍🏫 Mentors updated:', mentors);
                this.updateMentorsListUI(mentors);
            });
            this.realTimeListeners.push(mentorsListener);

            console.log('✅ AdminMentorsController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ AdminMentorsController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('👨‍🏫 AdminMentorsController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AdminMentorsController();
});

export default AdminMentorsController;
