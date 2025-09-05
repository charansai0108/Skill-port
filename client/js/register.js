/**
 * Registration Handler
 * Handles user registration form submission and validation
 */
class RegisterHandler {
    constructor() {
        this.isSubmitting = false;
        this.init();
    }

    init() {
        console.log('📝 RegisterHandler: Initializing...');
        
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
            console.log('📝 RegisterHandler: Starting registration...');
            
            const formData = new FormData(event.target);
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                role: formData.get('role') || 'student'
            };

            // Validate form data
            const validation = this.validateForm(userData);
            if (!validation.isValid) {
                this.showError(validation.message);
                return;
            }

            // Show loading state
            this.showLoading(true);

            // Call registration API
            const response = await window.APIService.register(userData);
            
            if (response.success) {
                console.log('📝 RegisterHandler: Registration successful');
                this.showSuccess('Registration successful! Please check your email for verification.');
                
                // Redirect to login page after a delay
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 3000);
            } else {
                console.error('📝 RegisterHandler: Registration failed:', response.message);
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
