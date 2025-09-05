/**
 * User Profile Controller
 * Manages user profile and settings functionality
 */

class UserProfileController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('👤 User Profile Controller: Initializing...');
        
        try {
            // Load user profile data
            await this.loadUserProfile();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('👤 User Profile Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadUserProfile() {
        console.log('👤 User Profile Controller: Loading user profile...');
        
        try {
            this.setLoadingState(true);
            
            // Load user profile data
            const profileData = await window.dataLoader.loadUserProfile();
            
            this.setData(profileData);
            
            // Render profile
            this.renderProfile(profileData);
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            throw error;
        }
    }

    renderProfile(data) {
        console.log('👤 User Profile Controller: Rendering profile...');
        
        // Render basic profile information
        this.renderBasicInfo(data.basicInfo);
        
        // Render academic information
        this.renderAcademicInfo(data.academicInfo);
        
        // Render user statistics
        this.renderUserStats(data.stats);
        
        // Render recent activity
        this.renderRecentActivity(data.recentActivity);
        
        // Render settings
        this.renderSettings(data.settings);
        
        // Render achievements
        this.renderAchievements(data.achievements);
    }

    renderBasicInfo(basicInfo) {
        if (!basicInfo) return;
        
        // Update profile fields
        window.uiHelpers.updateText('user-first-name', basicInfo.firstName || '');
        window.uiHelpers.updateText('user-last-name', basicInfo.lastName || '');
        window.uiHelpers.updateText('user-email', basicInfo.email || '');
        window.uiHelpers.updateText('user-bio', basicInfo.bio || '');
        window.uiHelpers.updateText('user-phone', basicInfo.phoneNumber || '');
        window.uiHelpers.updateText('user-location', basicInfo.location || '');
        window.uiHelpers.updateText('user-linkedin', basicInfo.linkedin || '');
        window.uiHelpers.updateText('user-github', basicInfo.github || '');
        
        // Update profile picture
        if (basicInfo.avatar) {
            const avatarImg = document.getElementById('user-avatar');
            if (avatarImg) {
                avatarImg.src = basicInfo.avatar;
                avatarImg.alt = `${basicInfo.firstName} ${basicInfo.lastName}`;
            }
        }
        
        // Update date of birth
        if (basicInfo.dateOfBirth) {
            const dobInput = document.getElementById('user-date-of-birth');
            if (dobInput) {
                dobInput.value = basicInfo.dateOfBirth.split('T')[0]; // Format for date input
            }
        }
    }

    renderAcademicInfo(academicInfo) {
        if (!academicInfo) return;
        
        // Update academic fields
        window.uiHelpers.updateText('user-batch', academicInfo.batch || '');
        window.uiHelpers.updateText('user-student-id', academicInfo.studentId || '');
        window.uiHelpers.updateText('user-university', academicInfo.university || '');
        window.uiHelpers.updateText('user-major', academicInfo.major || '');
        window.uiHelpers.updateText('user-year', academicInfo.year || '');
        window.uiHelpers.updateText('user-cgpa', academicInfo.cgpa || '');
    }

    renderUserStats(stats) {
        if (!stats) return;
        
        // Update statistics cards
        window.uiHelpers.updateText('total-points', stats.totalPoints || 0);
        window.uiHelpers.updateText('problems-solved', stats.problemsSolved || 0);
        window.uiHelpers.updateText('contests-participated', stats.contestsParticipated || 0);
        window.uiHelpers.updateText('current-rank', stats.currentRank || 'N/A');
        window.uiHelpers.updateText('win-rate', `${stats.winRate || 0}%`);
        window.uiHelpers.updateText('streak-days', stats.streakDays || 0);
    }

    renderRecentActivity(activity) {
        if (!activity || !activity.length) {
            window.uiHelpers.showEmpty('recent-activity', 'No recent activity');
            return;
        }

        const activityHtml = activity.map(item => `
            <div class="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i data-lucide="${item.icon || 'activity'}" class="w-4 h-4 text-blue-600"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${item.description}</p>
                    <p class="text-xs text-gray-500">${window.uiHelpers.formatTimeAgo(item.timestamp)}</p>
                </div>
                <div class="text-sm font-medium text-gray-900">${item.value || ''}</div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('recent-activity', activityHtml);
    }

    renderSettings(settings) {
        if (!settings) return;
        
        // Update notification settings
        const emailNotifications = document.getElementById('email-notifications');
        if (emailNotifications) {
            emailNotifications.checked = settings.emailNotifications || false;
        }
        
        const smsNotifications = document.getElementById('sms-notifications');
        if (smsNotifications) {
            smsNotifications.checked = settings.smsNotifications || false;
        }
        
        const pushNotifications = document.getElementById('push-notifications');
        if (pushNotifications) {
            pushNotifications.checked = settings.pushNotifications || false;
        }
        
        // Update privacy settings
        const profileVisibility = document.getElementById('profile-visibility');
        if (profileVisibility) {
            profileVisibility.value = settings.profileVisibility || 'public';
        }
        
        const showEmail = document.getElementById('show-email');
        if (showEmail) {
            showEmail.checked = settings.showEmail || false;
        }
        
        const showPhone = document.getElementById('show-phone');
        if (showPhone) {
            showPhone.checked = settings.showPhone || false;
        }
        
        const showProgress = document.getElementById('show-progress');
        if (showProgress) {
            showProgress.checked = settings.showProgress || true;
        }
    }

    renderAchievements(achievements) {
        if (!achievements || !achievements.length) {
            window.uiHelpers.showEmpty('achievements', 'No achievements yet');
            return;
        }

        const achievementsHtml = achievements.map(achievement => `
            <div class="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i data-lucide="${achievement.icon || 'award'}" class="w-5 h-5 text-yellow-600"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">${achievement.title}</h4>
                    <p class="text-xs text-gray-500">${achievement.description}</p>
                </div>
                <div class="text-xs text-gray-500">
                    ${window.uiHelpers.formatTimeAgo(achievement.earnedAt)}
                </div>
            </div>
        `).join('');

        window.uiHelpers.updateHTML('achievements', achievementsHtml);
    }

    async updateProfile() {
        console.log('👤 User Profile Controller: Updating profile...');
        
        try {
            this.setLoadingState(true);
            
            // Collect form data
            const formData = this.collectFormData();
            
            // Validate form data
            if (!this.validateFormData(formData)) {
                this.setLoadingState(false);
                return;
            }
            
            // Update profile via API
            const response = await window.APIService.updateUserProfile(formData);
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Profile updated successfully');
                // Reload profile data
                await this.loadUserProfile();
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to update profile');
            }
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('👤 User Profile Controller: Error updating profile:', error);
            window.uiHelpers.showError('Error', 'Failed to update profile');
        }
    }

    collectFormData() {
        return {
            firstName: document.getElementById('user-first-name')?.value?.trim(),
            lastName: document.getElementById('user-last-name')?.value?.trim(),
            email: document.getElementById('user-email')?.value?.trim(),
            bio: document.getElementById('user-bio')?.value?.trim(),
            phoneNumber: document.getElementById('user-phone')?.value?.trim(),
            location: document.getElementById('user-location')?.value?.trim(),
            linkedin: document.getElementById('user-linkedin')?.value?.trim(),
            github: document.getElementById('user-github')?.value?.trim(),
            dateOfBirth: document.getElementById('user-date-of-birth')?.value,
            university: document.getElementById('user-university')?.value?.trim(),
            major: document.getElementById('user-major')?.value?.trim(),
            year: document.getElementById('user-year')?.value?.trim(),
            cgpa: document.getElementById('user-cgpa')?.value?.trim(),
            settings: this.getSettingsData()
        };
    }

    getSettingsData() {
        return {
            emailNotifications: document.getElementById('email-notifications')?.checked || false,
            smsNotifications: document.getElementById('sms-notifications')?.checked || false,
            pushNotifications: document.getElementById('push-notifications')?.checked || false,
            profileVisibility: document.getElementById('profile-visibility')?.value || 'public',
            showEmail: document.getElementById('show-email')?.checked || false,
            showPhone: document.getElementById('show-phone')?.checked || false,
            showProgress: document.getElementById('show-progress')?.checked || true
        };
    }

    validateFormData(formData) {
        if (!formData.firstName || formData.firstName.length < 2) {
            window.uiHelpers.showError('Validation Error', 'First name must be at least 2 characters');
            return false;
        }
        
        if (!formData.lastName || formData.lastName.length < 2) {
            window.uiHelpers.showError('Validation Error', 'Last name must be at least 2 characters');
            return false;
        }
        
        if (!formData.email || !this.isValidEmail(formData.email)) {
            window.uiHelpers.showError('Validation Error', 'Please enter a valid email address');
            return false;
        }
        
        if (formData.bio && formData.bio.length > 500) {
            window.uiHelpers.showError('Validation Error', 'Bio cannot exceed 500 characters');
            return false;
        }
        
        if (formData.cgpa && (isNaN(formData.cgpa) || formData.cgpa < 0 || formData.cgpa > 4)) {
            window.uiHelpers.showError('Validation Error', 'CGPA must be between 0 and 4');
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async changePassword() {
        const currentPassword = prompt('Enter current password:');
        if (!currentPassword) return;
        
        const newPassword = prompt('Enter new password:');
        if (!newPassword || newPassword.length < 6) {
            window.uiHelpers.showError('Validation Error', 'New password must be at least 6 characters');
            return;
        }
        
        const confirmPassword = prompt('Confirm new password:');
        if (newPassword !== confirmPassword) {
            window.uiHelpers.showError('Validation Error', 'Passwords do not match');
            return;
        }
        
        try {
            this.setLoadingState(true);
            
            const response = await window.APIService.changePassword({
                currentPassword,
                newPassword
            });
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Password changed successfully');
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to change password');
            }
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('👤 User Profile Controller: Error changing password:', error);
            window.uiHelpers.showError('Error', 'Failed to change password');
        }
    }

    async uploadAvatar() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                window.uiHelpers.showError('Error', 'File size must be less than 5MB');
                return;
            }
            
            try {
                this.setLoadingState(true);
                
                const formData = new FormData();
                formData.append('avatar', file);
                
                const response = await window.APIService.uploadAvatar(formData);
                
                if (response.success) {
                    window.uiHelpers.showSuccess('Success', 'Avatar updated successfully');
                    // Update avatar display
                    const avatarImg = document.getElementById('user-avatar');
                    if (avatarImg) {
                        avatarImg.src = response.data.avatarUrl;
                    }
                } else {
                    window.uiHelpers.showError('Error', response.error || 'Failed to upload avatar');
                }
                
                this.setLoadingState(false);
                
            } catch (error) {
                this.setLoadingState(false);
                console.error('👤 User Profile Controller: Error uploading avatar:', error);
                window.uiHelpers.showError('Error', 'Failed to upload avatar');
            }
        };
        
        fileInput.click();
    }

    async exportData() {
        console.log('👤 User Profile Controller: Exporting user data...');
        
        try {
            this.setLoadingState(true);
            
            const response = await window.APIService.exportUserData();
            
            if (response.success) {
                // Create download link
                const blob = new Blob([response.data], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                window.uiHelpers.showSuccess('Success', 'User data exported successfully');
            } else {
                window.uiHelpers.showError('Error', 'Failed to export user data');
            }
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('👤 User Profile Controller: Error exporting data:', error);
            window.uiHelpers.showError('Error', 'Failed to export user data');
        }
    }

    async deleteAccount() {
        const confirmMessage = 'Are you sure you want to delete your account? This action cannot be undone.';
        if (!confirm(confirmMessage)) return;
        
        const password = prompt('Enter your password to confirm account deletion:');
        if (!password) return;
        
        try {
            this.setLoadingState(true);
            
            const response = await window.APIService.deleteAccount({ password });
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Account deleted successfully');
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = '/pages/auth/login.html';
                }, 2000);
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to delete account');
            }
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('👤 User Profile Controller: Error deleting account:', error);
            window.uiHelpers.showError('Error', 'Failed to delete account');
        }
    }

    setupEventListeners() {
        console.log('👤 User Profile Controller: Setting up event listeners...');
        
        // Save profile button
        const saveButton = document.getElementById('save-profile');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.updateProfile();
            });
        }
        
        // Change password button
        const changePasswordButton = document.getElementById('change-password');
        if (changePasswordButton) {
            changePasswordButton.addEventListener('click', () => {
                this.changePassword();
            });
        }
        
        // Upload avatar button
        const uploadAvatarButton = document.getElementById('upload-avatar');
        if (uploadAvatarButton) {
            uploadAvatarButton.addEventListener('click', () => {
                this.uploadAvatar();
            });
        }
        
        // Settings save button
        const saveSettingsButton = document.getElementById('save-settings');
        if (saveSettingsButton) {
            saveSettingsButton.addEventListener('click', () => {
                this.updateProfile();
            });
        }
        
        // Export data button
        const exportButton = document.getElementById('export-data');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Delete account button
        const deleteButton = document.getElementById('delete-account');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                this.deleteAccount();
            });
        }
    }
}

// Initialize user profile controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('👤 Initializing User Profile Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            // Check if we're on the user profile page
            if (window.location.pathname.includes('/user/user-profile')) {
                window.userProfileController = new UserProfileController();
            }
        } catch (error) {
            console.error('👤 Failed to initialize User Profile Controller:', error);
        }
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserProfileController;
}
