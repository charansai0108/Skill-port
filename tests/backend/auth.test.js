const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend/server');
const User = require('../../backend/models/User');
const Community = require('../../backend/models/Community');

describe('Authentication API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillport-test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Community.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await Community.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a personal user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'personal',
        experience: 'intermediate'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('john@example.com');
      expect(response.body.data.role).toBe('personal');
    });

    it('should register a community admin successfully', async () => {
      const adminData = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'community-admin',
        communityName: 'Test Community',
        communityCode: 'TEST123'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(adminData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('community-admin');
      expect(response.body.data.community).toBeDefined();
    });

    it('should reject registration with existing email', async () => {
      // First registration
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'personal',
        experience: 'intermediate'
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        firstName: 'J',
        email: 'invalid-email',
        role: 'invalid-role'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'personal',
        experience: 'intermediate',
        status: 'active',
        isEmailVerified: true
      });
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.user.email).toBe('john@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let user;
    let token;

    beforeEach(async () => {
      // Create a test user
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'personal',
        experience: 'intermediate',
        status: 'active',
        isEmailVerified: true
      });
      await user.save();

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      token = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `accessToken=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.user.email).toBe('john@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let user;
    let refreshToken;

    beforeEach(async () => {
      // Create a test user
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'personal',
        experience: 'intermediate',
        status: 'active',
        isEmailVerified: true
      });
      await user.save();

      // Login to get refresh token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      refreshToken = loginResponse.headers['set-cookie'][1].split(';')[0].split('=')[1];
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', 'refreshToken=invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });
});
