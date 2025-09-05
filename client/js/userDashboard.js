/**
 * Dynamic User Dashboard Controller
 * Handles student/mentor dashboard with role-specific data
 */

class DynamicUserDashboard extends PageController {
    constructor() {
        super();
    }

    // Override the base class initialization
    async initializePage() {
        console.log('👤 Dynamic User Dashboard: Initializing page-specific functionality...');
        
        try {
            // Render dashboard based on user role
            await this.renderRoleBasedDashboard();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('👤 Dynamic User Dashboard: Error initializing page:', error);
            throw error;
        }
    }

    // Render dashboard based on user role
    async renderRoleBasedDashboard() {
        console.log('👤 Dynamic User Dashboard: Rendering role-based dashboard...');
        
        const userRole = this.getUserRole();
        
        switch (userRole) {
            case 'student':
                await this.renderStudentDashboard();
                break;
            case 'mentor':
                await this.renderMentorDashboard();
                break;
            default:
                console.log('👤 Dynamic User Dashboard: Unknown role, rendering default dashboard');
                await this.renderDefaultDashboard();
        }
    }

    // Render student dashboard
    async renderStudentDashboard() {
        console.log('👤 Dynamic User Dashboard: Rendering student dashboard...');
        
        try {
            // Load student-specific data
            const studentData = await this.loadStudentData();
            
            // Render student statistics
            this.renderStudentStatistics(studentData);
            
            // Render recent contests
            this.renderRecentContests(studentData.contests);
            
            // Render progress tracking
            this.renderProgressTracking(studentData.progress);
            
            // Render mentor recommendations
            this.renderMentorRecommendations(studentData.mentors);
            
        } catch (error) {
            console.error('👤 Dynamic User Dashboard: Error rendering student dashboard:', error);
            throw error;
        }
    }

    // Render mentor dashboard
    async renderMentorDashboard() {
        console.log('👤 Dynamic User Dashboard: Rendering mentor dashboard...');
        
        try {
            // Load mentor-specific data
            const mentorData = await this.loadMentorData();
            
            // Render mentor statistics
            this.renderMentorStatistics(mentorData);
            
            // Render assigned students
            this.renderAssignedStudents(mentorData.students);
            
            // Render contest management
            this.renderMentorContests(mentorData.contests);
            
            // Render performance metrics
            this.renderMentorPerformance(mentorData.performance);
            
        } catch (error) {
            console.error('👤 Dynamic User Dashboard: Error rendering mentor dashboard:', error);
            throw error;
        }
    }

    // Render default dashboard
    async renderDefaultDashboard() {
        console.log('👤 Dynamic User Dashboard: Rendering default dashboard...');
        
        // Render basic user information
        this.renderUserProfile();
        
        // Render available contests
        this.renderAvailableContests();
    }

    // Load student-specific data
    async loadStudentData() {
        const communityId = this.getCommunityId();
        
        const [contests, progress, mentors] = await Promise.allSettled([
            window.dataLoader.loadContests({ status: 'active' }),
            this.loadStudentProgress(),
            window.dataLoader.loadRecentMentors(5)
        ]);

        return {
            contests: contests.status === 'fulfilled' ? contests.value : null,
            progress: progress.status === 'fulfilled' ? progress.value : null,
            mentors: mentors.status === 'fulfilled' ? mentors.value : null
        };
    }

    // Load mentor-specific data
    async loadMentorData() {
        const communityId = this.getCommunityId();
        
        const [students, contests, performance] = await Promise.allSettled([
            this.loadAssignedStudents(),
            window.dataLoader.loadContests({ mentor: this.getCurrentUser().id }),
            this.loadMentorPerformance()
        ]);

        return {
            students: students.status === 'fulfilled' ? students.value : null,
            contests: contests.status === 'fulfilled' ? contests.value : null,
            performance: performance.status === 'fulfilled' ? performance.value : null
        };
    }

    // Load student progress
    async loadStudentProgress() {
        try {
            // This would call a student progress API
            return {
                problemsSolved: 15,
                contestsParticipated: 3,
                currentStreak: 7,
                totalPoints: 1250
            };
        } catch (error) {
            console.error('👤 Dynamic User Dashboard: Error loading student progress:', error);
            return null;
        }
    }

    // Load assigned students
    async loadAssignedStudents() {
        try {
            // This would call a mentor students API
            return {
                totalStudents: 8,
                activeStudents: 6,
                students: [
                    {
                        id: '1',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john@example.com',
                        progress: 75,
                        lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString()
                    }
                ]
            };
        } catch (error) {
            console.error('👤 Dynamic User Dashboard: Error loading assigned students:', error);
            return null;
        }
    }

    // Load mentor performance
    async loadMentorPerformance() {
        try {
            // This would call a mentor performance API
            return {
                studentsHelped: 8,
                problemsSolved: 25,
                averageRating: 4.8,
                totalHours: 120
            };
        } catch (error) {
            console.error('👤 Dynamic User Dashboard: Error loading mentor performance:', error);
            return null;
        }
    }

    // Render student statistics
    renderStudentStatistics(data) {
        if (!data) return;

        const stats = [
            {
                label: 'Problems Solved',
                value: data.progress?.problemsSolved || 0,
                icon: 'target',
                color: 'green'
            },
            {
                label: 'Contests Participated',
                value: data.progress?.contestsParticipated || 0,
                icon: 'trophy',
                color: 'blue'
            },
            {
                label: 'Current Streak',
                value: data.progress?.currentStreak || 0,
                icon: 'flame',
                color: 'orange'
            },
            {
                label: 'Total Points',
                value: data.progress?.totalPoints || 0,
                icon: 'star',
                color: 'purple'
            }
        ];

        // Render stats cards
        window.uiHelpers.renderStatsCards('student-stats', stats);
    }

    // Render mentor statistics
    renderMentorStatistics(data) {
        if (!data) return;

        const stats = [
            {
                label: 'Students Helped',
                value: data.performance?.studentsHelped || 0,
                icon: 'users',
                color: 'blue'
            },
            {
                label: 'Problems Solved',
                value: data.performance?.problemsSolved || 0,
                icon: 'target',
                color: 'green'
            },
            {
                label: 'Average Rating',
                value: data.performance?.averageRating || 0,
                icon: 'star',
                color: 'yellow'
            },
            {
                label: 'Total Hours',
                value: data.performance?.totalHours || 0,
                icon: 'clock',
                color: 'purple'
            }
        ];

        // Render stats cards
        window.uiHelpers.renderStatsCards('mentor-stats', stats);
    }

    // Render recent contests
    renderRecentContests(contests) {
        if (!contests?.data?.contests) {
            window.uiHelpers.showEmpty('recent-contests', 'No active contests');
            return;
        }

        const contestsHTML = contests.data.contests.map(contest => `
            <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${contest.title}</h3>
                        <p class="text-sm text-gray-600">${contest.description}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ${contest.status}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">${window.uiHelpers.formatTimeAgo(contest.createdAt)}</p>
                    </div>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('recent-contests', contestsHTML);
    }

    // Render progress tracking
    renderProgressTracking(progress) {
        if (!progress) {
            window.uiHelpers.showEmpty('progress-tracking', 'No progress data available');
            return;
        }

        const progressHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Problems Solved</span>
                    <span class="text-sm text-gray-900">${progress.problemsSolved}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full" style="width: ${Math.min(progress.problemsSolved * 2, 100)}%"></div>
                </div>
                
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Current Streak</span>
                    <span class="text-sm text-gray-900">${progress.currentStreak} days</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-orange-600 h-2 rounded-full" style="width: ${Math.min(progress.currentStreak * 5, 100)}%"></div>
                </div>
            </div>
        `;

        window.uiHelpers.updateHTML('progress-tracking', progressHTML);
    }

    // Render mentor recommendations
    renderMentorRecommendations(mentors) {
        if (!mentors?.data?.mentors) {
            window.uiHelpers.showEmpty('mentor-recommendations', 'No mentors available');
            return;
        }

        window.uiHelpers.renderMentorList('mentor-recommendations', mentors.data.mentors);
    }

    // Render assigned students
    renderAssignedStudents(students) {
        if (!students?.students) {
            window.uiHelpers.showEmpty('assigned-students', 'No assigned students');
            return;
        }

        window.uiHelpers.renderUserList('assigned-students', students.students);
    }

    // Render mentor contests
    renderMentorContests(contests) {
        if (!contests?.data?.contests) {
            window.uiHelpers.showEmpty('mentor-contests', 'No contests assigned');
            return;
        }

        const contestsHTML = contests.data.contests.map(contest => `
            <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${contest.title}</h3>
                        <p class="text-sm text-gray-600">${contest.description}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${contest.status}
                        </span>
                        <p class="text-xs text-gray-500 mt-1">${contest.participants || 0} participants</p>
                    </div>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('mentor-contests', contestsHTML);
    }

    // Render mentor performance
    renderMentorPerformance(performance) {
        if (!performance) {
            window.uiHelpers.showEmpty('mentor-performance', 'No performance data available');
            return;
        }

        const performanceHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Students Helped</span>
                    <span class="text-sm text-gray-900">${performance.studentsHelped}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Problems Solved</span>
                    <span class="text-sm text-gray-900">${performance.problemsSolved}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Average Rating</span>
                    <span class="text-sm text-gray-900">${performance.averageRating}/5.0</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Total Hours</span>
                    <span class="text-sm text-gray-900">${performance.totalHours}h</span>
                </div>
            </div>
        `;

        window.uiHelpers.updateHTML('mentor-performance', performanceHTML);
    }

    // Render user profile
    renderUserProfile() {
        const user = this.getCurrentUser();
        if (!user) return;

        const profileHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                        ${user.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h2 class="text-xl font-semibold text-gray-900">${user.firstName || ''} ${user.lastName || ''}</h2>
                        <p class="text-sm text-gray-600">${user.email || ''}</p>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${user.role || 'User'}
                        </span>
                    </div>
                </div>
            </div>
        `;

        window.uiHelpers.updateHTML('user-profile', profileHTML);
    }

    // Render available contests
    renderAvailableContests() {
        // This would render contests available to the user
        window.uiHelpers.showEmpty('available-contests', 'No contests available');
    }

    // Setup real-time updates
    setupRealTimeUpdates() {
        console.log('👤 Dynamic User Dashboard: Setting up real-time updates...');
        
        // Refresh dashboard data every 60 seconds
        setInterval(() => {
            console.log('👤 Dynamic User Dashboard: Refreshing data...');
            this.refresh();
        }, 60000);
    }

    // Setup event listeners
    setupEventListeners() {
        console.log('👤 Dynamic User Dashboard: Setting up event listeners...');
        
        // Add refresh button functionality
        const refreshButton = document.getElementById('refresh-dashboard');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refresh();
            });
        }

        // Add logout button functionality
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                window.authManager.logout();
            });
        }
    }
}

// Initialize dynamic user dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('👤 Initializing Dynamic User Dashboard...');
    
    // Prevent multiple instances
    if (window.dynamicUserDashboard) {
        console.log('👤 Dynamic User Dashboard already initialized, skipping...');
        return;
    }
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            // Check if we're on the user dashboard page
            if (window.location.pathname.includes('/user/user-dashboard')) {
                window.dynamicUserDashboard = new DynamicUserDashboard();
            }
        } catch (error) {
            console.error('👤 Failed to initialize Dynamic User Dashboard:', error);
        }
    }, 2000); // Increased delay to ensure all dependencies are ready
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicUserDashboard;
}
