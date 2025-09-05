const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Community = require('../models/Community');
const Contest = require('../models/Contest');
const logger = require('../config/logger');

const router = express.Router();

// @desc    Get assigned contests
// @route   GET /api/v1/mentor/contests
// @access  Private (Mentor only)
router.get('/contests', protect, authorize('mentor'), asyncHandler(async (req, res, next) => {
    const contests = await Contest.find({ 
        mentor: req.user._id,
        community: req.user.community._id
    }).populate('participants.user', 'firstName lastName email');

    res.status(200).json({
        success: true,
        data: {
            contests
        }
    });
}));

// @desc    Get students in assigned batches
// @route   GET /api/v1/mentor/students
// @access  Private (Mentor only)
router.get('/students', protect, authorize('mentor'), asyncHandler(async (req, res, next) => {
    const community = await Community.findById(req.user.community._id);
    
    // Get batches assigned to this mentor
    const mentorBatches = community.batches.filter(batch => 
        batch.mentor && batch.mentor.toString() === req.user._id.toString()
    );

    // Get students from assigned batches
    const students = await User.find({
        community: req.user.community._id,
        role: 'student',
        batch: { $in: mentorBatches.map(batch => batch.name) }
    }).select('-password -otpCode -otpExpire');

    res.status(200).json({
        success: true,
        data: {
            students,
            assignedBatches: mentorBatches
        }
    });
}));

// @desc    Update contest
// @route   PUT /api/v1/mentor/contests/:contestId
// @access  Private (Mentor only)
router.put('/contests/:contestId', protect, authorize('mentor'), [
    body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive number'),
    body('status').optional().isIn(['draft', 'published', 'active', 'completed', 'cancelled']).withMessage('Invalid status')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const contest = await Contest.findOne({
        _id: req.params.contestId,
        mentor: req.user._id,
        community: req.user.community._id
    });

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    // Update contest fields
    const updateFields = ['title', 'description', 'startDate', 'endDate', 'duration', 'status', 'rules', 'prizes'];
    updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
            if (field === 'startDate' || field === 'endDate') {
                contest[field] = new Date(req.body[field]);
            } else {
                contest[field] = req.body[field];
            }
        }
    });

    await contest.save();

    logger.info(`Contest updated by mentor ${req.user.email}: ${contest.title}`);

    res.status(200).json({
        success: true,
        message: 'Contest updated successfully',
        data: {
            contest
        }
    });
}));

// @desc    Add participant to contest
// @route   POST /api/v1/mentor/contests/:contestId/participants
// @access  Private (Mentor only)
router.post('/contests/:contestId/participants', protect, authorize('mentor'), [
    body('userId').notEmpty().withMessage('User ID is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const contest = await Contest.findOne({
        _id: req.params.contestId,
        mentor: req.user._id,
        community: req.user.community._id
    });

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    const { userId } = req.body;

    // Verify user is a student in the community
    const student = await User.findOne({
        _id: userId,
        community: req.user.community._id,
        role: 'student'
    });

    if (!student) {
        return next(new ErrorResponse('Student not found in this community', 404));
    }

    try {
        await contest.addParticipant(userId);
        
        logger.info(`Student ${student.email} added to contest ${contest.title} by mentor ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Participant added successfully',
            data: {
                participant: {
                    id: student._id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    email: student.email,
                    batch: student.batch
                }
            }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Remove participant from contest
// @route   DELETE /api/v1/mentor/contests/:contestId/participants/:userId
// @access  Private (Mentor only)
router.delete('/contests/:contestId/participants/:userId', protect, authorize('mentor'), asyncHandler(async (req, res, next) => {
    const contest = await Contest.findOne({
        _id: req.params.contestId,
        mentor: req.user._id,
        community: req.user.community._id
    });

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    try {
        await contest.removeParticipant(req.params.userId);
        
        logger.info(`Student ${req.params.userId} removed from contest ${contest.title} by mentor ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Participant removed successfully'
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Update participant status
// @route   PUT /api/v1/mentor/contests/:contestId/participants/:userId/status
// @access  Private (Mentor only)
router.put('/contests/:contestId/participants/:userId/status', protect, authorize('mentor'), [
    body('status').isIn(['active', 'completed', 'dropped']).withMessage('Invalid status')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const contest = await Contest.findOne({
        _id: req.params.contestId,
        mentor: req.user._id,
        community: req.user.community._id
    });

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    try {
        await contest.updateParticipantStatus(req.params.userId, req.body.status);
        
        logger.info(`Student ${req.params.userId} status updated to ${req.body.status} in contest ${contest.title} by mentor ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Participant status updated successfully'
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

module.exports = router;