/**
 * Admin Leaderboard Controller
 * Manages leaderboard and ranking functionality for admins
 */

class AdminLeaderboardController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('🏆 Admin Leaderboard Controller: Initializing...');
        
        try {
            // Load leaderboard data
            await this.loadLeaderboardData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('🏆 Admin Leaderboard Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadLeaderboardData() {
        console.log('🏆 Admin Leaderboard Controller: Loading leaderboard data...');
        
        try {
            this.setLoadingState(true);
            
            // Load leaderboard data
            const leaderboardData = await window.dataLoader.loadLeaderboard();
            
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
        console.log('🏆 Admin Leaderboard Controller: Rendering leaderboards...');
        
        // Render overall leaderboard
        this.renderOverallLeaderboard(data.overall);
        
        // Render contest leaderboards
        this.renderContestLeaderboards(data.contests);
        
        // Render mentor leaderboard
        this.renderMentorLeaderboard(data.mentors);
        
        // Render batch leaderboards
        this.renderBatchLeaderboards(data.batches);
    }

    renderOverallLeaderboard(overallData) {
        if (!overallData || !overallData.length) {
            window.uiHelpers.showEmpty('overall-leaderboard', 'No leaderboard data available');
            return;
        }

        const leaderboardHtml = overallData.map((user, index) => {
            const rank = index + 1;
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            const rankColor = rank <= 3 ? 'text-yellow-600' : 'text-gray-600';
            
            return `
                <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            ${user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-gray-900">${user.firstName || ''} ${user.lastName || ''}</h4>
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

    renderContestLeaderboards(contestData) {
        if (!contestData || !contestData.length) {
            window.uiHelpers.showEmpty('contest-leaderboards', 'No contest leaderboards available');
            return;
        }

        const contestHtml = contestData.map(contest => `
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
                            
                            return `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div class="flex items-center space-x-3">
                                        <span class="text-sm font-medium text-gray-600">${rankIcon}</span>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">${participant.user?.firstName || ''} ${participant.user?.lastName || ''}</p>
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
                    `<button onclick="adminLeaderboardController.viewFullLeaderboard('${contest._id}')" 
                            class="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View Full Leaderboard (${contest.leaderboard.length} participants)
                    </button>` : ''
                }
            </div>
        `).join('');

        window.uiHelpers.updateHTML('contest-leaderboards', contestHtml);
    }

    renderMentorLeaderboard(mentorData) {
        if (!mentorData || !mentorData.length) {
            window.uiHelpers.showEmpty('mentor-leaderboard', 'No mentor data available');
            return;
        }

        const mentorHtml = mentorData.map((mentor, index) => {
            const rank = index + 1;
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            
            return `
                <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                            ${mentor.firstName?.charAt(0) || 'M'}
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-gray-900">${mentor.firstName || ''} ${mentor.lastName || ''}</h4>
                            <p class="text-xs text-gray-500">${mentor.email || ''}</p>
                            <div class="flex flex-wrap gap-1 mt-1">
                                ${mentor.expertise && mentor.expertise.length > 0 ? 
                                    mentor.expertise.slice(0, 3).map(skill => 
                                        `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">${skill}</span>`
                                    ).join('') : ''
                                }
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="text-center">
                            <div class="text-lg font-semibold text-gray-900">${mentor.studentsHelped || 0}</div>
                            <div class="text-xs text-gray-500">Students</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-semibold text-gray-900">${mentor.problemsSolved || 0}</div>
                            <div class="text-xs text-gray-500">Solved</div>
                        </div>
                        <div class="text-center">
                            <div class="text-lg font-semibold text-gray-600">${rankIcon}</div>
                            <div class="text-xs text-gray-500">Rank</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        window.uiHelpers.updateHTML('mentor-leaderboard', mentorHtml);
    }

    renderBatchLeaderboards(batchData) {
        if (!batchData || !batchData.length) {
            window.uiHelpers.showEmpty('batch-leaderboards', 'No batch data available');
            return;
        }

        const batchHtml = batchData.map(batch => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Batch ${batch.name || 'Unknown'}</h3>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${batch.studentCount || 0} students
                    </span>
                </div>
                
                <div class="space-y-3">
                    ${batch.leaderboard && batch.leaderboard.length > 0 ? 
                        batch.leaderboard.slice(0, 5).map((student, index) => {
                            const rank = index + 1;
                            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                            
                            return `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div class="flex items-center space-x-3">
                                        <span class="text-sm font-medium text-gray-600">${rankIcon}</span>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">${student.firstName || ''} ${student.lastName || ''}</p>
                                            <p class="text-xs text-gray-500">${student.email || ''}</p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-semibold text-gray-900">${student.totalPoints || 0} pts</div>
                                        <div class="text-xs text-gray-500">${student.problemsSolved || 0} solved</div>
                                    </div>
                                </div>
                            `;
                        }).join('') :
                        '<p class="text-sm text-gray-500 text-center py-4">No students in this batch</p>'
                    }
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('batch-leaderboards', batchHtml);
    }

    async viewFullLeaderboard(contestId) {
        console.log('🏆 Admin Leaderboard Controller: Viewing full leaderboard for contest:', contestId);
        
        try {
            // Redirect to full leaderboard page
            window.location.href = `/pages/admin/contest-leaderboard.html?id=${contestId}`;
            
        } catch (error) {
            console.error('🏆 Admin Leaderboard Controller: Error viewing full leaderboard:', error);
            window.uiHelpers.showError('Error', 'Failed to load full leaderboard');
        }
    }

    setupEventListeners() {
        console.log('🏆 Admin Leaderboard Controller: Setting up event listeners...');
        
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
        
        // Export buttons
        const exportButton = document.getElementById('export-leaderboard');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportLeaderboard();
            });
        }
    }

    async filterLeaderboard(filter) {
        console.log('🏆 Admin Leaderboard Controller: Filtering leaderboard by:', filter);
        
        try {
            this.setLoadingState(true);
            
            // Load filtered leaderboard data
            const leaderboardData = await window.dataLoader.loadLeaderboard({ filter });
            
            // Re-render with filtered data
            this.renderLeaderboards(leaderboardData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('🏆 Admin Leaderboard Controller: Error filtering leaderboard:', error);
        }
    }

    async exportLeaderboard() {
        console.log('🏆 Admin Leaderboard Controller: Exporting leaderboard...');
        
        try {
            const response = await window.APIService.exportLeaderboard();
            
            if (response.success) {
                // Create download link
                const blob = new Blob([response.data], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `leaderboard-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                window.uiHelpers.showSuccess('Success', 'Leaderboard data exported successfully');
            } else {
                window.uiHelpers.showError('Error', 'Failed to export leaderboard data');
            }
            
        } catch (error) {
            console.error('🏆 Admin Leaderboard Controller: Error exporting leaderboard:', error);
            window.uiHelpers.showError('Error', 'Failed to export leaderboard data');
        }
    }

    setupRealTimeUpdates() {
        console.log('🏆 Admin Leaderboard Controller: Setting up real-time updates...');
        
        // Refresh leaderboard data every 2 minutes
        setInterval(() => {
            console.log('🏆 Admin Leaderboard Controller: Refreshing leaderboard data...');
            this.loadLeaderboardData();
        }, 120000); // 2 minutes
    }
}

// Initialize admin leaderboard controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏆 Initializing Admin Leaderboard Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            // Check if we're on the admin leaderboard page
            if (window.location.pathname.includes('/admin/admin-leaderboard')) {
                window.adminLeaderboardController = new AdminLeaderboardController();
            }
        } catch (error) {
            console.error('🏆 Failed to initialize Admin Leaderboard Controller:', error);
        }
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminLeaderboardController;
}
