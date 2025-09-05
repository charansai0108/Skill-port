const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Contest = require('../models/Contest');
const Progress = require('../models/Progress');
const Community = require('../models/Community');

const router = express.Router();

// @desc    Get mentor's students
// @route   GET /api/v1/mentor/students
// @access  Private (Mentor)
router.get('/students', protect, authorize('mentor'), asyncHandler(async (req, res, next) => {
    const students = await User.find({ 
        role: 'student',
        community: req.user.community 
    }).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: students.length,
        data: students
    });
}));

// @desc    Get mentor's contests
// @route   GET /api/v1/mentor/contests
// @access  Private (Mentor)
router.get('/contests', protect, authorize('mentor'), asyncHandler(async (req, res, next) => {
    const contests = await Contest.find({ 
        createdBy: req.user.id 
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: contests.length,
        data: contests
    });
}));

// @desc    Get mentor analytics
// @route   GET /api/v1/mentor/analytics
// @access  Private (Mentor)
router.get('/analytics', protect, authorize('mentor'), asyncHandler(async (req, res, next) => {
    const totalStudents = await User.countDocuments({ 
        role: 'student',
        community: req.user.community 
    });
    
    const totalContests = await Contest.countDocuments({ 
        createdBy: req.user.id 
    });
    
    const activeContests = await Contest.countDocuments({ 
        createdBy: req.user.id,
        status: 'active'
    });

    res.status(200).json({
        success: true,
        data: {
            totalStudents,
            totalContests,
            activeContests
        }
    });
}));

// @desc    Get mentor activity
// @route   GET /api/v1/mentor/activity
// @access  Private (Mentor)
router.get('/activity', protect, authorize('mentor'), asyncHandler(async (req, res, next) => {
    const recentContests = await Contest.find({ 
        createdBy: req.user.id 
    }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
        success: true,
        data: recentContests
    });
}));

// @desc    Get mentor profile
// @route   GET /api/v1/mentor/profile
// @access  Private (Mentor)
router.get('/profile', protect, authorize('mentor'), asyncHandler(async (req, res, next) => {
    const mentor = await User.findById(req.user.id).select('-password');
    
    if (!mentor) {
        return next(new ErrorResponse('Mentor not found', 404));
    }

    res.status(200).json({
        success: true,
        data: mentor
    });
}));

// @desc    Update mentor profile
// @route   PUT /api/v1/mentor/profile
// @access  Private (Mentor)
router.put('/profile', protect, authorize('mentor'), [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('expertise').optional().isArray()
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse('Validation failed', 400));
    }

    const mentor = await User.findByIdAndUpdate(
        req.user.id,
        req.body,
        { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
        success: true,
        data: mentor
    });
}));

// @desc    Duplicate contest
// @route   POST /api/v1/mentor/contests/:contestId/duplicate
// @access  Private (Mentor)
router.post('/contests/:contestId/duplicate', protect, authorize('mentor'), asyncHandler(async (req, res, next) => {
    const originalContest = await Contest.findById(req.params.contestId);
    
    if (!originalContest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    if (originalContest.createdBy.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to duplicate this contest', 403));
    }

    const duplicatedContest = new Contest({
        ...originalContest.toObject(),
        _id: undefined,
        title: `${originalContest.title} (Copy)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    await duplicatedContest.save();

    res.status(201).json({
        success: true,
        data: duplicatedContest
    });
}));

module.exports = router;
