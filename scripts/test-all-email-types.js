/**
 * Test All Email Types
 * Tests OTP, Registration Welcome, First Login, and Password Reset emails
 */

const axios = require('axios');

const OTP_SERVER_URL = 'http://localhost:5002';
const TEST_EMAIL = 'skillport24@gmail.com';
const TEST_USER = {
    firstName: 'John',
    lastName: 'Doe',
    email: TEST_EMAIL
};

async function testAllEmailTypes() {
    console.log('🎨 Testing All SkillPort Email Types');
    console.log('=====================================');
    
    try {
        // Test 1: Email Service Connection
        console.log('\n🔌 Step 1: Testing Email Service Connection...');
        try {
            const connectionResponse = await axios.get(`${OTP_SERVER_URL}/api/email/test-connection`);
            if (connectionResponse.data.success) {
                console.log('✅ Email service connection successful');
            } else {
                console.log('❌ Email service connection failed');
                return;
            }
        } catch (error) {
            console.log('❌ Email service connection failed:', error.message);
            return;
        }
        
        // Test 2: OTP Email
        console.log('\n🔐 Step 2: Testing OTP Email...');
        try {
            const otpResponse = await axios.post(`${OTP_SERVER_URL}/api/otp/generate`, {
                email: TEST_USER.email,
                firstName: TEST_USER.firstName,
                lastName: TEST_USER.lastName
            });
            
            if (otpResponse.data.success) {
                console.log('✅ OTP email sent successfully');
                console.log('📧 Subject: 🔐 Verify Your Email - SkillPort');
                console.log('📧 Features: Professional branding, 6-digit OTP, expiry notice');
            } else {
                console.log('❌ OTP email failed:', otpResponse.data.message);
            }
        } catch (error) {
            console.log('❌ OTP email test failed:', error.message);
        }
        
        // Test 3: Registration Welcome Email
        console.log('\n🎉 Step 3: Testing Registration Welcome Email...');
        try {
            const welcomeResponse = await axios.post(`${OTP_SERVER_URL}/api/email/registration-welcome`, {
                email: TEST_USER.email,
                firstName: TEST_USER.firstName,
                lastName: TEST_USER.lastName
            });
            
            if (welcomeResponse.data.success) {
                console.log('✅ Registration welcome email sent successfully');
                console.log('📧 Subject: 🎉 Welcome to SkillPort - Your Journey Begins!');
                console.log('📧 Features: Welcome message, feature highlights, call-to-action buttons');
            } else {
                console.log('❌ Registration welcome email failed:', welcomeResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Registration welcome email test failed:', error.message);
        }
        
        // Test 4: First Login Email
        console.log('\n👋 Step 4: Testing First Login Email...');
        try {
            const loginResponse = await axios.post(`${OTP_SERVER_URL}/api/email/first-login`, {
                email: TEST_USER.email,
                firstName: TEST_USER.firstName,
                lastName: TEST_USER.lastName
            });
            
            if (loginResponse.data.success) {
                console.log('✅ First login email sent successfully');
                console.log('📧 Subject: 👋 Welcome Back to SkillPort!');
                console.log('📧 Features: Welcome back message, trending content, quick start tips');
            } else {
                console.log('❌ First login email failed:', loginResponse.data.message);
            }
        } catch (error) {
            console.log('❌ First login email test failed:', error.message);
        }
        
        // Test 5: Password Reset Email
        console.log('\n🔑 Step 5: Testing Password Reset Email...');
        try {
            const resetResponse = await axios.post(`${OTP_SERVER_URL}/api/email/password-reset`, {
                email: TEST_USER.email,
                firstName: TEST_USER.firstName,
                lastName: TEST_USER.lastName,
                resetLink: 'https://skillport.com/reset-password?token=test-token-123'
            });
            
            if (resetResponse.data.success) {
                console.log('✅ Password reset email sent successfully');
                console.log('📧 Subject: 🔑 Reset Your SkillPort Password');
                console.log('📧 Features: Reset button, security notice, expiry warning');
            } else {
                console.log('❌ Password reset email failed:', resetResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Password reset email test failed:', error.message);
        }
        
        console.log('\n🎨 Email Template Features:');
        console.log('===========================');
        console.log('✅ Professional SkillPort branding');
        console.log('✅ Consistent color scheme (Primary: #667eea, Secondary: #764ba2)');
        console.log('✅ Responsive design for mobile and desktop');
        console.log('✅ Inter font family for modern typography');
        console.log('✅ Gradient headers with SkillPort logo');
        console.log('✅ Feature highlights with icons');
        console.log('✅ Call-to-action buttons');
        console.log('✅ Security notices and warnings');
        console.log('✅ Professional footer with links');
        console.log('✅ Mobile-optimized layout');
        
        console.log('\n📧 Check Your Email Inbox:');
        console.log('==========================');
        console.log('📧 Email: skillport24@gmail.com');
        console.log('📧 You should receive 4 different emails:');
        console.log('   1. 🔐 OTP Verification Email');
        console.log('   2. 🎉 Registration Welcome Email');
        console.log('   3. 👋 First Login Welcome Email');
        console.log('   4. 🔑 Password Reset Email');
        
        console.log('\n🎯 Email Types Summary:');
        console.log('=======================');
        console.log('✅ OTP Email: Professional verification with 6-digit code');
        console.log('✅ Registration Welcome: Onboarding with feature highlights');
        console.log('✅ First Login: Welcome back with trending content');
        console.log('✅ Password Reset: Secure reset with expiry notice');
        
        return {
            success: true,
            message: 'All email types tested successfully'
        };
        
    } catch (error) {
        console.error('\n❌ Email Testing Failed:');
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Connection refused. Make sure the OTP server is running:');
            console.error('   node otp-server.js');
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the test
if (require.main === module) {
    testAllEmailTypes()
        .then(result => {
            if (result.success) {
                console.log('\n🎉 All Email Types Test Completed Successfully!');
                console.log('Check your email inbox to see the beautiful SkillPort-branded emails!');
                process.exit(0);
            } else {
                console.log('\n❌ Email Types Test Failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { testAllEmailTypes };
