/**
 * Mentor/Student Management Handler - Firebase Integration
 * Handles adding mentors and students to communities
 */
import firebaseService from './firebaseService.js';

class MentorStudentManagementHandler {
    constructor() {
        this.init();
    }

    init() {
        console.log('👥 MentorStudentManagementHandler: Initializing...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mentor creation form
        const mentorForm = document.getElementById('add-mentor-form');
        if (mentorForm) {
            mentorForm.addEventListener('submit', (e) => this.handleAddMentor(e));
        }

        // Student creation form
        const studentForm = document.getElementById('add-student-form');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => this.handleAddStudent(e));
        }

        // Student password setup form
        const passwordForm = document.getElementById('setup-password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handleSetupPassword(e));
        }
    }

    async handleAddMentor(event) {
        event.preventDefault();
        
        try {
            console.log('👥 MentorStudentManagementHandler: Adding mentor...');
            
            const formData = new FormData(event.target);
            const mentorData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                role: 'mentor',
                experience: formData.get('experience') || 'intermediate',
                skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : [],
                bio: formData.get('bio') || '',
                specializations: formData.get('specializations') ? formData.get('specializations').split(',').map(s => s.trim()) : []
            };

            // Validate form data
            const validation = this.validateMentorForm(mentorData);
            if (!validation.isValid) {
                this.showError(validation.message);
                return;
            }

            // Show loading state
            this.showLoading(true, 'mentor');

            // Register mentor with Firebase
            const response = await firebaseService.register(mentorData);
            
            if (response.success) {
                // Add mentor to community
                await this.addUserToCommunity(response.user.uid, 'mentor');
                
                this.showSuccess('Mentor added successfully! They will receive login credentials via email.');
                event.target.reset();
            } else {
                this.showError(response.message || 'Failed to add mentor');
            }
            
        } catch (error) {
            console.error('👥 MentorStudentManagementHandler: Error adding mentor:', error);
            this.showError('An error occurred while adding mentor. Please try again.');
        } finally {
            this.showLoading(false, 'mentor');
        }
    }

    async handleAddStudent(event) {
        event.preventDefault();
        
        try {
            console.log('👥 MentorStudentManagementHandler: Adding student...');
            
            const formData = new FormData(event.target);
            const studentData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                role: 'student',
                experience: formData.get('experience') || 'beginner',
                skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : [],
                goals: formData.get('goals') || '',
                currentLevel: formData.get('currentLevel') || 'beginner'
            };

            // Validate form data
            const validation = this.validateStudentForm(studentData);
            if (!validation.isValid) {
                this.showError(validation.message);
                return;
            }

            // Show loading state
            this.showLoading(true, 'student');

            // Create student account (without password - they'll set it later)
            const response = await this.createStudentAccount(studentData);
            
            if (response.success) {
                // Add student to community
                await this.addUserToCommunity(response.userId, 'student');
                
                this.showSuccess('Student added successfully! They will receive an email to set up their password.');
                event.target.reset();
            } else {
                this.showError(response.message || 'Failed to add student');
            }
            
        } catch (error) {
            console.error('👥 MentorStudentManagementHandler: Error adding student:', error);
            this.showError('An error occurred while adding student. Please try again.');
        } finally {
            this.showLoading(false, 'student');
        }
    }

    async handleSetupPassword(event) {
        event.preventDefault();
        
        try {
            console.log('👥 MentorStudentManagementHandler: Setting up password...');
            
            const formData = new FormData(event.target);
            const passwordData = {
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            // Validate form data
            if (!passwordData.email || !passwordData.password) {
                this.showError('All fields are required.');
                return;
            }

            if (passwordData.password !== passwordData.confirmPassword) {
                this.showError('Passwords do not match.');
                return;
            }

            if (passwordData.password.length < 6) {
                this.showError('Password must be at least 6 characters long.');
                return;
            }

            // Show loading state
            this.showLoading(true, 'password');

            // Set up password for student
            const response = await this.setupStudentPassword(passwordData);
            
            if (response.success) {
                this.showSuccess('Password set up successfully! You can now log in.');
                setTimeout(() => {
                    window.location.href = '/pages/student/user-dashboard.html';
                }, 2000);
            } else {
                this.showError(response.message || 'Failed to set up password');
            }
            
        } catch (error) {
            console.error('👥 MentorStudentManagementHandler: Error setting up password:', error);
            this.showError('An error occurred while setting up password. Please try again.');
        } finally {
            this.showLoading(false, 'password');
        }
    }

    async createStudentAccount(studentData) {
        try {
            // Create a temporary password that will be changed
            const tempPassword = this.generateTempPassword();
            
            // Register with temporary password
            const response = await firebaseService.register({
                ...studentData,
                password: tempPassword,
                confirmPassword: tempPassword,
                needsPasswordSetup: true
            });

            if (response.success) {
                // Send email with password setup link
                await this.sendPasswordSetupEmail(studentData.email, response.user.uid);
                
                return {
                    success: true,
                    userId: response.user.uid,
                    message: 'Student account created. Password setup email sent.'
                };
            }

            return response;
        } catch (error) {
            console.error('Error creating student account:', error);
            return { success: false, message: error.message };
        }
    }

    async setupStudentPassword(passwordData) {
        try {
            // This would typically involve a secure token-based password setup
            // For now, we'll use Firebase's password reset functionality
            await firebaseService.sendPasswordReset(passwordData.email);
            
            return {
                success: true,
                message: 'Password reset email sent. Please check your email to set up your password.'
            };
        } catch (error) {
            console.error('Error setting up student password:', error);
            return { success: false, message: error.message };
        }
    }

    async addUserToCommunity(userId, role) {
        try {
            const currentUser = firebaseService.getCurrentUser();
            if (!currentUser || !currentUser.community) {
                throw new Error('Admin not associated with a community');
            }

            // Add user to community members
            const communityRef = firebaseService.db.collection('communities').doc(currentUser.community);
            const communityDoc = await communityRef.get();
            
            if (!communityDoc.exists) {
                throw new Error('Community not found');
            }

            const communityData = communityDoc.data();
            const updatedMembers = [...communityData.members, userId];
            
            // Update members array
            await communityRef.update({
                members: updatedMembers,
                updatedAt: firebaseService.serverTimestamp()
            });

            // Add role-specific arrays
            if (role === 'mentor') {
                const updatedMentors = [...(communityData.mentors || []), userId];
                await communityRef.update({
                    mentors: updatedMentors,
                    updatedAt: firebaseService.serverTimestamp()
                });
            } else if (role === 'student') {
                const updatedStudents = [...(communityData.students || []), userId];
                await communityRef.update({
                    students: updatedStudents,
                    updatedAt: firebaseService.serverTimestamp()
                });
            }

            // Update user's community
            await firebaseService.updateUserProfile({
                community: currentUser.community,
                role: role
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding user to community:', error);
            return { success: false, message: error.message };
        }
    }

    async sendPasswordSetupEmail(email, userId) {
        try {
            // In a real implementation, this would send a secure email with a token
            // For now, we'll just log it
            console.log(`Password setup email would be sent to ${email} for user ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('Error sending password setup email:', error);
            return { success: false, message: error.message };
        }
    }

    generateTempPassword() {
        // Generate a secure temporary password
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    validateMentorForm(mentorData) {
        if (!mentorData.firstName || !mentorData.lastName || !mentorData.email || !mentorData.password) {
            return { isValid: false, message: 'All fields are required.' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mentorData.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        if (mentorData.password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long.' };
        }

        if (mentorData.password !== mentorData.confirmPassword) {
            return { isValid: false, message: 'Passwords do not match.' };
        }

        return { isValid: true };
    }

    validateStudentForm(studentData) {
        if (!studentData.firstName || !studentData.lastName || !studentData.email) {
            return { isValid: false, message: 'All fields are required.' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        return { isValid: true };
    }

    showLoading(show, type) {
        const submitBtn = document.querySelector(`#add-${type}-form button[type="submit"]`);
        if (submitBtn) {
            if (show) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="animate-spin">⏳</span> Adding ${type}...`;
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
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
    window.mentorStudentManagementHandler = new MentorStudentManagementHandler();
});
