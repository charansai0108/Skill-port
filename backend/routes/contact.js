const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const contactController = require('../controllers/contactController');

const router = express.Router();

// @desc    Send contact message
// @route   POST /api/v1/contact
// @access  Public
router.post('/', [
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], asyncHandler(contactController.sendContactMessage));

module.exports = router;
