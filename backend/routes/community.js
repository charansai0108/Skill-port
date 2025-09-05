const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const Community = require('../models/Community');
const User = require('../models/User');
const Contest = require('../models/Contest');
const logger = require('../config/logger');

const router = express.Router();

// @desc    Get all communities (for personal users to browse)
// @route   GET /api/v1/communities
// @access  Public
router.get('/', asyncHandler(async (req, res, next) => {
    const communities = await Community.find({ isActive: true })
        .select('name code description totalMembers')
        .populate('admin', 'firstName lastName')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: communities.length,
        data: communities
    });
}));

// @desc    Get community by code
// @route   GET /api/v1/communities/:code
// @access  Public
router.get('/:code', asyncHandler(async (req, res, next) => {
    const community = await Community.findOne({ 
        code: req.params.code.toUpperCase(),
        isActive: true 
    })
    .populate('admin', 'firstName lastName email')
    .populate('mentors', 'firstName lastName email expertise')
    .populate('students', 'firstName lastName email batch studentId');

    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }

    res.status(200).json({
        success: true,
        data: community
    });
}));

// @desc    Get community details (for members)
// @route   GET /api/v1/communities/:id/details
// @access  Private
router.get('/:id/details', protect, asyncHandler(async (req, res, next) => {
    const community = await Community.findById(req.params.id)
        .populate('admin', 'firstName lastName email')
        .populate('mentors', 'firstName lastName email expertise yearsOfExperience')
        .populate('students', 'firstName lastName email batch studentId totalPoints level')
        .populate('contests', 'title description startDate endDate status participantCount');

    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }

    // Check if user has access to this community
    const user = await User.findById(req.user.id);
    if (!user.community || !user.community.equals(community._id)) {
        return next(new ErrorResponse('Access denied to this community', 403));
    }

    res.status(200).json({
        success: true,
        data: community
    });
}));

// @desc    Add mentor to community
// @route   POST /api/v1/communities/:id/mentors
// @access  Private (Admin only)
router.post('/:id/mentors', protect, authorize('community-admin'), [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)'),
    body('expertise').optional().isArray().withMessage('Expertise must be an array'),
    body('yearsOfExperience').optional().isInt({ min: 0 }).withMessage('Years of experience must be a positive number')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }

    // Check if user is admin of this community
    if (!community.admin.equals(req.user.id)) {
        return next(new ErrorResponse('Access denied. Only community admin can add mentors', 403));
    }

    const { firstName, lastName, email, password, expertise, yearsOfExperience } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorResponse('Email is already registered', 400));
    }

    // Create mentor user
    const mentor = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: 'mentor',
        community: community._id,
        expertise: expertise || [],
        yearsOfExperience: yearsOfExperience || 0,
        status: 'active',
        isEmailVerified: true,
        isTemporaryPassword: false
    });

    // Add mentor to community
    await community.addMentor(mentor._id);

    res.status(201).json({
        success: true,
        message: 'Mentor added successfully',
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

// @desc    Add student to community (pre-register)
// @route   POST /api/v1/communities/:id/students
// @access  Private (Admin only)
router.post('/:id/students', protect, authorize('community-admin'), [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('batch').notEmpty().withMessage('Batch is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }

    // Check if user is admin of this community
    if (!community.admin.equals(req.user.id)) {
        return next(new ErrorResponse('Access denied. Only community admin can add students', 403));
    }

    const { email, firstName, lastName, batch } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorResponse('Email is already registered', 400));
    }

    // Create student user (without password - they'll set it during join flow)
    const student = await User.create({
        firstName: firstName || 'Student',
        lastName: lastName || 'User',
        email,
        role: 'student',
        community: community._id,
        batch,
        status: 'pending',
        isEmailVerified: false,
        isTemporaryPassword: true
    });

    // Add student to community
    await community.addStudent(student._id);

    res.status(201).json({
        success: true,
        message: 'Student pre-registered successfully. They can now join using their email.',
        data: {
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                role: student.role,
                batch: student.batch,
                status: student.status
            }
        }
    });
}));

// @desc    Create batch
// @route   POST /api/v1/communities/:id/batches
// @access  Private (Admin only)
router.post('/:id/batches', protect, authorize('community-admin'), [
    body('name').trim().notEmpty().withMessage('Batch name is required'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }

    // Check if user is admin of this community
    if (!community.admin.equals(req.user.id)) {
        return next(new ErrorResponse('Access denied. Only community admin can create batches', 403));
    }

    const { name, description } = req.body;

    // Check if batch name already exists
    const existingBatch = community.batches.find(batch => batch.name === name);
    if (existingBatch) {
        return next(new ErrorResponse('Batch name already exists', 400));
    }

    // Create batch
    await community.createBatch({ name, description }, req.user.id);

    res.status(201).json({
        success: true,
        message: 'Batch created successfully',
        data: {
            batch: {
                name,
                description,
                createdBy: req.user.id
            }
        }
    });
}));

// @desc    Get community statistics
// @route   GET /api/v1/communities/:id/stats
// @access  Private
router.get('/:id/stats', protect, asyncHandler(async (req, res, next) => {
    const community = await Community.findById(req.params.id)
        .populate('mentors', 'firstName lastName')
        .populate('students', 'firstName lastName totalPoints level')
        .populate('contests', 'title status participantCount');

    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }

    // Check if user has access to this community
    const user = await User.findById(req.user.id);
    if (!user.community || !user.community.equals(community._id)) {
        return next(new ErrorResponse('Access denied to this community', 403));
    }

    const stats = {
        totalMembers: community.totalMembers,
        mentors: community.mentors.length,
        students: community.students.length,
        batches: community.batches.length,
        contests: community.contests.length,
        activeContests: community.contests.filter(c => c.status === 'active').length,
        totalPoints: community.students.reduce((sum, student) => sum + (student.totalPoints || 0), 0),
        averageLevel: community.students.length > 0 
            ? Math.round(community.students.reduce((sum, student) => sum + (student.level || 1), 0) / community.students.length)
            : 0
    };

    res.status(200).json({
        success: true,
        data: stats
    });
}));

module.exports = router;