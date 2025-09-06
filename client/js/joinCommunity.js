/**
 * Join Community Flow Handler
 * Handles the complete community joining process
 */

import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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
            // Import Firebase service
            const firebaseService = await import('./firebaseService.js');
            
            // Check if user exists in Firestore
            const usersQuery = query(
                collection(firebaseService.default.db, 'users'),
                where('email', '==', email),
                where('communityId', '==', this.currentCommunity.id)
            );
            
            const querySnapshot = await getDocs(usersQuery);
            
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                
                if (userData.role === 'student') {
                    this.currentStep = 'setPassword';
                    this.promptPasswordSetup();
                } else {
                    alert('This email is already registered with a different role.');
                }
            } else {
                alert('Email not found in pre-registered student list for this community.');
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
            // Import Firebase service
            const firebaseService = await import('./firebaseService.js');
            
            // Create user account with Firebase Auth
            const userCredential = await firebaseService.default.createUserWithEmailAndPassword(
                this.currentEmail, 
                password
            );
            
            // Update user profile
            await firebaseService.default.updateProfile({
                displayName: `${window.__CURRENT_USER__?.firstName || 'User'} ${window.__CURRENT_USER__?.lastName || 'User'}`
            });
            
            // Create user document in Firestore
            await firebaseService.default.createUserDocument({
                uid: userCredential.user.uid,
                email: this.currentEmail,
                firstName: window.__CURRENT_USER__?.firstName || 'User',
                lastName: window.__CURRENT_USER__?.lastName || 'User',
                role: 'student',
                communityId: this.currentCommunity.id,
                batch: 'Default',
                createdAt: new Date()
            });
            
            // Send email verification
            await firebaseService.default.sendEmailVerification();
            
            this.currentStep = 'verifyOtp';
            alert('Account created successfully! Please check your email for verification.');
            this.promptOTPVerification();
            
        } catch (error) {
            console.error('Set password error:', error);
            alert('Error creating account: ' + error.message);
        }
    }

    promptOTPVerification() {
        const otp = prompt('Enter the OTP sent to your email:');
        if (!otp) return;

        this.verifyOTP(otp);
    }

    async verifyOTP(otp) {
        try {
            // Import Firebase service
            const firebaseService = await import('./firebaseService.js');
            
            // Check if user is already verified
            const user = firebaseService.default.getCurrentUser();
            if (user && user.emailVerified) {
                alert('Email already verified! You have joined the community.');
                
                // Refresh user data
                await this.refreshUserData();
                
                // Redirect to community dashboard
                window.location.href = `/pages/student/user-dashboard.html`;
                return;
            }
            
            // For now, just redirect since Firebase handles email verification
            alert('Please check your email and click the verification link, then try logging in.');
            window.location.href = `/pages/auth/login.html`;
            
        } catch (error) {
            console.error('OTP verification error:', error);
            alert('Error verifying email. Please try again.');
        }
    }

    async resendOTP() {
        try {
            // Import Firebase service
            const firebaseService = await import('./firebaseService.js');
            
            // Resend email verification
            await firebaseService.default.sendEmailVerification();
            alert('Verification email resent successfully. Please check your email.');
            
        } catch (error) {
            console.error('Resend verification error:', error);
            alert('Error resending verification email. Please try again.');
        }
    }

    async refreshUserData() {
        try {
            // Import Firebase service
            const firebaseService = await import('./firebaseService.js');
            
            // Get current user from Firebase
            const user = firebaseService.default.getCurrentUser();
            if (user) {
                window.__CURRENT_USER__ = user;
                window.dispatchEvent(new CustomEvent('auth-ready', { detail: user }));
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
