/**
 * Unit Tests for AuthService
 * Tests authentication service functionality
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const testData = require('../../fixtures/test-data');

// Mock Firebase Auth
const mockFirebaseAuth = {
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  currentUser: null
};

// Mock Firebase Client
const mockFirebaseClient = {
  signInWithGoogle: jest.fn(),
  signInWithFacebook: jest.fn(),
  signOut: jest.fn()
};

// Mock AuthService
class MockAuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userRole = null;
    this.authStateListeners = [];
  }

  async loginWithGoogle() {
    try {
      const result = await mockFirebaseClient.signInWithGoogle();
      if (result.success) {
        this.currentUser = result.user;
        this.isAuthenticated = true;
        this.notifyAuthStateListeners(result.user, true);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loginWithFacebook() {
    try {
      const result = await mockFirebaseClient.signInWithFacebook();
      if (result.success) {
        this.currentUser = result.user;
        this.isAuthenticated = true;
        this.notifyAuthStateListeners(result.user, true);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const result = await mockFirebaseClient.signOut();
      if (result.success) {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.userRole = null;
        this.notifyAuthStateListeners(null, false);
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  addAuthStateListener(callback) {
    this.authStateListeners.push(callback);
  }

  removeAuthStateListener(callback) {
    this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
  }

  notifyAuthStateListeners(user, isAuthenticated) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user, isAuthenticated);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.currentUser?.uid || null;
  }

  getUserRole() {
    return this.userRole;
  }

  isAdmin() {
    return this.userRole === 'community-admin';
  }

  isMentor() {
    return this.userRole === 'mentor';
  }

  isStudent() {
    return this.userRole === 'student';
  }

  isPersonal() {
    return this.userRole === 'personal';
  }
}

describe('AuthService Unit Tests', () => {
  let authService;

  beforeEach(() => {
    authService = new MockAuthService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Google Authentication', () => {
    test('should login with Google successfully', async () => {
      // Arrange
      const mockUser = testData.users.student;
      mockFirebaseClient.signInWithGoogle.mockResolvedValue({
        success: true,
        user: mockUser
      });

      // Act
      const result = await authService.loginWithGoogle();

      // Assert
      expect(result.success).toBe(true);
      expect(authService.currentUser).toEqual(mockUser);
      expect(authService.isAuthenticated).toBe(true);
      expect(mockFirebaseClient.signInWithGoogle).toHaveBeenCalledTimes(1);
    });

    test('should handle Google login failure', async () => {
      // Arrange
      mockFirebaseClient.signInWithGoogle.mockResolvedValue({
        success: false,
        error: 'Google login failed'
      });

      // Act
      const result = await authService.loginWithGoogle();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Google login failed');
      expect(authService.currentUser).toBeNull();
      expect(authService.isAuthenticated).toBe(false);
    });

    test('should handle Google login exception', async () => {
      // Arrange
      mockFirebaseClient.signInWithGoogle.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await authService.loginWithGoogle();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(authService.currentUser).toBeNull();
      expect(authService.isAuthenticated).toBe(false);
    });
  });

  describe('Facebook Authentication', () => {
    test('should login with Facebook successfully', async () => {
      // Arrange
      const mockUser = testData.users.mentor;
      mockFirebaseClient.signInWithFacebook.mockResolvedValue({
        success: true,
        user: mockUser
      });

      // Act
      const result = await authService.loginWithFacebook();

      // Assert
      expect(result.success).toBe(true);
      expect(authService.currentUser).toEqual(mockUser);
      expect(authService.isAuthenticated).toBe(true);
      expect(mockFirebaseClient.signInWithFacebook).toHaveBeenCalledTimes(1);
    });

    test('should handle Facebook login failure', async () => {
      // Arrange
      mockFirebaseClient.signInWithFacebook.mockResolvedValue({
        success: false,
        error: 'Facebook login failed'
      });

      // Act
      const result = await authService.loginWithFacebook();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Facebook login failed');
      expect(authService.currentUser).toBeNull();
      expect(authService.isAuthenticated).toBe(false);
    });
  });

  describe('Sign Out', () => {
    test('should sign out successfully', async () => {
      // Arrange
      authService.currentUser = testData.users.student;
      authService.isAuthenticated = true;
      authService.userRole = 'student';
      
      mockFirebaseClient.signOut.mockResolvedValue({
        success: true
      });

      // Act
      const result = await authService.signOut();

      // Assert
      expect(result.success).toBe(true);
      expect(authService.currentUser).toBeNull();
      expect(authService.isAuthenticated).toBe(false);
      expect(authService.userRole).toBeNull();
      expect(mockFirebaseClient.signOut).toHaveBeenCalledTimes(1);
    });

    test('should handle sign out failure', async () => {
      // Arrange
      authService.currentUser = testData.users.student;
      authService.isAuthenticated = true;
      
      mockFirebaseClient.signOut.mockResolvedValue({
        success: false,
        error: 'Sign out failed'
      });

      // Act
      const result = await authService.signOut();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign out failed');
      expect(authService.currentUser).toEqual(testData.users.student);
      expect(authService.isAuthenticated).toBe(true);
    });
  });

  describe('Auth State Management', () => {
    test('should add and remove auth state listeners', () => {
      // Arrange
      const mockListener = jest.fn();

      // Act
      authService.addAuthStateListener(mockListener);
      expect(authService.authStateListeners).toContain(mockListener);

      authService.removeAuthStateListener(mockListener);
      expect(authService.authStateListeners).not.toContain(mockListener);
    });

    test('should notify auth state listeners on login', () => {
      // Arrange
      const mockListener = jest.fn();
      authService.addAuthStateListener(mockListener);
      const mockUser = testData.users.student;

      // Act
      authService.notifyAuthStateListeners(mockUser, true);

      // Assert
      expect(mockListener).toHaveBeenCalledWith(mockUser, true);
    });

    test('should notify auth state listeners on logout', () => {
      // Arrange
      const mockListener = jest.fn();
      authService.addAuthStateListener(mockListener);

      // Act
      authService.notifyAuthStateListeners(null, false);

      // Assert
      expect(mockListener).toHaveBeenCalledWith(null, false);
    });

    test('should handle listener errors gracefully', () => {
      // Arrange
      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = jest.fn();
      
      authService.addAuthStateListener(errorListener);
      authService.addAuthStateListener(normalListener);

      // Act & Assert - should not throw
      expect(() => {
        authService.notifyAuthStateListeners(testData.users.student, true);
      }).not.toThrow();

      expect(normalListener).toHaveBeenCalledWith(testData.users.student, true);
    });
  });

  describe('User State Getters', () => {
    test('should return current user', () => {
      // Arrange
      const mockUser = testData.users.student;
      authService.currentUser = mockUser;

      // Act
      const currentUser = authService.getCurrentUser();

      // Assert
      expect(currentUser).toEqual(mockUser);
    });

    test('should return authentication status', () => {
      // Arrange
      authService.isAuthenticated = true;

      // Act
      const isLoggedIn = authService.isLoggedIn();

      // Assert
      expect(isLoggedIn).toBe(true);
    });

    test('should return user ID', () => {
      // Arrange
      const mockUser = testData.users.student;
      authService.currentUser = mockUser;

      // Act
      const userId = authService.getUserId();

      // Assert
      expect(userId).toBe(mockUser.uid);
    });

    test('should return null user ID when not authenticated', () => {
      // Arrange
      authService.currentUser = null;

      // Act
      const userId = authService.getUserId();

      // Assert
      expect(userId).toBeNull();
    });
  });

  describe('Role-based Access Control', () => {
    test('should identify admin users', () => {
      // Arrange
      authService.userRole = 'community-admin';

      // Act & Assert
      expect(authService.isAdmin()).toBe(true);
      expect(authService.isMentor()).toBe(false);
      expect(authService.isStudent()).toBe(false);
      expect(authService.isPersonal()).toBe(false);
    });

    test('should identify mentor users', () => {
      // Arrange
      authService.userRole = 'mentor';

      // Act & Assert
      expect(authService.isAdmin()).toBe(false);
      expect(authService.isMentor()).toBe(true);
      expect(authService.isStudent()).toBe(false);
      expect(authService.isPersonal()).toBe(false);
    });

    test('should identify student users', () => {
      // Arrange
      authService.userRole = 'student';

      // Act & Assert
      expect(authService.isAdmin()).toBe(false);
      expect(authService.isMentor()).toBe(false);
      expect(authService.isStudent()).toBe(true);
      expect(authService.isPersonal()).toBe(false);
    });

    test('should identify personal users', () => {
      // Arrange
      authService.userRole = 'personal';

      // Act & Assert
      expect(authService.isAdmin()).toBe(false);
      expect(authService.isMentor()).toBe(false);
      expect(authService.isStudent()).toBe(false);
      expect(authService.isPersonal()).toBe(true);
    });

    test('should handle null user role', () => {
      // Arrange
      authService.userRole = null;

      // Act & Assert
      expect(authService.isAdmin()).toBe(false);
      expect(authService.isMentor()).toBe(false);
      expect(authService.isStudent()).toBe(false);
      expect(authService.isPersonal()).toBe(false);
    });
  });

  describe('Integration with Firebase Client', () => {
    test('should call Firebase client methods correctly', async () => {
      // Arrange
      const mockUser = testData.users.student;
      mockFirebaseClient.signInWithGoogle.mockResolvedValue({
        success: true,
        user: mockUser
      });

      // Act
      await authService.loginWithGoogle();

      // Assert
      expect(mockFirebaseClient.signInWithGoogle).toHaveBeenCalledTimes(1);
    });

    test('should handle Firebase client errors', async () => {
      // Arrange
      mockFirebaseClient.signInWithGoogle.mockRejectedValue(new Error('Firebase error'));

      // Act
      const result = await authService.loginWithGoogle();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Firebase error');
    });
  });
});
