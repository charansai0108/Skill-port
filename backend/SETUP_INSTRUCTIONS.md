# 🚀 SkillPort Email & SMS Services Setup Guide

## 📧 Email Service Setup (Gmail SMTP)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account → Security → 2-Step Verification
2. Click on "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Name it "SkillPort"
5. Copy the generated 16-character password

### Step 3: Update Environment Variables
```bash
# In backend/config.env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@skillport.com
```

### Step 4: Test Email Service
```bash
cd backend
node -e "const EmailService = require('./services/emailService'); EmailService.testEmailService().then(console.log)"
```

---

## 📱 SMS Service Setup (Twilio)

### Step 1: Create Twilio Account
1. Go to [twilio.com](https://twilio.com)
2. Sign up for a free account
3. Verify your phone number

### Step 2: Get Credentials
1. Go to Twilio Console → Dashboard
2. Copy your Account SID
3. Copy your Auth Token
4. Note your Twilio phone number

### Step 3: Update Environment Variables
```bash
# In backend/config.env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Step 4: Test SMS Service
```bash
cd backend
node -e "const SMSService = require('./services/smsService'); SMSService.testSMSService().then(console.log)"
```

---

## 🔧 Complete Setup Verification

### Test Both Services
```bash
cd backend
node -e "const NotificationService = require('./services/notificationService'); NotificationService.testNotificationService().then(console.log)"
```

### Expected Output
```
✅ Email Service: Gmail SMTP initialized for production
✅ SMS Service: Twilio initialized successfully
🧪 Testing Notification Service...
✅ Email service test successful
✅ SMS Service test successful
✅ Notification service test completed
```

---

## 🚨 Troubleshooting

### Email Issues
- **"Invalid credentials"**: Check app password, not regular password
- **"Less secure app access"**: Use app passwords instead
- **"Quota exceeded"**: Gmail has daily sending limits

### SMS Issues
- **"Authentication failed"**: Check SID and Auth Token
- **"Phone number not verified"**: Verify your phone in Twilio
- **"Insufficient funds"**: Add credit to Twilio account

---

## 💰 Cost Information

### Email (Gmail)
- **Free**: Up to 500 emails/day
- **Paid**: Google Workspace for higher limits

### SMS (Twilio)
- **Free Trial**: $15-20 credit
- **Paid**: ~$0.0075 per SMS (US)
- **International**: Varies by country

---

## 🎯 Production Recommendations

### For MVP/Launch
1. **Use Gmail SMTP** (free, reliable)
2. **Skip Twilio** initially (save costs)
3. **Focus on email notifications**

### For Scale
1. **Add Twilio** for SMS
2. **Consider SendGrid** for email
3. **Implement delivery tracking**

---

## 📋 Quick Start Commands

```bash
# 1. Update config.env with your credentials
# 2. Install dependencies
npm install

# 3. Test services
node -e "require('./services/notificationService').testNotificationService().then(console.log)"

# 4. Start server
npm start
```

---

## 🔐 Security Notes

- **Never commit** real credentials to Git
- **Use environment variables** for all secrets
- **Rotate app passwords** regularly
- **Monitor usage** to prevent abuse
- **Implement rate limiting** for OTP requests

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Test services individually
4. Check server logs for detailed error messages

---

**🎉 Congratulations! Your SkillPort notification system is now production-ready!**
