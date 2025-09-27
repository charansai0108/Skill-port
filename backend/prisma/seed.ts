import { PrismaClient, Platform, Difficulty, Priority, ProjectStatus, SkillLevel, DayOfWeek } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123', // In real app, this would be properly hashed
      bio: 'Passionate developer and problem solver',
      theme: 'light',
      notificationSettings: {
        email: true,
        push: true,
        community: true,
        achievements: true,
        tasks: true,
        projects: true
      }
    }
  })

  console.log('✅ Created test user:', user.email)

  // Create communities
  const communities = await Promise.all([
    prisma.community.upsert({
      where: { name: 'Algorithm Masters' },
      update: {},
      create: {
        name: 'Algorithm Masters',
        category: 'Competitive Programming',
        description: 'Master algorithms and data structures with competitive programming enthusiasts. Daily challenges and expert guidance.'
      }
    }),
    prisma.community.upsert({
      where: { name: 'Web Dev Hub' },
      update: {},
      create: {
        name: 'Web Dev Hub',
        category: 'Web Development',
        description: 'Modern web development with React, Node.js, and full-stack technologies.'
      }
    }),
    prisma.community.upsert({
      where: { name: 'AI & ML Hub' },
      update: {},
      create: {
        name: 'AI & ML Hub',
        category: 'AI & Machine Learning',
        description: 'Artificial Intelligence and Machine Learning discussions and projects.'
      }
    })
  ])

  console.log('✅ Created communities:', communities.length)

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        userId: user.id,
        description: 'Two Sum Problem',
        platform: Platform.LEETCODE,
        difficulty: Difficulty.EASY,
        completed: true,
        date: new Date('2024-01-15'),
        priority: Priority.MEDIUM
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        description: 'Binary Tree Traversal',
        platform: Platform.LEETCODE,
        difficulty: Difficulty.MEDIUM,
        completed: true,
        date: new Date('2024-01-16'),
        priority: Priority.HIGH
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        description: 'Dynamic Programming - Fibonacci',
        platform: Platform.GEEKSFORGEEKS,
        difficulty: Difficulty.MEDIUM,
        completed: false,
        date: new Date(),
        priority: Priority.MEDIUM
      }
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        description: 'React Component Optimization',
        platform: Platform.OTHER,
        difficulty: Difficulty.HARD,
        completed: false,
        date: new Date(),
        priority: Priority.LOW
      }
    })
  ])

  console.log('✅ Created tasks:', tasks.length)

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        userId: user.id,
        title: 'LeetCode Practice',
        description: 'Daily practice problems from LeetCode',
        status: ProjectStatus.ACTIVE
      }
    }),
    prisma.project.create({
      data: {
        userId: user.id,
        title: 'Portfolio Website',
        description: 'Personal portfolio website built with Next.js',
        status: ProjectStatus.ACTIVE
      }
    })
  ])

  console.log('✅ Created projects:', projects.length)

  // Link tasks to projects
  await prisma.projectTask.createMany([
    {
      projectId: projects[0].id,
      taskId: tasks[0].id,
      userId: user.id
    },
    {
      projectId: projects[0].id,
      taskId: tasks[1].id,
      userId: user.id
    },
    {
      projectId: projects[1].id,
      taskId: tasks[3].id,
      userId: user.id
    }
  ])

  console.log('✅ Linked tasks to projects')

  // Create sample skills
  const skills = await Promise.all([
    prisma.skill.create({
      data: {
        userId: user.id,
        name: 'Algorithms',
        level: SkillLevel.INTERMEDIATE,
        completionPercentage: 75
      }
    }),
    prisma.skill.create({
      data: {
        userId: user.id,
        name: 'Web Development',
        level: SkillLevel.ADVANCED,
        completionPercentage: 85
      }
    }),
    prisma.skill.create({
      data: {
        userId: user.id,
        name: 'Data Structures',
        level: SkillLevel.INTERMEDIATE,
        completionPercentage: 70
      }
    })
  ])

  console.log('✅ Created skills:', skills.length)

  // Create sample badges/achievements
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        userId: user.id,
        name: 'First Problem Solved',
        description: 'Solved your first coding problem!'
      }
    }),
    prisma.badge.create({
      data: {
        userId: user.id,
        name: 'Week Streak',
        description: 'Maintained a 7-day coding streak'
      }
    }),
    prisma.badge.create({
      data: {
        userId: user.id,
        name: 'Algorithm Master',
        description: 'Solved 50+ algorithm problems'
      }
    })
  ])

  console.log('✅ Created badges:', badges.length)

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        communityId: communities[0].id,
        userId: user.id,
        title: 'How to optimize binary search?',
        description: 'I\'m working on a binary search problem and wondering about the best approach for optimization.',
        platform: Platform.LEETCODE,
        difficulty: Difficulty.MEDIUM
      }
    }),
    prisma.post.create({
      data: {
        communityId: communities[1].id,
        userId: user.id,
        title: 'React performance tips',
        description: 'What are the best practices for optimizing React component performance?',
        platform: Platform.OTHER,
        difficulty: Difficulty.HARD
      }
    })
  ])

  console.log('✅ Created posts:', posts.length)

  // Create daily tasks
  const today = new Date()
  const todayName = getTodayName(today)
  
  await prisma.dailyTasks.upsert({
    where: {
      userId_day: {
        userId: user.id,
        day: todayName
      }
    },
    update: {
      taskIds: [tasks[2].id, tasks[3].id] // Today's tasks
    },
    create: {
      userId: user.id,
      day: todayName,
      taskIds: [tasks[2].id, tasks[3].id]
    }
  })

  console.log('✅ Created daily tasks')

  console.log('🎉 Database seeding completed successfully!')
}

function getTodayName(date: Date): DayOfWeek {
  const day = date.getDay()
  const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  return days[day]
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
