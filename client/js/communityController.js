/**
 * Community Controller
 * Manages community information and member interactions
 */

class CommunityController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('🏘️ Community Controller: Initializing...');
        
        try {
            // Load community data
            await this.loadCommunityData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('🏘️ Community Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadCommunityData() {
        console.log('🏘️ Community Controller: Loading community data...');
        
        try {
            this.setLoadingState(true);
            
            // Load community data
            const communityData = await window.dataLoader.loadCommunityData();
            
            this.setData(communityData);
            
            // Render community information
            this.renderCommunity(communityData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    renderCommunity(data) {
        console.log('🏘️ Community Controller: Rendering community...');
        
        // Render community overview
        this.renderCommunityOverview(data.overview);
        
        // Render community statistics
        this.renderCommunityStats(data.stats);
        
        // Render recent members
        this.renderRecentMembers(data.recentMembers);
        
        // Render community posts
        this.renderCommunityPosts(data.posts);
        
        // Render community events
        this.renderCommunityEvents(data.events);
        
        // Render community rules
        this.renderCommunityRules(data.rules);
    }

    renderCommunityOverview(overview) {
        if (!overview) return;
        
        // Update community information
        window.uiHelpers.updateText('community-name', overview.name || '');
        window.uiHelpers.updateText('community-description', overview.description || '');
        window.uiHelpers.updateText('community-code', overview.code || '');
        window.uiHelpers.updateText('community-admin', overview.admin?.name || '');
        window.uiHelpers.updateText('community-created', window.uiHelpers.formatDateTime(overview.createdAt));
        
        // Update community logo
        if (overview.logo) {
            const logoImg = document.getElementById('community-logo');
            if (logoImg) {
                logoImg.src = overview.logo;
                logoImg.alt = overview.name;
            }
        }
        
        // Update community banner
        if (overview.banner) {
            const bannerImg = document.getElementById('community-banner');
            if (bannerImg) {
                bannerImg.src = overview.banner;
                bannerImg.alt = `${overview.name} banner`;
            }
        }
        
        // Update community status
        const statusElement = document.getElementById('community-status');
        if (statusElement) {
            const status = overview.status || 'active';
            const statusClass = status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            statusElement.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`;
            statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    }

    renderCommunityStats(stats) {
        if (!stats) return;
        
        // Update statistics cards
        window.uiHelpers.updateText('total-members', stats.totalMembers || 0);
        window.uiHelpers.updateText('active-members', stats.activeMembers || 0);
        window.uiHelpers.updateText('total-mentors', stats.totalMentors || 0);
        window.uiHelpers.updateText('total-students', stats.totalStudents || 0);
        window.uiHelpers.updateText('total-contests', stats.totalContests || 0);
        window.uiHelpers.updateText('active-contests', stats.activeContests || 0);
        window.uiHelpers.updateText('total-posts', stats.totalPosts || 0);
        window.uiHelpers.updateText('total-projects', stats.totalProjects || 0);
    }

    renderRecentMembers(members) {
        if (!members || !members.length) {
            window.uiHelpers.showEmpty('recent-members', 'No recent members');
            return;
        }

        const membersHtml = members.map(member => `
            <div class="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    ${member.firstName?.charAt(0) || 'U'}
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">${member.firstName || ''} ${member.lastName || ''}</h4>
                    <p class="text-xs text-gray-500">${member.email || ''}</p>
                    <p class="text-xs text-gray-500">Joined ${window.uiHelpers.formatTimeAgo(member.joinedAt)}</p>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'mentor' ? 'bg-green-100 text-green-800' :
                        member.role === 'student' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${member.role || 'Member'}
                    </span>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('recent-members', membersHtml);
    }

    renderCommunityPosts(posts) {
        if (!posts || !posts.length) {
            window.uiHelpers.showEmpty('community-posts', 'No recent posts');
            return;
        }

        const postsHtml = posts.map(post => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center space-x-3 mb-4">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        ${post.author?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-900">${post.author?.firstName || ''} ${post.author?.lastName || ''}</h4>
                        <p class="text-xs text-gray-500">${window.uiHelpers.formatTimeAgo(post.createdAt)}</p>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">${post.title || 'Untitled Post'}</h3>
                    <p class="text-gray-600 text-sm">${post.content || 'No content'}</p>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button class="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                            <i data-lucide="thumbs-up" class="w-4 h-4"></i>
                            <span class="text-sm">${post.likes || 0}</span>
                        </button>
                        <button class="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                            <i data-lucide="message-circle" class="w-4 h-4"></i>
                            <span class="text-sm">${post.comments || 0}</span>
                        </button>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${post.tags && post.tags.length > 0 ? 
                            post.tags.map(tag => 
                                `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${tag}</span>`
                            ).join('') : ''
                        }
                    </div>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('community-posts', postsHtml);
    }

    renderCommunityEvents(events) {
        if (!events || !events.length) {
            window.uiHelpers.showEmpty('community-events', 'No upcoming events');
            return;
        }

        const eventsHtml = events.map(event => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">${event.title || 'Untitled Event'}</h3>
                        <p class="text-sm text-gray-500">${event.description || 'No description'}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${event.status || 'Unknown'}
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-gray-500">Start Time</p>
                        <p class="text-sm font-medium text-gray-900">${window.uiHelpers.formatDateTime(event.startTime)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">End Time</p>
                        <p class="text-sm font-medium text-gray-900">${window.uiHelpers.formatDateTime(event.endTime)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Participants</p>
                        <p class="text-sm font-medium text-gray-900">${event.participants || 0}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Type</p>
                        <p class="text-sm font-medium text-gray-900">${event.type || 'Event'}</p>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="communityController.joinEvent('${event._id}')" 
                            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Join Event
                    </button>
                    <button onclick="communityController.viewEventDetails('${event._id}')" 
                            class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('community-events', eventsHtml);
    }

    renderCommunityRules(rules) {
        if (!rules || !rules.length) {
            window.uiHelpers.showEmpty('community-rules', 'No community rules defined');
            return;
        }

        const rulesHtml = rules.map((rule, index) => `
            <div class="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900 mb-1">${rule.title || 'Rule'}</h4>
                    <p class="text-sm text-gray-600">${rule.description || 'No description'}</p>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('community-rules', rulesHtml);
    }

    async joinEvent(eventId) {
        console.log('🏘️ Community Controller: Joining event:', eventId);
        
        try {
            const response = await window.APIService.joinEvent(eventId);
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Successfully joined the event');
                // Refresh community data
                await this.loadCommunityData();
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to join event');
            }
            
        } catch (error) {
            console.error('🏘️ Community Controller: Error joining event:', error);
            window.uiHelpers.showError('Error', 'Failed to join event');
        }
    }

    async viewEventDetails(eventId) {
        console.log('🏘️ Community Controller: Viewing event details:', eventId);
        
        try {
            // Redirect to event details page
            window.location.href = `/pages/community/event-details.html?id=${eventId}`;
            
        } catch (error) {
            console.error('🏘️ Community Controller: Error viewing event details:', error);
            window.uiHelpers.showError('Error', 'Failed to open event details');
        }
    }

    async createPost() {
        console.log('🏘️ Community Controller: Creating new post...');
        
        try {
            // Redirect to post creation page
            window.location.href = '/pages/community/create-post.html';
            
        } catch (error) {
            console.error('🏘️ Community Controller: Error creating post:', error);
            window.uiHelpers.showError('Error', 'Failed to open post creator');
        }
    }

    async joinCommunity() {
        console.log('🏘️ Community Controller: Joining community...');
        
        try {
            const response = await window.APIService.joinCommunity();
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Successfully joined the community');
                // Refresh community data
                await this.loadCommunityData();
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to join community');
            }
            
        } catch (error) {
            console.error('🏘️ Community Controller: Error joining community:', error);
            window.uiHelpers.showError('Error', 'Failed to join community');
        }
    }

    async leaveCommunity() {
        const confirmMessage = 'Are you sure you want to leave this community?';
        if (!confirm(confirmMessage)) return;
        
        console.log('🏘️ Community Controller: Leaving community...');
        
        try {
            const response = await window.APIService.leaveCommunity();
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Successfully left the community');
                // Redirect to community selection page
                setTimeout(() => {
                    window.location.href = '/pages/community/select-community.html';
                }, 2000);
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to leave community');
            }
            
        } catch (error) {
            console.error('🏘️ Community Controller: Error leaving community:', error);
            window.uiHelpers.showError('Error', 'Failed to leave community');
        }
    }

    setupEventListeners() {
        console.log('🏘️ Community Controller: Setting up event listeners...');
        
        // Join community button
        const joinButton = document.getElementById('join-community');
        if (joinButton) {
            joinButton.addEventListener('click', () => {
                this.joinCommunity();
            });
        }
        
        // Leave community button
        const leaveButton = document.getElementById('leave-community');
        if (leaveButton) {
            leaveButton.addEventListener('click', () => {
                this.leaveCommunity();
            });
        }
        
        // Create post button
        const createPostButton = document.getElementById('create-post');
        if (createPostButton) {
            createPostButton.addEventListener('click', () => {
                this.createPost();
            });
        }
        
        // Refresh button
        const refreshButton = document.getElementById('refresh-community');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadCommunityData();
            });
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterContent(filter);
            });
        });
    }

    async filterContent(filter) {
        console.log('🏘️ Community Controller: Filtering content by:', filter);
        
        try {
            this.setLoadingState(true);
            
            // Load filtered community data
            const communityData = await window.dataLoader.loadCommunityData({ filter });
            
            // Re-render with filtered data
            this.renderCommunity(communityData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('🏘️ Community Controller: Error filtering content:', error);
        }
    }

    setupRealTimeUpdates() {
        console.log('🏘️ Community Controller: Setting up real-time updates...');
        
        // Refresh community data every 5 minutes
        setInterval(() => {
            console.log('🏘️ Community Controller: Refreshing community data...');
            this.loadCommunityData();
        }, 300000); // 5 minutes
    }
}

// Initialize community controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏘️ Initializing Community Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            // Check if we're on the community page
            if (window.location.pathname.includes('/community')) {
                window.communityController = new CommunityController();
            }
        } catch (error) {
            console.error('🏘️ Failed to initialize Community Controller:', error);
        }
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommunityController;
}
