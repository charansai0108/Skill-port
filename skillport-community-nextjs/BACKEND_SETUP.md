# Backend Setup Guide

This guide will help you set up the backend for the SkillPort Community application.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Database Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skillport_community?schema=public"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# JWT
JWT_SECRET="your-jwt-secret-here"

# Platform API Keys (for syncing)
LEETCODE_API_KEY=""
GEEKSFORGEEKS_API_KEY=""
HACKERRANK_API_KEY=""
CODEFORCES_API_KEY=""
```

### 3. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 4. Seed Database

```bash
# Populate database with sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary data

### Stats
- `GET /api/stats/summary?platform=&difficulty=&dateRange=` - Get filtered stats

### Communities
- `GET /api/communities` - List all communities
- `GET /api/communities/[id]/posts` - Get community posts
- `POST /api/communities/[id]/posts` - Create new post
- `POST /api/communities/[id]/join` - Join community

### Tasks
- `GET /api/tasks` - Get user tasks with filters
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `PATCH /api/tasks/bulk` - Bulk update tasks
- `GET /api/tasks/today` - Get today's tasks

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile

## Database Schema

### Core Models

- **User** - User accounts and preferences
- **Task** - Individual coding problems/tasks
- **Project** - Project containers for tasks
- **Community** - Discussion communities
- **Post** - Community posts and questions
- **Badge** - User achievements
- **Skill** - User skill tracking

### Key Features

- **Task Management** - Create, update, complete tasks
- **Project Organization** - Group tasks into projects
- **Community Interaction** - Join communities, post questions
- **Progress Tracking** - Stats, streaks, achievements
- **Platform Integration** - Support for LeetCode, GFG, HackerRank, etc.

## Development Commands

```bash
# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio

# Development
npm run dev            # Start dev server
npm run build          # Build for production
npm run start          # Start production server

# Testing
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Linting
npm run lint           # Run all linters
npm run lint:js        # JavaScript linting
npm run lint:css       # CSS linting
```

## Authentication

Currently, the API uses a simple user ID header (`x-user-id`) for authentication. In production, you should implement:

- JWT token authentication
- Session management
- Password hashing
- OAuth integration

## Platform Integration

The backend is designed to support integration with coding platforms:

- **LeetCode** - Problem syncing and progress tracking
- **GeeksforGeeks** - Practice problems
- **HackerRank** - Challenges and contests
- **CodeForces** - Competitive programming

## Real-time Features

Future enhancements will include:

- WebSocket connections for real-time updates
- Push notifications
- Live collaboration features
- Real-time progress tracking

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your hosting platform
5. Set up monitoring and logging

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify credentials

2. **Prisma Client Error**
   - Run `npm run db:generate`
   - Check schema syntax

3. **Migration Issues**
   - Reset database: `npx prisma migrate reset`
   - Check for schema conflicts

### Getting Help

- Check Prisma documentation
- Review API endpoint logs
- Test with sample data from seed script
