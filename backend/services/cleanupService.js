const Otp = require('../models/Otp');
const logger = require('../config/logger');

class CleanupService {
  constructor() {
    this.cleanupInterval = null;
  }

  // Start the cleanup service
  start() {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupExpiredOTPs();
        logger.info('Cleanup service: Expired OTPs cleaned up successfully');
      } catch (error) {
        logger.error('Cleanup service error:', error);
      }
    }, 60 * 60 * 1000); // 1 hour

    logger.info('Cleanup service started');
  }

  // Stop the cleanup service
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('Cleanup service stopped');
    }
  }

  // Clean up expired OTPs
  async cleanupExpiredOTPs() {
    try {
      const result = await Otp.cleanupExpired();
      logger.info(`Cleanup service: Removed ${result.deletedCount || 0} expired OTPs`);
      return result;
    } catch (error) {
      logger.error('Error cleaning up expired OTPs:', error);
      throw error;
    }
  }

  // Manual cleanup trigger
  async manualCleanup() {
    try {
      const result = await this.cleanupExpiredOTPs();
      logger.info('Manual cleanup completed:', result);
      return result;
    } catch (error) {
      logger.error('Manual cleanup failed:', error);
      throw error;
    }
  }
}

module.exports = new CleanupService();
