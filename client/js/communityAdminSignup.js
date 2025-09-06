/**
 * Community Admin Signup Handler - Firebase Integration
 * Handles community admin registration and community creation
 */
import firebaseService from './firebaseService.js';

class CommunityAdminSignupHandler {
    constructor() {
        this.isSubmitting = false;
        this.init();
    }

    init() {
        console.log('🏢 CommunityAdminSignupHandler: Initializing...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const signupForm = document.getElementById('community-admin-signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Add real-time validation
        const inputs = document.querySelectorAll('#community-admin-signup-form input, #community-admin-signup-form textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    async handleSignup(event) {
        event.preventDefault();
        
        if (this.isSubmitting) {
            console.log('🏢 CommunityAdminSignupHandler: Already submitting, ignoring...');
            return;
        }

        this.isSubmitting = true;
        
        try {
            console.log('🏢 CommunityAdminSignupHandler: Starting community admin signup...');
            
            const formData = new FormData(event.target);
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                role: 'community-admin',
                experience: formData.get('experience') || 'intermediate',
                skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : []
            };

            const communityData = {
                name: formData.get('communityName'),
                code: formData.get('communityCode'),
                description: formData.get('communityDescription') || '',
                website: formData.get('communityWebsite') || '',
                category: formData.get('communityCategory') || 'general'
            };

            // Validate form data
            const validation = this.validateForm(userData, communityData);
            if (!validation.isValid) {
                this.showError(validation.message);
                return;
            }

            // Show loading state
            this.showLoading(true);

            // Step 1: Register user with Firebase
            const userResponse = await firebaseService.register(userData);
            
            if (!userResponse.success) {
                this.showError(userResponse.message || 'Failed to create admin account');
                return;
            }

            // Step 2: Create community in Firestore
            const communityResponse = await firebaseService.createCommunity(communityData);
            
            if (!communityResponse.success) {
                this.showError(communityResponse.message || 'Failed to create community');
                return;
            }

            console.log('🏢 CommunityAdminSignupHandler: Community admin signup successful');
            this.showSuccess('Community and admin account created successfully! Please check your email for verification.');
            
            // Redirect to admin dashboard after a delay
            setTimeout(() => {
                window.location.href = '/pages/admin/admin-dashboard.html';
            }, 3000);
            
        } catch (error) {
            console.error('🏢 CommunityAdminSignupHandler: Signup error:', error);
            this.showError('An error occurred during signup. Please try again.');
        } finally {
            this.isSubmitting = false;
            this.showLoading(false);
        }
    }

    validateForm(userData, communityData) {
        // Validate user data
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
            return { isValid: false, message: 'All personal fields are required.' };
        }

        // Validate community data
        if (!communityData.name || !communityData.code) {
            return { isValid: false, message: 'Community name and code are required.' };
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

        // Check community code format (alphanumeric, 3-10 characters)
        const codeRegex = /^[A-Za-z0-9]{3,10}$/;
        if (!codeRegex.test(communityData.code)) {
            return { isValid: false, message: 'Community code must be 3-10 alphanumeric characters.' };
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

            case 'communityCode':
                const codeRegex = /^[A-Za-z0-9]{3,10}$/;
                if (value && !codeRegex.test(value)) {
                    field.classList.add('border-red-500');
                    return false;
                }
                break;
        }

        return true;
    }

    showLoading(show) {
        const submitBtn = document.querySelector('#community-admin-signup-form button[type="submit"]');
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="animate-spin">⏳</span> Creating Community...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Create Community';
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
    window.communityAdminSignupHandler = new CommunityAdminSignupHandler();
});
