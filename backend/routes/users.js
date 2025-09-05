const express = require('express');
const { body, validationResult, query } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { authorize, checkUserAccess } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Community = require('../models/Community');
const Progress = require('../models/Progress');
const Submission = require('../models/Submission');
const emailService = require('../services/emailService');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .populate('community')
        .select('-password');

    res.status(200).json({
        success: true,
        data: { user }
    });
}));

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
router.put('/profile', [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    body('phoneNumber').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number format'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const allowedFields = ['firstName', 'lastName', 'bio', 'phoneNumber', 'dateOfBirth'];
    const updateData = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('community');

    res.status(200).json({
        success: true,
        data: { user }
    });
}));

// @desc    Update user preferences
// @route   PUT /api/v1/users/preferences
// @access  Private
router.put('/preferences', asyncHandler(async (req, res, next) => {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { preferences },
        { new: true, runValidators: true }
    ).populate('community');

    res.status(200).json({
        success: true,
        data: { user }
    });
}));

// @desc    Update user coding platforms
// @route   PUT /api/v1/users/platforms
// @access  Private
router.put('/platforms', [
    body('platforms.leetcode').optional().trim().isLength({ min: 1, max: 50 }).withMessage('LeetCode username must be 1-50 characters'),
    body('platforms.geeksforgeeks').optional().trim().isLength({ min: 1, max: 50 }).withMessage('GeeksforGeeks username must be 1-50 characters'),
    body('platforms.hackerrank').optional().trim().isLength({ min: 1, max: 50 }).withMessage('HackerRank username must be 1-50 characters'),
    body('platforms.interviewbit').optional().trim().isLength({ min: 1, max: 50 }).withMessage('InterviewBit username must be 1-50 characters'),
    body('platforms.github').optional().trim().isLength({ min: 1, max: 50 }).withMessage('GitHub username must be 1-50 characters')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { platforms } = req.body;

    // Validate username format (alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    
    for (const [platform, username] of Object.entries(platforms)) {
        if (username && !usernameRegex.test(username)) {
            return next(new ErrorResponse(`Invalid ${platform} username format. Use only letters, numbers, underscore, and hyphen.`, 400));
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { platforms },
        { new: true, runValidators: true }
    ).populate('community');

    res.status(200).json({
        success: true,
        message: 'Coding platforms updated successfully',
        data: { user }
    });
}));

// @desc    Get user dashboard data
// @route   GET /api/v1/users/dashboard
// @access  Private
router.get('/dashboard', asyncHandler(async (req, res, next) => {
    const user = req.user;
    
    // Get user's overall progress
    const overallProgress = await Progress.getUserOverallProgress(user.id);
    
    // Get recent progress (last 30 days)
    const recentProgress = await Progress.find({
        user: user.id,
        lastActivity: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ lastActivity: -1 }).limit(10);
    
    // Get user's rank in community (if applicable)
    let communityRank = null;
    if (user.community) {
        const leaderboard = await Progress.getLeaderboard(user.community._id, 100);
        const userRankData = leaderboard.find(entry => entry._id.toString() === user.id.toString());
        communityRank = userRankData ? leaderboard.indexOf(userRankData) + 1 : null;
    }
    
    // Get current streak
    const currentStreak = user.streak || 0;
    
    // Get weekly goals progress
    const thisWeek = new Date();
    const weekStart = new Date(thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()));
    const weeklyProgress = await Progress.find({
        user: user.id,
        lastActivity: { $gte: weekStart }
    });
    
    const weeklyStats = {
        problemsSolved: weeklyProgress.reduce((sum, p) => sum + (p.solvedProblems || 0), 0),
        timeSpent: weeklyProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        pointsEarned: weeklyProgress.reduce((sum, p) => sum + (p.weeklyPoints || 0), 0)
    };

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                level: user.level,
                totalPoints: user.totalPoints,
                streak: currentStreak,
                community: user.community
            },
            progress: {
                overall: overallProgress,
                recent: recentProgress,
                weekly: weeklyStats,
                rank: communityRank
            }
        }
    });
}));

// @desc    Get all users (Admin/Mentor only)
// @route   GET /api/v1/users
// @access  Private (Admin/Mentor)
router.get('/', authorize('community-admin', 'mentor'), [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['student', 'mentor']).withMessage('Invalid role filter'),
    query('batch').optional().isString().withMessage('Batch must be a string'),
    query('status').optional().isIn(['active', 'inactive', 'suspended', 'pending']).withMessage('Invalid status filter')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = { community: req.user.community._id };
    
    if (req.query.role) {
        query.role = req.query.role;
    }
    
    if (req.query.batch) {
        query.batch = req.query.batch;
    }
    
    if (req.query.status) {
        query.status = req.query.status;
    }
    
    if (req.query.search) {
        query.$or = [
            { firstName: { $regex: req.query.search, $options: 'i' } },
            { lastName: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Execute query
    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex)
        .populate('community', 'name code');

    const total = await User.countDocuments(query);

    // Pagination result
    const pagination = {};

    if (startIndex + limit < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: users.length,
        total,
        pagination,
        data: { users }
    });
}));

// @desc    Get specific user
// @route   GET /api/v1/users/:id
// @access  Private
router.get('/:id', checkUserAccess, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate('community');

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: { user }
    });
}));

// @desc    Create mentor (Admin only)
// @route   POST /api/v1/users/mentors
// @access  Private (Admin)
router.post('/mentors', authorize('community-admin'), [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('expertise').optional().isArray().withMessage('Expertise must be an array'),
    body('yearsOfExperience').optional().isInt({ min: 0 }).withMessage('Years of experience must be a positive integer')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { firstName, lastName, email, expertise, yearsOfExperience } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorResponse('Email is already registered', 400));
    }

    // Check community mentor limit
    const community = await Community.findById(req.user.community._id);
    if (!community.canAddMentor()) {
        return next(new ErrorResponse('Maximum number of mentors reached for this community', 400));
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create mentor
    const mentor = await User.create({
        firstName,
        lastName,
        email,
        password: tempPassword,
        role: 'mentor',
        community: req.user.community._id,
        expertise: expertise || [],
        yearsOfExperience: yearsOfExperience || 0,
        status: 'active',
        isEmailVerified: true,
        isTemporaryPassword: true
    });

    // Update community stats
    await community.updateStats();

    // Send invitation email
    try {
        const loginUrl = `${process.env.FRONTEND_URL}/community-ui/pages/auth/login.html`;
        await emailService.sendMentorInvitationEmail(
            mentor.email,
            tempPassword,
            community.name,
            loginUrl,
            mentor.firstName
        );
    } catch (emailError) {
        console.error('Mentor invitation email failed:', emailError);
    }

    res.status(201).json({
        success: true,
        message: 'Mentor created successfully. Invitation email sent.',
        data: {
            mentor: {
                id: mentor._id,
                firstName: mentor.firstName,
                lastName: mentor.lastName,
                email: mentor.email,
                role: mentor.role,
                expertise: mentor.expertise,
                yearsOfExperience: mentor.yearsOfExperience
            }
        }
    });
}));

// @desc    Add students to batch (Admin only)
// @route   POST /api/v1/users/students/batch
// @access  Private (Admin)
router.post('/students/batch', authorize('community-admin'), [
    body('emails').isArray({ min: 1 }).withMessage('Emails array is required'),
    body('emails.*').isEmail().withMessage('All emails must be valid'),
    body('batchCode').notEmpty().withMessage('Batch code is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { emails, batchCode } = req.body;
    const community = await Community.findById(req.user.community._id);
    
    // Check if batch exists
    const batch = community.getBatchByCode(batchCode);
    if (!batch) {
        return next(new ErrorResponse('Batch not found', 404));
    }

    const results = {
        success: [],
        failed: [],
        existing: []
    };

    for (const email of emails) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                results.existing.push({ email, reason: 'Email already registered' });
                continue;
            }

            // Check community student limit
            if (!community.canAddStudent()) {
                results.failed.push({ email, reason: 'Community student limit reached' });
                continue;
            }

            // Create student with pending status (they need to complete registration)
            const student = await User.create({
                firstName: 'Student', // Will be updated during registration
                lastName: 'User',
                email,
                role: 'student',
                community: community._id,
                batch: batchCode,
                status: 'pending',
                isEmailVerified: false
            });

            results.success.push({
                email,
                studentId: student.studentId,
                batch: batchCode
            });

        } catch (error) {
            results.failed.push({ email, reason: error.message });
        }
    }

    // Update community stats
    await community.updateStats();

    res.status(200).json({
        success: true,
        message: `Processed ${emails.length} emails`,
        data: {
            results,
            summary: {
                total: emails.length,
                successful: results.success.length,
                failed: results.failed.length,
                existing: results.existing.length
            }
        }
    });
}));

// @desc    Get user progress
// @route   GET /api/v1/users/:id/progress
// @access  Private
router.get('/:id/progress', checkUserAccess, asyncHandler(async (req, res, next) => {
    const progress = await Progress.find({ user: req.params.id })
        .sort({ lastActivity: -1 });

    const overallProgress = await Progress.getUserOverallProgress(req.params.id);

    res.status(200).json({
        success: true,
        data: {
            progress,
            overall: overallProgress
        }
    });
}));

// @desc    Update user status (Admin only)
// @route   PUT /api/v1/users/:id/status
// @access  Private (Admin)
router.put('/:id/status', authorize('community-admin'), [
    body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Check if user belongs to the same community
    if (user.community.toString() !== req.user.community._id.toString()) {
        return next(new ErrorResponse('Not authorized to update this user', 403));
    }

    user.status = status;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User status updated to ${status}`,
        data: { user }
    });
}));

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin)
router.delete('/:id', authorize('community-admin'), asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Check if user belongs to the same community
    if (user.community.toString() !== req.user.community._id.toString()) {
        return next(new ErrorResponse('Not authorized to delete this user', 403));
    }

    // Cannot delete community admin
    if (user.role === 'community-admin') {
        return next(new ErrorResponse('Cannot delete community admin', 400));
    }

    // Delete user's progress data
    await Progress.deleteMany({ user: user._id });

    // Remove user
    await user.deleteOne();

    // Update community stats
    const community = await Community.findById(req.user.community._id);
    await community.updateStats();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: {}
    });
}));

// @desc    Get community leaderboard
// @route   GET /api/v1/users/leaderboard
// @access  Private
router.get('/leaderboard/community', asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const leaderboard = await Progress.getLeaderboard(
        req.user.community ? req.user.community._id : null,
        limit
    );

    res.status(200).json({
        success: true,
        data: { leaderboard }
    });
}));

// @desc    Update extension installation status
// @route   PUT /api/v1/users/extension/install
// @access  Private (Personal users only)
router.put('/extension/install', authorize('personal'), asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user.id,
        {
            extensionInstalled: true,
            lastExtensionSync: new Date()
        },
        { new: true }
    );

    res.status(200).json({
        success: true,
        message: 'Extension installation status updated',
        data: {
            extensionInstalled: user.extensionInstalled,
            lastExtensionSync: user.lastExtensionSync
        }
    });
}));

// @desc    Get user submissions
// @route   GET /api/v1/users/submissions
// @access  Private (User)
router.get('/submissions', asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, status, platform } = req.query;
    
    let query = { user: req.user.id };
    
    if (status) {
        query.status = status;
    }
    
    if (platform) {
        query.platform = platform;
    }

    const submissions = await Submission.find(query)
        .populate('contest', 'name')
        .populate('problem', 'title difficulty')
        .sort({ submittedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Submission.countDocuments(query);

    res.status(200).json({
        success: true,
        count: submissions.length,
        total,
        data: submissions
    });
}));

// @desc    Get user communities
// @route   GET /api/v1/users/communities
// @access  Private (User)
router.get('/communities', asyncHandler(async (req, res, next) => {
    const communities = await Community.find({
        'members.user': req.user.id,
        'members.isActive': true
    }).select('name description memberCount postCount');

    res.status(200).json({
        success: true,
        count: communities.length,
        data: communities
    });
}));

module.exports = router;