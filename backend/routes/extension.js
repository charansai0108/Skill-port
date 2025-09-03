const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/async');
const { authenticateExtension, protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Progress = require('../models/Progress');

const router = express.Router();

// @desc    Generate extension token (Personal users only)
// @route   POST /api/v1/extension/token
// @access  Private (Personal users)
router.post('/token', protect, authorize('personal'), asyncHandler(async (req, res, next) => {
    // Generate extension-specific token
    const extensionToken = jwt.sign(
        { 
            userId: req.user.id,
            type: 'extension',
            version: process.env.EXTENSION_VERSION || '1.0.0'
        },
        process.env.EXTENSION_SECRET,
        { expiresIn: '30d' }
    );

    // Update user's extension installation status
    await User.findByIdAndUpdate(req.user.id, {
        extensionInstalled: true,
        lastExtensionSync: new Date()
    });

    res.status(200).json({
        success: true,
        message: 'Extension token generated successfully',
        data: {
            token: extensionToken,
            userId: req.user.id,
            expiresIn: '30d'
        }
    });
}));

// @desc    Verify extension installation
// @route   POST /api/v1/extension/verify
// @access  Extension
router.post('/verify', authenticateExtension, asyncHandler(async (req, res, next) => {
    const { extensionVersion, browserInfo } = req.body;

    // Update user's extension info
    await User.findByIdAndUpdate(req.user.id, {
        extensionInstalled: true,
        lastExtensionSync: new Date(),
        // Could store additional extension metadata here
    });

    res.status(200).json({
        success: true,
        message: 'Extension verified successfully',
        data: {
            userId: req.user.id,
            userName: req.user.fullName,
            version: extensionVersion,
            lastSync: new Date()
        }
    });
}));

// @desc    Sync progress data from extension
// @route   POST /api/v1/extension/sync
// @access  Extension
router.post('/sync', authenticateExtension, [
    body('platform').isIn(['leetcode', 'hackerrank', 'codechef', 'codeforces']).withMessage('Invalid platform'),
    body('data').isObject().withMessage('Data must be an object'),
    body('timestamp').isISO8601().withMessage('Invalid timestamp format')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { platform, data, timestamp } = req.body;
    const userId = req.user.id;

    try {
        // Find or create progress entry for this platform
        let progress = await Progress.findOne({
            user: userId,
            type: 'extension',
            [`platformData.${platform}.username`]: data.username
        });

        if (!progress) {
            // Create new progress entry
            progress = new Progress({
                user: userId,
                type: 'extension',
                skillName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Progress`,
                category: 'algorithms',
                platformData: {}
            });
        }

        // Update platform-specific data
        const platformUpdate = {
            ...data,
            lastSync: new Date(timestamp)
        };

        progress.updatePlatformData(platform, platformUpdate);

        // Update general progress metrics
        const totalSolved = data.totalSolved || data.easySolved + data.mediumSolved + data.hardSolved || 0;
        const previousSolved = progress.solvedProblems || 0;
        const newProblems = Math.max(0, totalSolved - previousSolved);

        if (newProblems > 0) {
            progress.solvedProblems = totalSolved;
            progress.totalPoints += newProblems * 10; // 10 points per problem
            progress.weeklyPoints += newProblems * 10;
            progress.lastActivity = new Date();

            // Update streak
            progress.updateStreak();

            // Add weekly progress
            progress.addWeeklyProgress(newProblems, 0, newProblems * 10);

            // Add achievements for milestones
            if (totalSolved === 1) {
                progress.addAchievement('first_solve', 'First Problem Solved!', `Solved your first problem on ${platform}`, 50);
            } else if (totalSolved % 50 === 0) {
                progress.addAchievement('points_milestone', `${totalSolved} Problems Milestone`, `Solved ${totalSolved} problems on ${platform}`, 100);
            }
        }

        await progress.save();

        // Update user's total points and last extension sync
        const user = await User.findById(userId);
        user.totalPoints = await Progress.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: '$totalPoints' } } }
        ]).then(result => result[0]?.total || 0);
        
        user.lastExtensionSync = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Progress synced successfully',
            data: {
                platform,
                totalSolved,
                newProblems,
                totalPoints: progress.totalPoints,
                streak: progress.currentStreak,
                achievements: progress.achievements.slice(-3) // Last 3 achievements
            }
        });

    } catch (error) {
        console.error('Extension sync error:', error);
        return next(new ErrorResponse('Failed to sync progress data', 500));
    }
}));

// @desc    Get user's extension progress
// @route   GET /api/v1/extension/progress
// @access  Extension
router.get('/progress', authenticateExtension, asyncHandler(async (req, res, next) => {
    const progress = await Progress.find({
        user: req.user.id,
        type: 'extension'
    }).sort({ lastActivity: -1 });

    const overallProgress = await Progress.getUserOverallProgress(req.user.id);

    // Get platform summaries
    const platformSummaries = {};
    progress.forEach(p => {
        Object.keys(p.platformData || {}).forEach(platform => {
            const platformData = p.platformData[platform];
            if (platformData && platformData.lastSync) {
                platformSummaries[platform] = {
                    totalSolved: platformData.totalSolved || 0,
                    rating: platformData.rating || null,
                    rank: platformData.rank || null,
                    lastSync: platformData.lastSync
                };
            }
        });
    });

    res.status(200).json({
        success: true,
        data: {
            progress,
            overall: overallProgress,
            platforms: platformSummaries,
            user: {
                id: req.user.id,
                name: req.user.fullName,
                totalPoints: req.user.totalPoints,
                level: req.user.level,
                streak: req.user.streak
            }
        }
    });
}));

// @desc    Submit solution from extension
// @route   POST /api/v1/extension/solution
// @access  Extension
router.post('/solution', authenticateExtension, [
    body('platform').isIn(['leetcode', 'hackerrank', 'codechef', 'codeforces']).withMessage('Invalid platform'),
    body('problemTitle').notEmpty().withMessage('Problem title is required'),
    body('problemUrl').isURL().withMessage('Valid problem URL is required'),
    body('language').notEmpty().withMessage('Programming language is required'),
    body('code').notEmpty().withMessage('Solution code is required'),
    body('status').isIn(['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error']).withMessage('Invalid status'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('executionTime').optional().isNumeric().withMessage('Execution time must be a number'),
    body('memoryUsed').optional().isNumeric().withMessage('Memory used must be a number')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const {
        platform,
        problemTitle,
        problemUrl,
        language,
        code,
        status,
        difficulty,
        executionTime,
        memoryUsed,
        timestamp
    } = req.body;

    // Find or create progress entry
    let progress = await Progress.findOne({
        user: req.user.id,
        type: 'extension',
        skillName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Progress`
    });

    if (!progress) {
        progress = new Progress({
            user: req.user.id,
            type: 'extension',
            skillName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Progress`,
            category: 'algorithms'
        });
    }

    // Calculate points based on difficulty and status
    let points = 0;
    if (status === 'accepted') {
        switch (difficulty) {
            case 'easy': points = 10; break;
            case 'medium': points = 20; break;
            case 'hard': points = 30; break;
            default: points = 15; break;
        }
    }

    // Update progress
    if (status === 'accepted') {
        progress.solvedProblems += 1;
        progress.totalPoints += points;
        progress.weeklyPoints += points;
        progress.updateStreak();
        progress.addWeeklyProgress(1, 0, points);
    }

    progress.lastActivity = new Date();
    await progress.save();

    // Update user's total points
    const user = await User.findById(req.user.id);
    if (status === 'accepted') {
        user.totalPoints += points;
    }
    user.lastExtensionSync = new Date();
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Solution submitted successfully',
        data: {
            problemTitle,
            platform,
            status,
            points: status === 'accepted' ? points : 0,
            totalPoints: progress.totalPoints,
            streak: progress.currentStreak
        }
    });
}));

// @desc    Get extension settings
// @route   GET /api/v1/extension/settings
// @access  Extension
router.get('/settings', authenticateExtension, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('preferences');

    const extensionSettings = {
        autoSync: user.preferences?.notifications?.achievements || true,
        syncInterval: 300000, // 5 minutes in milliseconds
        enableNotifications: user.preferences?.notifications?.push || true,
        trackPlatforms: ['leetcode', 'hackerrank', 'codechef', 'codeforces'],
        pointsPerProblem: {
            easy: 10,
            medium: 20,
            hard: 30
        },
        syncOnSubmission: true,
        showProgressBadge: true
    };

    res.status(200).json({
        success: true,
        data: { settings: extensionSettings }
    });
}));

// @desc    Update extension settings
// @route   PUT /api/v1/extension/settings
// @access  Extension
router.put('/settings', authenticateExtension, [
    body('autoSync').optional().isBoolean().withMessage('autoSync must be a boolean'),
    body('enableNotifications').optional().isBoolean().withMessage('enableNotifications must be a boolean'),
    body('syncOnSubmission').optional().isBoolean().withMessage('syncOnSubmission must be a boolean'),
    body('showProgressBadge').optional().isBoolean().withMessage('showProgressBadge must be a boolean')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { autoSync, enableNotifications, syncOnSubmission, showProgressBadge } = req.body;

    // Update user preferences
    const user = await User.findById(req.user.id);
    
    if (!user.preferences) {
        user.preferences = { notifications: {} };
    }

    if (autoSync !== undefined) {
        user.preferences.notifications.achievements = autoSync;
    }
    
    if (enableNotifications !== undefined) {
        user.preferences.notifications.push = enableNotifications;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Extension settings updated successfully',
        data: {
            autoSync: user.preferences.notifications.achievements,
            enableNotifications: user.preferences.notifications.push,
            syncOnSubmission,
            showProgressBadge
        }
    });
}));

// @desc    Get extension statistics
// @route   GET /api/v1/extension/stats
// @access  Extension
router.get('/stats', authenticateExtension, asyncHandler(async (req, res, next) => {
    const { period = '30d' } = req.query;

    // Calculate date range
    let startDate;
    switch (period) {
        case '7d':
            startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get extension progress
    const progress = await Progress.find({
        user: req.user.id,
        type: 'extension',
        lastActivity: { $gte: startDate }
    });

    // Calculate statistics
    const stats = {
        totalProblems: progress.reduce((sum, p) => sum + (p.solvedProblems || 0), 0),
        totalPoints: progress.reduce((sum, p) => sum + (p.totalPoints || 0), 0),
        totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        currentStreak: req.user.streak || 0,
        platformBreakdown: {},
        dailyActivity: []
    };

    // Platform breakdown
    progress.forEach(p => {
        Object.keys(p.platformData || {}).forEach(platform => {
            const platformData = p.platformData[platform];
            if (platformData) {
                stats.platformBreakdown[platform] = {
                    totalSolved: platformData.totalSolved || 0,
                    rating: platformData.rating || null,
                    lastSync: platformData.lastSync
                };
            }
        });
    });

    // Daily activity (last 7 days)
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayProgress = progress.filter(p => {
            const activity = new Date(p.lastActivity);
            return activity >= date && activity < nextDate;
        });
        
        stats.dailyActivity.push({
            date: date.toISOString().split('T')[0],
            problemsSolved: dayProgress.reduce((sum, p) => sum + (p.solvedProblems || 0), 0),
            points: dayProgress.reduce((sum, p) => sum + (p.weeklyPoints || 0), 0)
        });
    }

    res.status(200).json({
        success: true,
        data: {
            period,
            stats
        }
    });
}));

module.exports = router;
