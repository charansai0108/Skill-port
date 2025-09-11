/**
 * Gmail SMTP Test Script
 * Tests email delivery using Gmail SMTP
 */

const nodemailer = require('nodemailer');
const config = require('../otp-test-config');

async function testGmailSMTP() {
  console.log('🔧 Testing Gmail SMTP Configuration...');
  console.log('=====================================');
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
    
    console.log('✅ Transporter created successfully');
    
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    // Send test email
    console.log('📧 Sending test OTP email...');
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    const mailOptions = {
      from: config.testEmail.from,
      to: config.testEmail.to,
      subject: 'SkillPort OTP Test - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ef4444;">SkillPort OTP Test Email</h2>
          <p>This is a test email to verify Gmail SMTP configuration.</p>
          <p><strong>Test OTP:</strong> <span style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 18px; letter-spacing: 3px;">${testOTP}</span></p>
          <p>If you receive this email, the SMTP configuration is working correctly!</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <p>Best regards,<br>SkillPort Testing Team</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Test OTP:', testOTP);
    console.log('📧 Sent to:', config.testEmail.to);
    
    return {
      success: true,
      messageId: info.messageId,
      testOTP: testOTP
    };
    
  } catch (error) {
    console.error('❌ SMTP Test Failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check:');
      console.error('1. Gmail username and password are correct');
      console.error('2. App password is used (not regular password)');
      console.error('3. 2-factor authentication is enabled');
      console.error('4. "Less secure app access" is enabled (if not using app password)');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
if (require.main === module) {
  testGmailSMTP()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Gmail SMTP Test Completed Successfully!');
        console.log('Check your email inbox for the test OTP email.');
        process.exit(0);
      } else {
        console.log('\n❌ Gmail SMTP Test Failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testGmailSMTP };
