import EnhancedPageController from './enhancedPageController.js';

class StudentMentorFeedbackController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'student';
    }

    async renderDashboardContent() {
        console.log('💬 StudentMentorFeedbackController: Rendering mentor feedback content...');
        
        try {
            await this.renderMentorList();
            await this.renderFeedbackStats();
            await this.renderPendingFeedback();
            await this.renderFeedbackHistory();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ StudentMentorFeedbackController: Mentor feedback content rendered successfully');
            
        } catch (error) {
            console.error('❌ StudentMentorFeedbackController: Error rendering feedback content:', error);
            throw error;
        }
    }

    async renderMentorList() {
        try {
            const mentors = await this.dataLoader.loadAvailableMentors(100);
            this.updateMentorListUI(mentors);
        } catch (error) {
            console.error('Error loading mentor list:', error);
            this.showDefaultMentorList();
        }
    }

    async renderFeedbackStats() {
        try {
            const stats = await this.dataLoader.loadFeedbackStats();
            this.updateFeedbackStatsUI(stats);
        } catch (error) {
            console.error('Error loading feedback stats:', error);
            this.showDefaultFeedbackStats();
        }
    }

    async renderPendingFeedback() {
        try {
            const pending = await this.dataLoader.loadPendingFeedback(50);
            this.updatePendingFeedbackUI(pending);
        } catch (error) {
            console.error('Error loading pending feedback:', error);
            this.showDefaultPendingFeedback();
        }
    }

    async renderFeedbackHistory() {
        try {
            const history = await this.dataLoader.loadFeedbackHistory(50);
            this.updateFeedbackHistoryUI(history);
        } catch (error) {
            console.error('Error loading feedback history:', error);
            this.showDefaultFeedbackHistory();
        }
    }

    updateMentorListUI(mentors) {
        const container = document.getElementById('mentor-list');
        if (!container) return;

        if (mentors.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No mentors available</p>
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
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getRatingColor(mentor.rating)}">
                                    ⭐ ${mentor.rating || 'N/A'}
                                </span>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(mentor.status)}">
                                    ${mentor.status}
                                </span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">${mentor.specialization || 'General'}</p>
                        <p class="text-xs text-gray-500">${mentor.university || 'University not specified'}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-3 text-sm">
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
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        ID: ${mentor.id}
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewMentorProfile('${mentor.id}')">
                            View Profile
                        </button>
                        <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="requestSession('${mentor.id}')">
                            Request Session
                        </button>
                        <button class="text-purple-600 hover:text-purple-700 text-sm font-medium" onclick="giveFeedback('${mentor.id}')">
                            Give Feedback
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateFeedbackStatsUI(stats) {
        const statsElements = {
            'total-feedback': stats.totalFeedback || 0,
            'mentors-rated': stats.mentorsRated || 0,
            'average-rating-given': stats.averageRatingGiven || 'N/A',
            'feedback-this-month': stats.feedbackThisMonth || 0,
            'feedback-this-week': stats.feedbackThisWeek || 0,
            'feedback-today': stats.feedbackToday || 0,
            'pending-feedback': stats.pendingFeedback || 0,
            'helpful-feedback': stats.helpfulFeedback || 0
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updatePendingFeedbackUI(pending) {
        const container = document.getElementById('pending-feedback-list');
        if (!container) return;

        if (pending.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="check-circle" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No pending feedback</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pending.map(item => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <i data-lucide="clock" class="w-4 h-4 text-yellow-600"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <h4 class="text-sm font-medium text-gray-900">${item.mentor?.name || 'Mentor'}</h4>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                        </span>
                    </div>
                    <p class="text-xs text-gray-500">${item.session?.title || 'Session Feedback'}</p>
                    <p class="text-xs text-gray-500 mt-1">${this.formatDateTime(item.session?.endDate)}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="giveFeedback('${item.mentor?.id}')">
                        Give Feedback
                    </button>
                    <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewSession('${item.session?.id}')">
                        View Session
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateFeedbackHistoryUI(history) {
        const container = document.getElementById('feedback-history-list');
        if (!container) return;

        if (history.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="history" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No feedback history</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.map(item => `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex items-center space-x-3">
                    <img src="${item.mentor?.profileImage || '/images/default-avatar.png'}" 
                         alt="${item.mentor?.name}" class="w-8 h-8 rounded-full object-cover">
                    <div>
                        <p class="text-sm font-medium text-gray-900">${item.mentor?.name || 'Mentor'}</p>
                        <p class="text-xs text-gray-500">${item.session?.title || 'Session Feedback'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">⭐ ${item.rating || 'N/A'}</div>
                    <div class="text-xs text-gray-500">${this.formatDate(item.createdAt)}</div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">${item.status}</div>
                    <div class="text-xs text-gray-500">status</div>
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

        // Feedback form
        const feedbackForm = document.getElementById('feedback-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitFeedback();
            });
        }
    }

    async filterMentors(filter) {
        try {
            const mentors = await this.dataLoader.loadAvailableMentors(100);
            let filteredMentors = mentors;

            if (filter !== 'all') {
                filteredMentors = mentors.filter(mentor => mentor.specialization === filter);
            }

            this.updateMentorListUI(filteredMentors);
            
        } catch (error) {
            console.error('Error filtering mentors:', error);
        }
    }

    async searchMentors(query) {
        try {
            const mentors = await this.dataLoader.loadAvailableMentors(100);
            let filteredMentors = mentors;

            if (query.trim()) {
                filteredMentors = mentors.filter(mentor => 
                    mentor.name.toLowerCase().includes(query.toLowerCase()) ||
                    mentor.specialization?.toLowerCase().includes(query.toLowerCase()) ||
                    mentor.university?.toLowerCase().includes(query.toLowerCase())
                );
            }

            this.updateMentorListUI(filteredMentors);
            
        } catch (error) {
            console.error('Error searching mentors:', error);
        }
    }

    async submitFeedback() {
        try {
            const formData = new FormData(document.getElementById('feedback-form'));
            const feedbackData = {
                mentorId: formData.get('mentorId'),
                sessionId: formData.get('sessionId'),
                rating: parseInt(formData.get('rating')),
                comment: formData.get('comment'),
                helpfulness: parseInt(formData.get('helpfulness')),
                communication: parseInt(formData.get('communication')),
                knowledge: parseInt(formData.get('knowledge'))
            };

            await this.firebaseService.submitFeedback(feedbackData);
            this.showSuccessMessage('Feedback submitted successfully!');
            document.getElementById('feedback-form').reset();
            this.renderPendingFeedback(); // Refresh pending feedback
            
        } catch (error) {
            console.error('Error submitting feedback:', error);
            this.showErrorMessage('Failed to submit feedback. Please try again.');
        }
    }

    getRatingColor(rating) {
        if (rating >= 4.5) return 'bg-green-100 text-green-800';
        if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800';
        if (rating >= 2.5) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    }

    getStatusColor(status) {
        const colors = {
            'available': 'bg-green-100 text-green-800',
            'busy': 'bg-yellow-100 text-yellow-800',
            'offline': 'bg-gray-100 text-gray-800',
            'in-session': 'bg-blue-100 text-blue-800'
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
    showDefaultMentorList() {
        const container = document.getElementById('mentor-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading mentors...</p>
                </div>
            `;
        }
    }

    showDefaultFeedbackStats() {
        const defaultStats = {
            totalFeedback: 0,
            mentorsRated: 0,
            averageRatingGiven: 'N/A',
            feedbackThisMonth: 0,
            feedbackThisWeek: 0,
            feedbackToday: 0,
            pendingFeedback: 0,
            helpfulFeedback: 0
        };
        this.updateFeedbackStatsUI(defaultStats);
    }

    showDefaultPendingFeedback() {
        const container = document.getElementById('pending-feedback-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading pending feedback...</p>
                </div>
            `;
        }
    }

    showDefaultFeedbackHistory() {
        const container = document.getElementById('feedback-history-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading feedback history...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('💬 StudentMentorFeedbackController: Setting up real-time listeners...');
        
        try {
            const mentorsListener = this.dataLoader.setupMentorsListener((mentors) => {
                console.log('💬 Mentors updated:', mentors);
                this.updateMentorListUI(mentors);
            });
            this.realTimeListeners.push(mentorsListener);

            console.log('✅ StudentMentorFeedbackController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ StudentMentorFeedbackController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('💬 StudentMentorFeedbackController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudentMentorFeedbackController();
});

export default StudentMentorFeedbackController;
