import EnhancedPageController from './enhancedPageController.js';

class StudentProfileController extends EnhancedPageController {
    constructor() {
        super();
        this.realTimeListeners = [];
    }

    getRequiredRole() {
        return 'student';
    }

    async renderDashboardContent() {
        console.log('🎓 StudentProfileController: Rendering student profile content...');
        
        try {
            await this.renderStudentProfile();
            await this.renderAcademicInfo();
            await this.renderLearningGoals();
            await this.renderMentorInfo();
            await this.renderStudyGroups();
            
            this.setupFormHandlers();
            this.setupRealTimeListeners();
            
            console.log('✅ StudentProfileController: Student profile content rendered successfully');
            
        } catch (error) {
            console.error('❌ StudentProfileController: Error rendering profile content:', error);
            throw error;
        }
    }

    async renderStudentProfile() {
        try {
            this.populateStudentProfileForm();
        } catch (error) {
            console.error('Error rendering student profile:', error);
            this.showDefaultStudentProfile();
        }
    }

    async renderAcademicInfo() {
        try {
            const academicInfo = await this.dataLoader.loadStudentAcademicInfo(this.currentUser.uid);
            this.updateAcademicInfoUI(academicInfo);
        } catch (error) {
            console.error('Error loading academic info:', error);
            this.showDefaultAcademicInfo();
        }
    }

    async renderLearningGoals() {
        try {
            const goals = await this.dataLoader.loadLearningGoals(this.currentUser.uid);
            this.updateLearningGoalsUI(goals);
        } catch (error) {
            console.error('Error loading learning goals:', error);
            this.showDefaultLearningGoals();
        }
    }

    async renderMentorInfo() {
        try {
            const mentorInfo = await this.dataLoader.loadMentorInfo(this.currentUser.uid);
            this.updateMentorInfoUI(mentorInfo);
        } catch (error) {
            console.error('Error loading mentor info:', error);
            this.showDefaultMentorInfo();
        }
    }

    async renderStudyGroups() {
        try {
            const studyGroups = await this.dataLoader.loadStudyGroups(this.currentUser.uid);
            this.updateStudyGroupsUI(studyGroups);
        } catch (error) {
            console.error('Error loading study groups:', error);
            this.showDefaultStudyGroups();
        }
    }

    populateStudentProfileForm() {
        if (!this.userData) return;

        const formFields = {
            'student-name': this.userData.name || '',
            'student-email': this.userData.email || this.currentUser.email,
            'student-bio': this.userData.bio || '',
            'student-university': this.userData.university || '',
            'student-major': this.userData.major || '',
            'student-year': this.userData.academicYear || '',
            'student-gpa': this.userData.gpa || '',
            'student-github': this.userData.github || '',
            'student-linkedin': this.userData.linkedin || '',
            'student-portfolio': this.userData.portfolio || ''
        };

        Object.entries(formFields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });

        // Update avatar
        const avatarElement = document.getElementById('student-avatar');
        if (avatarElement && this.userData.profileImage) {
            avatarElement.src = this.userData.profileImage;
        }
    }

    updateAcademicInfoUI(academicInfo) {
        const academicElements = {
            'current-gpa': academicInfo.currentGPA || 'N/A',
            'total-credits': academicInfo.totalCredits || 0,
            'completed-courses': academicInfo.completedCourses || 0,
            'current-courses': academicInfo.currentCourses || 0,
            'expected-graduation': academicInfo.expectedGraduation || 'N/A',
            'academic-standing': academicInfo.academicStanding || 'Good'
        };

        Object.entries(academicElements).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    updateLearningGoalsUI(goals) {
        const container = document.getElementById('learning-goals-list');
        if (!container) return;

        if (goals.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="target" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No learning goals set yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="addLearningGoal()">
                        Set your first goal
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">${goal.title}</h3>
                        <p class="text-sm text-gray-600 mt-1">${goal.description}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getGoalStatusColor(goal.status)}">
                        ${goal.status}
                    </span>
                </div>
                <div class="mb-3">
                    <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>${goal.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${goal.progress}%"></div>
                    </div>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>Target: ${this.formatDate(goal.targetDate)}</span>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700" onclick="editGoal('${goal.id}')">Edit</button>
                        <button class="text-red-600 hover:text-red-700" onclick="deleteGoal('${goal.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateMentorInfoUI(mentorInfo) {
        const container = document.getElementById('mentor-info');
        if (!container) return;

        if (!mentorInfo || !mentorInfo.mentor) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="user-plus" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">No mentor assigned yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="findMentor()">
                        Find a mentor
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center space-x-4 mb-4">
                    <img src="${mentorInfo.mentor.profileImage || '/images/default-avatar.png'}" 
                         alt="${mentorInfo.mentor.name}" class="w-16 h-16 rounded-full object-cover">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900">${mentorInfo.mentor.name}</h3>
                        <p class="text-sm text-gray-600">${mentorInfo.mentor.specialization}</p>
                        <p class="text-xs text-gray-500">${mentorInfo.mentor.experience} years experience</p>
                    </div>
                    <div class="text-right">
                        <div class="flex items-center mb-1">
                            <span class="text-yellow-400">★</span>
                            <span class="text-sm font-medium text-gray-900 ml-1">${mentorInfo.mentor.rating}</span>
                        </div>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ${mentorInfo.status}
                        </span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Sessions Completed:</span>
                        <span class="font-medium text-gray-900 ml-2">${mentorInfo.sessionsCompleted || 0}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Next Session:</span>
                        <span class="font-medium text-gray-900 ml-2">${this.formatDate(mentorInfo.nextSession) || 'Not scheduled'}</span>
                    </div>
                </div>
                <div class="mt-4 flex space-x-2">
                    <button class="text-blue-600 hover:text-blue-700 text-sm font-medium" onclick="scheduleSession()">
                        Schedule Session
                    </button>
                    <button class="text-green-600 hover:text-green-700 text-sm font-medium" onclick="messageMentor()">
                        Message Mentor
                    </button>
                </div>
            </div>
        `;
    }

    updateStudyGroupsUI(studyGroups) {
        const container = document.getElementById('study-groups-list');
        if (!container) return;

        if (studyGroups.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Not joined any study groups yet</p>
                    <button class="mt-2 text-blue-600 hover:text-blue-700 font-medium" onclick="joinStudyGroup()">
                        Join a study group
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = studyGroups.map(group => `
            <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">${group.name}</h3>
                        <p class="text-sm text-gray-600 mt-1">${group.description}</p>
                        <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span class="flex items-center">
                                <i data-lucide="users" class="w-3 h-3 mr-1"></i>
                                ${group.memberCount} members
                            </span>
                            <span class="flex items-center">
                                <i data-lucide="book" class="w-3 h-3 mr-1"></i>
                                ${group.subject}
                            </span>
                        </div>
                    </div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${group.role}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-500">
                        Next meeting: ${this.formatDate(group.nextMeeting) || 'Not scheduled'}
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-700 text-xs font-medium" onclick="viewGroup('${group.id}')">
                            View
                        </button>
                        <button class="text-red-600 hover:text-red-700 text-xs font-medium" onclick="leaveGroup('${group.id}')">
                            Leave
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    setupFormHandlers() {
        // Student profile update form
        const profileForm = document.getElementById('student-profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateStudentProfile();
            });
        }

        // Learning goal form
        const goalForm = document.getElementById('learning-goal-form');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addLearningGoal();
            });
        }

        // Avatar upload
        const avatarInput = document.getElementById('student-avatar-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                this.uploadAvatar(e.target.files[0]);
            });
        }
    }

    async updateStudentProfile() {
        try {
            const formData = new FormData(document.getElementById('student-profile-form'));
            const profileData = {
                name: formData.get('name'),
                bio: formData.get('bio'),
                university: formData.get('university'),
                major: formData.get('major'),
                academicYear: formData.get('academicYear'),
                gpa: formData.get('gpa'),
                github: formData.get('github'),
                linkedin: formData.get('linkedin'),
                portfolio: formData.get('portfolio')
            };

            await this.firebaseService.updateUserProfile(this.currentUser.uid, profileData);
            this.showSuccessMessage('Profile updated successfully!');
            
        } catch (error) {
            console.error('Error updating student profile:', error);
            this.showErrorMessage('Failed to update profile. Please try again.');
        }
    }

    async addLearningGoal() {
        try {
            const formData = new FormData(document.getElementById('learning-goal-form'));
            const goalData = {
                title: formData.get('title'),
                description: formData.get('description'),
                targetDate: formData.get('targetDate'),
                priority: formData.get('priority'),
                status: 'Active',
                progress: 0,
                createdAt: new Date()
            };

            await this.firebaseService.addLearningGoal(this.currentUser.uid, goalData);
            this.showSuccessMessage('Learning goal added successfully!');
            document.getElementById('learning-goal-form').reset();
            this.renderLearningGoals(); // Refresh the list
            
        } catch (error) {
            console.error('Error adding learning goal:', error);
            this.showErrorMessage('Failed to add learning goal. Please try again.');
        }
    }

    async uploadAvatar(file) {
        if (!file) return;

        try {
            const avatarUrl = await this.firebaseService.uploadAvatar(this.currentUser.uid, file);
            document.getElementById('student-avatar').src = avatarUrl;
            this.showSuccessMessage('Avatar updated successfully!');
            
        } catch (error) {
            console.error('Error uploading avatar:', error);
            this.showErrorMessage('Failed to upload avatar. Please try again.');
        }
    }

    getGoalStatusColor(status) {
        const colors = {
            'active': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'paused': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
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
        }, 3000);
    }

    // Default states
    showDefaultStudentProfile() {
        this.populateStudentProfileForm();
    }

    showDefaultAcademicInfo() {
        const defaultInfo = {
            currentGPA: 'N/A',
            totalCredits: 0,
            completedCourses: 0,
            currentCourses: 0,
            expectedGraduation: 'N/A',
            academicStanding: 'Good'
        };
        this.updateAcademicInfoUI(defaultInfo);
    }

    showDefaultLearningGoals() {
        const container = document.getElementById('learning-goals-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading learning goals...</p>
                </div>
            `;
        }
    }

    showDefaultMentorInfo() {
        const container = document.getElementById('mentor-info');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading mentor information...</p>
                </div>
            `;
        }
    }

    showDefaultStudyGroups() {
        const container = document.getElementById('study-groups-list');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="loader" class="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin"></i>
                    <p class="text-gray-500">Loading study groups...</p>
                </div>
            `;
        }
    }

    setupRealTimeListeners() {
        console.log('🎓 StudentProfileController: Setting up real-time listeners...');
        
        try {
            const profileListener = this.dataLoader.setupUserProfileListener(this.currentUser.uid, (profile) => {
                console.log('🎓 Student profile updated:', profile);
                this.userData = { ...this.userData, ...profile };
                this.populateStudentProfileForm();
            });
            this.realTimeListeners.push(profileListener);

            console.log('✅ StudentProfileController: Real-time listeners setup completed');
            
        } catch (error) {
            console.error('❌ StudentProfileController: Error setting up real-time listeners:', error);
        }
    }

    destroy() {
        console.log('🎓 StudentProfileController: Cleaning up...');
        this.realTimeListeners.forEach(unsubscribe => unsubscribe());
        this.realTimeListeners = [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudentProfileController();
});

export default StudentProfileController;
