/**
 * Mentor Dashboard Controller
 * Manages mentor-specific dashboard functionality
 */

class MentorDashboardController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('🎓 Mentor Dashboard Controller: Initializing...');
        
        try {
            // Load mentor dashboard data
            await this.loadMentorData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup real-time updates
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('🎓 Mentor Dashboard Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadMentorData() {
        console.log('🎓 Mentor Dashboard Controller: Loading mentor data...');
        
        try {
            this.setLoadingState(true);
            
            // Load mentor-specific data
            const mentorData = await window.dataLoader.loadMentorData();
            
            this.setData(mentorData);
            
            // Render mentor dashboard
            this.renderMentorDashboard(mentorData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    renderMentorDashboard(data) {
        console.log('🎓 Mentor Dashboard Controller: Rendering mentor dashboard...');
        
        // Update mentor profile section
        this.renderMentorProfile(data.profile);
        
        // Update students section
        this.renderStudents(data.students);
        
        // Update contests section
        this.renderContests(data.contests);
        
        // Update analytics section
        this.renderAnalytics(data.analytics);
        
        // Update recent activity
        this.renderRecentActivity(data.recentActivity);
    }

    renderMentorProfile(profile) {
        if (!profile) return;
        
        // Update mentor name
        window.uiHelpers.updateText('mentor-name', `${profile.firstName || ''} ${profile.lastName || ''}`);
        
        // Update mentor email
        window.uiHelpers.updateText('mentor-email', profile.email || '');
        
        // Update mentor expertise
        if (profile.expertise && profile.expertise.length > 0) {
            const expertiseHtml = profile.expertise.map(skill => 
                `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">${skill}</span>`
            ).join(' ');
            window.uiHelpers.updateHTML('mentor-expertise', expertiseHtml);
        }
        
        // Update mentor stats
        window.uiHelpers.updateText('mentor-students-helped', profile.contestPerformance?.studentsHelped || 0);
        window.uiHelpers.updateText('mentor-problems-solved', profile.contestPerformance?.problemsSolved || 0);
    }

    renderStudents(students) {
        if (!students || students.length === 0) {
            window.uiHelpers.showEmpty('students-list', 'No students assigned');
            return;
        }

        const studentsHtml = students.map(student => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            ${student.firstName?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-gray-900">${student.firstName || ''} ${student.lastName || ''}</h4>
                            <p class="text-xs text-gray-500">${student.email || ''}</p>
                            <p class="text-xs text-gray-500">Batch: ${student.batch || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">${student.totalPoints || 0} pts</p>
                        <p class="text-xs text-gray-500">${student.problemsSolved || 0} solved</p>
                    </div>
                </div>
                <div class="mt-3 flex justify-between items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${student.status || 'Unknown'}
                    </span>
                    <button onclick="mentorDashboardController.viewStudent('${student._id}')" 
                            class="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('students-list', studentsHtml);
    }

    renderContests(contests) {
        if (!contests || contests.length === 0) {
            window.uiHelpers.showEmpty('contests-list', 'No contests available');
            return;
        }

        const contestsHtml = contests.map(contest => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                            🏆
                        </div>
                        <div>
                            <h4 class="text-sm font-medium text-gray-900">${contest.title || 'Untitled Contest'}</h4>
                            <p class="text-xs text-gray-500">${contest.description || 'No description'}</p>
                        </div>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contest.status === 'published' ? 'bg-green-100 text-green-800' :
                        contest.status === 'registration_open' ? 'bg-blue-100 text-blue-800' :
                        contest.status === 'ongoing' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${contest.status || 'Draft'}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                        <p>Start: ${window.uiHelpers.formatDateTime(contest.startTime)}</p>
                        <p>Duration: ${contest.duration || 0} min</p>
                    </div>
                    <div>
                        <p>Participants: ${contest.participants?.length || 0}/${contest.maxParticipants || 0}</p>
                        <p>Difficulty: ${contest.difficulty || 'Mixed'}</p>
                    </div>
                </div>
                <div class="mt-3 flex justify-between items-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contest.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        contest.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        contest.difficulty === 'advanced' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${contest.difficulty || 'Mixed'}
                    </span>
                    <button onclick="mentorDashboardController.viewContest('${contest._id}')" 
                            class="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        View Contest
                    </button>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('contests-list', contestsHtml);
    }

    renderAnalytics(analytics) {
        if (!analytics) return;
        
        // Update analytics cards
        window.uiHelpers.updateText('total-students', analytics.totalStudents || 0);
        window.uiHelpers.updateText('active-contests', analytics.activeContests || 0);
        window.uiHelpers.updateText('problems-created', analytics.problemsCreated || 0);
        window.uiHelpers.updateText('student-feedback', analytics.studentFeedback || 0);
    }

    renderRecentActivity(activities) {
        if (!activities || activities.length === 0) {
            window.uiHelpers.showEmpty('recent-activity', 'No recent activity');
            return;
        }

        const activitiesHtml = activities.map(activity => `
            <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm">
                    ${activity.type === 'contest' ? '🏆' : activity.type === 'student' ? '👨‍🎓' : '📊'}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">${activity.description || 'Activity'}</p>
                    <p class="text-xs text-gray-500">${window.uiHelpers.formatTimeAgo(activity.timestamp)}</p>
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('recent-activity', activitiesHtml);
    }

    async viewStudent(studentId) {
        console.log('🎓 Mentor Dashboard Controller: Viewing student:', studentId);
        
        try {
            // Redirect to student details page
            window.location.href = `/pages/mentor/student-details.html?id=${studentId}`;
            
        } catch (error) {
            console.error('🎓 Mentor Dashboard Controller: Error viewing student:', error);
            window.uiHelpers.showError('Error', 'Failed to load student details');
        }
    }

    async viewContest(contestId) {
        console.log('🎓 Mentor Dashboard Controller: Viewing contest:', contestId);
        
        try {
            // Redirect to contest details page
            window.location.href = `/pages/mentor/contest-details.html?id=${contestId}`;
            
        } catch (error) {
            console.error('🎓 Mentor Dashboard Controller: Error viewing contest:', error);
            window.uiHelpers.showError('Error', 'Failed to load contest details');
        }
    }

    setupEventListeners() {
        console.log('🎓 Mentor Dashboard Controller: Setting up event listeners...');
        
        // Refresh button
        const refreshButton = document.getElementById('refresh-mentor-data');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadMentorData();
            });
        }
        
        // Create contest button
        const createContestButton = document.getElementById('create-contest-button');
        if (createContestButton) {
            createContestButton.addEventListener('click', () => {
                window.location.href = '/pages/mentor/mentor-contests.html';
            });
        }
        
        // View all students button
        const viewAllStudentsButton = document.getElementById('view-all-students');
        if (viewAllStudentsButton) {
            viewAllStudentsButton.addEventListener('click', () => {
                window.location.href = '/pages/mentor/mentor-students.html';
            });
        }
    }

    setupRealTimeUpdates() {
        console.log('🎓 Mentor Dashboard Controller: Setting up real-time updates...');
        
        // Refresh mentor data every 60 seconds
        setInterval(() => {
            console.log('🎓 Mentor Dashboard Controller: Refreshing mentor data...');
            this.loadMentorData();
        }, 60000);
    }
}

// Initialize mentor dashboard controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 Initializing Mentor Dashboard Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            window.mentorDashboardController = new MentorDashboardController();
        } catch (error) {
            console.error('🎓 Failed to initialize Mentor Dashboard Controller:', error);
        }
    }, 1000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MentorDashboardController;
}

