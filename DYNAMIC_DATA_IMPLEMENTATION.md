# 🚀 Dynamic Data Implementation - Complete Guide

## ✅ Backend APIs Created

All admin pages now have dedicated APIs that return dynamic data from the database.

### 1. `/api/admin/students` ✅
**File**: `apps/web/app/api/admin/students/route.ts`

**Features:**
- Paginated student list
- Search by name, email, username
- Filter by batch
- Filter by status (active/inactive)
- Returns student stats (problems solved, contests joined)
- Returns batch list for filters

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `batchId` - Filter by batch ID
- `status` - Filter by status (all/active/inactive)

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@test.com",
        "batch": "Batch 2024-A",
        "status": "active",
        "problemsSolved": 45,
        "totalSubmissions": 67,
        "contestsJoined": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    },
    "batches": [
      { "id": "batch_id", "name": "Batch 2024-A", "studentCount": 24 }
    ]
  }
}
```

---

### 2. `/api/admin/mentors` ✅
**File**: `apps/web/app/api/admin/mentors/route.ts`

**Features:**
- Paginated mentor list
- Search by name, email, subject
- Filter by specialization
- Filter by status
- Returns mentor stats (students helped, contests created, rating)
- Returns unique specializations for filters

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search term
- `specialization` - Filter by subject
- `status` - Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "mentors": [
      {
        "id": "mentor_id",
        "name": "Jane Smith",
        "email": "jane@test.com",
        "specialization": "Mathematics",
        "status": "active",
        "mentorStats": {
          "totalStudents": 15,
          "activeContests": 2,
          "averageRating": 4.5
        }
      }
    ],
    "pagination": { ... },
    "specializations": ["Mathematics", "Physics", "Computer Science"]
  }
}
```

---

### 3. `/api/admin/contests` ✅
**File**: `apps/web/app/api/admin/contests/route.ts`

**Features:**
- Full contest list
- Search by title, description
- Filter by status (ACTIVE, UPCOMING, ENDED)
- Returns participant and submission counts
- Returns creator (mentor) details

**Query Parameters:**
- `search` - Search term
- `status` - Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "contests": [
      {
        "id": "contest_id",
        "name": "Weekly Challenge",
        "description": "Solve algorithm problems",
        "status": "active",
        "participants": 45,
        "submissions": 127,
        "startDate": "2025-01-15T00:00:00.000Z",
        "endDate": "2025-01-22T00:00:00.000Z",
        "mentor": "John Mentor"
      }
    ],
    "stats": {
      "total": 10,
      "active": 3,
      "upcoming": 2,
      "ended": 5
    }
  }
}
```

---

### 4. `/api/admin/analytics` ✅
**File**: `apps/web/app/api/admin/analytics/route.ts`

**Features:**
- Platform-wide statistics
- User growth data (last 7 days)
- Role distribution
- Batch performance
- Submission trends

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 150,
      "activeUsers": 120,
      "totalStudents": 100,
      "totalMentors": 15,
      "totalContests": 25,
      "activeContests": 5,
      "totalSubmissions": 1234,
      "acceptedSubmissions": 890
    },
    "userGrowthData": {
      "labels": ["Jan 1", "Jan 2", ...],
      "data": [5, 8, 12, ...]
    },
    "roleDistribution": [
      { "role": "STUDENT", "count": 100 },
      { "role": "MENTOR", "count": 15 }
    ],
    "batchPerformance": [
      {
        "name": "Batch 2024-A",
        "studentCount": 24,
        "avgSolved": 35.5
      }
    ],
    "submissionTrend": {
      "total": 1234,
      "accepted": 890,
      "rate": 72
    }
  }
}
```

---

### 5. `/api/admin/leaderboard` ✅
**File**: `apps/web/app/api/admin/leaderboard/route.ts`

**Features:**
- Student leaderboard (by problems solved and contest scores)
- Mentor leaderboard (by students helped and ratings)
- Switchable via query parameter

**Query Parameters:**
- `type` - `students` or `mentors`
- `limit` - Number of entries (default: 50)

**Response (Students):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "id": "user_id",
        "name": "Alice Johnson",
        "username": "alice_j",
        "batch": "Batch 2024-A",
        "problemsSolved": 89,
        "contestsParticipated": 5,
        "totalScore": 450,
        "averageScore": 90
      }
    ],
    "type": "students"
  }
}
```

---

### 6. `/api/admin/profile` ✅
**File**: `apps/web/app/api/admin/profile/route.ts`

**Features:**
- GET: Admin profile with batches and students
- PUT: Update admin profile details

**GET Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "admin_id",
      "name": "Admin User",
      "email": "admin@test.com",
      "role": "ADMIN",
      "phone": null,
      "bio": null
    },
    "batches": [
      {
        "id": "batch_id",
        "name": "Batch 2024-A",
        "count": 24,
        "color": "blue",
        "students": [
          { "id": "...", "name": "...", "email": "..." }
        ]
      }
    ],
    "stats": {
      "totalStudents": 100,
      "totalMentors": 15,
      "totalBatches": 5,
      "totalCommunities": 1
    }
  }
}
```

---

### 7. `/api/dashboard/admin` ✅ (Updated)
**File**: `apps/web/app/api/dashboard/admin/route.ts`

**Added:**
- `recentMentors` array with mentor-specific data

---

## 📋 Summary of All APIs

| API Endpoint | Method | Purpose | Auth Required |
|-------------|--------|---------|---------------|
| `/api/admin/students` | GET | Get paginated students with filters | ADMIN |
| `/api/admin/mentors` | GET | Get paginated mentors with filters | ADMIN |
| `/api/admin/contests` | GET | Get all contests with stats | ADMIN |
| `/api/admin/analytics` | GET | Get platform analytics | ADMIN |
| `/api/admin/leaderboard` | GET | Get ranked students/mentors | ADMIN |
| `/api/admin/profile` | GET, PUT | Get/update admin profile and batches | ADMIN |
| `/api/dashboard/admin` | GET | Get dashboard summary (updated) | ADMIN |

---

## 🎯 Next Steps: Update Frontend Pages

Now you need to update the frontend pages to use these APIs. Here's the pattern for each page:

### Pattern for Updating Pages:

```typescript
'use client'

import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {/* Render dynamic data */}
      {data.students.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  )
}
```

---

## 🔧 Quick Test

Test the APIs:

```bash
# Get students
curl http://localhost:3000/api/admin/students \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get mentors
curl http://localhost:3000/api/admin/mentors \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get analytics
curl http://localhost:3000/api/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ All Backend APIs Ready!

**All 7 APIs have been created and are ready to use. The dashboard API now includes dynamic mentor data as well.**

Next: Update the frontend pages to consume these APIs and remove all hardcoded data!

