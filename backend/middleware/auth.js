const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Account is deactivated.'
      });
    }

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.'
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
          req.token = token;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth failed:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Role-based access control middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Admin access middleware
const admin = requireRole('admin');

// Community access middleware
const community = requireRole('admin', 'community');

// Personal access middleware
const personal = requireRole('admin', 'personal');

// User access middleware (any authenticated user)
const user = requireRole('admin', 'personal', 'community');

// Community admin middleware
const communityAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    const communityId = req.params.id || req.params.communityId;
    
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: 'Community ID is required.'
      });
    }

    // Import Community model here to avoid circular dependency
    const Community = require('../models/Community');
    
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found.'
      });
    }

    // Check if user is admin of the community
    const membership = community.members.find(member => 
      member.user.toString() === req.user.id && 
      member.isActive && 
      member.role === 'admin'
    );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Community admin privileges required.'
      });
    }

    req.community = community;
    next();
  } catch (error) {
    console.error('Community admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check.'
    });
  }
};

// Community moderator middleware
const communityModerator = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    const communityId = req.params.id || req.params.communityId;
    
    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: 'Community ID is required.'
      });
    }

    const Community = require('../models/Community');
    
    const community = await Community.findById(communityId);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found.'
      });
    }

    // Check if user is moderator or admin of the community
    const membership = community.members.find(member => 
      member.user.toString() === req.user.id && 
      member.isActive && 
      ['admin', 'moderator'].includes(member.role)
    );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Community moderator privileges required.'
      });
    }

    req.community = community;
    next();
  } catch (error) {
    console.error('Community moderator middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check.'
    });
  }
};

// Contest creator middleware
const contestCreator = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    const contestId = req.params.id || req.params.contestId;
    
    if (!contestId) {
      return res.status(400).json({
        success: false,
        message: 'Contest ID is required.'
      });
    }

    const Contest = require('../models/Contest');
    
    const contest = await Contest.findById(contestId);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found.'
      });
    }

    // Check if user is creator of the contest or admin
    if (contest.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Contest creator privileges required.'
      });
    }

    req.contest = contest;
    next();
  } catch (error) {
    console.error('Contest creator middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check.'
    });
  }
};

// Post author middleware
const postAuthor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    const postId = req.params.id || req.params.postId;
    
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required.'
      });
    }

    const Post = require('../models/Post');
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Check if user is author of the post, community moderator, or admin
    if (post.author.toString() !== req.user.id) {
      // Check if user is community moderator
      const Community = require('../models/Community');
      const community = await Community.findById(post.community);
      
      if (community) {
        const membership = community.members.find(member => 
          member.user.toString() === req.user.id && 
          member.isActive && 
          ['admin', 'moderator'].includes(member.role)
        );

        if (!membership && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Post author or moderator privileges required.'
          });
        }
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Post author privileges required.'
        });
      }
    }

    req.post = post;
    next();
  } catch (error) {
    console.error('Post author middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check.'
    });
  }
};

// Profile owner middleware
const profileOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    const userId = req.params.id || req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.'
      });
    }

    // Check if user is accessing their own profile or is admin
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Profile owner privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Profile owner middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check.'
    });
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = require('./security').authRateLimit;

// Export all middleware
module.exports = {
  auth,
  optionalAuth,
  requireRole,
  admin,
  community,
  personal,
  user,
  communityAdmin,
  communityModerator,
  contestCreator,
  postAuthor,
  profileOwner,
  authRateLimit
};
