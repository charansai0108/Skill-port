// SkillPort Authentication Utilities (Local Storage Based)
// This file provides authentication functions without requiring a backend

class SkillPortAuth {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  // Initialize authentication system
  init() {
    if (this.isInitialized) return;
    
    // Initialize demo users if they don't exist
    this.initializeDemoUsers();
    this.isInitialized = true;
    
    console.log('SkillPort Auth initialized (Local Storage)');
  }

  // Demo user accounts
  get demoUsers() {
    return [
      {
        email: 'admin@skillport.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        id: 1
      },
      {
        email: 'mentor@skillport.com',
        password: 'mentor123',
        name: 'Mentor User',
        role: 'mentor',
        id: 2
      },
      {
        email: 'student@skillport.com',
        password: 'student123',
        name: 'Student User',
        role: 'student',
        id: 3
      }
    ];
  }

  // Initialize demo users in local storage
  initializeDemoUsers() {
    const existingUsers = localStorage.getItem('skillport_demo_users');
    if (!existingUsers) {
      localStorage.setItem('skillport_demo_users', JSON.stringify(this.demoUsers));
      console.log('Demo users initialized in local storage');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('skillport_token');
    const userData = localStorage.getItem('skillport_user');
    const isAuth = localStorage.getItem('skillport_is_authenticated');
    
    if (!token || !userData || isAuth !== 'true') {
      return false;
    }

    try {
      const user = JSON.parse(userData);
      const tokenExp = user.loginTime ? new Date(user.loginTime).getTime() + (24 * 60 * 60 * 1000) : 0;
      
      // Check if token is expired (24 hours)
      if (Date.now() >= tokenExp) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      this.logout();
      return false;
    }
  }

  // Get current user data
  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const userData = localStorage.getItem('skillport_user');
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  // Check if user has specific role
  hasRole(role) {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Check if user is mentor
  isMentor() {
    return this.hasRole('mentor');
  }

  // Check if user is student
  isStudent() {
    return this.hasRole('student');
  }

  // Login function
  async login(email, password) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check credentials against demo users
      const user = this.demoUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Store user session in local storage
        const userData = {
          ...user,
          loginTime: new Date().toISOString(),
          token: this.generateMockToken(user.id, user.email, user.role)
        };
        
        localStorage.setItem('skillport_user', JSON.stringify(userData));
        localStorage.setItem('skillport_token', userData.token);
        localStorage.setItem('skillport_is_authenticated', 'true');
        
        console.log('User logged in:', userData);
        
        return {
          success: true,
          message: 'Login successful',
          data: {
            user: user,
            token: userData.token
          }
        };
      } else {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Logout function
  logout() {
    localStorage.removeItem('skillport_token');
    localStorage.removeItem('skillport_user');
    localStorage.removeItem('skillport_is_authenticated');
    console.log('User logged out');
  }

  // Generate mock JWT token
  generateMockToken(userId, email, role) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userId: userId,
      email: email,
      role: role,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    const signature = btoa('mock-signature-' + Date.now());
    
    return `${header}.${payload}.${signature}`;
  }

  // Redirect to appropriate dashboard
  redirectToDashboard() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = '../index.html';
      return;
    }

    const dashboards = {
      'admin': 'admin/admin-dashboard.html',
      'mentor': 'mentor/mentor-dashboard.html',
      'student': 'user/user-dashboard.html',
      'user': 'user/user-dashboard.html'
    };
    
    const dashboardPath = dashboards[user.role] || dashboards['user'];
    console.log('Redirecting to:', dashboardPath);
    window.location.href = dashboardPath;
  }

  // Require authentication (redirect to login if not authenticated)
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '../index.html';
      return false;
    }
    return true;
  }

  // Require specific role
  requireRole(role) {
    if (!this.requireAuth()) {
      return false;
    }

    if (!this.hasRole(role)) {
      alert(`Access denied. This page requires ${role} role.`);
      this.redirectToDashboard();
      return false;
    }

    return true;
  }

  // Require admin role
  requireAdmin() {
    return this.requireRole('admin');
  }

  // Require mentor role
  requireMentor() {
    return this.requireRole('mentor');
  }

  // Require student role
  requireStudent() {
    return this.requireRole('student');
  }
}

// Create global instance
window.SkillPortAuth = new SkillPortAuth();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillPortAuth;
}
