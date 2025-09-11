/**
 * OTP Verification Server
 * Handles OTP generation, email sending, and verification
 */

const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const { EmailService } = require('./email-templates/emailService');
require('dotenv').config();

const app = express();
const PORT = process.env.OTP_PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map();

// Initialize Email Service
const emailService = new EmailService();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email using new Email Service
const sendOTPEmail = async (email, otp, firstName, lastName) => {
    try {
        const result = await emailService.sendOTPEmail(email, firstName, lastName, otp);
        if (result.success) {
            console.log(`✅ OTP email sent to ${email}`);
        }
        return result.success;
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        return false;
    }
};

// API Routes

// Generate and send OTP
app.post('/api/otp/generate', async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;

        if (!email || !firstName) {
            return res.status(400).json({
                success: false,
                message: 'Email and first name are required'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

        // Store OTP
        otpStorage.set(email, {
            otp,
            expiresAt,
            attempts: 0,
            firstName,
            lastName
        });

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp, firstName, lastName);

        if (emailSent) {
            res.json({
                success: true,
                message: 'OTP sent successfully',
                expiresIn: 600 // 10 minutes in seconds
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify OTP
app.post('/api/otp/verify', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const storedData = otpStorage.get(email);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found for this email'
            });
        }

        // Check if OTP has expired
        if (Date.now() > storedData.expiresAt) {
            otpStorage.delete(email);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Check attempts limit
        if (storedData.attempts >= 3) {
            otpStorage.delete(email);
            return res.status(400).json({
                success: false,
                message: 'Too many failed attempts. Please request a new OTP.'
            });
        }

        // Verify OTP
        if (storedData.otp === otp) {
            // OTP is correct, remove it from storage
            otpStorage.delete(email);
            
            res.json({
                success: true,
                message: 'OTP verified successfully',
                userData: {
                    email,
                    firstName: storedData.firstName,
                    lastName: storedData.lastName
                }
            });
        } else {
            // Increment attempts
            storedData.attempts++;
            otpStorage.set(email, storedData);
            
            res.status(400).json({
                success: false,
                message: 'Invalid OTP',
                attemptsLeft: 3 - storedData.attempts
            });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Resend OTP
app.post('/api/otp/resend', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const storedData = otpStorage.get(email);

        if (!storedData) {
            return res.status(400).json({
                success: false,
                message: 'No pending OTP for this email'
            });
        }

        // Generate new OTP
        const newOtp = generateOTP();
        const expiresAt = Date.now() + (10 * 60 * 1000);

        // Update stored data
        otpStorage.set(email, {
            ...storedData,
            otp: newOtp,
            expiresAt,
            attempts: 0
        });

        // Send new OTP email
        const emailSent = await sendOTPEmail(email, newOtp, storedData.firstName);

        if (emailSent) {
            res.json({
                success: true,
                message: 'New OTP sent successfully',
                expiresIn: 600
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'OTP Server is running',
        timestamp: new Date().toISOString()
    });
});

// Send Registration Welcome Email
app.post('/api/email/registration-welcome', async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;

        if (!email || !firstName) {
            return res.status(400).json({
                success: false,
                message: 'Email and first name are required'
            });
        }

        const result = await emailService.sendRegistrationWelcomeEmail(email, firstName, lastName);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Registration welcome email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send registration welcome email',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Registration welcome email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Send First Login Email
app.post('/api/email/first-login', async (req, res) => {
    try {
        const { email, firstName, lastName } = req.body;

        if (!email || !firstName) {
            return res.status(400).json({
                success: false,
                message: 'Email and first name are required'
            });
        }

        const result = await emailService.sendFirstLoginEmail(email, firstName, lastName);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'First login email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send first login email',
                error: result.error
            });
        }
    } catch (error) {
        console.error('First login email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Send Password Reset Email
app.post('/api/email/password-reset', async (req, res) => {
    try {
        const { email, firstName, lastName, resetLink } = req.body;

        if (!email || !firstName || !resetLink) {
            return res.status(400).json({
                success: false,
                message: 'Email, first name, and reset link are required'
            });
        }

        const result = await emailService.sendPasswordResetEmail(email, firstName, lastName, resetLink);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Password reset email sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send password reset email',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Password reset email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Test Email Service Connection
app.get('/api/email/test-connection', async (req, res) => {
    try {
        const result = await emailService.testEmailConnection();
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Email service connection successful'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Email service connection failed',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Email connection test error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 OTP Server running on port ${PORT}`);
    console.log(`📧 Gmail User: skillport24@gmail.com`);
    console.log(`🔐 App Password: Configured`);
    console.log(`🎨 Email Templates: Professional SkillPort branding`);
});

module.exports = app;
