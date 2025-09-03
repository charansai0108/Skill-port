const nodemailer = require('nodemailer');
const ErrorResponse = require('../utils/errorResponse');

class EmailService {
    constructor() {
        this.transporter = null;
        this.init();
    }

    // Initialize email transporter
    init() {
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verify connection
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('❌ Email service configuration error:', error);
                } else {
                    console.log('✅ Email service is ready');
                }
            });
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error);
        }
    }

    // Send email with template
    async sendEmail(options) {
        try {
            // For development, log email instead of sending
            if (process.env.NODE_ENV === 'development') {
                console.log('📧 DEVELOPMENT EMAIL (not sent):', {
                    to: options.email,
                    subject: options.subject,
                    html: options.html
                });
                return { messageId: 'dev-' + Date.now() };
            }

            const mailOptions = {
                from: `SkillPort <${process.env.EMAIL_FROM}>`,
                to: options.email,
                subject: options.subject,
                html: options.html,
                text: options.text
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            // Don't throw error in development
            if (process.env.NODE_ENV === 'development') {
                console.log('📧 Email failed but continuing in development mode');
                return { messageId: 'dev-error-' + Date.now() };
            }
            throw new ErrorResponse('Email could not be sent', 500);
        }
    }

    // Send OTP verification email
    async sendOTPEmail(email, otp, firstName) {
        const subject = 'SkillPort - Verify Your Email';
        const html = this.getOTPTemplate(otp, firstName);
        
        return this.sendEmail({
            email,
            subject,
            html
        });
    }

    // Send welcome email
    async sendWelcomeEmail(email, firstName, role, loginUrl) {
        const subject = 'Welcome to SkillPort!';
        const html = this.getWelcomeTemplate(firstName, role, loginUrl);
        
        return this.sendEmail({
            email,
            subject,
            html
        });
    }

    // Send password reset email
    async sendPasswordResetEmail(email, resetUrl, firstName) {
        const subject = 'SkillPort - Reset Your Password';
        const html = this.getPasswordResetTemplate(resetUrl, firstName);
        
        return this.sendEmail({
            email,
            subject,
            html
        });
    }

    // Send mentor invitation email
    async sendMentorInvitationEmail(email, tempPassword, communityName, loginUrl, firstName) {
        const subject = `You're invited to mentor at ${communityName}!`;
        const html = this.getMentorInvitationTemplate(firstName, communityName, email, tempPassword, loginUrl);
        
        return this.sendEmail({
            email,
            subject,
            html
        });
    }

    // Send student enrollment notification
    async sendStudentEnrollmentEmail(email, communityName, batchName, loginUrl, firstName) {
        const subject = `Welcome to ${communityName}!`;
        const html = this.getStudentEnrollmentTemplate(firstName, communityName, batchName, loginUrl);
        
        return this.sendEmail({
            email,
            subject,
            html
        });
    }

    // OTP Email Template
    getOTPTemplate(otp, firstName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - SkillPort</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">SkillPort</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Build Your Skills, Build Your Future</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 20px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${firstName}!</h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Thank you for joining SkillPort! To complete your registration, please verify your email address using the code below:
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                        <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                        <div style="font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; margin: 0;">${otp}</div>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        © 2024 SkillPort. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Welcome Email Template
    getWelcomeTemplate(firstName, role, loginUrl) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to SkillPort!</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to SkillPort!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your learning journey starts now</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 20px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${firstName}!</h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Congratulations! Your SkillPort account has been successfully created. You're now part of a community dedicated to building skills and achieving greatness.
                    </p>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #92400e; margin: 0; font-weight: 600;">Account Type: ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${loginUrl}" style="background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                            Start Your Journey
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        If you have any questions, feel free to reach out to our support team. We're here to help you succeed!
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        © 2024 SkillPort. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Password Reset Template
    getPasswordResetTemplate(resetUrl, firstName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - SkillPort</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Reset Password</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">SkillPort Account Security</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 20px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${firstName}!</h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        We received a request to reset your password. Click the button below to create a new password:
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetUrl}" style="background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #991b1b; margin: 0; font-size: 14px;">
                            <strong>Security Notice:</strong> This link will expire in 10 minutes. If you didn't request this reset, please ignore this email.
                        </p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <span style="word-break: break-all; color: #dc2626;">${resetUrl}</span>
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        © 2024 SkillPort. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Mentor Invitation Template
    getMentorInvitationTemplate(firstName, communityName, email, tempPassword, loginUrl) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mentor Invitation - ${communityName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Mentor Invitation</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">${communityName}</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 20px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${firstName}!</h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        You've been invited to join <strong>${communityName}</strong> as a mentor on SkillPort! Your expertise and guidance will help shape the next generation of skilled professionals.
                    </p>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #92400e; margin: 0 0 10px 0; font-weight: 600;">Your Login Credentials:</p>
                        <p style="color: #92400e; margin: 0; font-family: monospace;">
                            <strong>Email:</strong> ${email}<br>
                            <strong>Temporary Password:</strong> ${tempPassword}
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${loginUrl}" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                            Start Mentoring
                        </a>
                    </div>
                    
                    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #047857; margin: 0; font-size: 14px;">
                            <strong>Security:</strong> Please change your password after your first login for security purposes.
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        © 2024 SkillPort. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Student Enrollment Template
    getStudentEnrollmentTemplate(firstName, communityName, batchName, loginUrl) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ${communityName}!</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to ${communityName}!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your learning journey begins</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 20px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${firstName}!</h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Congratulations! You've been successfully enrolled in <strong>${communityName}</strong>. You're now part of an amazing learning community.
                    </p>
                    
                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #1e40af; margin: 0; font-weight: 600;">Batch: ${batchName}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${loginUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                            Access Your Dashboard
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        Get ready to learn, grow, and achieve your goals with the support of mentors and fellow students!
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        © 2024 SkillPort. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;