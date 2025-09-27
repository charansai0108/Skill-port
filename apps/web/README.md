# SkillPort Community - Next.js 14 Migration

A modern, responsive learning platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX** - Glass-morphism design with smooth animations
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Role-based Access** - Admin, Mentor, Student, and Personal user roles
- **Authentication** - Login, registration, and OTP verification
- **Dashboard System** - Role-specific dashboards with analytics
- **TypeScript** - Full type safety and better developer experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router
- **Build Tool**: Next.js built-in bundler

## 📁 Project Structure

```
skillport-community-nextjs/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard pages
│   ├── mentor/            # Mentor dashboard pages
│   ├── student/           # Student dashboard pages
│   ├── personal/          # Personal user pages
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
│   ├── ui/                # Basic UI components
│   └── layout/            # Layout components
├── lib/                   # Utility functions and constants
└── public/                # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skillport-community-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Available Pages

### **Authentication**
- `/auth/login` - User login with demo credentials
- `/auth/register` - User registration
- `/auth/verify-otp` - Email verification (Demo OTP: 123456)

### **Dashboards**
- `/admin/dashboard` - Admin management dashboard
- `/mentor/dashboard` - Mentor teaching dashboard
- `/student/dashboard` - Student learning dashboard
- `/personal/dashboard` - Personal user dashboard

### **Landing Page**
- `/` - Main landing page with features and stats

## 🔑 Demo Credentials

- **Admin**: `admin@skillport.com` / `admin123`
- **Mentor**: `mentor@skillport.com` / `mentor123`
- **Student**: `student@skillport.com` / `student123`

## 🎨 Design System

### **Colors**
- **Primary**: Red (#ef4444, #dc2626)
- **Secondary**: Orange (#ea580c, #f97316)
- **Success**: Green (#10b981, #059669)
- **Info**: Blue (#3b82f6, #2563eb)

### **Components**
- **Cards**: Glass-morphism with backdrop blur
- **Buttons**: Gradient backgrounds with hover animations
- **Forms**: Clean inputs with focus states
- **Navigation**: Responsive with mobile-friendly design

## 🛠️ Development

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Adding New Pages**

1. Create a new file in the appropriate `app/` directory
2. Export a default React component
3. Use the existing UI components for consistency

### **Adding New Components**

1. Create component files in `components/` directory
2. Use TypeScript interfaces for props
3. Follow the existing naming conventions

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### **Other Platforms**
- **Netlify**: Use `npm run build` and deploy the `out` folder
- **AWS S3**: Build and upload static files
- **Docker**: Use the included Dockerfile

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] Database connectivity
- [ ] Real-time features
- [ ] User authentication
- [ ] File uploads
- [ ] Email notifications
- [ ] Payment integration
- [ ] Mobile app

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email support@skillport.com or create an issue in the repository.

---

**Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS**