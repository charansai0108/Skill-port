/**
 * Leaderboard Controller
 * Manages leaderboard display and interactions
 */

import leaderboardService from '../services/leaderboardService.js';

class LeaderboardController extends PageController {
    constructor() {
        super();
        this.currentLeaderboard = [];
        this.currentType = 'global';
        this.currentId = null;
        this.currentFilters = {
            timeRange: 'all',
            limit: 50,
            offset: 0
        };
    }

    async initialize() {
        try {
            this.setupEventListeners();
            await this.loadLeaderboard();
            this.startRealTimeUpdates();
        } catch (error) {
            console.error('Leaderboard Controller initialization error:', error);
        }
    }

    setupEventListeners() {
        // Filter controls
        const timeRangeSelect = document.getElementById('timeRangeFilter');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => {
                this.currentFilters.timeRange = e.target.value;
                this.loadLeaderboard();
            });
        }

        const limitSelect = document.getElementById('limitFilter');
        if (limitSelect) {
            limitSelect.addEventListener('change', (e) => {
                this.currentFilters.limit = parseInt(e.target.value);
                this.currentFilters.offset = 0;
                this.loadLeaderboard();
            });
        }

        // Pagination
        const prevButton = document.getElementById('prevPage');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentFilters.offset > 0) {
                    this.currentFilters.offset -= this.currentFilters.limit;
                    this.loadLeaderboard();
                }
            });
        }

        const nextButton = document.getElementById('nextPage');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.currentFilters.offset += this.currentFilters.limit;
                this.loadLeaderboard();
            });
        }

        // Refresh button
        const refreshButton = document.getElementById('refreshLeaderboard');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadLeaderboard();
            });
        }

        // Leaderboard type tabs
        const globalTab = document.getElementById('globalTab');
        if (globalTab) {
            globalTab.addEventListener('click', () => {
                this.switchLeaderboardType('global');
            });
        }

        const communityTab = document.getElementById('communityTab');
        if (communityTab) {
            communityTab.addEventListener('click', () => {
                this.switchLeaderboardType('community');
            });
        }

        const contestTab = document.getElementById('contestTab');
        if (contestTab) {
            contestTab.addEventListener('click', () => {
                this.switchLeaderboardType('contest');
            });
        }
    }

    async loadLeaderboard() {
        try {
            this.showLoading(true);
            
            let leaderboard = [];
            
            switch (this.currentType) {
                case 'community':
                    if (this.currentId) {
                        leaderboard = await leaderboardService.getCommunityLeaderboard(
                            this.currentId, 
                            this.currentFilters
                        );
                    }
                    break;
                case 'contest':
                    if (this.currentId) {
                        leaderboard = await leaderboardService.getContestLeaderboard(
                            this.currentId, 
                            this.currentFilters
                        );
                    }
                    break;
                default:
                    leaderboard = await leaderboardService.getGlobalLeaderboard(this.currentFilters);
            }

            this.currentLeaderboard = leaderboard;
            this.renderLeaderboard();
            this.updatePagination();
            
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showError('Failed to load leaderboard');
        } finally {
            this.showLoading(false);
        }
    }

    renderLeaderboard() {
        const container = document.getElementById('leaderboardContainer');
        if (!container) return;

        if (this.currentLeaderboard.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-gray-500 text-lg">No data available</div>
                    <div class="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later</div>
                </div>
            `;
            return;
        }

        const formattedLeaderboard = leaderboardService.formatLeaderboard(this.currentLeaderboard);
        
        container.innerHTML = `
            <div class="space-y-4">
                ${formattedLeaderboard.map((entry, index) => this.renderLeaderboardEntry(entry, index)).join('')}
            </div>
        `;
    }

    renderLeaderboardEntry(entry, index) {
        const rankClass = this.getRankClass(entry.rank);
        const isCurrentUser = entry.userId === window.authManager?.getUserId();
        const userClass = isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200';
        
        return `
            <div class="leaderboard-entry ${userClass} border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="rank-badge ${rankClass}">
                            ${entry.rankDisplay}
                        </div>
                        <div class="user-info flex items-center space-x-3">
                            <img src="${entry.photoURL || '/images/default-avatar.png'}" 
                                 alt="${entry.displayName}" 
                                 class="w-10 h-10 rounded-full object-cover">
                            <div>
                                <div class="font-semibold text-gray-900">
                                    ${entry.displayName}
                                    ${isCurrentUser ? '<span class="text-blue-600 text-sm ml-2">(You)</span>' : ''}
                                </div>
                                <div class="text-sm text-gray-500">${entry.userId}</div>
                            </div>
                        </div>
                    </div>
                    <div class="score-info flex items-center space-x-6">
                        ${entry.displayScore !== null ? `
                            <div class="text-center">
                                <div class="text-2xl font-bold text-gray-900">${entry.displayScore}</div>
                                <div class="text-xs text-gray-500">Score</div>
                            </div>
                        ` : ''}
                        ${entry.displaySubmissions !== null ? `
                            <div class="text-center">
                                <div class="text-lg font-semibold text-gray-700">${entry.displaySubmissions}</div>
                                <div class="text-xs text-gray-500">Submissions</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getRankClass(rank) {
        if (rank === 1) return 'bg-yellow-100 text-yellow-800';
        if (rank === 2) return 'bg-gray-100 text-gray-800';
        if (rank === 3) return 'bg-orange-100 text-orange-800';
        return 'bg-gray-50 text-gray-600';
    }

    updatePagination() {
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');

        if (prevButton) {
            prevButton.disabled = this.currentFilters.offset === 0;
        }

        if (nextButton) {
            nextButton.disabled = this.currentLeaderboard.length < this.currentFilters.limit;
        }

        if (pageInfo) {
            const currentPage = Math.floor(this.currentFilters.offset / this.currentFilters.limit) + 1;
            pageInfo.textContent = `Page ${currentPage}`;
        }
    }

    switchLeaderboardType(type) {
        this.currentType = type;
        this.currentId = this.getCurrentContextId(type);
        this.currentFilters.offset = 0;
        
        this.updateActiveTab(type);
        this.loadLeaderboard();
    }

    getCurrentContextId(type) {
        switch (type) {
            case 'community':
                return window.authManager?.getCurrentUser()?.community;
            case 'contest':
                return this.getCurrentContestId();
            default:
                return null;
        }
    }

    getCurrentContestId() {
        // Get contest ID from URL or current context
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('contestId') || null;
    }

    updateActiveTab(activeType) {
        const tabs = ['globalTab', 'communityTab', 'contestTab'];
        tabs.forEach(tabId => {
            const tab = document.getElementById(tabId);
            if (tab) {
                if (tabId === `${activeType}Tab`) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            }
        });
    }

    startRealTimeUpdates() {
        if (this.currentType === 'global') {
            leaderboardService.startRealTimeUpdates('global', null, (leaderboard) => {
                this.currentLeaderboard = leaderboard;
                this.renderLeaderboard();
            });
        } else if (this.currentId) {
            leaderboardService.startRealTimeUpdates(this.currentType, this.currentId, (leaderboard) => {
                this.currentLeaderboard = leaderboard;
                this.renderLeaderboard();
            });
        }
    }

    stopRealTimeUpdates() {
        if (this.currentType === 'global') {
            leaderboardService.stopRealTimeUpdates('global', null);
        } else if (this.currentId) {
            leaderboardService.stopRealTimeUpdates(this.currentType, this.currentId);
        }
    }

    showLoading(show) {
        const loadingElement = document.getElementById('leaderboardLoading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        const errorElement = document.getElementById('leaderboardError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    cleanup() {
        this.stopRealTimeUpdates();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('leaderboardContainer')) {
        window.leaderboardController = new LeaderboardController();
        window.leaderboardController.initialize();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeaderboardController;
}
