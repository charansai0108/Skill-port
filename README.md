# SkillPort Community Platform

A comprehensive platform for building programming communities with features for students, mentors, and administrators. Includes personal skill tracking, community management, contests, projects, and browser extension integration.

## 🌟 Features

### For Personal Users
- **Browser Extension Integration** - Auto-track progress from LeetCode, HackerRank, CodeChef, Codeforces
- **Skill Progress Tracking** - Monitor your coding journey with detailed analytics
- **Goal Setting & Streaks** - Set daily/weekly goals and maintain learning streaks
- **Achievement System** - Earn badges and points for milestones

### For Communities
- **Multi-Role Management** - Admins, Mentors, and Students with role-based permissions
- **Batch Management** - Organize students into cohorts with dedicated mentors
- **Contest System** - Create and manage programming contests with real-time leaderboards
- **Project Showcase** - Students can showcase their projects with collaboration features
- **Progress Analytics** - Detailed insights into student performance and engagement

### For Administrators
- **Community Dashboard** - Complete overview of community health and metrics
- **User Management** - Add mentors, bulk import students, manage permissions
- **Custom Branding** - Customize community appearance with logos and color schemes
- **Analytics & Reports** - Track engagement, progress, and performance metrics

### For Mentors
- **Student Monitoring** - Track individual and group progress
- **Contest Creation** - Design programming challenges and assessments
- **Feedback System** - Provide guidance and feedback to students
- **Performance Insights** - Identify struggling students and top performers

## 🏗️ Architecture

### Frontend
- **Static HTML/CSS/JavaScript** - No framework dependencies, pure web technologies
- **Tailwind CSS** - Utility-first CSS framework for consistent styling
- **Lucide Icons** - Beautiful, customizable SVG icons
- **Responsive Design** - Mobile-first approach with modern UI/UX

### Backend
- **Node.js + Express** - RESTful API with comprehensive endpoints
- **MongoDB + Mongoose** - Document database with structured schemas
- **JWT Authentication** - Secure token-based authentication
- **File Upload System** - Handle avatars, project files, certificates
- **Email Service** - OTP verification and notifications via Nodemailer
- **Rate Limiting** - Security and performance optimization

### Security
- **Input Validation** - Express-validator for all API inputs
- **Password Hashing** - bcryptjs with salt rounds
- **CORS Protection** - Configurable cross-origin resource sharing
- **Helmet.js** - Security headers and protection
- **Rate Limiting** - Prevent abuse and ensure fair usage

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skillport-community
   ```

2. **Configure environment**
   ```bash
   cp backend/config/config.env.example backend/config/config.env
   # Edit config.env with your settings
   ```

3. **Start development environment**
   ```bash
   ./start-project.sh --seed
   ```

   This will:
   - Install backend dependencies
   - Seed database with sample data
   - Start backend server (http://localhost:5001)
   - Start frontend server (http://localhost:5000)

4. **Access the application**
   - Main site: http://localhost:5000/community-ui/index.html
   - Personal dashboard: http://localhost:5000/skillport-personal/student-dashboard.html
   - API health: http://localhost:5001/health

### Sample Login Credentials
```
Admin (PW IOI):     admin@pwioi.com / Admin123!
Admin (CodeCraft):  admin@codecraft.dev / Admin123!
Mentor:             arjun.mentor@pwioi.com / Mentor123!
Student:            aarav.student@pwioi.com / Student123!
Personal User:      alex@example.com / Personal123!
```

## 📁 Project Structure

```
skillport-community/
├── backend/                 # Node.js backend
│   ├── config/             # Database and environment config
│   ├── controllers/        # Request handlers (future expansion)
│   ├── middleware/         # Auth, validation, file upload
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Email and external services
│   ├── uploads/           # File storage
│   ├── utils/             # Helper functions and API service
│   └── server.js          # Main server file
├── community-ui/           # Community platform frontend
│   ├── pages/             # All HTML pages
│   │   ├── admin/         # Administrator pages
│   │   ├── auth/          # Authentication pages
│   │   ├── mentor/        # Mentor pages
│   │   └── user/          # Student pages
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── index.html         # Landing page
├── skillport-personal/     # Personal user frontend
│   ├── *.html             # Personal dashboard pages
│   ├── css/               # Personal-specific styles
│   └── js/                # Personal-specific scripts
├── start-project.sh        # Development startup script
├── deploy.sh              # Production deployment script
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables (`backend/config/config.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=5001
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/skillport_community

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Email Service
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@skillport.com

# File Uploads
MAX_FILE_SIZE=5242880
FILE_UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5000,http://127.0.0.1:5500

# Extension
EXTENSION_SECRET=your-extension-secret-key
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/verify-otp` - Email verification
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password/:token` - Password reset
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/dashboard` - Dashboard data
- `POST /api/v1/users/mentors` - Create mentor (admin)
- `POST /api/v1/users/students/batch` - Add students to batch

### Communities
- `GET /api/v1/communities` - List communities
- `GET /api/v1/communities/:id` - Get community details
- `GET /api/v1/communities/:id/dashboard` - Community dashboard
- `POST /api/v1/communities/:id/batches` - Create batch

### Contests
- `GET /api/v1/contests` - List contests
- `POST /api/v1/contests` - Create contest
- `POST /api/v1/contests/:id/register` - Register for contest
- `POST /api/v1/contests/:id/submit` - Submit solution

### Projects
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `PUT /api/v1/projects/:id` - Update project
- `POST /api/v1/projects/:id/collaborators` - Add collaborator

### Progress
- `GET /api/v1/progress` - Get user progress
- `POST /api/v1/progress` - Create/update progress
- `GET /api/v1/progress/leaderboard` - Get leaderboard
- `GET /api/v1/progress/analytics` - Progress analytics

### Extension (Personal Users)
- `POST /api/v1/extension/token` - Generate extension token
- `POST /api/v1/extension/sync` - Sync progress data
- `GET /api/v1/extension/progress` - Get extension progress

### File Upload
- `POST /api/v1/upload/avatar` - Upload avatar
- `POST /api/v1/upload/project/:id/files` - Upload project files
- `POST /api/v1/upload/certificate` - Upload certificate

## 🚢 Deployment

### Development
```bash
./start-project.sh --seed
```

### Production
```bash
./deploy.sh
```

The deployment script creates:
- Production build with optimized assets
- Docker configuration
- Nginx reverse proxy config
- Systemd service files
- SSL-ready setup

### Docker Deployment
```bash
docker-compose up -d
```

## 🧪 Database Schema

### User Model
- Personal information and authentication
- Role-based permissions (personal, community-admin, mentor, student)
- Community associations and batch assignments
- Progress tracking and achievement system

### Community Model
- Community branding and configuration
- Batch management with mentor assignments
- Feature toggles and limits
- Statistics and analytics

### Progress Model
- Skill-based progress tracking
- Platform-specific data (LeetCode, HackerRank, etc.)
- Weekly progress and streak tracking
- Achievement and goal management

### Contest Model
- Contest configuration and rules
- Problem sets with test cases
- Participant management and submissions
- Real-time leaderboard and rankings

### Project Model
- Project information and collaboration
- File and image management
- Review and rating system
- Milestone and feature tracking

## 🔌 Browser Extension Integration

The platform includes comprehensive browser extension support for personal users:

### Features
- Auto-detect problem solving on major platforms
- Sync progress in real-time
- Track streaks and achievements
- Platform-specific statistics

### Supported Platforms
- LeetCode
- HackerRank  
- CodeChef
- Codeforces

### Integration Flow
1. Personal user registers and logs in
2. Extension installation prompt appears
3. Extension generates secure token
4. Progress syncs automatically
5. Dashboard shows real-time updates

## 🛡️ Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcryptjs with salt
- **Input Validation** on all API endpoints
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **File Upload Security** with type and size validation
- **SQL Injection Prevention** through Mongoose ODM
- **XSS Protection** via Helmet.js security headers

## 🎯 User Flows

### Personal User Journey
1. Register → Email verification → Extension setup
2. Solve problems on coding platforms
3. View progress in dashboard
4. Set goals and track achievements
5. Analyze performance over time

### Community Student Journey
1. Admin adds email to batch
2. Student receives invitation
3. Complete registration process
4. Access community dashboard
5. Participate in contests and projects
6. Get mentorship and feedback

### Community Admin Journey
1. Register community
2. Set up branding and configuration
3. Create batches and add mentors
4. Import student emails
5. Monitor community health
6. Analyze performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the deployment summary for troubleshooting
- Review API documentation in the code
- Check server logs for debugging information

---

**Built with ❤️ for the programming community**