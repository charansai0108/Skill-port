const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { auth, admin, community } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get user's tasks with filtering and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filters = { user: req.user.id };
    if (req.query.status) filters.status = req.query.status;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.platform) filters.platform = req.query.platform;
    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (req.query.sortBy) {
      case 'deadline':
        sort = { deadline: 1 };
        break;
      case 'priority':
        sort = { priority: -1 };
        break;
      case 'created':
        sort = { createdAt: -1 };
        break;
      case 'updated':
        sort = { updatedAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Get tasks with pagination
    const tasks = await Task.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Task.countDocuments(filters);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTasks: total,
          tasksPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Task title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category').optional().isIn(['coding', 'learning', 'project', 'interview', 'personal', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
  body('estimatedTime').optional().isInt({ min: 1 }).withMessage('Estimated time must be at least 1 minute'),
  body('platform').optional().isIn(['leetcode', 'hackerrank', 'gfg', 'interviewbit', 'skillport', 'other']).withMessage('Invalid platform'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Invalid difficulty'),
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

    const taskData = {
      ...req.body,
      user: req.user.id
    };

    // Handle deadline conversion
    if (taskData.deadline) {
      taskData.deadline = new Date(taskData.deadline);
    }

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task by ID
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Task title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category').optional().isIn(['coding', 'learning', 'project', 'interview', 'personal', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['todo', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
  body('estimatedTime').optional().isInt({ min: 1 }).withMessage('Estimated time must be at least 1 minute'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent cannot be negative'),
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

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Handle deadline conversion
    if (req.body.deadline) {
      req.body.deadline = new Date(req.body.deadline);
    }

    // Update task
    Object.assign(task, req.body);
    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
});

// @route   POST /api/tasks/:id/start
// @desc    Start a task
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot start a completed task'
      });
    }

    await task.startTask();

    res.json({
      success: true,
      message: 'Task started successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Start task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting task'
    });
  }
});

// @route   POST /api/tasks/:id/complete
// @desc    Complete a task
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.completeTask();

    res.json({
      success: true,
      message: 'Task completed successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing task'
    });
  }
});

// @route   POST /api/tasks/:id/progress
// @desc    Update task progress
// @access  Private
router.post('/:id/progress', [
  auth,
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent cannot be negative')
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

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.updateProgress(req.body.progress, req.body.timeSpent);

    res.json({
      success: true,
      message: 'Task progress updated successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress'
    });
  }
});

// @route   GET /api/tasks/stats/overview
// @desc    Get user's task statistics
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get task counts by status
    const statusStats = await Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get task counts by category
    const categoryStats = await Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get overdue tasks count
    const overdueCount = await Task.countDocuments({
      user: userId,
      deadline: { $lt: new Date() },
      status: { $nin: ['completed', 'cancelled'] }
    });

    // Get upcoming deadlines count
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const upcomingCount = await Task.countDocuments({
      user: userId,
      deadline: { $gte: new Date(), $lte: futureDate },
      status: { $nin: ['completed', 'cancelled'] }
    });

    // Get total time spent
    const timeStats = await Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalTimeSpent: { $sum: '$timeSpent' } } }
    ]);

    const stats = {
      status: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      category: categoryStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      overdue: overdueCount,
      upcoming: upcomingCount,
      totalTimeSpent: timeStats[0]?.totalTimeSpent || 0
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task statistics'
    });
  }
});

// @route   GET /api/tasks/overdue
// @desc    Get user's overdue tasks
// @access  Private
router.get('/overdue', auth, async (req, res) => {
  try {
    const overdueTasks = await Task.getOverdueTasks(req.user.id);

    res.json({
      success: true,
      data: { tasks: overdueTasks }
    });

  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue tasks'
    });
  }
});

// @route   GET /api/tasks/upcoming
// @desc    Get user's upcoming deadline tasks
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const upcomingTasks = await Task.getUpcomingDeadlines(req.user.id, days);

    res.json({
      success: true,
      data: { tasks: upcomingTasks }
    });

  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming tasks'
    });
  }
});

module.exports = router;
