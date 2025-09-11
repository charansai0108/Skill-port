import EnhancedPageController from './enhancedPageController.js';

class UnauthorizedController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return null; // No role required for unauthorized page
    }

    async renderDashboardContent() {
        console.log('🚫 UnauthorizedController: Rendering unauthorized access content...');
        
        try {
            await this.renderUnauthorizedMessage();
            await this.renderAccessOptions();
            await this.renderHelpSection();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ UnauthorizedController: Unauthorized access content rendered successfully');
            
        } catch (error) {
            console.error('❌ UnauthorizedController: Error rendering unauthorized content:', error);
            throw error;
        }
    }

    async renderUnauthorizedMessage() {
        try {
            this.updateUnauthorizedMessageUI();
        } catch (error) {
            console.error('Error rendering unauthorized message:', error);
            this.showDefaultUnauthorizedMessage();
        }
    }

    async renderAccessOptions() {
        try {
            this.updateAccessOptionsUI();
        } catch (error) {
            console.error('Error rendering access options:', error);
            this.showDefaultAccessOptions();
        }
    }

    async renderHelpSection() {
        try {
            this.updateHelpSectionUI();
        } catch (error) {
            console.error('Error rendering help section:', error);
            this.showDefaultHelpSection();
        }
    }

    updateUnauthorizedMessageUI() {
        const container = document.getElementById('unauthorized-message');
        if (!container) return;

        const userRole = this.authManager?.currentUser?.role || 'guest';
        const userName = this.authManager?.currentUser?.name || 'User';

        container.innerHTML = `
            <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div class="text-center mb-8">
                    <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="shield-x" class="w-12 h-12 text-red-600"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p class="text-lg text-gray-600 mb-2">You don't have permission to access this page.</p>
                    <p class="text-sm text-gray-500">
                        Current role: <span class="font-medium text-gray-700">${userRole}</span>
                        ${userName !== 'User' ? ` • Logged in as: <span class="font-medium text-gray-700">${userName}</span>` : ''}
                    </p>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start space-x-3">
                        <i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"></i>
                        <div>
                            <h3 class="text-sm font-medium text-yellow-800">Why am I seeing this?</h3>
                            <p class="text-sm text-yellow-700 mt-1">
                                This page requires specific permissions that your current account doesn't have. 
                                This could be due to insufficient role privileges or the page being restricted to certain user types.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    updateAccessOptionsUI() {
        const container = document.getElementById('access-options');
        if (!container) return;

        const userRole = this.authManager?.currentUser?.role;
        const isAuthenticated = !!this.authManager?.currentUser;

        container.innerHTML = `
            <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">What would you like to do?</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${!isAuthenticated ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="log-in" class="w-6 h-6 text-blue-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Sign In</h3>
                            <p class="text-sm text-gray-600 mb-4">Sign in with your account to access your dashboard</p>
                            <a href="/pages/auth/login.html" 
                               class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
                                <i data-lucide="log-in" class="w-4 h-4 mr-2"></i>
                                Sign In
                            </a>
                        </div>
                    ` : ''}

                    ${!isAuthenticated ? `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="user-plus" class="w-6 h-6 text-green-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Create Account</h3>
                            <p class="text-sm text-gray-600 mb-4">Join SkillPort and start your learning journey</p>
                            <a href="/pages/auth/register.html" 
                               class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200">
                                <i data-lucide="user-plus" class="w-4 h-4 mr-2"></i>
                                Sign Up
                            </a>
                        </div>
                    ` : ''}

                    ${isAuthenticated ? `
                        <div class="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="home" class="w-6 h-6 text-purple-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Go to Dashboard</h3>
                            <p class="text-sm text-gray-600 mb-4">Return to your personal dashboard</p>
                            <button onclick="goToDashboard()" 
                                    class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200">
                                <i data-lucide="home" class="w-4 h-4 mr-2"></i>
                                Dashboard
                            </button>
                        </div>
                    ` : ''}

                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="home" class="w-6 h-6 text-gray-600"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Home Page</h3>
                        <p class="text-sm text-gray-600 mb-4">Return to the main SkillPort homepage</p>
                        <a href="/pages/index.html" 
                           class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200">
                            <i data-lucide="home" class="w-4 h-4 mr-2"></i>
                            Go Home
                        </a>
                    </div>

                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="help-circle" class="w-6 h-6 text-orange-600"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Get Help</h3>
                        <p class="text-sm text-gray-600 mb-4">Contact support for assistance</p>
                        <a href="/pages/help-center.html" 
                           class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition duration-200">
                            <i data-lucide="help-circle" class="w-4 h-4 mr-2"></i>
                            Help Center
                        </a>
                    </div>

                    ${isAuthenticated ? `
                        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="log-out" class="w-6 h-6 text-red-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Sign Out</h3>
                            <p class="text-sm text-gray-600 mb-4">Sign out of your current account</p>
                            <button onclick="signOut()" 
                                    class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200">
                                <i data-lucide="log-out" class="w-4 h-4 mr-2"></i>
                                Sign Out
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    updateHelpSectionUI() {
        const container = document.getElementById('help-section');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Need Help?</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-900">Common Issues</h3>
                        
                        <div class="space-y-3">
                            <div class="flex items-start space-x-3">
                                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span class="text-xs font-bold text-blue-600">1</span>
                                </div>
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Wrong User Role</h4>
                                    <p class="text-sm text-gray-600">You might be signed in with the wrong account type. Try signing out and signing in with the correct account.</p>
                                </div>
                            </div>

                            <div class="flex items-start space-x-3">
                                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span class="text-xs font-bold text-blue-600">2</span>
                                </div>
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Account Not Verified</h4>
                                    <p class="text-sm text-gray-600">Your account might not be fully verified. Check your email for verification links.</p>
                                </div>
                            </div>

                            <div class="flex items-start space-x-3">
                                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <span class="text-xs font-bold text-blue-600">3</span>
                                </div>
                                <div>
                                    <h4 class="text-sm font-medium text-gray-900">Session Expired</h4>
                                    <p class="text-sm text-gray-600">Your session might have expired. Try signing in again.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-900">Contact Support</h3>
                        
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <i data-lucide="mail" class="w-5 h-5 text-gray-400"></i>
                                <div>
                                    <p class="text-sm font-medium text-gray-900">Email Support</p>
                                    <p class="text-sm text-gray-600">support@skillport.com</p>
                                </div>
                            </div>

                            <div class="flex items-center space-x-3">
                                <i data-lucide="phone" class="w-5 h-5 text-gray-400"></i>
                                <div>
                                    <p class="text-sm font-medium text-gray-900">Phone Support</p>
                                    <p class="text-sm text-gray-600">+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div class="flex items-center space-x-3">
                                <i data-lucide="clock" class="w-5 h-5 text-gray-400"></i>
                                <div>
                                    <p class="text-sm font-medium text-gray-900">Support Hours</p>
                                    <p class="text-sm text-gray-600">Mon-Fri 9AM-6PM EST</p>
                                </div>
                            </div>
                        </div>

                        <div class="pt-4">
                            <a href="/pages/help-center.html" 
                               class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
                                <i data-lucide="help-circle" class="w-4 h-4 mr-2"></i>
                                Visit Help Center
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    setupFormHandlers() {
        // No specific form handlers needed for this page
    }

    goToDashboard() {
        if (this.authManager && this.authManager.currentUser) {
            const role = this.authManager.currentUser.role;
            let dashboardUrl = '/pages/personal/student-dashboard.html';
            
            if (role === 'mentor') {
                dashboardUrl = '/pages/mentor/mentor-dashboard.html';
            } else if (role === 'admin') {
                dashboardUrl = '/pages/admin/admin-dashboard.html';
            }
            
            window.location.href = dashboardUrl;
        } else {
            window.location.href = '/pages/auth/login.html';
        }
    }

    async signOut() {
        try {
            if (this.authManager) {
                await this.authManager.signOut();
                window.location.href = '/pages/auth/login.html';
            }
        } catch (error) {
            console.error('Error signing out:', error);
            this.showErrorMessage('Failed to sign out. Please try again.');
        }
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
        }, 5000);
    }

    // Default states
    showDefaultUnauthorizedMessage() {
        const container = document.getElementById('unauthorized-message');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading unauthorized message...</p>
                </div>
            `;
        }
    }

    showDefaultAccessOptions() {
        const container = document.getElementById('access-options');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading access options...</p>
                </div>
            `;
        }
    }

    showDefaultHelpSection() {
        const container = document.getElementById('help-section');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading help section...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('🚫 UnauthorizedController: Setting up real-time listeners...');
        
        try {
            // Listen for authentication state changes
            if (this.authManager) {
                const authListener = this.authManager.onAuthStateChanged((user) => {
                    // Update UI when auth state changes
                    this.renderAccessOptions();
                });
                this.realTimeListeners.push(authListener);
            }

            console.log('✅ UnauthorizedController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ UnauthorizedController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('🚫 UnauthorizedController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

// Global functions for button actions
window.goToDashboard = function() {
    const controller = window.unauthorizedController;
    if (controller) {
        controller.goToDashboard();
    }
};

window.signOut = function() {
    const controller = window.unauthorizedController;
    if (controller) {
        controller.signOut();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const controller = new UnauthorizedController();
    window.unauthorizedController = controller;
});

export default UnauthorizedController;
