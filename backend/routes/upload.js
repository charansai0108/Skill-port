const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar, uploadProjectFiles, uploadProjectImages, uploadCertificate, uploadBranding } = require('../middleware/upload');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Project = require('../models/Project');
const Community = require('../models/Community');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// @desc    Upload user avatar
// @route   POST /api/v1/upload/avatar
// @access  Private
router.post('/avatar', protect, uploadAvatar, asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Update user's avatar
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: req.file.url },
        { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
            avatar: req.file.url,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar
            }
        }
    });
}));

// @desc    Upload project files
// @route   POST /api/v1/upload/project/:projectId/files
// @access  Private
router.post('/project/:projectId/files', protect, uploadProjectFiles, asyncHandler(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new ErrorResponse('Please upload at least one file', 400));
    }

    const project = await Project.findById(req.params.projectId);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check permissions
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(c => c.user.toString() === req.user.id);
    const canEdit = isOwner || (collaborator && collaborator.permissions.canEdit);

    if (!canEdit) {
        return next(new ErrorResponse('Not authorized to upload files to this project', 403));
    }

    // Add files to project
    const uploadedFiles = req.files.map(file => ({
        name: file.originalname,
        url: file.url,
        size: file.size,
        type: file.mimetype,
        uploadedAt: new Date()
    }));

    project.files.push(...uploadedFiles);
    await project.save();

    res.status(200).json({
        success: true,
        message: `${req.files.length} file(s) uploaded successfully`,
        data: {
            files: uploadedFiles,
            totalFiles: project.files.length
        }
    });
}));

// @desc    Upload project images
// @route   POST /api/v1/upload/project/:projectId/images
// @access  Private
router.post('/project/:projectId/images', protect, uploadProjectImages, [
    body('captions').optional().isArray().withMessage('Captions must be an array'),
    body('primaryIndex').optional().isInt({ min: 0 }).withMessage('Primary index must be a non-negative integer')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    if (!req.files || req.files.length === 0) {
        return next(new ErrorResponse('Please upload at least one image', 400));
    }

    const { captions = [], primaryIndex = 0 } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
        return next(new ErrorResponse('Project not found', 404));
    }

    // Check permissions
    const isOwner = project.owner.toString() === req.user.id;
    const collaborator = project.collaborators.find(c => c.user.toString() === req.user.id);
    const canEdit = isOwner || (collaborator && collaborator.permissions.canEdit);

    if (!canEdit) {
        return next(new ErrorResponse('Not authorized to upload images to this project', 403));
    }

    // Reset primary flags
    project.images.forEach(img => img.isPrimary = false);

    // Add images to project
    const uploadedImages = req.files.map((file, index) => ({
        url: file.url,
        caption: captions[index] || '',
        isPrimary: index === parseInt(primaryIndex)
    }));

    project.images.push(...uploadedImages);
    await project.save();

    res.status(200).json({
        success: true,
        message: `${req.files.length} image(s) uploaded successfully`,
        data: {
            images: uploadedImages,
            totalImages: project.images.length
        }
    });
}));

// @desc    Upload certificate
// @route   POST /api/v1/upload/certificate
// @access  Private
router.post('/certificate', protect, uploadCertificate, [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Certificate title is required and must be less than 200 characters'),
    body('issuer').trim().isLength({ min: 1, max: 100 }).withMessage('Certificate issuer is required and must be less than 100 characters'),
    body('issuedDate').isISO8601().withMessage('Valid issued date is required'),
    body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid date'),
    body('credentialId').optional().trim().isLength({ max: 100 }).withMessage('Credential ID must be less than 100 characters'),
    body('credentialUrl').optional().isURL().withMessage('Credential URL must be valid')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    if (!req.file) {
        return next(new ErrorResponse('Please upload a certificate file', 400));
    }

    const { title, issuer, issuedDate, expiryDate, credentialId, credentialUrl } = req.body;

    // For now, we'll store certificate info in user's profile
    // In a full implementation, you might want a separate Certificate model
    const user = await User.findById(req.user.id);

    if (!user.certificates) {
        user.certificates = [];
    }

    const certificate = {
        title,
        issuer,
        issuedDate: new Date(issuedDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl,
        fileUrl: req.file.url,
        uploadedAt: new Date()
    };

    user.certificates.push(certificate);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Certificate uploaded successfully',
        data: { certificate }
    });
}));

// @desc    Upload community branding (logo/banner)
// @route   POST /api/v1/upload/community/:communityId/branding
// @access  Private (Community Admin only)
router.post('/community/:communityId/branding', protect, authorize('community-admin'), uploadBranding, asyncHandler(async (req, res, next) => {
    if (!req.files || (!req.files.logo && !req.files.banner)) {
        return next(new ErrorResponse('Please upload at least a logo or banner', 400));
    }

    const community = await Community.findById(req.params.communityId);

    if (!community) {
        return next(new ErrorResponse('Community not found', 404));
    }

    // Check if user is the admin of this community
    if (community.admin.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to upload branding for this community', 403));
    }

    const updateData = {};

    if (req.files.logo) {
        updateData.logo = req.files.logo[0].url;
    }

    if (req.files.banner) {
        updateData.banner = req.files.banner[0].url;
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
        req.params.communityId,
        updateData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Community branding uploaded successfully',
        data: {
            logo: updatedCommunity.logo,
            banner: updatedCommunity.banner,
            community: {
                id: updatedCommunity._id,
                name: updatedCommunity.name,
                code: updatedCommunity.code
            }
        }
    });
}));

// @desc    Delete uploaded file
// @route   DELETE /api/v1/upload/file
// @access  Private
router.delete('/file', protect, [
    body('fileUrl').notEmpty().withMessage('File URL is required'),
    body('type').isIn(['avatar', 'project', 'certificate', 'branding']).withMessage('Invalid file type')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { fileUrl, type } = req.body;

    // Extract filename from URL
    const filename = path.basename(fileUrl);
    const filePath = path.join(__dirname, '../uploads', filename);

    try {
        // Check if file exists
        await fs.access(filePath);

        // Delete the file
        await fs.unlink(filePath);

        // Update database based on file type
        switch (type) {
            case 'avatar':
                await User.findByIdAndUpdate(req.user.id, { avatar: null });
                break;
            
            case 'project':
                // Find and update project
                const project = await Project.findOne({
                    $or: [
                        { 'files.url': fileUrl },
                        { 'images.url': fileUrl }
                    ]
                });
                
                if (project) {
                    // Check permissions
                    const isOwner = project.owner.toString() === req.user.id;
                    const collaborator = project.collaborators.find(c => c.user.toString() === req.user.id);
                    const canEdit = isOwner || (collaborator && collaborator.permissions.canEdit);

                    if (!canEdit) {
                        return next(new ErrorResponse('Not authorized to delete files from this project', 403));
                    }

                    // Remove from files or images array
                    project.files = project.files.filter(f => f.url !== fileUrl);
                    project.images = project.images.filter(i => i.url !== fileUrl);
                    await project.save();
                }
                break;
            
            case 'certificate':
                await User.findByIdAndUpdate(req.user.id, {
                    $pull: { certificates: { fileUrl: fileUrl } }
                });
                break;
            
            case 'branding':
                // Find community and update
                const community = await Community.findOne({
                    $or: [{ logo: fileUrl }, { banner: fileUrl }],
                    admin: req.user.id
                });
                
                if (community) {
                    const updateData = {};
                    if (community.logo === fileUrl) updateData.logo = null;
                    if (community.banner === fileUrl) updateData.banner = null;
                    
                    await Community.findByIdAndUpdate(community._id, updateData);
                }
                break;
        }

        res.status(200).json({
            success: true,
            message: 'File deleted successfully',
            data: {}
        });

    } catch (error) {
        if (error.code === 'ENOENT') {
            return next(new ErrorResponse('File not found', 404));
        }
        return next(new ErrorResponse('Failed to delete file', 500));
    }
}));

// @desc    Get file info
// @route   GET /api/v1/upload/info
// @access  Private
router.get('/info', protect, [
    body('fileUrl').notEmpty().withMessage('File URL is required')
], asyncHandler(async (req, res, next) => {
    const { fileUrl } = req.query;

    if (!fileUrl) {
        return next(new ErrorResponse('File URL is required', 400));
    }

    const filename = path.basename(fileUrl);
    const filePath = path.join(__dirname, '../uploads', filename);

    try {
        const stats = await fs.stat(filePath);
        
        const fileInfo = {
            filename,
            size: stats.size,
            sizeInMB: Math.round((stats.size / 1024 / 1024) * 100) / 100,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile()
        };

        res.status(200).json({
            success: true,
            data: { fileInfo }
        });

    } catch (error) {
        if (error.code === 'ENOENT') {
            return next(new ErrorResponse('File not found', 404));
        }
        return next(new ErrorResponse('Failed to get file info', 500));
    }
}));

// @desc    Get upload limits and allowed types
// @route   GET /api/v1/upload/limits
// @access  Private
router.get('/limits', protect, asyncHandler(async (req, res, next) => {
    const limits = {
        avatar: {
            maxSize: '2MB',
            maxFiles: 1,
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        },
        projectFiles: {
            maxSize: '10MB',
            maxFiles: 10,
            allowedTypes: [
                'image/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/zip',
                'text/javascript',
                'text/html',
                'text/css'
            ],
            allowedExtensions: [
                '.jpg', '.jpeg', '.png', '.gif', '.webp',
                '.pdf', '.doc', '.docx', '.txt', '.zip',
                '.js', '.ts', '.py', '.java', '.cpp', '.c',
                '.cs', '.go', '.rs', '.php', '.rb', '.kt',
                '.swift', '.html', '.css', '.json', '.xml',
                '.sql', '.md'
            ]
        },
        certificates: {
            maxSize: '5MB',
            maxFiles: 1,
            allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
            allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png']
        },
        branding: {
            maxSize: '3MB',
            maxFiles: 2,
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        }
    };

    res.status(200).json({
        success: true,
        data: { limits }
    });
}));

module.exports = router;
