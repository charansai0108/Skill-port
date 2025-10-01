const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyAllUsers() {
  try {
    console.log('🔐 Verifying all unverified users...')
    
    // Find all unverified users
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { emailVerified: false },
          { isVerified: false }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isVerified: true
      }
    })
    
    console.log(`📊 Found ${unverifiedUsers.length} unverified users:`)
    unverifiedUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`)
    })
    
    if (unverifiedUsers.length === 0) {
      console.log('✅ All users are already verified!')
      return
    }
    
    // Update all unverified users
    const updateResult = await prisma.user.updateMany({
      where: {
        OR: [
          { emailVerified: false },
          { isVerified: false }
        ]
      },
      data: {
        emailVerified: true,
        isVerified: true,
        otpCode: null,
        otpExpiry: null
      }
    })
    
    console.log(`✅ Updated ${updateResult.count} users to verified status`)
    
    // Show updated users
    const updatedUsers = await prisma.user.findMany({
      where: {
        id: { in: unverifiedUsers.map(u => u.id) }
      },
      select: {
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isVerified: true
      }
    })
    
    console.log('\n📋 Updated users:')
    updatedUsers.forEach(user => {
      console.log(`   ✅ ${user.name} (${user.email}) - Role: ${user.role}`)
    })
    
    console.log('\n🎉 ALL USERS ARE NOW READY FOR LOGIN!')
    
  } catch (error) {
    console.error('❌ Error verifying users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAllUsers()
