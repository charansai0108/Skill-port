const express = require('express');
const { body, validationResult, query } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { authorize, checkUserAccess } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const Project = require('../models/Project');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all projects
// @route   GET /api/v1/projects
// @access  Private
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
    query('status').optional().isIn(['planning', 'in-progress', 'completed', 'on-hold', 'cancelled']).withMessage('Invalid status'),
    query('owner').optional().isMongoId().withMessage('Invalid owner ID')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    const query = { 'settings.isPublic': true };
    
    // Filter by community for non-personal users
    if (req.user.community) {
        query.community = req.user.community._id;
    }
    
    // Apply filters
    if (req.query.category) {
        query.category = req.query.category;
    }
    
    if (req.query.difficulty) {
        query.difficulty = req.query.difficulty;
    }
    
    if (req.query.status) {
        query.status = req.query.status;
    }
    
    if (req.query.owner) {
        query.owner = req.query.owner;
        // If filtering by owner, show all projects regardless of public setting
        delete query['settings.isPublic'];
    }
    
    if (req.query.search) {
        query.$or = [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { tags: { $in: [new RegExp(req.query.search, 'i')] } }
        ];
    }

    // If user is requesting their own projects, show all
    if (req.query.mine === 'true') {
        query.owner = req.user.id;
        delete query['settings.isPublic'];
    }

    const projects = await Project.find(query)
        .populate('owner', 'firstName lastName avatar')
        .populate('community', 'name code')
        .populate('collaborators.user', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex);

    const total = await Project.countDocuments(query);

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
        count: projects.length,
        total,
        pagination,
        data: { projects }
    });
}));

// @desc    Get trending projects
// @route   GET /api/v1/projects/trending
// @access  Private
router.get('/trending', asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const days = parseInt(req.query.days, 10) || 7;
    const communityId = req.user.community ? req.user.community._id : null;
    
    const projects = await Project.getTrendingProjects(communityId, limit, days);

    res.status(200).json({
        success: true,
        count: projects.length,
        data: { projects }
    });
}));

// @desc    Get specific project
// @route   GET /api/v1/projects/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
        .populate('owner', 'firstName lastName avatar bio')
        .populate('community', 'name code')
        .populate('collaborators.user', 'firstName lastName avatar')
        .populate('reviews.reviewer', 'firstName lastName avatar');

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check if user can access this project
    const isOwner = project.owner._id.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(c => c.user._id.toString() === req.user.id);
    const isPublic = project.settings.isPublic;
    const isSameCommunity = req.user.community && 
                           project.community && 
                           project.community._id.toString() === req.user.community._id.toString();

    if (!isPublic && !isOwner && !isCollaborator && !isSameCommunity) {
        return next(new ErrorResponse('Not authorized to access this project', 403));
    }

    // Increment view count (but not for owner)
    if (!isOwner) {
        await project.incrementViews();
    }

    res.status(200).json({
        success: true,
        data: { project }
    });
}));

// @desc    Create project
// @route   POST /api/v1/projects
// @access  Private
router.post('/', [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('shortDescription').optional().isLength({ max: 300 }).withMessage('Short description cannot exceed 300 characters'),
    body('category').isIn(['web-development', 'mobile-development', 'desktop-application', 'machine-learning', 'data-science', 'game-development', 'cybersecurity', 'blockchain', 'iot', 'other']).withMessage('Invalid category'),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
    body('technologies').optional().isArray().withMessage('Technologies must be an array'),
    body('skillsRequired').optional().isArray().withMessage('Skills required must be an array'),
    body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number'),
    body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
    body('liveUrl').optional().isURL().withMessage('Invalid live URL'),
    body('tags').optional().isArray().withMessage('Tags must be an array')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    // Add owner and community to project data
    req.body.owner = req.user.id;
    if (req.user.community) {
        req.body.community = req.user.community._id;
    }

    const project = await Project.create(req.body);

    await project.populate('owner', 'firstName lastName avatar');
    if (project.community) {
        await project.populate('community', 'name code');
    }

    res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: { project }
    });
}));

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private (Owner/Collaborator)
router.put('/:id', [
    body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('shortDescription').optional().isLength({ max: 300 }).withMessage('Short description cannot exceed 300 characters'),
    body('category').optional().isIn(['web-development', 'mobile-development', 'desktop-application', 'machine-learning', 'data-science', 'game-development', 'cybersecurity', 'blockchain', 'iot', 'other']).withMessage('Invalid category'),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
    body('status').optional().isIn(['planning', 'in-progress', 'completed', 'on-hold', 'cancelled']).withMessage('Invalid status'),
    body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be a number'),
    body('actualHours').optional().isNumeric().withMessage('Actual hours must be a number'),
    body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
    body('liveUrl').optional().isURL().withMessage('Invalid live URL')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check permissions
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(c => c.user.toString() === req.user.id);
    const canEdit = isOwner || (collaborator && collaborator.permissions.canEdit);

    if (!canEdit) {
        return next(new ErrorResponse('Not authorized to update this project', 403));
    }

    const allowedFields = [
        'title', 'description', 'shortDescription', 'category', 'difficulty', 'status',
        'technologies', 'skillsRequired', 'estimatedHours', 'actualHours', 'startDate', 
        'endDate', 'githubUrl', 'liveUrl', 'documentationUrl', 'keyFeatures', 
        'milestones', 'learningOutcomes', 'tags', 'searchKeywords', 'settings'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName avatar')
     .populate('community', 'name code');

    res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: { project: updatedProject }
    });
}));

// @desc    Add collaborator to project
// @route   POST /api/v1/projects/:id/collaborators
// @access  Private (Owner/Manager)
router.post('/:id/collaborators', [
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('role').optional().isIn(['collaborator', 'contributor', 'reviewer']).withMessage('Invalid role'),
    body('permissions').optional().isObject().withMessage('Permissions must be an object')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { userId, role, permissions } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check permissions
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(c => c.user.toString() === req.user.id);
    const canInvite = isOwner || (collaborator && collaborator.permissions.canInvite);

    if (!canInvite) {
        return next(new ErrorResponse('Not authorized to add collaborators', 403));
    }

    // Verify user exists
    const user = await User.findById(userId).select('firstName lastName email');
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    try {
        const newCollaborator = project.addCollaborator(userId, role, permissions);
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Collaborator added successfully',
            data: { 
                collaborator: {
                    ...newCollaborator,
                    user: user
                }
            }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Update collaborator permissions
// @route   PUT /api/v1/projects/:id/collaborators/:userId
// @access  Private (Owner/Manager)
router.put('/:id/collaborators/:userId', [
    body('permissions').isObject().withMessage('Permissions must be an object'),
    body('role').optional().isIn(['collaborator', 'contributor', 'reviewer']).withMessage('Invalid role')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { permissions, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check permissions
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(c => c.user.toString() === req.user.id);
    const canManage = isOwner || (collaborator && collaborator.permissions.canManage);

    if (!canManage) {
        return next(new ErrorResponse('Not authorized to manage collaborators', 403));
    }

    try {
        const updatedCollaborator = project.updateCollaboratorPermissions(req.params.userId, permissions);
        if (role) {
            updatedCollaborator.role = role;
        }
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Collaborator permissions updated successfully',
            data: { collaborator: updatedCollaborator }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Remove collaborator from project
// @route   DELETE /api/v1/projects/:id/collaborators/:userId
// @access  Private (Owner/Manager)
router.delete('/:id/collaborators/:userId', asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check permissions
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(c => c.user.toString() === req.user.id);
    const canManage = isOwner || (collaborator && collaborator.permissions.canManage);
    const isRemovingSelf = req.params.userId === req.user.id;

    if (!canManage && !isRemovingSelf) {
        return next(new ErrorResponse('Not authorized to remove collaborators', 403));
    }

    try {
        project.removeCollaborator(req.params.userId);
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Collaborator removed successfully',
            data: {}
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Add/Update project review
// @route   POST /api/v1/projects/:id/reviews
// @access  Private
router.post('/:id/reviews', [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { rating, comment, isPublic } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check if reviews are allowed
    if (!project.settings.allowReviews) {
        return next(new ErrorResponse('Reviews are not allowed for this project', 400));
    }

    // Cannot review own project
    if (project.owner.toString() === req.user.id) {
        return next(new ErrorResponse('Cannot review your own project', 400));
    }

    try {
        const review = project.addReview(req.user.id, rating, comment, isPublic);
        await project.save();

        await project.populate('reviews.reviewer', 'firstName lastName avatar');

        res.status(200).json({
            success: true,
            message: 'Review added successfully',
            data: { review }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Complete feature
// @route   PUT /api/v1/projects/:id/features/:featureId/complete
// @access  Private (Owner/Collaborator)
router.put('/:id/features/:featureId/complete', asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check permissions
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(c => c.user.toString() === req.user.id);
    const canEdit = isOwner || (collaborator && collaborator.permissions.canEdit);

    if (!canEdit) {
        return next(new ErrorResponse('Not authorized to update this project', 403));
    }

    try {
        const feature = project.completeFeature(req.params.featureId);
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Feature marked as completed',
            data: { feature }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Complete milestone
// @route   PUT /api/v1/projects/:id/milestones/:milestoneId/complete
// @access  Private (Owner/Collaborator)
router.put('/:id/milestones/:milestoneId/complete', asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check permissions
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(c => c.user.toString() === req.user.id);
    const canEdit = isOwner || (collaborator && collaborator.permissions.canEdit);

    if (!canEdit) {
        return next(new ErrorResponse('Not authorized to update this project', 403));
    }

    try {
        const milestone = project.completeMilestone(req.params.milestoneId);
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Milestone marked as completed',
            data: { milestone }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
}));

// @desc    Get user's project statistics
// @route   GET /api/v1/projects/stats/:userId
// @access  Private
router.get('/stats/:userId', checkUserAccess, asyncHandler(async (req, res, next) => {
    const communityId = req.user.community ? req.user.community._id : null;
    const stats = await Project.getProjectStats(req.params.userId, communityId);

    res.status(200).json({
        success: true,
        data: { 
            stats: stats[0] || {
                totalProjects: 0,
                completedProjects: 0,
                inProgressProjects: 0,
                totalViews: 0,
                totalLikes: 0,
                averageRating: 0,
                totalHours: 0
            }
        }
    });
}));

// @desc    Search projects
// @route   GET /api/v1/projects/search
// @access  Private
router.get('/search', [
    query('q').notEmpty().withMessage('Search query is required'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty'),
    query('status').optional().isIn(['planning', 'in-progress', 'completed', 'on-hold', 'cancelled']).withMessage('Invalid status'),
    query('technologies').optional().isString().withMessage('Technologies must be a string'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { q, category, difficulty, status, technologies, limit } = req.query;
    
    const filters = {
        category,
        difficulty,
        status,
        technologies: technologies ? technologies.split(',') : undefined,
        limit: limit ? parseInt(limit, 10) : 20,
        communityId: req.user.community ? req.user.community._id : null
    };

    const projects = await Project.searchProjects(q, filters);

    res.status(200).json({
        success: true,
        count: projects.length,
        data: { projects }
    });
}));

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
// @access  Private (Owner only)
router.delete('/:id', asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Only owner can delete project
    if (project.owner.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to delete this project', 403));
    }

    await project.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
        data: {}
    });
}));

module.exports = router;
