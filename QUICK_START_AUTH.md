# 🚀 Quick Start Guide - Authentication System

## Step 1: Apply Database Changes

```bash
cd apps/web

# Generate Prisma Client (DONE ✅)
npx prisma generate

# Push schema changes to database
npx prisma db push

# (Optional) Run seed if you want test data
npx prisma db seed
```

## Step 2: Configure Environment Variables

Create/update `.env` file in `apps/web`:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/skillport_db"

# JWT Secret
JWT_SECRET="your-super-secure-jwt-secret-key-minimum-32-characters-long"
JWT_EXPIRES_IN="24h"

# Email Configuration (Gmail)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@skillport.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Getting Gmail App Password:
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new
4. Use the generated 16-character password

## Step 3: Test the APIs

### Test 1: Register as Community Admin

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "admin@test.com",
    "password": "Admin@123456",
    "role": "COMMUNITY_ADMIN",
    "communityName": "Test Learning Community"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email for OTP verification.",
  "data": {
    "email": "admin@test.com",
    "role": "COMMUNITY_ADMIN",
    "requiresOTP": true,
    "communityCode": "XXXXX",
    "otp": "123456"  // Only in dev mode
  }
}
```

### Test 2: Verify OTP

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "otp": "123456"
  }'
```

### Test 3: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "Test Admin",
      "email": "admin@test.com",
      "role": "COMMUNITY_ADMIN",
      "communityId": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "redirectUrl": "/community/dashboard"
  }
}
```

### Test 4: Add a Mentor (Use token from login)

```bash
curl -X POST http://localhost:3000/api/admin/add-mentor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Mentor",
    "email": "mentor@test.com",
    "subject": "Mathematics",
    "password": "Mentor@123"
  }'
```

### Test 5: Add a Student

```bash
curl -X POST http://localhost:3000/api/admin/add-student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "batchName": "Batch 2024-A"
  }'
```

## Step 4: Frontend Testing

### 1. Start the Development Server

```bash
cd apps/web
npm run dev
```

### 2. Test Registration Flow

Visit: `http://localhost:3000/auth/register`

1. Select "Community Admin" or "Personal User"
2. Fill in the form
3. Submit
4. Check console for OTP (if email not configured)
5. Use OTP to verify
6. Login

### 3. Test Login Flow

Visit: `http://localhost:3000/auth/login`

1. Enter email and password
2. Submit
3. Should redirect to correct dashboard based on role:
   - Admin → `/admin/dashboard`
   - Community Admin → `/community/dashboard`
   - Mentor → `/mentor/dashboard`
   - Student → `/student/dashboard`
   - Personal → `/personal/dashboard`

## Step 5: Test Role-Based Redirects

### Expected Behavior:

1. **Unverified User Login Attempt:**
   - ❌ Login blocked
   - Message: "Please verify your email first"

2. **Admin Login:**
   - ✅ Login successful
   - Redirect to `/admin/dashboard`
   - Cannot access `/mentor/dashboard`

3. **Mentor Login:**
   - ✅ Login successful
   - Redirect to `/mentor/dashboard`
   - Cannot access `/admin/dashboard`

4. **Student Login:**
   - ✅ Login successful
   - Redirect to `/student/dashboard`

5. **Personal User Login:**
   - ✅ Login successful
   - Redirect to `/personal/dashboard`

## Common Issues & Solutions

### Issue 1: Email Not Sending

**Solution:**
- Check EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env
- For Gmail, use App Password (not regular password)
- OTP will be logged to console in development mode

### Issue 2: "User not verified" on login

**Solution:**
- Use the OTP verification endpoint first
- Check console logs for OTP in dev mode
- OTP expires in 10 minutes, request new one

### Issue 3: JWT Token Error

**Solution:**
- Ensure JWT_SECRET is set in .env
- Must be at least 32 characters long
- Restart server after changing .env

### Issue 4: Database Connection Error

**Solution:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Run `npx prisma db push` to sync schema

### Issue 5: Role Redirect Not Working

**Solution:**
- Clear localStorage: `localStorage.clear()`
- Check token in localStorage contains correct role
- Verify API response includes redirectUrl

## Debugging Tips

### 1. Check User in Database

```bash
cd apps/web
npx prisma studio
```

Navigate to `User` model and check:
- `isVerified` should be `true` after OTP verification
- `otpCode` should be `null` after verification
- `role` should match expected role

### 2. Check JWT Token Contents

In browser console:
```javascript
const token = localStorage.getItem('token')
const decoded = JSON.parse(atob(token.split('.')[1]))
console.log(decoded)
```

Should show:
```json
{
  "id": "user_id",
  "email": "user@test.com",
  "role": "COMMUNITY_ADMIN",
  "communityId": "comm_id",
  "name": "User Name"
}
```

### 3. Check API Responses

In browser DevTools Network tab:
- Look for `/api/auth/login` response
- Should include `redirectUrl` field
- Check `data.user.role` matches expected role

## Next Steps

1. **Frontend Integration:**
   - Update register page to show OTP form
   - Create OTP verification page
   - Add protected route wrappers
   - Implement role-based navigation

2. **Admin Features:**
   - Create add mentor form
   - Create add student form
   - Implement batch management
   - Show community code to admin

3. **Community Features:**
   - Create community join page
   - Show public/private badge
   - Display batch assignments
   - List community members

## Support

If you encounter any issues:

1. Check `AUTH_IMPLEMENTATION_GUIDE.md` for detailed documentation
2. Review console logs for errors
3. Verify all environment variables are set
4. Ensure database schema is up to date
5. Check that JWT_SECRET is properly configured

**All authentication features are ready! Start testing and building your UI! 🎉**

