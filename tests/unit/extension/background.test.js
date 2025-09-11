/**
 * Unit Tests for Extension Background Script
 * Tests browser extension background functionality
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const testData = require('../../fixtures/test-data');

// Mock Chrome APIs
const mockChrome = {
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    onUpdated: {
      addListener: jest.fn()
    }
  },
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  }
};

global.chrome = mockChrome;

// Mock Extension Background Script
class MockExtensionBackground {
  constructor() {
    this.isEnabled = true;
    this.userId = null;
    this.apiEndpoint = 'http://localhost:5003/api/v1';
    this.setupMessageListeners();
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'SUBMISSION_DETECTED':
          await this.handleSubmissionDetected(message.data, sender);
          sendResponse({ success: true });
          break;
        case 'GET_USER_ID':
          sendResponse({ userId: this.userId });
          break;
        case 'SET_USER_ID':
          this.userId = message.userId;
          await this.saveUserId(message.userId);
          sendResponse({ success: true });
          break;
        case 'TOGGLE_EXTENSION':
          this.isEnabled = message.enabled;
          await this.saveExtensionState(message.enabled);
          sendResponse({ success: true });
          break;
        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleSubmissionDetected(submissionData, sender) {
    if (!this.isEnabled || !this.userId) {
      return;
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...submissionData,
          userId: this.userId,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Submission tracked successfully:', result);
    } catch (error) {
      console.error('Error tracking submission:', error);
    }
  }

  async saveUserId(userId) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ userId }, resolve);
    });
  }

  async loadUserId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userId'], (result) => {
        this.userId = result.userId || null;
        resolve(result.userId);
      });
    });
  }

  async saveExtensionState(enabled) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ extensionEnabled: enabled }, resolve);
    });
  }

  async loadExtensionState() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['extensionEnabled'], (result) => {
        this.isEnabled = result.extensionEnabled !== false;
        resolve(this.isEnabled);
      });
    });
  }

  async initialize() {
    await this.loadUserId();
    await this.loadExtensionState();
  }
}

describe('Extension Background Script Unit Tests', () => {
  let extensionBackground;

  beforeEach(() => {
    extensionBackground = new MockExtensionBackground();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Message Handling', () => {
    test('should handle SUBMISSION_DETECTED message', async () => {
      // Arrange
      const mockSubmission = testData.extension.leetcodeSubmission;
      const mockSender = { tab: { id: 1 } };
      const mockSendResponse = jest.fn();
      
      extensionBackground.userId = 'test-user-123';
      extensionBackground.isEnabled = true;

      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Act
      await extensionBackground.handleMessage(
        { type: 'SUBMISSION_DETECTED', data: mockSubmission },
        mockSender,
        mockSendResponse
      );

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5003/api/v1/submissions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test-user-123')
        })
      );
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    test('should ignore submissions when extension is disabled', async () => {
      // Arrange
      const mockSubmission = testData.extension.leetcodeSubmission;
      const mockSender = { tab: { id: 1 } };
      const mockSendResponse = jest.fn();
      
      extensionBackground.userId = 'test-user-123';
      extensionBackground.isEnabled = false;

      // Act
      await extensionBackground.handleMessage(
        { type: 'SUBMISSION_DETECTED', data: mockSubmission },
        mockSender,
        mockSendResponse
      );

      // Assert
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    test('should ignore submissions when user is not logged in', async () => {
      // Arrange
      const mockSubmission = testData.extension.leetcodeSubmission;
      const mockSender = { tab: { id: 1 } };
      const mockSendResponse = jest.fn();
      
      extensionBackground.userId = null;
      extensionBackground.isEnabled = true;

      // Act
      await extensionBackground.handleMessage(
        { type: 'SUBMISSION_DETECTED', data: mockSubmission },
        mockSender,
        mockSendResponse
      );

      // Assert
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    test('should handle GET_USER_ID message', async () => {
      // Arrange
      const mockSendResponse = jest.fn();
      extensionBackground.userId = 'test-user-123';

      // Act
      await extensionBackground.handleMessage(
        { type: 'GET_USER_ID' },
        null,
        mockSendResponse
      );

      // Assert
      expect(mockSendResponse).toHaveBeenCalledWith({ userId: 'test-user-123' });
    });

    test('should handle SET_USER_ID message', async () => {
      // Arrange
      const mockSendResponse = jest.fn();
      const newUserId = 'new-user-456';

      // Act
      await extensionBackground.handleMessage(
        { type: 'SET_USER_ID', userId: newUserId },
        null,
        mockSendResponse
      );

      // Assert
      expect(extensionBackground.userId).toBe(newUserId);
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    test('should handle TOGGLE_EXTENSION message', async () => {
      // Arrange
      const mockSendResponse = jest.fn();
      const enabled = false;

      // Act
      await extensionBackground.handleMessage(
        { type: 'TOGGLE_EXTENSION', enabled },
        null,
        mockSendResponse
      );

      // Assert
      expect(extensionBackground.isEnabled).toBe(enabled);
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    test('should handle unknown message types', async () => {
      // Arrange
      const mockSendResponse = jest.fn();

      // Act
      await extensionBackground.handleMessage(
        { type: 'UNKNOWN_TYPE' },
        null,
        mockSendResponse
      );

      // Assert
      expect(mockSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Unknown message type'
      });
    });
  });

  describe('Storage Management', () => {
    test('should save user ID to storage', async () => {
      // Arrange
      const userId = 'test-user-123';

      // Act
      await extensionBackground.saveUserId(userId);

      // Assert
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ userId }, expect.any(Function));
    });

    test('should load user ID from storage', async () => {
      // Arrange
      const userId = 'test-user-123';
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ userId });
      });

      // Act
      const result = await extensionBackground.loadUserId();

      // Assert
      expect(result).toBe(userId);
      expect(extensionBackground.userId).toBe(userId);
    });

    test('should handle missing user ID in storage', async () => {
      // Arrange
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      // Act
      const result = await extensionBackground.loadUserId();

      // Assert
      expect(result).toBeNull();
      expect(extensionBackground.userId).toBeNull();
    });

    test('should save extension state to storage', async () => {
      // Arrange
      const enabled = false;

      // Act
      await extensionBackground.saveExtensionState(enabled);

      // Assert
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { extensionEnabled: enabled },
        expect.any(Function)
      );
    });

    test('should load extension state from storage', async () => {
      // Arrange
      const enabled = false;
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ extensionEnabled: enabled });
      });

      // Act
      const result = await extensionBackground.loadExtensionState();

      // Assert
      expect(result).toBe(enabled);
      expect(extensionBackground.isEnabled).toBe(enabled);
    });

    test('should default to enabled when no state in storage', async () => {
      // Arrange
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      // Act
      const result = await extensionBackground.loadExtensionState();

      // Assert
      expect(result).toBe(true);
      expect(extensionBackground.isEnabled).toBe(true);
    });
  });

  describe('API Communication', () => {
    test('should send submission data to API', async () => {
      // Arrange
      const mockSubmission = testData.extension.leetcodeSubmission;
      const mockSender = { tab: { id: 1 } };
      
      extensionBackground.userId = 'test-user-123';
      extensionBackground.isEnabled = true;

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, id: 'submission-123' })
      });

      // Act
      await extensionBackground.handleSubmissionDetected(mockSubmission, mockSender);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5003/api/v1/submissions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...mockSubmission,
            userId: 'test-user-123',
            timestamp: expect.any(Number)
          })
        })
      );
    });

    test('should handle API errors gracefully', async () => {
      // Arrange
      const mockSubmission = testData.extension.leetcodeSubmission;
      const mockSender = { tab: { id: 1 } };
      
      extensionBackground.userId = 'test-user-123';
      extensionBackground.isEnabled = true;

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      // Act & Assert - should not throw
      await expect(extensionBackground.handleSubmissionDetected(mockSubmission, mockSender))
        .resolves.not.toThrow();
    });

    test('should handle network errors gracefully', async () => {
      // Arrange
      const mockSubmission = testData.extension.leetcodeSubmission;
      const mockSender = { tab: { id: 1 } };
      
      extensionBackground.userId = 'test-user-123';
      extensionBackground.isEnabled = true;

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Act & Assert - should not throw
      await expect(extensionBackground.handleSubmissionDetected(mockSubmission, mockSender))
        .resolves.not.toThrow();
    });
  });

  describe('Initialization', () => {
    test('should initialize with stored values', async () => {
      // Arrange
      const userId = 'test-user-123';
      const enabled = false;
      
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        if (keys.includes('userId')) {
          callback({ userId });
        } else if (keys.includes('extensionEnabled')) {
          callback({ extensionEnabled: enabled });
        }
      });

      // Act
      await extensionBackground.initialize();

      // Assert
      expect(extensionBackground.userId).toBe(userId);
      expect(extensionBackground.isEnabled).toBe(enabled);
    });
  });

  describe('Error Handling', () => {
    test('should handle message handling errors', async () => {
      // Arrange
      const mockSendResponse = jest.fn();
      extensionBackground.handleSubmissionDetected = jest.fn().mockRejectedValue(new Error('Test error'));

      // Act
      await extensionBackground.handleMessage(
        { type: 'SUBMISSION_DETECTED', data: {} },
        null,
        mockSendResponse
      );

      // Assert
      expect(mockSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Test error'
      });
    });
  });
});
