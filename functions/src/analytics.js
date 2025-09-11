const express = require('express');
const admin = require('firebase-admin');
const Joi = require('joi');
const router = express.Router();

const db = admin.firestore();

// Input validation schemas
const analyticsQuerySchema = Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    community: Joi.string().optional(),
    contest: Joi.string().optional(),
    granularity: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly').default('daily')
});

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        const userData = userDoc.data();
        if (userData.role !== 'community-admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Admin access required' 
            });
        }
        
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// GET /analytics/overview - Get platform overview analytics
router.get('/overview', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { error, value } = analyticsQuerySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const { startDate, endDate, community, contest } = value;
        
        const analytics = await generateOverviewAnalytics(startDate, endDate, community, contest);
        
        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        console.error('Get overview analytics error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /analytics/users - Get user analytics
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { error, value } = analyticsQuerySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const { startDate, endDate, community, granularity } = value;
        
        const userAnalytics = await generateUserAnalytics(startDate, endDate, community, granularity);
        
        res.json({
            success: true,
            analytics: userAnalytics
        });
    } catch (error) {
        console.error('Get user analytics error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /analytics/contests - Get contest analytics
router.get('/contests', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { error, value } = analyticsQuerySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const { startDate, endDate, community, granularity } = value;
        
        const contestAnalytics = await generateContestAnalytics(startDate, endDate, community, granularity);
        
        res.json({
            success: true,
            analytics: contestAnalytics
        });
    } catch (error) {
        console.error('Get contest analytics error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /analytics/submissions - Get submission analytics
router.get('/submissions', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { error, value } = analyticsQuerySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const { startDate, endDate, community, contest, granularity } = value;
        
        const submissionAnalytics = await generateSubmissionAnalytics(startDate, endDate, community, contest, granularity);
        
        res.json({
            success: true,
            analytics: submissionAnalytics
        });
    } catch (error) {
        console.error('Get submission analytics error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /analytics/performance - Get performance metrics
router.get('/performance', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { startDate, endDate, community } = req.query;
        
        const performanceMetrics = await generatePerformanceMetrics(startDate, endDate, community);
        
        res.json({
            success: true,
            metrics: performanceMetrics
        });
    } catch (error) {
        console.error('Get performance metrics error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Helper function to generate overview analytics
async function generateOverviewAnalytics(startDate, endDate, community, contest) {
    const dateFilter = buildDateFilter(startDate, endDate);
    
    // Get total users
    const totalUsersSnapshot = await db.collection('users').get();
    const totalUsers = totalUsersSnapshot.size;
    
    // Get new users in date range
    let newUsersQuery = db.collection('users');
    if (dateFilter) {
        newUsersQuery = newUsersQuery.where('createdAt', '>=', dateFilter.start).where('createdAt', '<=', dateFilter.end);
    }
    const newUsersSnapshot = await newUsersQuery.get();
    const newUsers = newUsersSnapshot.size;
    
    // Get total communities
    const totalCommunitiesSnapshot = await db.collection('communities').get();
    const totalCommunities = totalCommunitiesSnapshot.size;
    
    // Get total contests
    let contestsQuery = db.collection('contests');
    if (community) {
        contestsQuery = contestsQuery.where('community', '==', community);
    }
    if (contest) {
        contestsQuery = contestsQuery.where('__name__', '==', contest);
    }
    const totalContestsSnapshot = await contestsQuery.get();
    const totalContests = totalContestsSnapshot.size;
    
    // Get total submissions
    let submissionsQuery = db.collection('submissions');
    if (dateFilter) {
        submissionsQuery = submissionsQuery.where('createdAt', '>=', dateFilter.start).where('createdAt', '<=', dateFilter.end);
    }
    if (community) {
        submissionsQuery = submissionsQuery.where('community', '==', community);
    }
    if (contest) {
        submissionsQuery = submissionsQuery.where('contestId', '==', contest);
    }
    const totalSubmissionsSnapshot = await submissionsQuery.get();
    const totalSubmissions = totalSubmissionsSnapshot.size;
    
    // Get active users (users with submissions in date range)
    const activeUsers = new Set();
    totalSubmissionsSnapshot.forEach(doc => {
        activeUsers.add(doc.data().userId);
    });
    
    return {
        users: {
            total: totalUsers,
            new: newUsers,
            active: activeUsers.size
        },
        communities: {
            total: totalCommunities
        },
        contests: {
            total: totalContests
        },
        submissions: {
            total: totalSubmissions
        },
        engagement: {
            activeUserRate: totalUsers > 0 ? (activeUsers.size / totalUsers * 100).toFixed(2) : 0
        }
    };
}

// Helper function to generate user analytics
async function generateUserAnalytics(startDate, endDate, community, granularity) {
    const dateFilter = buildDateFilter(startDate, endDate);
    
    // Get user registrations over time
    let usersQuery = db.collection('users');
    if (dateFilter) {
        usersQuery = usersQuery.where('createdAt', '>=', dateFilter.start).where('createdAt', '<=', dateFilter.end);
    }
    const usersSnapshot = await usersQuery.get();
    
    const userRegistrations = groupByTime(usersSnapshot.docs, 'createdAt', granularity);
    
    // Get user roles distribution
    const roleDistribution = {};
    usersSnapshot.forEach(doc => {
        const role = doc.data().role || 'personal';
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });
    
    // Get user experience distribution
    const experienceDistribution = {};
    usersSnapshot.forEach(doc => {
        const experience = doc.data().experience || 'beginner';
        experienceDistribution[experience] = (experienceDistribution[experience] || 0) + 1;
    });
    
    return {
        registrations: userRegistrations,
        roleDistribution,
        experienceDistribution
    };
}

// Helper function to generate contest analytics
async function generateContestAnalytics(startDate, endDate, community, granularity) {
    const dateFilter = buildDateFilter(startDate, endDate);
    
    // Get contests over time
    let contestsQuery = db.collection('contests');
    if (dateFilter) {
        contestsQuery = contestsQuery.where('createdAt', '>=', dateFilter.start).where('contestsQuery', '<=', dateFilter.end);
    }
    if (community) {
        contestsQuery = contestsQuery.where('community', '==', community);
    }
    const contestsSnapshot = await contestsQuery.get();
    
    const contestCreation = groupByTime(contestsSnapshot.docs, 'createdAt', granularity);
    
    // Get contest status distribution
    const statusDistribution = {};
    contestsSnapshot.forEach(doc => {
        const status = doc.data().status || 'upcoming';
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });
    
    // Get contest difficulty distribution
    const difficultyDistribution = {};
    contestsSnapshot.forEach(doc => {
        const difficulty = doc.data().difficulty || 'mixed';
        difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;
    });
    
    return {
        creation: contestCreation,
        statusDistribution,
        difficultyDistribution
    };
}

// Helper function to generate submission analytics
async function generateSubmissionAnalytics(startDate, endDate, community, contest, granularity) {
    const dateFilter = buildDateFilter(startDate, endDate);
    
    // Get submissions over time
    let submissionsQuery = db.collection('submissions');
    if (dateFilter) {
        submissionsQuery = submissionsQuery.where('createdAt', '>=', dateFilter.start).where('createdAt', '<=', dateFilter.end);
    }
    if (community) {
        submissionsQuery = submissionsQuery.where('community', '==', community);
    }
    if (contest) {
        submissionsQuery = submissionsQuery.where('contestId', '==', contest);
    }
    const submissionsSnapshot = await submissionsQuery.get();
    
    const submissionTrends = groupByTime(submissionsSnapshot.docs, 'createdAt', granularity);
    
    // Get platform distribution
    const platformDistribution = {};
    submissionsSnapshot.forEach(doc => {
        const platform = doc.data().platform || 'unknown';
        platformDistribution[platform] = (platformDistribution[platform] || 0) + 1;
    });
    
    // Get language distribution
    const languageDistribution = {};
    submissionsSnapshot.forEach(doc => {
        const language = doc.data().language || 'unknown';
        languageDistribution[language] = (languageDistribution[language] || 0) + 1;
    });
    
    // Get difficulty distribution
    const difficultyDistribution = {};
    submissionsSnapshot.forEach(doc => {
        const difficulty = doc.data().difficulty || 'unknown';
        difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;
    });
    
    return {
        trends: submissionTrends,
        platformDistribution,
        languageDistribution,
        difficultyDistribution
    };
}

// Helper function to generate performance metrics
async function generatePerformanceMetrics(startDate, endDate, community) {
    const dateFilter = buildDateFilter(startDate, endDate);
    
    // Get submissions with performance data
    let submissionsQuery = db.collection('submissions');
    if (dateFilter) {
        submissionsQuery = submissionsQuery.where('createdAt', '>=', dateFilter.start).where('createdAt', '<=', dateFilter.end);
    }
    if (community) {
        submissionsQuery = submissionsQuery.where('community', '==', community);
    }
    const submissionsSnapshot = await submissionsQuery.get();
    
    let totalExecutionTime = 0;
    let totalMemoryUsed = 0;
    let submissionsWithPerformance = 0;
    
    submissionsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.executionTime && data.memoryUsed) {
            totalExecutionTime += data.executionTime;
            totalMemoryUsed += data.memoryUsed;
            submissionsWithPerformance += 1;
        }
    });
    
    const averageExecutionTime = submissionsWithPerformance > 0 ? totalExecutionTime / submissionsWithPerformance : 0;
    const averageMemoryUsed = submissionsWithPerformance > 0 ? totalMemoryUsed / submissionsWithPerformance : 0;
    
    return {
        averageExecutionTime: Math.round(averageExecutionTime * 100) / 100,
        averageMemoryUsed: Math.round(averageMemoryUsed * 100) / 100,
        submissionsWithPerformance,
        totalSubmissions: submissionsSnapshot.size
    };
}

// Helper function to build date filter
function buildDateFilter(startDate, endDate) {
    if (!startDate && !endDate) {
        return null;
    }
    
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    
    return { start, end };
}

// Helper function to group documents by time
function groupByTime(docs, field, granularity) {
    const groups = {};
    
    docs.forEach(doc => {
        const timestamp = doc.data()[field];
        if (!timestamp) return;
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const key = formatDateByGranularity(date, granularity);
        
        if (!groups[key]) {
            groups[key] = 0;
        }
        groups[key] += 1;
    });
    
    return groups;
}

// Helper function to format date by granularity
function formatDateByGranularity(date, granularity) {
    switch (granularity) {
        case 'hourly':
            return date.toISOString().slice(0, 13) + ':00:00Z';
        case 'daily':
            return date.toISOString().slice(0, 10);
        case 'weekly':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            return weekStart.toISOString().slice(0, 10);
        case 'monthly':
            return date.toISOString().slice(0, 7);
        default:
            return date.toISOString().slice(0, 10);
    }
}

module.exports = router;
