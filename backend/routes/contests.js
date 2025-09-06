const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const { protect: requireAuth } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const contestController = require('../controllers/contestController');

const router = express.Router();

// @desc    Get all contests
// @route   GET /api/v1/contests
// @access  Private
router.get('/', requireAuth, contestController.getContests);

// @desc    Get single contest by ID
// @route   GET /api/v1/contests/:id
// @access  Private
router.get('/:id', requireAuth, contestController.getContest);

// @desc    Create new contest
// @route   POST /api/v1/contests
// @access  Private (Community Admin only)
router.post('/', requireAuth, [
    body('name').trim().notEmpty().withMessage('Contest name is required'),
    body('community').notEmpty().withMessage('Community ID is required'),
    body('mentor').notEmpty().withMessage('Mentor ID is required'),
    body('batch').notEmpty().withMessage('Batch is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required'),
    body('problems').isArray({ min: 1 }).withMessage('At least one problem is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }
    await contestController.createContest(req, res, next);
}));

// @desc    Update contest details
// @route   PUT /api/v1/contests/:id
// @access  Private (Community Admin or assigned Mentor)
router.put('/:id', requireAuth, contestController.updateContest);

// @desc    Start a contest
// @route   POST /api/v1/contests/:id/start
// @access  Private (Community Admin or assigned Mentor)
router.post('/:id/start', requireAuth, contestController.startContest);

// @desc    Join a contest
// @route   POST /api/v1/contests/:id/join
// @access  Private (Student only)
router.post('/:id/join', requireAuth, contestController.joinContest);

// @desc    Submit solution to a contest problem
// @route   POST /api/v1/contests/:id/submit
// @access  Private (Student only)
router.post('/:id/submit', requireAuth, [
    body('problemId').notEmpty().withMessage('Problem ID is required'),
    body('code').notEmpty().withMessage('Code is required'),
    body('language').notEmpty().withMessage('Language is required')
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array().map(err => err.msg).join(', '), 400));
    }
    await contestController.submitSolution(req, res, next);
}));

// @desc    Get contest leaderboard
// @route   GET /api/v1/contests/:id/leaderboard
// @access  Private
router.get('/:id/leaderboard', requireAuth, contestController.getLeaderboard);

module.exports = router;