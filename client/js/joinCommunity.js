/**
 * Join Community Flow Handler
 * Handles the complete community joining process
 */

class JoinCommunityHandler {
    constructor() {
        this.currentStep = 'checkEmail';
        this.currentCommunity = null;
        this.currentEmail = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for join community button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('join-community-btn')) {
                const communityId = e.target.dataset.communityId;
                const communityName = e.target.dataset.communityName;
                const communityCode = e.target.dataset.communityCode;
                this.startJoinFlow(communityId, communityName, communityCode);
            }
        });

        // Listen for form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'joinCommunityForm') {
                e.preventDefault();
                this.handleFormSubmit();
            }
        });

        // Listen for resend OTP button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'resendOtpButton') {
                this.resendOTP();
            }
        });
    }

    async startJoinFlow(communityId, communityName, communityCode) {
        this.currentCommunity = { id: communityId, name: communityName, code: communityCode };
        this.currentStep = 'checkEmail';
        
        // Show modal
        const modal = document.getElementById('joinCommunityModal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateModalContent();
        } else {
            // If no modal, use prompts
            this.startPromptFlow();
        }
    }

    startPromptFlow() {
        const email = prompt('Enter the email registered with this community:');
        if (!email) return;

        this.currentEmail = email;
        this.checkEmailExists(email);
    }

    async checkEmailExists(email) {
        try {
            const response = await fetch(`/api/v1/communities/${this.currentCommunity.id}/check-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                if (data.userType === 'student' && data.community && data.community._id === this.currentCommunity.id) {
                    this.currentStep = 'setPassword';
                    this.promptPasswordSetup();
                } else {
                    alert('This email is already registered with a different role or community.');
                }
            } else {
                alert(data.message || 'Email not found in pre-registered student list for this community.');
            }
        } catch (error) {
            console.error('Check email error:', error);
            alert('Error checking email. Please try again.');
        }
    }

    promptPasswordSetup() {
        const password = prompt('Set your password:');
        if (!password) return;

        const confirmPassword = prompt('Confirm your password:');
        if (!confirmPassword || password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        this.setPasswordAndSendOTP(password, confirmPassword);
    }

    async setPasswordAndSendOTP(password, confirmPassword) {
        try {
            const response = await fetch('/api/v1/auth/join-community', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: this.currentEmail,
                    communityCode: this.currentCommunity.code,
                    password,
                    confirmPassword,
                    firstName: window.__CURRENT_USER__?.firstName || 'User',
                    lastName: window.__CURRENT_USER__?.lastName || 'User',
                    batch: 'Default'
                }),
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                this.currentStep = 'verifyOtp';
                alert('Password set successfully. Please check your email for OTP.');
                this.promptOTPVerification();
            } else {
                alert(data.message || 'Failed to set password and send OTP.');
            }
        } catch (error) {
            console.error('Set password error:', error);
            alert('Error setting password. Please try again.');
        }
    }

    promptOTPVerification() {
        const otp = prompt('Enter the OTP sent to your email:');
        if (!otp) return;

        this.verifyOTP(otp);
    }

    async verifyOTP(otp) {
        try {
            const response = await fetch('/api/v1/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: this.currentEmail,
                    otp,
                    password: 'already_set'
                }),
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                alert('OTP verified successfully! You have joined the community.');
                
                // Refresh user data
                await this.refreshUserData();
                
                // Redirect to community dashboard
                window.location.href = `/pages/community/dashboard.html`;
            } else {
                alert(data.message || 'OTP verification failed.');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            alert('Error verifying OTP. Please try again.');
        }
    }

    async resendOTP() {
        try {
            const response = await fetch('/api/v1/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.currentEmail }),
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                alert('OTP resent successfully. Please check your email.');
            } else {
                alert(data.message || 'Failed to resend OTP.');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            alert('Error resending OTP. Please try again.');
        }
    }

    async refreshUserData() {
        try {
            const response = await fetch('/api/v1/auth/me', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                window.__CURRENT_USER__ = data.user;
                window.dispatchEvent(new CustomEvent('auth-ready', { detail: data.user }));
            }
        } catch (error) {
            console.error('Refresh user data error:', error);
        }
    }

    updateModalContent() {
        const modal = document.getElementById('joinCommunityModal');
        if (!modal) return;

        const communityName = modal.querySelector('#modalCommunityName');
        const passwordFields = modal.querySelector('#passwordFields');
        const otpField = modal.querySelector('#otpField');
        const submitButton = modal.querySelector('#joinSubmitButton');
        const buttonText = modal.querySelector('#buttonText');

        if (communityName) {
            communityName.textContent = this.currentCommunity.name;
        }

        // Reset form
        const form = modal.querySelector('#joinCommunityForm');
        if (form) {
            form.reset();
        }

        // Show/hide fields based on current step
        if (passwordFields) {
            passwordFields.classList.toggle('hidden', this.currentStep !== 'setPassword');
        }
        if (otpField) {
            otpField.classList.toggle('hidden', this.currentStep !== 'verifyOtp');
        }

        // Update button text
        if (buttonText) {
            switch (this.currentStep) {
                case 'checkEmail':
                    buttonText.textContent = 'Check Email';
                    break;
                case 'setPassword':
                    buttonText.textContent = 'Set Password & Send OTP';
                    break;
                case 'verifyOtp':
                    buttonText.textContent = 'Verify OTP & Join';
                    break;
            }
        }
    }

    async handleFormSubmit() {
        const form = document.getElementById('joinCommunityForm');
        if (!form) return;

        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const otp = formData.get('otp');

        this.currentEmail = email;

        switch (this.currentStep) {
            case 'checkEmail':
                await this.checkEmailExists(email);
                break;
            case 'setPassword':
                if (password !== confirmPassword) {
                    alert('Passwords do not match.');
                    return;
                }
                await this.setPasswordAndSendOTP(password, confirmPassword);
                break;
            case 'verifyOtp':
                await this.verifyOTP(otp);
                break;
        }
    }
}

// Initialize join community handler
const joinCommunityHandler = new JoinCommunityHandler();
