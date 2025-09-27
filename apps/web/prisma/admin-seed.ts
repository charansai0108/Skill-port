import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding admin data...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@skillport.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@skillport.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    }
  })

  console.log('✅ Admin user created:', admin.email)

  // Create sample batch
  const batch = await prisma.batch.upsert({
    where: { name: 'Batch 2024' },
    update: {},
    create: {
      name: 'Batch 2024',
      description: 'Main batch for 2024',
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    }
  })

  console.log('✅ Sample batch created:', batch.name)

  // Create sample mentor
  const mentorPassword = await bcrypt.hash('mentor123', 12)
  
  const mentor = await prisma.mentor.upsert({
    where: { email: 'mentor@skillport.com' },
    update: {},
    create: {
      name: 'John Mentor',
      email: 'mentor@skillport.com',
      password: mentorPassword,
      specialization: 'Algorithms and Data Structures',
      bio: 'Experienced mentor in competitive programming',
      isActive: true,
      rating: 4.8,
      totalStudents: 0
    }
  })

  // Assign mentor to batch
  await prisma.mentorBatch.upsert({
    where: {
      mentorId_batchId: {
        mentorId: mentor.id,
        batchId: batch.id
      }
    },
    update: {},
    create: {
      mentorId: mentor.id,
      batchId: batch.id
    }
  })

  console.log('✅ Sample mentor created:', mentor.email)

  // Create sample contest
  const contest = await prisma.contest.upsert({
    where: { name: 'Weekly Contest #1' },
    update: {},
    create: {
      name: 'Weekly Contest #1',
      description: 'First weekly programming contest',
      status: 'UPCOMING',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      batchId: batch.id,
      maxParticipants: 100
    }
  })

  console.log('✅ Sample contest created:', contest.name)

  // Create sample students
  const studentPassword = await bcrypt.hash('student123', 12)
  
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'student1@skillport.com' },
      update: {},
      create: {
        name: 'Alice Student',
        email: 'student1@skillport.com',
        password: studentPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        batchId: batch.id
      }
    }),
    prisma.user.upsert({
      where: { email: 'student2@skillport.com' },
      update: {},
      create: {
        name: 'Bob Student',
        email: 'student2@skillport.com',
        password: studentPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        batchId: batch.id
      }
    }),
    prisma.user.upsert({
      where: { email: 'student3@skillport.com' },
      update: {},
      create: {
        name: 'Charlie Student',
        email: 'student3@skillport.com',
        password: studentPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        batchId: batch.id
      }
    })
  ])

  console.log('✅ Sample students created:', students.length)

  // Add students to contest
  await Promise.all(
    students.map(student =>
      prisma.contestParticipant.upsert({
        where: {
          contestId_userId: {
            contestId: contest.id,
            userId: student.id
          }
        },
        update: {},
        create: {
          contestId: contest.id,
          userId: student.id,
          score: Math.floor(Math.random() * 100)
        }
      })
    )
  )

  console.log('✅ Students added to contest')

  // Create some sample tasks for students
  const platforms = ['LEETCODE', 'GEEKSFORGEEKS', 'HACKERRANK', 'CODEFORCES']
  const difficulties = ['EASY', 'MEDIUM', 'HARD']
  
  for (const student of students) {
    for (let i = 0; i < 5; i++) {
      await prisma.task.create({
        data: {
          userId: student.id,
          description: `Sample problem ${i + 1}`,
          platform: platforms[Math.floor(Math.random() * platforms.length)] as any,
          difficulty: difficulties[Math.floor(Math.random() * difficulties.length)] as any,
          completed: Math.random() > 0.5,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
        }
      })
    }
  }

  console.log('✅ Sample tasks created')

  // Create some sample projects
  for (const student of students) {
    await prisma.project.create({
      data: {
        userId: student.id,
        title: `Project ${student.name}`,
        description: `A sample project by ${student.name}`,
        status: Math.random() > 0.5 ? 'ACTIVE' : 'COMPLETED'
      }
    })
  }

  console.log('✅ Sample projects created')

  console.log('🎉 Admin seeding completed successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('Admin: admin@skillport.com / admin123')
  console.log('Mentor: mentor@skillport.com / mentor123')
  console.log('Students: student1@skillport.com / student123')
  console.log('         student2@skillport.com / student123')
  console.log('         student3@skillport.com / student123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
