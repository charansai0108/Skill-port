/**
 * Mentor Profile Controller
 * Manages mentor profile and settings functionality
 */

class MentorProfileController extends PageController {
    constructor() {
        super();
    }

    async initializePage() {
        console.log('👨‍🏫 Mentor Profile Controller: Initializing...');
        
        try {
            // Load mentor profile data
            await this.loadMentorProfile();
            
            // Setup event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('👨‍🏫 Mentor Profile Controller: Error initializing:', error);
            throw error;
        }
    }

    async loadMentorProfile() {
        console.log('👨‍🏫 Mentor Profile Controller: Loading mentor profile...');
        
        try {
            this.setLoadingState(true);
            
            // Load mentor profile data
            const profileData = await window.dataLoader.loadMentorProfile();
            
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
        console.log('👨‍🏫 Mentor Profile Controller: Rendering profile...');
        
        // Render basic profile information
        this.renderBasicInfo(data.basicInfo);
        
        // Render expertise and skills
        this.renderExpertise(data.expertise);
        
        // Render mentor statistics
        this.renderMentorStats(data.stats);
        
        // Render recent activity
        this.renderRecentActivity(data.recentActivity);
        
        // Render settings
        this.renderSettings(data.settings);
    }

    renderBasicInfo(basicInfo) {
        if (!basicInfo) return;
        
        // Update profile fields
        window.uiHelpers.updateText('mentor-first-name', basicInfo.firstName || '');
        window.uiHelpers.updateText('mentor-last-name', basicInfo.lastName || '');
        window.uiHelpers.updateText('mentor-email', basicInfo.email || '');
        window.uiHelpers.updateText('mentor-bio', basicInfo.bio || '');
        window.uiHelpers.updateText('mentor-phone', basicInfo.phoneNumber || '');
        window.uiHelpers.updateText('mentor-location', basicInfo.location || '');
        window.uiHelpers.updateText('mentor-linkedin', basicInfo.linkedin || '');
        window.uiHelpers.updateText('mentor-github', basicInfo.github || '');
        
        // Update profile picture
        if (basicInfo.avatar) {
            const avatarImg = document.getElementById('mentor-avatar');
            if (avatarImg) {
                avatarImg.src = basicInfo.avatar;
                avatarImg.alt = `${basicInfo.firstName} ${basicInfo.lastName}`;
            }
        }
        
        // Update date of birth
        if (basicInfo.dateOfBirth) {
            const dobInput = document.getElementById('mentor-date-of-birth');
            if (dobInput) {
                dobInput.value = basicInfo.dateOfBirth.split('T')[0]; // Format for date input
            }
        }
    }

    renderExpertise(expertise) {
        if (!expertise || !expertise.length) {
            window.uiHelpers.showEmpty('mentor-expertise', 'No expertise areas defined');
            return;
        }

        const expertiseHtml = expertise.map(skill => `
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
                ${skill}
                <button onclick="mentorProfileController.removeExpertise('${skill}')" 
                        class="ml-2 text-blue-600 hover:text-blue-800">
                    ×
                </button>
            </span>
        `).join('');

        window.uiHelpers.updateHTML('mentor-expertise', expertiseHtml);
    }

    renderMentorStats(stats) {
        if (!stats) return;
        
        // Update statistics cards
        window.uiHelpers.updateText('total-students', stats.totalStudents || 0);
        window.uiHelpers.updateText('active-students', stats.activeStudents || 0);
        window.uiHelpers.updateText('contests-created', stats.contestsCreated || 0);
        window.uiHelpers.updateText('problems-solved', stats.problemsSolved || 0);
        window.uiHelpers.updateText('avg-rating', stats.averageRating || 0);
        window.uiHelpers.updateText('total-hours', stats.totalMentoringHours || 0);
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
    }

    async updateProfile() {
        console.log('👨‍🏫 Mentor Profile Controller: Updating profile...');
        
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
            const response = await window.APIService.updateMentorProfile(formData);
            
            if (response.success) {
                window.uiHelpers.showSuccess('Success', 'Profile updated successfully');
                // Reload profile data
                await this.loadMentorProfile();
            } else {
                window.uiHelpers.showError('Error', response.error || 'Failed to update profile');
            }
            
            this.setLoadingState(false);
            
        } catch (error) {
            this.setLoadingState(false);
            console.error('👨‍🏫 Mentor Profile Controller: Error updating profile:', error);
            window.uiHelpers.showError('Error', 'Failed to update profile');
        }
    }

    collectFormData() {
        return {
            firstName: document.getElementById('mentor-first-name')?.value?.trim(),
            lastName: document.getElementById('mentor-last-name')?.value?.trim(),
            email: document.getElementById('mentor-email')?.value?.trim(),
            bio: document.getElementById('mentor-bio')?.value?.trim(),
            phoneNumber: document.getElementById('mentor-phone')?.value?.trim(),
            location: document.getElementById('mentor-location')?.value?.trim(),
            linkedin: document.getElementById('mentor-linkedin')?.value?.trim(),
            github: document.getElementById('mentor-github')?.value?.trim(),
            dateOfBirth: document.getElementById('mentor-date-of-birth')?.value,
            expertise: this.getExpertiseList(),
            settings: this.getSettingsData()
        };
    }

    getExpertiseList() {
        const expertiseContainer = document.getElementById('mentor-expertise');
        if (!expertiseContainer) return [];
        
        const expertiseSpans = expertiseContainer.querySelectorAll('span');
        return Array.from(expertiseSpans).map(span => 
            span.textContent.replace('×', '').trim()
        ).filter(skill => skill.length > 0);
    }

    getSettingsData() {
        return {
            emailNotifications: document.getElementById('email-notifications')?.checked || false,
            smsNotifications: document.getElementById('sms-notifications')?.checked || false,
            pushNotifications: document.getElementById('push-notifications')?.checked || false,
            profileVisibility: document.getElementById('profile-visibility')?.value || 'public',
            showEmail: document.getElementById('show-email')?.checked || false,
            showPhone: document.getElementById('show-phone')?.checked || false
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
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async addExpertise() {
        const newSkill = prompt('Enter new expertise area:');
        if (!newSkill || newSkill.trim().length === 0) return;
        
        const expertiseContainer = document.getElementById('mentor-expertise');
        if (!expertiseContainer) return;
        
        const skillSpan = document.createElement('span');
        skillSpan.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2';
        skillSpan.innerHTML = `
            ${newSkill.trim()}
            <button onclick="mentorProfileController.removeExpertise('${newSkill.trim()}')" 
                    class="ml-2 text-blue-600 hover:text-blue-800">
                ×
            </button>
        `;
        
        expertiseContainer.appendChild(skillSpan);
    }

    removeExpertise(skill) {
        const expertiseContainer = document.getElementById('mentor-expertise');
        if (!expertiseContainer) return;
        
        const skillSpans = expertiseContainer.querySelectorAll('span');
        skillSpans.forEach(span => {
            if (span.textContent.includes(skill)) {
                span.remove();
            }
        });
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
            console.error('👨‍🏫 Mentor Profile Controller: Error changing password:', error);
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
                    const avatarImg = document.getElementById('mentor-avatar');
                    if (avatarImg) {
                        avatarImg.src = response.data.avatarUrl;
                    }
                } else {
                    window.uiHelpers.showError('Error', response.error || 'Failed to upload avatar');
                }
                
                this.setLoadingState(false);
                
            } catch (error) {
                this.setLoadingState(false);
                console.error('👨‍🏫 Mentor Profile Controller: Error uploading avatar:', error);
                window.uiHelpers.showError('Error', 'Failed to upload avatar');
            }
        };
        
        fileInput.click();
    }

    setupEventListeners() {
        console.log('👨‍🏫 Mentor Profile Controller: Setting up event listeners...');
        
        // Save profile button
        const saveButton = document.getElementById('save-profile');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.updateProfile();
            });
        }
        
        // Add expertise button
        const addExpertiseButton = document.getElementById('add-expertise');
        if (addExpertiseButton) {
            addExpertiseButton.addEventListener('click', () => {
                this.addExpertise();
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
    }
}

// Initialize mentor profile controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('👨‍🏫 Initializing Mentor Profile Controller...');
    
    // Wait for all dependencies to be ready
    setTimeout(() => {
        try {
            // Check if we're on the mentor profile page
            if (window.location.pathname.includes('/mentor/mentor-profile')) {
                window.mentorProfileController = new MentorProfileController();
            }
        } catch (error) {
            console.error('👨‍🏫 Failed to initialize Mentor Profile Controller:', error);
        }
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MentorProfileController;
}
