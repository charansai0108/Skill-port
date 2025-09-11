import EnhancedPageController from './enhancedPageController.js';

class MentorLeaderboardController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'mentor';
    }

    async renderDashboardContent() {
        console.log('🏆 MentorLeaderboardController: Rendering mentor leaderboard content...');
        
        try {
            await this.renderMentorLeaderboard();
            await this.renderMentorStats();
            await this.renderTopMentors();
            await this.renderMentorRankings();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ MentorLeaderboardController: Mentor leaderboard content rendered successfully');
            
        } catch (error) {
            console.error('❌ MentorLeaderboardController: Error rendering leaderboard content:', error);
            throw error;
        }
    }

    async renderMentorLeaderboard() {
        try {
            const leaderboard = await this.dataLoader.loadMentorLeaderboard(100);
            this.updateMentorLeaderboardUI(leaderboard);
        } catch (error) {
            console.error('Error loading mentor leaderboard:', error);
            this.showDefaultMentorLeaderboard();
        }
    }

    async renderMentorStats() {
        try {
            const stats = await this.dataLoader.loadMentorStats();
            this.updateMentorStatsUI(stats);
        } catch (error) {
            console.error('Error loading mentor stats:', error);
            this.showDefaultMentorStats();
        }
    }

    async renderTopMentors() {
        try {
            const topMentors = await this.dataLoader.loadTopMentors(10);
            this.updateTopMentorsUI(topMentors);
        } catch (error) {
            console.error('Error loading top mentors:', error);
            this.showDefaultTopMentors();
        }
    }

    async renderMentorRankings() {
        try {
            const rankings = await this.dataLoader.loadMentorRankings();
            this.updateMentorRankingsUI(rankings);
        } catch (error) {
            console.error('Error loading mentor rankings:', error);
            this.showDefaultMentorRankings();
        }
    }

    updateMentorLeaderboardUI(leaderboard) {
        const container = document.getElementById('mentor-leaderboard-list');
        if (!container) return;

        if (leaderboard.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="trophy" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No mentor data available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = leaderboard.map((mentor, index) => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                <div class="flex items-center space-x-4 mb-3">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center ${this.getRankColor(index + 1)}">
                            ${index < 3 ? this.getRankIcon(index + 1) : `<span class="text-lg font-bold">${index + 1}</span>`}
                        </div>
                    </div>
                    <img src="${mentor.profileImage || '/images/default-avatar.png'}" 
                         alt="${mentor.name}" class="w-12 h-12 rounded-full object-cover">
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                            <h3 class="text-lg font-semibold text-gray-900">${mentor.name}</h3>
                            <div class="flex items-center space-x-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getRatingColor(mentor.rating)}">
                                    ⭐ ${mentor.rating || 'N/A'}
                                </span>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(mentor.status)}">
                                    ${mentor.status}
                                </span>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600">${mentor.specialization || 'General'}</p>
                        <p class="text-xs text-gray-500">${mentor.university || 'University not specified'}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-4 gap-4 mb-3 text-sm">
                    <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">${mentor.studentsCount || 0}</div>
                        <div class="text-xs text-gray-500">Students</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">${mentor.sessionsCompleted || 0}</div>
                        <div class="text-xs text-gray-500">Sessions</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">${mentor.hoursCompleted || 0}</div>
                        <div class="text-xs text-gray-500">Hours</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">${mentor.completionRate || 0}%</div>
                        <div class="text-xs text-gray-500">Completion</div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        Rank: #${index + 1} • Points: ${mentor.points || 0}
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="viewMentorProfile('${mentor.id}')">
                            View Profile
                        </button>
                        <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="connectWithMentor('${mentor.id}')">
                            Connect
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateMentorStatsUI(stats) {
        const statsElements = {
            'total-mentors': stats.totalMentors || 0,
            'active-mentors': stats.activeMentors || 0,
            'average-rating': stats.averageRating || 'N/A',
            'total-sessions': stats.totalSessions || 0,
            'total-students': stats.totalStudents || 0,
            'completion-rate': `${stats.completionRate || 0}%`,
            'top-specialization': stats.topSpecialization || 'N/A',
            'growth-rate': `${stats.growthRate || 0}%`
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateTopMentorsUI(topMentors) {
        const container = document.getElementById('top-mentors-list');
        if (!container) return;

        if (topMentors.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No top mentors data available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = topMentors.map((mentor, index) => `
            <div class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${this.getRankColor(index + 1)}">
                        ${index < 3 ? this.getRankIcon(index + 1) : `<span class="text-sm font-bold">${index + 1}</span>`}
                    </div>
                </div>
                <img src="${mentor.profileImage || '/images/default-avatar.png'}" 
                     alt="${mentor.name}" class="w-8 h-8 rounded-full object-cover">
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${mentor.name}</p>
                    <p class="text-xs text-gray-500">${mentor.specialization}</p>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">⭐ ${mentor.rating || 'N/A'}</div>
                    <div class="text-xs text-gray-500">${mentor.studentsCount || 0} students</div>
                </div>
            </div>
        `).join('');
    }

    updateMentorRankingsUI(rankings) {
        const container = document.getElementById('mentor-rankings-list');
        if (!container) return;

        if (rankings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="trending-up" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No ranking data available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = rankings.map(ranking => `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <i data-lucide="${this.getRankingIcon(ranking.category)}" class="w-4 h-4 text-blue-600"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900">${ranking.category}</p>
                        <p class="text-xs text-gray-500">${ranking.description}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">${ranking.value}</div>
                    <div class="text-xs text-gray-500">${ranking.unit}</div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    setupFormHandlers() {
        // Filter leaderboard
        const filterSelect = document.getElementById('leaderboard-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterLeaderboard(e.target.value);
            });
        }

        // Search mentors
        const searchInput = document.getElementById('mentor-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMentors(e.target.value);
            });
        }

        // Time period filter
        const timeFilter = document.getElementById('time-filter');
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.filterByTimePeriod(e.target.value);
            });
        }
    }

    async filterLeaderboard(filter) {
        try {
            const leaderboard = await this.dataLoader.loadMentorLeaderboard(100);
            let filteredLeaderboard = leaderboard;

            if (filter !== 'all') {
                filteredLeaderboard = leaderboard.filter(mentor => mentor.specialization === filter);
            }

            this.updateMentorLeaderboardUI(filteredLeaderboard);
            
        } catch (error) {
            console.error('Error filtering leaderboard:', error);
        }
    }

    async searchMentors(query) {
        try {
            const leaderboard = await this.dataLoader.loadMentorLeaderboard(100);
            let filteredLeaderboard = leaderboard;

            if (query.trim()) {
                filteredLeaderboard = leaderboard.filter(mentor => 
                    mentor.name.toLowerCase().includes(query.toLowerCase()) ||
                    mentor.specialization?.toLowerCase().includes(query.toLowerCase()) ||
                    mentor.university?.toLowerCase().includes(query.toLowerCase())
                );
            }

            this.updateMentorLeaderboardUI(filteredLeaderboard);
            
        } catch (error) {
            console.error('Error searching mentors:', error);
        }
    }

    async filterByTimePeriod(period) {
        try {
            const leaderboard = await this.dataLoader.loadMentorLeaderboard(100, period);
            this.updateMentorLeaderboardUI(leaderboard);
            
        } catch (error) {
            console.error('Error filtering by time period:', error);
        }
    }

    getRankColor(rank) {
        if (rank === 1) return 'bg-yellow-100 text-yellow-600';
        if (rank === 2) return 'bg-gray-100 text-gray-600';
        if (rank === 3) return 'bg-orange-100 text-orange-600';
        return 'bg-blue-100 text-blue-600';
    }

    getRankIcon(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    }

    getRatingColor(rating) {
        if (rating >= 4.5) return 'bg-green-100 text-green-800';
        if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800';
        if (rating >= 2.5) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    }

    getStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'busy': 'bg-yellow-100 text-yellow-800',
            'available': 'bg-blue-100 text-blue-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    getRankingIcon(category) {
        const icons = {
            'sessions': 'clock',
            'students': 'users',
            'rating': 'star',
            'hours': 'timer',
            'completion': 'check-circle',
            'growth': 'trending-up'
        };
        return icons[category?.toLowerCase()] || 'bar-chart';
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
    showDefaultMentorLeaderboard() {
        const container = document.getElementById('mentor-leaderboard-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading leaderboard...</p>
                </div>
            `;
        }
    }

    showDefaultMentorStats() {
        const defaultStats = {
            totalMentors: 0,
            activeMentors: 0,
            averageRating: 'N/A',
            totalSessions: 0,
            totalStudents: 0,
            completionRate: 0,
            topSpecialization: 'N/A',
            growthRate: 0
        };
        this.updateMentorStatsUI(defaultStats);
    }

    showDefaultTopMentors() {
        const container = document.getElementById('top-mentors-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading top mentors...</p>
                </div>
            `;
        }
    }

    showDefaultMentorRankings() {
        const container = document.getElementById('mentor-rankings-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading rankings...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('🏆 MentorLeaderboardController: Setting up real-time listeners...');
        
        try {
            const leaderboardListener = this.dataLoader.setupMentorLeaderboardListener((leaderboard) => {
                console.log('🏆 Leaderboard updated:', leaderboard);
                this.updateMentorLeaderboardUI(leaderboard);
            });
            this.realTimeListeners.push(leaderboardListener);

            console.log('✅ MentorLeaderboardController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ MentorLeaderboardController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('🏆 MentorLeaderboardController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MentorLeaderboardController();
});

export default MentorLeaderboardController;
