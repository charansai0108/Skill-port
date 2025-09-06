/**
 * User Contests Controller
 * Manages user contest participation functionality
 */

class UserContestsController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('🏆 User Contests Controller: Initializing...');
        
        try {
            // Load user contests data
            await this.loadUserContestsData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('🏆 User Contests Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadUserContestsData() {
        console.log('🏆 User Contests Controller: Loading user contests data...');
        
        try {
            this.setLoadingState(true);
            
            // Load user-specific contests data
            const contestsData = await window.dataLoader.loadUserContests();
            
            this.setData(contestsData);
            
            // Render contests
            this.renderContests(contestsData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    renderContests(contestsData) {
        console.log('🏆 User Contests Controller: Rendering contests...');
        
        const contests = contestsData?.data?.contests || [];
        
        if (contests.length === 0) {
            window.uiHelpers.showEmpty('contests-list', 'No contests available');
            return;
        }

        // Render contests grid
        const contestsHtml = contests.map(contest => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            🏆
                        </div>
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">${contest.title || 'Untitled Contest'}</h3>
                            <p class="text-sm text-gray-500">${contest.description || 'No description'}</p>
                        </div>
                    </div>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        contest.status === 'published' ? 'bg-green-100 text-green-800' :
                        contest.status === 'registration_open' ? 'bg-blue-100 text-blue-800' :
                        contest.status === 'ongoing' ? 'bg-purple-100 text-purple-800' :
                        contest.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                    }">
                        ${contest.status || 'Draft'}
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="text-sm">
                        <p class="text-gray-500">Start Time</p>
                        <p class="font-medium text-gray-900">${window.uiHelpers.formatDateTime(contest.startTime)}</p>
                    </div>
                    <div class="text-sm">
                        <p class="text-gray-500">Duration</p>
                        <p class="font-medium text-gray-900">${contest.duration || 0} minutes</p>
                    </div>
                    <div class="text-sm">
                        <p class="text-gray-500">Participants</p>
                        <p class="font-medium text-gray-900">${contest.participants?.length || 0}/${contest.maxParticipants || 0}</p>
                    </div>
                    <div class="text-sm">
                        <p class="text-gray-500">Problems</p>
                        <p class="font-medium text-gray-900">${contest.problems?.length || 0}</p>
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contest.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        contest.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        contest.difficulty === 'advanced' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${contest.difficulty || 'Mixed'}
                    </span>
                    
                    ${this.renderContestProgress(contest)}
                </div>
                
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-500">
                        ${this.getContestTimeStatus(contest)}
                    </div>
                    <div class="flex space-x-2">
                        ${this.renderContestActions(contest)}
                    </div>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('contests-list', contestsHtml);
    }

    renderContestProgress(contest) {
        if (!contest.userProgress) {
            return '<span class="text-sm text-gray-500">Not participated</span>';
        }
        
        const progress = contest.userProgress;
        const totalProblems = contest.problems?.length || 0;
        const solvedProblems = progress.problemsSolved || 0;
        const percentage = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0;
        
        return `
            <div class="flex items-center space-x-2">
                <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                </div>
                <span class="text-sm text-gray-600">${solvedProblems}/${totalProblems}</span>
            </div>
        `;
    }

    renderContestActions(contest) {
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);
        const registrationEnd = new Date(contest.registrationEnd);
        
        let actions = [];
        
        if (now < registrationEnd) {
            // Registration is still open
            if (contest.userProgress) {
                actions.push(`
                    <button onclick="userContestsController.viewContest('${contest._id}')" 
                            class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                        View Details
                    </button>
                `);
            } else {
                actions.push(`
                    <button onclick="userContestsController.registerForContest('${contest._id}')" 
                            class="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                        Register
                    </button>
                `);
            }
        } else if (now >= startTime && now <= endTime) {
            // Contest is ongoing
            if (contest.userProgress) {
                actions.push(`
                    <button onclick="userContestsController.enterContest('${contest._id}')" 
                            class="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700">
                        Enter Contest
                    </button>
                `);
            } else {
                actions.push(`
                    <span class="px-3 py-1 bg-gray-300 text-gray-600 text-sm rounded-md">
                        Registration Closed
                    </span>
                `);
            }
        } else if (now > endTime) {
            // Contest is completed
            if (contest.userProgress) {
                actions.push(`
                    <button onclick="userContestsController.viewResults('${contest._id}')" 
                            class="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700">
                        View Results
                    </button>
                `);
            } else {
                actions.push(`
                    <span class="px-3 py-1 bg-gray-300 text-gray-600 text-sm rounded-md">
                        Contest Ended
                    </span>
                `);
            }
        } else {
            // Contest hasn't started yet
            actions.push(`
                <button onclick="userContestsController.viewContest('${contest._id}')" 
                        class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                    View Details
                </button>
            `);
        }
        
        return actions.join('');
    }

    getContestTimeStatus(contest) {
        const now = new Date();
        const startTime = new Date(contest.startTime);
        const endTime = new Date(contest.endTime);
        const registrationEnd = new Date(contest.registrationEnd);
        
        if (now < registrationEnd) {
            const timeLeft = registrationEnd - now;
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            return `Registration ends in ${hours}h ${minutes}m`;
        } else if (now >= startTime && now <= endTime) {
            const timeLeft = endTime - now;
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            return `Contest ends in ${hours}h ${minutes}m`;
        } else if (now > endTime) {
            return 'Contest completed';
        } else {
            const timeLeft = startTime - now;
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            return `Starts in ${hours}h ${minutes}m`;
        }
    }

    async registerForContest(contestId) {
        console.log('🏆 User Contests Controller: Registering for contest:', contestId);
        
        try {
            const response = await window.APIService.registerForContest(contestId);
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Successfully registered for contest!');
                // Refresh contests data
                await this.loadUserContestsData();
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to register for contest');
            }
            
        } catch (error) {
            console.error('🏆 User Contests Controller: Error registering for contest:', error);
            window.uiHelpers.showError('Error', 'Failed to register for contest');
        }
    }

    async enterContest(contestId) {
        console.log('🏆 User Contests Controller: Entering contest:', contestId);
        
        try {
            // Redirect to contest page
            window.location.href = `/pages/student/contest-participation.html?id=${contestId}`;
            
        } catch (error) {
            console.error('🏆 User Contests Controller: Error entering contest:', error);
            window.uiHelpers.showError('Error', 'Failed to enter contest');
        }
    }

    async viewContest(contestId) {
        console.log('🏆 User Contests Controller: Viewing contest:', contestId);
        
        try {
            // Redirect to contest details page
            window.location.href = `/pages/student/contest-details.html?id=${contestId}`;
            
        } catch (error) {
            console.error('🏆 User Contests Controller: Error viewing contest:', error);
            window.uiHelpers.showError('Error', 'Failed to load contest details');
        }
    }

    async viewResults(contestId) {
        console.log('🏆 User Contests Controller: Viewing results:', contestId);
        
        try {
            // Redirect to contest results page
            window.location.href = `/pages/student/contest-results.html?id=${contestId}`;
            
        } catch (error) {
            console.error('🏆 User Contests Controller: Error viewing results:', error);
            window.uiHelpers.showError('Error', 'Failed to load contest results');
        }
    }

    setupEventListeners() {
        console.log('🏆 User Contests Controller: Setting up event listeners...');
        
        // Refresh button
        const refreshButton = document.getElementById('refresh-contests');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadUserContestsData();
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

    async filterContests(filter) {
        console.log('🏆 User Contests Controller: Filtering contests by:', filter);
        
        try {
            this.setLoadingState(true);
            
            // Load filtered contests data
            const contestsData = await window.dataLoader.loadUserContests({ filter });
            
            // Render filtered contests
            this.renderContests(contestsData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('🏆 User Contests Controller: Error filtering contests:', error);
        }
    }

    setupRealTimeUpdates() {
        console.log('🏆 User Contests Controller: Setting up real-time updates...');
        
        // Refresh contests data every 30 seconds
        setInterval(() => {
            console.log('🏆 User Contests Controller: Refreshing contests data...');
            this.loadUserContestsData();
        }, 30000);
    }
}

// Initialize user contests controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏆 Initializing User Contests Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            window.userContestsController = new UserContestsController();
        } catch (error) {
            console.error('🏆 Failed to initialize User Contests Controller:', error);
        }
    }, 1000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserContestsController;
}

