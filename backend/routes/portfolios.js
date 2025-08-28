const express = require('express');
const { body, validationResult } = require('express-validator');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/portfolios
// @desc    Get public portfolios with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = {};
    
    // Apply filters
    if (req.query.skills) {
      filters.skills = req.query.skills.split(',');
    }
    
    if (req.query.platforms) {
      filters.platforms = req.query.platforms.split(',');
    }
    
    if (req.query.location) {
      filters.location = req.query.location;
    }

    const portfolios = await Portfolio.getPublicPortfolios(filters)
      .skip(skip)
      .limit(limit);

    const total = await Portfolio.countDocuments({ isPublic: true });

    res.json({
      success: true,
      data: {
        portfolios,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPortfolios: total,
          portfoliosPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get portfolios error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching portfolios'
    });
  }
});

// @route   GET /api/portfolios/:customUrl
// @desc    Get portfolio by custom URL
// @access  Public
router.get('/:customUrl', async (req, res) => {
  try {
    const portfolio = await Portfolio.getPortfolioByCustomUrl(req.params.customUrl);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Increment view count
    await portfolio.addView();

    res.json({
      success: true,
      data: { portfolio }
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching portfolio'
    });
  }
});

// @route   GET /api/portfolios/user/profile
// @desc    Get current user's portfolio
// @access  Private
router.get('/user/profile', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user.id })
      .populate('user', 'firstName lastName username email');

    if (!portfolio) {
      // Create portfolio if it doesn't exist
      portfolio = new Portfolio({
        user: req.user.id,
        customUrl: `${req.user.username}-portfolio`
      });
      await portfolio.save();
    }

    // Update coding stats
    await portfolio.updateCodingStats();

    res.json({
      success: true,
      data: { portfolio }
    });

  } catch (error) {
    console.error('Get user portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user portfolio'
    });
  }
});

// @route   PUT /api/portfolios/user/profile
// @desc    Update current user's portfolio
// @access  Private
router.put('/user/profile', [
  auth,
  body('headline').optional().isLength({ max: 200 }).withMessage('Headline cannot exceed 200 characters'),
  body('summary').optional().isLength({ max: 1000 }).withMessage('Summary cannot exceed 1000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  body('theme').optional().isIn(['default', 'dark', 'light', 'professional', 'creative']).withMessage('Invalid theme'),
  body('customUrl').optional().matches(/^[a-zA-Z0-9-]+$/).withMessage('Custom URL can only contain letters, numbers, and hyphens')
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

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      // Create portfolio if it doesn't exist
      portfolio = new Portfolio({
        user: req.user.id,
        customUrl: req.body.customUrl || `${req.user.username}-portfolio`
      });
    }

    // Update portfolio fields
    Object.assign(portfolio, req.body);
    
    // Ensure custom URL uniqueness
    if (req.body.customUrl) {
      const existingPortfolio = await Portfolio.findOne({ 
        customUrl: req.body.customUrl, 
        user: { $ne: req.user.id } 
      });
      
      if (existingPortfolio) {
        return res.status(400).json({
          success: false,
          message: 'Custom URL already taken'
        });
      }
    }

    await portfolio.save();

    // Populate user data for response
    await portfolio.populate('user', 'firstName lastName username email');

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: { portfolio }
    });

  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating portfolio'
    });
  }
});

// @route   POST /api/portfolios/user/skills
// @desc    Add skill to user's portfolio
// @access  Private
router.post('/user/skills', [
  auth,
  body('name').trim().isLength({ min: 1 }).withMessage('Skill name is required'),
  body('level').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid skill level'),
  body('category').isIn(['programming', 'framework', 'database', 'cloud', 'tool', 'language', 'other']).withMessage('Invalid skill category'),
  body('yearsOfExperience').optional().isInt({ min: 0 }).withMessage('Years of experience cannot be negative')
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

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    // Check if skill already exists
    const existingSkill = portfolio.skills.find(skill => 
      skill.name.toLowerCase() === req.body.name.toLowerCase()
    );

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists in portfolio'
      });
    }

    // Add new skill
    portfolio.skills.push({
      name: req.body.name,
      level: req.body.level,
      category: req.body.category,
      yearsOfExperience: req.body.yearsOfExperience
    });

    await portfolio.save();

    res.json({
      success: true,
      message: 'Skill added successfully',
      data: { skill: portfolio.skills[portfolio.skills.length - 1] }
    });

  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding skill'
    });
  }
});

// @route   DELETE /api/portfolios/user/skills/:skillId
// @desc    Remove skill from user's portfolio
// @access  Private
router.delete('/user/skills/:skillId', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const skillIndex = portfolio.skills.findIndex(skill => 
      skill._id.toString() === req.params.skillId
    );

    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    portfolio.skills.splice(skillIndex, 1);
    await portfolio.save();

    res.json({
      success: true,
      message: 'Skill removed successfully'
    });

  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing skill'
    });
  }
});

// @route   POST /api/portfolios/user/platforms
// @desc    Add platform profile to user's portfolio
// @access  Private
router.post('/user/platforms', [
  auth,
  body('platform').isIn(['leetcode', 'hackerrank', 'gfg', 'interviewbit', 'github', 'codeforces', 'other']).withMessage('Invalid platform'),
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('profileUrl').optional().isURL().withMessage('Invalid profile URL'),
  body('rating').optional().isInt({ min: 0 }).withMessage('Rating cannot be negative'),
  body('problemsSolved').optional().isInt({ min: 0 }).withMessage('Problems solved cannot be negative')
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

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    // Check if platform already exists
    const existingPlatform = portfolio.platformProfiles.find(profile => 
      profile.platform === req.body.platform
    );

    if (existingPlatform) {
      return res.status(400).json({
        success: false,
        message: 'Platform profile already exists'
      });
    }

    // Add new platform profile
    portfolio.platformProfiles.push({
      platform: req.body.platform,
      username: req.body.username,
      profileUrl: req.body.profileUrl,
      rating: req.body.rating,
      problemsSolved: req.body.problemsSolved
    });

    await portfolio.save();

    res.json({
      success: true,
      message: 'Platform profile added successfully',
      data: { platform: portfolio.platformProfiles[portfolio.platformProfiles.length - 1] }
    });

  } catch (error) {
    console.error('Add platform profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding platform profile'
    });
  }
});

// @route   PUT /api/portfolios/user/platforms/:platformId
// @desc    Update platform profile in user's portfolio
// @access  Private
router.put('/user/platforms/:platformId', [
  auth,
  body('username').optional().trim().isLength({ min: 1 }).withMessage('Username cannot be empty'),
  body('profileUrl').optional().isURL().withMessage('Invalid profile URL'),
  body('rating').optional().isInt({ min: 0 }).withMessage('Rating cannot be negative'),
  body('problemsSolved').optional().isInt({ min: 0 }).withMessage('Problems solved cannot be negative')
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

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const platformIndex = portfolio.platformProfiles.findIndex(profile => 
      profile._id.toString() === req.params.platformId
    );

    if (platformIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Platform profile not found'
      });
    }

    // Update platform profile
    Object.assign(portfolio.platformProfiles[platformIndex], req.body);
    await portfolio.save();

    res.json({
      success: true,
      message: 'Platform profile updated successfully',
      data: { platform: portfolio.platformProfiles[platformIndex] }
    });

  } catch (error) {
    console.error('Update platform profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating platform profile'
    });
  }
});

// @route   DELETE /api/portfolios/user/platforms/:platformId
// @desc    Remove platform profile from user's portfolio
// @access  Private
router.delete('/user/platforms/:platformId', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const platformIndex = portfolio.platformProfiles.findIndex(profile => 
      profile._id.toString() === req.params.platformId
    );

    if (platformIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Platform profile not found'
      });
    }

    portfolio.platformProfiles.splice(platformIndex, 1);
    await portfolio.save();

    res.json({
      success: true,
      message: 'Platform profile removed successfully'
    });

  } catch (error) {
    console.error('Remove platform profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing platform profile'
    });
  }
});

// @route   POST /api/portfolios/user/projects
// @desc    Add project to user's portfolio
// @access  Private
router.post('/user/projects', [
  auth,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Project title must be between 1 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Project description must be between 10 and 1000 characters'),
  body('technologies').isArray().withMessage('Technologies must be an array'),
  body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
  body('liveUrl').optional().isURL().withMessage('Invalid live URL'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
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

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    // Add new project
    portfolio.projects.push({
      title: req.body.title,
      description: req.body.description,
      technologies: req.body.technologies,
      githubUrl: req.body.githubUrl,
      liveUrl: req.body.liveUrl,
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true
    });

    await portfolio.save();

    res.json({
      success: true,
      message: 'Project added successfully',
      data: { project: portfolio.projects[portfolio.projects.length - 1] }
    });

  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding project'
    });
  }
});

// @route   DELETE /api/portfolios/user/projects/:projectId
// @desc    Remove project from user's portfolio
// @access  Private
router.delete('/user/projects/:projectId', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const projectIndex = portfolio.projects.findIndex(project => 
      project._id.toString() === req.params.projectId
    );

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    portfolio.projects.splice(projectIndex, 1);
    await portfolio.save();

    res.json({
      success: true,
      message: 'Project removed successfully'
    });

  } catch (error) {
    console.error('Remove project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing project'
    });
  }
});

// @route   PUT /api/portfolios/user/projects/:projectId
// @desc    Update project in user's portfolio
// @access  Private
router.put('/user/projects/:projectId', [
  auth,
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Project title must be between 1 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Project description must be between 10 and 1000 characters'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array'),
  body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
  body('liveUrl').optional().isURL().withMessage('Invalid live URL'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
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

    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    const projectIndex = portfolio.projects.findIndex(project => 
      project._id.toString() === req.params.projectId
    );

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update project
    Object.assign(portfolio.projects[projectIndex], req.body);
    await portfolio.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: portfolio.projects[projectIndex] }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project'
    });
  }
});

// @route   PUT /api/portfolios/user/interview-mode
// @desc    Update interview mode settings
// @access  Private
router.put('/user/interview-mode', [
  auth,
  body('enabled').optional().isBoolean().withMessage('Enabled must be a boolean'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate cannot be negative'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
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

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    // Update interview mode settings
    portfolio.interviewMode = { ...portfolio.interviewMode, ...req.body };
    await portfolio.save();

    res.json({
      success: true,
      message: 'Interview mode settings updated successfully',
      data: { interviewMode: portfolio.interviewMode }
    });

  } catch (error) {
    console.error('Update interview mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating interview mode settings'
    });
  }
});

// @route   GET /api/portfolios/search/mentors
// @desc    Search for mentors available for interviews
// @access  Public
router.get('/search/mentors', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = { 'interviewMode.enabled': true };
    
    // Apply additional filters
    if (req.query.skills) {
      const skills = req.query.skills.split(',');
      filters['interviewMode.skills'] = { $in: skills };
    }
    
    if (req.query.maxRate) {
      filters['interviewMode.hourlyRate'] = { $lte: parseFloat(req.query.maxRate) };
    }

    const mentors = await Portfolio.find(filters)
      .populate('user', 'firstName lastName username email')
      .skip(skip)
      .limit(limit)
      .sort({ 'codingStats.solvedProblems': -1 });

    const total = await Portfolio.countDocuments(filters);

    res.json({
      success: true,
      data: {
        mentors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalMentors: total,
          mentorsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Search mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching mentors'
    });
  }
});

module.exports = router;
