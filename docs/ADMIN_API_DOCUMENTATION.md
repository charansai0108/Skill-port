# Admin Panel API Documentation

This document provides comprehensive documentation for all Admin Panel API endpoints.

## Authentication

All admin endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
/api/admin
```

---

## 1. Authentication Endpoints

### POST /api/admin/login
**Description:** Admin login
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "admin": {
      "id": "admin_id",
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "admin",
      "profilePic": "avatar_url"
    }
  }
}
```

### POST /api/admin/logout
**Description:** Admin logout
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 2. Dashboard Endpoints

### GET /api/admin/dashboard
**Description:** Get dashboard statistics and analytics
**Headers:** Authorization required
**Query Parameters:**
- `range` (optional): week, month, year (default: month)
- `batchId` (optional): Filter by specific batch

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "statistics": {
      "totalUsers": 150,
      "totalMentors": 10,
      "totalContests": 25,
      "activeBatches": 5,
      "userGrowth": 45
    },
    "recentActivity": {
      "users": [...],
      "contests": [...]
    },
    "charts": {
      "userGrowth": {
        "labels": ["2024-01-01", "2024-01-02"],
        "data": [10, 15]
      },
      "contestParticipation": {
        "labels": ["2024-01-01", "2024-01-02"],
        "data": [5, 8]
      }
    },
    "mentorActivity": [...]
  }
}
```

---

## 3. Users Management

### GET /api/admin/users
**Description:** List users with pagination and filters
**Headers:** Authorization required
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email
- `batch` (optional): Filter by batch ID
- `role` (optional): Filter by role (STUDENT, MENTOR, ADMIN)
- `status` (optional): Filter by status (ACTIVE, INACTIVE, SUSPENDED)

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "role": "STUDENT",
        "status": "ACTIVE",
        "profilePic": "avatar_url",
        "createdAt": "2024-01-01T00:00:00Z",
        "batch": {
          "id": "batch_id",
          "name": "Batch Name"
        },
        "_count": {
          "tasks": 25,
          "projects": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 150,
      "totalPages": 15
    }
  }
}
```

### POST /api/admin/users
**Description:** Create new user
**Headers:** Authorization required
**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "STUDENT",
  "batchId": "batch_id",
  "profilePic": "avatar_url"
}
```

### PUT /api/admin/users/[id]
**Description:** Update user
**Headers:** Authorization required
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "STUDENT",
  "status": "ACTIVE",
  "batchId": "batch_id",
  "profilePic": "avatar_url",
  "bio": "User bio"
}
```

### DELETE /api/admin/users/[id]
**Description:** Delete user
**Headers:** Authorization required

---

## 4. Mentors Management

### GET /api/admin/mentors
**Description:** List mentors with pagination and filters
**Headers:** Authorization required
**Query Parameters:**
- `page`, `limit`, `search` (same as users)
- `batch` (optional): Filter by assigned batch
- `status` (optional): active, inactive

**Response:**
```json
{
  "success": true,
  "message": "Mentors retrieved successfully",
  "data": {
    "mentors": [
      {
        "id": "mentor_id",
        "name": "Mentor Name",
        "email": "mentor@example.com",
        "specialization": "Algorithms",
        "bio": "Mentor bio",
        "profilePic": "avatar_url",
        "isActive": true,
        "rating": 4.5,
        "totalStudents": 25,
        "createdAt": "2024-01-01T00:00:00Z",
        "batches": [
          {
            "id": "batch_id",
            "name": "Batch Name"
          }
        ]
      }
    ],
    "pagination": {...}
  }
}
```

### POST /api/admin/mentors
**Description:** Create new mentor
**Headers:** Authorization required
**Request Body:**
```json
{
  "name": "Mentor Name",
  "email": "mentor@example.com",
  "password": "password123",
  "specialization": "Algorithms",
  "bio": "Mentor bio",
  "profilePic": "avatar_url",
  "batchIds": ["batch_id_1", "batch_id_2"]
}
```

### PUT /api/admin/mentors/[id]
**Description:** Update mentor
**Headers:** Authorization required
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "specialization": "Data Structures",
  "bio": "Updated bio",
  "profilePic": "avatar_url",
  "isActive": true,
  "batchIds": ["batch_id_1", "batch_id_2"]
}
```

### DELETE /api/admin/mentors/[id]
**Description:** Delete mentor
**Headers:** Authorization required

---

## 5. Contests Management

### GET /api/admin/contests
**Description:** List contests with pagination and filters
**Headers:** Authorization required
**Query Parameters:**
- `page`, `limit`, `search` (same as users)
- `status` (optional): UPCOMING, ACTIVE, COMPLETED, CANCELLED
- `batchId` (optional): Filter by batch
- `dateRange` (optional): upcoming, active, completed, thisWeek, thisMonth

**Response:**
```json
{
  "success": true,
  "message": "Contests retrieved successfully",
  "data": {
    "contests": [
      {
        "id": "contest_id",
        "name": "Contest Name",
        "description": "Contest description",
        "status": "ACTIVE",
        "startDate": "2024-01-01T00:00:00Z",
        "endDate": "2024-01-02T00:00:00Z",
        "maxParticipants": 100,
        "createdAt": "2024-01-01T00:00:00Z",
        "batch": {
          "id": "batch_id",
          "name": "Batch Name"
        },
        "_count": {
          "participants": 25
        }
      }
    ],
    "pagination": {...}
  }
}
```

### POST /api/admin/contests
**Description:** Create new contest
**Headers:** Authorization required
**Request Body:**
```json
{
  "name": "Contest Name",
  "description": "Contest description",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-02T00:00:00Z",
  "batchId": "batch_id",
  "maxParticipants": 100,
  "participantIds": ["user_id_1", "user_id_2"]
}
```

### PUT /api/admin/contests/[id]
**Description:** Update contest
**Headers:** Authorization required
**Request Body:**
```json
{
  "name": "Updated Contest Name",
  "description": "Updated description",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-02T00:00:00Z",
  "batchId": "batch_id",
  "maxParticipants": 150,
  "status": "ACTIVE"
}
```

### DELETE /api/admin/contests/[id]
**Description:** Delete contest
**Headers:** Authorization required

### GET /api/admin/contests/[id]/participants
**Description:** Get contest participants
**Headers:** Authorization required
**Query Parameters:** `page`, `limit`

### POST /api/admin/contests/[id]/participants
**Description:** Add participants to contest
**Headers:** Authorization required
**Request Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2"]
}
```

### DELETE /api/admin/contests/[id]/participants/[userId]
**Description:** Remove participant from contest
**Headers:** Authorization required

### PUT /api/admin/contests/[id]/participants/[userId]
**Description:** Update participant score
**Headers:** Authorization required
**Request Body:**
```json
{
  "score": 85,
  "completedAt": "2024-01-01T00:00:00Z"
}
```

---

## 6. Analytics Endpoints

### GET /api/admin/analytics
**Description:** Get analytics data
**Headers:** Authorization required
**Query Parameters:**
- `type` (optional): users, contests, mentors, overview (default: overview)
- `range` (optional): week, month, year (default: month)
- `batchId` (optional): Filter by batch

**Response Examples:**

**User Analytics:**
```json
{
  "success": true,
  "message": "User analytics retrieved successfully",
  "data": {
    "userGrowth": {
      "labels": ["2024-01-01", "2024-01-02"],
      "data": [10, 15]
    },
    "statusDistribution": [
      {"status": "ACTIVE", "count": 120},
      {"status": "INACTIVE", "count": 30}
    ],
    "roleDistribution": [
      {"role": "STUDENT", "count": 140},
      {"role": "MENTOR", "count": 10}
    ],
    "recentActivity": [...]
  }
}
```

**Contest Analytics:**
```json
{
  "success": true,
  "message": "Contest analytics retrieved successfully",
  "data": {
    "participationOverTime": {
      "labels": ["2024-01-01", "2024-01-02"],
      "data": [5, 8]
    },
    "statusDistribution": [
      {"status": "ACTIVE", "count": 10},
      {"status": "COMPLETED", "count": 15}
    ],
    "topContests": [...],
    "completionRates": [...]
  }
}
```

---

## 7. Leaderboard Endpoints

### GET /api/admin/leaderboard
**Description:** Get leaderboard data
**Headers:** Authorization required
**Query Parameters:**
- `type` (required): users, mentors, contest
- `batchId` (optional): Filter by batch (for users)
- `contestId` (required for contest type)
- `page`, `limit`

**Response Examples:**

**User Leaderboard:**
```json
{
  "success": true,
  "message": "User leaderboard retrieved successfully",
  "data": {
    "leaderboard": [
      {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "profilePic": "avatar_url",
        "rank": 1,
        "score": 1250,
        "metrics": {
          "completedTasks": 50,
          "completedProjects": 5,
          "badges": 10,
          "taskScore": 500,
          "projectScore": 250,
          "badgeScore": 500,
          "totalScore": 1250
        },
        "difficultyBreakdown": {
          "easy": 20,
          "medium": 25,
          "hard": 5
        }
      }
    ],
    "pagination": {...}
  }
}
```

**Contest Leaderboard:**
```json
{
  "success": true,
  "message": "Contest leaderboard retrieved successfully",
  "data": {
    "contest": {
      "id": "contest_id",
      "name": "Contest Name",
      "status": "ACTIVE"
    },
    "leaderboard": [
      {
        "id": "participant_id",
        "score": 95,
        "rank": 1,
        "joinedAt": "2024-01-01T00:00:00Z",
        "completedAt": "2024-01-01T02:00:00Z",
        "user": {
          "id": "user_id",
          "name": "User Name",
          "email": "user@example.com",
          "profilePic": "avatar_url"
        }
      }
    ],
    "pagination": {...}
  }
}
```

---

## 8. Profile Management

### GET /api/admin/profile
**Description:** Get admin profile
**Headers:** Authorization required
**Response:**
```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "id": "admin_id",
    "name": "Admin Name",
    "email": "admin@example.com",
    "profilePic": "avatar_url",
    "role": "admin",
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/admin/profile
**Description:** Update admin profile
**Headers:** Authorization required
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "profilePic": "avatar_url"
}
```

### PUT /api/admin/profile/password
**Description:** Change admin password
**Headers:** Authorization required
**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## 9. Batch Management

### GET /api/admin/batches
**Description:** List batches with pagination and filters
**Headers:** Authorization required
**Query Parameters:**
- `page`, `limit`, `search` (same as users)
- `status` (optional): ACTIVE, COMPLETED, ARCHIVED

**Response:**
```json
{
  "success": true,
  "message": "Batches retrieved successfully",
  "data": {
    "batches": [
      {
        "id": "batch_id",
        "name": "Batch Name",
        "description": "Batch description",
        "status": "ACTIVE",
        "startDate": "2024-01-01T00:00:00Z",
        "endDate": "2024-06-01T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z",
        "_count": {
          "students": 25,
          "mentors": 3,
          "contests": 5
        }
      }
    ],
    "pagination": {...}
  }
}
```

### POST /api/admin/batches
**Description:** Create new batch
**Headers:** Authorization required
**Request Body:**
```json
{
  "name": "Batch Name",
  "description": "Batch description",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-06-01T00:00:00Z",
  "status": "ACTIVE"
}
```

### PUT /api/admin/batches/[id]
**Description:** Update batch
**Headers:** Authorization required

### DELETE /api/admin/batches/[id]
**Description:** Delete batch
**Headers:** Authorization required

### POST /api/admin/batches/[id]/students
**Description:** Add students to batch
**Headers:** Authorization required
**Request Body:**
```json
{
  "studentIds": ["user_id_1", "user_id_2"]
}
```

### DELETE /api/admin/batches/[id]/students/[userId]
**Description:** Remove student from batch
**Headers:** Authorization required

---

## 10. File Upload

### POST /api/admin/upload/avatar
**Description:** Upload avatar image
**Headers:** Authorization required
**Request:** Multipart form data with 'file' field
**File Requirements:**
- Types: JPEG, PNG, GIF, WebP
- Max size: 5MB

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "/uploads/avatars/filename.jpg",
    "fileName": "filename.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

---

## Database Schema

The admin panel uses the following main models:

- **Admin**: Admin users
- **User**: Students, mentors, and other users
- **Mentor**: Mentor-specific data
- **Batch**: Student batches
- **Contest**: Programming contests
- **ContestParticipant**: Contest participation records
- **MentorBatch**: Mentor-batch assignments
- **ActivityLog**: Admin action logs

---

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install jsonwebtoken bcryptjs
   npm install -D @types/jsonwebtoken @types/bcryptjs
   ```

2. **Environment Variables:**
   ```env
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=24h
   DATABASE_URL=your-database-url
   ```

3. **Database Migration:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Create Admin User:**
   Use the Prisma seed script or create manually through the database.

---

## Usage Examples

### Frontend Integration

```javascript
// Login
const loginResponse = await fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Get dashboard data
const dashboardResponse = await fetch('/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Create user
const createUserResponse = await fetch('/api/admin/users', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(userData)
});
```

This comprehensive API provides all the functionality needed for a complete admin panel with user management, contest management, analytics, and more.
