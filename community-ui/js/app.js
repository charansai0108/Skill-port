/**
 * SkillPort Main Application Controller
 * Integrates all three components: Personal, Community, and Extension
 */

class SkillPortApp {
  constructor() {
    this.api = window.SkillPortAPI;
    this.currentUser = null;
    this.currentComponent = null;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    try {
      // Check if user is already authenticated
      if (this.api.isAuthenticated()) {
        await this.loadUserData();
        this.setupAuthenticatedApp();
      } else {
        this.setupUnauthenticatedApp();
      }

      this.setupGlobalEventListeners();
      this.isInitialized = true;
      
      console.log('🎯 SkillPort App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      this.showError('Failed to initialize application');
    }
  }

  async loadUserData() {
    try {
      const response = await this.api.getCurrentUser();
      if (response.success) {
        this.currentUser = response.user;
        this.updateUIForUser();
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      this.api.logout();
      window.location.href = '/index.html';
    }
  }

  setupAuthenticatedApp() {
    // Hide login/register forms
    this.hideElement('.auth-forms');
    
    // Show user-specific content
    this.showElement('.user-content');
    
    // Setup navigation based on user role
    this.setupNavigation();
    
    // Load appropriate dashboard
    this.loadDashboard();
  }

  setupUnauthenticatedApp() {
    // Show login/register forms
    this.showElement('.auth-forms');
    
    // Hide user-specific content
    this.hideElement('.user-content');
    
    // Setup public navigation
    this.setupPublicNavigation();
  }

  setupNavigation() {
    const nav = document.querySelector('.main-navigation');
    if (!nav) return;

    // Clear existing navigation
    nav.innerHTML = '';

    // Add role-based navigation items
    if (this.currentUser.role === 'admin') {
      this.addNavItem(nav, 'Dashboard', '/admin/dashboard.html', 'home');
      this.addNavItem(nav, 'Users', '/admin/admin-users.html', 'users');
      this.addNavItem(nav, 'Contests', '/admin/admin-contests.html', 'trophy');
      this.addNavItem(nav, 'Communities', '/admin/admin-communities.html', 'users');
      this.addNavItem(nav, 'Analytics', '/admin/admin-analytics.html', 'bar-chart-3');
    } else if (this.currentUser.role === 'mentor') {
      this.addNavItem(nav, 'Dashboard', '/mentor/mentor-dashboard.html', 'home');
      this.addNavItem(nav, 'Contests', '/mentor/mentor-contests.html', 'trophy');
      this.addNavItem(nav, 'Students', '/mentor/mentor-students.html', 'users');
      this.addNavItem(nav, 'Leaderboard', '/mentor/mentor-contest-leaderboard.html', 'award');
    } else if (this.currentUser.role === 'student') {
      this.addNavItem(nav, 'Personal', '/skillport-personal/student-dashboard.html', 'home');
      this.addNavItem(nav, 'Community', '/community-ui/index.html', 'users');
      this.addNavItem(nav, 'Contests', '/skillport-personal/contests.html', 'trophy');
      this.addNavItem(nav, 'Progress', '/skillport-personal/stats.html', 'trending-up');
    } else {
      // Community user
      this.addNavItem(nav, 'Community', '/community-ui/index.html', 'home');
      this.addNavItem(nav, 'Personal', '/skillport-personal/student-dashboard.html', 'user');
    }

    // Add common items
    this.addNavItem(nav, 'Profile', '/community-ui/pages/profile.html', 'user');
    this.addNavItem(nav, 'Logout', '#', 'log-out', () => this.logout());
  }

  setupPublicNavigation() {
    const nav = document.querySelector('.main-navigation');
    if (!nav) return;

    nav.innerHTML = '';
    this.addNavItem(nav, 'Home', '/', 'home');
    this.addNavItem(nav, 'Features', '#features', 'star');
    this.addNavItem(nav, 'Pricing', '#pricing', 'dollar-sign');
    this.addNavItem(nav, 'Register', '/register.html', 'user-plus');
  }

  addNavItem(nav, text, href, icon, onClick = null) {
    const navItem = document.createElement('a');
    navItem.href = href;
    navItem.className = 'nav-item';
    navItem.innerHTML = `
      <i data-lucide="${icon}"></i>
      <span>${text}</span>
    `;
    
    if (onClick) {
      navItem.addEventListener('click', (e) => {
        e.preventDefault();
        onClick();
      });
    }
    
    nav.appendChild(navItem);
  }

  async loadDashboard() {
    try {
      // Load dashboard based on user role and current page
      const currentPath = window.location.pathname;
      
      if (currentPath.includes('/admin/')) {
        await this.loadAdminDashboard();
      } else if (currentPath.includes('/mentor/')) {
        await this.loadMentorDashboard();
      } else if (currentPath.includes('/skillport-personal/')) {
        await this.loadPersonalDashboard();
      } else if (currentPath.includes('/community-ui/')) {
        await this.loadCommunityDashboard();
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }

  async loadAdminDashboard() {
    try {
      const stats = await this.api.getDashboardStats();
      if (stats.success) {
        this.updateAdminStats(stats.data);
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    }
  }

  async loadMentorDashboard() {
    try {
      // Load mentor-specific data
      const contests = await this.api.getContests({ createdBy: this.currentUser.id });
      if (contests.success) {
        this.updateMentorContests(contests.data);
      }
    } catch (error) {
      console.error('Failed to load mentor data:', error);
    }
  }

  async loadPersonalDashboard() {
    try {
      // Load student-specific data
      const stats = await this.api.getUserStats(this.currentUser.id);
      if (stats.success) {
        this.updatePersonalStats(stats.data);
      }
    } catch (error) {
      console.error('Failed to load personal stats:', error);
    }
  }

  async loadCommunityDashboard() {
    try {
      // Load community data
      const communities = await this.api.getCommunities();
      if (communities.success) {
        this.updateCommunityList(communities.data);
      }
    } catch (error) {
      console.error('Failed to load community data:', error);
    }
  }

  // Extension Integration Methods
  async handleExtensionData(data) {
    try {
      // Process data from Chrome extension
      if (data.type === 'submission') {
        await this.processExtensionSubmission(data);
      } else if (data.type === 'flag') {
        await this.processExtensionFlag(data);
      }
      
      // Update relevant UI components
      this.refreshRelevantData(data);
    } catch (error) {
      console.error('Failed to process extension data:', error);
    }
  }

  async processExtensionSubmission(data) {
    try {
      // Create submission in backend
      const submission = await this.api.createSubmission({
        user: this.currentUser.id,
        platform: data.platform,
        problemTitle: data.problemTitle,
        difficulty: data.difficulty,
        submissionTime: data.submissionTime,
        code: data.code,
        language: data.language,
        status: data.status,
        contest: data.contestId || null
      });

      if (submission.success) {
        this.showNotification('Submission recorded successfully', 'success');
        this.updateSubmissionCount();
      }
    } catch (error) {
      console.error('Failed to process submission:', error);
      this.showNotification('Failed to record submission', 'error');
    }
  }

  async processExtensionFlag(data) {
    try {
      // Process flagged submission
      const flag = await this.api.flagSubmission(data.submissionId, {
        reason: data.reason,
        details: data.details,
        severity: data.severity
      });

      if (flag.success) {
        this.showNotification('Submission flagged for review', 'warning');
        this.updateFlaggedSubmissions();
      }
    } catch (error) {
      console.error('Failed to process flag:', error);
    }
  }

  // Real-time Updates
  setupRealTimeUpdates() {
    // Check for new data every 30 seconds
    setInterval(async () => {
      if (this.currentUser) {
        await this.refreshCurrentData();
      }
    }, 30000);

    // Listen for extension messages
    window.addEventListener('message', (event) => {
      if (event.origin === window.location.origin && event.data.type === 'extension') {
        this.handleExtensionData(event.data);
      }
    });
  }

  async refreshCurrentData() {
    try {
      // Refresh current page data
      const currentPath = window.location.pathname;
      
      if (currentPath.includes('/admin/')) {
        await this.loadAdminDashboard();
      } else if (currentPath.includes('/mentor/')) {
        await this.loadMentorDashboard();
      } else if (currentPath.includes('/skillport-personal/')) {
        await this.loadPersonalStats();
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }

  // UI Update Methods
  updateUIForUser() {
    // Update user info display
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
      userInfo.innerHTML = `
        <div class="flex items-center space-x-3">
          <img src="${this.currentUser.avatar || '/assets/default-avatar.png'}" 
               alt="${this.currentUser.firstName}" 
               class="w-8 h-8 rounded-full">
          <div>
            <div class="font-semibold">${this.currentUser.firstName} ${this.currentUser.lastName}</div>
            <div class="text-sm text-gray-500">${this.currentUser.role}</div>
          </div>
        </div>
      `;
    }

    // Update page title
    document.title = `SkillPort - ${this.currentUser.firstName}`;
  }

  updateAdminStats(stats) {
    // Update admin dashboard statistics
    const elements = {
      totalUsers: document.querySelector('#total-users'),
      activeUsers: document.querySelector('#active-users'),
      pendingUsers: document.querySelector('#pending-users'),
      totalContests: document.querySelector('#total-contests')
    };

    if (elements.totalUsers) elements.totalUsers.textContent = stats.userStats.total;
    if (elements.activeUsers) elements.activeUsers.textContent = stats.userStats.active;
    if (elements.pendingUsers) elements.pendingUsers.textContent = stats.userStats.pending;
    if (elements.totalContests) elements.totalContests.textContent = stats.contestStats?.total || 0;
  }

  updateMentorContests(contests) {
    // Update mentor contest list
    const contestList = document.querySelector('#mentor-contests');
    if (contestList && contests.contests) {
      contestList.innerHTML = contests.contests.map(contest => `
        <div class="contest-card">
          <h3>${contest.name}</h3>
          <p>${contest.description}</p>
          <div class="contest-stats">
            <span>${contest.totalParticipants} participants</span>
            <span>${contest.status}</span>
          </div>
        </div>
      `).join('');
    }
  }

  updatePersonalStats(stats) {
    // Update personal dashboard statistics
    const elements = {
      totalSubmissions: document.querySelector('#total-submissions'),
      successRate: document.querySelector('#success-rate'),
      totalPoints: document.querySelector('#total-points'),
      problemsSolved: document.querySelector('#problems-solved')
    };

    if (elements.totalSubmissions) elements.totalSubmissions.textContent = stats.totalSubmissions;
    if (elements.successRate) elements.successRate.textContent = `${stats.successRate.toFixed(1)}%`;
    if (elements.totalPoints) elements.totalPoints.textContent = stats.totalPoints;
    if (elements.problemsSolved) elements.problemsSolved.textContent = stats.uniqueProblemsSolved;
  }

  updateCommunityList(communities) {
    // Update community list
    const communityList = document.querySelector('#community-list');
    if (communityList && communities.communities) {
      communityList.innerHTML = communities.communities.map(community => `
        <div class="community-card">
          <h3>${community.name}</h3>
          <p>${community.description}</p>
          <div class="community-stats">
            <span>${community.memberCount} members</span>
            <span>${community.status}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Utility Methods
  showElement(selector) {
    const element = document.querySelector(selector);
    if (element) element.style.display = 'block';
  }

  hideElement(selector) {
    const element = document.querySelector(selector);
    if (element) element.style.display = 'none';
  }

  showNotification(message, type = 'info') {
    this.api.showNotification(message, type);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  async logout() {
    try {
      await this.api.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout anyway
      window.location.href = '/';
    }
  }

  // Global Event Listeners
  setupGlobalEventListeners() {
    // Handle form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.classList.contains('api-form')) {
        e.preventDefault();
        this.handleFormSubmission(e.target);
      }
    });

    // Handle navigation
    document.addEventListener('click', (e) => {
      if (e.target.closest('.nav-item')) {
        e.preventDefault();
        const href = e.target.closest('.nav-item').href;
        this.navigateTo(href);
      }
    });

    // Handle authentication
    document.addEventListener('click', (e) => {
      if (e.target.matches('.login-btn')) {
        e.preventDefault();
        this.showLoginForm();
      }
      if (e.target.matches('.register-btn')) {
        e.preventDefault();
        this.showRegisterForm();
      }
    });
  }

  async handleFormSubmission(form) {
    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      const action = form.dataset.action;
      let response;

      switch (action) {
        case 'login':
          response = await this.api.login(data.identifier, data.password);
          break;
        case 'register':
          response = await this.api.register(data);
          break;
        case 'create-user':
          response = await this.api.createUser(data);
          break;
        case 'create-contest':
          response = await this.api.createContest(data);
          break;
        default:
          console.warn('Unknown form action:', action);
          return;
      }

      if (response.success) {
        this.showNotification(response.message, 'success');
        this.refreshCurrentData();
        
        // Redirect if needed
        if (response.redirect) {
          window.location.href = response.redirect;
        }
      } else {
        this.showNotification(response.message, 'error');
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      this.showError('An error occurred. Please try again.');
    }
  }

  navigateTo(href) {
    // Handle internal navigation
    if (href.startsWith('/') || href.startsWith('./')) {
      window.location.href = href;
    } else if (href.startsWith('#')) {
      // Handle anchor links
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  showLoginForm() {
    // Show login modal/form
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
      loginForm.style.display = 'block';
    }
  }

  showRegisterForm() {
    // Show register modal/form
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
      registerForm.style.display = 'block';
    }
  }

  // Extension Communication
  sendMessageToExtension(message) {
    // Send message to Chrome extension if available
    if (window.chrome && window.chrome.runtime) {
      window.chrome.runtime.sendMessage(message);
    }
  }

  // Performance Monitoring
  startPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
      
      // Send performance data to backend
      if (this.currentUser) {
        this.api.request('/analytics/performance', {
          method: 'POST',
          body: JSON.stringify({
            page: window.location.pathname,
            loadTime: loadTime,
            userAgent: navigator.userAgent
          })
        }).catch(console.error);
      }
    });
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.SkillPortApp = new SkillPortApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillPortApp;
}
