/**
 * Breadcrumb Navigation System
 * Provides contextual navigation paths for users
 */

class SkillPortBreadcrumbs {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.userRole = this.getUserRole();
    this.init();
  }

  init() {
    this.createBreadcrumbs();
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

  createBreadcrumbs() {
    const main = document.querySelector('main');
    if (!main) return;

    const breadcrumbs = this.generateBreadcrumbs();
    if (breadcrumbs) {
      const breadcrumbElement = document.createElement('nav');
      breadcrumbElement.className = 'breadcrumb';
      breadcrumbElement.setAttribute('aria-label', 'Breadcrumb');
      breadcrumbElement.innerHTML = breadcrumbs;
      
      // Insert breadcrumbs at the beginning of main content
      main.insertBefore(breadcrumbElement, main.firstChild);
    }
  }

  generateBreadcrumbs() {
    const breadcrumbData = this.getBreadcrumbData();
    if (!breadcrumbData || breadcrumbData.length === 0) return null;

    return breadcrumbData.map((item, index) => {
      const isLast = index === breadcrumbData.length - 1;
      
      if (isLast) {
        return `
          <span class="breadcrumb-item text-slate-900 font-medium">
            ${item.label}
          </span>
        `;
      }

      return `
        <a href="${item.href}" class="breadcrumb-item hover:text-blue-600">
          ${item.label}
        </a>
        <span class="breadcrumb-separator">
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </span>
      `;
    }).join('');
  }

  getBreadcrumbData() {
    const breadcrumbs = {
      'user-dashboard': [
        { label: 'Home', href: '../index.html' },
        { label: 'Dashboard', href: '#' }
      ],
      'user-contests': [
        { label: 'Home', href: '../index.html' },
        { label: 'Dashboard', href: 'user-dashboard.html' },
        { label: 'My Contests', href: '#' }
      ],
      'user-tasks': [
        { label: 'Home', href: '../index.html' },
        { label: 'Dashboard', href: 'user-dashboard.html' },
        { label: 'My Tasks', href: '#' }
      ],
      'user-leaderboard': [
        { label: 'Home', href: '../index.html' },
        { label: 'Dashboard', href: 'user-dashboard.html' },
        { label: 'Leaderboard', href: '#' }
      ],
      'user-mentor-feedback': [
        { label: 'Home', href: '../index.html' },
        { label: 'Dashboard', href: 'user-dashboard.html' },
        { label: 'Mentor Feedback', href: '#' }
      ],
      'certificates': [
        { label: 'Home', href: '../index.html' },
        { label: 'Dashboard', href: 'user-dashboard.html' },
        { label: 'Certificates', href: '#' }
      ],
      'admin-dashboard': [
        { label: 'Home', href: '../index.html' },
        { label: 'Admin Dashboard', href: '#' }
      ],
      'admin-users': [
        { label: 'Home', href: '../index.html' },
        { label: 'Admin Dashboard', href: 'admin-dashboard.html' },
        { label: 'Users', href: '#' }
      ],
      'admin-mentors': [
        { label: 'Home', href: '../index.html' },
        { label: 'Admin Dashboard', href: 'admin-dashboard.html' },
        { label: 'Mentors', href: '#' }
      ],
      'admin-contests': [
        { label: 'Home', href: '../index.html' },
        { label: 'Admin Dashboard', href: 'admin-dashboard.html' },
        { label: 'Contests', href: '#' }
      ],
      'admin-analytics': [
        { label: 'Home', href: '../index.html' },
        { label: 'Admin Dashboard', href: 'admin-dashboard.html' },
        { label: 'Analytics', href: '#' }
      ],
      'admin-leaderboard': [
        { label: 'Home', href: '../index.html' },
        { label: 'Admin Dashboard', href: 'admin-dashboard.html' },
        { label: 'Leaderboard', href: '#' }
      ],
      'admin-settings': [
        { label: 'Home', href: '../index.html' },
        { label: 'Admin Dashboard', href: 'admin-dashboard.html' },
        { label: 'Settings', href: '#' }
      ],
      'mentor-dashboard': [
        { label: 'Home', href: '../index.html' },
        { label: 'Mentor Dashboard', href: '#' }
      ],
      'mentor-contests': [
        { label: 'Home', href: '../index.html' },
        { label: 'Mentor Dashboard', href: 'mentor-dashboard.html' },
        { label: 'Contests', href: '#' }
      ],
      'mentor-feedback': [
        { label: 'Home', href: '../index.html' },
        { label: 'Mentor Dashboard', href: 'mentor-dashboard.html' },
        { label: 'Feedback', href: '#' }
      ],
      'mentor-leaderboard': [
        { label: 'Home', href: '../index.html' },
        { label: 'Mentor Dashboard', href: 'mentor-dashboard.html' },
        { label: 'Leaderboard', href: '#' }
      ],
      'student-analytics': [
        { label: 'Home', href: '../index.html' },
        { label: 'Mentor Dashboard', href: 'mentor-dashboard.html' },
        { label: 'Student Analytics', href: '#' }
      ],
      'top-performing-students': [
        { label: 'Home', href: '../index.html' },
        { label: 'Mentor Dashboard', href: 'mentor-dashboard.html' },
        { label: 'Top Students', href: '#' }
      ]
    };

    return breadcrumbs[this.currentPage] || null;
  }
}

// Initialize breadcrumbs when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SkillPortBreadcrumbs();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillPortBreadcrumbs;
}
