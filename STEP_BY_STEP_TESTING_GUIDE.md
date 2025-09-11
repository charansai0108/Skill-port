# 🧪 SkillPort Community - Step-by-Step Testing Guide

## 🎯 **Testing Status Summary**

**Current Status:** 🔴 **NEEDS SETUP** - Services not running  
**Test Results:** 0/5 tests passed (0%)  
**Next Action:** Start all required services

---

## 🚀 **Step 1: Start All Services**

### **1.1 Start OTP Server**
```bash
# In Terminal 1
npm start
```
**Expected Output:**
```
OTP Server running on port 3001
Health check endpoint: http://localhost:3001/health
```

### **1.2 Start Firebase Emulators**
```bash
# In Terminal 2
npm run emulator
```
**Expected Output:**
```
✔  functions: Emulator started at http://localhost:5001
✔  firestore: Emulator started at http://localhost:8080
✔  hosting: Emulator started at http://localhost:5000
✔  ui: Emulator UI started at http://localhost:4000
```

### **1.3 Verify Services Are Running**
```bash
# In Terminal 3
node scripts/test-app.js
```
**Expected Output:**
```
📈 Overall Results: 5/5 tests passed (100%)
🎉 All tests passed! Your app is ready for use.
```

---

## 🧪 **Step 2: Run Automated Tests**

### **2.1 Run Unit Tests**
```bash
npm run test:unit
```
**Expected:** Most tests should pass (aim for >80% pass rate)

### **2.2 Run Integration Tests**
```bash
npm run test:integration
```
**Expected:** Database and API tests should pass

### **2.3 Run End-to-End Tests**
```bash
npm run test:e2e
```
**Expected:** User flow tests should pass

---

## 🖥️ **Step 3: Manual Testing**

### **3.1 Test Frontend Access**
1. **Open Browser:** Go to http://localhost:5000
2. **Expected:** SkillPort Community homepage loads
3. **Test Navigation:** Click through main pages

### **3.2 Test Authentication Flow**
1. **Registration:**
   - Go to http://localhost:5000/pages/auth/register.html
   - Fill out registration form
   - Check email for OTP
   - Enter OTP code
   - Verify account creation

2. **Login:**
   - Go to http://localhost:5000/pages/auth/login.html
   - Enter credentials
   - Verify successful login
   - Check role-based redirect

### **3.3 Test Dashboard Pages**
1. **Student Dashboard:**
   - Login as student
   - Go to http://localhost:5000/pages/student/user-dashboard.html
   - Verify dynamic content loads
   - Test navigation

2. **Mentor Dashboard:**
   - Login as mentor
   - Go to http://localhost:5000/pages/mentor/mentor-dashboard.html
   - Verify mentor-specific content
   - Test student management

3. **Admin Dashboard:**
   - Login as admin
   - Go to http://localhost:5000/pages/admin/admin-dashboard.html
   - Verify admin controls
   - Test user management

### **3.4 Test OTP Functionality**
1. **Send OTP:**
   ```bash
   curl -X POST http://localhost:3001/api/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. **Verify OTP:**
   ```bash
   curl -X POST http://localhost:3001/api/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","otp":"123456"}'
   ```

---

## 🔧 **Step 4: Troubleshooting**

### **4.1 If OTP Server Won't Start**
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Check OTP server logs
npm start
```

### **4.2 If Firebase Emulators Won't Start**
```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Reset emulator data
rm -rf .firebase

# Start emulators with fresh data
firebase emulators:start --only functions,firestore,hosting,storage
```

### **4.3 If Frontend Won't Load**
```bash
# Check client directory
ls -la client/

# Verify firebase.json hosting config
cat firebase.json

# Start only hosting emulator
firebase emulators:start --only hosting
```

### **4.4 If Tests Are Failing**
```bash
# Clear test cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test tests/unit/frontend/authService.test.js
```

---

## 📊 **Step 5: Performance Testing**

### **5.1 Load Testing**
```bash
# Test OTP server performance
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/send-otp \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com"}' &
done
```

### **5.2 Response Time Testing**
```bash
# Test response times
time curl -s http://localhost:5000
time curl -s http://localhost:3001/health
```

---

## 🔒 **Step 6: Security Testing**

### **6.1 Authentication Testing**
1. **Test Invalid Credentials:**
   - Try logging in with wrong password
   - Verify error handling

2. **Test Role-Based Access:**
   - Try accessing admin pages as student
   - Verify proper redirects

3. **Test OTP Security:**
   - Try invalid OTP codes
   - Test rate limiting

### **6.2 Input Validation Testing**
1. **Test Form Validation:**
   - Submit empty forms
   - Test invalid email formats
   - Test SQL injection attempts

---

## 📱 **Step 7: Browser Testing**

### **7.1 Test Different Browsers**
- **Chrome:** Primary browser
- **Firefox:** Secondary browser
- **Safari:** macOS testing
- **Edge:** Windows testing

### **7.2 Test Different Devices**
- **Desktop:** 1920x1080
- **Tablet:** 768x1024
- **Mobile:** 375x667

---

## 📋 **Step 8: Testing Checklist**

### **✅ Pre-Testing Setup**
- [ ] All services started (OTP server, Firebase emulators)
- [ ] Test script passes (5/5 tests)
- [ ] Frontend accessible at http://localhost:5000
- [ ] OTP server accessible at http://localhost:3001

### **✅ Automated Tests**
- [ ] Unit tests pass (>80% pass rate)
- [ ] Integration tests pass (>80% pass rate)
- [ ] End-to-end tests pass (>80% pass rate)

### **✅ Manual Testing**
- [ ] Homepage loads correctly
- [ ] Registration flow works
- [ ] Login flow works
- [ ] OTP verification works
- [ ] Dashboard pages load
- [ ] Role-based access works
- [ ] Navigation works

### **✅ Performance Testing**
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] OTP generation < 2 seconds
- [ ] Database queries < 500ms

### **✅ Security Testing**
- [ ] Authentication works
- [ ] Authorization works
- [ ] Input validation works
- [ ] Error handling works

---

## 🎯 **Expected Results**

### **✅ Success Criteria**
- **All Services Running:** 5/5 tests pass
- **Automated Tests:** >80% pass rate
- **Manual Testing:** All user flows work
- **Performance:** Response times acceptable
- **Security:** Authentication and authorization work

### **❌ Failure Indicators**
- **Services Not Running:** 0/5 tests pass
- **Automated Tests:** <50% pass rate
- **Manual Testing:** User flows broken
- **Performance:** Slow response times
- **Security:** Authentication issues

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: OTP Server Not Starting**
**Solution:**
```bash
# Check port availability
lsof -i :3001

# Kill conflicting process
kill -9 <PID>

# Restart OTP server
npm start
```

### **Issue 2: Firebase Emulators Not Starting**
**Solution:**
```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Reset emulator data
rm -rf .firebase

# Start emulators
firebase emulators:start --only functions,firestore,hosting,storage
```

### **Issue 3: Frontend Not Loading**
**Solution:**
```bash
# Check client directory
ls -la client/

# Verify hosting config
cat firebase.json

# Start hosting emulator
firebase emulators:start --only hosting
```

### **Issue 4: Tests Failing**
**Solution:**
```bash
# Clear test cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose

# Check test configuration
cat package.json
```

---

## 🎉 **Success!**

Once all tests pass and manual testing is complete, your SkillPort Community app is ready for use!

### **Final Verification:**
```bash
# Run final test
node scripts/test-app.js

# Expected output:
# 📈 Overall Results: 5/5 tests passed (100%)
# 🎉 All tests passed! Your app is ready for use.
```

### **Access Your App:**
- **Frontend:** http://localhost:5000
- **OTP Server:** http://localhost:3001
- **Emulator UI:** http://localhost:4000

---

**Happy Testing! 🧪✨**
