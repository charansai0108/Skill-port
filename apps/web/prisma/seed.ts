import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@skillport.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@skillport.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true
    }
  })


  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@skillport.com' },
    update: {},
    create: {
      name: 'John Mentor',
      email: 'mentor@skillport.com',
      password: hashedPassword,
      role: 'MENTOR',
      emailVerified: true,
      bio: 'Experienced software engineer and coding mentor',
      subject: 'Computer Science'
    }
  })


  const student = await prisma.user.upsert({
    where: { email: 'student@skillport.com' },
    update: {},
    create: {
      name: 'Alice Student',
      email: 'student@skillport.com',
      password: hashedPassword,
      role: 'STUDENT',
      emailVerified: true,
      bio: 'Computer Science student passionate about competitive programming'
    }
  })


  const communityAdmin = await prisma.user.upsert({
    where: { email: 'community@skillport.com' },
    update: {},
    create: {
      name: 'Community Manager',
      email: 'community@skillport.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
      bio: 'Community manager for coding bootcamps and universities'
    }
  })

  const personalUser = await prisma.user.upsert({
    where: { email: 'personal@skillport.com' },
    update: {},
    create: {
      name: 'Personal Learner',
      email: 'personal@skillport.com',
      password: hashedPassword,
      role: 'PERSONAL',
      emailVerified: true,
      bio: 'Self-taught developer learning new technologies'
    }
  })

  // Create communities
  const community = await prisma.community.upsert({
    where: { id: 'community-1' },
    update: {},
    create: {
      id: 'community-1',
      name: 'Coding Bootcamp 2024',
      slug: 'coding-bootcamp-2024',
      description: 'A community for coding bootcamp students and alumni',
      type: 'bootcamp',
      isPublic: true,
      adminId: communityAdmin.id
    }
  })

  // Add members to community
  await prisma.communityMember.upsert({
    where: { userId_communityId: { userId: student.id, communityId: community.id } },
    update: {},
    create: {
      userId: student.id,
      communityId: community.id,
      role: 'MEMBER'
    }
  })

  // Add mentor to community
  await prisma.communityMember.upsert({
    where: { userId_communityId: { userId: mentor.id, communityId: community.id } },
    update: {},
    create: {
      userId: mentor.id,
      communityId: community.id,
      role: 'MENTOR'
    }
  })

  // Update mentor to have communityId
  await prisma.user.update({
    where: { id: mentor.id },
    data: { communityId: community.id }
  })

  // Create contests
  const contest = await prisma.contest.upsert({
    where: { id: 'contest-1' },
    update: {},
    create: {
      id: 'contest-1',
      title: 'Weekly Coding Challenge',
      description: 'Solve 5 algorithmic problems in 2 hours',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      status: 'UPCOMING',
      maxParticipants: 100,
      rules: 'No external help allowed. Use only standard libraries.',
      prizes: 'Winner gets $100, top 10 get certificates',
      createdById: admin.id
    }
  })

  // Create contest participants
  await prisma.contestParticipant.upsert({
    where: { userId_contestId: { userId: student.id, contestId: contest.id } },
    update: {},
    create: {
      userId: student.id,
      contestId: contest.id,
      score: 0,
      rank: null
    }
  })

  // Create submissions
  const submission1 = await prisma.submission.create({
    data: {
      title: 'Two Sum Solution',
      description: 'Efficient solution using hash map',
      userId: student.id,
      contestId: contest.id,
      platform: 'LEETCODE',
      difficulty: 'EASY',
      status: 'ACCEPTED',
      score: 100,
      accuracy: 100,
      code: 'function twoSum(nums, target) { ... }'
    }
  })

  const submission2 = await prisma.submission.create({
    data: {
      title: 'Binary Tree Traversal',
      description: 'In-order traversal implementation',
      userId: student.id,
      platform: 'HACKERRANK',
      difficulty: 'MEDIUM',
      status: 'ACCEPTED',
      score: 85,
      accuracy: 85,
      code: 'function inorderTraversal(root) { ... }'
    }
  })

  // Create feedback
  await prisma.feedback.create({
    data: {
      content: 'Great solution! Consider optimizing the space complexity.',
      rating: 4,
      status: 'COMPLETED',
      mentorId: mentor.id,
      studentId: student.id,
      submissionId: submission1.id
    }
  })

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Complete React Tutorial',
        description: 'Finish the official React tutorial',
        platform: 'React',
        difficulty: 'EASY',
        completed: true,
        userId: personalUser.id
      },
      {
        title: 'Build Todo App',
        description: 'Create a full-stack todo application',
        platform: 'Full Stack',
        difficulty: 'MEDIUM',
        completed: false,
        userId: personalUser.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      {
        title: 'Learn TypeScript',
        description: 'Complete TypeScript fundamentals course',
        platform: 'TypeScript',
        difficulty: 'MEDIUM',
        completed: false,
        userId: student.id
      }
    ]
  })

  // Create projects
  await prisma.project.createMany({
    data: [
      {
        userId: personalUser.id,
        title: 'E-commerce Website',
        description: 'Full-stack e-commerce platform with React and Node.js',
        status: 'In Progress'
      },
      {
        userId: student.id,
        title: 'Portfolio Website',
        description: 'Personal portfolio showcasing projects and skills',
        status: 'Completed'
      }
    ]
  })

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: 'New Contest Available',
        message: 'Weekly Coding Challenge is now open for registration',
        type: 'CONTEST',
        isRead: false
      },
      {
        userId: mentor.id,
        title: 'New Feedback Request',
        message: 'Alice Student has requested feedback on their submission',
        type: 'FEEDBACK',
        isRead: false
      },
      {
        userId: admin.id,
        title: 'System Update',
        message: 'Platform has been updated with new features',
        type: 'SYSTEM',
        isRead: true
      }
    ]
  })

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: student.id,
        action: 'Submitted solution for Two Sum',
        details: 'LeetCode problem solved with 100% accuracy'
      },
      {
        userId: mentor.id,
        action: 'Provided feedback to student',
        details: 'Reviewed Alice Student\'s submission'
      },
      {
        userId: admin.id,
        action: 'Created new contest',
        details: 'Weekly Coding Challenge contest created'
      }
    ]
  })


  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin:', admin.email)
  console.log('👨‍🏫 Mentor:', mentor.email)
  console.log('👨‍🎓 Student:', student.email)
  console.log('👥 Community Admin:', communityAdmin.email)
  console.log('👤 Personal User:', personalUser.email)
  console.log('🔑 Password for all users: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })