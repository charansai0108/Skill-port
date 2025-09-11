/**
 * SkillPort Email Service
 * Professional email templates with consistent branding
 */

const nodemailer = require('nodemailer');

// SkillPort Red & Orange Brand Colors - High Impact
const BRAND_CONFIG = {
    primary: '#dc2626',        // Bold Red
    primaryDark: '#b91c1c',    // Darker Red
    secondary: '#ea580c',      // Vibrant Orange
    accent: '#f97316',         // Bright Orange
    success: '#dc2626',        // Red for success (high impact)
    warning: '#ea580c',        // Orange for warnings
    error: '#b91c1c',          // Dark Red for errors
    white: '#ffffff',
    gray50: '#fef2f2',         // Red-tinted gray
    gray100: '#fee2e2',        // Light red tint
    gray200: '#fecaca',        // Red-tinted border
    gray300: '#fca5a5',        // Light red
    gray400: '#f87171',        // Medium red
    gray500: '#ef4444',        // Red
    gray600: '#dc2626',        // Primary red
    gray700: '#b91c1c',        // Dark red
    gray800: '#991b1b',        // Darker red
    gray900: '#7f1d1d',        // Darkest red
    fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
    borderRadius: '12px',
    shadow: '0 20px 25px -5px rgba(220, 38, 38, 0.2), 0 10px 10px -5px rgba(220, 38, 38, 0.1)',
    shadowLg: '0 25px 50px -12px rgba(220, 38, 38, 0.3)'
};

// Email Service Configuration
const EMAIL_CONFIG = {
    from: 'skillport24@gmail.com',
    smtp: {
        service: 'gmail',
        auth: {
            user: 'skillport24@gmail.com',
            pass: 'rsly dsns fuzt hwka'
        }
    }
};

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport(EMAIL_CONFIG.smtp);
};

// Modern Professional Base Email Template
const getBaseTemplate = (title, content) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - SkillPort</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: ${BRAND_CONFIG.fontFamily};
                line-height: 1.5;
                color: ${BRAND_CONFIG.gray800};
                background: linear-gradient(135deg, ${BRAND_CONFIG.gray50} 0%, ${BRAND_CONFIG.gray100} 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
            }
            .email-wrapper {
                max-width: 600px;
                margin: 0 auto;
                background: ${BRAND_CONFIG.white};
                border-radius: 20px;
                overflow: hidden;
                box-shadow: ${BRAND_CONFIG.shadowLg};
                border: 1px solid ${BRAND_CONFIG.gray200};
            }
            .header {
                background: linear-gradient(135deg, ${BRAND_CONFIG.primary} 0%, ${BRAND_CONFIG.secondary} 100%);
                padding: 30px 20px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: shimmer 3s ease-in-out infinite;
            }
            @keyframes shimmer {
                0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
                50% { transform: translateX(100%) translateY(100%) rotate(30deg); }
            }
            .header-content {
                position: relative;
                z-index: 2;
            }
            .header h1 {
                font-size: 2.5rem;
                font-weight: 700;
                color: ${BRAND_CONFIG.white};
                margin: 0;
                letter-spacing: 0.02em;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                font-style: italic;
            }
            .header .tagline {
                font-size: 1rem;
                color: rgba(255,255,255,0.9);
                margin: 12px 0 0 0;
                font-weight: 500;
                letter-spacing: 0.01em;
            }
            .content {
                padding: 40px 30px;
                background: ${BRAND_CONFIG.white};
            }
            .content h2 {
                color: ${BRAND_CONFIG.gray900};
                font-size: 1.6rem;
                font-weight: 600;
                margin-bottom: 24px;
                letter-spacing: 0.01em;
                font-style: italic;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            .content p {
                color: ${BRAND_CONFIG.gray700};
                margin-bottom: 20px;
                font-size: 0.95rem;
                line-height: 1.7;
            }
            .otp-container {
                background: linear-gradient(135deg, ${BRAND_CONFIG.gray50} 0%, ${BRAND_CONFIG.white} 100%);
                border: 3px solid ${BRAND_CONFIG.primary};
                border-radius: 16px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
                position: relative;
                overflow: hidden;
            }
            .otp-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, ${BRAND_CONFIG.primary}, ${BRAND_CONFIG.secondary}, ${BRAND_CONFIG.accent});
            }
            .otp-code {
                font-size: 2.8rem;
                font-weight: 700;
                color: ${BRAND_CONFIG.primary};
                letter-spacing: 0.2rem;
                margin: 0;
                font-family: '"Playfair Display", "Georgia", "Times New Roman", serif';
                text-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
                font-style: italic;
            }
            .otp-label {
                color: ${BRAND_CONFIG.gray600};
                font-size: 0.9rem;
                margin-bottom: 12px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                font-weight: 600;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, ${BRAND_CONFIG.primary} 0%, ${BRAND_CONFIG.secondary} 100%);
                color: ${BRAND_CONFIG.white};
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 1rem;
                margin: 24px 0;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
                border: none;
                cursor: pointer;
                letter-spacing: 0.02em;
                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                font-style: italic;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
            }
            .button-secondary {
                background: linear-gradient(135deg, ${BRAND_CONFIG.gray600} 0%, ${BRAND_CONFIG.gray700} 100%);
                box-shadow: 0 4px 15px rgba(100, 116, 139, 0.3);
            }
            .button-secondary:hover {
                box-shadow: 0 8px 25px rgba(100, 116, 139, 0.4);
            }
            .footer {
                background: ${BRAND_CONFIG.gray50};
                padding: 30px;
                text-align: center;
                border-top: 1px solid ${BRAND_CONFIG.gray200};
            }
            .footer p {
                color: ${BRAND_CONFIG.gray600};
                font-size: 0.9rem;
                margin: 8px 0;
                line-height: 1.5;
            }
            .footer a {
                color: ${BRAND_CONFIG.primary};
                text-decoration: none;
                font-weight: 600;
                transition: color 0.2s ease;
            }
            .footer a:hover {
                color: ${BRAND_CONFIG.primaryDark};
            }
            .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent, ${BRAND_CONFIG.gray300}, transparent);
                margin: 20px 0;
            }
            .highlight {
                background: linear-gradient(135deg, ${BRAND_CONFIG.gray50} 0%, ${BRAND_CONFIG.white} 100%);
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid ${BRAND_CONFIG.primary};
                margin: 20px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .warning {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-left-color: ${BRAND_CONFIG.warning};
                color: ${BRAND_CONFIG.gray800};
            }
            .success {
                background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                border-left-color: ${BRAND_CONFIG.success};
                color: ${BRAND_CONFIG.gray800};
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 16px;
                margin: 24px 0;
            }
            .feature {
                text-align: center;
                padding: 20px 16px;
                background: linear-gradient(135deg, ${BRAND_CONFIG.gray50} 0%, ${BRAND_CONFIG.white} 100%);
                border-radius: 12px;
                border: 1px solid ${BRAND_CONFIG.gray200};
                transition: all 0.2s ease;
            }
            .feature:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .feature-icon {
                font-size: 2.5rem;
                margin-bottom: 12px;
                display: block;
            }
            .feature h3 {
                font-size: 1rem;
                font-weight: 700;
                color: ${BRAND_CONFIG.gray900};
                margin: 0 0 8px 0;
            }
            .feature p {
                font-size: 0.85rem;
                color: ${BRAND_CONFIG.gray600};
                margin: 0;
                line-height: 1.4;
            }
            .cta-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: linear-gradient(135deg, ${BRAND_CONFIG.gray50} 0%, ${BRAND_CONFIG.white} 100%);
                border-radius: 12px;
            }
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                .email-wrapper {
                    border-radius: 16px;
                }
                .header, .content, .footer {
                    padding: 24px 20px;
                }
                .header h1 {
                    font-size: 2rem;
                }
                .otp-code {
                    font-size: 2.2rem;
                    letter-spacing: 0.2rem;
                }
                .features {
                    grid-template-columns: 1fr;
                }
                .button {
                    display: block;
                    width: 100%;
                    text-align: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <div class="header-content">
                    <h1>SkillPort</h1>
                    <p class="tagline">Your learning journey starts now</p>
                </div>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p><strong>SkillPort Community</strong></p>
                <p>Empowering developers worldwide through skill-building and community</p>
                <div class="divider"></div>
                <p>
                    <a href="https://skillport.com">Visit SkillPort</a> | 
                    <a href="https://skillport.com/help">Help Center</a> | 
                    <a href="https://skillport.com/contact">Contact Us</a>
                </p>
                <p style="font-size: 0.8rem; color: ${BRAND_CONFIG.gray500}; margin-top: 16px;">
                    This email was sent to you because you have an account with SkillPort.
                    If you didn't request this, please ignore this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// OTP Verification Email - Mobile Optimized
const getOTPEmailTemplate = (firstName, lastName, otpCode) => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'there';
    
    const content = `
        <h2>Verify Email</h2>
        <p><strong>Hi ${fullName}!</strong></p>
        
        <p>Thank you for joining SkillPort! To complete your registration, please verify your email address using the code below:</p>
        
        <div class="otp-container">
            <div class="otp-label">VERIFICATION CODE</div>
            <div class="otp-code">${otpCode}</div>
        </div>
        
        <div class="highlight warning">
            <strong>This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.</strong>
        </div>
    `;
    
    return getBaseTemplate('Email Verification', content);
};

// Registration Welcome Email - Mobile Optimized
const getRegistrationWelcomeTemplate = (firstName, lastName) => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'there';
    
    const content = `
        <h2>Welcome to SkillPort!</h2>
        <p><strong>Hi ${fullName}!</strong></p>
        
        <p>Congratulations! Your SkillPort account has been successfully created. You're now part of a community dedicated to building skills and achieving greatness.</p>
        
        <div class="highlight success">
            <strong>Account Type: Personal</strong>
        </div>
        
        <div class="cta-section">
            <a href="https://skillport.com/dashboard" class="button">Start Your Journey</a>
        </div>
        
        <p style="font-size: 0.85rem; color: ${BRAND_CONFIG.gray600}; margin-top: 24px;">
            If you have any questions, feel free to reach out to our support team. We're here to help!
        </p>
    `;
    
    return getBaseTemplate('Welcome to SkillPort', content);
};

// First Login Welcome Email - Clean & Minimal
const getFirstLoginTemplate = (firstName, lastName) => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'there';
    
    const content = `
        <h2>Welcome Back!</h2>
        <p>Hello ${fullName},</p>
        
        <p>Great to see you again! Ready to continue your journey?</p>
        
        <div class="highlight success">
            <strong>Quick Start:</strong><br>
            • Complete your profile<br>
            • Join a community<br>
            • Try a contest
        </div>
        
        <h3>Trending Now</h3>
        
        <div class="features">
            <div class="feature">
                <h3>Weekly Contest</h3>
            </div>
            <div class="feature">
                <h3>React Discussion</h3>
            </div>
            <div class="feature">
                <h3>New Guide</h3>
            </div>
        </div>
        
        <div class="cta-section">
            <a href="https://skillport.com/contests" class="button">Join Contest</a>
            <a href="https://skillport.com/communities" class="button button-secondary" style="margin-left: 12px;">Explore</a>
        </div>
        
        <p style="font-size: 0.85rem; color: ${BRAND_CONFIG.gray600}; font-style: italic; margin-top: 24px;">
            Every expert was once a beginner. Take your time and enjoy the journey!
        </p>
        
        <p style="margin-top: 28px; font-weight: 600; color: ${BRAND_CONFIG.gray800};">
            Happy coding!<br>
            <span style="color: ${BRAND_CONFIG.primary};">The SkillPort Team</span>
        </p>
    `;
    
    return getBaseTemplate('Welcome Back to SkillPort', content);
};

// Password Reset Email - Clean & Minimal
const getPasswordResetTemplate = (firstName, lastName, resetLink) => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'there';
    
    const content = `
        <h2>Reset Your Password</h2>
        <p>Hello ${fullName},</p>
        
        <p>We received a password reset request for your account.</p>
        
        <div class="cta-section">
            <a href="${resetLink}" class="button">Reset Password</a>
        </div>
        
        <div class="highlight warning">
            <strong>Expires in 1 hour</strong>
        </div>
        
        <p style="font-size: 0.85rem; color: ${BRAND_CONFIG.gray600}; margin-top: 20px;">
            <strong>Manual link:</strong><br>
            <span style="word-break: break-all; background: ${BRAND_CONFIG.gray100}; padding: 8px; border-radius: 6px; font-family: monospace; font-size: 0.7rem; display: inline-block; margin-top: 6px;">
                ${resetLink}
            </span>
        </p>
        
        <div class="highlight" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left-color: ${BRAND_CONFIG.error}; margin-top: 24px;">
            <strong>Didn't request this?</strong><br>
            • Ignore this email<br>
            • Check for suspicious activity<br>
            • Contact support if concerned
        </div>
    `;
    
    return getBaseTemplate('Password Reset', content);
};

// Email Service Class
class EmailService {
    constructor() {
        this.transporter = createTransporter();
    }
    
    async sendOTPEmail(email, firstName, lastName, otpCode) {
        try {
            const html = getOTPEmailTemplate(firstName, lastName, otpCode);
            
            const mailOptions = {
                from: EMAIL_CONFIG.from,
                to: email,
                subject: '🔐 Verify Your Email - SkillPort',
                html: html
            };
            
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ OTP email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error sending OTP email:', error);
            return { success: false, error: error.message };
        }
    }
    
    async sendRegistrationWelcomeEmail(email, firstName, lastName) {
        try {
            const html = getRegistrationWelcomeTemplate(firstName, lastName);
            
            const mailOptions = {
                from: EMAIL_CONFIG.from,
                to: email,
                subject: '🎉 Welcome to SkillPort - Your Journey Begins!',
                html: html
            };
            
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Registration welcome email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error sending registration welcome email:', error);
            return { success: false, error: error.message };
        }
    }
    
    async sendFirstLoginEmail(email, firstName, lastName) {
        try {
            const html = getFirstLoginTemplate(firstName, lastName);
            
            const mailOptions = {
                from: EMAIL_CONFIG.from,
                to: email,
                subject: '👋 Welcome Back to SkillPort!',
                html: html
            };
            
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ First login email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error sending first login email:', error);
            return { success: false, error: error.message };
        }
    }
    
    async sendPasswordResetEmail(email, firstName, lastName, resetLink) {
        try {
            const html = getPasswordResetTemplate(firstName, lastName, resetLink);
            
            const mailOptions = {
                from: EMAIL_CONFIG.from,
                to: email,
                subject: '🔑 Reset Your SkillPort Password',
                html: html
            };
            
            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error sending password reset email:', error);
            return { success: false, error: error.message };
        }
    }
    
    async testEmailConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service connection verified');
            return { success: true };
        } catch (error) {
            console.error('❌ Email service connection failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = {
    EmailService,
    getOTPEmailTemplate,
    getRegistrationWelcomeTemplate,
    getFirstLoginTemplate,
    getPasswordResetTemplate,
    BRAND_CONFIG
};
