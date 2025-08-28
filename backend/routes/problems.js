const express = require('express');
const { body, validationResult } = require('express-validator');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const { auth, admin, community } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/problems
// @desc    Get all problems with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'active' };
    
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.contest) filter.contest = req.query.contest;
    if (req.query.author) filter.author = req.query.author;
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (req.query.sortBy) {
      case 'difficulty':
        sort = { difficulty: 1 };
        break;
      case 'acceptance':
        sort = { acceptanceRate: -1 };
        break;
      case 'submissions':
        sort = { totalSubmissions: -1 };
        break;
      case 'recent':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { difficulty: 1 };
    }

    // Get problems with pagination
    const problems = await Problem.find(filter)
      .populate('author', 'firstName lastName username profilePicture')
      .populate('contest', 'name description startDate endDate')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Problem.countDocuments(filter);

    // Add user submission status if authenticated
    let problemsWithSubmission = problems;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        problemsWithSubmission = await Promise.all(problems.map(async (problem) => {
          const problemObj = problem.toObject();
          
          // Check if user has submitted to this problem
          const submission = await Submission.findOne({
            user: userId,
            problem: problem._id
          }).sort({ submittedAt: -1 });

          if (submission) {
            problemObj.userSubmission = {
              status: submission.status,
              score: submission.score,
              submittedAt: submission.submittedAt
            };
          } else {
            problemObj.userSubmission = null;
          }

          return problemObj;
        }));
      } catch (error) {
        // Token invalid, continue without submission info
        problemsWithSubmission = problems.map(problem => {
          const problemObj = problem.toObject();
          problemObj.userSubmission = null;
          return problemObj;
        });
      }
    }

    res.json({
      success: true,
      data: {
        problems: problemsWithSubmission,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProblems: total,
          problemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching problems'
    });
  }
});

// @route   GET /api/problems/:id
// @desc    Get a specific problem by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('author', 'firstName lastName username profilePicture bio')
      .populate('contest', 'name description startDate endDate status');

    if (!problem || problem.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Add user submission status if authenticated
    let problemWithSubmission = problem.toObject();
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Check if user has submitted to this problem
        const submission = await Submission.findOne({
          user: userId,
          problem: problem._id
        }).sort({ submittedAt: -1 });

        if (submission) {
          problemWithSubmission.userSubmission = {
            status: submission.status,
            score: submission.score,
            submittedAt: submission.submittedAt,
            language: submission.language,
            executionTime: submission.executionTime,
            memoryUsed: submission.memoryUsed
          };
        } else {
          problemWithSubmission.userSubmission = null;
        }

        // Check if user can access test cases (admin, mentor, or has solved)
        if (['admin', 'mentor'].includes(decoded.role) || 
            (submission && submission.status === 'accepted')) {
          problemWithSubmission.testCases = problem.testCases;
        } else {
          problemWithSubmission.testCases = problem.testCases.filter(tc => !tc.isHidden);
        }

      } catch (error) {
        // Token invalid, continue without submission info
        problemWithSubmission.userSubmission = null;
        problemWithSubmission.testCases = problem.testCases.filter(tc => !tc.isHidden);
      }
    } else {
      // Not authenticated, only show public test cases
      problemWithSubmission.testCases = problem.testCases.filter(tc => !tc.isHidden);
    }

    res.json({
      success: true,
      data: problemWithSubmission
    });

  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching problem'
    });
  }
});

// @route   POST /api/problems
// @desc    Create a new problem
// @access  Private (Admin/Mentor)
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 20, max: 10000 }).withMessage('Description must be between 20 and 10000 characters'),
  body('difficulty').isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Invalid difficulty level'),
  body('category').isIn(['algorithms', 'data-structures', 'mathematics', 'strings', 'arrays', 'dynamic-programming', 'graph-theory', 'other']).withMessage('Invalid category'),
  body('tags').isArray().withMessage('Tags must be an array'),
  body('testCases').isArray().withMessage('Test cases must be an array'),
  body('constraints.timeLimit').isInt({ min: 1000, max: 30000 }).withMessage('Time limit must be between 1000 and 30000 ms'),
  body('constraints.memoryLimit').isInt({ min: 16, max: 512 }).withMessage('Memory limit must be between 16 and 512 MB'),
  body('contest').optional().isMongoId().withMessage('Valid contest ID required')
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

    // Check if user has permission to create problems
    if (!['admin', 'mentor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create problems'
      });
    }

    const { 
      title, 
      description, 
      difficulty, 
      category, 
      tags, 
      testCases, 
      constraints,
      contest,
      solution,
      hints
    } = req.body;

    // Validate test cases
    if (testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one test case is required'
      });
    }

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (!tc.input || !tc.expectedOutput) {
        return res.status(400).json({
          success: false,
          message: `Test case ${i + 1} must have input and expected output`
        });
      }
    }

    // Check if contest exists and is accessible
    if (contest) {
      const contestDoc = await Contest.findById(contest);
      if (!contestDoc) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      // Check if user has permission to add problems to this contest
      if (contestDoc.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to add problems to this contest'
        });
      }
    }

    // Create problem
    const problem = new Problem({
      title,
      description,
      difficulty,
      category,
      tags,
      testCases,
      constraints,
      contest,
      solution,
      hints,
      author: req.user.id
    });

    await problem.save();

    // Populate author and contest for response
    await problem.populate('author', 'firstName lastName username profilePicture');
    if (contest) {
      await problem.populate('contest', 'name description startDate endDate');
    }

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: problem
    });

  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating problem'
    });
  }
});

// @route   PUT /api/problems/:id
// @desc    Update a problem
// @access  Private (Author/Admin)
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ min: 20, max: 10000 }).withMessage('Description must be between 20 and 10000 characters'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Invalid difficulty level'),
  body('category').optional().isIn(['algorithms', 'data-structures', 'mathematics', 'strings', 'arrays', 'dynamic-programming', 'graph-theory', 'other']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('testCases').optional().isArray().withMessage('Test cases must be an array'),
  body('constraints.timeLimit').optional().isInt({ min: 1000, max: 30000 }).withMessage('Time limit must be between 1000 and 30000 ms'),
  body('constraints.memoryLimit').optional().isInt({ min: 16, max: 512 }).withMessage('Memory limit must be between 16 and 512 MB')
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

    const problem = await Problem.findById(req.params.id);
    if (!problem || problem.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if user has permission to update
    if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this problem'
      });
    }

    // Validate test cases if being updated
    if (req.body.testCases && req.body.testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one test case is required'
      });
    }

    if (req.body.testCases) {
      for (let i = 0; i < req.body.testCases.length; i++) {
        const tc = req.body.testCases[i];
        if (!tc.input || !tc.expectedOutput) {
          return res.status(400).json({
            success: false,
            message: `Test case ${i + 1} must have input and expected output`
          });
        }
      }
    }

    // Update problem
    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('author', 'firstName lastName username profilePicture')
    .populate('contest', 'name description startDate endDate');

    res.json({
      success: true,
      message: 'Problem updated successfully',
      data: updatedProblem
    });

  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating problem'
    });
  }
});

// @route   DELETE /api/problems/:id
// @desc    Delete a problem
// @access  Private (Author/Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem || problem.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if user has permission to delete
    if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this problem'
      });
    }

    // Check if problem has submissions
    const submissionCount = await Submission.countDocuments({ problem: problem._id });
    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete problem with existing submissions'
      });
    }

    // Soft delete - mark as deleted
    problem.status = 'deleted';
    await problem.save();

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });

  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting problem'
    });
  }
});

// @route   POST /api/problems/:id/submit
// @desc    Submit a solution to a problem
// @access  Private
router.post('/:id/submit', [
  auth,
  body('code').trim().isLength({ min: 1, max: 50000 }).withMessage('Code must be between 1 and 50000 characters'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp', 'c']).withMessage('Invalid programming language'),
  body('contest').optional().isMongoId().withMessage('Valid contest ID required')
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

    const problem = await Problem.findById(req.params.id);
    if (!problem || problem.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const { code, language, contest } = req.body;

    // Check if contest exists and user is participating
    if (contest) {
      const contestDoc = await Contest.findById(contest);
      if (!contestDoc) {
        return res.status(404).json({
          success: false,
          message: 'Contest not found'
        });
      }

      const participation = contestDoc.participants.find(participant => 
        participant.user.toString() === req.user.id
      );
      
      if (!participation) {
        return res.status(403).json({
          success: false,
          message: 'You must be participating in this contest to submit'
        });
      }

      // Check if contest is active
      if (contestDoc.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Contest is not active'
        });
      }
    }

    // Create submission
    const submission = new Submission({
      user: req.user.id,
      problem: problem._id,
      contest: contest || null,
      code,
      language,
      status: 'pending',
      submittedAt: new Date()
    });

    await submission.save();

    // TODO: Implement code execution and testing
    // For now, simulate processing
    setTimeout(async () => {
      // Simulate test case execution
      let passedTests = 0;
      let totalTests = problem.testCases.filter(tc => !tc.isHidden).length;
      
      // Random result for demo purposes
      const randomResult = Math.random();
      if (randomResult > 0.3) {
        passedTests = totalTests;
        submission.status = 'accepted';
        submission.score = problem.testCases.reduce((sum, tc) => sum + tc.points, 0);
      } else if (randomResult > 0.1) {
        passedTests = Math.floor(randomResult * totalTests);
        submission.status = 'partial';
        submission.score = Math.floor((passedTests / totalTests) * problem.testCases.reduce((sum, tc) => sum + tc.points, 0));
      } else {
        submission.status = 'wrong_answer';
        submission.score = 0;
      }

      submission.executionTime = Math.floor(Math.random() * 1000) + 100;
      submission.memoryUsed = Math.floor(Math.random() * 50) + 16;
      submission.passedTests = passedTests;
      submission.totalTests = totalTests;

      await submission.save();

      // Update problem statistics
      await problem.updateStats();
    }, 2000);

    res.status(201).json({
      success: true,
      message: 'Submission received successfully',
      data: {
        submissionId: submission._id,
        status: 'pending',
        message: 'Your solution is being processed...'
      }
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting solution'
    });
  }
});

// @route   GET /api/problems/:id/submissions
// @desc    Get user's submissions for a problem
// @access  Private
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const problem = await Problem.findById(req.params.id);
    if (!problem || problem.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Get user's submissions
    const submissions = await Submission.find({
      user: req.user.id,
      problem: problem._id
    })
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Submission.countDocuments({
      user: req.user.id,
      problem: problem._id
    });

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
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
});

// @route   GET /api/problems/:id/leaderboard
// @desc    Get leaderboard for a problem
// @access  Public
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const problem = await Problem.findById(req.params.id);
    if (!problem || problem.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Get best submissions for each user
    const leaderboard = await Submission.aggregate([
      { $match: { problem: problem._id, status: 'accepted' } },
      { $sort: { executionTime: 1, memoryUsed: 1, submittedAt: 1 } },
      { $group: { _id: '$user', bestSubmission: { $first: '$$ROOT' } } },
      { $sort: { 'bestSubmission.executionTime': 1, 'bestSubmission.memoryUsed': 1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // Populate user information
    const populatedLeaderboard = await Submission.populate(leaderboard, [
      { path: 'bestSubmission.user', select: 'firstName lastName username profilePicture' }
    ]);

    const total = await Submission.aggregate([
      { $match: { problem: problem._id, status: 'accepted' } },
      { $group: { _id: '$user' } },
      { $count: 'total' }
    ]);

    const totalUsers = total.length > 0 ? total[0].total : 0;

    res.json({
      success: true,
      data: {
        leaderboard: populatedLeaderboard.map((entry, index) => ({
          rank: skip + index + 1,
          user: entry.bestSubmission.user,
          submission: entry.bestSubmission
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers: totalUsers,
          usersPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard'
    });
  }
});

module.exports = router;
