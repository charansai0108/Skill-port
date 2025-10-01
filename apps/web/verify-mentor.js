const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyMentor() {
  try {
    console.log('🔐 Verifying mentor email...')
    
    // Find the mentor user
    const mentor = await prisma.user.findUnique({
      where: { email: 'mentor@skillport.com' }
    })
    
    if (!mentor) {
      console.log('❌ Mentor not found')
      return
    }
    
    console.log('📧 Found mentor:', mentor.email)
    console.log('📊 Current verification status:', {
      emailVerified: mentor.emailVerified,
      isVerified: mentor.isVerified,
      otpCode: mentor.otpCode ? 'Present' : 'Not present'
    })
    
    // Update mentor to be verified
    const updatedMentor = await prisma.user.update({
      where: { id: mentor.id },
      data: {
        emailVerified: true,
        isVerified: true,
        otpCode: null, // Clear OTP since it's verified
        otpExpiry: null
      }
    })
    
    console.log('✅ Mentor email verified successfully!')
    console.log('📊 Updated verification status:', {
      emailVerified: updatedMentor.emailVerified,
      isVerified: updatedMentor.isVerified,
      otpCode: updatedMentor.otpCode ? 'Present' : 'Not present'
    })
    
    console.log('\n🎉 MENTOR IS NOW READY FOR LOGIN!')
    console.log('Email: mentor@skillport.com')
    console.log('Password: password123')
    console.log('Community: test-community')
    console.log('Dashboard: http://localhost:3000/community/test-community/mentor/dashboard')
    
  } catch (error) {
    console.error('❌ Error verifying mentor:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyMentor()
