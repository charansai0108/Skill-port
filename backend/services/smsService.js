const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.isEnabled = false;
    
    // Initialize Twilio client if credentials are available
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.isEnabled = true;
      console.log('✅ SMS Service: Twilio initialized successfully');
    } else {
      console.log('⚠️ SMS Service: Twilio credentials not found, SMS disabled');
    }
  }

  /**
   * Send OTP via SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} otp - OTP code to send
   * @param {string} type - Type of OTP (verification, reset, etc.)
   * @returns {Object} - Result object
   */
  async sendOTP(phoneNumber, otp, type = 'verification') {
    if (!this.isEnabled || !this.client) {
      console.log('📱 SMS Service: SMS disabled, OTP would be:', otp);
      return {
        success: true,
        message: 'SMS service disabled (development mode)',
        otp: otp,
        preview: true
      };
    }

    try {
      const message = await this.client.messages.create({
        body: `SkillPort ${type.toUpperCase()}: Your OTP is ${otp}. Valid for 10 minutes.`,
        from: this.phoneNumber,
        to: phoneNumber
      });

      console.log(`✅ SMS OTP sent successfully to ${phoneNumber}:`, message.sid);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        messageId: message.sid,
        phoneNumber: phoneNumber
      };
    } catch (error) {
      console.error('❌ SMS OTP send error:', error);
      throw new Error(`Failed to send SMS OTP: ${error.message}`);
    }
  }

  /**
   * Send notification SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Message content
   * @param {string} type - Type of notification
   * @returns {Object} - Result object
   */
  async sendNotification(phoneNumber, message, type = 'general') {
    if (!this.isEnabled || !this.client) {
      console.log('📱 SMS Service: SMS disabled, notification would be:', message);
      return {
        success: true,
        message: 'SMS service disabled (development mode)',
        content: message,
        preview: true
      };
    }

    try {
      const smsMessage = await this.client.messages.create({
        body: `SkillPort ${type.toUpperCase()}: ${message}`,
        from: this.phoneNumber,
        to: phoneNumber
      });

      console.log(`✅ SMS notification sent successfully to ${phoneNumber}:`, smsMessage.sid);
      
      return {
        success: true,
        message: 'Notification sent successfully',
        messageId: smsMessage.sid,
        phoneNumber: phoneNumber
      };
    } catch (error) {
      console.error('❌ SMS notification send error:', error);
      throw new Error(`Failed to send SMS notification: ${error.message}`);
    }
  }

  /**
   * Send contest reminder SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} contestName - Name of the contest
   * @param {string} startTime - Contest start time
   * @returns {Object} - Result object
   */
  async sendContestReminder(phoneNumber, contestName, startTime) {
    const message = `Contest "${contestName}" starts in 1 hour at ${startTime}. Good luck!`;
    return this.sendNotification(phoneNumber, message, 'contest-reminder');
  }

  /**
   * Send community invitation SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} communityName - Name of the community
   * @param {string} inviterName - Name of the person inviting
   * @returns {Object} - Result object
   */
  async sendCommunityInvitation(phoneNumber, communityName, inviterName) {
    const message = `${inviterName} invited you to join "${communityName}" community on SkillPort!`;
    return this.sendNotification(phoneNumber, message, 'community-invitation');
  }

  /**
   * Send achievement notification SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} achievement - Achievement description
   * @returns {Object} - Result object
   */
  async sendAchievementNotification(phoneNumber, achievement) {
    const message = `🎉 Congratulations! You've achieved: ${achievement}`;
    return this.sendNotification(phoneNumber, message, 'achievement');
  }

  /**
   * Send urgent notification SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Urgent message content
   * @returns {Object} - Result object
   */
  async sendUrgentNotification(phoneNumber, message) {
    const urgentMessage = `🚨 URGENT: ${message}`;
    return this.sendNotification(phoneNumber, urgentMessage, 'urgent');
  }

  /**
   * Test SMS service functionality
   * @returns {Object} - Test result
   */
  async testSMSService() {
    try {
      console.log('🧪 Testing SMS Service...');
      
      if (!this.isEnabled) {
        return {
          success: true,
          message: 'SMS service disabled (no credentials)',
          enabled: false
        };
      }

      // Test with a dummy number (won't actually send)
      const testResult = await this.sendOTP('+1234567890', '123456', 'test');
      console.log('✅ SMS Service test successful:', testResult);
      
      return {
        success: true,
        message: 'SMS service test successful',
        enabled: true,
        result: testResult
      };
    } catch (error) {
      console.error('❌ SMS Service test failed:', error);
      return {
        success: false,
        message: 'SMS service test failed',
        error: error.message
      };
    }
  }

  /**
   * Get service status
   * @returns {Object} - Service status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      phoneNumber: this.phoneNumber,
      hasCredentials: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    };
  }
}

module.exports = new SMSService();
