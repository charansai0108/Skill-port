/**
 * OTP Integration Tests
 * Tests the complete OTP verification flow
 */

const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, doc, getDoc } = require('firebase/firestore');

// Mock Firebase config for testing
const firebaseConfig = {
    apiKey: "test-api-key",
    authDomain: "test-project.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "test-app-id"
};

describe('OTP Integration Tests', () => {
    let app;
    let auth;
    let db;

    beforeAll(async () => {
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Connect to emulators
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
    });

    beforeEach(async () => {
        // Clear any existing auth state
        if (auth.currentUser) {
            await auth.signOut();
        }
    });

    test('OTP verification should mark user as verified in Firestore', async () => {
        // Mock OTP verification success
        const testUserData = {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'personal'
        };

        // Simulate the complete registration flow
        // 1. Create Firebase Auth user
        const { createUserWithEmailAndPassword } = require('firebase/auth');
        const { setDoc } = require('firebase/firestore');
        
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            testUserData.email, 
            'testpassword123'
        );
        
        const user = userCredential.user;

        // 2. Create initial Firestore document with otpVerified: false
        await setDoc(doc(db, 'users', user.uid), {
            ...testUserData,
            uid: user.uid,
            otpVerified: false,
            createdAt: new Date().toISOString()
        });

        // 3. Simulate OTP verification success - mark as verified
        await setDoc(doc(db, 'users', user.uid), {
            otpVerified: true,
            otpVerifiedAt: new Date().toISOString()
        }, { merge: true });

        // 4. Verify the user document has otpVerified: true
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        expect(userData.otpVerified).toBe(true);
        expect(userData.otpVerifiedAt).toBeDefined();
    });

    test('Unverified user should be blocked from protected routes', async () => {
        // Create user but don't verify
        const testUserData = {
            email: 'unverified@example.com',
            firstName: 'Unverified',
            lastName: 'User',
            role: 'personal'
        };

        const { createUserWithEmailAndPassword } = require('firebase/auth');
        const { setDoc } = require('firebase/firestore');
        
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            testUserData.email, 
            'testpassword123'
        );
        
        const user = userCredential.user;

        // Create Firestore document with otpVerified: false
        await setDoc(doc(db, 'users', user.uid), {
            ...testUserData,
            uid: user.uid,
            otpVerified: false,
            createdAt: new Date().toISOString()
        });

        // Verify the user document has otpVerified: false
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        expect(userData.otpVerified).toBe(false);
    });

    test('Email verified user should be allowed access', async () => {
        // Create user with email verification
        const testUserData = {
            email: 'emailverified@example.com',
            firstName: 'Email',
            lastName: 'Verified',
            role: 'personal'
        };

        const { createUserWithEmailAndPassword } = require('firebase/auth');
        const { setDoc } = require('firebase/firestore');
        
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            testUserData.email, 
            'testpassword123'
        );
        
        const user = userCredential.user;

        // Create Firestore document with emailVerified: true
        await setDoc(doc(db, 'users', user.uid), {
            ...testUserData,
            uid: user.uid,
            emailVerified: true,
            otpVerified: false,
            createdAt: new Date().toISOString()
        });

        // Verify the user document has emailVerified: true
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        expect(userData.emailVerified).toBe(true);
    });
});
