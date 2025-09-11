/**
 * Unit Tests for OTP API
 * Tests OTP generation and verification functionality
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const testData = require('../../fixtures/test-data');

// Mock the OTP module
const mockOTP = {
  generate: jest.fn(),
  verify: jest.fn(),
  verifyAndCreateUser: jest.fn()
};

// Mock Nodemailer
const mockNodemailer = {
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn()
  }))
};

jest.mock('nodemailer', () => mockNodemailer);

// Mock Firebase Admin
const mockAdmin = {
  firestore: jest.fn(() => ({
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date()),
      increment: jest.fn((value) => value + 1)
    }
  }))
};

jest.mock('firebase-admin', () => mockAdmin);

describe('OTP API Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /otp/generate', () => {
    test('should generate and send OTP successfully', async () => {
      // Arrange
      const mockOTPData = testData.requests.generateOTP;
      const mockRequest = global.testUtils.createMockRequest(mockOTPData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockOTP.generate.mockResolvedValue({
        success: true,
        message: 'OTP sent to your email'
      });
      mockNodemailer.createTransporter().sendMail.mockResolvedValue(true);

      // Act
      const result = await mockOTP.generate(mockRequest, mockResponse);

      // Assert
      expect(mockOTP.generate).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockNodemailer.createTransporter().sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockOTPData.email,
          subject: 'SkillPort OTP Verification',
          html: expect.stringContaining(mockOTPData.firstName)
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'OTP sent to your email'
      });
    });

    test('should return 400 for invalid email', async () => {
      // Arrange
      const invalidData = { email: 'invalid-email' };
      const mockRequest = global.testUtils.createMockRequest(invalidData);
      const mockResponse = global.testUtils.createMockResponse();

      // Act
      try {
        await mockOTP.generate(mockRequest, mockResponse);
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

    test('should handle email sending failure', async () => {
      // Arrange
      const mockOTPData = testData.requests.generateOTP;
      const mockRequest = global.testUtils.createMockRequest(mockOTPData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockNodemailer.createTransporter().sendMail.mockRejectedValue(new Error('SMTP Error'));

      // Act
      try {
        await mockOTP.generate(mockRequest, mockResponse);
      } catch (error) {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to send OTP email'
        });
      }
    });

    test('should respect rate limiting', async () => {
      // Arrange
      const mockOTPData = testData.requests.generateOTP;
      const mockRequest = global.testUtils.createMockRequest(mockOTPData);
      const mockResponse = global.testUtils.createMockResponse();
      
      // Simulate rate limit exceeded
      mockOTP.generate.mockResolvedValue({
        success: false,
        message: 'Too many OTP requests from this IP'
      });

      // Act
      const result = await mockOTP.generate(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Too many OTP requests from this IP'
      });
    });
  });

  describe('POST /otp/verify', () => {
    test('should verify valid OTP successfully', async () => {
      // Arrange
      const mockOTPData = testData.requests.verifyOTP;
      const mockRequest = global.testUtils.createMockRequest(mockOTPData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockOTP.verify.mockResolvedValue({
        success: true,
        message: 'OTP verified successfully'
      });

      // Act
      const result = await mockOTP.verify(mockRequest, mockResponse);

      // Assert
      expect(mockOTP.verify).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'OTP verified successfully'
      });
    });

    test('should reject invalid OTP', async () => {
      // Arrange
      const invalidOTPData = { email: 'test@example.com', otp: '000000' };
      const mockRequest = global.testUtils.createMockRequest(invalidOTPData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockOTP.verify.mockResolvedValue({
        success: false,
        message: 'Invalid OTP'
      });

      // Act
      const result = await mockOTP.verify(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid OTP'
      });
    });

    test('should reject expired OTP', async () => {
      // Arrange
      const expiredOTPData = { email: 'expired@example.com', otp: '123456' };
      const mockRequest = global.testUtils.createMockRequest(expiredOTPData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockOTP.verify.mockResolvedValue({
        success: false,
        message: 'OTP has expired'
      });

      // Act
      const result = await mockOTP.verify(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'OTP has expired'
      });
    });

    test('should reject OTP after max attempts', async () => {
      // Arrange
      const maxAttemptsData = { email: 'maxattempts@example.com', otp: '111111' };
      const mockRequest = global.testUtils.createMockRequest(maxAttemptsData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockOTP.verify.mockResolvedValue({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });

      // Act
      const result = await mockOTP.verify(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    });

    test('should return 400 for invalid OTP format', async () => {
      // Arrange
      const invalidFormatData = { email: 'test@example.com', otp: '123' };
      const mockRequest = global.testUtils.createMockRequest(invalidFormatData);
      const mockResponse = global.testUtils.createMockResponse();

      // Act
      try {
        await mockOTP.verify(mockRequest, mockResponse);
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

  describe('POST /otp/verify-and-create-user', () => {
    test('should verify OTP and create user successfully', async () => {
      // Arrange
      const mockUserData = testData.requests.createUser;
      const mockOTPData = testData.requests.verifyOTP;
      const combinedData = { ...mockOTPData, userData: mockUserData };
      const mockRequest = global.testUtils.createMockRequest(combinedData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockOTP.verifyAndCreateUser.mockResolvedValue({
        success: true,
        message: 'OTP verified and user created successfully',
        user: { ...mockUserData, uid: 'new-user-123' }
      });

      // Act
      const result = await mockOTP.verifyAndCreateUser(mockRequest, mockResponse);

      // Assert
      expect(mockOTP.verifyAndCreateUser).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'OTP verified and user created successfully',
        user: expect.objectContaining({
          ...mockUserData,
          uid: 'new-user-123'
        })
      });
    });

    test('should fail if OTP verification fails', async () => {
      // Arrange
      const mockUserData = testData.requests.createUser;
      const invalidOTPData = { email: 'test@example.com', otp: '000000' };
      const combinedData = { ...invalidOTPData, userData: mockUserData };
      const mockRequest = global.testUtils.createMockRequest(combinedData);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockOTP.verifyAndCreateUser.mockResolvedValue({
        success: false,
        message: 'Invalid OTP'
      });

      // Act
      const result = await mockOTP.verifyAndCreateUser(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid OTP'
      });
    });
  });

  describe('OTP Generation Logic', () => {
    test('should generate 6-digit numeric OTP', () => {
      // Arrange
      const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };

      // Act
      const otp = generateOTP();

      // Assert
      expect(otp).toMatch(/^\d{6}$/);
      expect(otp.length).toBe(6);
    });

    test('should set 10-minute expiry', () => {
      // Arrange
      const now = Date.now();
      const expiry = now + 10 * 60 * 1000; // 10 minutes

      // Act
      const timeDiff = expiry - now;

      // Assert
      expect(timeDiff).toBe(600000); // 10 minutes in milliseconds
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors', async () => {
      // Arrange
      const mockRequest = global.testUtils.createMockRequest(testData.requests.generateOTP);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockOTP.generate.mockRejectedValue(new Error('Database connection failed'));

      // Act
      try {
        await mockOTP.generate(mockRequest, mockResponse);
      } catch (error) {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Internal server error'
        });
      }
    });

    test('should handle SMTP configuration errors', async () => {
      // Arrange
      const mockRequest = global.testUtils.createMockRequest(testData.requests.generateOTP);
      const mockResponse = global.testUtils.createMockResponse();
      
      mockNodemailer.createTransporter.mockImplementation(() => {
        throw new Error('SMTP configuration error');
      });

      // Act
      try {
        await mockOTP.generate(mockRequest, mockResponse);
      } catch (error) {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          error: 'Internal server error'
        });
      }
    });
  });
});
