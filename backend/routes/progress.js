const express = require('express');
const { body, validationResult, query } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { authorize, checkUserAccess } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const Progress = require('../models/Progress');
const User = require('../models/User');

const router = express.Router();

// @desc    Get user's progress
// @route   GET /api/v1/progress
// @access  Private
router.get('/', [
    query('type').optional().isIn(['skill', 'course', 'project', 'contest', 'extension']).withMessage('Invalid progress type'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('status').optional().isIn(['active', 'paused', 'completed']).withMessage('Invalid status')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    // Build query
    const query = { user: req.user.id };
    
    if (req.query.type) {
        query.type = req.query.type;
    }
    
    if (req.query.category) {
        query.category = req.query.category;
    }
    
    if (req.query.status) {
        query.status = req.query.status;
    }

    const progress = await Progress.find(query)
        .sort({ lastActivity: -1 });

    // Get overall progress summary
    const overallProgress = await Progress.getUserOverallProgress(req.user.id);

    res.status(200).json({
        success: true,
        count: progress.length,
        data: { 
            progress,
            overall: overallProgress
        }
    });
}));

// @desc    Get specific user's progress (Admin/Mentor only)
// @route   GET /api/v1/progress/user/:userId
// @access  Private (Admin/Mentor)
router.get('/user/:userId', authorize('community-admin', 'mentor'), checkUserAccess, asyncHandler(async (req, res, next) => {
    const progress = await Progress.find({ user: req.params.userId })
        .sort({ lastActivity: -1 });

    const overallProgress = await Progress.getUserOverallProgress(req.params.userId);

    res.status(200).json({
        success: true,
        count: progress.length,
        data: { 
            progress,
            overall: overallProgress
        }
    });
}));

// @desc    Create or update progress
// @route   POST /api/v1/progress
// @access  Private
router.post('/', [
    body('type').isIn(['skill', 'course', 'project', 'contest', 'extension']).withMessage('Invalid progress type'),
    body('skillName').if(body('type').isIn(['skill', 'course'])).notEmpty().withMessage('Skill name is required for skill/course progress'),
    body('category').if(body('type').isIn(['skill', 'course'])).isIn(['algorithms', 'web-development', 'mobile-development', 'data-structures', 'database', 'machine-learning', 'cybersecurity', 'devops', 'other']).withMessage('Invalid category'),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid difficulty'),
    body('totalProblems').optional().isInt({ min: 0 }).withMessage('Total problems must be a non-negative integer'),
    body('solvedProblems').optional().isInt({ min: 0 }).withMessage('Solved problems must be a non-negative integer')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { type, skillName, category, difficulty, totalProblems, solvedProblems } = req.body;

    // Check if progress already exists
    let progress = await Progress.findOne({
        user: req.user.id,
        type,
        ...(skillName && { skillName })
    });

    if (progress) {
        // Update existing progress
        if (totalProblems !== undefined) progress.totalProblems = totalProblems;
        if (solvedProblems !== undefined) progress.solvedProblems = solvedProblems;
        if (difficulty !== undefined) progress.difficulty = difficulty;
        
        progress.lastActivity = new Date();
        await progress.save();
    } else {
        // Create new progress
        const progressData = {
            user: req.user.id,
            type,
            skillName,
            category,
            difficulty: difficulty || 'beginner',
            totalProblems: totalProblems || 0,
            solvedProblems: solvedProblems || 0
        };

        // Add community for community users
        if (req.user.community && ['student', 'mentor'].includes(req.user.role)) {
            progressData.community = req.user.community._id;
        }

        progress = await Progress.create(progressData);
    }

    res.status(200).json({
        success: true,
        message: progress.isNew ? 'Progress created successfully' : 'Progress updated successfully',
        data: { progress }
    });
}));

// @desc    Update progress
// @route   PUT /api/v1/progress/:id
// @access  Private
router.put('/:id', [
    body('totalProblems').optional().isInt({ min: 0 }).withMessage('Total problems must be a non-negative integer'),
    body('solvedProblems').optional().isInt({ min: 0 }).withMessage('Solved problems must be a non-negative integer'),
    body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a non-negative integer'),
    body('status').optional().isIn(['active', 'paused', 'completed']).withMessage('Invalid status'),
    body('goals').optional().isObject().withMessage('Goals must be an object')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const progress = await Progress.findById(req.params.id);

    if (!progress) {
        return next(new ErrorResponse('Progress not found', 404));
    }

    // Check if user owns this progress
    if (progress.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this progress', 403));
    }

    const allowedFields = ['totalProblems', 'solvedProblems', 'timeSpent', 'status', 'goals', 'tags'];
    const updateData = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    // Update last activity
    updateData.lastActivity = new Date();

    const updatedProgress = await Progress.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: { progress: updatedProgress }
    });
}));

// @desc    Add weekly progress
// @route   POST /api/v1/progress/:id/weekly
// @access  Private
router.post('/:id/weekly', [
    body('problemsSolved').isInt({ min: 0 }).withMessage('Problems solved must be a non-negative integer'),
    body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a non-negative integer'),
    body('points').optional().isInt({ min: 0 }).withMessage('Points must be a non-negative integer')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { problemsSolved, timeSpent = 0, points = 0 } = req.body;
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
        return next(new ErrorResponse('Progress not found', 404));
    }

    // Check if user owns this progress
    if (progress.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this progress', 403));
    }

    // Add weekly progress
    const weeklyEntry = progress.addWeeklyProgress(problemsSolved, timeSpent, points);
    
    // Update overall progress
    progress.solvedProblems += problemsSolved;
    progress.totalPoints += points;
    progress.weeklyPoints += points;
    progress.timeSpent += timeSpent;
    progress.lastActivity = new Date();
    
    // Update streak
    progress.updateStreak();

    await progress.save();

    res.status(200).json({
        success: true,
        message: 'Weekly progress added successfully',
        data: { 
            weeklyEntry,
            totalProgress: {
                solvedProblems: progress.solvedProblems,
                totalPoints: progress.totalPoints,
                streak: progress.currentStreak
            }
        }
    });
}));

// @desc    Add achievement
// @route   POST /api/v1/progress/:id/achievements
// @access  Private
router.post('/:id/achievements', [
    body('type').isIn(['first_solve', 'streak_milestone', 'points_milestone', 'skill_completion', 'contest_win', 'project_completion']).withMessage('Invalid achievement type'),
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('points').optional().isInt({ min: 0 }).withMessage('Points must be a non-negative integer')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { type, title, description, points = 0 } = req.body;
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
        return next(new ErrorResponse('Progress not found', 404));
    }

    // Check if user owns this progress
    if (progress.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this progress', 403));
    }

    // Add achievement
    const achievement = progress.addAchievement(type, title, description, points);
    await progress.save();

    // Update user's total points
    const user = await User.findById(req.user.id);
    user.totalPoints += points;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Achievement added successfully',
        data: { achievement }
    });
}));

// @desc    Get leaderboard
// @route   GET /api/v1/progress/leaderboard
// @access  Private
router.get('/leaderboard', [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('community').optional().isBoolean().withMessage('Community filter must be a boolean')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const limit = parseInt(req.query.limit, 10) || 10;
    const communityOnly = req.query.community === 'true';
    
    const communityId = (communityOnly && req.user.community) ? req.user.community._id : null;
    
    const leaderboard = await Progress.getLeaderboard(communityId, limit);

    res.status(200).json({
        success: true,
        count: leaderboard.length,
        data: { leaderboard }
    });
}));

// @desc    Get progress analytics
// @route   GET /api/v1/progress/analytics
// @access  Private
router.get('/analytics', [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
    query('type').optional().isIn(['skill', 'course', 'project', 'contest', 'extension']).withMessage('Invalid progress type')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { period = '30d', type } = req.query;

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
        case '1y':
            startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build query
    const query = {
        user: req.user.id,
        lastActivity: { $gte: startDate }
    };

    if (type) {
        query.type = type;
    }

    // Get progress data
    const progressData = await Progress.find(query);

    // Calculate analytics
    const analytics = {
        totalProgress: progressData.length,
        totalProblems: progressData.reduce((sum, p) => sum + (p.solvedProblems || 0), 0),
        totalPoints: progressData.reduce((sum, p) => sum + (p.totalPoints || 0), 0),
        totalTimeSpent: progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        averageProgress: progressData.length > 0 
            ? progressData.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / progressData.length 
            : 0,
        categoryBreakdown: {},
        difficultyBreakdown: {},
        weeklyTrends: [],
        achievements: progressData.reduce((sum, p) => sum + p.achievements.length, 0)
    };

    // Category breakdown
    progressData.forEach(p => {
        if (p.category) {
            analytics.categoryBreakdown[p.category] = (analytics.categoryBreakdown[p.category] || 0) + 1;
        }
    });

    // Difficulty breakdown
    progressData.forEach(p => {
        if (p.difficulty) {
            analytics.difficultyBreakdown[p.difficulty] = (analytics.difficultyBreakdown[p.difficulty] || 0) + 1;
        }
    });

    // Weekly trends (last 4 weeks)
    for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekProgress = progressData.filter(p => {
            const activity = new Date(p.lastActivity);
            return activity >= weekStart && activity < weekEnd;
        });
        
        analytics.weeklyTrends.push({
            week: weekStart.toISOString().split('T')[0],
            problemsSolved: weekProgress.reduce((sum, p) => sum + (p.solvedProblems || 0), 0),
            points: weekProgress.reduce((sum, p) => sum + (p.weeklyPoints || 0), 0),
            timeSpent: weekProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
        });
    }

    res.status(200).json({
        success: true,
        data: {
            period,
            analytics
        }
    });
}));

// @desc    Update goals
// @route   PUT /api/v1/progress/:id/goals
// @access  Private
router.put('/:id/goals', [
    body('dailyTarget').optional().isInt({ min: 1, max: 50 }).withMessage('Daily target must be between 1 and 50'),
    body('weeklyTarget').optional().isInt({ min: 1, max: 200 }).withMessage('Weekly target must be between 1 and 200'),
    body('monthlyTarget').optional().isInt({ min: 1, max: 1000 }).withMessage('Monthly target must be between 1 and 1000'),
    body('customGoals').optional().isArray().withMessage('Custom goals must be an array')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const progress = await Progress.findById(req.params.id);

    if (!progress) {
        return next(new ErrorResponse('Progress not found', 404));
    }

    // Check if user owns this progress
    if (progress.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this progress', 403));
    }

    const { dailyTarget, weeklyTarget, monthlyTarget, customGoals } = req.body;

    // Update goals
    if (dailyTarget !== undefined) progress.goals.dailyTarget = dailyTarget;
    if (weeklyTarget !== undefined) progress.goals.weeklyTarget = weeklyTarget;
    if (monthlyTarget !== undefined) progress.goals.monthlyTarget = monthlyTarget;
    if (customGoals !== undefined) progress.goals.customGoals = customGoals;

    await progress.save();

    res.status(200).json({
        success: true,
        message: 'Goals updated successfully',
        data: { goals: progress.goals }
    });
}));

// @desc    Delete progress
// @route   DELETE /api/v1/progress/:id
// @access  Private
router.delete('/:id', asyncHandler(async (req, res, next) => {
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
        return next(new ErrorResponse('Progress not found', 404));
    }

    // Check if user owns this progress
    if (progress.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to delete this progress', 403));
    }

    await progress.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Progress deleted successfully',
        data: {}
    });
}));

module.exports = router;
