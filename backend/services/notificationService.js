const EmailService = require('./emailService');
const SMSService = require('./smsService');

class NotificationService {
  constructor() {
    this.emailService = EmailService;
    this.smsService = SMSService;
  }

  /**
   * Send OTP via both email and SMS (if available)
   * @param {string} email - Recipient email
   * @param {string} phoneNumber - Recipient phone number (optional)
   * @param {string} otp - OTP code
   * @param {string} type - Type of OTP
   * @returns {Object} - Result object
   */
  async sendOTP(email, phoneNumber = null, otp, type = 'verification') {
    const results = {
      email: null,
      sms: null,
      success: false,
      message: ''
    };

    try {
      // Send email OTP
      try {
        results.email = await this.emailService.sendOTP(email, otp, type);
        console.log(`✅ Email OTP sent successfully to ${email}`);
      } catch (emailError) {
        console.error(`❌ Email OTP failed for ${email}:`, emailError.message);
        results.email = { success: false, error: emailError.message };
      }

      // Send SMS OTP if phone number provided
      if (phoneNumber) {
        try {
          results.sms = await this.smsService.sendOTP(phoneNumber, otp, type);
          console.log(`✅ SMS OTP sent successfully to ${phoneNumber}`);
        } catch (smsError) {
          console.error(`❌ SMS OTP failed for ${phoneNumber}:`, smsError.message);
          results.sms = { success: false, error: smsError.message };
        }
      }

      // Determine overall success
      results.success = results.email.success || (results.sms && results.sms.success);
      results.message = results.success 
        ? 'OTP sent successfully' 
        : 'Failed to send OTP via any method';

      return results;
    } catch (error) {
      console.error('❌ Notification service OTP error:', error);
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  }

  /**
   * Send welcome notification
   * @param {string} email - Recipient email
   * @param {string} phoneNumber - Recipient phone number (optional)
   * @param {string} username - Username
   * @param {string} firstName - First name
   * @returns {Object} - Result object
   */
  async sendWelcomeNotification(email, phoneNumber = null, username, firstName) {
    const results = {
      email: null,
      sms: null,
      success: false,
      message: ''
    };

    try {
      // Send welcome email
      try {
        results.email = await this.emailService.sendWelcomeEmail(email, username, firstName);
        console.log(`✅ Welcome email sent successfully to ${email}`);
      } catch (emailError) {
        console.error(`❌ Welcome email failed for ${email}:`, emailError.message);
        results.email = { success: false, error: emailError.message };
      }

      // Send welcome SMS if phone number provided
      if (phoneNumber) {
        try {
          const welcomeMessage = `Welcome to SkillPort, ${firstName}! Your account has been created successfully. Start your coding journey now! 🚀`;
          results.sms = await this.smsService.sendNotification(phoneNumber, welcomeMessage, 'welcome');
          console.log(`✅ Welcome SMS sent successfully to ${phoneNumber}`);
        } catch (smsError) {
          console.error(`❌ Welcome SMS failed for ${phoneNumber}:`, smsError.message);
          results.sms = { success: false, error: smsError.message };
        }
      }

      results.success = results.email.success || (results.sms && results.sms.success);
      results.message = results.success 
        ? 'Welcome notification sent successfully' 
        : 'Failed to send welcome notification via any method';

      return results;
    } catch (error) {
      console.error('❌ Notification service welcome error:', error);
      throw new Error(`Failed to send welcome notification: ${error.message}`);
    }
  }

  /**
   * Send contest invitation notification
   * @param {string} email - Recipient email
   * @param {string} phoneNumber - Recipient phone number (optional)
   * @param {string} username - Username
   * @param {string} contestName - Contest name
   * @param {string} inviterName - Inviter name
   * @param {string} contestUrl - Contest URL
   * @returns {Object} - Result object
   */
  async sendContestInvitation(email, phoneNumber = null, username, contestName, inviterName, contestUrl) {
    const results = {
      email: null,
      sms: null,
      success: false,
      message: ''
    };

    try {
      // Send contest invitation email
      try {
        results.email = await this.emailService.sendContestInvitation(email, username, contestName, inviterName, contestUrl);
        console.log(`✅ Contest invitation email sent successfully to ${email}`);
      } catch (emailError) {
        console.error(`❌ Contest invitation email failed for ${email}:`, emailError.message);
        results.email = { success: false, error: emailError.message };
      }

      // Send contest invitation SMS if phone number provided
      if (phoneNumber) {
        try {
          const smsMessage = `${inviterName} invited you to join "${contestName}" contest! Check your email for details.`;
          results.sms = await this.smsService.sendNotification(phoneNumber, smsMessage, 'contest-invitation');
          console.log(`✅ Contest invitation SMS sent successfully to ${phoneNumber}`);
        } catch (smsError) {
          console.error(`❌ Contest invitation SMS failed for ${phoneNumber}:`, smsError.message);
          results.sms = { success: false, error: smsError.message };
        }
      }

      results.success = results.email.success || (results.sms && results.sms.success);
      results.message = results.success 
        ? 'Contest invitation sent successfully' 
        : 'Failed to send contest invitation via any method';

      return results;
    } catch (error) {
      console.error('❌ Notification service contest invitation error:', error);
      throw new Error(`Failed to send contest invitation: ${error.message}`);
    }
  }

  /**
   * Send community invitation notification
   * @param {string} email - Recipient email
   * @param {string} phoneNumber - Recipient phone number (optional)
   * @param {string} username - Username
   * @param {string} communityName - Community name
   * @param {string} inviterName - Inviter name
   * @param {string} communityUrl - Community URL
   * @returns {Object} - Result object
   */
  async sendCommunityInvitation(email, phoneNumber = null, username, communityName, inviterName, communityUrl) {
    const results = {
      email: null,
      sms: null,
      success: false,
      message: ''
    };

    try {
      // Send community invitation email
      try {
        results.email = await this.emailService.sendCommunityInvitation(email, username, communityName, inviterName, communityUrl);
        console.log(`✅ Community invitation email sent successfully to ${email}`);
      } catch (emailError) {
        console.error(`❌ Community invitation email failed for ${email}:`, emailError.message);
        results.email = { success: false, error: emailError.message };
      }

      // Send community invitation SMS if phone number provided
      if (phoneNumber) {
        try {
          const smsMessage = `${inviterName} invited you to join "${communityName}" community! Check your email for details.`;
          results.sms = await this.smsService.sendNotification(phoneNumber, smsMessage, 'community-invitation');
          console.log(`✅ Community invitation SMS sent successfully to ${phoneNumber}`);
        } catch (smsError) {
          console.error(`❌ Community invitation SMS failed for ${phoneNumber}:`, smsError.message);
          results.sms = { success: false, error: smsError.message };
        }
      }

      results.success = results.email.success || (results.sms && results.sms.success);
      results.message = results.success 
        ? 'Community invitation sent successfully' 
        : 'Failed to send community invitation via any method';

      return results;
    } catch (error) {
      console.error('❌ Notification service community invitation error:', error);
      throw new Error(`Failed to send community invitation: ${error.message}`);
    }
  }

  /**
   * Send password reset notification
   * @param {string} email - Recipient email
   * @param {string} phoneNumber - Recipient phone number (optional)
   * @param {string} resetToken - Password reset token
   * @param {string} username - Username
   * @returns {Object} - Result object
   */
  async sendPasswordResetNotification(email, phoneNumber = null, resetToken, username) {
    const results = {
      email: null,
      sms: null,
      success: false,
      message: ''
    };

    try {
      // Send password reset email
      try {
        results.email = await this.emailService.sendPasswordReset(email, resetToken, username);
        console.log(`✅ Password reset email sent successfully to ${email}`);
      } catch (emailError) {
        console.error(`❌ Password reset email failed for ${email}:`, emailError.message);
        results.email = { success: false, error: emailError.message };
      }

      // Send password reset SMS if phone number provided
      if (phoneNumber) {
        try {
          const smsMessage = `Password reset requested for your SkillPort account. Check your email for the reset link.`;
          results.sms = await this.smsService.sendNotification(phoneNumber, smsMessage, 'password-reset');
          console.log(`✅ Password reset SMS sent successfully to ${phoneNumber}`);
        } catch (smsError) {
          console.error(`❌ Password reset SMS failed for ${phoneNumber}:`, smsError.message);
          results.sms = { success: false, error: smsError.message };
        }
      }

      results.success = results.email.success || (results.sms && results.sms.success);
      results.message = results.success 
        ? 'Password reset notification sent successfully' 
        : 'Failed to send password reset notification via any method';

      return results;
    } catch (error) {
      console.error('❌ Notification service password reset error:', error);
      throw new Error(`Failed to send password reset notification: ${error.message}`);
    }
  }

  /**
   * Send contest reminder notification
   * @param {string} email - Recipient email
   * @param {string} phoneNumber - Recipient phone number (optional)
   * @param {string} contestName - Contest name
   * @param {string} startTime - Contest start time
   * @returns {Object} - Result object
   */
  async sendContestReminder(email, phoneNumber = null, contestName, startTime) {
    const results = {
      email: null,
      sms: null,
      success: false,
      message: ''
    };

    try {
      // Send contest reminder email (custom implementation needed)
      try {
        // For now, send a simple notification
        const reminderMessage = `Contest "${contestName}" starts in 1 hour at ${startTime}. Good luck!`;
        results.email = await this.emailService.sendNotification(email, reminderMessage, 'contest-reminder');
        console.log(`✅ Contest reminder email sent successfully to ${email}`);
      } catch (emailError) {
        console.error(`❌ Contest reminder email failed for ${email}:`, emailError.message);
        results.email = { success: false, error: emailError.message };
      }

      // Send contest reminder SMS if phone number provided
      if (phoneNumber) {
        try {
          results.sms = await this.smsService.sendContestReminder(phoneNumber, contestName, startTime);
          console.log(`✅ Contest reminder SMS sent successfully to ${phoneNumber}`);
        } catch (smsError) {
          console.error(`❌ Contest reminder SMS failed for ${phoneNumber}:`, smsError.message);
          results.sms = { success: false, error: smsError.message };
        }
      }

      results.success = results.email.success || (results.sms && results.sms.success);
      results.message = results.success 
        ? 'Contest reminder sent successfully' 
        : 'Failed to send contest reminder via any method';

      return results;
    } catch (error) {
      console.error('❌ Notification service contest reminder error:', error);
      throw new Error(`Failed to send contest reminder: ${error.message}`);
    }
  }

  /**
   * Send achievement notification
   * @param {string} email - Recipient email
   * @param {string} phoneNumber - Recipient phone number (optional)
   * @param {string} username - Username
   * @param {string} achievement - Achievement description
   * @returns {Object} - Result object
   */
  async sendAchievementNotification(email, phoneNumber = null, username, achievement) {
    const results = {
      email: null,
      sms: null,
      success: false,
      message: ''
    };

    try {
      // Send achievement email (custom implementation needed)
      try {
        const achievementMessage = `🎉 Congratulations ${username}! You've achieved: ${achievement}`;
        results.email = await this.emailService.sendNotification(email, achievementMessage, 'achievement');
        console.log(`✅ Achievement email sent successfully to ${email}`);
      } catch (emailError) {
        console.error(`❌ Achievement email failed for ${email}:`, emailError.message);
        results.email = { success: false, error: emailError.message };
      }

      // Send achievement SMS if phone number provided
      if (phoneNumber) {
        try {
          results.sms = await this.smsService.sendAchievementNotification(phoneNumber, achievement);
          console.log(`✅ Achievement SMS sent successfully to ${phoneNumber}`);
        } catch (smsError) {
          console.error(`❌ Achievement SMS failed for ${phoneNumber}:`, smsError.message);
          results.sms = { success: false, error: smsError.message };
        }
      }

      results.success = results.email.success || (results.sms && results.sms.success);
      results.message = results.success 
        ? 'Achievement notification sent successfully' 
        : 'Failed to send achievement notification via any method';

      return results;
    } catch (error) {
      console.error('❌ Notification service achievement error:', error);
      throw new Error(`Failed to send achievement notification: ${error.message}`);
    }
  }

  /**
   * Send urgent notification
   * @param {string} email - Recipient email
   * @param {string} phoneNumber - Recipient phone number (optional)
   * @param {string} message - Urgent message content
   * @returns {Object} - Result object
   */
  async sendUrgentNotification(email, phoneNumber = null, message) {
    const results = {
      email: null,
      sms: null,
      success: false,
      message: ''
    };

    try {
      // Send urgent email
      try {
        const urgentMessage = `🚨 URGENT: ${message}`;
        results.email = await this.emailService.sendNotification(email, urgentMessage, 'urgent');
        console.log(`✅ Urgent email sent successfully to ${email}`);
      } catch (emailError) {
        console.error(`❌ Urgent email failed for ${email}:`, emailError.message);
        results.email = { success: false, error: emailError.message };
      }

      // Send urgent SMS if phone number provided
      if (phoneNumber) {
        try {
          results.sms = await this.smsService.sendUrgentNotification(phoneNumber, message);
          console.log(`✅ Urgent SMS sent successfully to ${phoneNumber}`);
        } catch (smsError) {
          console.error(`❌ Urgent SMS failed for ${phoneNumber}:`, smsError.message);
          results.sms = { success: false, error: smsError.message };
        }
      }

      results.success = results.email.success || (results.sms && results.sms.success);
      results.message = results.success 
        ? 'Urgent notification sent successfully' 
        : 'Failed to send urgent notification via any method';

      return results;
    } catch (error) {
      console.error('❌ Notification service urgent notification error:', error);
      throw new Error(`Failed to send urgent notification: ${error.message}`);
    }
  }

  /**
   * Test notification service functionality
   * @returns {Object} - Test result
   */
  async testNotificationService() {
    try {
      console.log('🧪 Testing Notification Service...');
      
      const testResults = {
        email: await this.emailService.testEmailService(),
        sms: await this.smsService.testSMSService()
      };

      console.log('✅ Notification service test completed:', testResults);
      
      return {
        success: true,
        message: 'Notification service test completed',
        results: testResults
      };
    } catch (error) {
      console.error('❌ Notification service test failed:', error);
      return {
        success: false,
        message: 'Notification service test failed',
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
      email: this.emailService.getStatus(),
      sms: this.smsService.getStatus(),
      overall: {
        emailEnabled: this.emailService.getStatus().transporter === 'initialized',
        smsEnabled: this.smsService.getStatus().enabled
      }
    };
  }
}

module.exports = new NotificationService();
