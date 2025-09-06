const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect: requireAuth } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const adminController = require('../controllers/adminController');

const router = express.Router();

// @desc    Get admin analytics
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin only)
router.get('/analytics', requireAuth, asyncHandler(adminController.getAnalytics));

module.exports = router;
