const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development - use Mailtrap or similar
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@skillport.com',
      to: email,
      subject: 'SkillPort - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to SkillPort, ${firstName}!</h2>
          <p>Please verify your email address using the OTP below:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

// Send welcome email to mentor
exports.sendMentorWelcomeEmail = async (email, firstName, loginUrl, password) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@skillport.com',
      to: email,
      subject: 'Welcome to SkillPort - Mentor Account Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to SkillPort, ${firstName}!</h2>
          <p>Your mentor account has been created successfully.</p>
          <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
          <p><strong>Temporary Password:</strong> ${password}</p>
          <p>Please change your password after your first login.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to mentor ${email}`);
  } catch (error) {
    logger.error('Mentor welcome email failed:', error);
    throw error;
  }
};

// Send invitation email to student
exports.sendStudentInvitationEmail = async (email, firstName, communityName, joinUrl) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@skillport.com',
      to: email,
      subject: `Invitation to join ${communityName} on SkillPort`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited to join ${communityName}!</h2>
          <p>Hello ${firstName},</p>
          <p>You've been invited to join the ${communityName} community on SkillPort.</p>
          <p><a href="${joinUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Community</a></p>
          <p>This invitation will help you set up your account and join the community.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Invitation email sent to student ${email}`);
  } catch (error) {
    logger.error('Student invitation email failed:', error);
    throw error;
  }
};
