const express = require('express');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const Joi = require('joi');
const router = express.Router();

const db = admin.firestore();

// Input validation schemas
const generateOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional()
});

const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required()
});

// Nodemailer transporter setup
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.OTP_SMTP_USER || functions.config().smtp?.user,
            pass: process.env.OTP_SMTP_PASS || functions.config().smtp?.pass,
        },
    });
};

// Rate limiting for OTP generation
const otpLimiter = require('express-rate-limit')({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Max 5 requests per minute per IP
    message: 'Too many OTP requests from this IP, please try again after a minute',
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /otp/generate - Generate and send OTP
router.post('/generate', otpLimiter, async (req, res) => {
    try {
        const { error, value } = generateOtpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const { email, firstName, lastName } = value;

        // Generate OTP
        const otp = otpGenerator.generate(6, { 
            upperCaseAlphabets: false, 
            specialChars: false, 
            lowerCaseAlphabets: false 
        });
        
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        const attempts = 0;

        // Store OTP in Firestore
        await db.collection('otps').doc(email).set({
            code: otp,
            expiry,
            attempts,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Generated OTP for ${email}: ${otp}`);

        // Send email
        try {
            const transporter = createTransporter();
            await transporter.sendMail({
                from: process.env.OTP_SMTP_USER || functions.config().smtp?.user,
                to: email,
                subject: 'SkillPort OTP Verification',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #ef4444;">SkillPort Email Verification</h2>
                        <p>Hello ${firstName || ''} ${lastName || ''},</p>
                        <p>Thank you for registering with SkillPort. To complete your registration, please use the following One-Time Password (OTP):</p>
                        <h3 style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px;">${otp}</h3>
                        <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
                        <p>If you did not request this, please ignore this email.</p>
                        <p>Best regards,</p>
                        <p>The SkillPort Team</p>
                    </div>
                `,
            });

            res.json({ success: true, message: 'OTP sent to your email' });
        } catch (emailError) {
            console.error('Error sending OTP email:', emailError);
            res.status(500).json({ success: false, message: 'Failed to send OTP email' });
        }
    } catch (error) {
        console.error('Generate OTP error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /otp/verify - Verify OTP
router.post('/verify', async (req, res) => {
    try {
        const { error, value } = verifyOtpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const { email, otp } = value;

        // Get stored OTP
        const otpDoc = await db.collection('otps').doc(email).get();
        
        if (!otpDoc.exists) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const storedOtp = otpDoc.data();

        // Check attempts
        if (storedOtp.attempts >= 3) {
            await db.collection('otps').doc(email).delete();
            return res.status(400).json({ 
                success: false, 
                message: 'Too many incorrect attempts. Please request a new OTP.' 
            });
        }

        // Check expiry
        if (Date.now() > storedOtp.expiry) {
            await db.collection('otps').doc(email).delete();
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        // Verify OTP
        if (storedOtp.code === otp) {
            // OTP is correct, delete it
            await db.collection('otps').doc(email).delete();
            
            res.json({ success: true, message: 'OTP verified successfully' });
        } else {
            // Increment attempts
            await db.collection('otps').doc(email).update({
                attempts: admin.firestore.FieldValue.increment(1)
            });
            
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /otp/verify-and-create-user - Verify OTP and create user document
router.post('/verify-and-create-user', async (req, res) => {
    try {
        const { error, value } = verifyOtpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const { email, otp, userData } = req.body;

        // Verify OTP first
        const otpDoc = await db.collection('otps').doc(email).get();
        
        if (!otpDoc.exists) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const storedOtp = otpDoc.data();

        if (storedOtp.attempts >= 3) {
            await db.collection('otps').doc(email).delete();
            return res.status(400).json({ 
                success: false, 
                message: 'Too many incorrect attempts. Please request a new OTP.' 
            });
        }

        if (Date.now() > storedOtp.expiry) {
            await db.collection('otps').doc(email).delete();
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (storedOtp.code !== otp) {
            await db.collection('otps').doc(email).update({
                attempts: admin.firestore.FieldValue.increment(1)
            });
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // OTP is correct, create user document
        const userId = userData.uid;
        const userDocData = {
            ...userData,
            emailVerified: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(userId).set(userDocData);
        
        // Delete OTP
        await db.collection('otps').doc(email).delete();
        
        res.json({
            success: true,
            message: 'OTP verified and user created successfully',
            user: userDocData
        });
    } catch (error) {
        console.error('Verify OTP and create user error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
