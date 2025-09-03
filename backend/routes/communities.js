const express = require('express');
const { body, validationResult, query } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { authorize, checkCommunityAccess } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const Community = require('../models/Community');
const User = require('../models/User');
const Contest = require('../models/Contest');
const Project = require('../models/Project');

const router = express.Router();

// @desc    Get all communities (public)
// @route   GET /api/v1/communities
// @access  Public
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('search').optional().isString().withMessage('Search must be a string')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query for public communities
    const query = { 
        status: 'active',
        isPublic: true 
    };

    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { code: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    const communities = await Community.find(query)
        .populate('admin', 'firstName lastName')
        .select('-batches -contactInfo -socialLinks') // Hide private info
        .sort({ 'stats.totalStudents': -1 })
        .limit(limit)
        .skip(startIndex);

    const total = await Community.countDocuments(query);

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
        count: communities.length,
        total,
        pagination,
        data: { communities }
    });
}));

// @desc    Get specific community details
// @route   GET /api/v1/communities/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
    const community = await Community.findById(req.params.id)
        .populate('admin', 'firstName lastName avatar')
        .populate('activeStudentsCount')
        .populate('activeMentorsCount');

    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }

    // Only show public communities or if user has access
    if (!community.isPublic && (!req.user || req.user.community._id.toString() !== community._id.toString())) {
        return next(new ErrorResponse('Community not found', 404));
    }

    // Hide sensitive information for non-members
    const isMember = req.user && req.user.community && req.user.community._id.toString() === community._id.toString();
    
    const responseData = {
        id: community._id,
        name: community.name,
        code: community.code,
        description: community.description,
        logo: community.logo,
        banner: community.banner,
        primaryColor: community.primaryColor,
        secondaryColor: community.secondaryColor,
        admin: community.admin,
        status: community.status,
        isPublic: community.isPublic,
        features: community.features,
        stats: community.stats,
        createdAt: community.createdAt
    };

    if (isMember) {
        responseData.batches = community.batches;
        responseData.contactInfo = community.contactInfo;
        responseData.socialLinks = community.socialLinks;
        responseData.maxStudents = community.maxStudents;
        responseData.maxMentors = community.maxMentors;
    }

    res.status(200).json({
        success: true,
        data: { community: responseData }
    });
}));

// @desc    Update community details (Admin only)
// @route   PUT /api/v1/communities/:id
// @access  Private (Community Admin)
router.put('/:id', authorize('community-admin'), checkCommunityAccess, [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('primaryColor').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Primary color must be a valid hex color'),
    body('secondaryColor').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Secondary color must be a valid hex color'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
    body('allowSelfRegistration').optional().isBoolean().withMessage('allowSelfRegistration must be a boolean')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const allowedFields = [
        'name', 'description', 'primaryColor', 'secondaryColor', 
        'isPublic', 'allowSelfRegistration', 'contactInfo', 'socialLinks'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    const community = await Community.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('admin', 'firstName lastName');

    res.status(200).json({
        success: true,
        message: 'Community updated successfully',
        data: { community }
    });
}));

// @desc    Get community dashboard data (Admin only)
// @route   GET /api/v1/communities/:id/dashboard
// @access  Private (Community Admin)
router.get('/:id/dashboard', authorize('community-admin'), checkCommunityAccess, asyncHandler(async (req, res, next) => {
    const communityId = req.params.id;

    // Get community with populated data
    const community = await Community.findById(communityId)
        .populate('admin', 'firstName lastName avatar');

    // Get recent users (last 30 days)
    const recentUsers = await User.find({
        community: communityId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).select('firstName lastName role batch createdAt').sort({ createdAt: -1 }).limit(10);

    // Get contest statistics
    const contestStats = await Contest.getContestStats(communityId);

    // Get project statistics
    const projectStats = await Project.aggregate([
        { $match: { community: mongoose.Types.ObjectId(communityId) } },
        {
            $group: {
                _id: null,
                totalProjects: { $sum: 1 },
                completedProjects: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                inProgressProjects: {
                    $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                }
            }
        }
    ]);

    // Get batch statistics
    const batchStats = community.batches.map(batch => ({
        name: batch.name,
        code: batch.code,
        status: batch.status,
        studentCount: 0, // Will be populated by a separate query
        mentorCount: batch.mentors.length
    }));

    // Get student counts per batch
    const studentCounts = await User.aggregate([
        { $match: { community: mongoose.Types.ObjectId(communityId), role: 'student' } },
        { $group: { _id: '$batch', count: { $sum: 1 } } }
    ]);

    // Update batch stats with student counts
    batchStats.forEach(batch => {
        const studentData = studentCounts.find(sc => sc._id === batch.code);
        batch.studentCount = studentData ? studentData.count : 0;
    });

    // Get top performers (last 30 days)
    const topPerformers = await User.find({
        community: communityId,
        role: 'student',
        lastActivity: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).select('firstName lastName totalPoints streak avatar')
      .sort({ totalPoints: -1 })
      .limit(5);

    res.status(200).json({
        success: true,
        data: {
            community,
            stats: {
                users: {
                    total: community.stats.totalStudents + community.stats.totalMentors,
                    students: community.stats.totalStudents,
                    mentors: community.stats.totalMentors,
                    recent: recentUsers
                },
                contests: contestStats[0] || { totalContests: 0, activeContests: 0, totalParticipants: 0, totalSubmissions: 0 },
                projects: projectStats[0] || { totalProjects: 0, completedProjects: 0, inProgressProjects: 0 },
                batches: batchStats,
                topPerformers
            }
        }
    });
}));

// @desc    Add new batch (Admin only)
// @route   POST /api/v1/communities/:id/batches
// @access  Private (Community Admin)
router.post('/:id/batches', authorize('community-admin'), checkCommunityAccess, [
    body('name').trim().notEmpty().withMessage('Batch name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    body('maxStudents').optional().isInt({ min: 1, max: 100 }).withMessage('Max students must be between 1 and 100')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const community = await Community.findById(req.params.id);
    
    const batchData = {
        name: req.body.name,
        description: req.body.description || '',
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        maxStudents: req.body.maxStudents || 50
    };

    try {
        await community.addBatch(batchData);
        
        res.status(201).json({
            success: true,
            message: 'Batch created successfully',
            data: {
                batch: community.batches[community.batches.length - 1]
            }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Update batch (Admin only)
// @route   PUT /api/v1/communities/:id/batches/:batchId
// @access  Private (Community Admin)
router.put('/:id/batches/:batchId', authorize('community-admin'), checkCommunityAccess, [
    body('name').optional().trim().notEmpty().withMessage('Batch name cannot be empty'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('status').optional().isIn(['active', 'inactive', 'completed']).withMessage('Invalid batch status'),
    body('maxStudents').optional().isInt({ min: 1, max: 100 }).withMessage('Max students must be between 1 and 100')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const community = await Community.findById(req.params.id);
    const batch = community.batches.id(req.params.batchId);

    if (!batch) {
        return next(new ErrorResponse('Batch not found', 404));
    }

    // Update batch fields
    const allowedFields = ['name', 'description', 'status', 'maxStudents', 'startDate', 'endDate'];
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            batch[field] = req.body[field];
        }
    });

    await community.save();

    res.status(200).json({
        success: true,
        message: 'Batch updated successfully',
        data: { batch }
    });
}));

// @desc    Delete batch (Admin only)
// @route   DELETE /api/v1/communities/:id/batches/:batchId
// @access  Private (Community Admin)
router.delete('/:id/batches/:batchId', authorize('community-admin'), checkCommunityAccess, asyncHandler(async (req, res, next) => {
    const community = await Community.findById(req.params.id);
    const batch = community.batches.id(req.params.batchId);

    if (!batch) {
        return next(new ErrorResponse('Batch not found', 404));
    }

    // Check if batch has students
    const studentCount = await User.countDocuments({
        community: community._id,
        batch: batch.code,
        role: 'student'
    });

    if (studentCount > 0) {
        return next(new ErrorResponse('Cannot delete batch with existing students', 400));
    }

    batch.deleteOne();
    await community.save();

    res.status(200).json({
        success: true,
        message: 'Batch deleted successfully',
        data: {}
    });
}));

// @desc    Assign mentor to batch (Admin only)
// @route   POST /api/v1/communities/:id/batches/:batchId/mentors
// @access  Private (Community Admin)
router.post('/:id/batches/:batchId/mentors', authorize('community-admin'), checkCommunityAccess, [
    body('mentorId').isMongoId().withMessage('Valid mentor ID is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { mentorId } = req.body;
    
    // Verify mentor exists and belongs to this community
    const mentor = await User.findOne({
        _id: mentorId,
        role: 'mentor',
        community: req.params.id
    });

    if (!mentor) {
        return next(new ErrorResponse('Mentor not found in this community', 404));
    }

    const community = await Community.findById(req.params.id);
    const batch = community.batches.id(req.params.batchId);

    if (!batch) {
        return next(new ErrorResponse('Batch not found', 404));
    }

    // Check if mentor is already assigned
    if (batch.mentors.includes(mentorId)) {
        return next(new ErrorResponse('Mentor is already assigned to this batch', 400));
    }

    batch.mentors.push(mentorId);
    await community.save();

    res.status(200).json({
        success: true,
        message: 'Mentor assigned to batch successfully',
        data: {
            batch,
            mentor: {
                id: mentor._id,
                firstName: mentor.firstName,
                lastName: mentor.lastName,
                email: mentor.email
            }
        }
    });
}));

// @desc    Remove mentor from batch (Admin only)
// @route   DELETE /api/v1/communities/:id/batches/:batchId/mentors/:mentorId
// @access  Private (Community Admin)
router.delete('/:id/batches/:batchId/mentors/:mentorId', authorize('community-admin'), checkCommunityAccess, asyncHandler(async (req, res, next) => {
    const community = await Community.findById(req.params.id);
    const batch = community.batches.id(req.params.batchId);

    if (!batch) {
        return next(new ErrorResponse('Batch not found', 404));
    }

    const mentorIndex = batch.mentors.indexOf(req.params.mentorId);
    if (mentorIndex === -1) {
        return next(new ErrorResponse('Mentor not assigned to this batch', 404));
    }

    batch.mentors.splice(mentorIndex, 1);
    await community.save();

    res.status(200).json({
        success: true,
        message: 'Mentor removed from batch successfully',
        data: {}
    });
}));

// @desc    Get community analytics (Admin only)
// @route   GET /api/v1/communities/:id/analytics
// @access  Private (Community Admin)
router.get('/:id/analytics', authorize('community-admin'), checkCommunityAccess, asyncHandler(async (req, res, next) => {
    const communityId = req.params.id;
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

    // User growth analytics
    const userGrowth = await User.aggregate([
        {
            $match: {
                community: mongoose.Types.ObjectId(communityId),
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    role: '$role'
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);

    // Activity analytics
    const activityData = await User.aggregate([
        {
            $match: {
                community: mongoose.Types.ObjectId(communityId),
                lastActivity: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActivity' } },
                activeUsers: { $sum: 1 },
                totalPoints: { $sum: '$totalPoints' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Contest participation
    const contestParticipation = await Contest.aggregate([
        {
            $match: {
                community: mongoose.Types.ObjectId(communityId),
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                contestsCreated: { $sum: 1 },
                totalParticipants: { $sum: '$stats.totalParticipants' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Project creation
    const projectCreation = await Project.aggregate([
        {
            $match: {
                community: mongoose.Types.ObjectId(communityId),
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    status: '$status'
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            period,
            analytics: {
                userGrowth,
                activity: activityData,
                contests: contestParticipation,
                projects: projectCreation
            }
        }
    });
}));

// @desc    Join a community (Student joining flow)
// @route   POST /api/v1/communities/:id/join
// @access  Private
router.post('/:id/join', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('otp').optional().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { email, password, otp } = req.body;
    const community = await Community.findById(req.params.id).populate('batches');
    
    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }
    
    if (community.status !== 'active') {
        return next(new ErrorResponse('Community is not active', 400));
    }

    // Check if student email exists in any batch
    let existingStudent = null;
    let targetBatch = null;
    
    for (const batch of community.batches) {
        const studentInBatch = await User.findOne({
            email: email,
            batch: batch.name,
            community: community._id
        });
        
        if (studentInBatch) {
            existingStudent = studentInBatch;
            targetBatch = batch;
            break;
        }
    }

    if (existingStudent) {
        return res.status(200).json({
            success: true,
            message: 'Student already exists in the community',
            data: {
                communityId: community._id,
                communityName: community.name,
                batchName: targetBatch.name,
                studentId: existingStudent._id
            }
        });
    } else {
        // Create new student account if password provided
        if (!password) {
            return next(new ErrorResponse('Password is required for new students', 400));
        }

        // Find default batch or create one
        let defaultBatch = community.batches.find(b => b.name === 'Default Batch');
        if (!defaultBatch) {
            defaultBatch = {
                name: 'Default Batch',
                code: 'DEFAULT',
                description: 'Default batch for new students',
                status: 'active',
                maxStudents: 50
            };
            community.batches.push(defaultBatch);
            await community.save();
        }

        // Create new student account
        const newStudent = await User.create({
            firstName: 'New',
            lastName: 'Student',
            email: email,
            password: password,
            role: 'student',
            community: community._id,
            batch: defaultBatch.name,
            status: 'active',
            isEmailVerified: true
        });

        // Update community member count
        await Community.findByIdAndUpdate(community._id, {
            $inc: { 'stats.totalStudents': 1 }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully joined the community as new student',
            data: {
                communityId: community._id,
                communityName: community.name,
                batchName: defaultBatch.name,
                studentId: newStudent._id
            }
        });
    }
}));

module.exports = router;