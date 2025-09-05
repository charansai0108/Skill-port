/**
 * User Leaderboard Controller
 * Manages leaderboard functionality for students
 */

class UserLeaderboardController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('🏆 User Leaderboard Controller: Initializing...');
        
        try {
            // Load leaderboard data
            await this.loadLeaderboardData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('🏆 User Leaderboard Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadLeaderboardData() {
        console.log('🏆 User Leaderboard Controller: Loading leaderboard data...');
        
        try {
            this.setLoadingState(true);
            
            // Load leaderboard data
            const leaderboardData = await window.dataLoader.loadUserLeaderboard();
            
            this.setData(leaderboardData);
            
            // Render leaderboards
            this.renderLeaderboards(leaderboardData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    renderLeaderboards(data) {
        console.log('🏆 User Leaderboard Controller: Rendering leaderboards...');
        
        // Render overall leaderboard
        this.renderOverallLeaderboard(data.overall);
        
        // Render batch leaderboard
        this.renderBatchLeaderboard(data.batch);
        
        // Render contest leaderboards
        this.renderContestLeaderboards(data.contests);
        
        // Render user's current position
        this.renderUserPosition(data.userPosition);
        
        // Render achievements
        this.renderAchievements(data.achievements);
    }

    renderOverallLeaderboard(leaderboard) {
        if (!leaderboard || !leaderboard.length) {
            window.uiHelpers.showEmpty('overall-leaderboard', 'No leaderboard data available');
            return;
        }

        const leaderboardHtml = leaderboard.map((user, index) => {
            const rank = index + 1;
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            const rankColor = rank <= 3 ? 'text-yellow-600' : 'text-gray-600';
            const isCurrentUser = user._id === window.authManager?.currentUser?.id;
            const userClass = isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white';
            
            return `
                <div class="flex items-center justify-between p-4 ${userClass} rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            ${user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-gray-900">${user.firstName || ''} ${user.lastName || ''} ${isCurrentUser ? '(You)' : ''}</h4>
                            <p class="text-xs text-gray-500">${user.email || ''}</p>
                            <p class="text-xs text-gray-500">Batch: ${user.batch || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="text-center">
                            <div class="text-lg font-semibold text-gray-900">${user.totalPoints || 0}</div>
                            <div class="text-xs text-gray-500">Points</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-semibold text-gray-900">${user.problemsSolved || 0}</div>
                            <div class="text-xs text-gray-500">Solved</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-semibold ${rankColor}">${rankIcon}</div>
                            <div class="text-xs text-gray-500">Rank</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        window.uiHelpers.updateHTML('overall-leaderboard', leaderboardHtml);
    }

    renderBatchLeaderboard(batchLeaderboard) {
        if (!batchLeaderboard || !batchLeaderboard.length) {
            window.uiHelpers.showEmpty('batch-leaderboard', 'No batch leaderboard data available');
            return;
        }

        const leaderboardHtml = batchLeaderboard.map((user, index) => {
            const rank = index + 1;
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            const rankColor = rank <= 3 ? 'text-yellow-600' : 'text-gray-600';
            const isCurrentUser = user._id === window.authManager?.currentUser?.id;
            const userClass = isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white';
            
            return `
                <div class="flex items-center justify-between p-4 ${userClass} rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                            ${user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-gray-900">${user.firstName || ''} ${user.lastName || ''} ${isCurrentUser ? '(You)' : ''}</h4>
                            <p class="text-xs text-gray-500">${user.email || ''}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="text-center">
                            <div class="text-lg font-semibold text-gray-900">${user.totalPoints || 0}</div>
                            <div class="text-xs text-gray-500">Points</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-semibold text-gray-900">${user.problemsSolved || 0}</div>
                            <div class="text-xs text-gray-500">Solved</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-semibold ${rankColor}">${rankIcon}</div>
                            <div class="text-xs text-gray-500">Rank</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        window.uiHelpers.updateHTML('batch-leaderboard', leaderboardHtml);
    }

    renderContestLeaderboards(contestLeaderboards) {
        if (!contestLeaderboards || !contestLeaderboards.length) {
            window.uiHelpers.showEmpty('contest-leaderboards', 'No contest leaderboards available');
            return;
        }

        const contestHtml = contestLeaderboards.map(contest => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">${contest.title || 'Untitled Contest'}</h3>
                        <p class="text-sm text-gray-500">${contest.description || 'No description'}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contest.status === 'completed' ? 'bg-green-100 text-green-800' :
                        contest.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${contest.status || 'Unknown'}
                    </span>
                </div>
                
                <div class="space-y-3">
                    ${contest.leaderboard && contest.leaderboard.length > 0 ? 
                        contest.leaderboard.slice(0, 5).map((participant, index) => {
                            const rank = index + 1;
                            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                            const isCurrentUser = participant.user?._id === window.authManager?.currentUser?.id;
                            const userClass = isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-gray-50';
                            
                            return `
                                <div class="flex items-center justify-between p-3 ${userClass} rounded-lg border">
                                    <div class="flex items-center space-x-3">
                                        <span class="text-sm font-medium text-gray-600">${rankIcon}</span>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">${participant.user?.firstName || ''} ${participant.user?.lastName || ''} ${isCurrentUser ? '(You)' : ''}</p>
                                            <p class="text-xs text-gray-500">${participant.user?.email || ''}</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-semibold text-gray-900">${participant.score || 0} pts</div>
                                        <div class="text-xs text-gray-500">${participant.problemsSolved || 0} solved</div>
                                    </div>
                                </div>
                            `;
                        }).join('') :
                        '<p class="text-sm text-gray-500 text-center py-4">No participants yet</p>'
                    }
                </div>
                
                ${contest.leaderboard && contest.leaderboard.length > 5 ? 
                    `<button onclick="userLeaderboardController.viewFullContestLeaderboard('${contest._id}')" 
                            class="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View Full Leaderboard (${contest.leaderboard.length} participants)
                    </button>` : ''
                }
            </div>
        `).join('');

        window.uiHelpers.updateHTML('contest-leaderboards', contestHtml);
    }

    renderUserPosition(userPosition) {
        if (!userPosition) return;
        
        // Update user position cards
        window.uiHelpers.updateText('overall-rank', userPosition.overallRank || 'N/A');
        window.uiHelpers.updateText('batch-rank', userPosition.batchRank || 'N/A');
        window.uiHelpers.updateText('total-points', userPosition.totalPoints || 0);
        window.uiHelpers.updateText('problems-solved', userPosition.problemsSolved || 0);
        window.uiHelpers.updateText('contests-participated', userPosition.contestsParticipated || 0);
        window.uiHelpers.updateText('win-rate', `${userPosition.winRate || 0}%`);
        
        // Update rank change indicators
        if (userPosition.rankChange) {
            const rankChangeElement = document.getElementById('rank-change');
            if (rankChangeElement) {
                const change = userPosition.rankChange;
                const changeText = change > 0 ? `+${change}` : change.toString();
                const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
                rankChangeElement.innerHTML = `<span class="${changeColor}">${changeText}</span>`;
            }
        }
    }

    renderAchievements(achievements) {
        if (!achievements || !achievements.length) {
            window.uiHelpers.showEmpty('achievements', 'No achievements yet');
            return;
        }

        const achievementsHtml = achievements.map(achievement => `
            <div class="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i data-lucide="${achievement.icon || 'award'}" class="w-5 h-5 text-yellow-600"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">${achievement.title}</h4>
                    <p class="text-xs text-gray-500">${achievement.description}</p>
                </div>
                <div class="text-xs text-gray-500">
                    ${window.uiHelpers.formatTimeAgo(achievement.earnedAt)}
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('achievements', achievementsHtml);
    }

    async viewFullContestLeaderboard(contestId) {
        console.log('🏆 User Leaderboard Controller: Viewing full contest leaderboard:', contestId);
        
        try {
            // Redirect to full contest leaderboard page
            window.location.href = `/pages/user/contest-leaderboard.html?id=${contestId}`;
            
        } catch (error) {
            console.error('🏆 User Leaderboard Controller: Error viewing full leaderboard:', error);
            window.uiHelpers.showError('Error', 'Failed to open full leaderboard');
        }
    }

    setupEventListeners() {
        console.log('🏆 User Leaderboard Controller: Setting up event listeners...');
        
        // Refresh button
        const refreshButton = document.getElementById('refresh-leaderboard');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadLeaderboardData();
            });
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterLeaderboard(filter);
            });
        });
        
        // Time period buttons
        const timePeriodButtons = document.querySelectorAll('[data-time-period]');
        timePeriodButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const timePeriod = e.target.dataset.timePeriod;
                this.filterByTimePeriod(timePeriod);
            });
        });
    }

    async filterLeaderboard(filter) {
        console.log('🏆 User Leaderboard Controller: Filtering leaderboard by:', filter);
        
        try {
            this.setLoadingState(true);
            
            // Load filtered leaderboard data
            const leaderboardData = await window.dataLoader.loadUserLeaderboard({ filter });
            
            // Re-render with filtered data
            this.renderLeaderboards(leaderboardData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('🏆 User Leaderboard Controller: Error filtering leaderboard:', error);
        }
    }

    async filterByTimePeriod(timePeriod) {
        console.log('🏆 User Leaderboard Controller: Filtering by time period:', timePeriod);
        
        try {
            this.setLoadingState(true);
            
            // Load filtered leaderboard data
            const leaderboardData = await window.dataLoader.loadUserLeaderboard({ timePeriod });
            
            // Re-render with filtered data
            this.renderLeaderboards(leaderboardData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('🏆 User Leaderboard Controller: Error filtering by time period:', error);
        }
    }

    setupRealTimeUpdates() {
        console.log('🏆 User Leaderboard Controller: Setting up real-time updates...');
        
        // Refresh leaderboard data every 3 minutes
        setInterval(() => {
            console.log('🏆 User Leaderboard Controller: Refreshing leaderboard data...');
            this.loadLeaderboardData();
        }, 180000); // 3 minutes
    }
}

// Initialize user leaderboard controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏆 Initializing User Leaderboard Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            // Check if we're on the user leaderboard page
            if (window.location.pathname.includes('/user/user-leaderboard')) {
                window.userLeaderboardController = new UserLeaderboardController();
            }
        } catch (error) {
            console.error('🏆 Failed to initialize User Leaderboard Controller:', error);
        }
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserLeaderboardController;
}
