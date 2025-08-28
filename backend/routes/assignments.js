const express = require('express');
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { auth, community, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get assignments (filtered by user role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let assignments;
    let total;

    // Different logic based on user role
    if (req.user.role === 'mentor' || req.user.role === 'admin') {
      // Mentors/Admins see assignments they created
      const filters = { assignedBy: req.user.id };
      if (req.query.status) filters.status = req.query.status;
      if (req.query.type) filters.type = req.query.type;
      if (req.query.difficulty) filters.difficulty = req.query.difficulty;

      assignments = await Assignment.find(filters)
        .populate('assignedTo.user', 'firstName lastName username email')
        .populate('community', 'name')
        .populate('contest', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      total = await Assignment.countDocuments(filters);
    } else {
      // Students see assignments assigned to them
      const filters = { 'assignedTo.user': req.user.id };
      if (req.query.status) filters['assignedTo.status'] = req.query.status;
      if (req.query.type) filters.type = req.query.type;
      if (req.query.difficulty) filters.difficulty = req.query.difficulty;

      assignments = await Assignment.find(filters)
        .populate('assignedBy', 'firstName lastName username')
        .populate('community', 'name')
        .populate('contest', 'name')
        .sort({ deadline: 1 })
        .skip(skip)
        .limit(limit);

      total = await Assignment.countDocuments(filters);
    }

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAssignments: total,
          assignmentsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assignments'
    });
  }
});

// @route   POST /api/assignments
// @desc    Create a new assignment (mentor/admin only)
// @access  Private (Mentor/Admin)
router.post('/', [
  auth,
  community,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Assignment title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('type').isIn(['problem', 'project', 'reading', 'practice', 'other']).withMessage('Invalid assignment type'),
  body('difficulty').isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Invalid difficulty level'),
  body('category').isIn(['algorithms', 'data-structures', 'mathematics', 'strings', 'arrays', 'dynamic-programming', 'graph-theory', 'other']).withMessage('Invalid category'),
  body('platform').optional().isIn(['leetcode', 'hackerrank', 'gfg', 'interviewbit', 'skillport', 'other']).withMessage('Invalid platform'),
  body('deadline').isISO8601().withMessage('Invalid deadline format'),
  body('estimatedTime').optional().isInt({ min: 1 }).withMessage('Estimated time must be at least 1 minute'),
  body('maxAttempts').optional().isInt({ min: 1 }).withMessage('Max attempts must be at least 1'),
  body('points').optional().isInt({ min: 1 }).withMessage('Points must be at least 1'),
  body('assignedTo').optional().isArray().withMessage('Assigned users must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
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

    const assignmentData = {
      ...req.body,
      assignedBy: req.user.id,
      deadline: new Date(req.body.deadline)
    };

    // Validate assigned users if provided
    if (req.body.assignedTo && Array.isArray(req.body.assignedTo)) {
      for (const userId of req.body.assignedTo) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: `User with ID ${userId} not found`
          });
        }
      }
    }

    const assignment = new Assignment(assignmentData);
    await assignment.save();

    // Populate references for response
    await assignment.populate('assignedBy', 'firstName lastName username');
    if (assignment.assignedTo.length > 0) {
      await assignment.populate('assignedTo.user', 'firstName lastName username');
    }

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment }
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating assignment'
    });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('assignedBy', 'firstName lastName username')
      .populate('assignedTo.user', 'firstName lastName username email')
      .populate('community', 'name')
      .populate('contest', 'name');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user has access to this assignment
    const hasAccess = assignment.assignedBy.toString() === req.user.id || 
                     assignment.assignedTo.some(a => a.user.toString() === req.user.id) ||
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this assignment'
      });
    }

    res.json({
      success: true,
      data: { assignment }
    });

  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assignment'
    });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment by ID (mentor/admin only)
// @access  Private (Mentor/Admin)
router.put('/:id', [
  auth,
  community,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Assignment title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('type').optional().isIn(['problem', 'project', 'reading', 'practice', 'other']).withMessage('Invalid assignment type'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Invalid difficulty level'),
  body('category').optional().isIn(['algorithms', 'data-structures', 'mathematics', 'strings', 'arrays', 'dynamic-programming', 'graph-theory', 'other']).withMessage('Invalid category'),
  body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
  body('status').optional().isIn(['draft', 'published', 'active', 'completed', 'archived']).withMessage('Invalid status')
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

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user can edit this assignment
    if (assignment.assignedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to edit this assignment'
      });
    }

    // Handle deadline conversion
    if (req.body.deadline) {
      req.body.deadline = new Date(req.body.deadline);
    }

    // Update assignment
    Object.assign(assignment, req.body);
    await assignment.save();

    // Populate references for response
    await assignment.populate('assignedBy', 'firstName lastName username');
    if (assignment.assignedTo.length > 0) {
      await assignment.populate('assignedTo.user', 'firstName lastName username');
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment }
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating assignment'
    });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment by ID (mentor/admin only)
// @access  Private (Mentor/Admin)
router.delete('/:id', auth, community, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user can delete this assignment
    if (assignment.assignedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this assignment'
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting assignment'
    });
  }
});

// @route   POST /api/assignments/:id/assign
// @desc    Assign users to an assignment (mentor/admin only)
// @access  Private (Mentor/Admin)
router.post('/:id/assign', [
  auth,
  community,
  body('userIds').isArray().withMessage('User IDs must be an array'),
  body('userIds.*').isMongoId().withMessage('Invalid user ID format')
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

    const { userIds } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user can modify this assignment
    if (assignment.assignedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to modify this assignment'
      });
    }

    const results = [];
    for (const userId of userIds) {
      const result = assignment.assignToUser(userId);
      results.push({ userId, ...result });
    }

    await assignment.save();

    // Populate references for response
    await assignment.populate('assignedTo.user', 'firstName lastName username email');

    res.json({
      success: true,
      message: 'Users assigned successfully',
      data: { assignment, results }
    });

  } catch (error) {
    console.error('Assign users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning users'
    });
  }
});

// @route   POST /api/assignments/:id/remove-user
// @desc    Remove user from assignment (mentor/admin only)
// @access  Private (Mentor/Admin)
router.post('/:id/remove-user', [
  auth,
  community,
  body('userId').isMongoId().withMessage('Invalid user ID format')
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

    const { userId } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user can modify this assignment
    if (assignment.assignedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to modify this assignment'
      });
    }

    const result = assignment.removeUser(userId);
    await assignment.save();

    res.json({
      success: true,
      message: result.message,
      data: { assignment }
    });

  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing user'
    });
  }
});

// @route   POST /api/assignments/:id/update-status
// @desc    Update user's assignment status (student or mentor)
// @access  Private
router.post('/:id/update-status', [
  auth,
  body('status').isIn(['assigned', 'in_progress', 'completed', 'overdue', 'cancelled']).withMessage('Invalid status'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('attempts').optional().isInt({ min: 0 }).withMessage('Attempts cannot be negative'),
  body('feedback').optional().isString().withMessage('Feedback must be a string'),
  body('mentorNotes').optional().isString().withMessage('Mentor notes must be a string')
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

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user has access to this assignment
    const userAssignment = assignment.assignedTo.find(a => a.user.toString() === req.user.id);
    if (!userAssignment && assignment.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this assignment'
      });
    }

    // Update status
    const updateData = { ...req.body };
    if (userAssignment) {
      // Student updating their own status
      const result = assignment.updateUserStatus(req.user.id, req.body.status, updateData);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } else {
      // Mentor updating student status
      const targetUserId = req.body.targetUserId;
      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'Target user ID is required for mentor updates'
        });
      }

      const result = assignment.updateUserStatus(targetUserId, req.body.status, updateData);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }
    }

    await assignment.save();

    // Populate references for response
    await assignment.populate('assignedBy', 'firstName lastName username');
    if (assignment.assignedTo.length > 0) {
      await assignment.populate('assignedTo.user', 'firstName lastName username');
    }

    res.json({
      success: true,
      message: 'Assignment status updated successfully',
      data: { assignment }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status'
    });
  }
});

// @route   GET /api/assignments/stats/overview
// @desc    Get assignment statistics
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    let stats;

    if (req.user.role === 'mentor' || req.user.role === 'admin') {
      // Mentor/Admin stats
      const totalAssignments = await Assignment.countDocuments({ assignedBy: req.user.id });
      const publishedAssignments = await Assignment.countDocuments({ 
        assignedBy: req.user.id, 
        status: { $in: ['published', 'active'] } 
      });
      const completedAssignments = await Assignment.countDocuments({ 
        assignedBy: req.user.id, 
        status: 'completed' 
      });

      stats = {
        total: totalAssignments,
        published: publishedAssignments,
        completed: completedAssignments,
        active: publishedAssignments - completedAssignments
      };
    } else {
      // Student stats
      const totalAssigned = await Assignment.countDocuments({ 'assignedTo.user': req.user.id });
      const completedAssignments = await Assignment.countDocuments({ 
        'assignedTo.user': req.user.id, 
        'assignedTo.status': 'completed' 
      });
      const inProgressAssignments = await Assignment.countDocuments({ 
        'assignedTo.user': req.user.id, 
        'assignedTo.status': 'in_progress' 
      });
      const overdueAssignments = await Assignment.countDocuments({ 
        'assignedTo.user': req.user.id, 
        'assignedTo.status': { $in: ['assigned', 'in_progress'] },
        deadline: { $lt: new Date() }
      });

      stats = {
        total: totalAssigned,
        completed: completedAssignments,
        inProgress: inProgressAssignments,
        overdue: overdueAssignments
      };
    }

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assignment statistics'
    });
  }
});

// @route   GET /api/assignments/overdue
// @desc    Get overdue assignments
// @access  Private (Mentor/Admin)
router.get('/overdue', auth, community, async (req, res) => {
  try {
    const overdueAssignments = await Assignment.getOverdueAssignments();

    res.json({
      success: true,
      data: { assignments: overdueAssignments }
    });

  } catch (error) {
    console.error('Get overdue assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue assignments'
    });
  }
});

module.exports = router;
