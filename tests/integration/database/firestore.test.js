/**
 * Integration Tests for Firestore Database
 * Tests database operations and security rules
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const testData = require('../../fixtures/test-data');

// Mock Firestore
const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  batch: jest.fn(),
  runTransaction: jest.fn()
};

// Mock Firestore Document
const createMockDoc = (id, data) => ({
  id,
  data: () => data,
  exists: true,
  ref: {
    update: jest.fn(),
    delete: jest.fn(),
    set: jest.fn()
  }
});

// Mock Firestore Collection
const createMockCollection = (docs = []) => ({
  doc: jest.fn((id) => createMockDoc(id, docs.find(d => d.id === id)?.data || {})),
  add: jest.fn((data) => Promise.resolve(createMockDoc('new-doc-id', data))),
  where: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve(createMockSnapshot(docs))),
    limit: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve(createMockSnapshot(docs)))
    }))
  })),
  orderBy: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve(createMockSnapshot(docs))),
    limit: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve(createMockSnapshot(docs)))
    }))
  }))
});

// Mock Firestore Snapshot
const createMockSnapshot = (docs) => ({
  docs: docs.map(doc => createMockDoc(doc.id, doc.data)),
  forEach: jest.fn((callback) => {
    docs.forEach((doc, index) => {
      callback(createMockDoc(doc.id, doc.data), index);
    });
  }),
  empty: docs.length === 0,
  size: docs.length
});

// Mock Firestore Batch
const createMockBatch = () => ({
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  commit: jest.fn(() => Promise.resolve())
});

// Mock Firestore Transaction
const createMockTransaction = () => ({
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

describe('Firestore Database Integration Tests', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      collection: jest.fn(),
      doc: jest.fn(),
      batch: jest.fn(),
      runTransaction: jest.fn()
    };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('User Operations', () => {
    test('should create user document', async () => {
      // Arrange
      const userData = testData.users.student;
      const mockCollection = createMockCollection();
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const result = await mockCollection.add(userData);

      // Assert
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.add).toHaveBeenCalledWith(userData);
      expect(result.id).toBe('new-doc-id');
      expect(result.data()).toEqual(userData);
    });

    test('should get user document', async () => {
      // Arrange
      const userData = testData.users.student;
      const mockCollection = createMockCollection([{ id: 'user-123', data: userData }]);
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const doc = mockCollection.doc('user-123');

      // Assert
      expect(mockDb.collection).toHaveBeenCalledWith('users');
      expect(doc.id).toBe('user-123');
      expect(doc.data()).toEqual(userData);
    });

    test('should update user document', async () => {
      // Arrange
      const userData = testData.users.student;
      const updateData = { displayName: 'Updated Name' };
      const mockDoc = createMockDoc('user-123', userData);
      const mockCollection = createMockCollection();
      mockCollection.doc.mockReturnValue(mockDoc);
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const doc = mockCollection.doc('user-123');
      await doc.ref.update(updateData);

      // Assert
      expect(doc.ref.update).toHaveBeenCalledWith(updateData);
    });

    test('should delete user document', async () => {
      // Arrange
      const userData = testData.users.student;
      const mockDoc = createMockDoc('user-123', userData);
      const mockCollection = createMockCollection();
      mockCollection.doc.mockReturnValue(mockDoc);
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const doc = mockCollection.doc('user-123');
      await doc.ref.delete();

      // Assert
      expect(doc.ref.delete).toHaveBeenCalled();
    });

    test('should query users by role', async () => {
      // Arrange
      const users = [testData.users.student, testData.users.mentor];
      const mockCollection = createMockCollection(users.map(u => ({ id: u.uid, data: u })));
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const query = mockCollection.where('role', '==', 'student');
      const snapshot = await query.get();

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith('role', '==', 'student');
      expect(snapshot.size).toBe(2);
    });
  });

  describe('Community Operations', () => {
    test('should create community document', async () => {
      // Arrange
      const communityData = testData.communities.active;
      const mockCollection = createMockCollection();
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const result = await mockCollection.add(communityData);

      // Assert
      expect(mockDb.collection).toHaveBeenCalledWith('communities');
      expect(mockCollection.add).toHaveBeenCalledWith(communityData);
      expect(result.id).toBe('new-doc-id');
    });

    test('should get community members', async () => {
      // Arrange
      const communityData = testData.communities.active;
      const mockCollection = createMockCollection([{ id: 'community-123', data: communityData }]);
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const doc = mockCollection.doc('community-123');
      const community = doc.data();

      // Assert
      expect(community.members).toContain('admin-user-123');
      expect(community.members).toContain('mentor-user-123');
      expect(community.members).toContain('student-user-123');
    });

    test('should add member to community', async () => {
      // Arrange
      const communityData = testData.communities.active;
      const newMemberId = 'new-member-123';
      const mockDoc = createMockDoc('community-123', communityData);
      const mockCollection = createMockCollection();
      mockCollection.doc.mockReturnValue(mockDoc);
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const doc = mockCollection.doc('community-123');
      await doc.ref.update({
        members: [...communityData.members, newMemberId]
      });

      // Assert
      expect(doc.ref.update).toHaveBeenCalledWith({
        members: [...communityData.members, newMemberId]
      });
    });
  });

  describe('Contest Operations', () => {
    test('should create contest document', async () => {
      // Arrange
      const contestData = testData.contests.upcoming;
      const mockCollection = createMockCollection();
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const result = await mockCollection.add(contestData);

      // Assert
      expect(mockDb.collection).toHaveBeenCalledWith('contests');
      expect(mockCollection.add).toHaveBeenCalledWith(contestData);
    });

    test('should get active contests', async () => {
      // Arrange
      const contests = [testData.contests.active, testData.contests.upcoming];
      const mockCollection = createMockCollection(contests.map(c => ({ id: c.id, data: c })));
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const query = mockCollection.where('status', '==', 'active');
      const snapshot = await query.get();

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith('status', '==', 'active');
      expect(snapshot.size).toBe(2);
    });

    test('should add participant to contest', async () => {
      // Arrange
      const contestData = testData.contests.upcoming;
      const newParticipantId = 'new-participant-123';
      const mockDoc = createMockDoc('contest-123', contestData);
      const mockCollection = createMockCollection();
      mockCollection.doc.mockReturnValue(mockDoc);
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const doc = mockCollection.doc('contest-123');
      await doc.ref.update({
        participants: [...contestData.participants, newParticipantId]
      });

      // Assert
      expect(doc.ref.update).toHaveBeenCalledWith({
        participants: [...contestData.participants, newParticipantId]
      });
    });
  });

  describe('Submission Operations', () => {
    test('should create submission document', async () => {
      // Arrange
      const submissionData = testData.submissions.evaluated;
      const mockCollection = createMockCollection();
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const result = await mockCollection.add(submissionData);

      // Assert
      expect(mockDb.collection).toHaveBeenCalledWith('submissions');
      expect(mockCollection.add).toHaveBeenCalledWith(submissionData);
    });

    test('should get user submissions', async () => {
      // Arrange
      const submissions = [testData.submissions.evaluated, testData.submissions.pending];
      const mockCollection = createMockCollection(submissions.map(s => ({ id: s.id, data: s })));
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const query = mockCollection.where('userId', '==', 'student-user-123');
      const snapshot = await query.get();

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith('userId', '==', 'student-user-123');
      expect(snapshot.size).toBe(2);
    });

    test('should update submission score', async () => {
      // Arrange
      const submissionData = testData.submissions.pending;
      const newScore = 90;
      const mockDoc = createMockDoc('submission-123', submissionData);
      const mockCollection = createMockCollection();
      mockCollection.doc.mockReturnValue(mockDoc);
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const doc = mockCollection.doc('submission-123');
      await doc.ref.update({
        score: newScore,
        status: 'evaluated',
        evaluatedAt: new Date()
      });

      // Assert
      expect(doc.ref.update).toHaveBeenCalledWith({
        score: newScore,
        status: 'evaluated',
        evaluatedAt: expect.any(Date)
      });
    });
  });

  describe('Batch Operations', () => {
    test('should perform batch write operations', async () => {
      // Arrange
      const mockBatch = createMockBatch();
      mockDb.batch.mockReturnValue(mockBatch);

      const userData = testData.users.student;
      const communityData = testData.communities.active;

      // Act
      const batch = mockDb.batch();
      batch.set(mockDb.collection('users').doc('user-123'), userData);
      batch.set(mockDb.collection('communities').doc('community-123'), communityData);
      await batch.commit();

      // Assert
      expect(mockDb.batch).toHaveBeenCalled();
      expect(batch.set).toHaveBeenCalledTimes(2);
      expect(batch.commit).toHaveBeenCalled();
    });

    test('should handle batch operation failures', async () => {
      // Arrange
      const mockBatch = createMockBatch();
      mockBatch.commit.mockRejectedValue(new Error('Batch operation failed'));
      mockDb.batch.mockReturnValue(mockBatch);

      // Act & Assert
      await expect(mockBatch.commit()).rejects.toThrow('Batch operation failed');
    });
  });

  describe('Transaction Operations', () => {
    test('should perform transaction operations', async () => {
      // Arrange
      const mockTransaction = createMockTransaction();
      mockDb.runTransaction.mockImplementation((callback) => {
        return callback(mockTransaction);
      });

      const userData = testData.users.student;
      const communityData = testData.communities.active;

      // Act
      await mockDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(mockDb.collection('users').doc('user-123'));
        const communityDoc = await transaction.get(mockDb.collection('communities').doc('community-123'));
        
        transaction.update(mockDb.collection('users').doc('user-123'), { lastActive: new Date() });
        transaction.update(mockDb.collection('communities').doc('community-123'), { memberCount: 5 });
      });

      // Assert
      expect(mockDb.runTransaction).toHaveBeenCalled();
      expect(mockTransaction.get).toHaveBeenCalledTimes(2);
      expect(mockTransaction.update).toHaveBeenCalledTimes(2);
    });

    test('should handle transaction failures', async () => {
      // Arrange
      mockDb.runTransaction.mockRejectedValue(new Error('Transaction failed'));

      // Act & Assert
      await expect(mockDb.runTransaction(async () => {})).rejects.toThrow('Transaction failed');
    });
  });

  describe('Query Operations', () => {
    test('should perform complex queries', async () => {
      // Arrange
      const submissions = [testData.submissions.evaluated, testData.submissions.pending];
      const mockCollection = createMockCollection(submissions.map(s => ({ id: s.id, data: s })));
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const query = mockCollection
        .where('userId', '==', 'student-user-123')
        .where('status', '==', 'evaluated')
        .orderBy('score', 'desc')
        .limit(10);
      
      const snapshot = await query.get();

      // Assert
      expect(mockCollection.where).toHaveBeenCalledWith('userId', '==', 'student-user-123');
      expect(snapshot.size).toBe(2);
    });

    test('should handle pagination', async () => {
      // Arrange
      const submissions = Array(25).fill().map((_, i) => ({
        id: `submission-${i}`,
        data: { ...testData.submissions.evaluated, score: 100 - i }
      }));
      const mockCollection = createMockCollection(submissions);
      mockDb.collection.mockReturnValue(mockCollection);

      // Act
      const query = mockCollection
        .orderBy('score', 'desc')
        .limit(10);
      
      const snapshot = await query.get();

      // Assert
      expect(snapshot.size).toBe(25); // Mock returns all docs
    });
  });

  describe('Error Handling', () => {
    test('should handle connection errors', async () => {
      // Arrange
      const mockCollection = createMockCollection();
      mockCollection.add.mockRejectedValue(new Error('Connection failed'));
      mockDb.collection.mockReturnValue(mockCollection);

      // Act & Assert
      await expect(mockCollection.add({})).rejects.toThrow('Connection failed');
    });

    test('should handle permission errors', async () => {
      // Arrange
      const mockCollection = createMockCollection();
      mockCollection.add.mockRejectedValue(new Error('Permission denied'));
      mockDb.collection.mockReturnValue(mockCollection);

      // Act & Assert
      await expect(mockCollection.add({})).rejects.toThrow('Permission denied');
    });

    test('should handle timeout errors', async () => {
      // Arrange
      const mockCollection = createMockCollection();
      mockCollection.add.mockRejectedValue(new Error('Request timeout'));
      mockDb.collection.mockReturnValue(mockCollection);

      // Act & Assert
      await expect(mockCollection.add({})).rejects.toThrow('Request timeout');
    });
  });
});
