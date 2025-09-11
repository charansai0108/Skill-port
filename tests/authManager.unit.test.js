/**
 * AuthManager Unit Tests
 * Tests the authentication logic for verified/unverified scenarios
 */

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: null,
        onAuthStateChanged: jest.fn(),
        signOut: jest.fn()
    })),
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    getDoc: jest.fn(),
    doc: jest.fn()
}));

describe('AuthManager Unit Tests', () => {
    let authManager;
    let mockFirebaseService;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock firebaseService
        mockFirebaseService = {
            onAuthStateChange: jest.fn(),
            logout: jest.fn()
        };
        
        // Mock window.firebaseService
        global.window = {
            firebaseService: mockFirebaseService,
            location: {
                pathname: '/pages/personal/student-dashboard.html',
                href: ''
            }
        };
    });

    test('isProtectedPage should identify protected routes correctly', () => {
        // Import AuthManager class (we'll need to mock the imports)
        const AuthManager = require('../client/js/authManager.js');
        authManager = new AuthManager();

        // Test protected pages
        expect(authManager.isProtectedPage('/pages/personal/student-dashboard.html')).toBe(true);
        expect(authManager.isProtectedPage('/pages/admin/admin-dashboard.html')).toBe(true);
        expect(authManager.isProtectedPage('/pages/mentor/mentor-dashboard.html')).toBe(true);
        expect(authManager.isProtectedPage('/pages/student/user-dashboard.html')).toBe(true);

        // Test non-protected pages
        expect(authManager.isProtectedPage('/pages/auth/login.html')).toBe(false);
        expect(authManager.isProtectedPage('/pages/auth/register.html')).toBe(false);
        expect(authManager.isProtectedPage('/index.html')).toBe(false);
    });

    test('handleAuthStateChange should redirect unverified users', async () => {
        const AuthManager = require('../client/js/authManager.js');
        authManager = new AuthManager();

        // Mock unverified user
        authManager.currentUser = {
            uid: 'test-uid',
            email: 'test@example.com',
            emailVerified: false
        };

        // Mock getUserDataFromFirestore to return unverified user
        authManager.getUserDataFromFirestore = jest.fn().mockResolvedValue({
            otpVerified: false,
            emailVerified: false
        });

        // Mock isUserVerified to return false
        authManager.isUserVerified = jest.fn().mockResolvedValue(false);

        // Call handleAuthStateChange
        await authManager.handleAuthStateChange(true, authManager.currentUser, null);

        // Verify redirect to login
        expect(window.location.href).toBe('/pages/auth/login.html?message=verification-required');
    });

    test('handleAuthStateChange should allow verified users', async () => {
        const AuthManager = require('../client/js/authManager.js');
        authManager = new AuthManager();

        // Mock verified user
        authManager.currentUser = {
            uid: 'test-uid',
            email: 'test@example.com',
            emailVerified: true
        };

        // Mock isUserVerified to return true
        authManager.isUserVerified = jest.fn().mockResolvedValue(true);

        // Mock updateAuthUI
        authManager.updateAuthUI = jest.fn();

        // Call handleAuthStateChange
        await authManager.handleAuthStateChange(true, authManager.currentUser, null);

        // Verify no redirect occurred
        expect(window.location.href).toBe('');
        expect(authManager.updateAuthUI).toHaveBeenCalled();
    });

    test('isUserVerified should return true for OTP verified users', async () => {
        const AuthManager = require('../client/js/authManager.js');
        authManager = new AuthManager();

        // Mock user with OTP verification
        authManager.currentUser = {
            uid: 'test-uid',
            email: 'test@example.com',
            emailVerified: false,
            reload: jest.fn()
        };

        // Mock getUserDataFromFirestore to return OTP verified user
        authManager.getUserDataFromFirestore = jest.fn().mockResolvedValue({
            otpVerified: true,
            emailVerified: false
        });

        const isVerified = await authManager.isUserVerified();

        expect(isVerified).toBe(true);
    });

    test('isUserVerified should return true for email verified users', async () => {
        const AuthManager = require('../client/js/authManager.js');
        authManager = new AuthManager();

        // Mock user with email verification
        authManager.currentUser = {
            uid: 'test-uid',
            email: 'test@example.com',
            emailVerified: true,
            reload: jest.fn()
        };

        // Mock getUserDataFromFirestore to return email verified user
        authManager.getUserDataFromFirestore = jest.fn().mockResolvedValue({
            otpVerified: false,
            emailVerified: true
        });

        const isVerified = await authManager.isUserVerified();

        expect(isVerified).toBe(true);
    });

    test('isUserVerified should return false for unverified users', async () => {
        const AuthManager = require('../client/js/authManager.js');
        authManager = new AuthManager();

        // Mock unverified user
        authManager.currentUser = {
            uid: 'test-uid',
            email: 'test@example.com',
            emailVerified: false,
            reload: jest.fn()
        };

        // Mock getUserDataFromFirestore to return unverified user
        authManager.getUserDataFromFirestore = jest.fn().mockResolvedValue({
            otpVerified: false,
            emailVerified: false
        });

        const isVerified = await authManager.isUserVerified();

        expect(isVerified).toBe(false);
    });
});
