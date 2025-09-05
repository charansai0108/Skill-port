# 🚀 SkillPort Community Platform

A comprehensive coding community platform with role-based authentication, community management, and contest systems.

## ✨ Features

### 🔐 Authentication & Authorization
- **Personal Users**: Standalone users who can browse and join communities
- **Community Admins**: Create and manage their own communities
- **Mentors**: Manage contests and students within communities
- **Students**: Participate in contests and community activities

### 🏘️ Community Management
- Create and manage coding communities
- Add mentors and pre-register students
- Batch management for organizing students
- Community statistics and analytics

### 🏆 Contest System
- Create coding contests with multiple problems
- Assign contests to specific mentors and batches
- Real-time leaderboards and scoring
- Contest participation tracking

### 📧 Email & OTP System
- Email verification for account activation
- OTP-based community joining
- Secure password setup flows
- Welcome and notification emails

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication with httpOnly cookies
- **Nodemailer** for email services
- **bcryptjs** for password hashing
- **Winston** for logging
- **Helmet** for security headers

### Frontend
- **Vanilla JavaScript** with modern ES6+
- **Tailwind CSS** for styling
- **Responsive design** for all devices
- **Progressive Web App** features

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- Python 3 (for frontend server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/charansai0108/Skill-port.git
   cd Skill-port
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config.env.example config.env
   # Edit config.env with your settings
   ```

4. **Start MongoDB**
   ```bash
   mongod --config /opt/homebrew/etc/mongod.conf
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

6. **Start the frontend server**
   ```bash
   cd client
   python3 -m http.server 8000
   ```

7. **Access the application**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:5001/api/v1
   - Health Check: http://localhost:5001/health

## 📋 User Flows

### Personal User Flow
1. **Sign Up** → Enter personal details and experience
2. **Email Verification** → Verify email with OTP
3. **Personal Dashboard** → View learning progress and stats
4. **Browse Communities** → Discover and join communities
5. **Join Community** → Set password and verify with OTP
6. **Community Access** → Access community contests and features

### Community Admin Flow
1. **Sign Up** → Create community with admin details
2. **Email Verification** → Verify email with OTP
3. **Admin Dashboard** → Manage community and users
4. **Add Mentors** → Create mentor accounts with credentials
5. **Add Students** → Pre-register students by email
6. **Create Contests** → Set up coding contests for batches

### Mentor Flow
1. **Login** → Use credentials provided by admin
2. **Mentor Dashboard** → View assigned contests and students
3. **Manage Contests** → Start, monitor, and manage contests
4. **Student Management** → Track student progress and performance

### Student Flow
1. **Join Community** → Use pre-registered email to join
2. **Set Password** → Create secure password
3. **Email Verification** → Verify with OTP
4. **Student Dashboard** → View contests and participate
5. **Contest Participation** → Join and compete in contests

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/verify-otp` - OTP verification
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/join-community` - Join community

### Communities
- `GET /api/v1/communities` - List all communities
- `GET /api/v1/community/:code` - Get community by code
- `POST /api/v1/community/:id/mentors` - Add mentor
- `POST /api/v1/community/:id/students` - Add student
- `POST /api/v1/community/:id/batches` - Create batch

### Contests
- `GET /api/v1/contests` - List contests
- `POST /api/v1/contests` - Create contest
- `POST /api/v1/contests/:id/join` - Join contest
- `POST /api/v1/contests/:id/submit` - Submit solution
- `GET /api/v1/contests/:id/leaderboard` - Get leaderboard

## 🔒 Security Features

- **JWT Authentication** with httpOnly cookies
- **Database Session Management** (no localStorage)
- **CSRF Protection** on all state-changing requests
- **Password Hashing** with bcryptjs (12 rounds)
- **Rate Limiting** on authentication endpoints
- **Input Validation** with express-validator
- **Security Headers** with Helmet.js
- **OTP Rate Limiting** to prevent abuse

## 📊 Database Schema

### User Model
- Personal information (name, email, bio)
- Role-based fields (community, batch, expertise)
- Security fields (password, OTP, login attempts)
- Progress tracking (points, level, streak)

### Community Model
- Basic info (name, code, description)
- User associations (admin, mentors, students)
- Batch management
- Settings and preferences

### Contest Model
- Contest details (title, description, dates)
- Problem definitions with test cases
- Participant tracking and scoring
- Leaderboard generation

## 🧪 Testing

Run the comprehensive test suite:
```bash
node test-complete-flows.js
```

Tests cover:
- User registration and authentication
- Community creation and management
- Contest creation and participation
- Role-based access control
- API endpoint functionality

## 🚀 Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/skillport
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:8000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Production Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Install dependencies: `npm install`
4. Start the application: `npm start`
5. Set up reverse proxy (nginx) for production
6. Configure SSL certificates

## 📁 Project Structure

```
skillport-community/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication & validation
│   ├── services/        # Business logic
│   └── config/          # Configuration files
├── client/
│   ├── pages/           # HTML pages
│   ├── js/              # JavaScript modules
│   └── skillport-personal/  # Personal user pages
├── test-complete-flows.js  # Test suite
└── DEPLOYMENT.md        # Deployment guide
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the test cases for usage examples

---

**Built with ❤️ for the coding community**