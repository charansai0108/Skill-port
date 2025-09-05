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

// @desc    Get available contests for student's batch
// @route   GET /api/v1/student/contests
// @access  Private (Student only)
router.get('/contests', protect, authorize('student'), asyncHandler(async (req, res, next) => {
    const contests = await Contest.find({
        community: req.user.community._id,
        batch: req.user.batch,
        status: { $in: ['published', 'active'] }
    }).populate('mentor', 'firstName lastName email');

    res.status(200).json({
        success: true,
        data: {
            contests
        }
    });
}));

// @desc    Join contest
// @route   POST /api/v1/student/contests/:contestId/join
// @access  Private (Student only)
router.post('/contests/:contestId/join', protect, authorize('student'), asyncHandler(async (req, res, next) => {
    const contest = await Contest.findOne({
        _id: req.params.contestId,
        community: req.user.community._id,
        batch: req.user.batch,
        status: { $in: ['published', 'active'] }
    });

    if (!contest) {
        return next(new ErrorResponse('Contest not found or not available for your batch', 404));
    }

    // Check if contest is still open for joining
    const now = new Date();
    if (now > contest.endDate) {
        return next(new ErrorResponse('Contest has ended', 400));
    }

    try {
        await contest.addParticipant(req.user._id);
        
        logger.info(`Student ${req.user.email} joined contest ${contest.title}`);

        res.status(200).json({
            success: true,
            message: 'Successfully joined contest',
            data: {
                contest: {
                    id: contest._id,
                    title: contest.title,
                    description: contest.description,
                    startDate: contest.startDate,
                    endDate: contest.endDate,
                    duration: contest.duration
                }
            }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Leave contest
// @route   DELETE /api/v1/student/contests/:contestId/leave
// @access  Private (Student only)
router.delete('/contests/:contestId/leave', protect, authorize('student'), asyncHandler(async (req, res, next) => {
    const contest = await Contest.findOne({
        _id: req.params.contestId,
        community: req.user.community._id,
        batch: req.user.batch
    });

    if (!contest) {
        return next(new ErrorResponse('Contest not found', 404));
    }

    try {
        await contest.removeParticipant(req.user._id);
        
        logger.info(`Student ${req.user.email} left contest ${contest.title}`);

        res.status(200).json({
            success: true,
            message: 'Successfully left contest'
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Get student's contest participation
// @route   GET /api/v1/student/participation
// @access  Private (Student only)
router.get('/participation', protect, authorize('student'), asyncHandler(async (req, res, next) => {
    const contests = await Contest.find({
        community: req.user.community._id,
        'participants.user': req.user._id
    }).populate('mentor', 'firstName lastName email');

    const participation = contests.map(contest => {
        const participant = contest.participants.find(p => p.user.toString() === req.user._id.toString());
        return {
            contest: {
                id: contest._id,
                title: contest.title,
                description: contest.description,
                mentor: contest.mentor,
                batch: contest.batch,
                startDate: contest.startDate,
                endDate: contest.endDate,
                duration: contest.duration,
                status: contest.status
            },
            participation: {
                joinedAt: participant.joinedAt,
                status: participant.status
            }
        };
    });

    res.status(200).json({
        success: true,
        data: {
            participation
        }
    });
}));

// @desc    Get community information
// @route   GET /api/v1/student/community
// @access  Private (Student only)
router.get('/community', protect, authorize('student'), asyncHandler(async (req, res, next) => {
    const community = await Community.findById(req.user.community._id)
        .populate('admin', 'firstName lastName email')
        .populate('mentors', 'firstName lastName email expertise yearsOfExperience');

    res.status(200).json({
        success: true,
        data: {
            community: {
                id: community._id,
                name: community.name,
                description: community.description,
                code: community.code,
                admin: community.admin,
                mentors: community.mentors,
                totalMembers: community.totalMembers,
                batches: community.batches
            }
        }
    });
}));

// @desc    Update student profile
// @route   PUT /api/v1/student/profile
// @access  Private (Student only)
router.put('/profile', protect, authorize('student'), [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const updateFields = ['firstName', 'lastName', 'bio'];
    updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
            req.user[field] = req.body[field];
        }
    });

    await req.user.save();

    logger.info(`Student profile updated: ${req.user.email}`);

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: {
                id: req.user._id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                bio: req.user.bio,
                batch: req.user.batch
            }
        }
    });
}));

module.exports = router;
