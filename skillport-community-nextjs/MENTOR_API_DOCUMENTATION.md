# Mentor Backend API Documentation

This document provides comprehensive documentation for all mentor-related API endpoints, including authentication, data validation, and performance optimization features.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Dashboard APIs](#dashboard-apis)
3. [Profile Management APIs](#profile-management-apis)
4. [Contest Management APIs](#contest-management-apis)
5. [Leaderboard APIs](#leaderboard-apis)
6. [Feedback APIs](#feedback-apis)
7. [Data Validation](#data-validation)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)

## Authentication & Authorization

All mentor APIs require authentication via JWT tokens. The token must be included in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Middleware
- **File**: `lib/mentor-middleware.ts`
- **Function**: `mentorAuthMiddleware()`
- **Purpose**: Validates JWT tokens and ensures mentor is active
- **Returns**: 401 if authentication fails, null if successful

## Dashboard APIs

### GET /api/mentor/dashboard
Fetches aggregated statistics and recent activities for the mentor dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalStudents": 24,
      "totalContests": 8,
      "activeContests": 3,
      "completedTasks": 142,
      "successRate": 91
    },
    "topStudents": [
      {
        "id": "student_id",
        "name": "Student Name",
        "score": 95,
        "rank": 1,
        "color": "green"
      }
    ],
    "recentActivities": [
      {
        "id": "activity_id",
        "type": "contest_created",
        "title": "Created new contest",
        "description": "Contest created successfully",
        "time": "2 hours ago",
        "icon": "trophy",
        "color": "blue"
      }
    ],
    "participationTrends": [
      {
        "date": "2025-01-15",
        "count": 12
      }
    ]
  }
}
```

**Features:**
- Cached for 5 minutes for performance
- Real-time statistics calculation
- Activity logging integration

## Profile Management APIs

### GET /api/mentor/profile
Fetches mentor profile information including assigned students.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "mentor_id",
    "name": "Mentor Name",
    "email": "mentor@example.com",
    "phone": "+1234567890",
    "location": "City, Country",
    "bio": "Mentor bio",
    "profilePic": "/uploads/avatars/mentor.jpg",
    "specialization": ["Algorithms", "Data Structures"],
    "batches": [
      {
        "id": "batch_id",
        "name": "Batch 2024-25",
        "description": "Batch description"
      }
    ],
    "students": [
      {
        "id": "student_id",
        "name": "Student Name",
        "initials": "SN",
        "performance": 85,
        "status": "Active",
        "badges": ["Top Performer", "Consistent"],
        "avatarColor": "from-blue-500 to-blue-600"
      }
    ]
  }
}
```

### PUT /api/mentor/profile
Updates mentor profile information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "+1234567890",
  "location": "New City, Country",
  "bio": "Updated bio",
  "specialization": ["Algorithms", "Machine Learning"]
}
```

**Validation:**
- Name: 2-100 characters
- Email: Valid email format, unique
- Phone: Valid phone number format
- Location: 2-100 characters
- Bio: 10-500 characters
- Specialization: Max 10 items

### PUT /api/mentor/profile/password
Changes mentor password.

**Request Body:**
```json
{
  "currentPassword": "current_password",
  "newPassword": "new_secure_password",
  "confirmPassword": "new_secure_password"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### POST /api/mentor/profile/avatar
Uploads mentor profile picture.

**Request:** Multipart form data
- `avatar`: Image file (JPEG, PNG, GIF, WebP)
- Max size: 5MB

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "/uploads/avatars/mentor_1234567890.jpg"
  }
}
```

## Contest Management APIs

### GET /api/mentor/contests
Lists contests created by the mentor with filtering and pagination.

**Query Parameters:**
- `status`: upcoming, active, completed
- `category`: Contest category
- `batchId`: Filter by batch
- `search`: Search in title, description, category
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field
- `sortOrder`: asc, desc

**Response:**
```json
{
  "success": true,
  "data": {
    "contests": [
      {
        "id": "contest_id",
        "title": "Algorithm Challenge",
        "description": "Weekly algorithm contest",
        "category": "Algorithms",
        "batch": {
          "id": "batch_id",
          "name": "Batch 2024-25"
        },
        "participants": 156,
        "startDate": "2025-01-15",
        "endDate": "2025-01-16",
        "status": "active",
        "icon": "A",
        "color": "blue",
        "bgColor": "from-blue-600 to-indigo-600"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### POST /api/mentor/contests
Creates a new contest.

**Request Body:**
```json
{
  "title": "New Contest",
  "description": "Contest description",
  "category": "Algorithms",
  "batchId": "batch_id",
  "startDate": "2025-01-20T10:00:00Z",
  "endDate": "2025-01-21T18:00:00Z",
  "maxParticipants": 100,
  "difficulty": "MEDIUM"
}
```

**Validation:**
- Title: 3-100 characters
- Description: 10-500 characters
- Category: 2-50 characters
- Start date must be before end date
- No overlapping contests in same batch
- Max participants: 1-1000

### GET /api/mentor/contests/[id]
Fetches detailed contest information including participants and problems.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contest_id",
    "title": "Contest Title",
    "description": "Contest description",
    "category": "Algorithms",
    "batch": {
      "id": "batch_id",
      "name": "Batch 2024-25"
    },
    "startDate": "2025-01-20T10:00:00Z",
    "endDate": "2025-01-21T18:00:00Z",
    "status": "active",
    "maxParticipants": 100,
    "difficulty": "MEDIUM",
    "participants": [
      {
        "id": "participant_id",
        "user": {
          "id": "user_id",
          "name": "Student Name",
          "email": "student@example.com",
          "profilePic": "/uploads/avatars/student.jpg"
        },
        "status": "participating",
        "score": 85,
        "rank": 1,
        "submittedAt": "2025-01-21T15:30:00Z"
      }
    ],
    "problems": [
      {
        "id": "problem_id",
        "title": "Problem Title",
        "description": "Problem description",
        "difficulty": "MEDIUM",
        "points": 100,
        "timeLimit": 300,
        "memoryLimit": 256
      }
    ]
  }
}
```

### PUT /api/mentor/contests/[id]
Updates contest details.

**Request Body:** Same as create contest (all fields optional)

**Features:**
- Validates overlapping contests
- Updates status based on dates
- Logs all changes

### DELETE /api/mentor/contests/[id]
Soft deletes a contest (sets status to CANCELLED).

### GET /api/mentor/contests/[id]/participants
Lists contest participants with pagination.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page

### POST /api/mentor/contests/[id]/participants
Adds a student to the contest.

**Request Body:**
```json
{
  "userId": "student_id"
}
```

**Validation:**
- Student must exist and be active
- Student must be in mentor's batches
- Contest must not be at capacity
- No duplicate participants

### DELETE /api/mentor/contests/[id]/participants/[userId]
Removes a student from the contest.

## Leaderboard APIs

### GET /api/mentor/leaderboard
Fetches leaderboard data with filtering and pagination.

**Query Parameters:**
- `contestId`: Filter by specific contest
- `batchId`: Filter by batch
- `timeRange`: week, month, year, all
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "id": "user_id",
        "user": {
          "id": "user_id",
          "name": "Student Name",
          "email": "student@example.com",
          "profilePic": "/uploads/avatars/student.jpg",
          "batch": {
            "id": "batch_id",
            "name": "Batch 2024-25"
          }
        },
        "totalScore": 850,
        "contestCount": 5,
        "averageScore": 170,
        "rank": 1,
        "medal": "🥇",
        "color": "from-yellow-400 to-yellow-600"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    },
    "topPerformers": [...],
    "statistics": {
      "totalParticipants": 100,
      "averageScore": 120,
      "highestScore": 850
    }
  }
}
```

**Features:**
- Cached for 10 minutes
- Real-time ranking calculation
- Medal badges for top 3
- Performance statistics

### GET /api/mentor/leaderboard/export
Exports leaderboard data in CSV or PDF format.

**Query Parameters:**
- `format`: csv, pdf
- Same filters as leaderboard API

**Response:** File download

## Feedback APIs

### GET /api/mentor/feedback
Lists feedback given by mentor with filtering.

**Query Parameters:**
- `studentId`: Filter by student
- `contestId`: Filter by contest
- `rating`: Filter by rating (1-5)
- `category`: Filter by category
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": "feedback_id",
        "student": {
          "id": "student_id",
          "name": "Student Name",
          "email": "student@example.com",
          "profilePic": "/uploads/avatars/student.jpg",
          "batch": {
            "id": "batch_id",
            "name": "Batch 2024-25"
          }
        },
        "contest": {
          "id": "contest_id",
          "title": "Contest Title",
          "category": "Algorithms"
        },
        "rating": 4,
        "comment": "Great performance in the contest!",
        "category": "performance",
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### POST /api/mentor/feedback
Submits feedback for a student.

**Request Body:**
```json
{
  "studentId": "student_id",
  "contestId": "contest_id",
  "rating": 4,
  "comment": "Great performance!",
  "category": "PERFORMANCE"
}
```

**Validation:**
- Rating: 1-5 integer
- Comment: 10-1000 characters
- Student must be in mentor's batches
- Contest must be created by mentor
- No duplicate feedback for same student/contest

**Features:**
- Creates notification for student
- Logs feedback submission
- Validates mentor-student relationship

### GET /api/mentor/feedback/[id]
Fetches specific feedback details.

### PUT /api/mentor/feedback/[id]
Updates feedback.

**Request Body:** Same as create feedback (all fields optional)

### DELETE /api/mentor/feedback/[id]
Deletes feedback.

## Data Validation

All APIs use comprehensive validation with Zod schemas:

### Validation Features
- **Required Fields**: Validates presence of required fields
- **Format Validation**: Email, phone, date formats
- **Range Validation**: Numeric ranges, string lengths
- **Unique Constraints**: Email uniqueness, no duplicate participants
- **Business Logic**: No overlapping contests, mentor-student relationships
- **File Validation**: Image types, size limits

### Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "email: Invalid email format",
    "rating: Rating must be between 1 and 5"
  ]
}
```

## Error Handling

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": ["Detailed error list"]
}
```

## Performance Optimization

### Caching
- **Dashboard Data**: 5-minute cache
- **Leaderboard Data**: 10-minute cache
- **Profile Data**: No cache (real-time updates)

### Database Optimization
- **Indexes**: On frequently queried fields
- **Pagination**: All list endpoints support pagination
- **Selective Fields**: Only fetch required fields
- **Eager Loading**: Include related data efficiently

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Input Sanitization**: All inputs validated and sanitized
- **File Upload Security**: Type and size validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

### Logging
- **Activity Logging**: All mentor actions logged
- **Error Logging**: Comprehensive error tracking
- **Performance Monitoring**: Query execution times
- **Audit Trail**: Complete action history

## Rate Limiting

All APIs implement rate limiting:
- **General APIs**: 100 requests per minute
- **File Upload**: 10 requests per minute
- **Heavy Operations**: 20 requests per minute

## API Usage Examples

### Frontend Integration

```javascript
// Fetch dashboard data
const response = await fetch('/api/mentor/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// Create contest
const contestData = {
  title: 'New Contest',
  description: 'Contest description',
  category: 'Algorithms',
  batchId: 'batch_id',
  startDate: '2025-01-20T10:00:00Z',
  endDate: '2025-01-21T18:00:00Z'
};

const response = await fetch('/api/mentor/contests', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(contestData)
});

// Submit feedback
const feedbackData = {
  studentId: 'student_id',
  rating: 4,
  comment: 'Great performance!',
  category: 'PERFORMANCE'
};

const response = await fetch('/api/mentor/feedback', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(feedbackData)
});
```

This comprehensive backend implementation provides robust, secure, and performant APIs for all mentor functionality with proper validation, error handling, and optimization features.
