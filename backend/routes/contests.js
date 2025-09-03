const express = require('express');
const { body, validationResult, query } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { authorize, checkCommunityAccess } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const Contest = require('../models/Contest');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all contests
// @route   GET /api/v1/contests
// @access  Private
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('status').optional().isIn(['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('type').optional().isIn(['individual', 'team', 'practice']).withMessage('Invalid contest type')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = {};
    
    // Filter by community for non-personal users
    if (req.user.community) {
        query.community = req.user.community._id;
    }
    
    if (req.query.status) {
        query.status = req.query.status;
    }
    
    if (req.query.type) {
        query.type = req.query.type;
    }
    
    if (req.query.search) {
        query.$or = [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    const contests = await Contest.find(query)
        .populate('community', 'name code')
        .populate('createdBy', 'firstName lastName')
        .sort({ startTime: req.query.upcoming === 'true' ? 1 : -1 })
        .limit(limit)
        .skip(startIndex);

    const total = await Contest.countDocuments(query);

    // Pagination result
    const pagination = {};
    if (startIndex + limit < total) {
        pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
        success: true,
        count: contests.length,
        total,
        pagination,
        data: { contests }
    });
}));

// @desc    Get upcoming contests
// @route   GET /api/v1/contests/upcoming
// @access  Private
router.get('/upcoming', asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const communityId = req.user.community ? req.user.community._id : null;
    
    const contests = await Contest.getUpcomingContests(communityId, limit);

    res.status(200).json({
        success: true,
        count: contests.length,
        data: { contests }
    });
}));

// @desc    Get specific contest
// @route   GET /api/v1/contests/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id)
        .populate('community', 'name code')
        .populate('createdBy', 'firstName lastName')
        .populate('participants.user', 'firstName lastName avatar studentId')
        .populate('leaderboard.participant', 'firstName lastName avatar studentId');

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Check access permissions
    if (req.user.community && contest.community._id.toString() !== req.user.community._id.toString()) {
        return next(new ErrorResponse('Not authorized to access this contest', 403));
    }

    res.status(200).json({
        success: true,
        data: { contest }
    });
}));

// @desc    Create contest (Admin/Mentor only)
// @route   POST /api/v1/contests
// @access  Private (Admin/Mentor)
router.post('/', authorize('community-admin', 'mentor'), [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('startTime').isISO8601().withMessage('Invalid start time format'),
    body('endTime').isISO8601().withMessage('Invalid end time format'),
    body('registrationStart').isISO8601().withMessage('Invalid registration start format'),
    body('registrationEnd').isISO8601().withMessage('Invalid registration end format'),
    body('type').optional().isIn(['individual', 'team', 'practice']).withMessage('Invalid contest type'),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'mixed']).withMessage('Invalid difficulty'),
    body('maxParticipants').optional().isInt({ min: 1, max: 1000 }).withMessage('Max participants must be between 1 and 1000')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    // Add community and creator to contest data
    req.body.community = req.user.community._id;
    req.body.createdBy = req.user.id;

    const contest = await Contest.create(req.body);

    await contest.populate('community', 'name code');
    await contest.populate('createdBy', 'firstName lastName');

    res.status(201).json({
        success: true,
        message: 'Contest created successfully',
        data: { contest }
    });
}));

// @desc    Update contest (Admin/Creator only)
// @route   PUT /api/v1/contests/:id
// @access  Private (Admin/Creator)
router.put('/:id', authorize('community-admin', 'mentor'), [
    body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('startTime').optional().isISO8601().withMessage('Invalid start time format'),
    body('endTime').optional().isISO8601().withMessage('Invalid end time format'),
    body('registrationStart').optional().isISO8601().withMessage('Invalid registration start format'),
    body('registrationEnd').optional().isISO8601().withMessage('Invalid registration end format'),
    body('maxParticipants').optional().isInt({ min: 1, max: 1000 }).withMessage('Max participants must be between 1 and 1000'),
    body('status').optional().isIn(['draft', 'published', 'cancelled']).withMessage('Invalid status')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const contest = await Contest.findById(req.params.id);

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Check permissions
    const isAdmin = req.user.role === 'community-admin';
    const isCreator = contest.createdBy.toString() === req.user.id;
    
    if (!isAdmin && !isCreator) {
        return next(new ErrorResponse('Not authorized to update this contest', 403));
    }

    // Prevent updates during ongoing contest
    if (contest.phase === 'running' && req.body.problems) {
        return next(new ErrorResponse('Cannot modify problems during ongoing contest', 400));
    }

    const allowedFields = [
        'title', 'description', 'startTime', 'endTime', 'registrationStart', 
        'registrationEnd', 'maxParticipants', 'type', 'difficulty', 'category',
        'rules', 'problems', 'prizes', 'settings', 'status'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    const updatedContest = await Contest.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('community', 'name code').populate('createdBy', 'firstName lastName');

    res.status(200).json({
        success: true,
        message: 'Contest updated successfully',
        data: { contest: updatedContest }
    });
}));

// @desc    Register for contest
// @route   POST /api/v1/contests/:id/register
// @access  Private (Students only)
router.post('/:id/register', authorize('student'), [
    body('teamData').optional().isObject().withMessage('Team data must be an object')
], asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    try {
        const participant = contest.registerParticipant(req.user.id, req.body.teamData);
        await contest.save();

        res.status(200).json({
            success: true,
            message: 'Successfully registered for contest',
            data: { participant }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Submit solution
// @route   POST /api/v1/contests/:id/submit
// @access  Private (Students only)
router.post('/:id/submit', authorize('student'), [
    body('problemIndex').isInt({ min: 0 }).withMessage('Valid problem index is required'),
    body('language').notEmpty().withMessage('Programming language is required'),
    body('code').notEmpty().withMessage('Solution code is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { problemIndex, language, code } = req.body;
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    try {
        const submission = contest.submitSolution(req.user.id, problemIndex, language, code);
        
        // In a real implementation, you would queue this for execution
        // For now, we'll simulate random results
        const statuses = ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error'];
        submission.status = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (submission.status === 'accepted') {
            submission.score = contest.problems[problemIndex].points;
            submission.testCasesPassed = submission.totalTestCases = 10;
        }

        await contest.save();

        // Update leaderboard
        contest.updateLeaderboard();
        await contest.save();

        res.status(200).json({
            success: true,
            message: 'Solution submitted successfully',
            data: { 
                submission: {
                    id: submission._id,
                    status: submission.status,
                    score: submission.score,
                    submittedAt: submission.submittedAt
                }
            }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Get contest leaderboard
// @route   GET /api/v1/contests/:id/leaderboard
// @access  Private
router.get('/:id/leaderboard', asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id)
        .populate('leaderboard.participant', 'firstName lastName avatar studentId');

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Check if leaderboard should be frozen
    const now = new Date();
    const shouldFreeze = contest.settings.freezeLeaderboard && 
                        contest.settings.freezeTime &&
                        now > new Date(contest.endTime.getTime() - contest.settings.freezeTime * 60 * 1000);

    let leaderboard = contest.leaderboard;
    
    if (shouldFreeze && contest.phase === 'running') {
        // Show frozen leaderboard (hide recent submissions)
        leaderboard = leaderboard.map(entry => ({
            ...entry.toObject(),
            problemScores: entry.problemScores.map(ps => ({
                ...ps,
                // Hide submissions after freeze time
                ...(ps.solvedAt && ps.solvedAt > new Date(contest.endTime.getTime() - contest.settings.freezeTime * 60 * 1000) && {
                    score: 0,
                    attempts: 0,
                    solvedAt: null
                })
            }))
        }));
    }

    res.status(200).json({
        success: true,
        data: { 
            leaderboard,
            isFrozen: shouldFreeze && contest.phase === 'running',
            contestPhase: contest.phase
        }
    });
}));

// @desc    Get user's contest submissions
// @route   GET /api/v1/contests/:id/submissions
// @access  Private
router.get('/:id/submissions', asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Get user's submissions
    const userSubmissions = contest.submissions.filter(
        sub => sub.participant.toString() === req.user.id
    ).sort((a, b) => b.submittedAt - a.submittedAt);

    res.status(200).json({
        success: true,
        data: { 
            submissions: userSubmissions,
            total: userSubmissions.length
        }
    });
}));

// @desc    Add clarification
// @route   POST /api/v1/contests/:id/clarifications
// @access  Private (Students only)
router.post('/:id/clarifications', authorize('student'), [
    body('problemIndex').optional().isInt({ min: 0 }).withMessage('Invalid problem index'),
    body('question').trim().isLength({ min: 5, max: 500 }).withMessage('Question must be 5-500 characters')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { problemIndex, question } = req.body;
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    if (!contest.rules.allowClarifications) {
        return next(new ErrorResponse('Clarifications are not allowed for this contest', 400));
    }

    try {
        const clarification = contest.addClarification(req.user.id, problemIndex, question);
        await contest.save();

        res.status(201).json({
            success: true,
            message: 'Clarification submitted successfully',
            data: { clarification }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Answer clarification (Admin/Mentor only)
// @route   PUT /api/v1/contests/:id/clarifications/:clarificationId
// @access  Private (Admin/Mentor)
router.put('/:id/clarifications/:clarificationId', authorize('community-admin', 'mentor'), [
    body('answer').trim().isLength({ min: 1, max: 1000 }).withMessage('Answer must be 1-1000 characters'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { answer, isPublic } = req.body;
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    try {
        const clarification = contest.answerClarification(
            req.params.clarificationId, 
            answer, 
            req.user.id, 
            isPublic
        );
        await contest.save();

        res.status(200).json({
            success: true,
            message: 'Clarification answered successfully',
            data: { clarification }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Get contest clarifications
// @route   GET /api/v1/contests/:id/clarifications
// @access  Private
router.get('/:id/clarifications', asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id)
        .populate('clarifications.participant', 'firstName lastName')
        .populate('clarifications.answeredBy', 'firstName lastName');

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Filter clarifications based on user role
    let clarifications = contest.clarifications;
    
    if (req.user.role === 'student') {
        // Students can only see public clarifications and their own
        clarifications = clarifications.filter(c => 
            c.isPublic || c.participant._id.toString() === req.user.id
        );
    }

    res.status(200).json({
        success: true,
        data: { clarifications }
    });
}));

// @desc    Delete contest (Admin only)
// @route   DELETE /api/v1/contests/:id
// @access  Private (Admin)
router.delete('/:id', authorize('community-admin'), asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Check community access
    if (contest.community.toString() !== req.user.community._id.toString()) {
        return next(new ErrorResponse('Not authorized to delete this contest', 403));
    }

    // Prevent deletion of ongoing contests
    if (contest.phase === 'running') {
        return next(new ErrorResponse('Cannot delete ongoing contest', 400));
    }

    await contest.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Contest deleted successfully',
        data: {}
    });
}));

module.exports = router;