const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect } = require('../middleware/auth');
const requireAuth = require('../middleware/authMiddleware');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Community = require('../models/Community');
const emailService = require('../services/emailService');
const SessionService = require('../services/sessionService');
const logger = require('../config/logger');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Token helpers
function createAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}
function createRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// @desc    Register user (Personal or Community Admin)
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('role').isIn(['personal', 'community-admin']).withMessage('Role must be personal or community-admin'),
    // Community admin specific validations
    body('communityName').if(body('role').equals('community-admin')).notEmpty().withMessage('Community name is required'),
    body('communityCode').if(body('role').equals('community-admin')).matches(/^[A-Z0-9]{2,10}$/).withMessage('Community code must be 2-10 uppercase letters/numbers'),
    body('communityDescription').if(body('role').equals('community-admin')).optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    // Personal user specific validations
    body('experience').if(body('role').equals('personal')).isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Experience must be beginner, intermediate, advanced, or expert'),
    body('skills').if(body('role').equals('personal')).optional().isArray().withMessage('Skills must be an array'),
    body('bio').if(body('role').equals('personal')).optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
], asyncHandler(async (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { firstName, lastName, email, role, communityName, communityCode, communityDescription, experience, skills, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorResponse('Email is already registered', 400));
    }

    let user;
    let community;

    try {
        if (role === 'community-admin') {
            // Check if community code is already taken
            const existingCommunity = await Community.findOne({ code: communityCode.toUpperCase() });
            if (existingCommunity) {
                return next(new ErrorResponse('Community code is already taken', 400));
            }

            // Create community first
            community = await Community.create({
                name: communityName,
                code: communityCode.toUpperCase(),
                description: communityDescription || '',
                admin: null // Will be set after user creation
            });

            // Create community admin user
            user = await User.create({
                firstName,
                lastName,
                email,
                role: 'community-admin',
                community: community._id,
                status: 'pending',
                isTemporaryPassword: true
            });

            // Update community admin reference
            community.admin = user._id;
            await community.save();
        } else {
            // Create personal user
            user = await User.create({
                firstName,
                lastName,
                email,
                role: 'personal',
                experience: experience,
                skills: skills || [],
                bio: bio || '',
                status: 'pending',
                isTemporaryPassword: true
            });
        }

        // Generate OTP
        const otp = user.generateOTP();
        logger.info(`🔐 OTP for ${user.email}: ${otp}`); // Log OTP for testing
        await user.save({ validateBeforeSave: false });

        // Send OTP email
        try {
            await emailService.sendOTPEmail(user.email, otp, user.firstName);
        } catch (emailError) {
            logger.error('Email sending failed:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Registration initiated. Please check your email for OTP verification.',
            data: {
                userId: user._id,
                email: user.email,
                role: user.role,
                otpSent: true,
                ...(community && { communityId: community._id, communityCode: community.code })
            }
        });

    } catch (error) {
        // Cleanup on error
        if (community) {
            await Community.findByIdAndDelete(community._id);
        }
        if (user) {
            await User.findByIdAndDelete(user._id);
        }
        throw error;
    }
}));

// @desc    Verify OTP and complete registration
// @route   POST /api/v1/auth/verify-otp
// @access  Public
router.post('/verify-otp', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { email, otp, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate('community');
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Check if OTP is locked
    if (user.isOTPLocked) {
        return next(new ErrorResponse('Too many OTP attempts. Please try again later.', 429));
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
        await user.incOTPAttempts();
        return next(new ErrorResponse('Invalid or expired OTP', 400));
    }

    // Reset OTP attempts on successful verification
    if (user.otpAttempts > 0) {
        await user.resetOTPAttempts();
    }

    // Set password and activate account
    user.password = password;
    user.isEmailVerified = true;
    user.status = 'active';
    user.otpCode = undefined;
    user.otpExpire = undefined;
    
    await user.save();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Send welcome email
    try {
        const loginUrl = user.role === 'personal' 
            ? `${process.env.FRONTEND_URL}/skillport-personal/student-dashboard.html`
            : `${process.env.FRONTEND_URL}/community-ui/pages/admin/admin-dashboard.html`;
        
        await emailService.sendWelcomeEmail(user.email, user.firstName, user.role, loginUrl);
    } catch (emailError) {
        logger.error('Welcome email failed:', emailError);
    }

    // Set httpOnly cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
        success: true,
        message: 'Email verified successfully. Registration completed.',
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                community: user.community,
                isEmailVerified: user.isEmailVerified,
                status: user.status
            }
        }
    });
}));

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
router.post('/resend-otp', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    if (user.isEmailVerified) {
        return next(new ErrorResponse('Email is already verified', 400));
    }

    // Check if OTP is locked
    if (user.isOTPLocked) {
        return next(new ErrorResponse('Too many OTP attempts. Please try again later.', 429));
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
        await emailService.sendOTPEmail(user.email, otp, user.firstName);
    } catch (emailError) {
        logger.error('OTP email failed:', emailError);
        return next(new ErrorResponse('Failed to send OTP email', 500));
    }

    res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
            email: user.email,
            otpSent: true
        }
    });
}));

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password').populate('community');
    
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }


    // Check if account is locked
    if (user.isLocked) {
        return next(new ErrorResponse('Account is temporarily locked due to too many failed login attempts', 423));
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
        return next(new ErrorResponse('Please verify your email before logging in', 401));
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
        await user.incLoginAttempts();
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
    }

    // Check if it's a temporary password (for mentors)
    const requirePasswordChange = user.isTemporaryPassword;

    // Generate JWT tokens
    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    // Update last activity
    user.lastActivity = Date.now();
    await user.save({ validateBeforeSave: false });

    // Set httpOnly cookies
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
        ok: true,
        message: 'Login successful',
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            community: user.community,
            status: user.status,
            avatar: user.avatar,
            extensionInstalled: user.extensionInstalled
        }
    });
}));

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/community-ui/pages/auth/reset-password.html?token=${resetToken}`;

    try {
        await emailService.sendPasswordResetEmail(user.email, resetUrl, user.firstName);

        res.status(200).json({
            success: true,
            message: 'Password reset email sent',
            data: {
                email: user.email,
                resetEmailSent: true
            }
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
}));

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:resettoken
// @access  Public
router.post('/reset-password/:resettoken', [
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid or expired reset token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.isTemporaryPassword = false;
    
    await user.save();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Set httpOnly cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
        success: true,
        message: 'Password reset successful',
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        }
    });
}));

// @desc    Change password (for logged in users)
// @route   PUT /api/v1/auth/change-password
// @access  Private
router.put('/change-password', protect, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('New password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('New password must contain at least one special character (@$!%*?&)')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password (skip for temporary passwords)
    if (!user.isTemporaryPassword) {
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return next(new ErrorResponse('Current password is incorrect', 400));
        }
    }

    // Check if password was recently used
    if (user.isPasswordRecentlyUsed(newPassword)) {
        return next(new ErrorResponse('Password was recently used. Please choose a different password.', 400));
    }

    // Set new password
    user.password = newPassword;
    user.isTemporaryPassword = false;
    
    // Add to password history
    user.addPasswordToHistory(newPassword);
    
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    });
}));

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('community');

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                bio: user.bio,
                community: user.community,
                batch: user.batch,
                studentId: user.studentId,
                totalPoints: user.totalPoints,
                level: user.level,
                streak: user.streak,
                extensionInstalled: user.extensionInstalled,
                lastExtensionSync: user.lastExtensionSync,
                preferences: user.preferences,
                createdAt: user.createdAt,
                lastActivity: user.lastActivity
            }
        }
    });
}));

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    // Deactivate session in database
    if (token) {
        try {
            await SessionService.deactivateSession(token);
            logger.info('🔐 Auth: Session deactivated for user:', req.user.id);
        } catch (sessionError) {
            logger.error('🔐 Auth: Error deactivating session:', sessionError);
        }
    }

    // Update user's last activity
    await User.findByIdAndUpdate(req.user.id, { lastActivity: Date.now() });

    // Clear httpOnly cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        data: {}
    });
}));

// @desc    Join community (for personal users)
// @route   POST /api/v1/auth/join-community
// @access  Public
router.post('/join-community', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('communityCode').notEmpty().withMessage('Community code is required'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { email, communityCode, password } = req.body;

    // Find community by code
    const community = await Community.findOne({ code: communityCode.toUpperCase() });
    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorResponse('Email is already registered', 400));
    }

    // Create student user
    const user = await User.create({
        firstName: req.body.firstName || 'Student',
        lastName: req.body.lastName || 'User',
        email,
        password,
        role: 'student',
        community: community._id,
        batch: req.body.batch || 'Default',
        status: 'pending',
        isTemporaryPassword: false
    });

    // Add student to community
    await community.addStudent(user._id);

    // Generate OTP for verification
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
        await emailService.sendOTPEmail(user.email, otp, user.firstName);
    } catch (emailError) {
        logger.error('OTP email failed:', emailError);
        return next(new ErrorResponse('Failed to send OTP email', 500));
    }

    res.status(201).json({
        success: true,
        message: 'Community joining initiated. Please check your email for OTP verification.',
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                community: user.community,
                batch: user.batch
            }
        }
    });
}));

// @desc    Check if email exists (for student joining flow)
// @route   POST /api/v1/auth/check-email
// @access  Public
router.post('/check-email', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email }).populate('community');
    if (existingUser) {
        return res.status(200).json({
            success: true,
            data: {
                exists: true,
                userType: existingUser.role,
                community: existingUser.community,
                canLogin: existingUser.isEmailVerified && existingUser.status === 'active'
            }
        });
    }

    // Check if email is pre-registered by any community admin
    // This would be implemented when we add the student pre-registration feature
    // For now, return that email doesn't exist
    res.status(200).json({
        success: true,
        data: {
            exists: false,
            canRegister: true
        }
    });
}));

// @desc    Get OTP for testing (development only)
// @route   GET /api/v1/auth/test-otp/:email
// @access  Public
router.get('/test-otp/:email', asyncHandler(async (req, res, next) => {
    if (process.env.NODE_ENV !== 'development') {
        return next(new ErrorResponse('Not available in production', 404));
    }
    
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }
    
    res.status(200).json({
        success: true,
        data: {
            email: user.email,
            otp: user.otpCode ? 'Check console for OTP' : 'No OTP found',
            otpExpire: user.otpExpire,
            isExpired: user.otpExpire < Date.now()
        }
    });
}));

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user based on accessToken cookie
 */
router.get('/me', requireAuth, async (req, res) => {
  return res.json({ ok: true, user: req.user });
});

/**
 * POST /api/v1/auth/refresh
 * Uses refreshToken cookie to issue a new accessToken cookie.
 */
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) return res.status(401).json({ ok: false, message: 'No refresh token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ ok: false, message: 'Refresh token invalid or expired' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ ok: false, message: 'User not found' });

    const newAccess = createAccessToken(user._id);
    res.cookie('accessToken', newAccess, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('refresh error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;