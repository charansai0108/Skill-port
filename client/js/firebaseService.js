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

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAxcvIYVzwk8_0tX4fErmUxP0auFNyReFc",
    authDomain: "skillport-a0c39.firebaseapp.com",
    projectId: "skillport-a0c39",
    storageBucket: "skillport-a0c39.firebasestorage.app",
    messagingSenderId: "625176486393",
    appId: "1:625176486393:web:9a832be086afbcaeb05d28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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
        
        // Set up auth state listener
        onAuthStateChanged(auth, async (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            
            if (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Load additional user data from Firestore
                await this.loadUserData(user.uid);
                
                // Notify listeners
                this.authStateListeners.forEach(listener => listener(user, true));
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
                
                // Notify listeners
                this.authStateListeners.forEach(listener => listener(null, false));
            }
        });
    }

    // Auth State Management
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    // Authentication Methods
    async register(userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                userData.email, 
                userData.password
            );
            
            const user = userCredential.user;
            
            // Update user profile
            await updateProfile(user, {
                displayName: `${userData.firstName} ${userData.lastName}`
            });

            // Send email verification
            await sendEmailVerification(user);

            // Store additional user data in Firestore
            await this.createUserDocument(user.uid, userData);

            return {
                success: true,
                message: 'Registration successful! Please check your email for verification.',
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

    // User Data Management
    async loadUserData(uid) {
        try {
            console.log('🔍 FirebaseService: Loading user data for UID:', uid);
            const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('🔍 FirebaseService: User data from Firestore:', userData);
                
                this.currentUser = {
                    ...this.currentUser,
                    ...userData
                };
                
                console.log('🔍 FirebaseService: Updated currentUser:', this.currentUser);
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

    // Utility Methods
    getErrorMessage(error) {
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

        return errorMessages[error.code] || 'An unexpected error occurred';
    }

    // Getters
    getCurrentUser() {
        return this.currentUser;
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
}

// Create and export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;