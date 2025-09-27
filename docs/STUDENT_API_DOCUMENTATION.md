# Student API Documentation

## Overview

This documentation covers all the backend APIs implemented for Student Dashboard, Feedback, Contests, and Contest Participation features. All endpoints require authentication and return JSON responses with proper error handling.

## Authentication

All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

The token should contain student information and will be validated on each request.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## API Endpoints

### 1. Dashboard

#### GET /api/dashboard

Returns comprehensive dashboard data for the authenticated student.

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
        "score": 250,
        "date": "2025-09-20T10:00:00Z"
      }
    ],
    "activeContests": [
      {
        "contestId": "101",
        "title": "Weekly Challenge",
        "deadline": "2025-09-28T23:59:59Z",
        "status": "ACTIVE",
        "description": "Weekly coding challenge"
      }
    ],
    "recentActivities": [
      {
        "type": "solved_problem",
        "title": "Two Sum",
        "date": "2025-09-20T14:30:00Z",
        "details": "Score: 100"
      }
    ]
  }
}
```

**Computed Fields:**
- `score`: Total score from all contest participations
- `problemsSolved`: Unique problems solved (ACCEPTED submissions)
- `contestsWon`: Number of contests with rank 1
- `accuracy`: Percentage of accepted submissions

---

### 2. Feedback

#### GET /api/feedbacks

Returns paginated list of feedbacks with filtering and sorting options.

**Query Parameters:**
- `type` (optional): Filter by feedback category
- `mentorId` (optional): Filter by specific mentor
- `rating` (optional): Filter by rating (1-5)
- `sortBy` (optional): Sort field (default: 'createdAt')
- `order` (optional): Sort order 'asc' or 'desc' (default: 'desc')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbackStats": {
      "total": 15,
      "averageRating": 4.5,
      "activeMentors": 6,
      "monthlyFeedback": 3
    },
    "feedbacks": [
      {
        "id": "feedback_id",
        "mentor": "John Doe",
        "type": "Code Review",
        "rating": 5,
        "content": "Great improvement in your coding style!",
        "category": "TECHNICAL",
        "createdAt": "2025-09-20T10:00:00Z",
        "contestId": "contest_id_or_null"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /api/feedbacks/:id

Returns detailed information about a specific feedback.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "feedback_id",
    "mentor": {
      "id": "mentor_id",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePic": "profile_url"
    },
    "type": "Code Review",
    "rating": 5,
    "content": "Detailed feedback content...",
    "category": "TECHNICAL",
    "createdAt": "2025-09-20T10:00:00Z",
    "updatedAt": "2025-09-20T10:00:00Z",
    "contest": {
      "id": "contest_id",
      "title": "Weekly Challenge",
      "description": "Contest description"
    }
  }
}
```

#### POST /api/feedbacks/request

Request feedback from a mentor.

**Request Body:**
```json
{
  "mentorId": "mentor_id", // optional
  "type": "Code Review",
  "message": "Please review my solution for problem X"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "notification_id"
  },
  "message": "Feedback request submitted successfully"
}
```

---

### 3. Contests

#### GET /api/contests

Returns paginated list of contests with filtering options.

**Query Parameters:**
- `status` (optional): Filter by status (UPCOMING, ACTIVE, COMPLETED, CANCELLED)
- `difficulty` (optional): Filter by difficulty (EASY, MEDIUM, HARD)
- `sortBy` (optional): Sort field (default: 'startDate')
- `order` (optional): Sort order (default: 'desc')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "contests": [
      {
        "id": "contest_id",
        "title": "Weekly Challenge",
        "status": "ACTIVE",
        "startDate": "2025-09-20T00:00:00Z",
        "endDate": "2025-09-28T23:59:59Z",
        "description": "Weekly coding challenge",
        "difficulty": "MEDIUM",
        "maxParticipants": 100,
        "currentParticipants": 45
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /api/contests/:id

Returns detailed contest information including problems and leaderboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contest_id",
    "title": "Weekly Challenge",
    "status": "ACTIVE",
    "startDate": "2025-09-20T00:00:00Z",
    "endDate": "2025-09-28T23:59:59Z",
    "description": "Weekly coding challenge",
    "difficulty": "MEDIUM",
    "maxParticipants": 100,
    "currentParticipants": 45,
    "problems": [
      {
        "id": "problem_id",
        "title": "Two Sum",
        "difficulty": "EASY",
        "points": 100,
        "solved": true
      }
    ],
    "leaderboard": [
      {
        "rank": 1,
        "userId": "user_id",
        "name": "Alice Johnson",
        "score": 250,
        "problemsSolved": 3,
        "lastSubmission": "2025-09-21T14:30:00Z"
      }
    ],
    "isRegistered": true,
    "userRank": 5,
    "userScore": 200
  }
}
```

---

### 4. Contest Participation

#### POST /api/contests/:id/register

Register for a contest.

**Request Body:**
```json
{
  "terms": true // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "participationId": "participation_id",
    "status": "REGISTERED",
    "message": "Successfully registered for contest"
  },
  "message": "Contest registration successful"
}
```

**Error Cases:**
- Contest not found (404)
- Already registered (400)
- Contest full (400)
- Contest not open for registration (400)

#### GET /api/contests/:id/participants

Returns paginated list of contest participants with rankings.

**Query Parameters:**
- `sortBy` (optional): Sort field ('rank', 'score', 'name', 'joinedAt')
- `order` (optional): Sort order (default: 'asc')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "rank": 1,
        "userId": "user_id",
        "name": "Alice Johnson",
        "score": 250,
        "problemsSolved": 3,
        "lastSubmission": "2025-09-21T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 45,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "contestInfo": {
      "id": "contest_id",
      "title": "Weekly Challenge",
      "status": "ACTIVE",
      "totalParticipants": 45
    }
  }
}
```

#### GET /api/contests/:id/submissions

Returns paginated list of submissions for a contest.

**Query Parameters:**
- `userId` (optional): Filter by user (defaults to current user)
- `problemId` (optional): Filter by specific problem
- `status` (optional): Filter by submission status
- `language` (optional): Filter by programming language
- `sortBy` (optional): Sort field (default: 'submittedAt')
- `order` (optional): Sort order (default: 'desc')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "participant": {
      "studentId": "user_id",
      "name": "Alice Johnson",
      "score": 250,
      "rank": 1,
      "status": "PARTICIPATING",
      "joinedAt": "2025-09-20T10:00:00Z"
    },
    "submissions": [
      {
        "id": "submission_id",
        "problemId": "problem_id",
        "problemTitle": "Two Sum",
        "status": "ACCEPTED",
        "score": 100,
        "submittedAt": "2025-09-21T14:30:00Z",
        "language": "python",
        "executionTime": 150
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "contestInfo": {
      "id": "contest_id",
      "title": "Weekly Challenge",
      "status": "ACTIVE"
    }
  }
}
```

## Error Handling

All endpoints include comprehensive error handling:

### HTTP Status Codes
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Responses

#### Authentication Error
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

#### Validation Error
```json
{
  "success": false,
  "error": "Validation failed: type is required, rating must be between 1 and 5"
}
```

#### Not Found Error
```json
{
  "success": false,
  "error": "Contest not found"
}
```

## Database Models

The API relies on the following key database models:

### User
- Student information and authentication
- Links to participations, submissions, feedback

### Contest
- Contest details and metadata
- Links to problems and participants

### ContestParticipant
- Tracks user participation in contests
- Stores score and rank information

### Submission
- Code submissions for contest problems
- Tracks execution results and scoring

### Feedback
- Mentor feedback for students
- Links to specific contests if applicable

### Problem
- Contest problems with test cases
- Scoring and difficulty information

## Utility Functions

The implementation includes several utility functions for:

### Calculations
- User statistics (score, problems solved, accuracy)
- Contest rankings and leaderboards
- Feedback aggregations

### Data Processing
- Activity timeline generation
- Performance analysis
- Progress tracking

### Security
- JWT token validation
- Role-based access control
- Input sanitization and validation

## Performance Considerations

- Database queries are optimized with proper indexes
- Pagination prevents large data transfers
- Parallel data fetching where possible
- Efficient calculation of derived fields
- Proper error handling to prevent system crashes

## Testing

The API includes comprehensive error handling and validation to ensure:
- Data integrity
- Proper authentication and authorization
- Graceful handling of edge cases
- Consistent response formats
- Performance under load
