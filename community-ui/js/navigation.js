/**
 * Unified Navigation System for SkillPort Community
 * Provides consistent navigation across all pages
 */

class SkillPortNavigation {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.userRole = this.getUserRole();
    this.init();
  }

  init() {
    this.createNavigation();
    this.setupMobileNavigation();
    this.setupUserMenu();
    this.setupSearch();
    this.highlightCurrentPage();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
  }

  getUserRole() {
    const userData = localStorage.getItem('skillport_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role || 'user';
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return 'user';
  }

  createNavigation() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Create navigation structure based on user role
    const navContent = this.generateNavigationContent();
    nav.innerHTML = navContent;

    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  generateNavigationContent() {
    const logo = this.generateLogo();
    const navItems = this.generateNavItems();
    const userSection = this.generateUserSection();

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          ${logo}
          
          <div class="hidden md:flex items-center gap-2 nav-items">
            ${navItems}
          </div>

          <div class="flex items-center gap-4">
            ${this.generateSearchBar()}
            ${userSection}
            ${this.generateMobileToggle()}
          </div>
        </div>
      </div>
    `;
  }

  generateLogo() {
    const isAdmin = this.userRole === 'admin';
    const isLandingPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    
    if (isLandingPage) {
      return `
        <div class="flex items-center gap-3 group">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <i data-lucide="sparkles" class="w-6 h-6 text-white"></i>
          </div>
          <span class="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            SkillPort
          </span>
        </div>
      `;
    }
    
    const logoColor = isAdmin ? 'from-red-600 to-pink-600' : 'from-blue-600 to-indigo-600';
    const logoIcon = isAdmin ? 'shield' : 'sparkles';
    const logoText = isAdmin ? 'Community Admin' : 'SkillPort';

    return `
      <div class="flex items-center gap-3 group">
        <div class="w-10 h-10 bg-gradient-to-br ${logoColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
          <i data-lucide="${logoIcon}" class="w-6 h-6 text-white"></i>
        </div>
        <span class="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          ${logoText}
        </span>
      </div>
    `;
  }

  generateNavItems() {
    const isLandingPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    
    if (isLandingPage) {
      return ''; // No navigation items on landing page
    }
    
    const navItems = this.getNavigationItems();
    return navItems.map(item => {
      const isActive = this.currentPage === item.id ? 'active' : '';
      const isHighlighted = this.currentPage === item.id ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50';
      
      return `
        <a href="${item.href}" class="nav-item ${isActive} ${isHighlighted} flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
          <i data-lucide="${item.icon}" class="w-4 h-4"></i>
          ${item.label}
        </a>
      `;
    }).join('');
  }

  getNavigationItems() {
    const baseItems = {
      user: [
        { id: 'user-dashboard', href: 'user-dashboard.html', label: 'Dashboard', icon: 'layout-dashboard' },
        { id: 'user-contests', href: 'user-contests.html', label: 'Contests', icon: 'trophy' },
        { id: 'user-tasks', href: 'user-tasks.html', label: 'Tasks', icon: 'target' },
        { id: 'user-leaderboard', href: 'user-leaderboard.html', label: 'Leaderboard', icon: 'bar-chart-3' },
        { id: 'user-mentor-feedback', href: 'user-mentor-feedback.html', label: 'Mentor Feedback', icon: 'message-circle' },
        { id: 'certificates', href: 'certificates.html', label: 'Certificates', icon: 'award' }
      ],
      admin: [
        { id: 'admin-dashboard', href: 'admin-dashboard.html', label: 'Dashboard', icon: 'layout-dashboard' },
        { id: 'admin-users', href: 'admin-users.html', label: 'Users', icon: 'users' },
        { id: 'admin-mentors', href: 'admin-mentors.html', label: 'Mentors', icon: 'graduation-cap' },
        { id: 'admin-contests', href: 'admin-contests.html', label: 'Contests', icon: 'trophy' },
        { id: 'admin-analytics', href: 'admin-analytics.html', label: 'Analytics', icon: 'bar-chart-3' },
        { id: 'admin-leaderboard', href: 'admin-leaderboard.html', label: 'Leaderboard', icon: 'award' },
        { id: 'admin-settings', href: 'admin-settings.html', label: 'Settings', icon: 'settings' }
      ],
      mentor: [
        { id: 'mentor-dashboard', href: 'mentor-dashboard.html', label: 'Dashboard', icon: 'layout-dashboard' },
        { id: 'mentor-contests', href: 'mentor-contests.html', label: 'Contests', icon: 'trophy' },
        { id: 'mentor-feedback', href: 'mentor-feedback.html', label: 'Feedback', icon: 'message-circle' },
        { id: 'mentor-leaderboard', href: 'mentor-leaderboard.html', label: 'Leaderboard', icon: 'bar-chart-3' },
        { id: 'student-analytics', href: 'student-analytics.html', label: 'Student Analytics', icon: 'users' },
        { id: 'top-performing-students', href: 'top-performing-students.html', label: 'Top Students', icon: 'award' }
      ]
    };

    return baseItems[this.userRole] || baseItems.user;
  }

  generateSearchBar() {
    const isLandingPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    
    if (isLandingPage) {
      return ''; // No search bar on landing page
    }
    
    return `
      <div class="search-bar">
        <input type="text" class="search-input" placeholder="Search..." />
        <i data-lucide="search" class="search-icon w-5 h-5"></i>
      </div>
    `;
  }

  generateUserSection() {
    const userData = localStorage.getItem('skillport_user');
    if (!userData) {
      // Check if we're on the main landing page
      const isLandingPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
      if (isLandingPage) {
        return `
          <div class="flex items-center gap-6">
            <a href="pages/register.html" class="text-slate-600 hover:text-slate-900 font-medium text-lg transition-colors duration-200">Get Started</a>
          </div>
        `;
      } else {
        return `
          <div class="flex items-center gap-3">
            <a href="../register.html" class="btn-primary text-sm px-4 py-2">Get Started</a>
          </div>
        `;
      }
    }

    try {
      const user = JSON.parse(userData);
      return `
        <div class="user-menu">
          <button class="user-menu-button" onclick="window.skillportNav.toggleUserMenu()">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span>${user.name || user.email}</span>
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </button>
          
          <div class="user-dropdown" id="user-dropdown">
            <a href="profile.html" class="user-dropdown-item">
              <i data-lucide="user" class="w-4 h-4"></i>
              Profile
            </a>
            <a href="settings.html" class="user-dropdown-item">
              <i data-lucide="settings" class="w-4 h-4"></i>
              Settings
            </a>
            <div class="border-t border-slate-200 my-2"></div>
            <a href="#" class="user-dropdown-item text-red-600" onclick="window.skillportNav.logout()">
              <i data-lucide="log-out" class="w-4 h-4"></i>
              Sign Out
            </a>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return this.generateUserSection();
    }
  }

  generateMobileToggle() {
    const isLandingPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    
    if (isLandingPage) {
      return ''; // No mobile toggle on landing page
    }
    
    return `
      <button class="mobile-nav-toggle md:hidden" onclick="window.skillportNav.toggleMobileNav()">
        <i data-lucide="menu" class="w-6 h-6"></i>
      </button>
    `;
  }

  setupMobileNavigation() {
    const isLandingPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    
    if (isLandingPage) {
      return; // No mobile navigation on landing page
    }
    
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.innerHTML = `
      <div class="mobile-nav-content">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-slate-900">Menu</h3>
          <button onclick="window.skillportNav.toggleMobileNav()" class="text-slate-500 hover:text-slate-700">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
        <div class="space-y-2">
          ${this.getNavigationItems().map(item => `
            <a href="${item.href}" class="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
              <div class="flex items-center gap-3">
                <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                <span>${item.label}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(mobileNav);
  }

  setupUserMenu() {
    // User menu functionality is handled by the toggleUserMenu method
  }

  setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }
  }

  handleSearch(query) {
    // Implement search functionality
    console.log('Searching for:', query);
  }

  toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  toggleMobileNav() {
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
      mobileNav.classList.toggle('show');
    }
  }

  highlightCurrentPage() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.href && item.href.includes(this.currentPage)) {
        item.classList.add('active');
      }
    });
  }

  logout() {
    localStorage.removeItem('skillport_token');
    localStorage.removeItem('skillport_user');
    window.location.href = '../index.html';
  }

  // Close dropdowns when clicking outside
  setupClickOutside() {
    document.addEventListener('click', (e) => {
      const userMenu = document.querySelector('.user-menu');
      const dropdown = document.getElementById('user-dropdown');
      
      if (userMenu && !userMenu.contains(e.target) && dropdown) {
        dropdown.classList.remove('show');
      }
    });
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.skillportNav = new SkillPortNavigation();
  window.skillportNav.setupClickOutside();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillPortNavigation;
}
