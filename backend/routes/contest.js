const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const Contest = require('../models/Contest');
const Community = require('../models/Community');
const User = require('../models/User');
const logger = require('../config/logger');

const router = express.Router();

// @desc    Get all contests for a community
// @route   GET /api/v1/contests
// @access  Private
router.get('/', protect, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    if (!user.community) {
        return next(new ErrorResponse('User is not part of any community', 400));
    }

    const contests = await Contest.find({ community: user.community })
        .populate('createdBy', 'firstName lastName')
        .populate('assignedMentor', 'firstName lastName')
        .populate('participants.user', 'firstName lastName')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: contests.length,
        data: contests
    });
}));

// @desc    Get contest by ID
// @route   GET /api/v1/contests/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id)
        .populate('community', 'name code')
        .populate('createdBy', 'firstName lastName')
        .populate('assignedMentor', 'firstName lastName')
        .populate('participants.user', 'firstName lastName totalPoints level');

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Check if user has access to this contest
    const user = await User.findById(req.user.id);
    if (!user.community || !user.community.equals(contest.community._id)) {
        return next(new ErrorResponse('Access denied to this contest', 403));
    }

    res.status(200).json({
        success: true,
        data: contest
    });
}));

// @desc    Create contest
// @route   POST /api/v1/contests
// @access  Private (Admin only)
router.post('/', protect, authorize('community-admin'), [
    body('title').trim().notEmpty().withMessage('Contest title is required'),
    body('description').trim().notEmpty().withMessage('Contest description is required'),
    body('assignedMentor').isMongoId().withMessage('Valid mentor ID is required'),
    body('assignedBatch').notEmpty().withMessage('Assigned batch is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
    body('problems').isArray({ min: 1 }).withMessage('At least one problem is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const user = await User.findById(req.user.id);
    if (!user.community) {
        return next(new ErrorResponse('User is not part of any community', 400));
    }

    const { title, description, assignedMentor, assignedBatch, startDate, endDate, duration, problems } = req.body;

    // Verify mentor belongs to the same community
    const mentor = await User.findOne({ 
        _id: assignedMentor, 
        community: user.community, 
        role: 'mentor' 
    });
    
    if (!mentor) {
        return next(new ErrorResponse('Mentor not found or does not belong to this community', 400));
    }

    // Verify batch exists in community
    const community = await Community.findById(user.community);
    const batchExists = community.batches.some(batch => batch.name === assignedBatch);
    if (!batchExists) {
        return next(new ErrorResponse('Batch does not exist in this community', 400));
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
        return next(new ErrorResponse('End date must be after start date', 400));
    }

    // Create contest
    const contest = await Contest.create({
        title,
        description,
        community: user.community,
        createdBy: req.user.id,
        assignedMentor,
        assignedBatch,
        startDate: start,
        endDate: end,
        duration,
        problems,
        status: 'draft'
    });

    // Add contest to community
    await community.addContest(contest._id);

    res.status(201).json({
        success: true,
        message: 'Contest created successfully',
        data: contest
    });
}));

// @desc    Update contest
// @route   PUT /api/v1/contests/:id
// @access  Private (Admin/Mentor)
router.put('/:id', protect, asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Check permissions
    const user = await User.findById(req.user.id);
    const canManage = user.role === 'community-admin' || 
                     (user.role === 'mentor' && contest.assignedMentor.equals(user._id));

    if (!canManage) {
        return next(new ErrorResponse('Access denied. Only admin or assigned mentor can update contest', 403));
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'startDate', 'endDate', 'duration', 'problems', 'settings'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const updatedContest = await Contest.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Contest updated successfully',
        data: updatedContest
    });
}));

// @desc    Start contest
// @route   POST /api/v1/contests/:id/start
// @access  Private (Admin/Mentor)
router.post('/:id/start', protect, asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Check permissions
    const user = await User.findById(req.user.id);
    const canManage = user.role === 'community-admin' || 
                     (user.role === 'mentor' && contest.assignedMentor.equals(user._id));

    if (!canManage) {
        return next(new ErrorResponse('Access denied. Only admin or assigned mentor can start contest', 403));
    }

    if (contest.status !== 'draft' && contest.status !== 'scheduled') {
        return next(new ErrorResponse('Contest can only be started from draft or scheduled status', 400));
    }

    contest.status = 'active';
    await contest.save();

    res.status(200).json({
        success: true,
        message: 'Contest started successfully',
        data: contest
    });
}));

// @desc    Join contest
// @route   POST /api/v1/contests/:id/join
// @access  Private (Student)
router.post('/:id/join', protect, authorize('student'), asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    const user = await User.findById(req.user.id);
    
    // Check if user can participate
    if (!contest.canParticipate(user._id, user.role, user.batch)) {
        return next(new ErrorResponse('You cannot participate in this contest', 400));
    }

    // Add participant
    await contest.addParticipant(user._id);

    res.status(200).json({
        success: true,
        message: 'Successfully joined contest',
        data: {
            contest: {
                id: contest._id,
                title: contest.title,
                startDate: contest.startDate,
                endDate: contest.endDate,
                duration: contest.duration
            }
        }
    });
}));

// @desc    Submit solution
// @route   POST /api/v1/contests/:id/submit
// @access  Private (Student)
router.post('/:id/submit', protect, authorize('student'), [
    body('problemIndex').isInt({ min: 0 }).withMessage('Valid problem index is required'),
    body('solution').notEmpty().withMessage('Solution is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    if (!contest.isActive()) {
        return next(new ErrorResponse('Contest is not currently active', 400));
    }

    const user = await User.findById(req.user.id);
    const { problemIndex, solution } = req.body;

    // Check if problem exists
    if (problemIndex >= contest.problems.length) {
        return next(new ErrorResponse('Invalid problem index', 400));
    }

    // Check if user is participating
    const participant = contest.participants.find(p => p.user.equals(user._id));
    if (!participant) {
        return next(new ErrorResponse('You are not participating in this contest', 400));
    }

    // For now, just log the submission (in a real app, you'd run the solution)
    logger.info(`Contest submission: User ${user._id} submitted solution for problem ${problemIndex} in contest ${contest._id}`);
    
    // Update participant score (simplified - in real app, you'd evaluate the solution)
    const problem = contest.problems[problemIndex];
    const points = problem.points; // Simplified scoring
    
    await contest.updateParticipantScore(user._id, problemIndex, points);

    res.status(200).json({
        success: true,
        message: 'Solution submitted successfully',
        data: {
            problemIndex,
            points,
            totalScore: participant.score + points
        }
    });
}));

// @desc    Get contest leaderboard
// @route   GET /api/v1/contests/:id/leaderboard
// @access  Private
router.get('/:id/leaderboard', protect, asyncHandler(async (req, res, next) => {
    const contest = await Contest.findById(req.params.id)
        .populate('participants.user', 'firstName lastName totalPoints level');

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Check if user has access to this contest
    const user = await User.findById(req.user.id);
    if (!user.community || !user.community.equals(contest.community)) {
        return next(new ErrorResponse('Access denied to this contest', 403));
    }

    // Sort participants by score (descending)
    const leaderboard = contest.participants
        .sort((a, b) => b.score - a.score)
        .map((participant, index) => ({
            rank: index + 1,
            user: participant.user,
            score: participant.score,
            solvedProblems: participant.solvedProblems.length,
            joinedAt: participant.joinedAt
        }));

    res.status(200).json({
        success: true,
        data: {
            contest: {
                id: contest._id,
                title: contest.title,
                status: contest.status
            },
            leaderboard
        }
    });
}));

module.exports = router;
