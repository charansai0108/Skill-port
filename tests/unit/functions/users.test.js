/**
 * Unit Tests for Users API
 * Tests user management functionality
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const testData = require('../../fixtures/test-data');

// Mock the users module
const mockUsers = {
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getCommunityUsers: jest.fn()
};

// Mock Firebase Admin
const mockAdmin = {
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    deleteUser: jest.fn()
  })),
  firestore: jest.fn(() => ({
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date())
    }
  }))
};

jest.mock('firebase-admin', () => mockAdmin);

describe('Users API Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /users', () => {
    test('should return user profile for authenticated user', async () => {
      // Arrange
      const mockUser = testData.users.student;
      const mockRequest = global.testUtils.createMockRequest();
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockResolvedValue({ uid: mockUser.uid });
      mockUsers.get.mockResolvedValue(mockUser);

      // Act
      const result = await mockUsers.get(mockRequest, mockResponse);

      // Assert
      expect(mockAdmin.auth().verifyIdToken).toHaveBeenCalledWith('test-token');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        user: mockUser
      });
    });

    test('should return 401 for missing token', async () => {
      // Arrange
      const mockRequest = { headers: {} };
      const mockResponse = global.testUtils.createMockResponse();

      // Act
      try {
        await mockUsers.get(mockRequest, mockResponse);
      } catch (error) {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'No token provided'
        });
      }
    });

    test('should return 404 for non-existent user', async () => {
      // Arrange
      const mockRequest = global.testUtils.createMockRequest();
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockResolvedValue({ uid: 'non-existent' });
      mockUsers.get.mockResolvedValue(null);

      // Act
      const result = await mockUsers.get(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });
  });

  describe('POST /users/create', () => {
    test('should create user successfully', async () => {
      // Arrange
      const mockUserData = testData.requests.createUser;
      const mockRequest = global.testUtils.createMockRequest(mockUserData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockResolvedValue({ uid: 'new-user-123' });
      mockUsers.create.mockResolvedValue({
        success: true,
        user: { ...mockUserData, uid: 'new-user-123' }
      });

      // Act
      const result = await mockUsers.create(mockRequest, mockResponse);

      // Assert
      expect(mockUsers.create).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        user: expect.objectContaining({
          ...mockUserData,
          uid: 'new-user-123'
        })
      });
    });

    test('should return 400 for invalid user data', async () => {
      // Arrange
      const invalidUserData = { email: 'invalid-email' };
      const mockRequest = global.testUtils.createMockRequest(invalidUserData);
      const mockResponse = global.testUtils.createMockResponse();

      // Act
      try {
        await mockUsers.create(mockRequest, mockResponse);
      } catch (error) {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Validation failed',
          details: expect.any(String)
        });
      }
    });
  });

  describe('PUT /users', () => {
    test('should update user profile successfully', async () => {
      // Arrange
      const mockUserData = testData.users.student;
      const updateData = { displayName: 'Updated Name' };
      const mockRequest = global.testUtils.createMockRequest(updateData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockResolvedValue({ uid: mockUserData.uid });
      mockUsers.update.mockResolvedValue({ success: true });

      // Act
      const result = await mockUsers.update(mockRequest, mockResponse);

      // Assert
      expect(mockUsers.update).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User profile updated successfully'
      });
    });

    test('should prevent role changes by non-admin', async () => {
      // Arrange
      const updateData = { role: 'admin' };
      const mockRequest = global.testUtils.createMockRequest(updateData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockResolvedValue({ uid: 'student-user-123' });

      // Act
      try {
        await mockUsers.update(mockRequest, mockResponse);
      } catch (error) {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Cannot change role'
        });
      }
    });
  });

  describe('DELETE /users', () => {
    test('should delete user successfully', async () => {
      // Arrange
      const mockUser = testData.users.student;
      const mockRequest = global.testUtils.createMockRequest();
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockResolvedValue({ uid: mockUser.uid });
      mockUsers.delete.mockResolvedValue({ success: true });

      // Act
      const result = await mockUsers.delete(mockRequest, mockResponse);

      // Assert
      expect(mockUsers.delete).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockAdmin.auth().deleteUser).toHaveBeenCalledWith(mockUser.uid);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User account deleted successfully'
      });
    });
  });

  describe('GET /users/community/:communityId', () => {
    test('should return community users for admin', async () => {
      // Arrange
      const mockCommunity = testData.communities.active;
      const mockUsers = [testData.users.student, testData.users.mentor];
      const mockRequest = global.testUtils.createMockRequest();
      mockRequest.params = { communityId: mockCommunity.id };
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockResolvedValue({ uid: 'admin-user-123' });
      mockUsers.getCommunityUsers.mockResolvedValue(mockUsers);

      // Act
      const result = await mockUsers.getCommunityUsers(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        users: mockUsers
      });
    });

    test('should return 403 for non-admin users', async () => {
      // Arrange
      const mockRequest = global.testUtils.createMockRequest();
      mockRequest.params = { communityId: 'test-community-123' };
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockResolvedValue({ uid: 'student-user-123' });

      // Act
      try {
        await mockUsers.getCommunityUsers(mockRequest, mockResponse);
      } catch (error) {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Insufficient permissions'
        });
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Arrange
      const mockRequest = global.testUtils.createMockRequest();
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockRejectedValue(new Error('Database error'));

      // Act
      try {
        await mockUsers.get(mockRequest, mockResponse);
      } catch (error) {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Internal server error'
        });
      }
    });

    test('should handle invalid token errors', async () => {
      // Arrange
      const mockRequest = global.testUtils.createMockRequest();
      const mockResponse = global.testUtils.createMockResponse();
      
      mockAdmin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      // Act
      try {
        await mockUsers.get(mockRequest, mockResponse);
      } catch (error) {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Invalid token'
        });
      }
    });
  });
});
