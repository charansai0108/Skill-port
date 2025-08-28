const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');
// const { extractIP } = require('../middleware/security');

const router = express.Router();

// @route   GET /api/auth/status
// @desc    Check auth service status
// @access  Public
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper function to send response
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  const response = { success, message };
  if (data) response.data = data;
  res.status(statusCode).json(response);
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be between 3 and 30 characters and contain only letters, numbers, and underscores'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role').isIn(['personal', 'community']).withMessage('Invalid role')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return sendResponse(res, false, 'Validation failed', { errors: errors.array() }, 400);
    }



    const {
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      educationLevel,
      fieldOfStudy,
      experienceYears,
      specialization,
      bio,
      primaryInterest,
      skillLevel
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return sendResponse(res, false, 'Email already registered', null, 400);
      }
      if (existingUser.username === username) {
        return sendResponse(res, false, 'Username already taken', null, 400);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with role-specific fields
    const userData = {
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
      isActive: true,
      lastActive: new Date(),
      lastLoginDate: new Date(),
      ipAddress: req.ip
    };

    // Add role-specific fields
    if (role === 'personal') {
      userData.skillLevel = skillLevel;
      userData.primaryInterest = primaryInterest;
      userData.educationLevel = educationLevel;
      userData.fieldOfStudy = req.body.fieldOfStudy;
      userData.bio = bio;
    } else if (role === 'community') {
      userData.organizationName = req.body.organizationName;
      userData.organizationType = req.body.organizationType;
      userData.organizationSize = req.body.organizationSize;
      userData.position = req.body.position;
      userData.organizationWebsite = req.body.organizationWebsite;
    }

    const user = new User(userData);

    await user.save();

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in user document (temporary)
    user.emailVerificationToken = otp;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send verification email
    try {
      await emailService.sendOTP(email, otp, 'verification');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.emailVerificationExpires;

    sendResponse(res, true, 'Registration successful. Please verify your email.', {
      user: userResponse,
      token,
      requiresEmailVerification: true
    }, 201);

  } catch (error) {
    console.error('Registration error:', error);
    sendResponse(res, false, 'Server error during registration', null, 500);
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP for email verification or password reset
// @access  Public
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('type').isIn(['verification', 'password_reset']).withMessage('Invalid OTP type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, 'Validation failed', { errors: errors.array() }, 400);
    }

    const { email, type } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, false, 'User not found with this email address', null, 404);
    }

    if (type === 'verification' && user.isEmailVerified) {
      return sendResponse(res, false, 'Email is already verified', null, 400);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    if (type === 'verification') {
      user.emailVerificationToken = otp;
      user.emailVerificationExpires = expiresAt;
    } else {
      user.passwordResetToken = otp;
      user.passwordResetExpires = expiresAt;
    }

    await user.save();

    // Send OTP email
    try {
      await emailService.sendOTP(email, otp, type);
      sendResponse(res, true, `OTP sent to ${email}`, { expiresAt });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      sendResponse(res, false, 'Failed to send OTP. Please try again.', null, 500);
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    sendResponse(res, false, 'Server error while sending OTP', null, 500);
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for email verification or password reset
// @access  Public
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
  body('type').isIn(['verification', 'password_reset']).withMessage('Invalid OTP type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, 'Validation failed', { errors: errors.array() }, 400);
    }

    const { email, otp, type } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, false, 'User not found with this email address', null, 404);
    }

    // Check OTP and expiration
    let isValid = false;
    let tokenField = '';
    let expiresField = '';

    if (type === 'verification') {
      tokenField = 'emailVerificationToken';
      expiresField = 'emailVerificationExpires';
    } else {
      tokenField = 'passwordResetToken';
      expiresField = 'passwordResetExpires';
    }

    if (user[tokenField] === otp && user[expiresField] > new Date()) {
      isValid = true;
    }

    if (!isValid) {
      return sendResponse(res, false, 'Invalid or expired OTP', null, 400);
    }

    // Process verification
    if (type === 'verification') {
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      
      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(email, user.username, user.firstName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    } else {
      // Password reset - clear tokens
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
    }

    await user.save();

    // Generate JWT token for verified users
    let token = null;
    if (type === 'verification') {
      token = generateToken(user._id);
    }

    sendResponse(res, true, `${type === 'verification' ? 'Email verified' : 'OTP verified'} successfully`, {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    sendResponse(res, false, 'Server error while verifying OTP', null, 500);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, 'Validation failed', { errors: errors.array() }, 400);
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found for email:', email);
      return sendResponse(res, false, 'Invalid credentials', null, 401);
    }

    console.log('✅ User found:', user.email);
    console.log('✅ Password field exists:', !!user.password);
    console.log('✅ Password length:', user.password ? user.password.length : 'undefined');

    // Check if user is active
    if (!user.isActive) {
      return sendResponse(res, false, 'Account is deactivated. Please contact support.', null, 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, false, 'Invalid credentials', null, 401);
    }

    // Email verification is disabled for now - users can login immediately after registration

    // Update last login
    user.lastLoginDate = new Date();
    user.lastActive = new Date();
    user.ipAddress = req.ip;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;

    sendResponse(res, true, 'Login successful', {
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    sendResponse(res, false, 'Server error during login', null, 500);
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, 'Validation failed', { errors: errors.array() }, 400);
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return sendResponse(res, true, 'If an account with that email exists, a password reset link has been sent.');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordReset(email, resetToken, user.username);
      sendResponse(res, true, 'Password reset email sent successfully');
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      sendResponse(res, false, 'Failed to send password reset email. Please try again.', null, 500);
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    sendResponse(res, false, 'Server error while processing request', null, 500);
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, 'Validation failed', { errors: errors.array() }, 400);
    }

    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return sendResponse(res, false, 'Invalid or expired reset token', null, 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendResponse(res, true, 'Password reset successfully');

  } catch (error) {
    console.error('Reset password error:', error);
    sendResponse(res, false, 'Server error while resetting password', null, 500);
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password (authenticated user)
// @access  Private
router.post('/change-password', [
  require('../middleware/auth').auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, 'Validation failed', { errors: errors.array() }, 400);
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return sendResponse(res, false, 'Current password is incorrect', null, 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    sendResponse(res, true, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    sendResponse(res, false, 'Server error while changing password', null, 500);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('communities.community', 'name description category')
      .select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');

    if (!user) {
      return sendResponse(res, false, 'User not found', null, 404);
    }

    sendResponse(res, true, 'Profile retrieved successfully', { user });

  } catch (error) {
    console.error('Get profile error:', error);
    sendResponse(res, false, 'Server error while retrieving profile', null, 500);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', require('../middleware/auth').auth, async (req, res) => {
  try {
    // Update last active time
    await User.findByIdAndUpdate(req.user.id, {
      lastActive: new Date()
    });

    sendResponse(res, true, 'Logged out successfully');

  } catch (error) {
    console.error('Logout error:', error);
    sendResponse(res, false, 'Server error during logout', null, 500);
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh-token', require('../middleware/auth').auth, async (req, res) => {
  try {
    // Generate new token
    const newToken = generateToken(req.user.id);

    sendResponse(res, true, 'Token refreshed successfully', {
      token: newToken,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    sendResponse(res, false, 'Server error while refreshing token', null, 500);
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Private
router.post('/verify-email', [
  require('../middleware/auth').auth,
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, false, 'Validation failed', { errors: errors.array() }, 400);
    }

    const { otp } = req.body;

    // Check if user is already verified
    if (req.user.isEmailVerified) {
      return sendResponse(res, false, 'Email is already verified', null, 400);
    }

    // Verify OTP
    if (req.user.emailVerificationToken !== otp || req.user.emailVerificationExpires < new Date()) {
      return sendResponse(res, false, 'Invalid or expired OTP', null, 400);
    }

    // Mark email as verified
    req.user.isEmailVerified = true;
    req.user.emailVerificationToken = undefined;
    req.user.emailVerificationExpires = undefined;
    await req.user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(req.user.email, req.user.username, req.user.firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    sendResponse(res, true, 'Email verified successfully');

  } catch (error) {
    console.error('Verify email error:', error);
    sendResponse(res, false, 'Server error while verifying email', null, 500);
  }
});

// @route   POST /api/auth/fix-old-passwords
// @desc    Fix old users with double-hashed passwords (temporary route)
// @access  Public (temporary for development)
router.post('/fix-old-passwords', async (req, res) => {
  try {
    const { email, newPassword = 'Test123!' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`🔧 Fixing password for user: ${email}`);
    console.log(`🔧 Old password length: ${user.password.length}`);

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Password fixed for user: ${email}`);
    console.log(`✅ New password length: ${user.password.length}`);

    res.json({
      success: true,
      message: `Password fixed successfully for ${email}`,
      user: {
        email: user.email,
        username: user.username,
        role: user.role
      },
      note: `You can now login with password: ${newPassword}`
    });

  } catch (error) {
    console.error('Fix password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password fix'
    });
  }
});

// @route   GET /api/auth/status
// @desc    Check auth service status
// @access  Public
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
