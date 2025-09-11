/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Jest setup file - no need to import jest here

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
    applicationDefault: jest.fn()
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn(),
        limit: jest.fn(() => ({
          get: jest.fn()
        }))
      })),
      orderBy: jest.fn(() => ({
        get: jest.fn(),
        limit: jest.fn(() => ({
          get: jest.fn()
        }))
      }))
    }))
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn()
  })),
  storage: jest.fn(() => ({
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        delete: jest.fn(),
        getSignedUrl: jest.fn()
      }))
    }))
  }))
}));

// Mock Firebase Functions
jest.mock('firebase-functions', () => ({
  https: {
    onRequest: jest.fn((handler) => handler),
    onCall: jest.fn((handler) => handler)
  },
  pubsub: {
    schedule: jest.fn(() => ({
      timeZone: jest.fn(() => ({
        onRun: jest.fn((handler) => handler)
      }))
    }))
  },
  auth: {
    user: jest.fn(() => ({
      onCreate: jest.fn((handler) => handler),
      onDelete: jest.fn((handler) => handler)
    }))
  },
  firestore: {
    document: jest.fn(() => ({
      onCreate: jest.fn((handler) => handler),
      onUpdate: jest.fn((handler) => handler),
      onDelete: jest.fn((handler) => handler)
    }))
  }
}));

// Mock Express
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn()
  };
  return jest.fn(() => mockApp);
});

// Mock Nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn()
  }))
}));

// Global test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    role: 'personal',
    community: 'test-community-123'
  },

  // Mock community data
  mockCommunity: {
    id: 'test-community-123',
    name: 'Test Community',
    code: 'TEST001',
    description: 'A test community',
    admin: 'test-user-123',
    members: ['test-user-123'],
    mentors: [],
    students: []
  },

  // Mock contest data
  mockContest: {
    id: 'test-contest-123',
    title: 'Test Contest',
    description: 'A test contest',
    community: 'test-community-123',
    createdBy: 'test-user-123',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    status: 'upcoming',
    participants: ['test-user-123']
  },

  // Mock submission data
  mockSubmission: {
    id: 'test-submission-123',
    userId: 'test-user-123',
    contestId: 'test-contest-123',
    title: 'Test Submission',
    description: 'A test submission',
    code: 'console.log("Hello World");',
    language: 'javascript',
    platform: 'leetcode',
    difficulty: 'easy',
    score: 85,
    status: 'evaluated'
  },

  // Mock OTP data
  mockOTP: {
    email: 'test@example.com',
    code: '123456',
    expiry: Date.now() + 600000, // 10 minutes
    attempts: 0
  },

  // Mock notification data
  mockNotification: {
    id: 'test-notification-123',
    userId: 'test-user-123',
    type: 'welcome',
    title: 'Welcome to SkillPort!',
    message: 'Welcome to our platform',
    read: false
  },

  // Helper functions
  createMockRequest: (data = {}) => ({
    body: data,
    headers: {
      authorization: 'Bearer test-token'
    },
    user: global.testUtils.mockUser,
    ...data
  }),

  createMockResponse: () => {
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      send: jest.fn(() => res)
    };
    return res;
  },

  createMockFirestoreDoc: (data) => ({
    id: 'test-doc-id',
    data: () => data,
    exists: true,
    ref: {
      update: jest.fn(),
      delete: jest.fn()
    }
  }),

  createMockFirestoreSnapshot: (docs) => ({
    docs: docs.map(doc => global.testUtils.createMockFirestoreDoc(doc)),
    forEach: jest.fn((callback) => {
      docs.forEach((doc, index) => {
        callback(global.testUtils.createMockFirestoreDoc(doc), index);
      });
    }),
    empty: docs.length === 0,
    size: docs.length
  }),

  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock timers
  mockTimers: () => {
    jest.useFakeTimers();
  },

  restoreTimers: () => {
    jest.useRealTimers();
  }
};

// Set test timeout
jest.setTimeout(30000);

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global teardown
afterAll(() => {
  jest.restoreAllMocks();
});
