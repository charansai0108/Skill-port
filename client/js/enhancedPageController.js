// Enhanced Base PageController with Safe Initialization
class EnhancedPageController {
    constructor() {
        this.isInitialized = false;
        this.authManager = null;
        this.contextManager = null;
        this.dataLoader = null;
        this.uiHelpers = null;
        this.currentUser = null;
        this.userData = null;
        this.retryCount = 0;
        this.maxRetries = 10;
    }

    async init() {
        console.log(`🎮 ${this.constructor.name}: Starting initialization...`);
        
        try {
            // Wait for all dependencies to load
            await this.waitForDependencies();
            
            // Check authentication
            if (!this.checkAuthentication()) {
                this.showLoginPrompt();
                return;
            }

            // Check role-based access
            if (!this.checkPagePermissions()) {
                this.handleUnauthorizedAccess();
                return;
            }

            // Load dashboard data
            await this.loadDashboardData();
            
            // Render the dashboard
            await this.renderDashboard();
            
            this.isInitialized = true;
            console.log(`✅ ${this.constructor.name}: Initialization completed successfully`);
            
        } catch (error) {
            console.error(`❌ ${this.constructor.name}: Initialization failed:`, error);
            this.handleError(error);
        }
    }

    async waitForDependencies() {
        console.log(`🎮 ${this.constructor.name}: Waiting for dependencies...`);
        
        while (this.retryCount < this.maxRetries) {
            try {
                // Check if AuthManager is available
                if (window.authManager && window.authManager.isReady) {
                    this.authManager = window.authManager;
                    console.log(`✅ ${this.constructor.name}: AuthManager ready`);
                } else {
                    throw new Error('AuthManager not ready');
                }

                // Check if ContextManager is available
                if (window.contextManager && window.contextManager.isReady) {
                    this.contextManager = window.contextManager;
                    console.log(`✅ ${this.constructor.name}: ContextManager ready`);
                } else {
                    throw new Error('ContextManager not ready');
                }

                // Check if DataLoader is available
                if (window.dataLoader && window.dataLoader.isReady) {
                    this.dataLoader = window.dataLoader;
                    console.log(`✅ ${this.constructor.name}: DataLoader ready`);
                } else {
                    throw new Error('DataLoader not ready');
                }

                // Check if UIHelpers is available
                if (window.uiHelpers && window.uiHelpers.isReady) {
                    this.uiHelpers = window.uiHelpers;
                    console.log(`✅ ${this.constructor.name}: UIHelpers ready`);
                } else {
                    throw new Error('UIHelpers not ready');
                }

                // All dependencies are ready
                break;

            } catch (error) {
                this.retryCount++;
                console.log(`🎮 ${this.constructor.name}: Waiting for dependencies... ${this.retryCount}/${this.maxRetries}`);
                
                if (this.retryCount >= this.maxRetries) {
                    throw new Error(`Dependencies not available after ${this.maxRetries} retries`);
                }
                
                // Wait 500ms before retrying
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    checkAuthentication() {
        console.log(`🎮 ${this.constructor.name}: Checking authentication...`);
        
        if (!this.authManager || !this.authManager.isAuthenticated) {
            console.log(`🎮 ${this.constructor.name}: User not authenticated`);
            return false;
        }

        this.currentUser = this.authManager.currentUser;
        console.log(`✅ ${this.constructor.name}: User authenticated: ${this.currentUser?.email}`);
        return true;
    }

    checkPagePermissions() {
        console.log(`🎮 ${this.constructor.name}: Checking page permissions...`);
        
        if (!this.currentUser || !this.currentUser.role) {
            console.log(`🎮 ${this.constructor.name}: No user role found`);
            return false;
        }

        const requiredRole = this.getRequiredRole();
        const userRole = this.currentUser.role;

        console.log(`🎮 ${this.constructor.name}: Required role: ${requiredRole}, User role: ${userRole}`);

        if (userRole !== requiredRole) {
            console.log(`🎮 ${this.constructor.name}: Role mismatch, redirecting...`);
            this.authManager.redirectByRole(userRole);
            return false;
        }

        console.log(`✅ ${this.constructor.name}: Page permissions verified`);
        return true;
    }

    getRequiredRole() {
        // Override this method in subclasses
        return 'personal';
    }

    async loadDashboardData() {
        console.log(`🎮 ${this.constructor.name}: Loading dashboard data...`);
        
        try {
            if (!this.currentUser || !this.currentUser.uid) {
                throw new Error('No authenticated user found');
            }

            // Load user data from Firestore
            this.userData = await this.dataLoader.loadUserData(this.currentUser.uid);
            console.log(`✅ ${this.constructor.name}: User data loaded successfully`);
            
        } catch (error) {
            console.error(`❌ ${this.constructor.name}: Error loading dashboard data:`, error);
            throw error;
        }
    }

    async renderDashboard() {
        console.log(`🎮 ${this.constructor.name}: Rendering dashboard...`);
        
        try {
            // Show loading state
            this.showLoadingState();
            
            // Render user profile
            this.renderUserProfile();
            
            // Render user stats
            this.renderUserStats();
            
            // Render dashboard-specific content
            await this.renderDashboardContent();
            
            // Hide loading state
            this.hideLoadingState();
            
            console.log(`✅ ${this.constructor.name}: Dashboard rendered successfully`);
            
        } catch (error) {
            console.error(`❌ ${this.constructor.name}: Error rendering dashboard:`, error);
            this.showErrorState(error);
        }
    }

    renderUserProfile() {
        if (!this.userData) return;

        const profileData = {
            name: this.userData.name || 'User',
            email: this.userData.email || this.currentUser.email,
            profileImage: this.userData.profileImage || '/images/default-avatar.png',
            bio: this.userData.bio || 'Welcome to SkillPort!',
            role: this.userData.role || this.currentUser.role
        };

        // Update profile elements
        this.updateElement('user-name', profileData.name);
        this.updateElement('user-email', profileData.email);
        this.updateElement('user-bio', profileData.bio);
        this.updateElement('user-role', profileData.role);
        
        const avatarElement = document.getElementById('user-avatar');
        if (avatarElement) {
            avatarElement.src = profileData.profileImage;
            avatarElement.alt = profileData.name;
        }
    }

    renderUserStats() {
        if (!this.userData || !this.userData.stats) return;

        const stats = this.userData.stats;
        const statsElements = {
            'problems-solved': stats.problemsSolved || 0,
            'skill-rating': stats.skillRating || 0,
            'total-submissions': stats.totalSubmissions || 0,
            'day-streak': stats.dayStreak || 0,
            'points-earned': stats.pointsEarned || 0,
            'badges-earned': stats.badgesEarned || 0
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    async renderDashboardContent() {
        // Override this method in subclasses
        console.log(`🎮 ${this.constructor.name}: Rendering dashboard-specific content...`);
    }

    showLoadingState() {
        const loadingElement = document.getElementById('loading-state');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    hideLoadingState() {
        const loadingElement = document.getElementById('loading-state');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    showErrorState(error) {
        const errorElement = document.getElementById('error-state');
        if (errorElement) {
            errorElement.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                    <p class="text-gray-600 mb-4">${error.message || 'An unexpected error occurred'}</p>
                    <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Try Again
                    </button>
                </div>
            `;
            errorElement.style.display = 'block';
        }
    }

    showLoginPrompt() {
        console.log(`🎮 ${this.constructor.name}: Showing login prompt`);
        
        const overlay = document.createElement('div');
        overlay.id = 'login-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        const loginCard = document.createElement('div');
        loginCard.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;
        
        loginCard.innerHTML = `
            <h2 style="margin-bottom: 1rem; color: #1f2937; font-size: 1.5rem; font-weight: 600;">
                🔐 Login Required
            </h2>
            <p style="margin-bottom: 1.5rem; color: #6b7280;">
                Please log in to access your dashboard
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="login-btn" style="
                    background: #3b82f6;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                ">Login</button>
                <button id="register-btn" style="
                    background: #10b981;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                ">Register</button>
            </div>
        `;
        
        overlay.appendChild(loginCard);
        document.body.appendChild(overlay);
        
        // Add event listeners
        document.getElementById('login-btn').addEventListener('click', () => {
            window.location.href = '/pages/auth/login.html';
        });
        
        document.getElementById('register-btn').addEventListener('click', () => {
            window.location.href = '/pages/auth/register.html';
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    handleUnauthorizedAccess() {
        console.log(`🎮 ${this.constructor.name}: Unauthorized access detected`);
        this.showLoginPrompt();
    }

    handleError(error) {
        console.error(`❌ ${this.constructor.name}: Error:`, error);
        this.showErrorState(error);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Utility methods
    formatDate(timestamp) {
        if (!timestamp) return 'Recently';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    getStatusColor(status) {
        const colors = {
            'completed': 'bg-green-100 text-green-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    }
}

export default EnhancedPageController;
