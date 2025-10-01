const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const userCount = await prisma.user.count()
    console.log('✅ Database connected successfully')
    console.log(`📊 Total users: ${userCount}`)
    
    // Test creating a simple user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'PERSONAL'
      }
    })
    
    console.log('✅ User created successfully:', testUser.id)
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    
    console.log('✅ Test completed successfully')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
