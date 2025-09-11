/**
 * Registration Handler - Firebase Integration
 * Handles user registration using Firebase Authentication
 */
import firebaseService from './firebaseService.js';

class RegisterHandler {
    constructor() {
        this.isSubmitting = false;
        this.init();
    }

    init() {
        console.log('📝 RegisterHandler: Initializing with Firebase...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Add real-time validation
        const inputs = document.querySelectorAll('#register-form input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    async handleRegister(event) {
        event.preventDefault();
        
        if (this.isSubmitting) {
            console.log('📝 RegisterHandler: Already submitting, ignoring...');
            return;
        }

        this.isSubmitting = true;
        
        try {
            console.log('📝 RegisterHandler: Starting Firebase registration...');
            
            const formData = new FormData(event.target);
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                role: formData.get('role') || 'personal',
                experience: formData.get('experience') || 'beginner',
                skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : []
            };

            // Validate form data
            const validation = this.validateForm(userData);
            if (!validation.isValid) {
                this.showError(validation.message);
                return;
            }

            // Show loading state
            this.showLoading(true);

            // Use Firebase registration
            const response = await firebaseService.register(userData);
            
            if (response.success) {
                console.log('📝 RegisterHandler: Firebase registration successful');
                
                // Send OTP to user's email
                const otpResponse = await this.sendOTP(userData);
                
                if (otpResponse.success) {
                    this.showSuccess('Registration successful! Please check your email for the verification code.');
                    
                    // Redirect to OTP verification page
                    setTimeout(() => {
                        window.location.href = 'verify-otp.html';
                    }, 2000);
                } else {
                    this.showError('Registration successful, but failed to send verification code. Please try logging in.');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
                }
            } else {
                console.error('📝 RegisterHandler: Firebase registration failed:', response.message);
                this.showError(response.message || 'Registration failed. Please try again.');
            }
            
        } catch (error) {
            console.error('📝 RegisterHandler: Registration error:', error);
            this.showError('An error occurred during registration. Please try again.');
        } finally {
            this.isSubmitting = false;
            this.showLoading(false);
        }
    }

    async sendOTP(userData) {
        try {
            // Use Firebase Functions endpoint instead of local OTP server
            const apiBaseUrl = config.getApiConfig().baseUrl;
            const response = await fetch(`${apiBaseUrl}/otp/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error sending OTP:', error);
            return { success: false, message: 'Failed to send verification code' };
        }
    }

    validateForm(userData) {
        // Check required fields
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
            return { isValid: false, message: 'All fields are required.' };
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        // Check password strength
        if (userData.password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long.' };
        }

        // Check password confirmation
        if (userData.password !== userData.confirmPassword) {
            return { isValid: false, message: 'Passwords do not match.' };
        }

        return { isValid: true };
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;

        // Remove existing error styling
        field.classList.remove('border-red-500');
        
        // Validate based on field type
        switch (fieldName) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    field.classList.add('border-red-500');
                    return false;
                }
                break;
                
            case 'password':
                if (value && value.length < 6) {
                    field.classList.add('border-red-500');
                    return false;
                }
                break;
                
            case 'confirmPassword':
                const password = document.querySelector('input[name="password"]').value;
                if (value && value !== password) {
                    field.classList.add('border-red-500');
                    return false;
                }
                break;
        }

        return true;
    }

    showLoading(show) {
        const submitBtn = document.querySelector('#register-form button[type="submit"]');
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="animate-spin">⏳</span> Registering...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Create Account';
            }
        }
    }

    showSuccess(message) {
        if (window.notifications) {
            window.notifications.success({
                title: 'Success',
                message: message
            });
        } else {
            alert('✅ ' + message);
        }
    }

    showError(message) {
        if (window.notifications) {
            window.notifications.error({
                title: 'Error',
                message: message
            });
        } else {
            alert('❌ ' + message);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.registerHandler = new RegisterHandler();
});
