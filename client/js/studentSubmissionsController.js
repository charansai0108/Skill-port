import EnhancedPageController from './enhancedPageController.js';

class StudentSubmissionsController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'student';
    }

    async renderDashboardContent() {
        console.log('📝 StudentSubmissionsController: Rendering submissions content...');
        
        try {
            await this.renderSubmissionsList();
            await this.renderSubmissionStats();
            await this.renderProblemCategories();
            await this.renderRecentActivity();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ StudentSubmissionsController: Submissions content rendered successfully');
            
        } catch (error) {
            console.error('❌ StudentSubmissionsController: Error rendering submissions content:', error);
            throw error;
        }
    }

    async renderSubmissionsList() {
        try {
            const submissions = await this.dataLoader.loadStudentSubmissions(this.currentUser.uid);
            this.updateSubmissionsListUI(submissions);
        } catch (error) {
            console.error('Error loading submissions list:', error);
            this.showDefaultSubmissionsList();
        }
    }

    async renderSubmissionStats() {
        try {
            const stats = await this.dataLoader.loadSubmissionStats(this.currentUser.uid);
            this.updateSubmissionStatsUI(stats);
        } catch (error) {
            console.error('Error loading submission stats:', error);
            this.showDefaultSubmissionStats();
        }
    }

    async renderProblemCategories() {
        try {
            const categories = await this.dataLoader.loadProblemCategories(this.currentUser.uid);
            this.updateCategoriesUI(categories);
        } catch (error) {
            console.error('Error loading problem categories:', error);
            this.showDefaultCategories();
        }
    }

    async renderRecentActivity() {
        try {
            const activity = await this.dataLoader.loadSubmissionActivity(this.currentUser.uid, 10);
            this.updateActivityUI(activity);
        } catch (error) {
            console.error('Error loading recent activity:', error);
            this.showDefaultActivity();
        }
    }

    updateSubmissionsListUI(submissions) {
        const container = document.getElementById('submissions-list');
        if (!container) return;

        if (submissions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="file-text" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No submissions yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="startNewProblem()">
                        Start solving problems
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = submissions.map(submission => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h3 class="text-lg font-semibold text-gray-900">${submission.problemTitle}</h3>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(submission.status)}">
                                ${submission.status}
                            </span>
                        </div>
                        <div class="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <span class="flex items-center">
                                <i data-lucide="tag" class="w-3 h-3 mr-1"></i>
                                ${submission.platform}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="zap" class="w-3 h-3 mr-1"></i>
                                ${submission.difficulty}
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="clock" class="w-3 h-3 mr-1"></i>
                                ${submission.executionTime || 'N/A'}ms
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="database" class="w-3 h-3 mr-1"></i>
                                ${submission.memoryUsage || 'N/A'}MB
                            </span>
                        </div>
                        <p class="text-sm text-gray-600">${submission.language} • ${submission.submissionCount} attempts</p>
                    </div>
                    <div class="flex-shrink-0 text-right">
                        <div class="text-sm text-gray-500">${this.formatDateTime(submission.submittedAt)}</div>
                        <div class="text-xs text-gray-400">${submission.problemId}</div>
                    </div>
                </div>
                
                ${submission.status === 'Accepted' ? `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div class="flex items-center text-green-800">
                            <i data-lucide="check-circle" class="w-4 h-4 mr-2"></i>
                            <span class="text-sm font-medium">Solution Accepted!</span>
                        </div>
                    </div>
                ` : submission.status === 'Wrong Answer' ? `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <div class="flex items-center text-red-800">
                            <i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>
                            <span class="text-sm font-medium">Wrong Answer</span>
                        </div>
                        <p class="text-xs text-red-600 mt-1">${submission.errorMessage || 'Output doesn\'t match expected result'}</p>
                    </div>
                ` : submission.status === 'Time Limit Exceeded' ? `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div class="flex items-center text-yellow-800">
                            <i data-lucide="clock" class="w-4 h-4 mr-2"></i>
                            <span class="text-sm font-medium">Time Limit Exceeded</span>
                        </div>
                    </div>
                ` : ''}

                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewSubmission('${submission.id}')">
                            View Code
                        </button>
                        <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="resubmitProblem('${submission.problemId}')">
                            Resubmit
                        </button>
                        <button class="text-purple-600 hover:text-purple-700 text-sm font-medium" onclick="viewDiscussion('${submission.problemId}')">
                            Discussion
                        </button>
                    </div>
                    <div class="text-xs text-gray-500">
                        ${submission.testCasesPassed || 0}/${submission.totalTestCases || 0} test cases passed
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateSubmissionStatsUI(stats) {
        const statsElements = {
            'total-submissions': stats.totalSubmissions || 0,
            'accepted-submissions': stats.acceptedSubmissions || 0,
            'acceptance-rate': `${(stats.acceptanceRate || 0).toFixed(1)}%`,
            'problems-solved': stats.problemsSolved || 0,
            'average-time': `${(stats.averageTime || 0).toFixed(1)}ms`,
            'favorite-language': stats.favoriteLanguage || 'N/A',
            'current-streak': stats.currentStreak || 0,
            'longest-streak': stats.longestStreak || 0
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateCategoriesUI(categories) {
        const container = document.getElementById('problem-categories');
        if (!container) return;

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 text-sm">No categories available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(category => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="filterByCategory('${category.name}')">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <i data-lucide="${this.getCategoryIcon(category.name)}" class="w-4 h-4 text-blue-600"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900">${category.name}</p>
                        <p class="text-xs text-gray-500">${category.solved}/${category.total} solved</p>
                    </div>
                </div>
                <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${(category.solved / category.total) * 100}%"></div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateActivityUI(activity) {
        const container = document.getElementById('submission-activity');
        if (!container) return;

        if (activity.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="activity" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No recent activity</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activity.map(item => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${this.getActivityColor(item.type)}">
                        <i data-lucide="${this.getActivityIcon(item.type)}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm text-gray-900">${item.description}</p>
                    <p class="text-xs text-gray-500 mt-1">${this.formatDateTime(item.timestamp)}</p>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    setupFormHandlers() {
        // Filter submissions
        const filterSelect = document.getElementById('submission-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterSubmissions(e.target.value);
            });
        }

        // Search submissions
        const searchInput = document.getElementById('submission-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchSubmissions(e.target.value);
            });
        }

        // Sort submissions
        const sortSelect = document.getElementById('submission-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortSubmissions(e.target.value);
            });
        }
    }

    async filterSubmissions(filter) {
        try {
            const submissions = await this.dataLoader.loadStudentSubmissions(this.currentUser.uid);
            let filteredSubmissions = submissions;

            if (filter !== 'all') {
                filteredSubmissions = submissions.filter(submission => submission.status === filter);
            }

            this.updateSubmissionsListUI(filteredSubmissions);
            
        } catch (error) {
            console.error('Error filtering submissions:', error);
        }
    }

    async searchSubmissions(query) {
        try {
            const submissions = await this.dataLoader.loadStudentSubmissions(this.currentUser.uid);
            let filteredSubmissions = submissions;

            if (query.trim()) {
                filteredSubmissions = submissions.filter(submission => 
                    submission.problemTitle.toLowerCase().includes(query.toLowerCase()) ||
                    submission.platform.toLowerCase().includes(query.toLowerCase()) ||
                    submission.language.toLowerCase().includes(query.toLowerCase())
                );
            }

            this.updateSubmissionsListUI(filteredSubmissions);
            
        } catch (error) {
            console.error('Error searching submissions:', error);
        }
    }

    async sortSubmissions(sortBy) {
        try {
            const submissions = await this.dataLoader.loadStudentSubmissions(this.currentUser.uid);
            let sortedSubmissions = [...submissions];

            switch (sortBy) {
                case 'date-desc':
                    sortedSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                    break;
                case 'date-asc':
                    sortedSubmissions.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
                    break;
                case 'difficulty':
                    const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                    sortedSubmissions.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
                    break;
                case 'status':
                    sortedSubmissions.sort((a, b) => a.status.localeCompare(b.status));
                    break;
            }

            this.updateSubmissionsListUI(sortedSubmissions);
            
        } catch (error) {
            console.error('Error sorting submissions:', error);
        }
    }

    getStatusColor(status) {
        const colors = {
            'accepted': 'bg-green-100 text-green-800',
            'wrong-answer': 'bg-red-100 text-red-800',
            'time-limit-exceeded': 'bg-yellow-100 text-yellow-800',
            'runtime-error': 'bg-orange-100 text-orange-800',
            'compilation-error': 'bg-purple-100 text-purple-800',
            'pending': 'bg-gray-100 text-gray-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getCategoryIcon(category) {
        const icons = {
            'arrays': 'grid-3x3',
            'strings': 'type',
            'trees': 'tree-pine',
            'graphs': 'network',
            'dynamic-programming': 'cpu',
            'sorting': 'arrow-up-down',
            'searching': 'search',
            'math': 'calculator'
        };
        return icons[category?.toLowerCase()] || 'code';
    }

    getActivityIcon(type) {
        const icons = {
            'submission_accepted': 'check-circle',
            'submission_failed': 'x-circle',
            'problem_solved': 'award',
            'streak_milestone': 'flame',
            'new_problem': 'plus-circle'
        };
        return icons[type] || 'activity';
    }

    getActivityColor(type) {
        const colors = {
            'submission_accepted': 'bg-green-100 text-green-600',
            'submission_failed': 'bg-red-100 text-red-600',
            'problem_solved': 'bg-yellow-100 text-yellow-600',
            'streak_milestone': 'bg-orange-100 text-orange-600',
            'new_problem': 'bg-blue-100 text-blue-600'
        };
        return colors[type] || 'bg-gray-100 text-gray-600';
    }

    // Default states
    showDefaultSubmissionsList() {
        const container = document.getElementById('submissions-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading submissions...</p>
                </div>
            `;
        }
    }

    showDefaultSubmissionStats() {
        const defaultStats = {
            totalSubmissions: 0,
            acceptedSubmissions: 0,
            acceptanceRate: 0,
            problemsSolved: 0,
            averageTime: 0,
            favoriteLanguage: 'N/A',
            currentStreak: 0,
            longestStreak: 0
        };
        this.updateSubmissionStatsUI(defaultStats);
    }

    showDefaultCategories() {
        const container = document.getElementById('problem-categories');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i data-lucide="loader" class="w-4 h-4 text-gray-400 mx-auto mb-2 animate-spin"></i>
                    <p class="text-gray-500 text-sm">Loading categories...</p>
                </div>
            `;
        }
    }

    showDefaultActivity() {
        const container = document.getElementById('submission-activity');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading activity...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('📝 StudentSubmissionsController: Setting up real-time listeners...');
        
        try {
            const submissionsListener = this.dataLoader.setupSubmissionsListener(this.currentUser.uid, (submissions) => {
                console.log('📝 Submissions updated:', submissions);
                this.updateSubmissionsListUI(submissions);
            });
            this.realTimeListeners.push(submissionsListener);

            console.log('✅ StudentSubmissionsController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ StudentSubmissionsController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('📝 StudentSubmissionsController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudentSubmissionsController();
});

export default StudentSubmissionsController;
