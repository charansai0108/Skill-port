# Community Dashboard API Examples

This document provides example JSON responses for the community dashboard API endpoints.

## 1. Community Summary

**Endpoint:** `GET /api/v1/community/:id/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "userStats": {
      "total": 156,
      "growth": 12
    },
    "roleStats": {
      "mentors": 8,
      "mentorGrowth": 2
    },
    "contestStats": {
      "active": 5,
      "growth": 1
    },
    "submissionStats": {
      "totalSolved": 1247,
      "growth": 89
    }
  }
}
```

## 2. Recent Activity

**Endpoint:** `GET /api/v1/community/:id/recent-activity`

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "type": "user_created",
        "description": "New user John Doe joined the community",
        "timestamp": "2025-09-03T15:30:00.000Z",
        "userId": "68b8200e933a6741892ddbbb"
      },
      {
        "type": "contest_created",
        "description": "New contest 'Array Problems' created",
        "timestamp": "2025-09-03T15:15:00.000Z",
        "contestId": "68b8200e933a6741892ddccc"
      },
      {
        "type": "mentor_assigned",
        "description": "Sarah Wilson assigned as mentor for Contest #3",
        "timestamp": "2025-09-03T15:00:00.000Z",
        "mentorId": "68b8200e933a6741892ddddd"
      },
      {
        "type": "contest_completed",
        "description": "Contest 'String Manipulation' completed by 15 users",
        "timestamp": "2025-09-03T14:45:00.000Z",
        "contestId": "68b8200e933a6741892ddeee"
      },
      {
        "type": "submission_flagged",
        "description": "Submission flagged for review in Contest #2",
        "timestamp": "2025-09-03T14:30:00.000Z",
        "submissionId": "68b8200e933a6741892ddfff"
      }
    ]
  }
}
```

## 3. Recent Users

**Endpoint:** `GET /api/v1/community/:id/users?limit=5&sort=-createdAt`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "68b8200e933a6741892ddbbb",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "student",
        "status": "active",
        "createdAt": "2025-09-03T15:30:00.000Z"
      },
      {
        "_id": "68b8200e933a6741892ddccc",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "role": "student",
        "status": "active",
        "createdAt": "2025-09-03T15:15:00.000Z"
      },
      {
        "_id": "68b8200e933a6741892ddddd",
        "firstName": "Mike",
        "lastName": "Johnson",
        "email": "mike.johnson@example.com",
        "role": "student",
        "status": "active",
        "createdAt": "2025-09-03T15:00:00.000Z"
      },
      {
        "_id": "68b8200e933a6741892ddeee",
        "firstName": "Sarah",
        "lastName": "Wilson",
        "email": "sarah.wilson@example.com",
        "role": "mentor",
        "status": "active",
        "createdAt": "2025-09-03T14:45:00.000Z"
      },
      {
        "_id": "68b8200e933a6741892ddfff",
        "firstName": "David",
        "lastName": "Brown",
        "email": "david.brown@example.com",
        "role": "student",
        "status": "active",
        "createdAt": "2025-09-03T14:30:00.000Z"
      }
    ]
  }
}
```

## 4. Recent Mentors

**Endpoint:** `GET /api/v1/community/:id/mentors?limit=5&sort=-createdAt`

**Response:**
```json
{
  "success": true,
  "data": {
    "mentors": [
      {
        "_id": "68b8200e933a6741892ddddd",
        "firstName": "Sarah",
        "lastName": "Wilson",
        "email": "sarah.wilson@example.com",
        "role": "mentor",
        "status": "active",
        "skills": [
          {
            "name": "Algorithms",
            "level": "expert"
          },
          {
            "name": "Data Structures",
            "level": "advanced"
          }
        ],
        "contestPerformance": {
          "problemsSolved": 15,
          "studentsHelped": 8
        },
        "createdAt": "2025-09-03T14:45:00.000Z"
      },
      {
        "_id": "68b8200e933a6741892ddeee",
        "firstName": "Alex",
        "lastName": "Chen",
        "email": "alex.chen@example.com",
        "role": "mentor",
        "status": "active",
        "skills": [
          {
            "name": "Dynamic Programming",
            "level": "expert"
          },
          {
            "name": "Graph Theory",
            "level": "advanced"
          }
        ],
        "contestPerformance": {
          "problemsSolved": 12,
          "studentsHelped": 6
        },
        "createdAt": "2025-09-03T14:30:00.000Z"
      },
      {
        "_id": "68b8200e933a6741892ddfff",
        "firstName": "Emily",
        "lastName": "Davis",
        "email": "emily.davis@example.com",
        "role": "mentor",
        "status": "active",
        "skills": [
          {
            "name": "String Manipulation",
            "level": "expert"
          },
          {
            "name": "Array Processing",
            "level": "advanced"
          }
        ],
        "contestPerformance": {
          "problemsSolved": 18,
          "studentsHelped": 10
        },
        "createdAt": "2025-09-03T14:15:00.000Z"
      }
    ]
  }
}
```

## 5. Community Insights

**Endpoint:** `GET /api/v1/community/:id/insights`

**Response:**
```json
{
  "success": true,
  "data": {
    "activeUsersToday": 24,
    "newRegistrations": 8,
    "communityPosts": 12,
    "contestSubmissions": 45
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (user doesn't have access to community)
- `404` - Not Found (community doesn't exist)
- `500` - Internal Server Error (server-side error)

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The token must contain the user's community ID and role information for proper access control.
