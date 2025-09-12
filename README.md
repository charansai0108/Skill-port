# SkillPort Community - Static UI Prototype

A pure frontend static UI prototype of the SkillPort Community platform, showcasing all user interfaces and user flows without any backend dependencies.

## 🎯 Project Overview

This is a **static UI-only version** of SkillPort Community, designed for:
- **UI/UX demonstrations**
- **Design reviews and prototyping**
- **Client presentations**
- **Frontend development reference**

## ✨ Features

### 🔐 Authentication Pages
- **Login Page** (`pages/auth/login.html`) - Static login form with demo credentials
- **Register Page** (`pages/auth/register.html`) - Registration form with role selection
- **OTP Verification** (`pages/auth/verify-otp.html`) - Email verification with demo OTP

### 📊 Dashboard Pages
- **Admin Dashboard** (`pages/admin/admin-dashboard.html`) - Community management interface
- **Student Dashboard** (`pages/student/user-dashboard.html`) - Learning progress and contests
- **Mentor Dashboard** (`pages/mentor/mentor-dashboard.html`) - Teaching and mentoring tools
- **Personal Dashboard** (`pages/personal/student-dashboard.html`) - Individual learning space

### 🎨 UI Features
- **Responsive Design** - Works on desktop and mobile
- **Modern Styling** - Tailwind CSS with custom components
- **Interactive Elements** - Hover effects, form validation, navigation
- **Static Data** - Realistic placeholder content throughout
- **Role-based Navigation** - Different interfaces for different user types

## 🚀 Getting Started

### Prerequisites
- Any modern web browser
- A local web server (optional, for CORS compliance)

### Running the Project

#### Option 1: Direct File Access
Simply open any HTML file in your browser:
```
client/pages/auth/login.html
```

#### Option 2: Local Web Server (Recommended)
```bash
# Navigate to the client directory
cd client

# Start a simple HTTP server
python3 -m http.server 8000

# Or using Node.js
npx serve . -p 8000

# Or using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

## 📁 Project Structure

```
skillport-community/
├── client/                     # Main application directory
│   ├── css/                   # Tailwind CSS and custom styles
│   │   ├── tailwind.min.css   # Tailwind CSS framework
│   │   ├── auth.css           # Authentication page styles
│   │   ├── dashboard.css      # Dashboard page styles
│   │   └── components.css     # Reusable component styles
│   ├── images/                # Static assets
│   │   └── og-image.svg       # Open Graph image
│   ├── pages/                 # All application pages
│   │   ├── auth/              # Authentication pages
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── student/           # Student dashboard pages
│   │   ├── mentor/            # Mentor dashboard pages
│   │   ├── personal/          # Personal dashboard pages
│   │   └── *.html             # Landing and utility pages
│   ├── index.html             # Main landing page
│   ├── favicon.ico            # Site favicon
│   └── favicon.svg            # SVG favicon
└── README.md                  # This file
```

## 🎭 Demo Credentials

### Login Page Demo Accounts
- **Admin**: `admin@skillport.com` / `admin123`
- **Mentor**: `mentor@skillport.com` / `mentor123`
- **Student**: `student@skillport.com` / `student123`

### OTP Verification
- **Demo OTP Code**: `123456` (works for any email)

## 🎨 Design System

### Color Palette
- **Primary**: Red (#ef4444, #dc2626)
- **Secondary**: Orange (#ea580c, #f97316)
- **Success**: Green (#10b981, #059669)
- **Warning**: Yellow (#f59e0b, #d97706)
- **Info**: Blue (#3b82f6, #2563eb)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Components
- **Cards**: Glass-morphism effect with backdrop blur
- **Buttons**: Gradient backgrounds with hover animations
- **Forms**: Clean inputs with focus states
- **Navigation**: Responsive with mobile-friendly design

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔧 Customization

### Styling
All styles are in the `css/` directory. The project uses Tailwind CSS with custom components.

### Content
All placeholder data is hardcoded in the HTML files. To modify content, edit the respective HTML files directly.

### Navigation
Navigation is handled through static links. Modify the `href` attributes to change routing.

## 🚫 What's NOT Included

This is a **pure UI prototype**, so it does NOT include:
- Backend APIs or server-side code
- Database connections or data persistence
- User authentication or session management
- Real-time features or live data
- Firebase or any cloud services
- Node.js dependencies or build tools

## 🎯 Use Cases

- **Design Presentations** - Show clients the complete user experience
- **Frontend Development** - Reference for implementing the actual application
- **User Testing** - Gather feedback on UI/UX without backend complexity
- **Portfolio Projects** - Demonstrate frontend skills and design capabilities
- **Stakeholder Reviews** - Get approval on design direction before development

## 📄 License

This is a prototype project for demonstration purposes.

## 🤝 Contributing

This is a static prototype. For the actual SkillPort Community project, please refer to the main repository.

---

**Note**: This is a UI prototype only. All data is static and for demonstration purposes.
