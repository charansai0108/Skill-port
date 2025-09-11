/**
 * Personal Profile Controller
 * Handles personal profile management for individual users
 */
import firebaseService from './firebaseService.js';
import logger from './logger.js';
import PageController from './pageController.js';

class PersonalProfileController extends PageController {
    constructor() {
        super();
        this.userProfile = null;
        this.isEditing = false;
    }

    async init() {
        console.log('👤 PersonalProfileController: Initializing...');
        await super.init();
        
        if (!this.isAuthenticated) {
            console.log('👤 PersonalProfileController: User not authenticated, redirecting to login');
            window.location.href = '/pages/auth/login.html';
            return;
        }

        await this.loadUserProfile();
        this.setupEventListeners();
        console.log('👤 PersonalProfileController: Initialization complete');
    }

    async loadUserProfile() {
        try {
            this.showLoading();
            
            // Get current user
            const user = window.authManager.currentUser;
            if (!user) {
                throw new Error('No authenticated user found');
            }

            // Load user profile from Firestore
            const userDoc = await firebaseService.getUserDocument(user.uid);
            
            if (userDoc) {
                this.userProfile = {
                    firstName: userDoc.name?.split(' ')[0] || 'User',
                    lastName: userDoc.name?.split(' ')[1] || '',
                    email: userDoc.email || 'N/A',
                    profileImage: userDoc.profileImage || '',
                    streak: userDoc.streak || 0,
                    submissions: userDoc.submissions || 0,
                    problemsSolved: userDoc.problemsSolved || 0,
                    skillRating: userDoc.skillRating || 0,
                    createdAt: userDoc.createdAt,
                    updatedAt: userDoc.updatedAt
                };
                this.renderProfile();
            } else {
                // Create default profile if document doesn't exist
                this.userProfile = {
                    firstName: 'User',
                    lastName: '',
                    email: 'N/A',
                    profileImage: '',
                    streak: 0,
                    submissions: 0,
                    problemsSolved: 0,
                    skillRating: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                this.renderProfile();
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('👤 PersonalProfileController: Error loading profile:', error);
            logger.error('PersonalProfileController: Error loading profile', error);
            this.hideLoading();
            this.showError('Failed to load profile data');
        }
    }

    renderProfile() {
        if (!this.userProfile) return;

        // Update profile information
        window.uiHelpers.updateText('profile-name', `${this.userProfile.firstName} ${this.userProfile.lastName}`);
        window.uiHelpers.updateText('profile-email', this.userProfile.email);
        window.uiHelpers.updateText('profile-role', this.userProfile.role || 'Personal User');
        window.uiHelpers.updateText('profile-joined', window.uiHelpers.formatDateTime(this.userProfile.createdAt));
        
        // Update form fields
        this.updateFormFields();
        
        // Update stats
        this.renderStats();
        
        // Update preferences
        this.renderPreferences();
    }

    updateFormFields() {
        const fields = {
            'firstName': this.userProfile.firstName,
            'lastName': this.userProfile.lastName,
            'email': this.userProfile.email,
            'bio': this.userProfile.bio || '',
            'location': this.userProfile.location || '',
            'website': this.userProfile.website || '',
            'github': this.userProfile.github || '',
            'linkedin': this.userProfile.linkedin || ''
        };

        Object.entries(fields).forEach(([fieldName, value]) => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.value = value;
            }
        });
    }

    renderStats() {
        const stats = {
            'total-problems': this.userProfile.totalPoints || 0,
            'current-streak': this.userProfile.streak || 0,
            'user-level': this.userProfile.level || 1,
            'total-points': this.userProfile.totalPoints || 0,
            'problems-solved': this.userProfile.problemsSolved || 0,
            'contests-participated': this.userProfile.contestsParticipated || 0
        };

        Object.entries(stats).forEach(([elementId, value]) => {
            window.uiHelpers.updateText(elementId, value);
        });
    }

    renderPreferences() {
        if (!this.userProfile.preferences) return;

        const preferences = this.userProfile.preferences;
        
        // Update notification preferences
        const notificationPrefs = preferences.notifications || {};
        Object.entries(notificationPrefs).forEach(([key, value]) => {
            const checkbox = document.getElementById(`pref-${key}`);
            if (checkbox) {
                checkbox.checked = value;
            }
        });

        // Update privacy preferences
        const privacyPrefs = preferences.privacy || {};
        Object.entries(privacyPrefs).forEach(([key, value]) => {
            const checkbox = document.getElementById(`privacy-${key}`);
            if (checkbox) {
                checkbox.checked = value;
            }
        });
    }

    setupEventListeners() {
        // Edit profile button
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.toggleEditMode());
        }

        // Save profile button
        const saveBtn = document.getElementById('save-profile-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }

        // Cancel edit button
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }

        // Avatar upload
        const avatarInput = document.getElementById('avatar-upload');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.handleAvatarUpload(e));
        }

        // Password change form
        const passwordForm = document.getElementById('password-change-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }

        // Preferences form
        const preferencesForm = document.getElementById('preferences-form');
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', (e) => this.handlePreferencesSave(e));
        }
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;
        
        const editBtn = document.getElementById('edit-profile-btn');
        const saveBtn = document.getElementById('save-profile-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const formFields = document.querySelectorAll('#profile-form input, #profile-form textarea');
        
        if (this.isEditing) {
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-flex';
            cancelBtn.style.display = 'inline-flex';
            formFields.forEach(field => field.disabled = false);
        } else {
            editBtn.style.display = 'inline-flex';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            formFields.forEach(field => field.disabled = true);
        }
    }

    async saveProfile() {
        try {
            const formData = new FormData(document.getElementById('profile-form'));
            const profileData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                bio: formData.get('bio'),
                location: formData.get('location'),
                website: formData.get('website'),
                github: formData.get('github'),
                linkedin: formData.get('linkedin')
            };

            const response = await window.APIService.updateUserProfile(profileData);
            if (response.success) {
                this.userProfile = { ...this.userProfile, ...profileData };
                this.toggleEditMode();
                this.showSuccess('Profile updated successfully');
            } else {
                this.showError('Failed to update profile');
            }
        } catch (error) {
            console.error('👤 PersonalProfileController: Error saving profile:', error);
            this.showError('Failed to update profile');
        }
    }

    cancelEdit() {
        this.updateFormFields();
        this.toggleEditMode();
    }

    async handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await window.APIService.uploadAvatar(formData);
            if (response.success) {
                this.userProfile.avatar = response.data.avatarUrl;
                this.updateAvatarDisplay();
                this.showSuccess('Avatar updated successfully');
            } else {
                this.showError('Failed to upload avatar');
            }
        } catch (error) {
            console.error('👤 PersonalProfileController: Error uploading avatar:', error);
            this.showError('Failed to upload avatar');
        }
    }

    updateAvatarDisplay() {
        const avatarImg = document.getElementById('profile-avatar');
        if (avatarImg && this.userProfile.avatar) {
            avatarImg.src = this.userProfile.avatar;
        }
    }

    async handlePasswordChange(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const passwordData = {
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword'),
            confirmPassword: formData.get('confirmPassword')
        };

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            this.showError('New passwords do not match');
            return;
        }

        try {
            const response = await window.APIService.changePassword(passwordData);
            if (response.success) {
                this.showSuccess('Password changed successfully');
                event.target.reset();
            } else {
                this.showError('Failed to change password');
            }
        } catch (error) {
            console.error('👤 PersonalProfileController: Error changing password:', error);
            this.showError('Failed to change password');
        }
    }

    async handlePreferencesSave(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const preferences = {
            notifications: {
                email: formData.get('pref-email') === 'on',
                push: formData.get('pref-push') === 'on',
                contests: formData.get('pref-contests') === 'on',
                achievements: formData.get('pref-achievements') === 'on'
            },
            privacy: {
                profileVisible: formData.get('privacy-profileVisible') === 'on',
                progressVisible: formData.get('privacy-progressVisible') === 'on',
                leaderboardVisible: formData.get('privacy-leaderboardVisible') === 'on'
            }
        };

        try {
            const response = await window.APIService.updateUserPreferences(preferences);
            if (response.success) {
                this.userProfile.preferences = preferences;
                this.showSuccess('Preferences updated successfully');
            } else {
                this.showError('Failed to update preferences');
            }
        } catch (error) {
            console.error('👤 PersonalProfileController: Error saving preferences:', error);
            this.showError('Failed to update preferences');
        }
    }

    showLoading() {
        const loadingElements = document.querySelectorAll('.loading-placeholder');
        loadingElements.forEach(el => {
            el.innerHTML = '<div class="animate-pulse bg-gray-200 h-4 rounded"></div>';
        });
    }

    hideLoading() {
        const loadingElements = document.querySelectorAll('.loading-placeholder');
        loadingElements.forEach(el => {
            el.innerHTML = '';
        });
    }

    showSuccess(message) {
        if (window.notifications) {
            window.notifications.success({
                title: 'Success',
                message: message
            });
        }
    }

    showError(message) {
        if (window.notifications) {
            window.notifications.error({
                title: 'Error',
                message: message
            });
        }
    }
}

// Make PersonalProfileController available globally
window.PersonalProfileController = PersonalProfileController;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.personalProfileController = new PersonalProfileController();
});
