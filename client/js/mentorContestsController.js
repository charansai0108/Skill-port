/**
 * Mentor Contests Controller
 * Manages contest-related functionality for mentors
 */

class MentorContestsController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('🏆 Mentor Contests Controller: Initializing...');
        
        try {
            // Load mentor contests data
            await this.loadMentorContests();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('🏆 Mentor Contests Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadMentorContests() {
        console.log('🏆 Mentor Contests Controller: Loading mentor contests...');
        
        try {
            this.setLoadingState(true);
            
            // Load mentor contests data
            const contestsData = await window.dataLoader.loadMentorContests();
            
            this.setData(contestsData);
            
            // Render contests
            this.renderContests(contestsData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    renderContests(data) {
        console.log('🏆 Mentor Contests Controller: Rendering contests...');
        
        // Render active contests
        this.renderActiveContests(data.activeContests);
        
        // Render upcoming contests
        this.renderUpcomingContests(data.upcomingContests);
        
        // Render past contests
        this.renderPastContests(data.pastContests);
        
        // Render contest statistics
        this.renderContestStats(data.stats);
    }

    renderActiveContests(contests) {
        if (!contests || !contests.length) {
            window.uiHelpers.showEmpty('active-contests', 'No active contests');
            return;
        }

        const contestsHtml = contests.map(contest => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">${contest.title || 'Untitled Contest'}</h3>
                        <p class="text-sm text-gray-500">${contest.description || 'No description'}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-gray-500">Start Time</p>
                        <p class="text-sm font-medium text-gray-900">${window.uiHelpers.formatDateTime(contest.startTime)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">End Time</p>
                        <p class="text-sm font-medium text-gray-900">${window.uiHelpers.formatDateTime(contest.endTime)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Participants</p>
                        <p class="text-sm font-medium text-gray-900">${contest.participants || 0}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Problems</p>
                        <p class="text-sm font-medium text-gray-900">${contest.problems?.length || 0}</p>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="mentorContestsController.manageContest('${contest._id}')" 
                            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Manage Contest
                    </button>
                    <button onclick="mentorContestsController.viewLeaderboard('${contest._id}')" 
                            class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                        View Leaderboard
                    </button>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('active-contests', contestsHtml);
    }

    renderUpcomingContests(contests) {
        if (!contests || !contests.length) {
            window.uiHelpers.showEmpty('upcoming-contests', 'No upcoming contests');
            return;
        }

        const contestsHtml = contests.map(contest => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">${contest.title || 'Untitled Contest'}</h3>
                        <p class="text-sm text-gray-500">${contest.description || 'No description'}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Upcoming
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-gray-500">Start Time</p>
                        <p class="text-sm font-medium text-gray-900">${window.uiHelpers.formatDateTime(contest.startTime)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Duration</p>
                        <p class="text-sm font-medium text-gray-900">${contest.duration || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Registered</p>
                        <p class="text-sm font-medium text-gray-900">${contest.registered || 0}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Problems</p>
                        <p class="text-sm font-medium text-gray-900">${contest.problems?.length || 0}</p>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="mentorContestsController.editContest('${contest._id}')" 
                            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Edit Contest
                    </button>
                    <button onclick="mentorContestsController.previewContest('${contest._id}')" 
                            class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                        Preview
                    </button>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('upcoming-contests', contestsHtml);
    }

    renderPastContests(contests) {
        if (!contests || !contests.length) {
            window.uiHelpers.showEmpty('past-contests', 'No past contests');
            return;
        }

        const contestsHtml = contests.map(contest => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">${contest.title || 'Untitled Contest'}</h3>
                        <p class="text-sm text-gray-500">${contest.description || 'No description'}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Completed
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-gray-500">Ended</p>
                        <p class="text-sm font-medium text-gray-900">${window.uiHelpers.formatDateTime(contest.endTime)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Participants</p>
                        <p class="text-sm font-medium text-gray-900">${contest.participants || 0}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Avg Score</p>
                        <p class="text-sm font-medium text-gray-900">${contest.averageScore || 0}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Problems</p>
                        <p class="text-sm font-medium text-gray-900">${contest.problems?.length || 0}</p>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="mentorContestsController.viewResults('${contest._id}')" 
                            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        View Results
                    </button>
                    <button onclick="mentorContestsController.duplicateContest('${contest._id}')" 
                            class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                        Duplicate
                    </button>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('past-contests', contestsHtml);
    }

    renderContestStats(stats) {
        if (!stats) return;
        
        // Update statistics cards
        window.uiHelpers.updateText('total-contests', stats.totalContests || 0);
        window.uiHelpers.updateText('active-contests-count', stats.activeContests || 0);
        window.uiHelpers.updateText('total-participants', stats.totalParticipants || 0);
        window.uiHelpers.updateText('avg-participation', stats.averageParticipation || 0);
    }

    async manageContest(contestId) {
        console.log('🏆 Mentor Contests Controller: Managing contest:', contestId);
        
        try {
            // Redirect to contest management page
            window.location.href = `/pages/mentor/mentor-contest-manage.html?id=${contestId}`;
            
        } catch (error) {
            console.error('🏆 Mentor Contests Controller: Error managing contest:', error);
            window.uiHelpers.showError('Error', 'Failed to open contest management');
        }
    }

    async viewLeaderboard(contestId) {
        console.log('🏆 Mentor Contests Controller: Viewing leaderboard for contest:', contestId);
        
        try {
            // Redirect to contest leaderboard page
            window.location.href = `/pages/mentor/mentor-contest-leaderboard.html?id=${contestId}`;
            
        } catch (error) {
            console.error('🏆 Mentor Contests Controller: Error viewing leaderboard:', error);
            window.uiHelpers.showError('Error', 'Failed to open leaderboard');
        }
    }

    async editContest(contestId) {
        console.log('🏆 Mentor Contests Controller: Editing contest:', contestId);
        
        try {
            // Redirect to contest edit page
            window.location.href = `/pages/mentor/mentor-contest-manage.html?id=${contestId}&mode=edit`;
            
        } catch (error) {
            console.error('🏆 Mentor Contests Controller: Error editing contest:', error);
            window.uiHelpers.showError('Error', 'Failed to open contest editor');
        }
    }

    async previewContest(contestId) {
        console.log('🏆 Mentor Contests Controller: Previewing contest:', contestId);
        
        try {
            // Open contest preview in new tab
            window.open(`/pages/mentor/mentor-contest-manage.html?id=${contestId}&mode=preview`, '_blank');
            
        } catch (error) {
            console.error('🏆 Mentor Contests Controller: Error previewing contest:', error);
            window.uiHelpers.showError('Error', 'Failed to open contest preview');
        }
    }

    async viewResults(contestId) {
        console.log('🏆 Mentor Contests Controller: Viewing results for contest:', contestId);
        
        try {
            // Redirect to contest results page
            window.location.href = `/pages/mentor/mentor-contest-leaderboard.html?id=${contestId}&view=results`;
            
        } catch (error) {
            console.error('🏆 Mentor Contests Controller: Error viewing results:', error);
            window.uiHelpers.showError('Error', 'Failed to open contest results');
        }
    }

    async duplicateContest(contestId) {
        console.log('🏆 Mentor Contests Controller: Duplicating contest:', contestId);
        
        try {
            const response = await window.APIService.duplicateContest(contestId);
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Contest duplicated successfully');
                // Refresh the contests list
                await this.loadMentorContests();
            } else {
                window.uiHelpers.showError('Error', 'Failed to duplicate contest');
            }
            
        } catch (error) {
            console.error('🏆 Mentor Contests Controller: Error duplicating contest:', error);
            window.uiHelpers.showError('Error', 'Failed to duplicate contest');
        }
    }

    setupEventListeners() {
        console.log('🏆 Mentor Contests Controller: Setting up event listeners...');
        
        // Create contest button
        const createButton = document.getElementById('create-contest');
        if (createButton) {
            createButton.addEventListener('click', () => {
                this.createNewContest();
            });
        }
        
        // Refresh button
        const refreshButton = document.getElementById('refresh-contests');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadMentorContests();
            });
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterContests(filter);
            });
        });
    }

    async createNewContest() {
        console.log('🏆 Mentor Contests Controller: Creating new contest...');
        
        try {
            // Redirect to contest creation page
            window.location.href = '/pages/mentor/mentor-contest-manage.html?mode=create';
            
        } catch (error) {
            console.error('🏆 Mentor Contests Controller: Error creating contest:', error);
            window.uiHelpers.showError('Error', 'Failed to open contest creator');
        }
    }

    async filterContests(filter) {
        console.log('🏆 Mentor Contests Controller: Filtering contests by:', filter);
        
        try {
            this.setLoadingState(true);
            
            // Load filtered contests data
            const contestsData = await window.dataLoader.loadMentorContests({ filter });
            
            // Re-render with filtered data
            this.renderContests(contestsData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('🏆 Mentor Contests Controller: Error filtering contests:', error);
        }
    }

    setupRealTimeUpdates() {
        console.log('🏆 Mentor Contests Controller: Setting up real-time updates...');
        
        // Refresh contests data every 2 minutes
        setInterval(() => {
            console.log('🏆 Mentor Contests Controller: Refreshing contests data...');
            this.loadMentorContests();
        }, 120000); // 2 minutes
    }
}

// Initialize mentor contests controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏆 Initializing Mentor Contests Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            // Check if we're on the mentor contests page
            if (window.location.pathname.includes('/mentor/mentor-contests')) {
                window.mentorContestsController = new MentorContestsController();
            }
        } catch (error) {
            console.error('🏆 Failed to initialize Mentor Contests Controller:', error);
        }
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MentorContestsController;
}
