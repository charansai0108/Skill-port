# 🚀 SkillPort Community - Complete Setup Guide

## 📋 Prerequisites

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB** (local or cloud instance)
- **Python 3** (for frontend server)

## 🔧 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Make the startup script executable and run it
chmod +x start-servers.sh
./start-servers.sh
```

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment configuration
cp config/config.env .

# Start backend server
npm start
# or for development
npm run dev
```

#### 2. Frontend Setup
```bash
cd client

# Start frontend server (from client directory)
python3 -m http.server 8000
```

## 🌐 Access URLs

- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

## 🔑 Environment Configuration

### Backend Environment Variables
The backend uses `config.env` file located in `/backend/config/config.env`. Key variables:

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/skillport
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:8000
```

### Database Setup
1. Ensure MongoDB is running
2. The application will automatically create the database and collections
3. Run the seeder to populate test data:
```bash
cd backend
npm run seed
```

## 🧪 Test Data

The project includes comprehensive test data:
- **2 Community Admins**
- **3 Mentors** with assigned contests
- **10 Students** with activity and submissions
- **2 Contests** with problems and participants

### Test Credentials
- **Admin**: `testadmin999@example.com` / `Test123!`
- **Mentor**: `mentor1@example.com` / `Test123!`
- **Student**: `student1@example.com` / `Test123!`

## 🔧 Development Commands

### Backend
```bash
cd backend

# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Seed database with test data
npm run seed
```

### Frontend
```bash
cd client

# Start development server
python3 -m http.server 8000

# Or use npx serve (if installed)
npx serve -p 8000
```

## 🏗️ Project Structure

```
skillport-community/
├── backend/                 # Express.js API server
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── client/                # Frontend application
│   ├── js/               # JavaScript controllers
│   ├── pages/            # HTML pages
│   ├── skillport-personal/ # Personal dashboard pages
│   └── index.html        # Main entry point
├── SKILL-EXTENSION/      # Browser extension
│   ├── background/       # Background scripts
│   ├── content_scripts/  # Content scripts
│   └── popup/           # Extension popup
└── start-servers.sh     # Automated startup script
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Admin Routes
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/analytics` - Get analytics data
- `POST /api/v1/admin/users` - Create new user

### Mentor Routes
- `GET /api/v1/mentor/students` - Get mentor's students
- `GET /api/v1/mentor/contests` - Get mentor's contests
- `GET /api/v1/mentor/analytics` - Get mentor analytics

### User Routes
- `GET /api/v1/user/contests` - Get user's contests
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile

### Community Routes
- `GET /api/v1/communities` - Get all communities
- `GET /api/v1/community/:id/summary` - Get community summary

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill processes on ports 5001 and 8000
lsof -ti:5001,8000 | xargs kill -9
```

#### 2. MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in config.env
- Verify database permissions

#### 3. Frontend Shows Directory Listing
- Ensure you're running the server from the `client/` directory
- Use `python3 -m http.server 8000` from the client folder

#### 4. API Calls Failing
- Check if backend server is running on port 5001
- Verify CORS settings in backend
- Check browser console for errors

### Debug Mode
```bash
# Backend with debug logging
cd backend
DEBUG=* npm start

# Frontend with verbose logging
cd client
python3 -m http.server 8000 --verbose
```

## 🔒 Security Features

- **JWT Authentication** with role-based access control
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** using express-validator
- **Password Hashing** with bcrypt
- **Helmet.js** for security headers

## 📱 Browser Extension

The SkillPort Tracker extension monitors coding platform submissions:

### Installation
1. Open Chrome/Edge
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `SKILL-EXTENSION` folder

### Supported Platforms
- LeetCode
- GeeksforGeeks
- HackerRank
- InterviewBit

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Enable rate limiting

### Frontend Deployment
- Build static files
- Serve with nginx or similar
- Configure proper caching headers

### Backend Deployment
- Use PM2 for process management
- Set up reverse proxy (nginx)
- Configure SSL certificates
- Set up monitoring and logging

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors
4. Verify all dependencies are installed

## 🎯 Next Steps

1. **Customize Configuration**: Update environment variables for your setup
2. **Add Test Data**: Run the seeder to populate the database
3. **Test All Features**: Login as different user types and test functionality
4. **Deploy**: Follow production deployment guidelines

---

**Happy Coding! 🎉**
