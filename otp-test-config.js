/**
 * OTP Test Configuration
 * Gmail SMTP Configuration for testing
 */

module.exports = {
  // Gmail SMTP Configuration
  smtp: {
    user: 'skillport24@gmail.com',
    pass: 'rsly dsns fuzt hwka',
    service: 'gmail'
  },
  
  // Test email configuration
  testEmail: {
    from: 'skillport24@gmail.com',
    to: 'skillport24@gmail.com', // Send test emails to same account
    subject: 'SkillPort OTP Test'
  },
  
  // OTP configuration
  otp: {
    length: 6,
    expiry: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 3
  }
};
