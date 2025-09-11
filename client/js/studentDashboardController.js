import EnhancedPageController from './enhancedPageController.js';

class StudentDashboardController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'student';
    }

    async renderDashboardContent() {
        console.log('🎓 StudentDashboardController: Rendering student dashboard content...');
        
        try {
            // Load and render student-specific content
            await this.renderStudentStats();
            await this.renderRecentSubmissions();
            await this.renderLearningProgress();
            await this.renderMentorConnections();
            await this.renderStudyGroups();
            
            // Setup real-time listeners
            this.setupRealTimeListeners();
            
            console.log('✅ StudentDashboardController: Student dashboard content rendered successfully');
            
        } catch (error) {
            console.error('❌ StudentDashboardController: Error rendering dashboard content:', error);
            throw error;
        }
    }

    async renderStudentStats() {
        try {
            const stats = await this.dataLoader.loadStudentStats(this.currentUser.uid);
            this.updateStudentStatsUI(stats);
        } catch (error) {
            console.error('Error loading student stats:', error);
            this.showDefaultStudentStats();
        }
    }

    async renderRecentSubmissions() {
        try {
            const submissions = await this.dataLoader.loadStudentSubmissions(this.currentUser.uid, 10);
            this.updateSubmissionsUI(submissions);
        } catch (error) {
            console.error('Error loading submissions:', error);
            this.showDefaultSubmissions();
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

    async renderMentorConnections() {
        try {
            const mentors = await this.dataLoader.loadMentorConnections(this.currentUser.uid);
            this.updateMentorsUI(mentors);
        } catch (error) {
            console.error('Error loading mentor connections:', error);
            this.showDefaultMentors();
        }
    }

    async renderStudyGroups() {
        try {
            const studyGroups = await this.dataLoader.loadStudyGroups(this.currentUser.uid);
            this.updateStudyGroupsUI(studyGroups);
        } catch (error) {
            console.error('Error loading study groups:', error);
            this.showDefaultStudyGroups();
        }
    }

    updateStudentStatsUI(stats) {
        const statsElements = {
            'total-problems': stats.totalProblems || 0,
            'problems-solved': stats.problemsSolved || 0,
            'accuracy-rate': `${(stats.accuracyRate || 0).toFixed(1)}%`,
            'study-hours': stats.studyHours || 0,
            'current-streak': stats.currentStreak || 0,
            'longest-streak': stats.longestStreak || 0,
            'mentor-sessions': stats.mentorSessions || 0,
            'study-group-meetings': stats.studyGroupMeetings || 0
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateSubmissionsUI(submissions) {
        const container = document.getElementById('recent-submissions-list');
        if (!container) return;

        if (submissions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="file-text" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No submissions yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Start solving problems
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = submissions.map(submission => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${submission.status === 'accepted' ? 'bg-green-100 text-green-600' : submission.status === 'wrong-answer' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}">
                        <i data-lucide="${submission.status === 'accepted' ? 'check' : submission.status === 'wrong-answer' ? 'x' : 'clock'}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${submission.problemTitle}</p>
                    <p class="text-xs text-gray-500">${submission.platform} • ${submission.difficulty}</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="text-xs text-gray-500">${this.formatDate(submission.submittedAt)}</span>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateLearningProgressUI(progress) {
        const container = document.getElementById('learning-progress-list');
        if (!container) return;

        if (progress.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="book-open" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No learning progress yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = progress.map(topic => `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-gray-900">${topic.name}</h3>
                    <span class="text-sm text-gray-500">${topic.progress}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${topic.progress}%"></div>
                </div>
                <p class="text-xs text-gray-500 mt-2">${topic.completedLessons}/${topic.totalLessons} lessons completed</p>
            </div>
        `).join('');
    }

    updateMentorsUI(mentors) {
        const container = document.getElementById('mentors-list');
        if (!container) return;

        if (mentors.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="user-check" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No mentor connections yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Find a mentor
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = mentors.map(mentor => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <img src="${mentor.profileImage || '/images/default-avatar.png'}" alt="${mentor.name}" class="w-10 h-10 rounded-full object-cover">
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${mentor.name}</p>
                    <p class="text-xs text-gray-500">${mentor.specialization}</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${mentor.status || 'Active'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    updateStudyGroupsUI(studyGroups) {
        const container = document.getElementById('study-groups-list');
        if (!container) return;

        if (studyGroups.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Not joined any study groups yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Join a study group
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = studyGroups.map(group => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <i data-lucide="users" class="w-5 h-5 text-purple-600"></i>
                    </div>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${group.name}</p>
                    <p class="text-xs text-gray-500">${group.memberCount} members • ${group.subject}</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        ${group.role || 'Member'}
                    </span>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    // Default/Error State Methods
    showDefaultStudentStats() {
        const defaultStats = {
            totalProblems: 0,
            problemsSolved: 0,
            accuracyRate: 0,
            studyHours: 0,
            currentStreak: 0,
            longestStreak: 0,
            mentorSessions: 0,
            studyGroupMeetings: 0
        };
        this.updateStudentStatsUI(defaultStats);
    }

    showDefaultSubmissions() {
        const container = document.getElementById('recent-submissions-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading submissions...</p>
                </div>
            `;
        }
    }

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

    showDefaultMentors() {
        const container = document.getElementById('mentors-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading mentor connections...</p>
                </div>
            `;
        }
    }

    showDefaultStudyGroups() {
        const container = document.getElementById('study-groups-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading study groups...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('🎓 StudentDashboardController: Setting up real-time listeners...');
        
        try {
            // Listen for student stats changes
            const statsListener = this.dataLoader.setupStudentStatsListener(this.currentUser.uid, (stats) => {
                console.log('📊 Student stats updated:', stats);
                this.updateStudentStatsUI(stats);
            });
            this.realTimeListeners.push(statsListener);

            // Listen for submissions changes
            const submissionsListener = this.dataLoader.setupSubmissionsListener(this.currentUser.uid, (submissions) => {
                console.log('📝 Submissions updated:', submissions);
                this.updateSubmissionsUI(submissions);
            });
            this.realTimeListeners.push(submissionsListener);

            console.log('✅ StudentDashboardController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ StudentDashboardController: Error setting up real-time listeners:', error);
        }
    }

    // Cleanup
    destroy() {
        console.log('🎓 StudentDashboardController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new StudentDashboardController();
});

export default StudentDashboardController;
