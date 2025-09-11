/**
 * Unified Firebase Service for SkillPort
 * Handles all Firebase operations: Auth, Firestore, and data management
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification, 
    sendPasswordResetEmail, 
    updateProfile, 
    onAuthStateChanged,
    updatePassword,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp,
    limit,
    startAfter,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import config from './config.js';
import authService from './authService.js';
import logger from './logger.js';
import errorHandler from './errorHandler.js';
import validationService from './validation.js';

// Initialize Firebase with environment-specific config
const app = initializeApp(config.getFirebaseConfig());
const auth = getAuth(app);
const db = getFirestore(app);

// Collections
const COLLECTIONS = {
    USERS: 'users',
    COMMUNITIES: 'communities',
    CONTESTS: 'contests',
    SUBMISSIONS: 'submissions',
    NOTIFICATIONS: 'notifications'
};

class FirebaseService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authStateListeners = [];
        
        // Clean onAuthStateChanged - no more auto-logout for unverified users
        onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            
            if (!user) {
                // user signed out - handle unauthenticated flow
                this.currentUser = null;
                this.isAuthenticated = false;
                this.authStateListeners.forEach(listener => listener(null, false, undefined));
                return;
            }

            // User is logged in - set as authenticated
            console.log('✅ User authenticated:', user.email);
            this.currentUser = user;
            this.isAuthenticated = true;
            this.authStateListeners.forEach(listener => listener(user, true, undefined));
        });
    }

    // Auth State Management
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    // Authentication Methods
    async register(email, password, extraData = {}) {
        try {
            console.log('📝 Starting registration for:', email);
            
            // Check if user already exists in Firestore
            const existingUserQuery = await getDocs(
                query(collection(db, 'users'), where('email', '==', email))
            );
            
            if (!existingUserQuery.empty) {
                const existingUser = existingUserQuery.docs[0].data();
                if (existingUser.otpVerified) {
                    throw new Error('Email already registered and verified. Please login instead.');
                } else {
                    // User exists but not verified, proceed with OTP
                    console.log('📧 User exists but not verified, sending OTP');
                    await this.sendOtpForExistingUser(email);
                    return { success: true, message: 'OTP sent to existing unverified account' };
                }
            }
            
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            console.log('✅ Firebase user created:', user.uid);

            // Sign out immediately (prevent auto-login before OTP)
            await signOut(auth);
            console.log('🔐 User signed out to prevent auto-login');

            // Create pending doc in Firestore
            const userDocData = {
                email,
                otpVerified: false,
                createdAt: serverTimestamp(),
                ...extraData
            };
            
            await setDoc(doc(db, "users", user.uid), userDocData);
            console.log('✅ Firestore document created with otpVerified: false');

            // Send OTP
            const { default: otpService } = await import('./otpService.js');
            await otpService.sendOtp(email, extraData.firstName || '', extraData.lastName || '');
            console.log('📩 OTP sent successfully');

            console.log("📩 OTP sent, redirecting...");
            window.location.href = `/pages/auth/verify-otp.html?email=${encodeURIComponent(email)}`;

            return {
                success: true,
                message: 'Registration successful! Please check your email for verification.',
                user: user,
                userData: userDocData
            };

        } catch (error) {
            console.error("❌ Registration failed:", error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            return {
                success: true,
                message: 'Login successful!',
                user: user
            };
        } catch (error) {
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    async logout() {
        try {
            await signOut(auth);
            return {
                success: true,
                message: 'Logged out successfully!'
            };
        } catch (error) {
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    async sendPasswordReset(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: 'Password reset email sent!'
            };
        } catch (error) {
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    async sendEmailVerification() {
        try {
            await sendEmailVerification(auth.currentUser);
            return {
                success: true,
                message: 'Verification email sent!'
            };
        } catch (error) {
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    // OTP Verification Methods
    async markUserAsOTPVerified(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                otpVerified: true,
                otpVerifiedAt: new Date().toISOString()
            });
            console.log('✅ User marked as OTP verified in Firestore');
            return { success: true };
        } catch (error) {
            console.error('❌ Error marking user as OTP verified:', error);
            return { success: false, error: error.message };
        }
    }

    // Complete registration after OTP verification
    async sendOtpForExistingUser(email) {
        try {
            console.log('📧 Sending OTP for existing user:', email);
            
            // Send OTP via API
            const response = await fetch('http://localhost:3001/api/otp/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send OTP');
            }
            
            console.log('✅ OTP sent for existing user');
            return { success: true, message: 'OTP sent successfully' };
            
        } catch (error) {
            console.error('❌ Error sending OTP for existing user:', error);
            throw error;
        }
    }

    async completeRegistration(profileData) {
        try {
            const db = getFirestore();
            
            // Get user data from session storage (stored during registration)
            const pendingUserData = JSON.parse(sessionStorage.getItem('pendingUserData') || '{}');
            
            if (!pendingUserData.email) {
                throw new Error("completeRegistration: no pending user data found");
            }

            // We need to find the user's UID from Firestore since we don't have auth.currentUser
            // The user document was created during registration with otpVerified: false
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', pendingUserData.email));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                throw new Error("completeRegistration: no user document found for email");
            }
            
            const userDoc = querySnapshot.docs[0];
            const userId = userDoc.id;
            
            // Build userData with safe defaults
            const userData = {
                name: profileData.name || `${pendingUserData.firstName} ${pendingUserData.lastName}`,
                email: pendingUserData.email,
                role: profileData.role || pendingUserData.role || "personal",
                otpVerified: true,
                updatedAt: serverTimestamp(),
                // copy any additional allowed profile fields
                ...profileData,
            };
            
            await setDoc(doc(db, "users", userId), userData, { merge: true });
            console.info("completeRegistration: users/%s written with otpVerified:true", userId);
            
            return { ok: true, uid: userId };
        } catch (error) {
            console.error("completeRegistration: failed to write user doc", error);
            throw error;
        }
    }

    // User Data Management
    async loadUserData(uid) {
        try {
            console.log('🔍 FirebaseService: Loading user data for UID:', uid);
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('🔍 FirebaseService: User data from Firestore:', userData);
                
                // Merge Firestore data with Firebase Auth user data
                this.currentUser = {
                    ...this.currentUser,
                    ...userData,
                    // Ensure Firebase Auth properties are preserved
                    uid: this.currentUser.uid,
                    email: this.currentUser.email,
                    displayName: this.currentUser.displayName,
                    emailVerified: this.currentUser.emailVerified
                };
                
                console.log('🔍 FirebaseService: Updated currentUser:', this.currentUser);
                console.log('🔍 FirebaseService: User role after merge:', this.currentUser.role);
                return userData;
            } else {
                console.log('🔍 FirebaseService: No user document found for UID:', uid);
            }
            return null;
        } catch (error) {
            console.error('Error loading user data:', error);
            return null;
        }
    }

    async createUserDocument(uid, userData) {
        try {
            const userDoc = {
                uid,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                role: userData.role,
                community: userData.community || null,
                experience: userData.experience || null,
                skills: userData.skills || [],
                bio: userData.bio || '',
                avatar: null,
                extensionInstalled: false,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, COLLECTIONS.USERS, uid), userDoc);
            return { success: true };
        } catch (error) {
            console.error('Error creating user document:', error);
            return { success: false, error };
        }
    }

    async updateUserProfile(updates) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            await updateDoc(doc(db, COLLECTIONS.USERS, this.currentUser.uid), {
                ...updates,
                updatedAt: serverTimestamp()
            });

            // Reload user data
            await this.loadUserData(this.currentUser.uid);

            return { success: true, message: 'Profile updated successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Community Management
    async createCommunity(communityData) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            const communityDoc = {
                name: communityData.name,
                code: communityData.code,
                description: communityData.description || '',
                admin: this.currentUser.uid,
                members: [this.currentUser.uid],
                mentors: [],
                students: [],
                contests: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.COMMUNITIES), communityDoc);
            
            // Update user's community
            await this.updateUserProfile({ community: docRef.id });

            return {
                success: true,
                message: 'Community created successfully!',
                communityId: docRef.id
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async joinCommunity(communityCode) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            // Find community by code
            const q = query(
                collection(db, COLLECTIONS.COMMUNITIES),
                where('code', '==', communityCode)
            );
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return { success: false, message: 'Community not found with this code' };
            }

            const communityDoc = querySnapshot.docs[0];
            const communityData = communityDoc.data();
            
            // Add user to community members
            const updatedMembers = [...communityData.members, this.currentUser.uid];
            await updateDoc(doc(db, COLLECTIONS.COMMUNITIES, communityDoc.id), {
                members: updatedMembers,
                updatedAt: serverTimestamp()
            });

            // Update user's community
            await this.updateUserProfile({ community: communityDoc.id });

            return {
                success: true,
                message: 'Successfully joined community!',
                communityId: communityDoc.id
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getCommunities() {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTIONS.COMMUNITIES));
            const communities = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { success: true, data: communities };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Contest Management
    async createContest(contestData) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            const contestDoc = {
                title: contestData.title,
                description: contestData.description || '',
                startDate: contestData.startDate,
                endDate: contestData.endDate,
                rules: contestData.rules || [],
                prizes: contestData.prizes || [],
                createdBy: this.currentUser.uid,
                community: this.currentUser.community,
                participants: [],
                submissions: [],
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.CONTESTS), contestDoc);
            
            return {
                success: true,
                message: 'Contest created successfully!',
                contestId: docRef.id
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getContests() {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTIONS.CONTESTS));
            const contests = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { success: true, data: contests };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Project Management
    async getProjects() {
        try {
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const projects = querySnapshot.docs.map(doc => ({
                id: doc.id,
                _id: doc.id, // For compatibility
                ...doc.data()
            }));
            return { success: true, data: projects };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Task Management
    async getTasks() {
        try {
            if (!this.isUserAuthenticated()) {
                return { success: false, message: 'User not authenticated' };
            }

            const querySnapshot = await getDocs(collection(db, 'tasks'));
            const tasks = querySnapshot.docs.map(doc => ({
                id: doc.id,
                _id: doc.id,
                ...doc.data()
            }));
            return { success: true, data: tasks };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async createTask(taskData) {
        try {
            if (!this.isUserAuthenticated()) {
                return { success: false, message: 'User not authenticated' };
            }

            const taskDoc = {
                ...taskData,
                userId: this.currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'tasks'), taskDoc);
            return {
                success: true,
                message: 'Task created successfully!',
                taskId: docRef.id
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Get feedback requests
    async getFeedbackRequests() {
        try {
            if (!this.isUserAuthenticated()) {
                return { success: false, message: 'User not authenticated' };
            }

            const feedbackQuery = query(
                collection(db, 'feedbackRequests'),
                where('mentorId', '==', this.currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(feedbackQuery);
            const feedbackRequests = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                success: true,
                data: feedbackRequests
            };
        } catch (error) {
            console.error('Error getting feedback requests:', error);
            return { success: false, message: error.message };
        }
    }

    // Community Analytics
    async getCommunitySummary(communityId) {
        try {
            const communityDoc = await getDoc(doc(db, 'communities', communityId));
            if (!communityDoc.exists()) {
                return { success: false, message: 'Community not found' };
            }

            const communityData = communityDoc.data();
            
            // Get member count
            const membersQuery = query(
                collection(db, 'users'),
                where('communityId', '==', communityId)
            );
            const membersSnapshot = await getDocs(membersQuery);
            
            // Get contest count
            const contestsQuery = query(
                collection(db, 'contests'),
                where('communityId', '==', communityId)
            );
            const contestsSnapshot = await getDocs(contestsQuery);

            return {
                success: true,
                data: {
                    ...communityData,
                    memberCount: membersSnapshot.size,
                    contestCount: contestsSnapshot.size,
                    id: communityDoc.id
                }
            };
        } catch (error) {
            console.error('Error getting community summary:', error);
            return { success: false, message: error.message };
        }
    }

    async getCommunityInsights(communityId) {
        try {
            // Get community data
            const communityDoc = await getDoc(doc(db, 'communities', communityId));
            if (!communityDoc.exists()) {
                return { success: false, message: 'Community not found' };
            }

            // Get member statistics
            const membersQuery = query(
                collection(db, 'users'),
                where('communityId', '==', communityId)
            );
            const membersSnapshot = await getDocs(membersQuery);
            const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Get contest statistics
            const contestsQuery = query(
                collection(db, 'contests'),
                where('communityId', '==', communityId)
            );
            const contestsSnapshot = await getDocs(contestsQuery);
            const contests = contestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate insights
            const roleStats = members.reduce((acc, member) => {
                acc[member.role] = (acc[member.role] || 0) + 1;
                return acc;
            }, {});

            const activeContests = contests.filter(contest => contest.status === 'active').length;

            return {
                success: true,
                data: {
                    totalMembers: members.length,
                    roleStats,
                    totalContests: contests.length,
                    activeContests,
                    recentActivity: members.slice(0, 5) // Last 5 members
                }
            };
        } catch (error) {
            console.error('Error getting community insights:', error);
            return { success: false, message: error.message };
        }
    }

    async getRecentActivity(communityId) {
        try {
            // Get recent submissions
            const submissionsQuery = query(
                collection(db, 'submissions'),
                where('communityId', '==', communityId),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            const submissionsSnapshot = await getDocs(submissionsQuery);
            const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return {
                success: true,
                data: submissions
            };
        } catch (error) {
            console.error('Error getting recent activity:', error);
            return { success: false, message: error.message };
        }
    }

    async updateTask(taskId, taskData) {
        try {
            if (!this.isUserAuthenticated()) {
                return { success: false, message: 'User not authenticated' };
            }

            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, {
                ...taskData,
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                message: 'Task updated successfully!'
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Submission Management
    async submitContestEntry(contestId, submissionData) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            const submissionDoc = {
                contestId: contestId,
                userId: this.currentUser.uid,
                title: submissionData.title,
                description: submissionData.description || '',
                code: submissionData.code || '',
                files: submissionData.files || [],
                score: 0,
                status: 'submitted',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.SUBMISSIONS), submissionDoc);
            
            return {
                success: true,
                message: 'Submission created successfully!',
                submissionId: docRef.id
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getSubmissions(contestId = null) {
        try {
            let q = collection(db, COLLECTIONS.SUBMISSIONS);
            
            if (contestId) {
                q = query(q, where('contestId', '==', contestId));
            }
            
            const querySnapshot = await getDocs(q);
            const submissions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { success: true, data: submissions };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Community Management (Enhanced)
    async getCommunityMembers(communityId) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            const communityDoc = await getDoc(doc(db, COLLECTIONS.COMMUNITIES, communityId));
            if (!communityDoc.exists()) {
                return { success: false, message: 'Community not found' };
            }

            const communityData = communityDoc.data();
            const memberIds = communityData.members || [];
            
            // Get user details for each member
            const memberPromises = memberIds.map(memberId => 
                getDoc(doc(db, COLLECTIONS.USERS, memberId))
            );
            
            const memberDocs = await Promise.all(memberPromises);
            const members = memberDocs
                .filter(doc => doc.exists())
                .map(doc => ({ id: doc.id, ...doc.data() }));

            return { success: true, data: members };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async addUserToCommunity(userId, communityId, role = 'student') {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            const communityRef = doc(db, COLLECTIONS.COMMUNITIES, communityId);
            const communityDoc = await getDoc(communityRef);
            
            if (!communityDoc.exists()) {
                return { success: false, message: 'Community not found' };
            }

            const communityData = communityDoc.data();
            const updatedMembers = [...(communityData.members || []), userId];
            
            const updateData = {
                members: updatedMembers,
                updatedAt: serverTimestamp()
            };

            // Add to role-specific array
            if (role === 'mentor') {
                updateData.mentors = [...(communityData.mentors || []), userId];
            } else if (role === 'student') {
                updateData.students = [...(communityData.students || []), userId];
            }

            await updateDoc(communityRef, updateData);

            // Update user's community and role
            await this.updateUserProfile({ 
                community: communityId,
                role: role
            });

            return { success: true, message: 'User added to community successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async removeUserFromCommunity(userId, communityId) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            const communityRef = doc(db, COLLECTIONS.COMMUNITIES, communityId);
            const communityDoc = await getDoc(communityRef);
            
            if (!communityDoc.exists()) {
                return { success: false, message: 'Community not found' };
            }

            const communityData = communityDoc.data();
            const updatedMembers = (communityData.members || []).filter(id => id !== userId);
            const updatedMentors = (communityData.mentors || []).filter(id => id !== userId);
            const updatedStudents = (communityData.students || []).filter(id => id !== userId);
            
            await updateDoc(communityRef, {
                members: updatedMembers,
                mentors: updatedMentors,
                students: updatedStudents,
                updatedAt: serverTimestamp()
            });

            return { success: true, message: 'User removed from community successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // User Management
    async getAllUsers() {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
            const users = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return { success: true, data: users };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getUserById(userId) {
        try {
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
            if (userDoc.exists()) {
                return { 
                    success: true, 
                    data: { id: userDoc.id, ...userDoc.data() } 
                };
            } else {
                return { success: false, message: 'User not found' };
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async updateUserRole(userId, newRole) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
                role: newRole,
                updatedAt: serverTimestamp()
            });

            return { success: true, message: 'User role updated successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async deleteUser(userId) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
            return { success: true, message: 'User deleted successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Analytics and Statistics
    async getCommunityStats(communityId) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, message: 'User not authenticated' };
            }

            const communityDoc = await getDoc(doc(db, COLLECTIONS.COMMUNITIES, communityId));
            if (!communityDoc.exists()) {
                return { success: false, message: 'Community not found' };
            }

            const communityData = communityDoc.data();
            const memberCount = (communityData.members || []).length;
            const mentorCount = (communityData.mentors || []).length;
            const studentCount = (communityData.students || []).length;
            const contestCount = (communityData.contests || []).length;

            return {
                success: true,
                data: {
                    memberCount,
                    mentorCount,
                    studentCount,
                    contestCount,
                    createdAt: communityData.createdAt
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getUserStats(userId) {
        try {
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
            if (!userDoc.exists()) {
                return { success: false, message: 'User not found' };
            }

            const userData = userDoc.data();
            
            // Get user's submissions
            const submissionsQuery = query(
                collection(db, COLLECTIONS.SUBMISSIONS),
                where('userId', '==', userId)
            );
            const submissionsSnapshot = await getDocs(submissionsQuery);
            const submissionCount = submissionsSnapshot.size;

            return {
                success: true,
                data: {
                    ...userData,
                    submissionCount,
                    problemsSolved: userData.problemsSolved || 0,
                    totalPoints: userData.totalPoints || 0,
                    streak: userData.streak || 0
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Utility Methods
    getErrorMessage(error) {
        console.log('🔍 FirebaseService: Error details:', error);
        
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Please enter a valid email address',
            'auth/operation-not-allowed': 'Email/password accounts are not enabled',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/invalid-credential': 'Invalid email or password',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/requires-recent-login': 'Please log in again to perform this action'
        };

        // Check for error code
        if (error.code) {
            return errorMessages[error.code] || error.message || 'An unexpected error occurred';
        }
        
        // Check for error message
        if (error.message) {
            // Check if it's a Firebase error message
            if (error.message.includes('email-already-in-use')) {
                return 'This email is already registered';
            }
            if (error.message.includes('invalid-email')) {
                return 'Please enter a valid email address';
            }
            if (error.message.includes('weak-password')) {
                return 'Password should be at least 6 characters';
            }
            return error.message;
        }

        return 'An unexpected error occurred';
    }

    // Getters
    getCurrentUser() {
        if (!this.currentUser) {
            return null;
        }
        
        // Ensure role is set, default to 'personal' if not found
        if (!this.currentUser.role) {
            console.warn('🔍 FirebaseService: User role not found, defaulting to personal');
            this.currentUser.role = 'personal';
        }
        
        // Return a copy to prevent external modification
        return { ...this.currentUser };
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.currentUser?.uid || null;
    }

    getUserRole() {
        return this.currentUser?.role || null;
    }

    async getIdToken() {
        if (this.currentUser) {
            return await this.currentUser.getIdToken();
        }
        return null;
    }

    // New methods for the standard Firestore structure
    async getUserDocument(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user document:', error);
            logger.error('FirebaseService: Error getting user document', error);
            return null;
        }
    }

    async getUserTasks(uid) {
        try {
            const tasksRef = collection(db, 'users', uid, 'tasks');
            const tasksSnapshot = await getDocs(tasksRef);
            const tasks = [];
            
            tasksSnapshot.forEach((doc) => {
                tasks.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return tasks;
        } catch (error) {
            console.error('Error getting user tasks:', error);
            logger.error('FirebaseService: Error getting user tasks', error);
            return [];
        }
    }

    async getUserProjects(uid) {
        try {
            const projectsRef = collection(db, 'users', uid, 'projects');
            const projectsSnapshot = await getDocs(projectsRef);
            const projects = [];
            
            projectsSnapshot.forEach((doc) => {
                projects.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return projects;
        } catch (error) {
            console.error('Error getting user projects:', error);
            logger.error('FirebaseService: Error getting user projects', error);
            return [];
        }
    }

    async getUserAchievements(uid) {
        try {
            const achievementsRef = collection(db, 'users', uid, 'achievements');
            const achievementsSnapshot = await getDocs(achievementsRef);
            const achievements = [];
            
            achievementsSnapshot.forEach((doc) => {
                achievements.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return achievements;
        } catch (error) {
            console.error('Error getting user achievements:', error);
            logger.error('FirebaseService: Error getting user achievements', error);
            return [];
        }
    }

    async createUserDocument(uid, userData) {
        try {
            const userDoc = {
                name: userData.name || userData.displayName || 'User',
                email: userData.email || '',
                profileImage: userData.photoURL || '',
                streak: 0,
                submissions: 0,
                problemsSolved: 0,
                skillRating: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'users', uid), userDoc);
            console.log('User document created successfully');
            return { success: true, data: userDoc };
        } catch (error) {
            console.error('Error creating user document:', error);
            logger.error('FirebaseService: Error creating user document', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserStats(uid, stats) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                ...stats,
                updatedAt: serverTimestamp()
            });
            console.log('User stats updated successfully');
            return { success: true };
        } catch (error) {
            console.error('Error updating user stats:', error);
            logger.error('FirebaseService: Error updating user stats', error);
            return { success: false, error: error.message };
        }
    }
}

// Create and export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;// Force reload: 1757559898
// Force reload: 1757560257801950000
