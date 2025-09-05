const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const requireAuth = require('../middleware/authMiddleware');
const ErrorResponse = require('../utils/errorResponse');
const communityController = require('../controllers/communityController');

const router = express.Router();

// @desc    Get all communities
// @route   GET /api/v1/communities
// @access  Private
router.get('/', requireAuth, communityController.getAllCommunities);

// @desc    Get single community by ID or Code
// @route   GET /api/v1/communities/:identifier
// @access  Private
router.get('/:identifier', requireAuth, communityController.getCommunity);

// @desc    Update community details
// @route   PUT /api/v1/communities/:id
// @access  Private (Community Admin only)
router.put('/:id', requireAuth, communityController.updateCommunity);

// @desc    Add mentor to community
// @route   POST /api/v1/communities/:id/mentors
// @access  Private (Community Admin only)
router.post('/:id/mentors', requireAuth, [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
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
    await communityController.addMentor(req, res, next);
}));

// @desc    Add student to community
// @route   POST /api/v1/communities/:id/students
// @access  Private (Community Admin only)
router.post('/:id/students', requireAuth, [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('batch').trim().notEmpty().withMessage('Batch information is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }
    await communityController.addStudent(req, res, next);
}));

// @desc    Get community statistics
// @route   GET /api/v1/communities/:id/stats
// @access  Private (Community Admin, Mentor)
router.get('/:id/stats', requireAuth, communityController.getCommunityStats);

module.exports = router;