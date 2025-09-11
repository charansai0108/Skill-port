# 🔐 Manual Verification Guide - SkillPort Authentication Flow

## Prerequisites

1. **Start OTP Server:**
   ```bash
   cd /Users/saicharan/Downloads/skillport-community
   node otp-server.js &
   ```

2. **Start Frontend Server:**
   ```bash
   cd /Users/saicharan/Downloads/skillport-community/client
   python3 -m http.server 3000 &
   ```

3. **Start Firebase Emulators (Optional):**
   ```bash
   cd /Users/saicharan/Downloads/skillport-community
   firebase emulators:start --only auth,firestore,functions --project skillport-a0c39
   ```

## Test Scenarios

### Scenario 1: Complete Registration Flow ✅

**Steps:**
1. Open browser: `http://localhost:3000/pages/auth/register.html`
2. Fill registration form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create Account"
4. **Expected:** Redirected to OTP verification page
5. Check email for OTP code
6. Enter 6-digit OTP code
7. Click "Verify OTP"
8. **Expected:** 
   - Success message displayed
   - Redirected to `/pages/personal/student-dashboard.html`
   - User can access dashboard

**Console Logs to Verify:**
```
✅ Registration completed successfully
✅ User marked as OTP verified
✅ User verified via OTP
🔐 AuthManager: User verified, proceeding with authentication
```

### Scenario 2: Unverified User Blocked ❌

**Steps:**
1. Register a new user but **DO NOT** complete OTP verification
2. Try to access: `http://localhost:3000/pages/personal/student-dashboard.html`
3. **Expected:** 
   - Redirected to login page
   - Message: "Please complete email or OTP verification before logging in."

**Console Logs to Verify:**
```
❌ User not OTP verified, signing out...
🔐 AuthManager: User not verified, signing out and redirecting to login
```

### Scenario 3: Login with Verified User ✅

**Steps:**
1. Complete registration flow (Scenario 1)
2. Logout from dashboard
3. Go to: `http://localhost:3000/pages/auth/login.html`
4. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
5. Click "Login"
6. **Expected:** 
   - Direct redirect to dashboard
   - No OTP screen
   - Full access to personal pages

**Console Logs to Verify:**
```
✅ User verified via OTP
🔐 AuthManager: User verified, proceeding with authentication
```

### Scenario 4: Protected Route Security 🔒

**Test Protected Routes:**
- `http://localhost:3000/pages/personal/student-dashboard.html`
- `http://localhost:3000/pages/personal/profile.html`
- `http://localhost:3000/pages/personal/stats.html`
- `http://localhost:3000/pages/personal/projects.html`
- `http://localhost:3000/pages/personal/tracker.html`

**Expected Behavior:**
- **Unverified users:** Redirected to login with verification message
- **Verified users:** Full access to all pages

## HTTP API Testing

### Test OTP Generation:
```bash
curl -X POST http://localhost:5002/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Test OTP Verification:
```bash
curl -X POST http://localhost:5002/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

## Firestore Verification

### Check User Document:
1. Open Firebase Console: `http://localhost:4000` (if emulators running)
2. Navigate to Firestore Database
3. Check `users/{uid}` document
4. **Verify Fields:**
   - `otpVerified: true`
   - `otpVerifiedAt: timestamp`
   - `email: "test@example.com"`
   - `firstName: "Test"`
   - `lastName: "User"`

## Error Scenarios

### Test Error Handling:

1. **Invalid OTP:**
   - Enter wrong OTP code
   - **Expected:** Error message, stay on verification page

2. **Expired OTP:**
   - Wait 10+ minutes, then enter OTP
   - **Expected:** "OTP has expired" message

3. **Network Error:**
   - Disconnect internet during registration
   - **Expected:** Error message with retry option

4. **Duplicate Email:**
   - Try to register with existing email
   - **Expected:** Graceful handling, proceed to login

## Console Debugging

### Key Console Messages to Look For:

**Success Flow:**
```
✅ Registration completed successfully
✅ User marked as OTP verified
✅ User verified via OTP
🔐 AuthManager: User verified, proceeding with authentication
```

**Error Flow:**
```
❌ User not OTP verified, signing out...
🔐 AuthManager: User not verified, signing out and redirecting to login
⚠️ OTP not verified, redirecting to login...
```

**Registration Errors:**
```
❌ Error completing registration: [error details]
Registration completion failed: [error details]
```

## Performance Testing

### Load Testing:
1. Register 10+ users simultaneously
2. Verify all OTP emails are sent
3. Complete verification for all users
4. **Expected:** All users can access dashboards

### Browser Compatibility:
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## Security Verification

### Test Security Measures:
1. **Direct URL Access:** Try accessing protected pages without login
2. **Session Persistence:** Refresh page, verify user stays logged in
3. **Logout:** Verify complete session cleanup
4. **Multiple Tabs:** Test behavior across multiple browser tabs

## Final Checklist

- [ ] Registration flow works end-to-end
- [ ] OTP verification marks users as verified
- [ ] Unverified users are blocked from protected pages
- [ ] Verified users can access all personal pages
- [ ] Error handling works for all failure scenarios
- [ ] Console logging provides clear debugging info
- [ ] No authentication loops or crashes
- [ ] Firestore documents are created correctly
- [ ] Email notifications are sent successfully

## Troubleshooting

### Common Issues:

1. **"Unexpected reserved word" error:**
   - Check for `await` outside `async` functions
   - Verify all async functions are properly declared

2. **"Cannot access before initialization" error:**
   - Check variable declarations in register method
   - Ensure variables are declared before use

3. **Authentication loops:**
   - Verify OTP verification is properly marked in Firestore
   - Check auth state change handlers

4. **OTP not received:**
   - Check OTP server is running on port 5002
   - Verify Gmail credentials in otp-server.js
   - Check spam folder

### Debug Commands:
```bash
# Check if OTP server is running
curl http://localhost:5002/api/health

# Check if frontend server is running
curl http://localhost:3000

# Check Firebase emulators
curl http://localhost:4000
```

## Success Criteria

✅ **All tests pass when:**
- Users can register and verify via OTP
- Verified users access dashboards without issues
- Unverified users are properly blocked
- No runtime errors in console
- All protected routes work correctly
- Error handling is robust and user-friendly

**The authentication system is production-ready when all scenarios pass!** 🎉
