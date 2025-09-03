const express = require('express');
const { body, validationResult } = require('express-validator');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Community = require('../models/Community');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const Post = require('../models/Post');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get user dashboard analytics
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ user: req.user.id });
    
    if (!analytics) {
      // Create analytics if doesn't exist
      analytics = new Analytics({ user: req.user.id });
      await analytics.save();
    }

    // Get recent activity
    const recentSubmissions = await Submission.find({ user: req.user.id })
      .populate('contest', 'name')
      .populate('problem', 'title difficulty category')
      .sort({ submittedAt: -1 })
      .limit(5);

    const recentPosts = await Post.find({ author: req.user.id })
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming contests
    const upcomingContests = await Contest.find({
      'participants.user': req.user.id,
      status: 'published',
      startDate: { $gte: new Date() }
    })
    .select('name startDate endDate duration')
    .sort({ startDate: 1 })
    .limit(5);

    // Get community activity
    const userCommunities = await Community.find({
      'members.user': req.user.id,
      'members.isActive': true
    }).select('name memberCount postCount');

    // Calculate streak information
    const now = new Date();
    const lastLogin = analytics.streaks.lastLoginDate;
    let currentStreak = analytics.streaks.currentLoginStreak;
    
    if (lastLogin) {
      const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        // Consecutive day
        currentStreak = analytics.streaks.currentLoginStreak;
      } else if (daysDiff > 1) {
        // Streak broken
        currentStreak = 0;
      }
    }

    const dashboardData = {
      overview: {
        totalProblemsSolved: analytics.problemStats.problemsSolved,
        totalContests: analytics.contestStats.totalContests,
        contestsWon: analytics.contestStats.contestsWon,
        communitiesJoined: analytics.communityStats.communitiesJoined,
        currentStreak: currentStreak,
        longestStreak: analytics.streaks.longestLoginStreak
      },
      performance: {
        successRate: analytics.problemStats.successRate,
        averageTime: analytics.problemStats.averageTime,
        averageMemory: analytics.problemStats.averageMemory,
        accuracy: analytics.performanceMetrics.accuracy
      },
      recentActivity: {
        submissions: recentSubmissions,
        posts: recentPosts
      },
      upcoming: {
        contests: upcomingContests
      },
      communities: userCommunities,
      achievements: analytics.achievements.slice(0, 5),
      skillProgress: analytics.skillProgress.slice(0, 5)
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard analytics'
    });
  }
});

// @route   GET /api/analytics/admin
// @desc    Get admin dashboard analytics
// @access  Private (Admin only)
router.get('/admin', [protect, authorize('community-admin')], async (req, res) => {
  try {
    // Get system-wide statistics
    const totalUsers = await User.countDocuments();
    const totalCommunities = await Community.countDocuments({ status: 'active' });
    const totalContests = await Contest.countDocuments({ status: { $in: ['published', 'active', 'completed'] } });
    const totalSubmissions = await Submission.countDocuments();

    // Get recent registrations
    const recentUsers = await User.find()
      .select('firstName lastName username email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent communities
    const recentCommunities = await Community.find({ status: 'active' })
      .populate('createdBy', 'firstName lastName username')
      .select('name description category memberCount createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent contests
    const recentContests = await Contest.find({ status: { $in: ['published', 'active', 'completed'] } })
      .populate('createdBy', 'firstName lastName username')
      .select('name type difficulty participants status startDate endDate')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get contest participation stats
    const contestStats = await Contest.aggregate([
      {
        $match: {
          status: { $in: ['published', 'active', 'completed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalContests: { $sum: 1 },
          totalParticipants: { $sum: { $size: '$participants' } },
          averageParticipants: { $avg: { $size: '$participants' } }
        }
      }
    ]);

    // Get community growth
    const communityGrowth = await Community.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top performing users
    const topUsers = await Analytics.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          username: '$userInfo.username',
          firstName: '$userInfo.firstName',
          lastName: '$userInfo.lastName',
          problemsSolved: '$problemStats.problemsSolved',
          contestsWon: '$contestStats.contestsWon',
          totalScore: '$contestStats.totalScore'
        }
      },
      {
        $sort: { problemsSolved: -1, contestsWon: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get top communities
    const topCommunities = await Community.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $project: {
          name: 1,
          memberCount: 1,
          postCount: 1,
          contestCount: 1,
          createdAt: 1
        }
      },
      {
        $sort: { memberCount: -1, postCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const adminData = {
      overview: {
        totalUsers,
        totalCommunities,
        totalContests,
        totalSubmissions
      },
      recent: {
        users: recentUsers,
        communities: recentCommunities,
        contests: recentContests
      },
      growth: {
        users: userGrowth,
        communities: communityGrowth
      },
      performance: {
        contests: contestStats[0] || {
          totalContests: 0,
          totalParticipants: 0,
          averageParticipants: 0
        },
        topUsers,
        topCommunities
      }
    };

    res.json({
      success: true,
      data: adminData
    });

  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin analytics'
    });
  }
});

// @route   GET /api/analytics/community/:id
// @desc    Get community analytics
// @access  Private (Community members)
router.get('/community/:id', protect, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check if user is member
    const isMember = community.members.some(member => 
      member.user.toString() === req.user.id && member.isActive
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to view community analytics'
      });
    }

    // Get member statistics
    const memberStats = await User.aggregate([
      {
        $match: {
          'communities.community': community._id
        }
      },
      {
        $group: {
          _id: null,
          totalMembers: { $sum: 1 },
          activeMembers: {
            $sum: {
              $cond: [
                { $gt: ['$lastActive', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get post statistics
    const postStats = await Post.aggregate([
      {
        $match: { community: community._id }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } }
        }
      }
    ]);

    // Get contest statistics
    const contestStats = await Contest.aggregate([
      {
        $match: { community: community._id }
      },
      {
        $group: {
          _id: null,
          totalContests: { $sum: 1 },
          activeContests: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'active'] },
                1,
                0
              ]
            }
          },
          totalParticipants: { $sum: { $size: '$participants' } }
        }
      }
    ]);

    // Get recent activity
    const recentPosts = await Post.find({ community: community._id })
      .populate('author', 'firstName lastName username profilePicture')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentContests = await Contest.find({ community: community._id })
      .select('name status startDate endDate participants')
      .sort({ startDate: -1 })
      .limit(5);

    // Get top contributors
    const topContributors = await Post.aggregate([
      {
        $match: { community: community._id }
      },
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 },
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          username: '$userInfo.username',
          firstName: '$userInfo.firstName',
          lastName: '$userInfo.lastName',
          profilePicture: '$userInfo.profilePicture',
          postCount: 1,
          totalLikes: 1,
          totalComments: 1
        }
      },
      {
        $sort: { postCount: -1, totalLikes: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const communityData = {
      overview: {
        name: community.name,
        memberCount: community.memberCount,
        postCount: community.postCount,
        contestCount: community.contestCount
      },
      statistics: {
        members: memberStats[0] || { totalMembers: 0, activeMembers: 0 },
        posts: postStats[0] || { totalPosts: 0, totalLikes: 0, totalComments: 0 },
        contests: contestStats[0] || { totalContests: 0, activeContests: 0, totalParticipants: 0 }
      },
      recent: {
        posts: recentPosts,
        contests: recentContests
      },
      topContributors
    };

    res.json({
      success: true,
      data: communityData
    });

  } catch (error) {
    console.error('Get community analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community analytics'
    });
  }
});

// @route   GET /api/analytics/contest/:id
// @desc    Get contest analytics
// @access  Public (for published contests) / Private (for participants)
router.get('/contest/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Check if user can access analytics
    let canAccess = false;
    
    if (contest.status === 'published' || contest.status === 'active' || contest.status === 'completed') {
      canAccess = true;
    } else if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Check if user is participant or creator
        const isParticipant = contest.participants.some(participant => 
          participant.user.toString() === userId
        );
        const isCreator = contest.createdBy.toString() === userId;
        canAccess = isParticipant || isCreator;
      } catch (error) {
        // Token invalid
      }
    }

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to contest analytics'
      });
    }

    // Get participant statistics
    const participantStats = {
      total: contest.participants.length,
      active: contest.participants.filter(p => !p.isDisqualified).length,
      disqualified: contest.participants.filter(p => p.isDisqualified).length
    };

    // Get problem statistics
    const problemStats = await Submission.aggregate([
      {
        $match: { contest: contest._id }
      },
      {
        $group: {
          _id: '$problem',
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'accepted'] },
                1,
                0
              ]
            }
          },
          averageScore: { $avg: '$score' },
          averageTime: { $avg: '$executionTime' }
        }
      },
      {
        $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: '_id',
          as: 'problemInfo'
        }
      },
      {
        $unwind: '$problemInfo'
      },
      {
        $project: {
          title: '$problemInfo.title',
          difficulty: '$problemInfo.difficulty',
          category: '$problemInfo.category',
          totalSubmissions: 1,
          acceptedSubmissions: 1,
          acceptanceRate: {
            $multiply: [
              { $divide: ['$acceptedSubmissions', '$totalSubmissions'] },
              100
            ]
          },
          averageScore: 1,
          averageTime: 1
        }
      }
    ]);

    // Get language statistics
    const languageStats = await Submission.aggregate([
      {
        $match: { contest: contest._id }
      },
      {
        $group: {
          _id: '$language',
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'accepted'] },
                1,
                0
              ]
            }
          },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $project: {
          language: '$_id',
          totalSubmissions: 1,
          acceptedSubmissions: 1,
          acceptanceRate: {
            $multiply: [
              { $divide: ['$acceptedSubmissions', '$totalSubmissions'] },
              100
            ]
          },
          averageScore: 1
        }
      },
      {
        $sort: { totalSubmissions: -1 }
      }
    ]);

    // Get time-based statistics
    const timeStats = await Submission.aggregate([
      {
        $match: { contest: contest._id }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d %H:00",
              date: "$submittedAt"
            }
          },
          submissions: { $sum: 1 },
          accepted: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'accepted'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const contestData = {
      overview: {
        name: contest.name,
        status: contest.status,
        startDate: contest.startDate,
        endDate: contest.endDate,
        duration: contest.duration
      },
      participants: participantStats,
      problems: problemStats,
      languages: languageStats,
      timeAnalysis: timeStats
    };

    res.json({
      success: true,
      data: contestData
    });

  } catch (error) {
    console.error('Get contest analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contest analytics'
    });
  }
});

// @route   POST /api/analytics/update
// @desc    Update user analytics (called after actions)
// @access  Private
router.post('/update', protect, async (req, res) => {
  try {
    const { action, data } = req.body;

    let analytics = await Analytics.findOne({ user: req.user.id });
    if (!analytics) {
      analytics = new Analytics({ user: req.user.id });
    }

    switch (action) {
      case 'login':
        await analytics.updateStreaks('login');
        break;
      
      case 'solve_problem':
        await analytics.updateProblemStats(data);
        await analytics.updateStreaks('solve_problem');
        break;
      
      case 'contest_participation':
        await analytics.updateContestStats(data);
        break;
      
      case 'community_action':
        await analytics.updateCommunityStats(data.action, data);
        break;
      
      case 'skill_progress':
        await analytics.updateSkillProgress(data.skill, data.progress, data.problemsSolved);
        break;
      
      case 'language_usage':
        await analytics.updateLanguageStats(data.language, data);
        break;
      
      case 'achievement_earned':
        await analytics.addAchievement(data);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    await analytics.save();

    res.json({
      success: true,
      message: 'Analytics updated successfully'
    });

  } catch (error) {
    console.error('Update analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating analytics'
    });
  }
});

// @route   GET /api/analytics/leaderboard
// @desc    Get global leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || 'problemsSolved';
    let sortField = '';

    switch (sortBy) {
      case 'problemsSolved':
        sortField = 'problemStats.problemsSolved';
        break;
      case 'contestsWon':
        sortField = 'contestStats.contestsWon';
        break;
      case 'totalScore':
        sortField = 'contestStats.totalScore';
        break;
      case 'streak':
        sortField = 'streaks.longestLoginStreak';
        break;
      default:
        sortField = 'problemStats.problemsSolved';
    }

    const leaderboard = await Analytics.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          username: '$userInfo.username',
          firstName: '$userInfo.firstName',
          lastName: '$userInfo.lastName',
          profilePicture: '$userInfo.profilePicture',
          problemsSolved: '$problemStats.problemsSolved',
          contestsWon: '$contestStats.contestsWon',
          totalScore: '$contestStats.totalScore',
          longestStreak: '$streaks.longestLoginStreak',
          communitiesJoined: '$communityStats.communitiesJoined'
        }
      },
      {
        $sort: { [sortField]: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    const total = await Analytics.countDocuments();

    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
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
