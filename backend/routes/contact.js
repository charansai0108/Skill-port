const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const emailService = require('../services/emailService');

const router = express.Router();

// @desc    Handle contact form submission
// @route   POST /api/v1/contact
// @access  Public
router.post('/', [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { firstName, lastName, email, message } = req.body;

    try {
        // Send contact email to admin
        await emailService.sendContactEmail({
            firstName,
            lastName,
            email,
            message
        });

        res.status(200).json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you soon.'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        
        // Still return success to user even if email fails
        res.status(200).json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you soon.'
        });
    }
}));

module.exports = router;

