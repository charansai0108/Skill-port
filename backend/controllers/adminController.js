const User = require('../models/User');
const Community = require('../models/Community');
const Contest = require('../models/Contest');
const logger = require('../config/logger');

// @desc    Get admin analytics
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'community-admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required.' 
      });
    }

    // Get basic stats
    const totalUsers = await User.countDocuments();
    const totalCommunities = await Community.countDocuments();
    const totalContests = await Contest.countDocuments();
    
    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCommunities,
        totalContests,
        usersByRole,
        recentUsers,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Get admin analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
