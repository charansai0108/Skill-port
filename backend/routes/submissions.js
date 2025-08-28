const express = require('express');
const { body, validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const AutoValidationService = require('../services/autoValidationService');

const router = express.Router();

// @route   POST /api/submissions/extension
// @desc    Receive submission data from browser extension
// @access  Private (Extension with valid token)
router.post('/extension', [
  auth,
  body('platform').isIn(['leetcode', 'hackerrank', 'gfg', 'interviewbit', 'skillport']).withMessage('Invalid platform'),
  body('submissionId').notEmpty().withMessage('Submission ID is required'),
  body('slug').notEmpty().withMessage('Problem slug is required'),
  body('verdict').notEmpty().withMessage('Verdict is required'),
  body('timestamp').isISO8601().withMessage('Invalid timestamp format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      platform,
      submissionId,
      slug,
      verdict,
      code,
      timestamp,
      problemTitle,
      difficulty,
      language,
      executionTime,
      memoryUsed
    } = req.body;

    const userId = req.user.id;

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      user: userId,
      platformProblemId: submissionId,
      platform: platform
    });

    if (existingSubmission) {
      return res.json({
        success: true,
        message: 'Submission already recorded',
        data: { submission: existingSubmission }
      });
    }

    // Create new submission
    const submission = new Submission({
      user: userId,
      platform: platform,
      platformProblemId: submissionId,
      platformUsername: req.user.username,
      problemTitle: problemTitle || slug,
      problemUrl: `https://${platform}.com/problems/${slug}`,
      difficulty: difficulty || 'medium',
      language: language || 'unknown',
      code: code || '',
      codeLength: code ? code.length : 0,
      status: verdict === 'Accepted' ? 'accepted' : 'wrong_answer',
      submittedAt: new Date(timestamp),
      submissionTime: 0, // Will be calculated if needed
      executionTime: executionTime || 0,
      memoryUsed: memoryUsed || 0,
      score: verdict === 'Accepted' ? 100 : 0
    });

    await submission.save();

    // Update user stats if needed
    if (verdict === 'Accepted') {
      // You can add logic here to update user's solved problems count
      console.log(`User ${userId} solved problem ${slug} on ${platform}`);
      
      // Auto-validate assignments
      try {
        const validationResult = await AutoValidationService.validateAssignment(submissionData, userId);
        if (validationResult.validated) {
          console.log(`🎉 Auto-validation successful:`, validationResult.message);
          // You can add notification logic here
        }
      } catch (validationError) {
        console.error('Auto-validation error:', validationError);
        // Don't fail the submission if validation fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Submission recorded successfully',
      data: { submission }
    });

  } catch (error) {
    console.error('Extension submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording submission'
    });
  }
});

// @route   GET /api/submissions/user/:userId
// @desc    Get user's submissions with filtering
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { user: userId };
    if (req.query.platform) filter.platform = req.query.platform;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    // Get submissions with pagination
    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Submission.countDocuments(filter);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalSubmissions: total,
          submissionsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
});

// @route   GET /api/submissions/platform/:platform
// @desc    Get submissions by platform
// @access  Private
router.get('/platform/:platform', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get submissions by platform
    const submissions = await Submission.find({ platform })
      .populate('user', 'firstName lastName username')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Submission.countDocuments({ platform });

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalSubmissions: total,
          submissionsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get platform submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching platform submissions'
    });
  }
});

// @route   GET /api/submissions/stats/user/:userId
// @desc    Get user's submission statistics
// @access  Private
router.get('/stats/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get submission counts by platform
    const platformStats = await Submission.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    // Get submission counts by status
    const statusStats = await Submission.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get submission counts by difficulty
    const difficultyStats = await Submission.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    // Get total solved problems
    const totalSolved = await Submission.countDocuments({
      user: userId,
      status: 'accepted'
    });

    // Get total submissions
    const totalSubmissions = await Submission.countDocuments({
      user: userId
    });

    // Calculate success rate
    const successRate = totalSubmissions > 0 ? (totalSolved / totalSubmissions) * 100 : 0;

    const stats = {
      platform: platformStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      status: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      difficulty: difficultyStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      totalSolved,
      totalSubmissions,
      successRate: Math.round(successRate * 100) / 100
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get submission stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submission statistics'
    });
  }
});

module.exports = router;
