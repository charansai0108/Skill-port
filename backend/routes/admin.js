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

// @desc    Add mentor to community
// @route   POST /api/v1/admin/mentors
// @access  Private (Community Admin only)
router.post('/mentors', protect, authorize('community-admin'), [
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
        community: req.user.community._id,
        expertise: expertise || [],
        yearsOfExperience: yearsOfExperience || 0,
        status: 'active',
        isEmailVerified: true,
        isTemporaryPassword: false
    });

    // Add mentor to community
    await req.user.community.addMentor(mentor._id);

    logger.info(`Mentor added to community ${req.user.community.name}: ${mentor.email}`);

    res.status(201).json({
        success: true,
        message: 'Mentor added successfully',
        data: {
            mentor: {
                id: mentor._id,
                firstName: mentor.firstName,
                lastName: mentor.lastName,
                email: mentor.email,
                expertise: mentor.expertise,
                yearsOfExperience: mentor.yearsOfExperience
            }
        }
    });
}));

// @desc    Add student to community (pre-registration)
// @route   POST /api/v1/admin/students
// @access  Private (Community Admin only)
router.post('/students', protect, authorize('community-admin'), [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('batch').notEmpty().withMessage('Batch is required'),
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { email, batch, firstName, lastName } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorResponse('Email is already registered', 400));
    }

    // Create student user (pending verification)
    const student = await User.create({
        firstName: firstName || 'Student',
        lastName: lastName || 'User',
        email,
        role: 'student',
        community: req.user.community._id,
        batch: batch,
        status: 'pending',
        isEmailVerified: false,
        isTemporaryPassword: true
    });

    // Add student to community
    await req.user.community.addStudent(student._id);

    // Add student to batch if it exists
    const community = await Community.findById(req.user.community._id);
    const existingBatch = community.batches.find(b => b.name === batch);
    if (existingBatch) {
        await community.addStudentToBatch(student._id, batch);
    } else {
        // Create new batch
        await community.createBatch(batch, null);
        await community.addStudentToBatch(student._id, batch);
    }

    logger.info(`Student pre-registered in community ${req.user.community.name}: ${student.email}`);

    res.status(201).json({
        success: true,
        message: 'Student pre-registered successfully. They can now join using their email.',
        data: {
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                batch: student.batch
            }
        }
    });
}));

// @desc    Create contest
// @route   POST /api/v1/admin/contests
// @access  Private (Community Admin only)
router.post('/contests', protect, authorize('community-admin'), [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
    body('mentorId').notEmpty().withMessage('Mentor ID is required'),
    body('batch').notEmpty().withMessage('Batch is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').isISO8601().withMessage('End date must be a valid date'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive number')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { title, description, mentorId, batch, startDate, endDate, duration, maxParticipants, rules, prizes } = req.body;

    // Verify mentor exists and belongs to community
    const mentor = await User.findOne({ 
        _id: mentorId, 
        community: req.user.community._id, 
        role: 'mentor' 
    });
    if (!mentor) {
        return next(new ErrorResponse('Mentor not found in this community', 404));
    }

    // Create contest
    const contest = await Contest.create({
        title,
        description,
        community: req.user.community._id,
        mentor: mentorId,
        batch: batch,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration: parseInt(duration),
        maxParticipants: maxParticipants || 100,
        rules: rules || [],
        prizes: prizes || [],
        status: 'draft'
    });

    // Add contest to community
    const community = await Community.findById(req.user.community._id);
    community.contests.push(contest._id);
    await community.save();

    logger.info(`Contest created in community ${req.user.community.name}: ${contest.title}`);

    res.status(201).json({
        success: true,
        message: 'Contest created successfully',
        data: {
            contest: {
                id: contest._id,
                title: contest.title,
                description: contest.description,
                mentor: mentor.firstName + ' ' + mentor.lastName,
                batch: contest.batch,
                startDate: contest.startDate,
                endDate: contest.endDate,
                duration: contest.duration,
                status: contest.status
            }
        }
    });
}));

// @desc    Get community mentors
// @route   GET /api/v1/admin/mentors
// @access  Private (Community Admin only)
router.get('/mentors', protect, authorize('community-admin'), asyncHandler(async (req, res, next) => {
    const mentors = await User.find({ 
        community: req.user.community._id, 
        role: 'mentor' 
    }).select('-password -otpCode -otpExpire');

    res.status(200).json({
        success: true,
        data: {
            mentors
        }
    });
}));

// @desc    Get community students
// @route   GET /api/v1/admin/students
// @access  Private (Community Admin only)
router.get('/students', protect, authorize('community-admin'), asyncHandler(async (req, res, next) => {
    const students = await User.find({ 
        community: req.user.community._id, 
        role: 'student' 
    }).select('-password -otpCode -otpExpire');

    res.status(200).json({
        success: true,
        data: {
            students
        }
    });
}));

// @desc    Get community contests
// @route   GET /api/v1/admin/contests
// @access  Private (Community Admin only)
router.get('/contests', protect, authorize('community-admin'), asyncHandler(async (req, res, next) => {
    const contests = await Contest.find({ 
        community: req.user.community._id 
    }).populate('mentor', 'firstName lastName email');

    res.status(200).json({
        success: true,
        data: {
            contests
        }
    });
}));

// @desc    Get community batches
// @route   GET /api/v1/admin/batches
// @access  Private (Community Admin only)
router.get('/batches', protect, authorize('community-admin'), asyncHandler(async (req, res, next) => {
    const community = await Community.findById(req.user.community._id);
    
    res.status(200).json({
        success: true,
        data: {
            batches: community.batches
        }
    });
}));

module.exports = router;