const express = require('express');
const { body, validationResult } = require('express-validator');
const Community = require('../models/Community');
const User = require('../models/User');
const Post = require('../models/Post');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/communities
// @desc    Get all communities with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'active' };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.privacy) filter.privacy = req.query.privacy;
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
      case 'members':
        sort = { memberCount: -1 };
        break;
      case 'activity':
        sort = { postCount: -1 };
        break;
      case 'recent':
        sort = { createdAt: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      default:
        sort = { memberCount: -1 };
    }

    // Get communities with pagination
    const communities = await Community.find(filter)
      .populate('createdBy', 'firstName lastName username profilePicture')
      .populate('members.user', 'firstName lastName username profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Community.countDocuments(filter);

    // Add user membership status if authenticated
    let communitiesWithMembership = communities;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        communitiesWithMembership = communities.map(community => {
          const communityObj = community.toObject();
          const membership = community.members.find(member => 
            member.user._id.toString() === userId && member.isActive
          );
          communityObj.isMember = !!membership;
          communityObj.userRole = membership ? membership.role : null;
          return communityObj;
        });
      } catch (error) {
        // Token invalid, continue without membership info
        communitiesWithMembership = communities.map(community => {
          const communityObj = community.toObject();
          communityObj.isMember = false;
          communityObj.userRole = null;
          return communityObj;
        });
      }
    }

    res.json({
      success: true,
      data: {
        communities: communitiesWithMembership,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCommunities: total,
          communitiesPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching communities'
    });
  }
});

// @route   GET /api/communities/:id
// @desc    Get community by ID with detailed information
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('createdBy', 'firstName lastName username profilePicture bio')
      .populate('members.user', 'firstName lastName username profilePicture')
      .populate('members.user', 'firstName lastName username profilePicture');

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    if (community.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Get recent posts
    const recentPosts = await Post.find({ 
      community: req.params.id, 
      status: 'active' 
    })
    .populate('author', 'firstName lastName username profilePicture')
    .sort({ createdAt: -1 })
    .limit(5);

    // Add user membership status if authenticated
    let communityWithMembership = community.toObject();
    communityWithMembership.recentPosts = recentPosts;
    communityWithMembership.isMember = false;
    communityWithMembership.userRole = null;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const membership = community.members.find(member => 
          member.user._id.toString() === userId && member.isActive
        );
        communityWithMembership.isMember = !!membership;
        communityWithMembership.userRole = membership ? membership.role : null;
      } catch (error) {
        // Token invalid, continue without membership info
      }
    }

    res.json({
      success: true,
      data: communityWithMembership
    });

  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community'
    });
  }
});

// @route   POST /api/communities
// @desc    Create a new community
// @access  Private
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Community name must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['algorithms', 'data-structures', 'web-development', 'mobile-development', 'ai-ml', 'system-design', 'other']).withMessage('Invalid category'),
  body('privacy').isIn(['public', 'private', 'invite-only']).withMessage('Invalid privacy setting'),
  body('maxMembers').optional().isInt({ min: 10, max: 10000 }).withMessage('Max members must be between 10 and 10000'),
  body('rules').optional().isArray().withMessage('Rules must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
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

    const { 
      name, 
      description, 
      shortDescription,
      category, 
      privacy, 
      maxMembers, 
      rules, 
      tags,
      image,
      banner
    } = req.body;

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'Community name already exists'
      });
    }

    // Create community
    const community = new Community({
      name,
      description,
      shortDescription,
      category,
      privacy,
      maxMembers: maxMembers || 1000,
      rules: rules || [],
      tags: tags || [],
      image,
      banner,
      createdBy: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin',
        joinedAt: new Date(),
        lastActivity: new Date()
      }]
    });

    await community.save();

    // Update user's communities
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        communities: {
          community: community._id,
          role: 'admin',
          joinedAt: new Date()
        }
      }
    });

    // Populate createdBy and members for response
    await community.populate('createdBy', 'firstName lastName username profilePicture');
    await community.populate('members.user', 'firstName lastName username profilePicture');

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: community
    });

  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating community'
    });
  }
});

// @route   PUT /api/communities/:id
// @desc    Update community
// @access  Private (Admin/Moderator)
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Community name must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['algorithms', 'data-structures', 'web-development', 'mobile-development', 'ai-ml', 'system-design', 'other']).withMessage('Invalid category'),
  body('privacy').optional().isIn(['public', 'private', 'invite-only']).withMessage('Invalid privacy setting'),
  body('maxMembers').optional().isInt({ min: 10, max: 10000 }).withMessage('Max members must be between 10 and 10000'),
  body('rules').optional().isArray().withMessage('Rules must be an array'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
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

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user has permission to update
    const membership = community.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!membership || !['admin', 'moderator'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this community'
      });
    }

    // Check if name is being changed and if it conflicts
    if (req.body.name && req.body.name !== community.name) {
      const existingCommunity = await Community.findOne({ 
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCommunity) {
        return res.status(400).json({
          success: false,
          message: 'Community name already exists'
        });
      }
    }

    // Update community
    const updatedCommunity = await Community.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'firstName lastName username profilePicture')
    .populate('members.user', 'firstName lastName username profilePicture');

    res.json({
      success: true,
      message: 'Community updated successfully',
      data: updatedCommunity
    });

  } catch (error) {
    console.error('Update community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating community'
    });
  }
});

// @route   POST /api/communities/:id/join
// @desc    Join a community
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    if (community.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Community is not active'
      });
    }

    // Check if user is already a member
    const isMember = community.members.some(member => 
      member.user.toString() === req.user.id && member.isActive
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this community'
      });
    }

    // Check if community is full
    if (community.members.filter(m => m.isActive).length >= community.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Community is full'
      });
    }

    // Add user to community
    community.members.push({
      user: req.user.id,
      role: 'member',
      joinedAt: new Date(),
      lastActivity: new Date()
    });

    await community.save();

    // Update user's communities
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        communities: {
          community: community._id,
          role: 'member',
          joinedAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully joined the community'
    });

  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while joining community'
    });
  }
});

// @route   POST /api/communities/:id/leave
// @desc    Leave a community
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Find user's membership
    const memberIndex = community.members.findIndex(member => 
      member.user.toString() === req.user.id && member.isActive
    );

    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this community'
      });
    }

    // Check if user is the only admin
    if (community.members[memberIndex].role === 'admin') {
      const adminCount = community.members.filter(m => m.role === 'admin' && m.isActive).length;
      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot leave community as you are the only admin'
        });
      }
    }

    // Mark member as inactive
    community.members[memberIndex].isActive = false;
    await community.save();

    // Remove from user's communities
    await User.findByIdAndUpdate(req.user.id, {
      $pull: {
        communities: { community: community._id }
      }
    });

    res.json({
      success: true,
      message: 'Successfully left the community'
    });

  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while leaving community'
    });
  }
});

// @route   POST /api/communities/:id/members/:userId/role
// @desc    Update member role (Admin only)
// @access  Private (Admin)
router.post('/:id/members/:userId/role', [
  auth,
  body('role').isIn(['member', 'moderator', 'admin']).withMessage('Invalid role')
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

    const { role } = req.body;
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is admin
    const userMembership = community.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!userMembership || userMembership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can change member roles'
      });
    }

    // Find target member
    const targetMemberIndex = community.members.findIndex(member => 
      member.user.toString() === req.params.userId && member.isActive
    );

    if (targetMemberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if trying to change own role
    if (req.params.userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    // Update role
    community.members[targetMemberIndex].role = role;
    await community.save();

    // Update user's community role
    await User.updateOne(
      { 
        _id: req.params.userId,
        'communities.community': community._id
      },
      {
        $set: {
          'communities.$.role': role
        }
      }
    );

    res.json({
      success: true,
      message: 'Member role updated successfully'
    });

  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating member role'
    });
  }
});

// @route   POST /api/communities/:id/add-member
// @desc    Add a member to a community by email
// @access  Private (Community Admin/Moderator)
router.post('/:id/add-member', [
  auth,
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('role').isIn(['member', 'moderator']).withMessage('Invalid role')
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

    const { email, role } = req.body;
    const communityId = req.params.id;

    // Find community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is admin of this community
    const userMembership = community.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!userMembership || userMembership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only community admins can add members'
      });
    }

    // Find user by ANY email (primary or additional)
    const user = await User.findByAnyEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address. User must add this email to their personal profile first.'
      });
    }

    // Check if user is already a member
    const existingMember = community.members.find(member => 
      member.user.toString() === user._id.toString()
    );

    if (existingMember) {
      if (existingMember.isActive) {
        return res.status(400).json({
          success: false,
          message: 'User is already an active member of this community'
        });
      } else {
        // Reactivate existing member
        existingMember.isActive = true;
        existingMember.role = role;
        existingMember.joinedAt = new Date();
        await community.save();
        
        return res.json({
          success: true,
          message: 'Member reactivated successfully',
          data: {
            member: {
              user: user._id,
              role: role,
              joinedAt: existingMember.joinedAt,
              isActive: true
            }
          }
        });
      }
    }

    // Add new member
    community.members.push({
      user: user._id,
      role: role,
      joinedAt: new Date(),
      isActive: true
    });

    // Update member count
    community.memberCount = community.members.filter(member => member.isActive).length;

    await community.save();

    res.json({
      success: true,
      message: 'Member added successfully',
      data: {
        member: {
          user: user._id,
          role: role,
          joinedAt: new Date(),
          isActive: true
        }
      }
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding member'
    });
  }
});

// @route   DELETE /api/communities/:id/members/:userId
// @desc    Remove member from community (Admin only)
// @access  Private (Admin)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is admin
    const userMembership = community.members.find(member => 
      member.user.toString() === req.user.id && member.isActive
    );
    
    if (!userMembership || userMembership.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove members'
      });
    }

    // Check if trying to remove self
    if (req.params.userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove yourself from the community'
      });
    }

    // Find target member
    const targetMemberIndex = community.members.findIndex(member => 
      member.user.toString() === req.params.userId && member.isActive
    );

    if (targetMemberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Mark member as inactive
    community.members[targetMemberIndex].isActive = false;
    await community.save();

    // Remove from user's communities
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: {
        communities: { community: community._id }
      }
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing member'
    });
  }
});

// @route   GET /api/communities/:id/members
// @desc    Get community members with pagination
// @access  Public
router.get('/:id/members', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const community = await Community.findById(req.params.id)
      .populate({
        path: 'members.user',
        select: 'firstName lastName username profilePicture bio',
        options: {
          skip: skip,
          limit: limit,
          sort: { 'members.joinedAt': 1 }
        }
      });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Filter active members
    const activeMembers = community.members.filter(member => member.isActive);
    const totalMembers = activeMembers.length;

    res.json({
      success: true,
      data: {
        members: activeMembers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalMembers / limit),
          totalMembers: totalMembers,
          membersPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community members'
    });
  }
});

// @route   GET /api/communities/:id/posts
// @desc    Get community posts with pagination
// @access  Public
router.get('/:id/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { 
      community: req.params.id, 
      status: 'active' 
    };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    // Build sort
    let sort = {};
    switch (req.query.sortBy) {
      case 'recent':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { 'likes.length': -1, createdAt: -1 };
        break;
      case 'comments':
        sort = { 'comments.length': -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const posts = await Post.find(filter)
      .populate('author', 'firstName lastName username profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          postsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community posts'
    });
  }
});

module.exports = router;
