const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createMentor() {
  try {
    console.log('🔐 Creating mentor user...')
    
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // Create mentor user
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
    
    console.log('✅ Mentor created:', mentor.email)
    
    // Create a community
    const community = await prisma.community.upsert({
      where: { id: 'test-community-1' },
      update: {},
      create: {
        id: 'test-community-1',
        name: 'Test Community',
        slug: 'test-community',
        description: 'A test community for mentor testing',
        type: 'public',
        isPublic: true,
        adminId: mentor.id
      }
    })
    
    console.log('✅ Community created:', community.name)
    
    // Update mentor to have communityId
    await prisma.user.update({
      where: { id: mentor.id },
      data: { communityId: community.id }
    })
    
    console.log('✅ Mentor assigned to community')
    
    // Add mentor as community member
    await prisma.communityMember.upsert({
      where: { userId_communityId: { userId: mentor.id, communityId: community.id } },
      update: {},
      create: {
        userId: mentor.id,
        communityId: community.id,
        role: 'MENTOR'
      }
    })
    
    console.log('✅ Mentor added as community member')
    
    console.log('\n🎉 MENTOR CREDENTIALS:')
    console.log('Email: mentor@skillport.com')
    console.log('Password: password123')
    console.log('Community: test-community')
    console.log('Mentor Dashboard URL: http://localhost:3000/community/test-community/mentor/dashboard')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createMentor()
