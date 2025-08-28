const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.transporter = null;
    this.isProduction = process.env.NODE_ENV === 'production';
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        // Production email configuration (Gmail SMTP)
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          },
          secure: true,
          port: 465
        });
        console.log('✅ Email Service: Gmail SMTP initialized successfully');
      } else {
        // Fallback to Ethereal if no Gmail credentials
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log('✅ Email Service: Ethereal test account initialized (no Gmail credentials)');
      }
    } catch (error) {
      console.error('❌ Email service initialization error:', error);
      throw error;
    }
  }

  /**
   * Send OTP email
   * @param {string} email - Recipient email
   * @param {string} otp - OTP code
   * @param {string} type - Type of OTP (verification, reset)
   * @returns {Object} - Result object
   */
  async sendOTP(email, otp, type = 'verification') {
    try {
      const subject = type === 'verification'
        ? 'Email Verification - SkillPort'
        : 'Password Reset - SkillPort';

      const htmlContent = await this.generateOTPEmail(otp, type);

      const result = await this.transporter.sendMail({
        from: `"SkillPort" <${process.env.EMAIL_USER || 'noreply@skillport.com'}>`,
        to: email,
        subject: subject,
        html: htmlContent
      });

      if (this.isProduction) {
        console.log(`✅ OTP email sent successfully to ${email}`);
        return {
          success: true,
          message: 'OTP email sent successfully',
          messageId: result.messageId
        };
      } else {
        // Development mode - show preview URL
        const previewUrl = nodemailer.getTestMessageUrl(result);
        console.log('📧 Email sent (development):', previewUrl);
        return {
          success: true,
          message: 'OTP email sent successfully (development mode)',
          messageId: result.messageId,
          previewUrl: previewUrl
        };
      }
    } catch (error) {
      console.error('❌ Send OTP email error:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} resetToken - Password reset token
   * @param {string} username - Username
   * @returns {Object} - Result object
   */
  async sendPasswordReset(email, resetToken, username) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5001'}/reset-password?token=${resetToken}`;
      const htmlContent = await this.generatePasswordResetEmail(username, resetUrl);

      const result = await this.transporter.sendMail({
        from: `"SkillPort" <${process.env.EMAIL_USER || 'noreply@skillport.com'}>`,
        to: email,
        subject: 'Password Reset Request - SkillPort',
        html: htmlContent
      });

      if (this.isProduction) {
        console.log(`✅ Password reset email sent successfully to ${email}`);
        return {
          success: true,
          message: 'Password reset email sent successfully',
          messageId: result.messageId
        };
      } else {
        const previewUrl = nodemailer.getTestMessageUrl(result);
        console.log('📧 Password reset email sent (development):', previewUrl);
        return {
          success: true,
          message: 'Password reset email sent successfully (development mode)',
          messageId: result.messageId,
          previewUrl: previewUrl
        };
      }
    } catch (error) {
      console.error('❌ Send password reset email error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email
   * @param {string} email - Recipient email
   * @param {string} username - Username
   * @param {string} firstName - First name
   * @returns {Object} - Result object
   */
  async sendWelcomeEmail(email, username, firstName) {
    try {
      const htmlContent = await this.generateWelcomeEmail(username, firstName);

      const result = await this.transporter.sendMail({
        from: `"SkillPort" <${process.env.EMAIL_USER || 'noreply@skillport.com'}>`,
        to: email,
        subject: 'Welcome to SkillPort! 🎉',
        html: htmlContent
      });

      if (this.isProduction) {
        console.log(`✅ Welcome email sent successfully to ${email}`);
        return {
          success: true,
          message: 'Welcome email sent successfully',
          messageId: result.messageId
        };
      } else {
        const previewUrl = nodemailer.getTestMessageUrl(result);
        console.log('📧 Welcome email sent (development):', previewUrl);
        return {
          success: true,
          message: 'Welcome email sent successfully (development mode)',
          messageId: result.messageId,
          previewUrl: previewUrl
        };
      }
    } catch (error) {
      console.error('❌ Send welcome email error:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  /**
   * Send contest invitation email
   * @param {string} email - Recipient email
   * @param {string} username - Username
   * @param {string} contestName - Contest name
   * @param {string} inviterName - Inviter name
   * @param {string} contestUrl - Contest URL
   * @returns {Object} - Result object
   */
  async sendContestInvitation(email, username, contestName, inviterName, contestUrl) {
    try {
      const htmlContent = await this.generateContestInvitationEmail(username, contestName, inviterName, contestUrl);

      const result = await this.transporter.sendMail({
        from: `"SkillPort" <${process.env.EMAIL_USER || 'noreply@skillport.com'}>`,
        to: email,
        subject: `You're invited to join "${contestName}" contest!`,
        html: htmlContent
      });

      if (this.isProduction) {
        console.log(`✅ Contest invitation email sent successfully to ${email}`);
        return {
          success: true,
          message: 'Contest invitation email sent successfully',
          messageId: result.messageId
        };
      } else {
        const previewUrl = nodemailer.getTestMessageUrl(result);
        console.log('📧 Contest invitation email sent (development):', previewUrl);
        return {
          success: true,
          message: 'Contest invitation email sent successfully (development mode)',
          messageId: result.messageId,
          previewUrl: previewUrl
        };
      }
    } catch (error) {
      console.error('❌ Send contest invitation email error:', error);
      throw new Error('Failed to send contest invitation email');
    }
  }

  /**
   * Send community invitation email
   * @param {string} email - Recipient email
   * @param {string} username - Username
   * @param {string} communityName - Community name
   * @param {string} inviterName - Inviter name
   * @param {string} communityUrl - Community URL
   * @returns {Object} - Result object
   */
  async sendCommunityInvitation(email, username, communityName, inviterName, communityUrl) {
    try {
      const htmlContent = await this.generateCommunityInvitationEmail(username, communityName, inviterName, communityUrl);

      const result = await this.transporter.sendMail({
        from: `"SkillPort" <${process.env.EMAIL_USER || 'noreply@skillport.com'}>`,
        to: email,
        subject: `Join "${communityName}" community on SkillPort!`,
        html: htmlContent
      });

      if (this.isProduction) {
        console.log(`✅ Community invitation email sent successfully to ${email}`);
        return {
          success: true,
          message: 'Community invitation email sent successfully',
          messageId: result.messageId
        };
      } else {
        const previewUrl = nodemailer.getTestMessageUrl(result);
        console.log('📧 Community invitation email sent (development):', previewUrl);
        return {
          success: true,
          message: 'Community invitation email sent successfully (development mode)',
          messageId: result.messageId,
          previewUrl: previewUrl
        };
      }
    } catch (error) {
      console.error('❌ Send community invitation email error:', error);
      throw new Error('Failed to send community invitation email');
    }
  }

  /**
   * Generate OTP email HTML content
   * @param {string} otp - OTP code
   * @param {string} type - Type of OTP
   * @returns {string} - HTML content
   */
  async generateOTPEmail(otp, type) {
    const title = type === 'verification'
      ? 'Verify Your Email Address'
      : 'Reset Your Password';
    
    const message = type === 'verification'
      ? 'Please use the following OTP to verify your email address:'
      : 'Please use the following OTP to reset your password:';
    
    const buttonText = type === 'verification' ? 'Verify Email' : 'Reset Password';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - SkillPort</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 SkillPort</h1>
            <h2>${title}</h2>
          </div>
          <div class="content">
            <p>Hello!</p>
            <p>${message}</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p><strong>This OTP is valid for 10 minutes</strong></p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <p>• Never share this OTP with anyone</p>
              <p>• SkillPort staff will never ask for your OTP</p>
              <p>• If you didn't request this, please ignore this email</p>
            </div>
            
            <p>Best regards,<br>The SkillPort Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 SkillPort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate password reset email HTML content
   * @param {string} username - Username
   * @param {string} resetUrl - Password reset URL
   * @returns {string} - HTML content
   */
  async generatePasswordResetEmail(username, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - SkillPort</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 SkillPort</h1>
            <h2>Password Reset Request</h2>
          </div>
          <div class="content">
            <p>Hello ${username}!</p>
            <p>We received a request to reset your password for your SkillPort account.</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </p>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <p>• This link is valid for 1 hour only</p>
              <p>• If you didn't request this, please ignore this email</p>
              <p>• Your password will remain unchanged until you click the link above</p>
            </div>
            
            <p>Best regards,<br>The SkillPort Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 SkillPort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate welcome email HTML content
   * @param {string} username - Username
   * @param {string} firstName - First name
   * @returns {string} - HTML content
   */
  async generateWelcomeEmail(username, firstName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SkillPort! 🎉</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 SkillPort</h1>
            <h2>Welcome aboard, ${firstName}! 🚀</h2>
          </div>
          <div class="content">
            <p>Hi ${firstName}!</p>
            <p>Welcome to SkillPort - your ultimate platform for coding excellence and community learning!</p>
            
            <div class="feature">
              <h3>🚀 What you can do now:</h3>
              <ul>
                <li>Join coding communities and contests</li>
                <li>Track your progress across platforms</li>
                <li>Connect with mentors and peers</li>
                <li>Build your coding portfolio</li>
                <li>Participate in skill assessments</li>
              </ul>
            </div>
            
            <div class="feature">
              <h3>💡 Getting Started:</h3>
              <ol>
                <li>Complete your profile</li>
                <li>Join communities that interest you</li>
                <li>Install our browser extension for automatic progress tracking</li>
                <li>Start participating in contests</li>
              </ol>
            </div>
            
            <p>Ready to begin your coding journey? Let's make it amazing! 🎉</p>
            
            <p>Best regards,<br>The SkillPort Team</p>
          </div>
          <div class="footer">
            <p>© 2024 SkillPort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate contest invitation email HTML content
   * @param {string} username - Username
   * @param {string} contestName - Contest name
   * @param {string} inviterName - Inviter name
   * @param {string} contestUrl - Contest URL
   * @returns {string} - HTML content
   */
  async generateContestInvitationEmail(username, contestName, inviterName, contestUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contest Invitation - SkillPort</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 SkillPort</h1>
            <h2>Contest Invitation</h2>
          </div>
          <div class="content">
            <p>Hello ${username}!</p>
            <p><strong>${inviterName}</strong> has invited you to join the <strong>"${contestName}"</strong> contest on SkillPort!</p>
            
            <p>This is your chance to showcase your skills and compete with other talented coders!</p>
            
            <p style="text-align: center;">
              <a href="${contestUrl}" class="button">Join Contest Now</a>
            </p>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${contestUrl}</p>
            
            <p>Good luck! 🚀</p>
            
            <p>Best regards,<br>The SkillPort Team</p>
          </div>
          <div class="footer">
            <p>© 2024 SkillPort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate community invitation email HTML content
   * @param {string} username - Username
   * @param {string} communityName - Community name
   * @param {string} inviterName - Inviter name
   * @param {string} communityUrl - Community URL
   * @returns {string} - HTML content
   */
  async generateCommunityInvitationEmail(username, communityName, inviterName, communityUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Community Invitation - SkillPort</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👥 SkillPort</h1>
            <h2>Community Invitation</h2>
          </div>
          <div class="content">
            <p>Hello ${username}!</p>
            <p><strong>${inviterName}</strong> has invited you to join the <strong>"${communityName}"</strong> community on SkillPort!</p>
            
            <p>Communities are where you can:</p>
            <ul>
              <li>Connect with like-minded coders</li>
              <li>Share knowledge and experiences</li>
              <li>Participate in group activities</li>
              <li>Get mentorship and guidance</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${communityUrl}" class="button">Join Community</a>
            </p>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${communityUrl}</p>
            
            <p>Welcome to the community! 🎉</p>
            
            <p>Best regards,<br>The SkillPort Team</p>
          </div>
          <div class="footer">
            <p>© 2024 SkillPort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Test email service functionality
   * @returns {Object} - Test result
   */
  async testEmailService() {
    try {
      console.log('🧪 Testing Email Service...');
      
      const testResult = await this.sendOTP('test@example.com', '123456', 'verification');
      console.log('✅ Email service test successful:', testResult);
      
      return {
        success: true,
        message: 'Email service test successful',
        result: testResult
      };
    } catch (error) {
      console.error('❌ Email service test failed:', error);
      return {
        success: false,
        message: 'Email service test failed',
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
      isProduction: this.isProduction,
      hasCredentials: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
      transporter: this.transporter ? 'initialized' : 'not initialized'
    };
  }
}

module.exports = new EmailService();
