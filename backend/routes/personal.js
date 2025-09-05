const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Project = require('../models/Project');
const Analytics = require('../models/Analytics');

const router = express.Router();

// @desc    Get personal user profile
// @route   GET /api/v1/personal/profile
// @access  Private (Personal)
router.get('/profile', protect, authorize('personal'), asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
}));

// @desc    Update personal user profile
// @route   PUT /api/v1/personal/profile
// @access  Private (Personal)
router.put('/profile', protect, authorize('personal'), [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('skills').optional().isArray(),
    body('interests').optional().isArray()
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

// @desc    Get personal user progress
// @route   GET /api/v1/personal/progress
// @access  Private (Personal)
router.get('/progress', protect, authorize('personal'), asyncHandler(async (req, res, next) => {
    const progress = await Progress.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50);

    res.status(200).json({
        success: true,
        data: progress
    });
}));

// @desc    Get personal user projects
// @route   GET /api/v1/personal/projects
// @access  Private (Personal)
router.get('/projects', protect, authorize('personal'), asyncHandler(async (req, res, next) => {
    const projects = await Project.find({ user: req.user.id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: projects
    });
}));

// @desc    Create personal project
// @route   POST /api/v1/personal/projects
// @access  Private (Personal)
router.post('/projects', protect, authorize('personal'), [
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
    body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
    body('technologies').isArray().withMessage('Technologies must be an array'),
    body('githubUrl').optional().isURL().withMessage('GitHub URL must be valid'),
    body('liveUrl').optional().isURL().withMessage('Live URL must be valid')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse('Validation failed', 400));
    }

    const project = new Project({
        ...req.body,
        user: req.user.id
    });

    await project.save();

    res.status(201).json({
        success: true,
        data: project
    });
}));

// @desc    Update personal project
// @route   PUT /api/v1/personal/projects/:projectId
// @access  Private (Personal)
router.put('/projects/:projectId', protect, authorize('personal'), [
    body('title').optional().trim().isLength({ min: 3, max: 100 }),
    body('description').optional().trim().isLength({ min: 10, max: 500 }),
    body('technologies').optional().isArray(),
    body('githubUrl').optional().isURL(),
    body('liveUrl').optional().isURL()
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse('Validation failed', 400));
    }

    const project = await Project.findOneAndUpdate(
        { _id: req.params.projectId, user: req.user.id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    res.status(200).json({
        success: true,
        data: project
    });
}));

// @desc    Delete personal project
// @route   DELETE /api/v1/personal/projects/:projectId
// @access  Private (Personal)
router.delete('/projects/:projectId', protect, authorize('personal'), asyncHandler(async (req, res, next) => {
    const project = await Project.findOneAndDelete({
        _id: req.params.projectId,
        user: req.user.id
    });

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
    });
}));

// @desc    Get personal user analytics
// @route   GET /api/v1/personal/analytics
// @access  Private (Personal)
router.get('/analytics', protect, authorize('personal'), asyncHandler(async (req, res, next) => {
    let analytics = await Analytics.findOne({ user: req.user.id });
    
    if (!analytics) {
        // Create analytics if doesn't exist
        analytics = new Analytics({ user: req.user.id });
        await analytics.save();
    }

    res.status(200).json({
        success: true,
        data: analytics
    });
}));

// @desc    Get personal user stats
// @route   GET /api/v1/personal/stats
// @access  Private (Personal)
router.get('/stats', protect, authorize('personal'), asyncHandler(async (req, res, next) => {
    const analytics = await Analytics.findOne({ user: req.user.id });
    const projects = await Project.find({ user: req.user.id });
    const progress = await Progress.find({ user: req.user.id });

    const stats = {
        totalProjects: projects.length,
        totalProgress: progress.length,
        problemsSolved: analytics?.problemStats?.problemsSolved || 0,
        currentStreak: analytics?.streaks?.currentLoginStreak || 0,
        longestStreak: analytics?.streaks?.longestLoginStreak || 0,
        skills: analytics?.skillProgress || [],
        achievements: analytics?.achievements || []
    };

    res.status(200).json({
        success: true,
        data: stats
    });
}));

// @desc    Get personal user leaderboard
// @route   GET /api/v1/personal/leaderboard
// @access  Private (Personal)
router.get('/leaderboard', protect, authorize('personal'), asyncHandler(async (req, res, next) => {
    const { limit = 10 } = req.query;
    
    const leaderboard = await Analytics.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $unwind: '$userInfo'
        },
        {
            $project: {
                username: '$userInfo.username',
                firstName: '$userInfo.firstName',
                lastName: '$userInfo.lastName',
                profilePicture: '$userInfo.profilePicture',
                problemsSolved: '$problemStats.problemsSolved',
                contestsWon: '$contestStats.contestsWon',
                totalScore: '$contestStats.totalScore',
                longestStreak: '$streaks.longestLoginStreak'
            }
        },
        {
            $sort: { problemsSolved: -1, contestsWon: -1 }
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    res.status(200).json({
        success: true,
        data: leaderboard
    });
}));

// @desc    Export personal user data
// @route   GET /api/v1/personal/export
// @access  Private (Personal)
router.get('/export', protect, authorize('personal'), asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');
    const progress = await Progress.find({ user: req.user.id });
    const projects = await Project.find({ user: req.user.id });
    const analytics = await Analytics.findOne({ user: req.user.id });

    const exportData = {
        user: user,
        progress: progress,
        projects: projects,
        analytics: analytics,
        exportedAt: new Date()
    };

    res.status(200).json({
        success: true,
        data: exportData
    });
}));

module.exports = router;

