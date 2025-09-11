import EnhancedPageController from './enhancedPageController.js';

class ForgotPasswordController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return null; // No role required for password reset
    }

    async renderDashboardContent() {
        console.log('🔐 ForgotPasswordController: Rendering forgot password content...');
        
        try {
            await this.renderForgotPasswordForm();
            await this.renderPasswordResetInfo();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ ForgotPasswordController: Forgot password content rendered successfully');
            
        } catch (error) {
            console.error('❌ ForgotPasswordController: Error rendering forgot password content:', error);
            throw error;
        }
    }

    async renderForgotPasswordForm() {
        try {
            // Check if user is already authenticated
            if (this.authManager && this.authManager.currentUser) {
                this.redirectToDashboard();
                return;
            }

            this.updateForgotPasswordFormUI();
        } catch (error) {
            console.error('Error rendering forgot password form:', error);
            this.showDefaultForgotPasswordForm();
        }
    }

    async renderPasswordResetInfo() {
        try {
            this.updatePasswordResetInfoUI();
        } catch (error) {
            console.error('Error rendering password reset info:', error);
            this.showDefaultPasswordResetInfo();
        }
    }

    updateForgotPasswordFormUI() {
        const container = document.getElementById('forgot-password-form');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="lock" class="w-8 h-8 text-blue-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                    <p class="text-gray-600 mt-2">Enter your email address and we'll send you a reset link</p>
                </div>

                <form id="forgot-password-form" class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input type="email" id="email" name="email" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                               placeholder="Enter your email address">
                    </div>

                    <button type="submit" id="reset-password-btn"
                            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
                        <span class="flex items-center justify-center">
                            <i data-lucide="mail" class="w-4 h-4 mr-2"></i>
                            Send Reset Link
                        </span>
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                        Remember your password? 
                        <a href="/pages/auth/login.html" class="text-blue-600 hover:text-blue-700 font-medium">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    updatePasswordResetInfoUI() {
        const container = document.getElementById('password-reset-info');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="check-circle" class="w-8 h-8 text-green-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Password Reset Instructions</h2>
                </div>

                <div class="space-y-4">
                    <div class="flex items-start space-x-3">
                        <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-xs font-bold text-blue-600">1</span>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">Check Your Email</h3>
                            <p class="text-sm text-gray-600">We've sent a password reset link to your email address. Check your inbox and spam folder.</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-xs font-bold text-blue-600">2</span>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">Click the Reset Link</h3>
                            <p class="text-sm text-gray-600">Click on the password reset link in the email to be redirected to the reset page.</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-xs font-bold text-blue-600">3</span>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">Create New Password</h3>
                            <p class="text-sm text-gray-600">Enter your new password and confirm it. Make sure it's strong and secure.</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-xs font-bold text-blue-600">4</span>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">Sign In</h3>
                            <p class="text-sm text-gray-600">Once your password is reset, you can sign in with your new password.</p>
                        </div>
                    </div>
                </div>

                <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <div class="flex items-start space-x-3">
                        <i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"></i>
                        <div>
                            <h4 class="text-sm font-medium text-yellow-800">Important Notes</h4>
                            <ul class="text-sm text-yellow-700 mt-1 space-y-1">
                                <li>• The reset link expires in 1 hour for security reasons</li>
                                <li>• If you don't receive the email, check your spam folder</li>
                                <li>• Contact support if you continue to have issues</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    setupFormHandlers() {
        // Forgot password form
        const form = document.getElementById('forgot-password-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // Email input validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                this.validateEmail(e.target.value);
            });
        }
    }

    async handleForgotPassword() {
        try {
            const formData = new FormData(document.getElementById('forgot-password-form'));
            const email = formData.get('email');

            if (!this.validateEmail(email)) {
                this.showErrorMessage('Please enter a valid email address.');
                return;
            }

            // Show loading state
            const submitBtn = document.getElementById('reset-password-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span class="flex items-center justify-center">
                    <i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i>
                    Sending Reset Link...
                </span>
            `;
            submitBtn.disabled = true;

            // Send password reset email
            await this.firebaseService.sendPasswordResetEmail(email);
            
            this.showSuccessMessage('Password reset link sent to your email!');
            this.showPasswordResetInfo();
            
        } catch (error) {
            console.error('Error sending password reset email:', error);
            this.showErrorMessage('Failed to send reset link. Please try again.');
        } finally {
            // Reset button state
            const submitBtn = document.getElementById('reset-password-btn');
            if (submitBtn) {
                submitBtn.innerHTML = `
                    <span class="flex items-center justify-center">
                        <i data-lucide="mail" class="w-4 h-4 mr-2"></i>
                        Send Reset Link
                    </span>
                `;
                submitBtn.disabled = false;
            }
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showPasswordResetInfo() {
        const formContainer = document.getElementById('forgot-password-form');
        const infoContainer = document.getElementById('password-reset-info');
        
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        
        if (infoContainer) {
            infoContainer.style.display = 'block';
        }
    }

    redirectToDashboard() {
        if (this.authManager && this.authManager.currentUser) {
            const role = this.authManager.currentUser.role;
            let dashboardUrl = '/pages/personal/student-dashboard.html';
            
            if (role === 'mentor') {
                dashboardUrl = '/pages/mentor/mentor-dashboard.html';
            } else if (role === 'admin') {
                dashboardUrl = '/pages/admin/admin-dashboard.html';
            }
            
            window.location.href = dashboardUrl;
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
    showDefaultForgotPasswordForm() {
        const container = document.getElementById('forgot-password-form');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading forgot password form...</p>
                </div>
            `;
        }
    }

    showDefaultPasswordResetInfo() {
        const container = document.getElementById('password-reset-info');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading password reset info...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('🔐 ForgotPasswordController: Setting up real-time listeners...');
        
        try {
            // Listen for authentication state changes
            if (this.authManager) {
                const authListener = this.authManager.onAuthStateChanged((user) => {
                    if (user) {
                        this.redirectToDashboard();
                    }
                });
                this.realTimeListeners.push(authListener);
            }

            console.log('✅ ForgotPasswordController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ ForgotPasswordController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('🔐 ForgotPasswordController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ForgotPasswordController();
});

export default ForgotPasswordController;
