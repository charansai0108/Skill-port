const request = require('supertest');
const app = require('../backend/server');
const User = require('../backend/models/User');

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    // Clean up test data
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a personal user', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'personal',
        experience: 'intermediate'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should register a community admin', async () => {
      const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'community-admin',
        communityName: 'Test Community',
        communityCode: 'TEST123'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(adminData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return user with valid token', async () => {
      // Create user
      const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'personal',
        experience: 'intermediate',
        status: 'active',
        isEmailVerified: true
      });

      // Mock JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `accessToken=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token', async () => {
      const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'personal',
        experience: 'intermediate',
        status: 'active',
        isEmailVerified: true
      });

      const jwt = require('jsonwebtoken');
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});
