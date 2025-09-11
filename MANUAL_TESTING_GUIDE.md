# 🧪 **MANUAL TESTING GUIDE - SKILLPORT PROJECT**

## 🎯 **COMPREHENSIVE MANUAL TESTING CHECKLIST**

This guide provides step-by-step instructions for manually testing all features of the SkillPort project.

---

## 🚀 **PREREQUISITES & SETUP**

### 1. **Start Required Services**
```bash
# Terminal 1: Start OTP Server
cd /Users/saicharan/Downloads/skillport-community
node otp-server.js

# Terminal 2: Start Frontend Server
cd /Users/saicharan/Downloads/skillport-community/client
python3 -m http.server 3000

# Terminal 3: Start Extension Server (if needed)
cd /Users/saicharan/Downloads/skillport-community/SKILL-EXTENSION
npm install  # Install missing dependencies first
node server.js
```

### 2. **Verify Services are Running**
- ✅ OTP Server: http://localhost:5002
- ✅ Frontend: http://localhost:3000
- ✅ Extension Server: http://localhost:5003 (if started)

---

## 🌐 **FRONTEND TESTING**

### **Test 1: Landing Page**
1. **Navigate to:** http://localhost:3000
2. **Expected:** Page loads with SkillPort branding
3. **Check:**
   - ✅ Page loads without errors
   - ✅ Navigation menu is visible
   - ✅ "Get Started" or "Sign Up" button works
   - ✅ Responsive design on mobile/tablet

### **Test 2: User Registration**
1. **Navigate to:** http://localhost:3000/pages/auth/register.html
2. **Fill out form:**
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`
   - Role: `Personal`
3. **Click "Register"**
4. **Expected:**
   - ✅ Form validation works
   - ✅ OTP email is sent
   - ✅ Success message appears
   - ✅ Redirect to OTP verification

### **Test 3: OTP Verification**
1. **Check email:** `test@example.com` (or use `skillport24@gmail.com`)
2. **Find OTP email** with 6-digit code
3. **Enter OTP code** in verification page
4. **Expected:**
   - ✅ Valid OTP is accepted
   - ✅ Invalid OTP shows error
   - ✅ Expired OTP shows error
   - ✅ Success redirect to dashboard

### **Test 4: User Login**
1. **Navigate to:** http://localhost:3000/pages/auth/login.html
2. **Enter credentials:**
   - Email: `test@example.com`
   - Password: `TestPassword123!`
3. **Click "Login"**
4. **Expected:**
   - ✅ Successful login
   - ✅ Redirect to appropriate dashboard
   - ✅ User session maintained

### **Test 5: Dashboard Pages**
1. **Personal Dashboard:** http://localhost:3000/pages/personal/student-dashboard.html
2. **Mentor Dashboard:** http://localhost:3000/pages/mentor/mentor-dashboard.html
3. **Admin Dashboard:** http://localhost:3000/pages/admin/admin-dashboard.html
4. **Expected:**
   - ✅ Pages load without errors
   - ✅ Dynamic content displays
   - ✅ Role-based features visible
   - ✅ Navigation works

### **Test 6: Community Features**
1. **Navigate to:** http://localhost:3000/pages/community.html
2. **Test:**
   - ✅ View communities
   - ✅ Join community (if available)
   - ✅ Create community (if admin)
   - ✅ Community management features

### **Test 7: Contest Features**
1. **Navigate to:** http://localhost:3000/pages/student/user-contests.html
2. **Test:**
   - ✅ View available contests
   - ✅ Join contest
   - ✅ Submit solutions
   - ✅ View leaderboard

---

## 📧 **EMAIL SYSTEM TESTING**

### **Test 8: OTP Email Generation**
```bash
# Test OTP generation via API
curl -X POST http://localhost:5002/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "firstName": "Test", "lastName": "User"}'
```
**Expected:**
- ✅ Response: `{"success":true,"message":"OTP sent successfully"}`
- ✅ Email received in inbox
- ✅ Professional template with red/orange branding

### **Test 9: Welcome Email**
```bash
# Test welcome email
curl -X POST http://localhost:5002/api/email/registration-welcome \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "firstName": "Test", "lastName": "User"}'
```
**Expected:**
- ✅ Welcome email received
- ✅ "Your learning journey starts now" tagline
- ✅ Professional branding

### **Test 10: Password Reset Email**
```bash
# Test password reset
curl -X POST http://localhost:5002/api/email/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "firstName": "Test", "lastName": "User", "resetLink": "https://skillport.com/reset?token=test123"}'
```
**Expected:**
- ✅ Password reset email received
- ✅ Reset link included
- ✅ Security notice included

---

## 🔧 **BROWSER EXTENSION TESTING**

### **Test 11: Extension Installation**
1. **Open Chrome/Edge**
2. **Go to:** `chrome://extensions/`
3. **Enable Developer Mode**
4. **Click "Load unpacked"**
5. **Select:** `/Users/saicharan/Downloads/skillport-community/SKILL-EXTENSION`
6. **Expected:**
   - ✅ Extension loads without errors
   - ✅ SkillPort Tracker icon appears
   - ✅ No permission errors

### **Test 12: Extension Popup**
1. **Click extension icon**
2. **Expected:**
   - ✅ Popup opens
   - ✅ User interface displays
   - ✅ Settings accessible
   - ✅ Statistics visible

### **Test 13: Content Script Testing**
1. **Navigate to:** https://leetcode.com/problems/two-sum/
2. **Solve the problem** (or view existing solution)
3. **Expected:**
   - ✅ Extension detects problem
   - ✅ Code extraction works
   - ✅ Submission tracking
   - ✅ Data sync with backend

### **Test 14: Multi-Platform Testing**
Test on all supported platforms:
- ✅ **LeetCode:** https://leetcode.com/problems/
- ✅ **GeeksforGeeks:** https://practice.geeksforgeeks.org/problems/
- ✅ **HackerRank:** https://www.hackerrank.com/challenges/
- ✅ **InterviewBit:** https://www.interviewbit.com/problems/

---

## 🔗 **API ENDPOINT TESTING**

### **Test 15: Health Check**
```bash
curl http://localhost:5002/api/email/test-connection
```
**Expected:** `{"success":true,"message":"Email service connection successful"}`

### **Test 16: OTP Verification**
```bash
# Test with wrong OTP
curl -X POST http://localhost:5002/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "000000"}'
```
**Expected:** `{"success":false,"message":"Invalid OTP","attemptsLeft":2}`

### **Test 17: Rate Limiting**
```bash
# Send multiple OTP requests quickly
for i in {1..5}; do
  curl -X POST http://localhost:5002/api/otp/generate \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "firstName": "Test", "lastName": "User"}'
done
```
**Expected:** Rate limiting kicks in after multiple requests

---

## 🛡️ **SECURITY TESTING**

### **Test 18: Authentication Protection**
1. **Try accessing protected pages without login:**
   - http://localhost:3000/pages/admin/admin-dashboard.html
   - http://localhost:3000/pages/mentor/mentor-dashboard.html
2. **Expected:**
   - ✅ Redirect to login page
   - ✅ Access denied for unauthorized users

### **Test 19: Role-Based Access**
1. **Login as different user types:**
   - Personal user
   - Student user
   - Mentor user
   - Admin user
2. **Test access to different features:**
   - ✅ Personal users: Basic features
   - ✅ Students: Community access
   - ✅ Mentors: Student management
   - ✅ Admins: Full system access

### **Test 20: Input Validation**
1. **Test registration form with invalid data:**
   - Empty fields
   - Invalid email format
   - Weak passwords
   - Special characters in names
2. **Expected:**
   - ✅ Validation errors displayed
   - ✅ Form submission blocked
   - ✅ User-friendly error messages

---

## 📱 **MOBILE RESPONSIVENESS TESTING**

### **Test 21: Mobile View**
1. **Open browser developer tools**
2. **Switch to mobile view** (iPhone/Android)
3. **Test all pages:**
   - Landing page
   - Registration/Login
   - Dashboards
   - Community pages
4. **Expected:**
   - ✅ Responsive design
   - ✅ Touch-friendly buttons
   - ✅ Readable text
   - ✅ Proper navigation

### **Test 22: Email Mobile View**
1. **Check emails on mobile device**
2. **Expected:**
   - ✅ Mobile-optimized templates
   - ✅ Readable fonts
   - ✅ Proper spacing
   - ✅ Clickable buttons

---

## 🚀 **DEPLOYMENT TESTING**

### **Test 23: Production Site**
1. **Navigate to:** https://skillport-a0c39.web.app
2. **Test:**
   - ✅ Site loads correctly
   - ✅ All features work
   - ✅ SSL certificate valid
   - ✅ Performance acceptable

### **Test 24: Cross-Browser Testing**
Test on different browsers:
- ✅ **Chrome:** Latest version
- ✅ **Firefox:** Latest version
- ✅ **Safari:** Latest version
- ✅ **Edge:** Latest version

---

## 📊 **PERFORMANCE TESTING**

### **Test 25: Page Load Times**
1. **Measure load times:**
   - Landing page: < 2 seconds
   - Dashboard pages: < 3 seconds
   - Email delivery: < 5 seconds
2. **Expected:**
   - ✅ Fast loading times
   - ✅ No timeout errors
   - ✅ Smooth user experience

### **Test 26: Concurrent Users**
1. **Open multiple browser tabs**
2. **Test simultaneous operations:**
   - Multiple registrations
   - Multiple OTP requests
   - Multiple dashboard loads
3. **Expected:**
   - ✅ System handles load
   - ✅ No crashes or errors
   - ✅ Consistent performance

---

## 🐛 **ERROR HANDLING TESTING**

### **Test 27: Network Errors**
1. **Disconnect internet**
2. **Try to:**
   - Register new user
   - Login
   - Send OTP
3. **Expected:**
   - ✅ Graceful error handling
   - ✅ User-friendly messages
   - ✅ Retry mechanisms

### **Test 28: Invalid Data**
1. **Test with invalid inputs:**
   - SQL injection attempts
   - XSS attempts
   - Invalid file uploads
2. **Expected:**
   - ✅ Input sanitization
   - ✅ Security protection
   - ✅ Error logging

---

## 📋 **TESTING CHECKLIST**

### ✅ **Core Functionality**
- [ ] Landing page loads
- [ ] User registration works
- [ ] OTP generation and verification
- [ ] User login/logout
- [ ] Dashboard access
- [ ] Role-based permissions

### ✅ **Email System**
- [ ] OTP emails delivered
- [ ] Welcome emails sent
- [ ] Password reset emails
- [ ] Email templates render correctly
- [ ] Mobile email optimization

### ✅ **Extension**
- [ ] Extension installs
- [ ] Popup interface works
- [ ] Content scripts function
- [ ] Multi-platform support
- [ ] Data synchronization

### ✅ **Security**
- [ ] Authentication protection
- [ ] Role-based access
- [ ] Input validation
- [ ] Rate limiting
- [ ] Secure data handling

### ✅ **Performance**
- [ ] Fast page loads
- [ ] Responsive design
- [ ] Cross-browser compatibility
- [ ] Mobile optimization
- [ ] Error handling

---

## 🎯 **QUICK TEST COMMANDS**

### **Essential Tests (5 minutes):**
```bash
# 1. Check services
curl http://localhost:3000
curl http://localhost:5002/api/email/test-connection

# 2. Test OTP
curl -X POST http://localhost:5002/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "firstName": "Test", "lastName": "User"}'

# 3. Test email
curl -X POST http://localhost:5002/api/email/registration-welcome \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "firstName": "Test", "lastName": "User"}'
```

### **Full Test Suite (30 minutes):**
1. ✅ Start all services
2. ✅ Test frontend pages
3. ✅ Test user registration/login
4. ✅ Test email system
5. ✅ Test extension functionality
6. ✅ Test security features
7. ✅ Test mobile responsiveness
8. ✅ Test production site

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**
1. **Port conflicts:** Change ports in configuration
2. **Missing dependencies:** Run `npm install` in each directory
3. **Firebase auth:** Ensure proper configuration
4. **Email delivery:** Check Gmail app password
5. **Extension errors:** Check browser console

### **Debug Commands:**
```bash
# Check running processes
ps aux | grep node

# Check port usage
lsof -i :3000
lsof -i :5002

# Check logs
tail -f /path/to/logfile
```

---

**🎉 Happy Testing! This guide covers all major functionality of the SkillPort project.**
