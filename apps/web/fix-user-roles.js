const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUserRoles() {
  try {
    console.log('🔧 Fixing user roles...')
    
    // Find users with invalid roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    console.log(`📊 Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`)
    })
    
    // Fix any users with COMMUNITY_ADMIN role
    const invalidRoleUsers = users.filter(user => user.role === 'COMMUNITY_ADMIN')
    
    if (invalidRoleUsers.length > 0) {
      console.log(`\n🔧 Fixing ${invalidRoleUsers.length} users with invalid COMMUNITY_ADMIN role...`)
      
      for (const user of invalidRoleUsers) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' }
        })
        console.log(`   ✅ Updated ${user.name} to ADMIN role`)
      }
    }
    
    // Now verify all users
    console.log('\n🔐 Verifying all users...')
    
    const updateResult = await prisma.user.updateMany({
      data: {
        emailVerified: true,
        isVerified: true,
        otpCode: null,
        otpExpiry: null
      }
    })
    
    console.log(`✅ Updated ${updateResult.count} users to verified status`)
    
    // Show final status
    const finalUsers = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isVerified: true
      }
    })
    
    console.log('\n📋 Final user status:')
    finalUsers.forEach(user => {
      console.log(`   ✅ ${user.name} (${user.email}) - Role: ${user.role} - Verified: ${user.emailVerified}`)
    })
    
    console.log('\n🎉 ALL USERS ARE NOW READY FOR LOGIN!')
    
  } catch (error) {
    console.error('❌ Error fixing user roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserRoles()
