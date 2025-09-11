/**
 * Firebase Client Configuration
 * Centralized Firebase initialization with environment-based config
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    FacebookAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";
import config from '../config.js';

// Initialize Firebase with environment-specific config
const app = initializeApp(config.getFirebaseConfig());

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize auth providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');
facebookProvider.addScope('email');

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Create or update user document in Firestore
        await createOrUpdateUserDocument(user, 'google');
        
        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: 'google'
            }
        };
    } catch (error) {
        console.error('Google sign-in error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Sign in with Facebook
 */
export async function signInWithFacebook() {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;
        
        // Create or update user document in Firestore
        await createOrUpdateUserDocument(user, 'facebook');
        
        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: 'facebook'
            }
        };
    } catch (error) {
        console.error('Facebook sign-in error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Sign out
 */
export async function signOut() {
    try {
        await firebaseSignOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Create or update user document in Firestore
 */
async function createOrUpdateUserDocument(user, provider) {
    const { doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            provider: provider,
            role: 'personal', // Default role
            emailVerified: user.emailVerified,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    } else {
        // Update existing user document
        await setDoc(userRef, {
            ...userSnap.data(),
            displayName: user.displayName,
            photoURL: user.photoURL,
            provider: provider,
            emailVerified: user.emailVerified,
            updatedAt: new Date()
        }, { merge: true });
    }
}

export default {
    auth,
    db,
    storage,
    googleProvider,
    facebookProvider,
    signInWithGoogle,
    signInWithFacebook,
    signOut
};
