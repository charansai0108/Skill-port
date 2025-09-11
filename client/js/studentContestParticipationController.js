import EnhancedPageController from './enhancedPageController.js';

class StudentContestParticipationController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'student';
    }

    async renderDashboardContent() {
        console.log('🏆 StudentContestParticipationController: Rendering contest participation content...');
        
        try {
            await this.renderContestList();
            await this.renderContestStats();
            await this.renderActiveContests();
            await this.renderContestHistory();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ StudentContestParticipationController: Contest participation content rendered successfully');
            
        } catch (error) {
            console.error('❌ StudentContestParticipationController: Error rendering contest content:', error);
            throw error;
        }
    }

    async renderContestList() {
        try {
            const contests = await this.dataLoader.loadAvailableContests(100);
            this.updateContestListUI(contests);
        } catch (error) {
            console.error('Error loading contest list:', error);
            this.showDefaultContestList();
        }
    }

    async renderContestStats() {
        try {
            const stats = await this.dataLoader.loadContestStats();
            this.updateContestStatsUI(stats);
        } catch (error) {
            console.error('Error loading contest stats:', error);
            this.showDefaultContestStats();
        }
    }

    async renderActiveContests() {
        try {
            const activeContests = await this.dataLoader.loadActiveContests(50);
            this.updateActiveContestsUI(activeContests);
        } catch (error) {
            console.error('Error loading active contests:', error);
            this.showDefaultActiveContests();
        }
    }

    async renderContestHistory() {
        try {
            const history = await this.dataLoader.loadContestHistory(50);
            this.updateContestHistoryUI(history);
        } catch (error) {
            console.error('Error loading contest history:', error);
            this.showDefaultContestHistory();
        }
    }

    updateContestListUI(contests) {
        const container = document.getElementById('contest-list');
        if (!container) return;

        if (contests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="trophy" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No contests available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = contests.map(contest => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-start space-x-3 mb-3">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <i data-lucide="trophy" class="w-6 h-6 text-white"></i>
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                            <h3 class="text-lg font-semibold text-gray-900">${contest.title}</h3>
                            <div class="flex items-center space-x-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(contest.status)}">
                                    ${contest.status}
                                </span>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getDifficultyColor(contest.difficulty)}">
                                    ${contest.difficulty}
                                </span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">${contest.description}</p>
                        <p class="text-xs text-gray-500">${contest.organizer}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                        <span class="text-gray-500">Duration:</span>
                        <span class="font-medium text-gray-900 ml-2">${contest.duration || 'N/A'}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Participants:</span>
                        <span class="font-medium text-gray-900 ml-2">${contest.participantsCount || 0}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Prize:</span>
                        <span class="font-medium text-gray-900 ml-2">${contest.prize || 'N/A'}</span>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        ${this.formatDateTime(contest.startDate)} - ${this.formatDateTime(contest.endDate)}
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewContest('${contest.id}')">
                            View Details
                        </button>
                        ${contest.status === 'active' ? `
                            <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="joinContest('${contest.id}')">
                                Join Contest
                            </button>
                        ` : ''}
                        ${contest.status === 'upcoming' ? `
                            <button class="text-purple-600 hover:text-purple-700 text-sm font-medium" onclick="registerForContest('${contest.id}')">
                                Register
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateContestStatsUI(stats) {
        const statsElements = {
            'total-contests': stats.totalContests || 0,
            'contests-joined': stats.contestsJoined || 0,
            'contests-won': stats.contestsWon || 0,
            'average-rank': stats.averageRank || 'N/A',
            'total-points': stats.totalPoints || 0,
            'win-rate': `${stats.winRate || 0}%`,
            'current-streak': stats.currentStreak || 0,
            'best-rank': stats.bestRank || 'N/A'
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateActiveContestsUI(activeContests) {
        const container = document.getElementById('active-contests-list');
        if (!container) return;

        if (activeContests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="clock" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No active contests</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activeContests.map(contest => `
            <div class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <i data-lucide="play" class="w-4 h-4 text-green-600"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <h4 class="text-sm font-medium text-gray-900">${contest.title}</h4>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                        </span>
                    </div>
                    <p class="text-xs text-gray-500">${contest.description}</p>
                    <p class="text-xs text-gray-500 mt-1">Time remaining: ${contest.timeRemaining}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="continueContest('${contest.id}')">
                        Continue
                    </button>
                    <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewContest('${contest.id}')">
                        View
                    </button>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateContestHistoryUI(history) {
        const container = document.getElementById('contest-history-list');
        if (!container) return;

        if (history.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="history" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No contest history</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.map(contest => `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <i data-lucide="trophy" class="w-4 h-4 text-blue-600"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900">${contest.title}</p>
                        <p class="text-xs text-gray-500">${contest.organizer}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">Rank: ${contest.rank || 'N/A'}</div>
                    <div class="text-xs text-gray-500">${contest.points || 0} points</div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">${contest.status}</div>
                    <div class="text-xs text-gray-500">${this.formatDate(contest.endDate)}</div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    setupFormHandlers() {
        // Filter contests
        const filterSelect = document.getElementById('contest-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterContests(e.target.value);
            });
        }

        // Search contests
        const searchInput = document.getElementById('contest-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchContests(e.target.value);
            });
        }

        // Join contest form
        const joinForm = document.getElementById('join-contest-form');
        if (joinForm) {
            joinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.joinContest();
            });
        }
    }

    async filterContests(filter) {
        try {
            const contests = await this.dataLoader.loadAvailableContests(100);
            let filteredContests = contests;

            if (filter !== 'all') {
                filteredContests = contests.filter(contest => contest.status === filter);
            }

            this.updateContestListUI(filteredContests);
            
        } catch (error) {
            console.error('Error filtering contests:', error);
        }
    }

    async searchContests(query) {
        try {
            const contests = await this.dataLoader.loadAvailableContests(100);
            let filteredContests = contests;

            if (query.trim()) {
                filteredContests = contests.filter(contest => 
                    contest.title.toLowerCase().includes(query.toLowerCase()) ||
                    contest.description.toLowerCase().includes(query.toLowerCase()) ||
                    contest.organizer.toLowerCase().includes(query.toLowerCase())
                );
            }

            this.updateContestListUI(filteredContests);
            
        } catch (error) {
            console.error('Error searching contests:', error);
        }
    }

    async joinContest() {
        try {
            const formData = new FormData(document.getElementById('join-contest-form'));
            const contestId = formData.get('contestId');

            await this.firebaseService.joinContest(contestId);
            this.showSuccessMessage('Successfully joined the contest!');
            document.getElementById('join-contest-form').reset();
            this.renderContestList(); // Refresh the list
            
        } catch (error) {
            console.error('Error joining contest:', error);
            this.showErrorMessage('Failed to join contest. Please try again.');
        }
    }

    getStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'upcoming': 'bg-blue-100 text-blue-800',
            'completed': 'bg-gray-100 text-gray-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getDifficultyColor(difficulty) {
        const colors = {
            'easy': 'bg-green-100 text-green-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'hard': 'bg-red-100 text-red-800',
            'expert': 'bg-purple-100 text-purple-800'
        };
        return colors[difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800';
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
    showDefaultContestList() {
        const container = document.getElementById('contest-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading contests...</p>
                </div>
            `;
        }
    }

    showDefaultContestStats() {
        const defaultStats = {
            totalContests: 0,
            contestsJoined: 0,
            contestsWon: 0,
            averageRank: 'N/A',
            totalPoints: 0,
            winRate: 0,
            currentStreak: 0,
            bestRank: 'N/A'
        };
        this.updateContestStatsUI(defaultStats);
    }

    showDefaultActiveContests() {
        const container = document.getElementById('active-contests-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading active contests...</p>
                </div>
            `;
        }
    }

    showDefaultContestHistory() {
        const container = document.getElementById('contest-history-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading contest history...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('🏆 StudentContestParticipationController: Setting up real-time listeners...');
        
        try {
            const contestsListener = this.dataLoader.setupContestsListener((contests) => {
                console.log('🏆 Contests updated:', contests);
                this.updateContestListUI(contests);
            });
            this.realTimeListeners.push(contestsListener);

            console.log('✅ StudentContestParticipationController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ StudentContestParticipationController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('🏆 StudentContestParticipationController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudentContestParticipationController();
});

export default StudentContestParticipationController;
