const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const requireAuth = require('../middleware/authMiddleware');
const ErrorResponse = require('../utils/errorResponse');
const authController = require('../controllers/authController');

const router = express.Router();

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

    await authController.register(req, res, next);
}));

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    await authController.login(req, res, next);
}));

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
router.post('/verify-otp', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], asyncHandler(async (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    await authController.verifyOTP(req, res, next);
}));

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', requireAuth, authController.getMe);

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
router.post('/refresh', authController.refreshToken);

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
router.post('/logout', requireAuth, authController.logout);

module.exports = router;