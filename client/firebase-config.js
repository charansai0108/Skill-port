/**
 * Firebase Configuration
 * This file contains the Firebase configuration for the SkillPort application
 * Replace the placeholder values with your actual Firebase project configuration
 */

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAxcvIYVzwk8_0tX4fErmUxP0auFNyReFc",
  authDomain: "skillport-a0c39.firebaseapp.com",
  projectId: "skillport-a0c39",
  storageBucket: "skillport-a0c39.firebasestorage.app",
  messagingSenderId: "625176486393",
  appId: "1:625176486393:web:9a832be086afbcaeb05d28"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  COMMUNITIES: 'communities',
  CONTESTS: 'contests',
  SUBMISSIONS: 'submissions',
  NOTIFICATIONS: 'notifications'
};

// Connect to emulators in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;
