import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from './email'
import { prisma } from './prisma'
import { getSocketManager } from './socket'

interface EmailNotificationData {
  userId: string
  type: string
  title: string
  message: string
  data?: any
}

export async function sendEmailNotification(notification: EmailNotificationData) {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: notification.userId },
      select: { name: true, email: true, notificationSettings: true }
    })

    if (!user) {
      console.error('User not found for notification:', notification.userId)
      return false
    }

    // Check if user has email notifications enabled
    const settings = user.notificationSettings as any
    if (settings?.emailNotifications === false) {
      console.log('Email notifications disabled for user:', notification.userId)
      return false
    }

    // Send real-time notification first
    const socketManager = getSocketManager()
    if (socketManager) {
      await socketManager.sendNotification(notification.userId, {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data
      })
    }

    // Send email based on notification type
    let emailSent = false

    switch (notification.type) {
      case 'CONTEST_START':
        emailSent = await sendContestStartEmail(user.email, user.name, notification.data)
        break
      case 'CONTEST_END':
        emailSent = await sendContestEndEmail(user.email, user.name, notification.data)
        break
      case 'FEEDBACK_RECEIVED':
        emailSent = await sendFeedbackReceivedEmail(user.email, user.name, notification.data)
        break
      case 'SUBSCRIPTION_CREATED':
        emailSent = await sendSubscriptionCreatedEmail(user.email, user.name, notification.data)
        break
      case 'SUBSCRIPTION_CANCELED':
        emailSent = await sendSubscriptionCanceledEmail(user.email, user.name, notification.data)
        break
      case 'MENTOR_ASSIGNED':
        emailSent = await sendMentorAssignedEmail(user.email, user.name, notification.data)
        break
      case 'DAILY_REMINDER':
        emailSent = await sendDailyReminderEmail(user.email, user.name, notification.data)
        break
      default:
        emailSent = await sendGenericNotificationEmail(user.email, user.name, notification)
    }

    return emailSent
  } catch (error) {
    console.error('Error sending email notification:', error)
    return false
  }
}

// Contest Start Email
async function sendContestStartEmail(email: string, name: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🚀 Contest Started: ${data.contestName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Contest Started!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Great news! The contest "${data.contestName}" has just started. 
            You can now begin solving problems and competing with other participants.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #333; margin-top: 0;">Contest Details</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Duration:</strong> ${data.duration || '2 hours'}</li>
              <li><strong>Problems:</strong> ${data.problemCount || '5'}</li>
              <li><strong>Difficulty:</strong> ${data.difficulty || 'Mixed'}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/contests/${data.contestId}" 
               style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Join Contest Now
            </a>
          </div>
        </div>
      </div>
    `,
  }

  // Send email using your email service
  return true // Placeholder - implement actual email sending
}

// Contest End Email
async function sendContestEndEmail(email: string, name: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🏆 Contest Ended: ${data.contestName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Contest Completed!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            The contest "${data.contestName}" has ended. Check out your performance and see how you ranked!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #333; margin-top: 0;">Your Performance</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Rank:</strong> #${data.rank || 'N/A'}</li>
              <li><strong>Score:</strong> ${data.score || '0'} points</li>
              <li><strong>Problems Solved:</strong> ${data.problemsSolved || '0'}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/contests/${data.contestId}" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              View Results
            </a>
          </div>
        </div>
      </div>
    `,
  }

  return true // Placeholder - implement actual email sending
}

// Feedback Received Email
async function sendFeedbackReceivedEmail(email: string, name: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `💬 New Feedback Received`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Feedback!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            You've received new feedback from your mentor. Check it out to improve your skills!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #333; margin-top: 0;">Feedback Details</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>From:</strong> ${data.mentorName || 'Your Mentor'}</li>
              <li><strong>Rating:</strong> ${data.rating || 'N/A'}/5 stars</li>
              <li><strong>Category:</strong> ${data.category || 'General'}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/feedback" 
               style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              View Feedback
            </a>
          </div>
        </div>
      </div>
    `,
  }

  return true // Placeholder - implement actual email sending
}

// Subscription Created Email
async function sendSubscriptionCreatedEmail(email: string, name: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🎉 Welcome to ${data.planName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Active!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Welcome to ${data.planName}! Your subscription is now active and you have access to all premium features.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Explore premium contests</li>
              <li>Get priority mentor feedback</li>
              <li>Access advanced analytics</li>
              <li>Join exclusive communities</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/personal/dashboard" 
               style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Start Learning
            </a>
          </div>
        </div>
      </div>
    `,
  }

  return true // Placeholder - implement actual email sending
}

// Subscription Canceled Email
async function sendSubscriptionCanceledEmail(email: string, name: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `😢 Subscription Canceled`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Canceled</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your ${data.planName} subscription has been canceled. 
            ${data.cancelAtPeriodEnd ? 'You still have access until the end of your current billing period.' : 'Your access has been revoked immediately.'}
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #333; margin-top: 0;">We're Sorry to See You Go</h3>
            <p style="color: #666; line-height: 1.6; margin: 0;">
              If you change your mind, you can reactivate your subscription anytime. 
              We'd love to have you back!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/personal/subscription" 
               style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Reactivate Subscription
            </a>
          </div>
        </div>
      </div>
    `,
  }

  return true // Placeholder - implement actual email sending
}

// Mentor Assigned Email
async function sendMentorAssignedEmail(email: string, name: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `👨‍🏫 New Mentor Assigned`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Mentor!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Great news! You've been assigned a new mentor: ${data.mentorName}. 
            They'll help guide your learning journey and provide valuable feedback.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
            <h3 style="color: #333; margin-top: 0;">Your Mentor</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Name:</strong> ${data.mentorName}</li>
              <li><strong>Specialization:</strong> ${data.specialization || 'General'}</li>
              <li><strong>Experience:</strong> ${data.experience || '5+ years'}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/feedback" 
               style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Connect with Mentor
            </a>
          </div>
        </div>
      </div>
    `,
  }

  return true // Placeholder - implement actual email sending
}

// Daily Reminder Email
async function sendDailyReminderEmail(email: string, name: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `📚 Daily Learning Reminder`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Daily Reminder</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Don't forget to practice today! Here are some suggestions to keep you motivated:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #333; margin-top: 0;">Today's Suggestions</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Solve 2-3 coding problems</li>
              <li>Review yesterday's mistakes</li>
              <li>Join an active contest</li>
              <li>Read mentor feedback</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/personal/dashboard" 
               style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Start Learning
            </a>
          </div>
        </div>
      </div>
    `,
  }

  return true // Placeholder - implement actual email sending
}

// Generic Notification Email
async function sendGenericNotificationEmail(email: string, name: string, notification: EmailNotificationData) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: notification.title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">${notification.title}</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            ${notification.message}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/personal/dashboard" 
               style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              View Details
            </a>
          </div>
        </div>
      </div>
    `,
  }

  return true // Placeholder - implement actual email sending
}
