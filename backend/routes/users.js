const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Community = require('../models/Community');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const Analytics = require('../models/Analytics');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('communities.community', 'name description category privacy')
      .populate('assignedContests.contest', 'name description startDate endDate')
      .select('-password -emailVerificationToken -emailVerificationExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user analytics
    let analytics = await Analytics.findOne({ user: req.user.id });
    if (!analytics) {
      // Create analytics if doesn't exist
      analytics = new Analytics({ user: req.user.id });
      await analytics.save();
    }

    // Get user's communities
    const userCommunities = await Community.find({
      'members.user': req.user.id,
      'members.isActive': true
    }).select('name description category privacy memberCount');

    // Get user's contest participations
    const userContests = await Contest.find({
      'participants.user': req.user.id
    }).select('name description status startDate endDate');

    const profileData = {
      ...user.toObject(),
      analytics: analytics,
      communities: userCommunities,
      contests: userContests
    };

    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('profilePicture').optional().isURL().withMessage('Invalid profile picture URL'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
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
      firstName, 
      lastName, 
      bio, 
      phoneNumber, 
      profilePicture, 
      skills, 
      preferences 
    } = req.body;

    // Build update object
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio) updateData.bio = bio;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (skills) updateData.skills = skills;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -emailVerificationExpires');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (public profile)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('communities.community', 'name description category')
      .select('-password -emailVerificationToken -emailVerificationExpires -phoneNumber -preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check privacy settings
    if (user.preferences?.privacy?.profileVisibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Profile is private'
      });
    }

    // Get public analytics
    const analytics = await Analytics.findOne({ user: req.params.id })
      .select('contestStats.problemsSolved contestStats.contestsWon communityStats.communitiesJoined skillProgress achievements');

    // Get public communities
    const publicCommunities = await Community.find({
      'members.user': req.params.id,
      'members.isActive': true,
      privacy: 'public'
    }).select('name description category memberCount');

    const publicProfile = {
      ...user.toObject(),
      analytics: analytics,
      communities: publicCommunities
    };

    res.json({
      success: true,
      data: publicProfile
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const analytics = await Analytics.findOne({ user: req.params.id });
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'User statistics not found'
      });
    }

    // Get contest participation
    const contestStats = await Contest.aggregate([
      {
        $match: {
          'participants.user': req.params.id
        }
      },
      {
        $group: {
          _id: null,
          totalContests: { $sum: 1 },
          contestsWon: {
            $sum: {
              $cond: [
                { $eq: ['$participants.rank', 1] },
                1,
                0
              ]
            }
          },
          averageRank: { $avg: '$participants.rank' },
          totalScore: { $sum: '$participants.score' }
        }
      }
    ]);

    // Get community participation
    const communityStats = await Community.aggregate([
      {
        $match: {
          'members.user': req.params.id,
          'members.isActive': true
        }
      },
      {
        $group: {
          _id: null,
          totalCommunities: { $sum: 1 },
          adminCommunities: {
            $sum: {
              $cond: [
                { $eq: ['$members.role', 'admin'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = {
      analytics: analytics,
      contests: contestStats[0] || {
        totalContests: 0,
        contestsWon: 0,
        averageRank: 0,
        totalScore: 0
      },
      communities: communityStats[0] || {
        totalCommunities: 0,
        adminCommunities: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

// @route   GET /api/users/:id/contests
// @desc    Get user's contest history
// @access  Public
router.get('/:id/contests', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contests = await Contest.find({
      'participants.user': req.params.id
    })
    .populate('createdBy', 'firstName lastName username')
    .populate('community', 'name description')
    .select('name description status startDate endDate participants')
    .sort({ startDate: -1 })
    .skip(skip)
    .limit(limit);

    // Add user's participation details
    const contestsWithParticipation = contests.map(contest => {
      const contestObj = contest.toObject();
      const participation = contest.participants.find(participant => 
        participant.user.toString() === req.params.id
      );
      
      contestObj.userParticipation = {
        score: participation ? participation.score : 0,
        rank: participation ? participation.rank : null,
        problemsSolved: participation ? participation.problemsSolved : 0,
        joinedAt: participation ? participation.joinedAt : null
      };
      
      return contestObj;
    });

    const total = await Contest.countDocuments({
      'participants.user': req.params.id
    });

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
    console.error('Get user contests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user contests'
    });
  }
});

// @route   GET /api/users/:id/communities
// @desc    Get user's communities
// @access  Public
router.get('/:id/communities', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const communities = await Community.find({
      'members.user': req.params.id,
      'members.isActive': true
    })
    .populate('createdBy', 'firstName lastName username')
    .select('name description category privacy memberCount postCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Add user's role in each community
    const communitiesWithRole = communities.map(community => {
      const communityObj = community.toObject();
      const membership = community.members.find(member => 
        member.user.toString() === req.params.id
      );
      
      communityObj.userRole = membership ? membership.role : 'member';
      communityObj.joinedAt = membership ? membership.joinedAt : null;
      
      return communityObj;
    });

    const total = await Community.countDocuments({
      'members.user': req.params.id,
      'members.isActive': true
    });

    res.json({
      success: true,
      data: {
        communities: communitiesWithRole,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCommunities: total,
          communitiesPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get user communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user communities'
    });
  }
});

// @route   GET /api/users/:id/submissions
// @desc    Get user's submission history
// @access  Private (own submissions) / Public (if profile is public)
router.get('/:id/submissions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user can access submissions
    let canAccess = false;
    
    if (req.params.id === req.user?.id) {
      canAccess = true; // Own submissions
    } else {
      // Check if profile is public
      const user = await User.findById(req.params.id).select('preferences');
      if (user && user.preferences?.privacy?.profileVisibility === 'public') {
        canAccess = true;
      }
    }

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to these submissions'
      });
    }

    const submissions = await Submission.find({
      user: req.params.id
    })
    .populate('contest', 'name')
    .populate('problem', 'title difficulty category')
    .select('status score executionTime memoryUsed submittedAt language')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Submission.countDocuments({
      user: req.params.id
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
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user submissions'
    });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', auth, async (req, res) => {
  try {
    // Check if trying to follow self
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const isFollowing = req.user.following && req.user.following.includes(req.params.id);
    if (isFollowing) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Add to following
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: req.params.id }
    });

    // Add to followers
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.id }
    });

    res.json({
      success: true,
      message: 'Successfully followed user'
    });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while following user'
    });
  }
});

// @route   POST /api/users/:id/unfollow
// @desc    Unfollow a user
// @access  Private
router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    // Check if trying to unfollow self
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unfollow yourself'
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if following
    const isFollowing = req.user.following && req.user.following.includes(req.params.id);
    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user'
      });
    }

    // Remove from following
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id }
    });

    // Remove from followers
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.id }
    });

    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unfollowing user'
    });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get users that this user is following
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id).select('following');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const following = await User.find({
      _id: { $in: user.following }
    })
    .select('firstName lastName username profilePicture bio')
    .skip(skip)
    .limit(limit);

    const total = user.following.length;

    res.json({
      success: true,
      data: {
        following,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalFollowing: total,
          followingPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching following'
    });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get users following this user
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.id).select('followers');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const followers = await User.find({
      _id: { $in: user.followers }
    })
    .select('firstName lastName username profilePicture bio')
    .skip(skip)
    .limit(limit);

    const total = user.followers.length;

    res.json({
      success: true,
      data: {
        followers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalFollowers: total,
          followersPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching followers'
    });
  }
});

// @route   POST /api/users/add-email
// @desc    Add additional email to user profile
// @access  Private
router.post('/add-email', [
  auth,
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('label').isIn(['college', 'university', 'company', 'other']).withMessage('Invalid email label')
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

    const { email, label } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email already exists (primary or additional)
    const existingUser = await User.findByAnyEmail(email);
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered with another account'
      });
    }

    // Check if email is already in additional emails
    const emailExists = user.additionalEmails.some(ae => ae.email === email.toLowerCase());
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'This email is already added to your profile'
      });
    }

    // Add new email
    user.additionalEmails.push({
      email: email.toLowerCase(),
      label: label || 'other',
      isVerified: false,
      addedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Additional email added successfully',
      data: {
        additionalEmails: user.additionalEmails
      }
    });

  } catch (error) {
    console.error('Add email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding email'
    });
  }
});

// @route   DELETE /api/users/remove-email
// @desc    Remove additional email from user profile
// @access  Private
router.delete('/remove-email/:emailId', auth, async (req, res) => {
  try {
    const { emailId } = req.params;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove email
    user.additionalEmails = user.additionalEmails.filter(ae => ae._id.toString() !== emailId);
    await user.save();

    res.json({
      success: true,
      message: 'Email removed successfully',
      data: {
        additionalEmails: user.additionalEmails
      }
    });

  } catch (error) {
    console.error('Remove email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing email'
    });
  }
});

// @route   DELETE /api/users/profile
// @desc    Delete current user account
// @access  Private
router.delete('/profile', auth, async (req, res) => {
  try {
    // Check if user has active communities as admin
    const adminCommunities = await Community.find({
      'members.user': req.user.id,
      'members.role': 'admin',
      'members.isActive': true
    });

    if (adminCommunities.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account while being admin of active communities'
      });
    }

    // Check if user has active contests as creator
    const createdContests = await Contest.find({
      createdBy: req.user.id,
      status: { $in: ['draft', 'published', 'active'] }
    });

    if (createdContests.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account while having active contests'
      });
    }

    // Remove user from all communities
    await Community.updateMany(
      { 'members.user': req.user.id },
      { $pull: { members: { user: req.user.id } } }
    );

    // Remove user from all contests
    await Contest.updateMany(
      { 'participants.user': req.user.id },
      { $pull: { participants: { user: req.user.id } } }
    );

    // Delete user's analytics
    await Analytics.findOneAndDelete({ user: req.user.id });

    // Delete user's submissions
    await Submission.deleteMany({ user: req.user.id });

    // Delete user account
    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
});

module.exports = router;
