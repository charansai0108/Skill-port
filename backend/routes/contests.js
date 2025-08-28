const express = require('express');
const { body, validationResult } = require('express-validator');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/contests
// @desc    Get all contests with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { 
      status: { $in: ['published', 'active', 'completed'] },
      isVisible: true
    };
    
    if (req.query.type) filter.type = req.query.type;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.community) filter.community = req.query.community;
    if (req.query.status) filter.status = req.query.status;
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (req.query.sortBy) {
      case 'startDate':
        sort = { startDate: 1 };
        break;
      case 'endDate':
        sort = { endDate: 1 };
        break;
      case 'participants':
        sort = { 'participants.length': -1 };
        break;
      case 'difficulty':
        sort = { difficulty: 1 };
        break;
      case 'recent':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { startDate: 1 };
    }

    // Get contests with pagination
    const contests = await Contest.find(filter)
      .populate('createdBy', 'firstName lastName username profilePicture')
      .populate('community', 'name description category')
      .populate('problems.problem', 'title difficulty category tags')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Contest.countDocuments(filter);

    // Add user participation status if authenticated
    let contestsWithParticipation = contests;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        contestsWithParticipation = contests.map(contest => {
          const contestObj = contest.toObject();
          const participation = contest.participants.find(participant => 
            participant.user.toString() === userId
          );
          contestObj.isParticipating = !!participation;
          contestObj.userScore = participation ? participation.score : null;
          contestObj.userRank = participation ? participation.rank : null;
          return contestObj;
        });
      } catch (error) {
        // Token invalid, continue without participation info
        contestsWithParticipation = contests.map(contest => {
          const contestObj = contest.toObject();
          contestObj.isParticipating = false;
          contestObj.userScore = null;
          contestObj.userRank = null;
          return contestObj;
        });
      }
    }

    res.json({
      success: true,
      data: {
        contests: contestsWithParticipation,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalContests: total,
          contestsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contests'
    });
  }
});

// @route   GET /api/contests/:id
// @desc    Get contest by ID with detailed information
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('createdBy', 'firstName lastName username profilePicture bio')
      .populate('community', 'name description category privacy')
      .populate('problems.problem', 'title description difficulty category tags constraints')
      .populate('participants.user', 'firstName lastName username profilePicture');

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    if (!contest.isVisible) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Add user participation status if authenticated
    let contestWithParticipation = contest.toObject();
    contestWithParticipation.isParticipating = false;
    contestWithParticipation.userScore = null;
    contestWithParticipation.userRank = null;
    contestWithParticipation.canJoin = false;
    contestWithParticipation.canSubmit = false;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const participation = contest.participants.find(participant => 
          participant.user._id.toString() === userId
        );
        
        contestWithParticipation.isParticipating = !!participation;
        contestWithParticipation.userScore = participation ? participation.score : null;
        contestWithParticipation.userRank = participation ? participation.rank : null;
        
        // Check if user can join
        const now = new Date();
        contestWithParticipation.canJoin = !participation && 
          contest.status === 'published' && 
          now >= new Date(contest.startDate) && 
          now <= new Date(contest.endDate);
        
        // Check if user can submit
        contestWithParticipation.canSubmit = participation && 
          contest.status === 'active' && 
          now >= new Date(contest.startDate) && 
          now <= new Date(contest.endDate);
        
      } catch (error) {
        // Token invalid, continue without participation info
      }
    }

    res.json({
      success: true,
      data: contestWithParticipation
    });

  } catch (error) {
    console.error('Get contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contest'
    });
  }
});

// @route   POST /api/contests
// @desc    Create a new contest
// @access  Private (Admin/Mentor)
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Contest name must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('type').isIn(['practice', 'competitive', 'assessment', 'hackathon']).withMessage('Invalid contest type'),
  body('difficulty').isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Invalid difficulty level'),
  body('category').isIn(['algorithms', 'data-structures', 'mathematics', 'strings', 'arrays', 'dynamic-programming', 'graph-theory', 'other']).withMessage('Invalid category'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('duration').isInt({ min: 15, max: 1440 }).withMessage('Duration must be between 15 and 1440 minutes'),
  body('problems').optional().isArray().withMessage('Problems must be an array'),
  body('maxParticipants').optional().isInt({ min: 1, max: 10000 }).withMessage('Max participants must be between 1 and 10000')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user has permission to create contests
            if (!['admin', 'community'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create contests'
      });
    }

    const {
      name,
      description,
      shortDescription,
      type,
      difficulty,
      category,
      startDate,
      endDate,
      duration,
      problems,
      community,
      rules,
      allowedLanguages,
      maxSubmissions,
      plagiarismCheck,
      autoJudge,
      scoringSystem,
      tieBreaker,
      bonusPoints,
      allowedRoles,
      allowedInstitutions,
      password,
      maxParticipants,
      tags,
      image,
      isPublic
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Validate problems if provided
    if (problems && problems.length > 0) {
      for (let problem of problems) {
        if (!problem.problem || !problem.points || !problem.order) {
          return res.status(400).json({
            success: false,
            message: 'Each problem must have problem ID, points, and order'
          });
        }
        
        // Verify problem exists
        const problemExists = await Problem.findById(problem.problem);
        if (!problemExists) {
          return res.status(400).json({
            success: false,
            message: `Problem with ID ${problem.problem} not found`
          });
        }
      }
    }

    // Create contest
    const contest = new Contest({
      name,
      description,
      shortDescription,
      type,
      difficulty,
      category,
      startDate,
      endDate,
      duration,
      problems: problems || [],
      community,
      rules: rules || [],
      allowedLanguages: allowedLanguages || ['python', 'java', 'cpp', 'c', 'javascript'],
      maxSubmissions: maxSubmissions || 10,
      plagiarismCheck: plagiarismCheck !== undefined ? plagiarismCheck : true,
      autoJudge: autoJudge !== undefined ? autoJudge : true,
      scoringSystem: scoringSystem || 'standard',
      tieBreaker: tieBreaker || 'time',
      bonusPoints: bonusPoints || {},
              allowedRoles: allowedRoles || ['personal', 'community', 'admin'],
      allowedInstitutions: allowedInstitutions || [],
      password,
      maxParticipants: maxParticipants || 1000,
      tags: tags || [],
      image,
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: req.user.id,
      status: 'draft'
    });

    await contest.save();

    // Populate createdBy for response
    await contest.populate('createdBy', 'firstName lastName username profilePicture');

    res.status(201).json({
      success: true,
      message: 'Contest created successfully',
      data: contest
    });

  } catch (error) {
    console.error('Create contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating contest'
    });
  }
});

// @route   PUT /api/contests/:id
// @desc    Update contest
// @access  Private (Admin/Mentor - Creator)
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Contest name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('duration').optional().isInt({ min: 15, max: 1440 }).withMessage('Duration must be between 15 and 1440 minutes')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Check if user has permission to update
    if (contest.createdBy.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this contest'
      });
    }

    // Check if contest can be updated (not active or completed)
    if (['active', 'completed'].includes(contest.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update active or completed contests'
      });
    }

    // Validate dates if being updated
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.startDate) >= new Date(req.body.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Update contest
    const updatedContest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'firstName lastName username profilePicture')
    .populate('community', 'name description category')
    .populate('problems.problem', 'title difficulty category tags');

    res.json({
      success: true,
      message: 'Contest updated successfully',
      data: updatedContest
    });

  } catch (error) {
    console.error('Update contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contest'
    });
  }
});

// @route   POST /api/contests/:id/join
// @desc    Join a contest
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    if (contest.status !== 'published' && contest.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Contest is not open for participation'
      });
    }

    // Check if contest has started
    const now = new Date();
    if (now < new Date(contest.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Contest has not started yet'
      });
    }

    // Check if contest has ended
    if (now > new Date(contest.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Contest has ended'
      });
    }

    // Check if user is already a participant
    const isParticipant = contest.participants.some(participant => 
      participant.user.toString() === req.user.id
    );

    if (isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already participating in this contest'
      });
    }

    // Check if contest is full
    if (contest.maxParticipants && contest.participants.length >= contest.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Contest is full'
      });
    }

    // Add user to participants
    contest.participants.push({
      user: req.user.id,
      joinedAt: new Date(),
      score: 0,
      problemsSolved: 0
    });

    await contest.save();

    res.json({
      success: true,
      message: 'Successfully joined the contest'
    });

  } catch (error) {
    console.error('Join contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while joining contest'
    });
  }
});

// @route   POST /api/contests/:id/leave
// @desc    Leave a contest
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Check if contest is active
    if (contest.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave an active contest'
      });
    }

    // Find user's participation
    const participantIndex = contest.participants.findIndex(participant => 
      participant.user.toString() === req.user.id
    );

    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not participating in this contest'
      });
    }

    // Remove user from participants
    contest.participants.splice(participantIndex, 1);
    await contest.save();

    res.json({
      success: true,
      message: 'Successfully left the contest'
    });

  } catch (error) {
    console.error('Leave contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while leaving contest'
    });
  }
});

// @route   POST /api/contests/:id/publish
// @desc    Publish a contest (change status from draft to published)
// @access  Private (Admin/Mentor - Creator)
router.post('/:id/publish', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Check if user has permission
    if (contest.createdBy.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to publish this contest'
      });
    }

    // Check if contest is in draft status
    if (contest.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft contests can be published'
      });
    }

    // Check if contest has problems
    if (!contest.problems || contest.problems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Contest must have at least one problem before publishing'
      });
    }

    // Update contest status
    contest.status = 'published';
    await contest.save();

    res.json({
      success: true,
      message: 'Contest published successfully'
    });

  } catch (error) {
    console.error('Publish contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while publishing contest'
    });
  }
});

// @route   POST /api/contests/:id/start
// @desc    Start a contest (change status from published to active)
// @access  Private (Admin/Mentor - Creator)
router.post('/:id/start', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Check if user has permission
    if (contest.createdBy.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to start this contest'
      });
    }

    // Check if contest is published
    if (contest.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Only published contests can be started'
      });
    }

    // Check if start time has arrived
    const now = new Date();
    if (now < new Date(contest.startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Contest start time has not arrived yet'
      });
    }

    // Update contest status
    contest.status = 'active';
    await contest.save();

    res.json({
      success: true,
      message: 'Contest started successfully'
    });

  } catch (error) {
    console.error('Start contest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting contest'
    });
  }
});

// @route   GET /api/contests/:id/leaderboard
// @desc    Get contest leaderboard
// @access  Public
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('participants.user', 'firstName lastName username profilePicture')
      .populate('problems.problem', 'title difficulty category');

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Sort participants by score (descending) and then by submission time
    const sortedParticipants = contest.participants
      .filter(participant => !participant.isDisqualified)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // If scores are equal, sort by submission time (earlier is better)
        if (a.endTime && b.endTime) {
          return new Date(a.endTime) - new Date(b.endTime);
        }
        return 0;
      })
      .map((participant, index) => ({
        ...participant.toObject(),
        rank: index + 1
      }));

    res.json({
      success: true,
      data: {
        contest: {
          id: contest._id,
          name: contest.name,
          status: contest.status,
          startDate: contest.startDate,
          endDate: contest.endDate
        },
        leaderboard: sortedParticipants,
        totalParticipants: sortedParticipants.length
      }
    });

  } catch (error) {
    console.error('Get contest leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contest leaderboard'
    });
  }
});

// @route   GET /api/contests/:id/problems
// @desc    Get contest problems
// @access  Public (for published contests) / Private (for participants)
router.get('/:id/problems', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('problems.problem', 'title description difficulty category tags constraints');

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Check if user can access problems
    let canAccess = false;
    
    if (contest.status === 'published' || contest.status === 'active') {
      canAccess = true;
    } else if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Check if user is participant
        const isParticipant = contest.participants.some(participant => 
          participant.user.toString() === userId
        );
        canAccess = isParticipant;
      } catch (error) {
        // Token invalid
      }
    }

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to contest problems'
      });
    }

    res.json({
      success: true,
      data: {
        contest: {
          id: contest._id,
          name: contest.name,
          status: contest.status,
          startDate: contest.startDate,
          endDate: contest.endDate,
          duration: contest.duration
        },
        problems: contest.problems
      }
    });

  } catch (error) {
    console.error('Get contest problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contest problems'
    });
  }
});

module.exports = router;
