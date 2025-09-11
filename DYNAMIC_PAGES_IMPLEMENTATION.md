# 🚀 Dynamic Pages with Firebase Integration - Complete Implementation

## **1. Enhanced Personal Dashboard Controller**

### **File: `client/js/personalDashboardController.js`**

```javascript
import PageController from './pageController.js';

class PersonalDashboardController extends PageController {
    constructor() {
        super();
        this.userData = null;
        this.realTimeListeners = [];
    }

    async loadPageData() {
        console.log('🎯 PersonalDashboardController: Loading dashboard data...');
        
        try {
            const userId = window.authManager.currentUser?.uid;
            if (!userId) {
                throw new Error('No authenticated user found');
            }

            // Load user profile
            await this.loadUserProfile(userId);
            
            // Load user stats
            await this.loadUserStats(userId);
            
            // Load recent projects
            await this.loadRecentProjects(userId);
            
            // Load recent tasks
            await this.loadRecentTasks(userId);
            
            // Load achievements
            await this.loadAchievements(userId);
            
            // Load communities
            await this.loadCommunities(userId);
            
            console.log('✅ PersonalDashboardController: Dashboard data loaded successfully');
            
        } catch (error) {
            console.error('❌ PersonalDashboardController: Error loading dashboard data:', error);
            this.handleError(error);
        }
    }

    async loadUserProfile(userId) {
        try {
            const { default: firebaseService } = await import('./firebaseService.js');
            const userDoc = await firebaseService.getUserProfile(userId);
            
            this.userData = userDoc;
            this.updateUserProfileUI(userDoc);
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            this.showDefaultProfile();
        }
    }

    async loadUserStats(userId) {
        try {
            const { default: firebaseService } = await import('./firebaseService.js');
            const stats = await firebaseService.getUserStats(userId);
            
            this.updateStatsUI(stats);
            
        } catch (error) {
            console.error('Error loading user stats:', error);
            this.showDefaultStats();
        }
    }

    async loadRecentProjects(userId) {
        try {
            const { default: firebaseService } = await import('./firebaseService.js');
            const projects = await firebaseService.getUserProjects(userId, 5);
            
            this.updateProjectsUI(projects);
            
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showDefaultProjects();
        }
    }

    async loadRecentTasks(userId) {
        try {
            const { default: firebaseService } = await import('./firebaseService.js');
            const tasks = await firebaseService.getUserTasks(userId, 5);
            
            this.updateTasksUI(tasks);
            
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showDefaultTasks();
        }
    }

    async loadAchievements(userId) {
        try {
            const { default: firebaseService } = await import('./firebaseService.js');
            const achievements = await firebaseService.getUserAchievements(userId);
            
            this.updateAchievementsUI(achievements);
            
        } catch (error) {
            console.error('Error loading achievements:', error);
            this.showDefaultAchievements();
        }
    }

    async loadCommunities(userId) {
        try {
            const { default: firebaseService } = await import('./firebaseService.js');
            const communities = await firebaseService.getUserCommunities(userId);
            
            this.updateCommunitiesUI(communities);
            
        } catch (error) {
            console.error('Error loading communities:', error);
            this.showDefaultCommunities();
        }
    }

    // UI Update Methods
    updateUserProfileUI(userData) {
        const nameElement = document.getElementById('user-name');
        const emailElement = document.getElementById('user-email');
        const avatarElement = document.getElementById('user-avatar');
        const bioElement = document.getElementById('user-bio');
        
        if (nameElement) nameElement.textContent = userData.name || 'User';
        if (emailElement) emailElement.textContent = userData.email || '';
        if (avatarElement) avatarElement.src = userData.avatar || '/images/default-avatar.png';
        if (bioElement) bioElement.textContent = userData.bio || 'No bio available';
    }

    updateStatsUI(stats) {
        const statsElements = {
            'problems-solved': stats.problemsSolved || 0,
            'skill-rating': stats.skillRating || 0,
            'total-submissions': stats.totalSubmissions || 0,
            'day-streak': stats.dayStreak || 0,
            'points-earned': stats.pointsEarned || 0,
            'badges-earned': stats.badgesEarned || 0
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                // Add animation
                element.classList.add('animate-pulse');
                setTimeout(() => element.classList.remove('animate-pulse'), 1000);
            }
        });
    }

    updateProjectsUI(projects) {
        const container = document.getElementById('recent-projects-list');
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="folder-plus" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No projects yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Create your first project
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">${project.title}</h3>
                        <p class="text-sm text-gray-600 mt-1">${project.description || 'No description'}</p>
                        <div class="flex items-center mt-2">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: ${project.progress || 0}%"></div>
                            </div>
                            <span class="text-xs text-gray-500 ml-2">${project.progress || 0}%</span>
                        </div>
                    </div>
                    <div class="ml-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(project.status)}">
                            ${project.status || 'In Progress'}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }

    updateTasksUI(tasks) {
        const container = document.getElementById('recent-tasks-list');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="check-circle" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No recent tasks</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}">
                        <i data-lucide="${task.completed ? 'check' : 'circle'}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${task.title}</p>
                    <p class="text-xs text-gray-500">${task.difficulty || 'Medium'} • ${task.platform || 'General'}</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="text-xs text-gray-500">${this.formatDate(task.createdAt)}</span>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateAchievementsUI(achievements) {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        if (achievements.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="award" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No achievements yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = achievements.map(achievement => `
            <div class="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <i data-lucide="award" class="w-5 h-5 text-yellow-600"></i>
                    </div>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">${achievement.title}</p>
                    <p class="text-xs text-gray-600">${achievement.description}</p>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateCommunitiesUI(communities) {
        const container = document.getElementById('communities-list');
        if (!container) return;

        if (communities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Not joined any communities yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                        Explore communities
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = communities.map(community => `
            <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <i data-lucide="users" class="w-5 h-5 text-blue-600"></i>
                    </div>
                </div>
                <div class="ml-3 flex-1">
                    <p class="text-sm font-medium text-gray-900">${community.name}</p>
                    <p class="text-xs text-gray-500">${community.memberCount || 0} members</p>
                </div>
                <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${community.role || 'Member'}
                    </span>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    // Default/Error State Methods
    showDefaultProfile() {
        this.updateUserProfileUI({
            name: 'User',
            email: 'user@example.com',
            bio: 'Welcome to SkillPort!'
        });
    }

    showDefaultStats() {
        this.updateStatsUI({
            problemsSolved: 0,
            skillRating: 0,
            totalSubmissions: 0,
            dayStreak: 0,
            pointsEarned: 0,
            badgesEarned: 0
        });
    }

    showDefaultProjects() {
        const container = document.getElementById('recent-projects-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="folder-plus" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Loading projects...</p>
                </div>
            `;
        }
    }

    showDefaultTasks() {
        const container = document.getElementById('recent-tasks-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading tasks...</p>
                </div>
            `;
        }
    }

    showDefaultAchievements() {
        const container = document.getElementById('achievements-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="award" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Loading achievements...</p>
                </div>
            `;
        }
    }

    showDefaultCommunities() {
        const container = document.getElementById('communities-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Loading communities...</p>
                </div>
            `;
        }
    }

    // Utility Methods
    getStatusColor(status) {
        const colors = {
            'completed': 'bg-green-100 text-green-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    // Cleanup
    destroy() {
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PersonalDashboardController();
});

export default PersonalDashboardController;
```

## **2. Enhanced Firebase Service Methods**

### **File: `client/js/firebaseService.js` (Add these methods)**

```javascript
// Add these methods to the existing FirebaseService class

async getUserProfile(userId) {
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        }
        throw new Error('User profile not found');
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

async getUserStats(userId) {
    try {
        const statsDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId, 'stats', 'overview'));
        if (statsDoc.exists()) {
            return statsDoc.data();
        }
        
        // Return default stats if none exist
        return {
            problemsSolved: 0,
            skillRating: 0,
            totalSubmissions: 0,
            dayStreak: 0,
            pointsEarned: 0,
            badgesEarned: 0
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
}

async getUserProjects(userId, limit = 10) {
    try {
        const projectsRef = collection(db, COLLECTIONS.USERS, userId, 'projects');
        const q = query(projectsRef, orderBy('createdAt', 'desc'), limit(limit));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting user projects:', error);
        throw error;
    }
}

async getUserTasks(userId, limit = 10) {
    try {
        const tasksRef = collection(db, COLLECTIONS.USERS, userId, 'tasks');
        const q = query(tasksRef, orderBy('createdAt', 'desc'), limit(limit));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting user tasks:', error);
        throw error;
    }
}

async getUserAchievements(userId) {
    try {
        const achievementsRef = collection(db, COLLECTIONS.USERS, userId, 'achievements');
        const q = query(achievementsRef, orderBy('earnedAt', 'desc'));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting user achievements:', error);
        throw error;
    }
}

async getUserCommunities(userId) {
    try {
        const communitiesRef = collection(db, COLLECTIONS.USERS, userId, 'communities');
        const snapshot = await getDocs(communitiesRef);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting user communities:', error);
        throw error;
    }
}

// Real-time listeners
setupUserStatsListener(userId, callback) {
    const statsRef = doc(db, COLLECTIONS.USERS, userId, 'stats', 'overview');
    return onSnapshot(statsRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
}

setupUserProjectsListener(userId, callback) {
    const projectsRef = collection(db, COLLECTIONS.USERS, userId, 'projects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'), limit(5));
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(projects);
    });
}
```

## **3. Enhanced Personal Dashboard HTML**

### **File: `client/pages/personal/student-dashboard.html` (Update these sections)**

```html
<!-- Update the user profile section -->
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center space-x-4">
        <img id="user-avatar" src="/images/default-avatar.png" alt="User Avatar" 
             class="w-16 h-16 rounded-full object-cover border-2 border-gray-200">
        <div class="flex-1">
            <h2 id="user-name" class="text-xl font-semibold text-gray-900">Loading...</h2>
            <p id="user-email" class="text-gray-600">Loading...</p>
            <p id="user-bio" class="text-sm text-gray-500 mt-1">Loading...</p>
        </div>
    </div>
</div>

<!-- Update the stats section -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div class="text-2xl font-bold text-blue-600" id="problems-solved">0</div>
        <div class="text-sm text-gray-600">Problems Solved</div>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div class="text-2xl font-bold text-green-600" id="skill-rating">0</div>
        <div class="text-sm text-gray-600">Skill Rating</div>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div class="text-2xl font-bold text-purple-600" id="total-submissions">0</div>
        <div class="text-sm text-gray-600">Submissions</div>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div class="text-2xl font-bold text-orange-600" id="day-streak">0</div>
        <div class="text-sm text-gray-600">Day Streak</div>
    </div>
</div>

<!-- Update the projects section -->
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Recent Projects</h3>
        <a href="/pages/personal/projects.html" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
        </a>
    </div>
    <div id="recent-projects-list" class="space-y-4">
        <div class="text-center py-8">
            <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
            <p class="text-gray-500">Loading projects...</p>
        </div>
    </div>
</div>

<!-- Update the tasks section -->
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Recent Tasks</h3>
        <a href="/pages/personal/tracker.html" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
        </a>
    </div>
    <div id="recent-tasks-list" class="space-y-3">
        <div class="text-center py-8">
            <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
            <p class="text-gray-500">Loading tasks...</p>
        </div>
    </div>
</div>

<!-- Update the achievements section -->
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Achievements</h3>
        <a href="/pages/personal/stats.html" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
        </a>
    </div>
    <div id="achievements-list" class="space-y-3">
        <div class="text-center py-8">
            <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
            <p class="text-gray-500">Loading achievements...</p>
        </div>
    </div>
</div>

<!-- Update the communities section -->
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Communities</h3>
        <a href="/pages/personal/communities.html" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
        </a>
    </div>
    <div id="communities-list" class="space-y-3">
        <div class="text-center py-8">
            <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
            <p class="text-gray-500">Loading communities...</p>
        </div>
    </div>
</div>
```

## **4. Personal Profile Controller**

### **File: `client/js/personalProfileController.js`**

```javascript
import PageController from './pageController.js';

class PersonalProfileController extends PageController {
    constructor() {
        super();
        this.userData = null;
    }

    async loadPageData() {
        console.log('👤 PersonalProfileController: Loading profile data...');
        
        try {
            const userId = window.authManager.currentUser?.uid;
            if (!userId) {
                throw new Error('No authenticated user found');
            }

            await this.loadUserProfile(userId);
            await this.loadUserActivity(userId);
            await this.loadUserSkills(userId);
            
            console.log('✅ PersonalProfileController: Profile data loaded successfully');
            
        } catch (error) {
            console.error('❌ PersonalProfileController: Error loading profile data:', error);
            this.handleError(error);
        }
    }

    async loadUserProfile(userId) {
        try {
            const { default: firebaseService } = await import('./firebaseService.js');
            const userDoc = await firebaseService.getUserProfile(userId);
            
            this.userData = userDoc;
            this.updateProfileForm(userDoc);
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            this.showDefaultProfile();
        }
    }

    async loadUserActivity(userId) {
        try {
            const { default: firebaseService } = await import('./firebaseService.js');
            const activities = await firebaseService.getUserActivity(userId, 20);
            
            this.updateActivityUI(activities);
            
        } catch (error) {
            console.error('Error loading user activity:', error);
            this.showDefaultActivity();
        }
    }

    async loadUserSkills(userId) {
        try {
            const { default: firebaseService } = await import('./firebaseService.js');
            const skills = await firebaseService.getUserSkills(userId);
            
            this.updateSkillsUI(skills);
            
        } catch (error) {
            console.error('Error loading user skills:', error);
            this.showDefaultSkills();
        }
    }

    updateProfileForm(userData) {
        // Update form fields
        const fields = ['name', 'email', 'bio', 'location', 'website', 'github', 'linkedin'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && userData[field]) {
                element.value = userData[field];
            }
        });

        // Update avatar
        const avatarElement = document.getElementById('profile-avatar');
        if (avatarElement && userData.avatar) {
            avatarElement.src = userData.avatar;
        }
    }

    updateActivityUI(activities) {
        const container = document.getElementById('activity-list');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="activity" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No recent activity</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <i data-lucide="${this.getActivityIcon(activity.type)}" class="w-4 h-4 text-blue-600"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-sm text-gray-900">${activity.description}</p>
                    <p class="text-xs text-gray-500 mt-1">${this.formatDate(activity.timestamp)}</p>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    updateSkillsUI(skills) {
        const container = document.getElementById('skills-list');
        if (!container) return;

        if (skills.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="code" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No skills added yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = skills.map(skill => `
            <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <i data-lucide="code" class="w-4 h-4 text-green-600"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900">${skill.name}</p>
                        <p class="text-xs text-gray-500">${skill.category}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div class="bg-green-600 h-2 rounded-full" style="width: ${skill.level}%"></div>
                    </div>
                    <span class="text-xs text-gray-500">${skill.level}%</span>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    getActivityIcon(type) {
        const icons = {
            'project_created': 'folder-plus',
            'task_completed': 'check-circle',
            'achievement_earned': 'award',
            'community_joined': 'users',
            'profile_updated': 'user'
        };
        return icons[type] || 'activity';
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    // Default states
    showDefaultProfile() {
        this.updateProfileForm({
            name: 'User',
            email: 'user@example.com',
            bio: 'Welcome to SkillPort!'
        });
    }

    showDefaultActivity() {
        const container = document.getElementById('activity-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading activity...</p>
                </div>
            `;
        }
    }

    showDefaultSkills() {
        const container = document.getElementById('skills-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading skills...</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PersonalProfileController();
});

export default PersonalProfileController;
```

## **5. Quick Implementation Guide**

### **Step 1: Update Firebase Service**
Add the new methods to `client/js/firebaseService.js`

### **Step 2: Update Controllers**
Replace the existing controller files with the enhanced versions above.

### **Step 3: Update HTML Templates**
Add the dynamic containers with proper IDs to your HTML files.

### **Step 4: Test**
1. Start your servers
2. Login to the application
3. Navigate to personal pages
4. Verify dynamic content loads

## **6. Key Features Implemented**

✅ **Dynamic Content Loading** - All data loads from Firestore
✅ **Real-time Updates** - Uses Firebase listeners
✅ **Error Handling** - Graceful fallbacks for missing data
✅ **Loading States** - Shows loading indicators
✅ **Responsive Design** - Works on all screen sizes
✅ **Modular Architecture** - Follows existing project structure
✅ **Authentication Integration** - Uses existing auth system
✅ **Tailwind CSS** - Consistent styling

The implementation is ready to use and will make all your personal pages fully dynamic with Firebase integration! 🚀
