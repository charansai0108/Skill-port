# Database Migration Guide

## Overview

This guide outlines the database changes required to support the new Student API endpoints for Dashboard, Feedback, Contests, and Contest Participation.

## Required Changes

### 1. New Submission Model

The `Submission` model has been added to track contest problem submissions:

```prisma
model Submission {
  id         String    @id @default(cuid())
  problemId  String
  userId     String
  contestId  String
  code       String
  language   String
  status     String    // PENDING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, etc.
  score      Int       @default(0)
  executionTime Int?   // in milliseconds
  memoryUsage   Int?   // in KB
  submittedAt   DateTime @default(now())

  // Relations
  problem    Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
  user       User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  contest    Contest @relation(fields: [contestId], references: [id], onDelete: Cascade)

  @@map("submissions")
}
```

### 2. Updated Relations

**User Model:**
- Added `submissions Submission[]` relation

**Contest Model:**
- Added `submissions Submission[]` relation

**Problem Model:**
- Added `submissions Submission[]` relation

### 3. ActivityLog Enhancement

The `ActivityLog` model has been simplified to use a single `userId` field and JSON `details` for flexibility.

## Migration Steps

### 1. Generate Prisma Client
```bash
npm run db:generate
```

### 2. Push Schema Changes
```bash
npm run db:push
```

### 3. Run Migration (if using migrations)
```bash
npm run db:migrate
```

## Required Environment Variables

Ensure the following environment variables are set:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/skillport_db"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="24h"
```

## Indexes for Performance

Consider adding these indexes for better query performance:

```sql
-- Submission indexes
CREATE INDEX idx_submissions_user_contest ON submissions(userId, contestId);
CREATE INDEX idx_submissions_problem_status ON submissions(problemId, status);
CREATE INDEX idx_submissions_contest_status ON submissions(contestId, status);

-- Contest participant indexes
CREATE INDEX idx_contest_participants_score ON contest_participants(contestId, score DESC);
CREATE INDEX idx_contest_participants_rank ON contest_participants(contestId, rank ASC);

-- Feedback indexes
CREATE INDEX idx_feedback_student_created ON feedback(studentId, createdAt DESC);
CREATE INDEX idx_feedback_mentor_created ON feedback(mentorId, createdAt DESC);

-- Activity log indexes
CREATE INDEX idx_activity_logs_user_created ON activity_logs(userId, createdAt DESC);
```

## Seed Data

You may want to add some sample data for testing:

### Sample Contests
```typescript
// In your seed file
const sampleContests = [
  {
    title: "Weekly Algorithm Challenge",
    description: "Test your algorithmic thinking",
    status: "ACTIVE",
    startDate: new Date("2025-09-20"),
    endDate: new Date("2025-09-27"),
    difficulty: "MEDIUM"
  }
]
```

### Sample Problems
```typescript
const sampleProblems = [
  {
    title: "Two Sum",
    description: "Find two numbers that add up to target",
    difficulty: "EASY",
    points: 100,
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: [
      { input: [2, 7, 11, 15], target: 9, output: [0, 1] }
    ]
  }
]
```

## API Testing

After migration, test the APIs with sample data:

### 1. Test Dashboard
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/dashboard
```

### 2. Test Contests
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/contests
```

### 3. Test Feedback
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/feedbacks
```

## Rollback Plan

If you need to rollback the changes:

1. Remove the new Submission model from `schema.prisma`
2. Remove the new relations from existing models
3. Run `npm run db:push` to apply changes
4. Remove the new API files

## Monitoring

After deployment, monitor:
- API response times
- Database query performance
- Error rates in logs
- Authentication success rates

## Security Considerations

- All endpoints require authentication
- Role-based access control is implemented
- Input validation is applied to all request bodies
- SQL injection prevention through Prisma ORM
- Rate limiting should be implemented at the server level
