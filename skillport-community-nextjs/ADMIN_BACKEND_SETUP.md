# Admin Panel Backend Setup Guide

This guide will help you set up the complete backend API for the Admin Panel.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm or yarn package manager

## 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skillport_community"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
JWT_EXPIRES_IN="24h"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Database Setup

### Generate Prisma Client
```bash
npm run db:generate
```

### Push Database Schema
```bash
npm run db:push
```

### Seed Admin Data
```bash
npm run db:seed:admin
```

This will create:
- Admin user: `admin@skillport.com` / `admin123`
- Sample mentor: `mentor@skillport.com` / `mentor123`
- Sample students: `student1@skillport.com` / `student123`
- Sample batch and contest data

## 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/admin`

## 5. Test the API

### Login Test
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillport.com","password":"admin123"}'
```

### Dashboard Test (with token from login)
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 6. API Endpoints Overview

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout

### Dashboard
- `GET /api/admin/dashboard` - Dashboard statistics

### User Management
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Mentor Management
- `GET /api/admin/mentors` - List mentors
- `POST /api/admin/mentors` - Create mentor
- `PUT /api/admin/mentors/[id]` - Update mentor
- `DELETE /api/admin/mentors/[id]` - Delete mentor

### Contest Management
- `GET /api/admin/contests` - List contests
- `POST /api/admin/contests` - Create contest
- `PUT /api/admin/contests/[id]` - Update contest
- `DELETE /api/admin/contests/[id]` - Delete contest
- `GET /api/admin/contests/[id]/participants` - Get participants
- `POST /api/admin/contests/[id]/participants` - Add participants
- `DELETE /api/admin/contests/[id]/participants/[userId]` - Remove participant

### Analytics
- `GET /api/admin/analytics` - Get analytics data

### Leaderboard
- `GET /api/admin/leaderboard` - Get leaderboard data

### Profile Management
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `PUT /api/admin/profile/password` - Change password

### Batch Management
- `GET /api/admin/batches` - List batches
- `POST /api/admin/batches` - Create batch
- `PUT /api/admin/batches/[id]` - Update batch
- `DELETE /api/admin/batches/[id]` - Delete batch
- `POST /api/admin/batches/[id]/students` - Add students
- `DELETE /api/admin/batches/[id]/students/[userId]` - Remove student

### File Upload
- `POST /api/admin/upload/avatar` - Upload avatar

## 7. Database Schema

The admin panel uses the following main models:

### Core Models
- **Admin** - Admin users
- **User** - Students, mentors, and other users
- **Mentor** - Mentor-specific data
- **Batch** - Student batches
- **Contest** - Programming contests
- **ContestParticipant** - Contest participation records

### Relationship Models
- **MentorBatch** - Mentor-batch assignments
- **ActivityLog** - Admin action logs

### Personal Models (existing)
- **Task** - User tasks
- **Project** - User projects
- **Community** - Communities
- **Post** - Community posts
- **Comment** - Post comments
- **Badge** - User badges
- **Skill** - User skills

## 8. Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Token expiration handling

### Authorization
- Admin-only access to all endpoints
- Role-based access control
- Activity logging for audit trails

### Input Validation
- Request body validation
- File upload validation
- SQL injection prevention via Prisma

### Error Handling
- Consistent error responses
- Proper HTTP status codes
- Detailed error logging

## 9. Frontend Integration

### Example Login
```javascript
const login = async (email, password) => {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('adminToken', data.data.token);
    return data.data.admin;
  }
  throw new Error(data.message);
};
```

### Example API Call with Auth
```javascript
const fetchDashboard = async () => {
  const token = localStorage.getItem('adminToken');
  const response = await fetch('/api/admin/dashboard', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message);
};
```

## 10. Production Deployment

### Environment Variables
Make sure to set strong, unique values for:
- `JWT_SECRET` - Use a long, random string
- `DATABASE_URL` - Your production database URL
- `NEXTAUTH_SECRET` - Random secret for NextAuth

### Database
- Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Set up proper backups
- Configure connection pooling

### Security
- Enable HTTPS
- Set up CORS properly
- Use environment variables for all secrets
- Regular security updates

### Monitoring
- Set up logging (Winston, Pino)
- Monitor API performance
- Set up error tracking (Sentry)

## 11. Troubleshooting

### Common Issues

**Database Connection Error**
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify credentials

**JWT Token Issues**
- Check JWT_SECRET is set
- Verify token format in requests
- Check token expiration

**File Upload Issues**
- Ensure uploads directory exists
- Check file size limits
- Verify file type restrictions

**CORS Issues**
- Configure CORS in Next.js
- Check allowed origins
- Verify preflight requests

### Debug Commands

```bash
# Check database connection
npm run db:studio

# View logs
npm run dev 2>&1 | grep ERROR

# Test specific endpoint
curl -v http://localhost:3000/api/admin/dashboard
```

## 12. API Documentation

For complete API documentation, see `ADMIN_API_DOCUMENTATION.md` in the project root.

## 13. Support

If you encounter any issues:

1. Check the console logs for errors
2. Verify environment variables
3. Test database connectivity
4. Check API endpoint responses
5. Review the API documentation

The backend is now ready for frontend integration!
