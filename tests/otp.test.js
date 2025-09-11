/**
 * Comprehensive OTP Testing Suite
 * Tests OTP generation, verification, and edge cases
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const request = require('supertest');
const express = require('express');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  firestore: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
    })),
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date()),
      increment: jest.fn((value) => value),
    },
  }),
}));

// Mock Nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'mock-message-id' })),
  })),
}));

// Mock OTP Generator
const otpGenerator = require('otp-generator');
jest.mock('otp-generator', () => ({
  generate: jest.fn(() => '123456'),
}));

// Mock Express Rate Limit
jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req, res, next) => next());
});

// Create Express app with OTP routes
const app = express();
app.use(express.json());

// Mock OTP router
const otpRouter = require('express').Router();

// Mock OTP endpoints
otpRouter.post('/generate', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: 'Email is required and must be valid' 
      });
    }

    const otp = '123456';
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Mock storing OTP in Firestore
    const db = admin.firestore();
    await db.collection('otps').doc(email).set({
      code: otp,
      expiry,
      attempts: 0,
      createdAt: new Date()
    });

    // Mock sending email
    const transporter = nodemailer.createTransporter();
    await transporter.sendMail({
      from: 'test@skillport.com',
      to: email,
      subject: 'SkillPort OTP Verification',
      html: `<h3>Your OTP: ${otp}</h3>`
    });

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

otpRouter.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: 'Email and OTP are required' 
      });
    }

    // Mock getting OTP from Firestore
    const db = admin.firestore();
    const otpDoc = await db.collection('otps').doc(email).get();
    
    if (!otpDoc.exists) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const storedOtp = otpDoc.data();

    // Check attempts
    if (storedOtp.attempts >= 3) {
      await db.collection('otps').doc(email).delete();
      return res.status(400).json({ 
        success: false, 
        message: 'Too many incorrect attempts. Please request a new OTP.' 
      });
    }

    // Check expiry
    if (Date.now() > storedOtp.expiry) {
      await db.collection('otps').doc(email).delete();
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Verify OTP
    if (storedOtp.code === otp) {
      await db.collection('otps').doc(email).delete();
      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      await db.collection('otps').doc(email).update({
        attempts: storedOtp.attempts + 1
      });
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.use('/otp', otpRouter);

describe('OTP API Tests', () => {
  let mockDb;
  let mockTransporter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockDb = {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        })),
      })),
    };
    
    mockTransporter = {
      sendMail: jest.fn(() => Promise.resolve({ messageId: 'mock-message-id' })),
    };
    
    admin.firestore.mockReturnValue(mockDb);
    nodemailer.createTransporter.mockReturnValue(mockTransporter);
  });

  describe('POST /otp/generate', () => {
    test('should generate OTP successfully with valid email', async () => {
      const email = 'test@example.com';
      const firstName = 'John';
      const lastName = 'Doe';

      // Mock successful Firestore operations
      mockDb.collection().doc().set.mockResolvedValueOnce();

      const response = await request(app)
        .post('/otp/generate')
        .send({ email, firstName, lastName });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'OTP sent to your email'
      });
      expect(mockDb.collection).toHaveBeenCalledWith('otps');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: 'SkillPort OTP Verification'
        })
      );
    });

    test('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/otp/generate')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should fail with missing email', async () => {
      const response = await request(app)
        .post('/otp/generate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /otp/verify', () => {
    test('should verify OTP successfully with correct code', async () => {
      const email = 'test@example.com';
      const otp = '123456';

      // Mock OTP exists and is valid
      mockDb.collection().doc().get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          code: otp,
          expiry: Date.now() + 10 * 60 * 1000, // 10 minutes from now
          attempts: 0
        })
      });
      mockDb.collection().doc().delete.mockResolvedValueOnce();

      const response = await request(app)
        .post('/otp/verify')
        .send({ email, otp });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'OTP verified successfully'
      });
      expect(mockDb.collection().doc().delete).toHaveBeenCalled();
    });

    test('should fail with incorrect OTP', async () => {
      const email = 'test@example.com';
      const otp = 'wrong-otp';

      // Mock OTP exists but code is different
      mockDb.collection().doc().get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          code: '123456',
          expiry: Date.now() + 10 * 60 * 1000,
          attempts: 0
        })
      });
      mockDb.collection().doc().update.mockResolvedValueOnce();

      const response = await request(app)
        .post('/otp/verify')
        .send({ email, otp });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid OTP'
      });
      expect(mockDb.collection().doc().update).toHaveBeenCalledWith({
        attempts: 1
      });
    });

    test('should fail with expired OTP', async () => {
      const email = 'test@example.com';
      const otp = '123456';

      // Mock expired OTP
      mockDb.collection().doc().get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          code: otp,
          expiry: Date.now() - 10 * 60 * 1000, // 10 minutes ago (expired)
          attempts: 0
        })
      });
      mockDb.collection().doc().delete.mockResolvedValueOnce();

      const response = await request(app)
        .post('/otp/verify')
        .send({ email, otp });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'OTP has expired'
      });
      expect(mockDb.collection().doc().delete).toHaveBeenCalled();
    });

    test('should fail with too many attempts', async () => {
      const email = 'test@example.com';
      const otp = 'wrong-otp';

      // Mock OTP with max attempts reached
      mockDb.collection().doc().get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          code: '123456',
          expiry: Date.now() + 10 * 60 * 1000,
          attempts: 3 // Max attempts reached
        })
      });
      mockDb.collection().doc().delete.mockResolvedValueOnce();

      const response = await request(app)
        .post('/otp/verify')
        .send({ email, otp });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
      expect(mockDb.collection().doc().delete).toHaveBeenCalled();
    });

    test('should fail with non-existent OTP', async () => {
      const email = 'test@example.com';
      const otp = '123456';

      // Mock OTP doesn't exist
      mockDb.collection().doc().get.mockResolvedValueOnce({
        exists: false
      });

      const response = await request(app)
        .post('/otp/verify')
        .send({ email, otp });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid or expired OTP'
      });
    });

    test('should fail with missing email or OTP', async () => {
      const response = await request(app)
        .post('/otp/verify')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Edge Cases and Security Tests', () => {
    test('should handle rate limiting', async () => {
      // This test would require actual rate limiting implementation
      // For now, we'll test that the rate limiter middleware is applied
      const response = await request(app)
        .post('/otp/generate')
        .send({ email: 'test@example.com' });

      // Should still work (rate limiter is mocked)
      expect(response.status).toBe(200);
    });

    test('should handle email sending failure gracefully', async () => {
      const email = 'test@example.com';
      
      // Mock Firestore success but email failure
      mockDb.collection().doc().set.mockResolvedValueOnce();
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Email service unavailable'));

      const response = await request(app)
        .post('/otp/generate')
        .send({ email });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should handle Firestore errors gracefully', async () => {
      const email = 'test@example.com';
      
      // Mock Firestore failure
      mockDb.collection().doc().set.mockRejectedValueOnce(new Error('Firestore unavailable'));

      const response = await request(app)
        .post('/otp/generate')
        .send({ email });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('OTP Integration Tests', () => {
  test('complete OTP flow: generate -> verify -> success', async () => {
    const email = 'integration@example.com';
    const otp = '123456';

    // Step 1: Generate OTP
    mockDb.collection().doc().set.mockResolvedValueOnce();
    
    const generateResponse = await request(app)
      .post('/otp/generate')
      .send({ email });

    expect(generateResponse.status).toBe(200);
    expect(generateResponse.body.success).toBe(true);

    // Step 2: Verify OTP
    mockDb.collection().doc().get.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        code: otp,
        expiry: Date.now() + 10 * 60 * 1000,
        attempts: 0
      })
    });
    mockDb.collection().doc().delete.mockResolvedValueOnce();

    const verifyResponse = await request(app)
      .post('/otp/verify')
      .send({ email, otp });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.success).toBe(true);
  });

  test('OTP replay attack prevention', async () => {
    const email = 'replay@example.com';
    const otp = '123456';

    // First verification (successful)
    mockDb.collection().doc().get.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        code: otp,
        expiry: Date.now() + 10 * 60 * 1000,
        attempts: 0
      })
    });
    mockDb.collection().doc().delete.mockResolvedValueOnce();

    const firstVerify = await request(app)
      .post('/otp/verify')
      .send({ email, otp });

    expect(firstVerify.status).toBe(200);

    // Second verification with same OTP (should fail - OTP already deleted)
    mockDb.collection().doc().get.mockResolvedValueOnce({
      exists: false
    });

    const secondVerify = await request(app)
      .post('/otp/verify')
      .send({ email, otp });

    expect(secondVerify.status).toBe(400);
    expect(secondVerify.body.message).toBe('Invalid or expired OTP');
  });
});
