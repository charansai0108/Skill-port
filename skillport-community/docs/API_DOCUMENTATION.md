# API Documentation - Restructured Architecture

## 📋 Overview

This document provides comprehensive API documentation for the restructured SkillPort Community monorepo architecture, covering all endpoints, authentication, and data models.

## 🏗️ API Architecture

### **Base URL**
```
Production: https://api.skillport.com
Development: http://localhost:8000
```

### **Authentication**
All API endpoints (except public ones) require authentication via JWT tokens.

```http
Authorization: Bearer <jwt_token>
```

### **Response Format**
All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-12-20T10:00:00Z"
}
```

### **Error Format**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-12-20T10:00:00Z"
}
```

## 🔐 Authentication APIs

### **POST /api/auth/register**
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "emailVerified": false
    }
  },
  "message": "User registered successfully. Please check your email for verification."
}
```

### **POST /api/auth/login**
Authenticate user and return JWT token.

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
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
```

### **POST /api/auth/forgot-password**
Initiate password reset process.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### **POST /api/auth/reset-password**
Reset password using token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### **GET /api/auth/verify-email**
Verify email address.

**Query Parameters:**
- `token`: Email verification token

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

## 👥 User Management APIs

### **GET /api/users**
Get list of users (Admin only).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role
- `search`: Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "createdAt": "2024-12-20T10:00:00Z",
        "lastLogin": "2024-12-20T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### **GET /api/users/:id**
Get user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "profile": {
        "bio": "Software developer",
        "skills": ["JavaScript", "Python"],
        "avatar": "https://example.com/avatar.jpg"
      },
      "stats": {
        "problemsSolved": 150,
        "contestsParticipated": 10,
        "rank": 25
      }
    }
  }
}
```

### **PUT /api/users/:id**
Update user information.

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Full-stack developer",
  "skills": ["JavaScript", "Python", "React"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Smith",
      "bio": "Full-stack developer",
      "skills": ["JavaScript", "Python", "React"]
    }
  }
}
```

## 🏆 Contest APIs

### **GET /api/contests**
Get list of contests.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (active, upcoming, completed)
- `search`: Search by title

**Response:**
```json
{
  "success": true,
  "data": {
    "contests": [
      {
        "id": "contest_123",
        "title": "Weekly Algorithm Challenge",
        "description": "Solve algorithmic problems",
        "status": "active",
        "startDate": "2024-12-20T00:00:00Z",
        "endDate": "2024-12-27T23:59:59Z",
        "participants": 150,
        "problems": 5
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

### **GET /api/contests/:id**
Get contest details.

**Response:**
```json
{
  "success": true,
  "data": {
    "contest": {
      "id": "contest_123",
      "title": "Weekly Algorithm Challenge",
      "description": "Solve algorithmic problems",
      "status": "active",
      "startDate": "2024-12-20T00:00:00Z",
      "endDate": "2024-12-27T23:59:59Z",
      "rules": [
        "No external help allowed",
        "Submit solutions within time limit"
      ],
      "problems": [
        {
          "id": "problem_1",
          "title": "Two Sum",
          "difficulty": "Easy",
          "points": 100
        }
      ],
      "participants": 150,
      "leaderboard": [
        {
          "rank": 1,
          "user": {
            "id": "user_456",
            "name": "Alice Johnson",
            "avatar": "https://example.com/avatar.jpg"
          },
          "score": 450,
          "problemsSolved": 5
        }
      ]
    }
  }
}
```

### **POST /api/contests/:id/register**
Register for a contest.

**Response:**
```json
{
  "success": true,
  "data": {
    "registration": {
      "contestId": "contest_123",
      "userId": "user_123",
      "registeredAt": "2024-12-20T10:00:00Z",
      "status": "registered"
    }
  },
  "message": "Successfully registered for contest"
}
```

### **GET /api/contests/:id/submissions**
Get user's submissions for a contest.

**Response:**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "submission_123",
        "problemId": "problem_1",
        "status": "Accepted",
        "score": 100,
        "submittedAt": "2024-12-20T10:30:00Z",
        "language": "JavaScript",
        "executionTime": 45
      }
    ]
  }
}
```

## 💬 Feedback APIs

### **GET /api/feedbacks**
Get list of feedbacks.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `type`: Filter by type (code_review, general, contest)
- `mentorId`: Filter by mentor
- `rating`: Filter by rating

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbacks": [
      {
      "id": "feedback_123",
      "type": "code_review",
      "title": "Code Review for Two Sum Solution",
      "content": "Great solution! Consider optimizing the time complexity.",
      "rating": 5,
      "mentor": {
        "id": "mentor_456",
        "name": "Dr. Smith",
        "avatar": "https://example.com/avatar.jpg"
      },
      "createdAt": "2024-12-20T10:00:00Z",
      "status": "completed"
    }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### **POST /api/feedbacks/request**
Request new feedback.

**Request Body:**
```json
{
  "type": "code_review",
  "title": "Review my solution",
  "description": "Please review my solution for the Two Sum problem",
  "code": "function twoSum(nums, target) { ... }",
  "language": "JavaScript",
  "mentorId": "mentor_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": {
      "id": "feedback_123",
      "type": "code_review",
      "title": "Review my solution",
      "status": "pending",
      "requestedAt": "2024-12-20T10:00:00Z"
    }
  },
  "message": "Feedback request submitted successfully"
}
```

## 📊 Dashboard APIs

### **GET /api/dashboard**
Get dashboard data for current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "userStats": {
      "score": 1250,
      "problemsSolved": 230,
      "contestsWon": 5,
      "accuracy": 87
    },
    "topPerformances": [
      {
        "contestName": "Algo Challenge",
        "rank": 1,
        "score": 250
      }
    ],
    "activeContests": [
      {
        "contestId": "contest_123",
        "title": "Weekly Challenge",
        "deadline": "2024-12-28T23:59:59Z"
      }
    ],
    "recentActivities": [
      {
        "type": "solved_problem",
        "title": "Two Sum",
        "date": "2024-12-20T10:00:00Z"
      }
    ]
  }
}
```

### **GET /api/dashboard/summary**
Get dashboard summary statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "activeContests": 5,
    "totalSubmissions": 5000,
    "averageRating": 4.5
  }
}
```

## 🏅 Leaderboard APIs

### **GET /api/leaderboard**
Get global leaderboard.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `timeframe`: Filter by timeframe (all_time, monthly, weekly)

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "user_456",
          "name": "Alice Johnson",
          "avatar": "https://example.com/avatar.jpg"
        },
        "score": 2500,
        "problemsSolved": 500,
        "accuracy": 95
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1000,
      "pages": 100
    }
  }
}
```

### **GET /api/leaderboard/contest/:contestId**
Get contest-specific leaderboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "contest": {
      "id": "contest_123",
      "title": "Weekly Algorithm Challenge"
    },
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "user_456",
          "name": "Alice Johnson"
        },
        "score": 450,
        "problemsSolved": 5,
        "submissionTime": "2024-12-20T10:30:00Z"
      }
    ]
  }
}
```

## 💳 Payment APIs

### **POST /api/payment/create-order**
Create Razorpay order for subscription.

**Request Body:**
```json
{
  "planId": "premium_monthly",
  "amount": 999,
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "amount": 999,
      "currency": "INR",
      "receipt": "receipt_123",
      "status": "created"
    },
    "razorpay": {
      "key": "rzp_test_123",
      "orderId": "order_razorpay_123"
    }
  }
}
```

### **POST /api/payment/verify-order**
Verify Razorpay payment.

**Request Body:**
```json
{
  "orderId": "order_123",
  "paymentId": "pay_123",
  "signature": "signature_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment_123",
      "status": "completed",
      "amount": 999,
      "currency": "INR"
    },
    "subscription": {
      "id": "sub_123",
      "plan": "premium_monthly",
      "status": "active",
      "expiresAt": "2025-01-20T10:00:00Z"
    }
  }
}
```

## 🔔 Notification APIs

### **GET /api/notifications**
Get user notifications.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `unread`: Filter unread notifications

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "contest_started",
        "title": "Contest Started",
        "message": "Weekly Algorithm Challenge has started",
        "read": false,
        "createdAt": "2024-12-20T10:00:00Z"
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

### **PUT /api/notifications/:id/read**
Mark notification as read.

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## 🌐 Extension APIs

### **POST /api/extension/sync**
Sync extension data.

**Request Body:**
```json
{
  "platform": "leetcode",
  "submissions": [
    {
      "problemId": "two-sum",
      "title": "Two Sum",
      "status": "Accepted",
      "language": "JavaScript",
      "submittedAt": "2024-12-20T10:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": 1,
    "newSubmissions": 1,
    "updatedStats": {
      "problemsSolved": 151,
      "totalScore": 1251
    }
  }
}
```

### **GET /api/extension/data**
Get extension data for user.

**Response:**
```json
{
  "success": true,
  "data": {
    "platforms": {
      "leetcode": {
        "problemsSolved": 100,
        "submissions": 500,
        "averageRating": 4.5
      },
      "hackerrank": {
        "problemsSolved": 50,
        "submissions": 200,
        "averageRating": 4.2
      }
    },
    "totalStats": {
      "problemsSolved": 150,
      "submissions": 700,
      "averageRating": 4.35
    }
  }
}
```

## 🔍 Search APIs

### **GET /api/search/problems**
Search for problems.

**Query Parameters:**
- `q`: Search query
- `difficulty`: Filter by difficulty
- `tags`: Filter by tags
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "problems": [
      {
        "id": "problem_123",
        "title": "Two Sum",
        "difficulty": "Easy",
        "tags": ["Array", "Hash Table"],
        "solved": true,
        "submissions": 1000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

## 📈 Analytics APIs

### **GET /api/analytics/overview**
Get analytics overview (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "active": 750,
      "newThisMonth": 100
    },
    "contests": {
      "total": 25,
      "active": 5,
      "completed": 20
    },
    "submissions": {
      "total": 5000,
      "thisMonth": 500,
      "averagePerUser": 5
    },
    "performance": {
      "averageResponseTime": 150,
      "uptime": 99.9,
      "errorRate": 0.1
    }
  }
}
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `PAYMENT_FAILED` | Payment processing failed |
| `EMAIL_SEND_FAILED` | Email sending failed |
| `DATABASE_ERROR` | Database operation failed |
| `EXTERNAL_API_ERROR` | External API call failed |
| `INTERNAL_SERVER_ERROR` | Internal server error |

## 🔒 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| File Upload | 10 requests | 1 hour |
| Payment | 5 requests | 1 hour |

## 📝 Request/Response Examples

### **cURL Examples**

```bash
# Register user
curl -X POST https://api.skillport.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"student"}'

# Login user
curl -X POST https://api.skillport.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get contests
curl -X GET https://api.skillport.com/api/contests \
  -H "Authorization: Bearer <token>"

# Create feedback request
curl -X POST https://api.skillport.com/api/feedbacks/request \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"code_review","title":"Review my solution","description":"Please review my code"}'
```

### **JavaScript Examples**

```javascript
// Register user
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Get dashboard data
const getDashboardData = async (token) => {
  const response = await fetch('/api/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};

// Submit contest solution
const submitSolution = async (contestId, problemId, solution, token) => {
  const response = await fetch(`/api/contests/${contestId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problemId,
      solution,
      language: 'JavaScript',
    }),
  });
  return response.json();
};
```

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: API Documentation Complete ✅  
**Coverage**: All Endpoints Documented
