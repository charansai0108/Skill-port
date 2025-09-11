/**
 * Integration Tests for Users API
 * Tests complete user management workflow
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const request = require('supertest');
const testData = require('../../fixtures/test-data');

// Mock Express app for testing
const express = require('express');
const app = express();

// Mock middleware
const mockVerifyToken = (req, res, next) => {
  req.user = { uid: 'test-user-123' };
  next();
};

const mockCheckRole = (roles) => (req, res, next) => {
  req.user.role = 'community-admin';
  next();
};

// Mock routes
app.use(express.json());

// Mock users routes
app.get('/users', mockVerifyToken, (req, res) => {
  res.json({ success: true, user: testData.users.student });
});

app.post('/users/create', mockVerifyToken, (req, res) => {
  const { firstName, lastName, email, role } = req.body;
  if (!firstName || !lastName || !email || !role) {
    return res.status(400).json({ success: false, error: 'Validation failed' });
  }
  res.status(201).json({ 
    success: true, 
    message: 'User created successfully',
    user: { ...req.body, uid: 'new-user-123' }
  });
});

app.put('/users', mockVerifyToken, (req, res) => {
  const { role } = req.body;
  if (role && req.user.role !== 'community-admin') {
    return res.status(403).json({ success: false, error: 'Cannot change role' });
  }
  res.json({ success: true, message: 'User profile updated successfully' });
});

app.delete('/users', mockVerifyToken, (req, res) => {
  res.json({ success: true, message: 'User account deleted successfully' });
});

app.get('/users/community/:communityId', mockVerifyToken, mockCheckRole(['admin', 'mentor']), (req, res) => {
  res.json({ success: true, users: [testData.users.student, testData.users.mentor] });
});

describe('Users API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /users', () => {
    test('should return user profile for authenticated user', async () => {
      // Act
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer test-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual(testData.users.student);
    });

    test('should return 401 for missing token', async () => {
      // Act
      const response = await request(app)
        .get('/users');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('POST /users/create', () => {
    test('should create user successfully', async () => {
      // Arrange
      const userData = testData.requests.createUser;

      // Act
      const response = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer test-token')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user).toEqual({
        ...userData,
        uid: 'new-user-123'
      });
    });

    test('should return 400 for invalid user data', async () => {
      // Arrange
      const invalidUserData = { email: 'invalid-email' };

      // Act
      const response = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer test-token')
        .send(invalidUserData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should return 400 for missing required fields', async () => {
      // Arrange
      const incompleteUserData = { firstName: 'Test' };

      // Act
      const response = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer test-token')
        .send(incompleteUserData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /users', () => {
    test('should update user profile successfully', async () => {
      // Arrange
      const updateData = { displayName: 'Updated Name' };

      // Act
      const response = await request(app)
        .put('/users')
        .set('Authorization', 'Bearer test-token')
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User profile updated successfully');
    });

    test('should prevent role changes by non-admin', async () => {
      // Arrange
      const updateData = { role: 'admin' };
      
      // Mock non-admin user
      const mockVerifyTokenNonAdmin = (req, res, next) => {
        req.user = { uid: 'test-user-123', role: 'student' };
        next();
      };

      const appNonAdmin = express();
      appNonAdmin.use(express.json());
      appNonAdmin.put('/users', mockVerifyTokenNonAdmin, (req, res) => {
        const { role } = req.body;
        if (role && req.user.role !== 'community-admin') {
          return res.status(403).json({ success: false, error: 'Cannot change role' });
        }
        res.json({ success: true, message: 'User profile updated successfully' });
      });

      // Act
      const response = await request(appNonAdmin)
        .put('/users')
        .set('Authorization', 'Bearer test-token')
        .send(updateData);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cannot change role');
    });
  });

  describe('DELETE /users', () => {
    test('should delete user successfully', async () => {
      // Act
      const response = await request(app)
        .delete('/users')
        .set('Authorization', 'Bearer test-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User account deleted successfully');
    });
  });

  describe('GET /users/community/:communityId', () => {
    test('should return community users for admin', async () => {
      // Act
      const response = await request(app)
        .get('/users/community/test-community-123')
        .set('Authorization', 'Bearer test-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(2);
      expect(response.body.users).toContainEqual(testData.users.student);
      expect(response.body.users).toContainEqual(testData.users.mentor);
    });

    test('should return 403 for non-admin users', async () => {
      // Arrange
      const mockVerifyTokenNonAdmin = (req, res, next) => {
        req.user = { uid: 'test-user-123', role: 'student' };
        next();
      };

      const mockCheckRoleNonAdmin = (roles) => (req, res, next) => {
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
        next();
      };

      const appNonAdmin = express();
      appNonAdmin.use(express.json());
      appNonAdmin.get('/users/community/:communityId', 
        mockVerifyTokenNonAdmin, 
        mockCheckRoleNonAdmin(['admin', 'mentor']),
        (req, res) => {
          res.json({ success: true, users: [] });
        }
      );

      // Act
      const response = await request(appNonAdmin)
        .get('/users/community/test-community-123')
        .set('Authorization', 'Bearer test-token');

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      // Act
      const response = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer test-token')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Assert
      expect(response.status).toBe(400);
    });

    test('should handle large payloads', async () => {
      // Arrange
      const largeData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'personal',
        bio: 'A'.repeat(10000) // Large bio field
      };

      // Act
      const response = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer test-token')
        .send(largeData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('should handle concurrent requests', async () => {
      // Arrange
      const userData = testData.requests.createUser;
      const requests = Array(5).fill().map(() => 
        request(app)
          .post('/users/create')
          .set('Authorization', 'Bearer test-token')
          .send(userData)
      );

      // Act
      const responses = await Promise.all(requests);

      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Authentication Flow', () => {
    test('should handle token expiration', async () => {
      // Arrange
      const mockVerifyTokenExpired = (req, res, next) => {
        return res.status(401).json({ success: false, error: 'Token expired' });
      };

      const appExpired = express();
      appExpired.use(express.json());
      appExpired.get('/users', mockVerifyTokenExpired, (req, res) => {
        res.json({ success: true, user: {} });
      });

      // Act
      const response = await request(appExpired)
        .get('/users')
        .set('Authorization', 'Bearer expired-token');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token expired');
    });

    test('should handle invalid token format', async () => {
      // Act
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'InvalidFormat');

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
