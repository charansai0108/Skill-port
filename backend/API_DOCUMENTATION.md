# 🚀 SkillPort Backend API Documentation

## **Base URL**
```
http://localhost:5001/api/v1
```

## **Authentication**
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## **🔐 Authentication Endpoints**

### **POST /auth/register**
Register a new user (Personal or Community Admin)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "password123",
  "role": "personal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration initiated. Please check your email for OTP verification.",
  "data": {
    "userId": "user_id",
    "email": "john@example.com",
    "role": "personal",
    "otpSent": true
  }
}
```

### **POST /auth/login**
User login

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "personal"
    }
  }
}
```

### **POST /auth/verify-otp**
Verify email with OTP

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "password": "password123"
}
```

---

## **👥 User Management Endpoints**

### **GET /users/profile**
Get current user profile

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "student",
      "community": "community_data",
      "batch": "Batch 2024-A"
    }
  }
}
```

### **PUT /users/profile**
Update user profile

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Software Developer"
}
```

---

## **🏢 Community Management Endpoints**

### **GET /communities**
Get all public communities

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": {
    "communities": [
      {
        "id": "community_id",
        "name": "SkillPort Academy",
        "code": "SKILLPORT",
        "description": "Official SkillPort Academy Community",
        "stats": {
          "totalStudents": 10,
          "totalMentors": 3,
          "totalContests": 1,
          "totalProjects": 0
        }
      }
    ]
  }
}
```

### **GET /communities/:id**
Get specific community details

**Response:**
```json
{
  "success": true,
  "data": {
    "community": {
      "id": "community_id",
      "name": "SkillPort Academy",
      "batches": [
        {
          "name": "Batch 2024-A",
          "code": "B24A",
          "status": "active"
        }
      ]
    }
  }
}
```

### **POST /communities/:id/join**
Join a community (for students)

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

---

## **🏆 Contest Management Endpoints**

### **GET /contests**
Get all contests

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": {
    "contests": [
      {
        "id": "contest_id",
        "title": "Programming Fundamentals Contest",
        "description": "Basic programming concepts",
        "status": "published",
        "startTime": "2025-09-03T07:36:05.000Z",
        "duration": 180,
        "problems": [
          {
            "title": "Problem 1: Array Sum",
            "difficulty": "easy",
            "points": 100
          }
        ]
      }
    ]
  }
}
```

### **GET /contests/:id**
Get specific contest details

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

### **POST /contests/:id/register**
Register for a contest

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

---

## **📚 Project Management Endpoints**

### **GET /projects**
Get all projects

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

### **POST /projects**
Create new project

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Request Body:**
```json
{
  "title": "My Web App",
  "description": "A modern web application",
  "category": "web",
  "technologies": ["React", "Node.js"],
  "visibility": "public"
}
```

---

## **📊 Progress & Analytics Endpoints**

### **GET /progress/user/:userId**
Get user progress

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

### **GET /analytics/community/:communityId**
Get community analytics (Admin only)

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

---

## **🔧 Extension Integration Endpoints**

### **POST /extension/sync**
Sync extension data (no auth required)

**Headers:** `X-Extension-Token: <EXTENSION_SECRET>`

**Request Body:**
```json
{
  "platform": "leetcode",
  "username": "john_doe",
  "submissions": [
    {
      "problem": "Two Sum",
      "status": "accepted",
      "timestamp": "2025-09-02T01:00:00Z"
    }
  ]
}
```

---

## **📁 File Upload Endpoints**

### **POST /upload/avatar**
Upload user avatar

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Body:** `multipart/form-data`

### **POST /upload/project/:projectId/files**
Upload project files

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

---

## **🔑 Test Credentials**

### **Community Admin**
```
Email: admin@skillport.com
Password: admin123
Role: community-admin
```

### **Student**
```
Email: student1@skillport.com
Password: student123
Role: student
Batch: Batch 2024-A
```

### **Mentor**
```
Email: mentor1@skillport.com
Password: mentor123
Role: mentor
```

### **Personal User**
```
Email: personal1@example.com
Password: user123
Role: personal
```

---

## **📊 Database Schema Overview**

### **Users**
- Personal users (standalone)
- Community admins (manage communities)
- Mentors (guide students)
- Students (learn in communities)

### **Communities**
- Multiple batches
- Student/mentor management
- Statistics tracking
- Feature toggles

### **Contests**
- Multiple problems
- Participant management
- Leaderboard system
- Submission tracking

### **Projects**
- Feature tracking
- Milestone management
- Collaboration system
- Progress metrics

---

## **🚀 Getting Started**

1. **Start the server:**
   ```bash
   cd backend
   node server.js
   ```

2. **Seed the database:**
   ```bash
   node simpleSeed.js
   ```

3. **Test endpoints:**
   ```bash
   # Health check
   curl http://localhost:5001/health
   
   # Login
   curl -X POST http://localhost:5001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@skillport.com","password":"admin123"}'
   ```

---

## **🔒 Security Features**

- JWT Authentication
- Rate Limiting
- CORS Protection
- Input Validation
- SQL Injection Prevention
- XSS Protection

---

## **📈 Performance Features**

- Database Indexing
- Query Optimization
- Response Compression
- Caching Ready
- Pagination Support

---

## **🔄 Status Codes**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

*Last Updated: September 2, 2025*
