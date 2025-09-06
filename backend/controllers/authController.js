const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Community = require('../models/Community');
const { sendOTPEmail, sendMentorWelcomeEmail, sendStudentInvitationEmail } = require('../utils/mailer');
const logger = require('../config/logger');
const crypto = require('crypto');

// Token helpers
function createAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function createRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// @desc    Register user (Personal or Community Admin)
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, communityName, communityCode, communityDescription, experience, skills, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    let user;
    let community;

    if (role === 'community-admin') {
      // Check if community code already exists
      const existingCommunity = await Community.findOne({ code: communityCode.toUpperCase() });
      if (existingCommunity) {
        return res.status(400).json({ success: false, message: 'Community code already exists' });
      }

      // Create community first
      community = await Community.create({
        name: communityName,
        code: communityCode.toUpperCase(),
        description: communityDescription,
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
        isEmailVerified: false
      });

      // Update community with admin reference
      community.admin = user._id;
      await community.save();

    } else {
      // Create personal user
      user = await User.create({
        firstName,
        lastName,
        email,
        role: 'personal',
        experience,
        skills: skills || [],
        bio: bio || '',
        status: 'pending',
        isEmailVerified: false
      });
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, firstName);
            logger.info(`OTP sent to ${email} for user ${user._id}`);
        } catch (emailError) {
            logger.error('Email sending failed:', emailError);
            // Continue with registration even if email fails
        }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        community: role === 'community-admin' ? {
          id: community._id,
          name: community.name,
          code: community.code
        } : null
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Account is not active. Please verify your email first.' });
    }

    // Check if user is locked
    if (user.isLocked) {
      return res.status(400).json({ success: false, message: 'Account is temporarily locked. Please try again later.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = undefined;

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
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          community: user.community,
          status: user.status,
          avatar: user.avatar,
          extensionInstalled: user.extensionInstalled,
          requirePasswordChange: requirePasswordChange
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Activate user
    user.isEmailVerified = true;
    user.status = 'active';
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// @desc    Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User data retrieved successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          community: user.community,
          status: user.status,
          avatar: user.avatar,
          extensionInstalled: user.extensionInstalled,
          createdAt: user.createdAt,
          lastActivity: user.lastActivity
        }
      }
    });
    
  } catch (error) {
    logger.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user data'
    });
  }
};

// @desc    Refresh access token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalid or expired'
      });
    }

    // Generate new tokens
    const newAccessToken = createAccessToken(user._id);
    const newRefreshToken = createRefreshToken(user._id);

    // Set new cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return consistent format with full user data
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
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
      }
    });

  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token invalid or expired'
    });
  }
};

// @desc    Logout user
exports.logout = async (req, res, next) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Join community
// @route   POST /api/v1/auth/join-community
// @access  Public
exports.joinCommunity = async (req, res) => {
  try {
    const { email, password, communityId } = req.body;

    // Check if user exists and is a student in the community
    const user = await User.findOne({ 
      email, 
      role: 'student',
      community: communityId 
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email not found in this community' 
      });
    }

    // Set password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.isEmailVerified = true;
    user.status = 'active';
    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined community',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          community: user.community
        }
      }
    });
  } catch (error) {
    logger.error('Join community error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during community join' 
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    logger.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during OTP resend' 
    });
  }
};

// @desc    Handle extension submission
// @route   POST /api/v1/auth/extension/submission
// @access  Private
exports.extensionSubmission = async (req, res, next) => {
  try {
    const submissionData = req.body;
    const user = req.user;

    // Log the submission for debugging
    logger.info(`Extension submission from user ${user._id}:`, {
      platform: submissionData.platform,
      problemTitle: submissionData.problemTitle,
      status: submissionData.status
    });

    // Here you would typically save to database or process the submission
    // For now, just acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Submission received successfully',
      data: {
        submissionId: Date.now().toString(),
        timestamp: new Date().toISOString(),
        platform: submissionData.platform,
        status: 'received'
      }
    });
  } catch (error) {
    logger.error('Extension submission error:', error);
    res.status(500).json({ success: false, message: 'Server error during submission processing' });
  }
};

// @desc    Forgot password - send reset OTP
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create OTP record using the new Otp model
    const Otp = require('../models/Otp');
    await Otp.createOtp(email, otpCode, 15, 'password-reset');

    // Send OTP email
    await sendOTPEmail(email, otpCode, 'Password Reset');

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
      data: { email }
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset OTP'
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const Otp = require('../models/Otp');
    const isValidOtp = await Otp.verifyOtp(email, otp, 'password-reset');
    
    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
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

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: { email }
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};
