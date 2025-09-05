/**
 * Admin Contests Controller
 * Manages contest administration functionality
 */

class AdminContestsController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('🏆 Admin Contests Controller: Initializing...');
        
        try {
            // Load contests data
            await this.loadContestsData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('🏆 Admin Contests Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadContestsData() {
        console.log('🏆 Admin Contests Controller: Loading contests data...');
        
        try {
            this.setLoadingState(true);
            
            // Load all contests in the community
            const contestsData = await window.dataLoader.loadAllContests({
                limit: 50,
                sort: '-createdAt'
            });
            
            this.setData({ contests: contestsData });
            
            // Render contests
            this.renderContests(contestsData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    renderContests(contestsData) {
        console.log('🏆 Admin Contests Controller: Rendering contests...');
        
        const contests = contestsData?.data?.contests || [];
        
        if (contests.length === 0) {
            window.uiHelpers.showEmpty('contests-list', 'No contests found');
            return;
        }

        // Render contests table
        const columns = [
            {
                header: 'Contest',
                key: 'contest',
                render: (contest) => `
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                            🏆
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">${contest.title || 'Untitled Contest'}</p>
                            <p class="text-xs text-gray-500">${contest.description || 'No description'}</p>
                        </div>
                    </div>
                `
            },
            {
                header: 'Difficulty',
                key: 'difficulty',
                render: (contest) => `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contest.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        contest.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        contest.difficulty === 'advanced' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${contest.difficulty || 'Mixed'}
                    </span>
                `
            },
            {
                header: 'Status',
                key: 'status',
                render: (contest) => `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contest.status === 'published' ? 'bg-green-100 text-green-800' :
                        contest.status === 'registration_open' ? 'bg-blue-100 text-blue-800' :
                        contest.status === 'ongoing' ? 'bg-purple-100 text-purple-800' :
                        contest.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                    }">
                        ${contest.status || 'Draft'}
                    </span>
                `
            },
            {
                header: 'Start Time',
                key: 'startTime',
                render: (contest) => window.uiHelpers.formatDateTime(contest.startTime)
            },
            {
                header: 'Duration',
                key: 'duration',
                render: (contest) => `${contest.duration || 0} min`
            },
            {
                header: 'Participants',
                key: 'participants',
                render: (contest) => `${contest.participants?.length || 0}/${contest.maxParticipants || 0}`
            },
            {
                header: 'Actions',
                key: 'actions',
                render: (contest) => `
                    <div class="flex space-x-2">
                        <button onclick="adminContestsController.editContest('${contest._id}')" class="text-blue-600 hover:text-blue-900 text-sm">
                            Edit
                        </button>
                        <button onclick="adminContestsController.viewContest('${contest._id}')" class="text-green-600 hover:text-green-900 text-sm">
                            View
                        </button>
                        <button onclick="adminContestsController.deleteContest('${contest._id}')" class="text-red-600 hover:text-red-900 text-sm">
                            Delete
                        </button>
                    </div>
                `
            }
        ];

        window.uiHelpers.renderTable('contests-list', contests, columns);
    }

    async editContest(contestId) {
        console.log('🏆 Admin Contests Controller: Editing contest:', contestId);
        
        try {
            // Get contest details
            const contestData = await window.APIService.getContestById(contestId);
            
            if (contestData.success) {
                // Show edit modal or redirect to edit page
                this.showEditModal(contestData.data.contest);
            } else {
                window.uiHelpers.showError('Error', 'Failed to load contest details');
            }
            
        } catch (error) {
            console.error('🏆 Admin Contests Controller: Error editing contest:', error);
            window.uiHelpers.showError('Error', 'Failed to load contest details');
        }
    }

    async viewContest(contestId) {
        console.log('🏆 Admin Contests Controller: Viewing contest:', contestId);
        
        try {
            // Redirect to contest details page
            window.location.href = `/pages/admin/contest-details.html?id=${contestId}`;
            
        } catch (error) {
            console.error('🏆 Admin Contests Controller: Error viewing contest:', error);
            window.uiHelpers.showError('Error', 'Failed to load contest details');
        }
    }

    async deleteContest(contestId) {
        console.log('🏆 Admin Contests Controller: Deleting contest:', contestId);
        
        if (!confirm('Are you sure you want to delete this contest?')) {
            return;
        }
        
        try {
            const response = await window.APIService.deleteContest(contestId);
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Contest deleted successfully');
                // Refresh contests list
                await this.loadContestsData();
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to delete contest');
            }
            
        } catch (error) {
            console.error('🏆 Admin Contests Controller: Error deleting contest:', error);
            window.uiHelpers.showError('Error', 'Failed to delete contest');
        }
    }

    showEditModal(contest) {
        // Create and show edit modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
        modal.innerHTML = `
            <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Contest</h3>
                    <form id="editContestForm">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" id="editTitle" value="${contest.title || ''}" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Difficulty</label>
                                <select id="editDifficulty" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="beginner" ${contest.difficulty === 'beginner' ? 'selected' : ''}>Beginner</option>
                                    <option value="intermediate" ${contest.difficulty === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                                    <option value="advanced" ${contest.difficulty === 'advanced' ? 'selected' : ''}>Advanced</option>
                                    <option value="mixed" ${contest.difficulty === 'mixed' ? 'selected' : ''}>Mixed</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="editDescription" rows="3" required
                                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">${contest.description || ''}</textarea>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Start Time</label>
                                <input type="datetime-local" id="editStartTime" 
                                       value="${contest.startTime ? new Date(contest.startTime).toISOString().slice(0, 16) : ''}" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                                <input type="number" id="editDuration" value="${contest.duration || 120}" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Max Participants</label>
                                <input type="number" id="editMaxParticipants" value="${contest.maxParticipants || 100}" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <select id="editStatus" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="draft" ${contest.status === 'draft' ? 'selected' : ''}>Draft</option>
                                    <option value="published" ${contest.status === 'published' ? 'selected' : ''}>Published</option>
                                    <option value="registration_open" ${contest.status === 'registration_open' ? 'selected' : ''}>Registration Open</option>
                                    <option value="ongoing" ${contest.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
                                    <option value="completed" ${contest.status === 'completed' ? 'selected' : ''}>Completed</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="this.closest('.fixed').remove()" 
                                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('editContestForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDescription').value,
                difficulty: document.getElementById('editDifficulty').value,
                startTime: new Date(document.getElementById('editStartTime').value).toISOString(),
                duration: parseInt(document.getElementById('editDuration').value),
                maxParticipants: parseInt(document.getElementById('editMaxParticipants').value),
                status: document.getElementById('editStatus').value
            };
            
            try {
                const response = await window.APIService.updateContest(contest._id, formData);
                
                if (response.success) {
                    window.uiHelpers.showSuccess('Success', 'Contest updated successfully');
                    modal.remove();
                    await this.loadContestsData();
                } else {
                    window.uiHelpers.showError('Error', response.error || 'Failed to update contest');
                }
                
            } catch (error) {
                console.error('🏆 Admin Contests Controller: Error updating contest:', error);
                window.uiHelpers.showError('Error', 'Failed to update contest');
            }
        });
    }

    setupEventListeners() {
        console.log('🏆 Admin Contests Controller: Setting up event listeners...');
        
        // Add contest button
        const addContestButton = document.getElementById('add-contest-button');
        if (addContestButton) {
            addContestButton.addEventListener('click', () => {
                this.showAddContestModal();
            });
        }
        
        // Refresh button
        const refreshButton = document.getElementById('refresh-contests');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadContestsData();
            });
        }
    }

    showAddContestModal() {
        // Create and show add contest modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
        modal.innerHTML = `
            <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Contest</h3>
                    <form id="addContestForm">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" id="addTitle" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Difficulty</label>
                                <select id="addDifficulty" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Select Difficulty</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>
                        </div>
                        <div class="mt-4">
                            <label class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="addDescription" rows="3" required
                                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Start Time</label>
                                <input type="datetime-local" id="addStartTime" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                                <input type="number" id="addDuration" value="120" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Max Participants</label>
                                <input type="number" id="addMaxParticipants" value="100" required
                                       class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status</label>
                                <select id="addStatus" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="registration_open">Registration Open</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="this.closest('.fixed').remove()" 
                                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                                Cancel
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Create Contest
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('addContestForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('addTitle').value,
                description: document.getElementById('addDescription').value,
                difficulty: document.getElementById('addDifficulty').value,
                startTime: new Date(document.getElementById('addStartTime').value).toISOString(),
                duration: parseInt(document.getElementById('addDuration').value),
                maxParticipants: parseInt(document.getElementById('addMaxParticipants').value),
                status: document.getElementById('addStatus').value,
                communityId: this.getCommunityId()
            };
            
            try {
                const response = await window.APIService.createContest(formData);
                
                if (response.success) {
                    window.uiHelpers.showSuccess('Success', 'Contest created successfully');
                    modal.remove();
                    await this.loadContestsData();
                } else {
                    window.uiHelpers.showError('Error', response.error || 'Failed to create contest');
                }
                
            } catch (error) {
                console.error('🏆 Admin Contests Controller: Error creating contest:', error);
                window.uiHelpers.showError('Error', 'Failed to create contest');
            }
        });
    }

    setupRealTimeUpdates() {
        console.log('🏆 Admin Contests Controller: Setting up real-time updates...');
        
        // Refresh contests data every 60 seconds
        setInterval(() => {
            console.log('🏆 Admin Contests Controller: Refreshing contests data...');
            this.loadContestsData();
        }, 60000);
    }
}

// Initialize admin contests controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏆 Initializing Admin Contests Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            window.adminContestsController = new AdminContestsController();
        } catch (error) {
            console.error('🏆 Failed to initialize Admin Contests Controller:', error);
        }
    }, 1000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminContestsController;
}

