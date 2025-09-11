import EnhancedPageController from './enhancedPageController.js';

class ResetPasswordController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
        this.resetCode = null;
    }

    getRequiredRole() {
        return null; // No role required for password reset
    }

    async renderDashboardContent() {
        console.log('🔐 ResetPasswordController: Rendering reset password content...');
        
        try {
            await this.renderResetPasswordForm();
            await this.renderResetPasswordInfo();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ ResetPasswordController: Reset password content rendered successfully');
            
        } catch (error) {
            console.error('❌ ResetPasswordController: Error rendering reset password content:', error);
            throw error;
        }
    }

    async renderResetPasswordForm() {
        try {
            // Check if user is already authenticated
            if (this.authManager && this.authManager.currentUser) {
                this.redirectToDashboard();
                return;
            }

            // Get reset code from URL parameters
            this.resetCode = this.getResetCodeFromURL();
            if (!this.resetCode) {
                this.showInvalidResetLink();
                return;
            }

            this.updateResetPasswordFormUI();
        } catch (error) {
            console.error('Error rendering reset password form:', error);
            this.showDefaultResetPasswordForm();
        }
    }

    async renderResetPasswordInfo() {
        try {
            this.updateResetPasswordInfoUI();
        } catch (error) {
            console.error('Error rendering reset password info:', error);
            this.showDefaultResetPasswordInfo();
        }
    }

    getResetCodeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('oobCode') || urlParams.get('code');
    }

    updateResetPasswordFormUI() {
        const container = document.getElementById('reset-password-form');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="key" class="w-8 h-8 text-green-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Reset Your Password</h2>
                    <p class="text-gray-600 mt-2">Enter your new password below</p>
                </div>

                <form id="reset-password-form" class="space-y-4">
                    <div>
                        <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div class="relative">
                            <input type="password" id="new-password" name="newPassword" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                   placeholder="Enter your new password">
                            <button type="button" onclick="togglePasswordVisibility('new-password')"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <i data-lucide="eye" class="w-4 h-4 text-gray-400"></i>
                            </button>
                        </div>
                        <div id="password-strength" class="mt-2"></div>
                    </div>

                    <div>
                        <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <div class="relative">
                            <input type="password" id="confirm-password" name="confirmPassword" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                   placeholder="Confirm your new password">
                            <button type="button" onclick="togglePasswordVisibility('confirm-password')"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <i data-lucide="eye" class="w-4 h-4 text-gray-400"></i>
                            </button>
                        </div>
                        <div id="password-match" class="mt-2"></div>
                    </div>

                    <button type="submit" id="reset-password-btn"
                            class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200">
                        <span class="flex items-center justify-center">
                            <i data-lucide="check" class="w-4 h-4 mr-2"></i>
                            Reset Password
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

    updateResetPasswordInfoUI() {
        const container = document.getElementById('reset-password-info');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="shield-check" class="w-8 h-8 text-green-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Password Reset Successful</h2>
                </div>

                <div class="space-y-4">
                    <div class="flex items-start space-x-3">
                        <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <i data-lucide="check" class="w-4 h-4 text-green-600"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">Password Updated</h3>
                            <p class="text-sm text-gray-600">Your password has been successfully reset. You can now sign in with your new password.</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <i data-lucide="log-in" class="w-4 h-4 text-blue-600"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">Sign In</h3>
                            <p class="text-sm text-gray-600">Use your new password to sign in to your account.</p>
                        </div>
                    </div>

                    <div class="flex items-start space-x-3">
                        <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <i data-lucide="shield" class="w-4 h-4 text-purple-600"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-gray-900">Security</h3>
                            <p class="text-sm text-gray-600">Your account is now secure with your new password.</p>
                        </div>
                    </div>
                </div>

                <div class="mt-6 text-center">
                    <a href="/pages/auth/login.html" 
                       class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
                        <i data-lucide="log-in" class="w-4 h-4 mr-2"></i>
                        Sign In Now
                    </a>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    setupFormHandlers() {
        // Reset password form
        const form = document.getElementById('reset-password-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleResetPassword();
            });
        }

        // Password validation
        const newPasswordInput = document.getElementById('new-password');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', (e) => {
                this.validatePassword(e.target.value);
            });
        }

        const confirmPasswordInput = document.getElementById('confirm-password');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', (e) => {
                this.validatePasswordMatch();
            });
        }
    }

    async handleResetPassword() {
        try {
            const formData = new FormData(document.getElementById('reset-password-form'));
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            if (!this.validatePassword(newPassword)) {
                this.showErrorMessage('Please enter a strong password.');
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showErrorMessage('Passwords do not match.');
                return;
            }

            // Show loading state
            const submitBtn = document.getElementById('reset-password-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span class="flex items-center justify-center">
                    <i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i>
                    Resetting Password...
                </span>
            `;
            submitBtn.disabled = true;

            // Reset password using Firebase
            await this.firebaseService.resetPassword(this.resetCode, newPassword);
            
            this.showSuccessMessage('Password reset successfully!');
            this.showResetPasswordInfo();
            
        } catch (error) {
            console.error('Error resetting password:', error);
            this.showErrorMessage('Failed to reset password. The link may have expired.');
        } finally {
            // Reset button state
            const submitBtn = document.getElementById('reset-password-btn');
            if (submitBtn) {
                submitBtn.innerHTML = `
                    <span class="flex items-center justify-center">
                        <i data-lucide="check" class="w-4 h-4 mr-2"></i>
                        Reset Password
                    </span>
                `;
                submitBtn.disabled = false;
            }
        }
    }

    validatePassword(password) {
        const strengthContainer = document.getElementById('password-strength');
        if (!strengthContainer) return false;

        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        let strength = 0;
        let strengthText = '';
        let strengthColor = '';

        if (password.length >= minLength) strength++;
        if (hasUpperCase) strength++;
        if (hasLowerCase) strength++;
        if (hasNumbers) strength++;
        if (hasSpecialChar) strength++;

        if (strength < 2) {
            strengthText = 'Weak';
            strengthColor = 'text-red-600';
        } else if (strength < 4) {
            strengthText = 'Medium';
            strengthColor = 'text-yellow-600';
        } else {
            strengthText = 'Strong';
            strengthColor = 'text-green-600';
        }

        strengthContainer.innerHTML = `
            <div class="text-sm ${strengthColor}">
                Password strength: ${strengthText}
            </div>
        `;

        return strength >= 3;
    }

    validatePasswordMatch() {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const matchContainer = document.getElementById('password-match');
        
        if (!matchContainer) return;

        if (confirmPassword && newPassword !== confirmPassword) {
            matchContainer.innerHTML = `
                <div class="text-sm text-red-600">
                    Passwords do not match
                </div>
            `;
        } else if (confirmPassword && newPassword === confirmPassword) {
            matchContainer.innerHTML = `
                <div class="text-sm text-green-600">
                    Passwords match
                </div>
            `;
        } else {
            matchContainer.innerHTML = '';
        }
    }

    showInvalidResetLink() {
        const container = document.getElementById('reset-password-form');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="x-circle" class="w-8 h-8 text-red-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
                    <p class="text-gray-600 mt-2">This password reset link is invalid or has expired.</p>
                </div>

                <div class="space-y-4">
                    <a href="/pages/auth/forgot-password.html" 
                       class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 text-center block">
                        Request New Reset Link
                    </a>
                    
                    <a href="/pages/auth/login.html" 
                       class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 text-center block">
                        Back to Login
                    </a>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    showResetPasswordInfo() {
        const formContainer = document.getElementById('reset-password-form');
        const infoContainer = document.getElementById('reset-password-info');
        
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
    showDefaultResetPasswordForm() {
        const container = document.getElementById('reset-password-form');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading reset password form...</p>
                </div>
            `;
        }
    }

    showDefaultResetPasswordInfo() {
        const container = document.getElementById('reset-password-info');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading reset password info...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('🔐 ResetPasswordController: Setting up real-time listeners...');
        
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

            console.log('✅ ResetPasswordController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ ResetPasswordController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('🔐 ResetPasswordController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

// Global function for password visibility toggle
window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    
    if (window.lucide) window.lucide.createIcons();
};

document.addEventListener('DOMContentLoaded', () => {
    new ResetPasswordController();
});

export default ResetPasswordController;
