const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Contest = require('../models/Contest');
const Progress = require('../models/Progress');
const Project = require('../models/Project');

const router = express.Router();

// @desc    Get user contests
// @route   GET /api/v1/user/contests
// @access  Private (Student)
router.get('/contests', protect, authorize('student'), asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { 
        community: req.user.community,
        status: { $in: ['active', 'completed'] }
    };
    
    if (status) {
        query.status = status;
    }

    const contests = await Contest.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Contest.countDocuments(query);

    res.status(200).json({
        success: true,
        count: contests.length,
        total,
        data: contests
    });
}));

// @desc    Register for contest
// @route   POST /api/v1/user/contests/:contestId/register
// @access  Private (Student)
router.post('/contests/:contestId/register', protect, authorize('student'), asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.contestId);
    
    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    if (contest.status !== 'active') {
        return next(new ErrorResponse('Contest is not active', 400));
    }

    // Check if user is already registered
    const existingRegistration = contest.participants.find(
        p => p.user.toString() === req.user.id
    );

    if (existingRegistration) {
        return next(new ErrorResponse('Already registered for this contest', 400));
    }

    contest.participants.push({
        user: req.user.id,
        registeredAt: new Date()
    });

    await contest.save();

    res.status(200).json({
        success: true,
        message: 'Successfully registered for contest'
    });
}));

// @desc    Get contest results
// @route   GET /api/v1/user/contests/:contestId/results
// @access  Private (Student)
router.get('/contests/:contestId/results', protect, authorize('student'), asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.contestId);
    
    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Check if user participated
    const participation = contest.participants.find(
        p => p.user.toString() === req.user.id
    );

    if (!participation) {
        return next(new ErrorResponse('Not registered for this contest', 403));
    }

    res.status(200).json({
        success: true,
        data: {
            contest: contest.title,
            participation,
            results: participation.results || []
        }
    });
}));

// @desc    Get user profile
// @route   GET /api/v1/user/profile
// @access  Private (Student, Personal)
router.get('/profile', protect, authorize('student', 'personal', 'community-admin'), asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
}));

// @desc    Update user profile
// @route   PUT /api/v1/user/profile
// @access  Private (Student, Personal)
router.put('/profile', protect, authorize('student', 'personal', 'community-admin'), [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('bio').optional().trim().isLength({ max: 500 })
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse('Validation failed', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        req.body,
        { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
        success: true,
        data: user
    });
}));

// @desc    Get user leaderboard
// @route   GET /api/v1/user/leaderboard
// @access  Private (Student, Personal)
router.get('/leaderboard', protect, authorize('student', 'personal', 'community-admin'), asyncHandler(async (req, res, next) => {
    const { limit = 10 } = req.query;
    
    const leaderboard = await User.find({ 
        role: 'student',
        community: req.user.community 
    })
    .select('firstName lastName totalScore')
    .sort({ totalScore: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
        success: true,
        data: leaderboard
    });
}));

// @desc    Export user data
// @route   GET /api/v1/user/export
// @access  Private (Student, Personal)
router.get('/export', protect, authorize('student', 'personal', 'community-admin'), asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');
    const progress = await Progress.find({ user: req.user.id });
    const projects = await Project.find({ user: req.user.id });

    const exportData = {
        user: user,
        progress: progress,
        projects: projects,
        exportedAt: new Date()
    };

    res.status(200).json({
        success: true,
        data: exportData
    });
}));

// @desc    Delete user account
// @route   DELETE /api/v1/user/account
// @access  Private (Student)
router.delete('/account', protect, authorize('student'), [
    body('password').notEmpty().withMessage('Password is required for account deletion')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse('Password is required', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Verify password
    const isMatch = await user.matchPassword(req.body.password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid password', 401));
    }

    // Delete user and related data
    await User.findByIdAndDelete(req.user.id);
    await Progress.deleteMany({ user: req.user.id });
    await Project.deleteMany({ user: req.user.id });

    res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
    });
}));

module.exports = router;
