# SkillPort Community - Project Structure

## 📁 **Clean Project Structure**

```
skillport-community/
├── backend/                    # Backend API server
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── config/                # Configuration files
│   ├── utils/                 # Utility functions
│   └── server.js              # Main server file
├── client/                    # Frontend application
│   ├── pages/                 # HTML pages
│   │   ├── auth/             # Authentication pages
│   │   ├── admin/            # Admin panel pages
│   │   ├── mentor/           # Mentor pages
│   │   └── user/             # User pages
│   ├── skillport-personal/    # Personal user dashboard
│   ├── js/                   # JavaScript files
│   │   ├── apiService.js     # API communication
│   │   ├── authManager.js    # Authentication management
│   │   ├── dataManager.js    # Data handling
│   │   └── notifications.js  # Notification system
│   ├── css/                  # Stylesheets
│   ├── images/               # Image assets
│   └── index.html            # Main landing page
├── SKILL-EXTENSION/          # Browser extension
├── .gitignore                # Git ignore rules
├── API_DOCUMENTATION.md      # API documentation
├── README.md                 # Project readme
└── deploy.sh                 # Deployment script
```

## 🔧 **Key Changes Made**

1. **Renamed `community-ui` to `client`** - Better naming convention
2. **Moved `skillport-personal` into `client`** - Fixes serving issues
3. **Consolidated JavaScript files** - Removed duplicates, kept essential ones
4. **Cleaned up root directory** - Removed unnecessary files
5. **Organized file structure** - Clear separation of concerns

## 🚀 **How to Run**

### Frontend (Client)
```bash
cd client
npx serve -p 8000
```

### Backend
```bash
cd backend
node server.js
```

## 📍 **URL Structure**

- **Main Site**: `http://localhost:8000/`
- **Personal Dashboard**: `http://localhost:8000/skillport-personal/student-dashboard`
- **Community Pages**: `http://localhost:8000/pages/...`
- **Admin Panel**: `http://localhost:8000/pages/admin/...`
