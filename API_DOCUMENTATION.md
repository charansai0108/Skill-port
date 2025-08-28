# 📚 SkillPort API Documentation

## **Overview**
SkillPort API provides comprehensive endpoints for user management, communities, contests, and problem-solving platforms.

**Base URL:** `https://yourdomain.com/api`  
**Version:** v1.0  
**Authentication:** JWT Bearer Token

## **Authentication**

### **Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "role": "student"
    }
  }
}
```

### **Register**
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "user@example.com",
  "password": "password123",
  "role": "student"
}
```

### **Forgot Password**
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### **Reset Password**
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

## **Users**

### **Get Profile**
```http
GET /users/profile
Authorization: Bearer <token>
```

### **Update Profile**
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Updated bio"
}
```

### **Get Public Profile**
```http
GET /users/:id
```

## **Communities**

### **List Communities**
```http
GET /communities?page=1&limit=10&category=algorithms&search=python
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `privacy`: Filter by privacy (public, private, invite-only)
- `search`: Search in name, description, tags

### **Create Community**
```http
POST /communities
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Python Developers",
  "description": "Community for Python enthusiasts",
  "category": "programming",
  "privacy": "public",
  "tags": ["python", "programming", "web-development"]
}
```

### **Join Community**
```http
POST /communities/:id/join
Authorization: Bearer <token>
```

### **Leave Community**
```http
DELETE /communities/:id/leave
Authorization: Bearer <token>
```

## **Contests**

### **List Contests**
```http
GET /contests?page=1&limit=10&type=competitive&difficulty=medium
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Contest type (practice, competitive, assessment, hackathon)
- `difficulty`: Difficulty level (easy, medium, hard, expert)
- `category`: Problem category
- `status`: Contest status (published, active, completed)

### **Create Contest**
```http
POST /contests
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Algorithm Challenge 2024",
  "description": "Test your algorithmic skills",
  "type": "competitive",
  "difficulty": "medium",
  "category": "algorithms",
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-15T18:00:00Z",
  "duration": 480
}
```

### **Join Contest**
```http
POST /contests/:id/join
Authorization: Bearer <token>
```

### **Get Contest Problems**
```http
GET /contests/:id/problems
Authorization: Bearer <token>
```

## **Problems**

### **List Problems**
```http
GET /problems?page=1&limit=10&difficulty=medium&category=algorithms
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `difficulty`: Difficulty level (easy, medium, hard, expert)
- `category`: Problem category
- `search`: Search in title, description, tags

### **Get Problem**
```http
GET /problems/:id
Authorization: Bearer <token>
```

### **Submit Solution**
```http
POST /problems/:id/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "def solution(n):\n    return n * 2",
  "language": "python",
  "contest": "contest_id_optional"
}
```

### **Get Submissions**
```http
GET /problems/:id/submissions
Authorization: Bearer <token>
```

## **Posts**

### **List Posts**
```http
GET /posts?page=1&limit=10&community=community_id&type=discussion
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `community`: Filter by community ID
- `type`: Post type (discussion, question, announcement, resource, showcase)
- `category`: Post category
- `search`: Search in title, content, tags

### **Create Post**
```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "How to optimize Python code?",
  "content": "Looking for tips to improve performance...",
  "type": "question",
  "category": "help",
  "community": "community_id",
  "tags": ["python", "optimization", "performance"]
}
```

### **Like/Dislike Post**
```http
POST /posts/:id/like
DELETE /posts/:id/like
POST /posts/:id/dislike
DELETE /posts/:id/dislike
Authorization: Bearer <token>
```

### **Add Comment**
```http
POST /posts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great question! Here's what I think..."
}
```

## **Analytics**

### **User Dashboard**
```http
GET /analytics/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProblemsSolved": 25,
      "totalContests": 8,
      "contestsWon": 3,
      "communitiesJoined": 5,
      "currentStreak": 7,
      "longestStreak": 15
    },
    "performance": {
      "successRate": 0.85,
      "averageTime": 1200,
      "averageMemory": 45,
      "accuracy": 0.92
    },
    "recentActivity": {
      "submissions": [...],
      "posts": [...]
    }
  }
}
```

### **Admin Dashboard**
```http
GET /analytics/admin
Authorization: Bearer <token>
```

## **Error Handling**

### **Standard Error Response**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## **Rate Limiting**

- **Public endpoints:** 100 requests per 15 minutes
- **Authenticated endpoints:** 1000 requests per 15 minutes
- **File uploads:** 10 requests per hour

## **File Uploads**

### **Supported Formats**
- **Images:** JPG, PNG, GIF, WebP (max 5MB)
- **Documents:** PDF, DOC, DOCX (max 10MB)
- **Code files:** TXT, JS, PY, JAVA, CPP, C (max 1MB)

### **Upload Endpoint**
```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
type: "profile-picture" | "community-banner" | "contest-image"
```

## **WebSocket Events**

### **Real-time Notifications**
```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://yourdomain.com/ws');

// Listen for notifications
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
};

// Send authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'user_jwt_token'
}));
```

### **Event Types**
- `notification`: New notification
- `contest_update`: Contest status change
- `community_activity`: New post/comment
- `submission_result`: Problem submission result

## **SDK Examples**

### **JavaScript/Node.js**
```javascript
class SkillPortAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async createCommunity(data) {
    return this.request('/communities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// Usage
const api = new SkillPortAPI('https://yourdomain.com/api', 'user_token');
const profile = await api.getProfile();
```

### **Python**
```python
import requests

class SkillPortAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def request(self, endpoint, method='GET', data=None):
        url = f"{self.base_url}{endpoint}"
        response = requests.request(
            method=method,
            url=url,
            headers=self.headers,
            json=data
        )
        response.raise_for_status()
        return response.json()
    
    def get_profile(self):
        return self.request('/users/profile')
    
    def create_community(self, data):
        return self.request('/communities', method='POST', data=data)

# Usage
api = SkillPortAPI('https://yourdomain.com/api', 'user_token')
profile = api.get_profile()
```

## **Testing**

### **Test Endpoints**
```http
GET /health
GET /api/test
```

### **Mock Data**
Use the test integration page at `/test-integration.html` to test all endpoints.

## **Support**

- **Documentation:** https://yourdomain.com/docs
- **API Status:** https://yourdomain.com/health
- **Support Email:** support@yourdomain.com
- **GitHub Issues:** https://github.com/your-username/skillport-community/issues

---

**🎯 Happy coding with SkillPort API!**
