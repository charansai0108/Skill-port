/**
 * Community API Routes
 * Provides endpoints for community dashboard data
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Community = require('../models/Community');
const User = require('../models/User');
const Contest = require('../models/Contest');

// Get community summary statistics
router.get('/:id/summary', protect, async (req, res) => {
    try {
        const communityId = req.params.id;
        
        // Verify user has access to this community
        if (req.user.role !== 'community-admin' && req.user.community !== communityId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied to this community'
            });
        }

        // Get community data
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({
                success: false,
                error: 'Community not found'
            });
        }

        // Get user statistics
        const totalUsers = await User.countDocuments({ community: communityId });
        const usersThisWeek = await User.countDocuments({
            community: communityId,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // Get mentor statistics
        const totalMentors = await User.countDocuments({ 
            community: communityId, 
            role: 'mentor' 
        });
        const mentorsThisMonth = await User.countDocuments({
            community: communityId,
            role: 'mentor',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        // Get contest statistics
        const activeContests = await Contest.countDocuments({ 
            community: communityId, 
            status: 'active' 
        });
        const contestsThisMonth = await Contest.countDocuments({
            community: communityId,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        // Get problems solved statistics (mock data for now)
        const totalSolved = await User.aggregate([
            { $match: { community: communityId } },
            { $group: { _id: null, total: { $sum: '$totalPoints' } } }
        ]);

        const solvedThisWeek = await User.aggregate([
            { 
                $match: { 
                    community: communityId,
                    lastActivity: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPoints' } } }
        ]);

        res.json({
            success: true,
            data: {
                userStats: {
                    total: totalUsers,
                    growth: usersThisWeek
                },
                roleStats: {
                    mentors: totalMentors,
                    mentorGrowth: mentorsThisMonth
                },
                contestStats: {
                    active: activeContests,
                    growth: contestsThisMonth
                },
                submissionStats: {
                    totalSolved: totalSolved[0]?.total || 0,
                    growth: solvedThisWeek[0]?.total || 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching community summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch community summary'
        });
    }
});

// Get recent activity
router.get('/:id/recent-activity', protect, async (req, res) => {
    try {
        const communityId = req.params.id;
        
        // Verify user has access to this community
        if (req.user.role !== 'community-admin' && req.user.community !== communityId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied to this community'
            });
        }

        // Mock recent activity data (in real app, this would come from an Activity model)
        const activities = [
            {
                type: 'user_created',
                description: 'New user joined the community',
                timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                userId: 'mock-user-id'
            },
            {
                type: 'contest_created',
                description: 'New contest "Array Problems" created',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                contestId: 'mock-contest-id'
            },
            {
                type: 'mentor_assigned',
                description: 'Mentor assigned to contest',
                timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                mentorId: 'mock-mentor-id'
            }
        ];

        res.json({
            success: true,
            data: {
                activities: activities
            }
        });

    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent activity'
        });
    }
});

// Get recent users
router.get('/:id/users', protect, async (req, res) => {
    try {
        const communityId = req.params.id;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || '-createdAt';
        
        // Verify user has access to this community
        if (req.user.role !== 'community-admin' && req.user.community !== communityId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied to this community'
            });
        }

        const users = await User.find({ community: communityId })
            .select('firstName lastName email createdAt role status')
            .sort(sort)
            .limit(limit);

        res.json({
            success: true,
            data: {
                users: users
            }
        });

    } catch (error) {
        console.error('Error fetching recent users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent users'
        });
    }
});

// Get recent mentors
router.get('/:id/mentors', protect, async (req, res) => {
    try {
        const communityId = req.params.id;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || '-createdAt';
        
        // Verify user has access to this community
        if (req.user.role !== 'community-admin' && req.user.community !== communityId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied to this community'
            });
        }

        const mentors = await User.find({ 
            community: communityId, 
            role: 'mentor' 
        })
            .select('firstName lastName email createdAt status skills contestPerformance')
            .sort(sort)
            .limit(limit);

        res.json({
            success: true,
            data: {
                mentors: mentors
            }
        });

    } catch (error) {
        console.error('Error fetching recent mentors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent mentors'
        });
    }
});

// Get community insights
router.get('/:id/insights', protect, async (req, res) => {
    try {
        const communityId = req.params.id;
        
        // Verify user has access to this community
        if (req.user.role !== 'community-admin' && req.user.community !== communityId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied to this community'
            });
        }

        // Get today's active users
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeUsersToday = await User.countDocuments({
            community: communityId,
            lastActivity: { $gte: today }
        });

        // Get new registrations today
        const newRegistrations = await User.countDocuments({
            community: communityId,
            createdAt: { $gte: today }
        });

        // Mock data for posts and submissions (would come from actual models)
        const communityPosts = Math.floor(Math.random() * 20) + 5;
        const contestSubmissions = Math.floor(Math.random() * 50) + 10;

        res.json({
            success: true,
            data: {
                activeUsersToday: activeUsersToday,
                newRegistrations: newRegistrations,
                communityPosts: communityPosts,
                contestSubmissions: contestSubmissions
            }
        });

    } catch (error) {
        console.error('Error fetching community insights:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch community insights'
        });
    }
});

module.exports = router;
