/**
 * Personal Communities Controller
 * Handles community discovery and joining for personal users
 */
class PersonalCommunitiesController extends PageController {
    constructor() {
        super();
        this.communities = [];
        this.joinedCommunities = [];
        this.searchTerm = '';
        this.selectedCategory = 'all';
    }

    async init() {
        console.log('🌐 PersonalCommunitiesController: Initializing...');
        await super.init();
        
        if (!this.isAuthenticated) {
            console.log('🌐 PersonalCommunitiesController: User not authenticated, redirecting to login');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        await this.loadCommunities();
        this.setupEventListeners();
        console.log('🌐 PersonalCommunitiesController: Initialization complete');
    }

    async loadCommunities() {
        try {
            this.showLoading();
            
            // Load available communities
            await this.loadAvailableCommunities();
            
            // Load user's joined communities
            await this.loadJoinedCommunities();
            
            this.hideLoading();
        } catch (error) {
            console.error('🌐 PersonalCommunitiesController: Error loading communities:', error);
            this.showError('Failed to load communities');
        }
    }

    async loadAvailableCommunities() {
        try {
            const response = await window.APIService.getCommunities();
            if (response.success) {
                this.communities = response.data.communities || [];
                this.renderCommunities();
            }
        } catch (error) {
            console.error('🌐 PersonalCommunitiesController: Error loading available communities:', error);
        }
    }

    async loadJoinedCommunities() {
        try {
            const response = await window.APIService.getUserCommunities();
            if (response.success) {
                this.joinedCommunities = response.data.communities || [];
                this.renderJoinedCommunities();
            }
        } catch (error) {
            console.error('🌐 PersonalCommunitiesController: Error loading joined communities:', error);
        }
    }

    renderCommunities() {
        const container = document.getElementById('communities-list');
        if (!container) return;

        const filteredCommunities = this.getFilteredCommunities();

        if (filteredCommunities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="users" class="w-8 h-8 text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
                    <p class="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = filteredCommunities.map(community => {
            const isJoined = this.joinedCommunities.some(jc => jc.id === community.id);
            return `
                <div class="community-card p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span class="text-white font-bold text-lg">${community.name.charAt(0)}</span>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 mb-1">${community.name}</h3>
                                <p class="text-gray-600 text-sm mb-2">${community.description || 'No description provided'}</p>
                                <div class="flex items-center space-x-4 text-sm text-gray-500">
                                    <span class="flex items-center">
                                        <i data-lucide="users" class="w-4 h-4 mr-1"></i>
                                        ${community.stats?.totalStudents || 0} members
                                    </span>
                                    <span class="flex items-center">
                                        <i data-lucide="calendar" class="w-4 h-4 mr-1"></i>
                                        Created ${window.uiHelpers.formatDateTime(community.createdAt)}
                                    </span>
                                    <span class="flex items-center">
                                        <i data-lucide="tag" class="w-4 h-4 mr-1"></i>
                                        ${community.code}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            ${isJoined ? `
                                <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                    Joined
                                </span>
                            ` : `
                                <button onclick="window.personalCommunitiesController.joinCommunity('${community.id}')"
                                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Join Community
                                </button>
                            `}
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            ${community.features ? Object.entries(community.features).filter(([key, enabled]) => enabled).map(([key]) => `
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                                    ${key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            `).join('') : ''}
                        </div>
                        <div class="text-sm text-gray-500">
                            ${community.isPublic ? 'Public' : 'Private'} Community
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    }

    renderJoinedCommunities() {
        const container = document.getElementById('joined-communities-list');
        if (!container) return;

        if (this.joinedCommunities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i data-lucide="users" class="w-6 h-6 text-gray-400"></i>
                    </div>
                    <h3 class="text-md font-medium text-gray-900 mb-1">No joined communities</h3>
                    <p class="text-gray-500 text-sm">Join communities to connect with other learners</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = this.joinedCommunities.map(community => `
            <div class="joined-community-card p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-all">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold">${community.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-900">${community.name}</h4>
                            <p class="text-sm text-gray-500">${community.stats?.totalStudents || 0} members</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <a href="/pages/community.html?id=${community.id}" 
                           class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg hover:bg-blue-200 transition-colors">
                            Visit
                        </a>
                        <button onclick="window.personalCommunitiesController.leaveCommunity('${community.id}')"
                                class="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-lg hover:bg-red-200 transition-colors">
                            Leave
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getFilteredCommunities() {
        let filtered = this.communities;

        // Filter by search term
        if (this.searchTerm) {
            filtered = filtered.filter(community =>
                community.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                community.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                community.code.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        // Filter by category (if implemented)
        if (this.selectedCategory !== 'all') {
            // Add category filtering logic here
        }

        return filtered;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('community-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderCommunities();
            });
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedCategory = e.target.dataset.category;
                this.renderCommunities();
            });
        });

        // Create community button (if user has permission)
        const createBtn = document.getElementById('create-community-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateCommunityModal());
        }
    }

    async joinCommunity(communityId) {
        try {
            const response = await window.APIService.joinCommunity(communityId);
            if (response.success) {
                // Add to joined communities
                const community = this.communities.find(c => c.id === communityId);
                if (community) {
                    this.joinedCommunities.push(community);
                    this.renderCommunities();
                    this.renderJoinedCommunities();
                }
                this.showSuccess('Successfully joined community');
            } else {
                this.showError('Failed to join community');
            }
        } catch (error) {
            console.error('🌐 PersonalCommunitiesController: Error joining community:', error);
            this.showError('Failed to join community');
        }
    }

    async leaveCommunity(communityId) {
        if (!confirm('Are you sure you want to leave this community?')) return;

        try {
            const response = await window.APIService.leaveCommunity(communityId);
            if (response.success) {
                // Remove from joined communities
                this.joinedCommunities = this.joinedCommunities.filter(c => c.id !== communityId);
                this.renderCommunities();
                this.renderJoinedCommunities();
                this.showSuccess('Successfully left community');
            } else {
                this.showError('Failed to leave community');
            }
        } catch (error) {
            console.error('🌐 PersonalCommunitiesController: Error leaving community:', error);
            this.showError('Failed to leave community');
        }
    }

    showCreateCommunityModal() {
        // Create community modal (similar to other modals)
        console.log('🌐 PersonalCommunitiesController: Show create community modal');
        // Implementation would be similar to other modals
    }

    showLoading() {
        const container = document.getElementById('communities-list');
        if (container) {
            container.innerHTML = `
                <div class="space-y-4">
                    ${Array(3).fill().map(() => `
                        <div class="p-6 rounded-lg border border-gray-200 animate-pulse">
                            <div class="flex items-start space-x-4">
                                <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                <div class="flex-1">
                                    <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div class="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading is handled by renderCommunities
    }

    showSuccess(message) {
        if (window.notifications) {
            window.notifications.success({
                title: 'Success',
                message: message
            });
        }
    }

    showError(message) {
        if (window.notifications) {
            window.notifications.error({
                title: 'Error',
                message: message
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.personalCommunitiesController = new PersonalCommunitiesController();
});
