const express = require('express');
const admin = require('firebase-admin');
const Joi = require('joi');
const router = express.Router();

const db = admin.firestore();

// Input validation schemas
const leaderboardQuerySchema = Joi.object({
    community: Joi.string().optional(),
    contest: Joi.string().optional(),
    timeRange: Joi.string().valid('daily', 'weekly', 'monthly', 'all').default('all'),
    limit: Joi.number().min(1).max(100).default(50),
    offset: Joi.number().min(0).default(0)
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

// GET /leaderboard - Get global leaderboard
router.get('/', verifyToken, async (req, res) => {
    try {
        const { error, value } = leaderboardQuerySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const { community, contest, timeRange, limit, offset } = value;
        
        let leaderboardData = [];
        
        if (contest) {
            // Contest-specific leaderboard
            leaderboardData = await getContestLeaderboard(contest, limit, offset);
        } else if (community) {
            // Community-specific leaderboard
            leaderboardData = await getCommunityLeaderboard(community, timeRange, limit, offset);
        } else {
            // Global leaderboard
            leaderboardData = await getGlobalLeaderboard(timeRange, limit, offset);
        }

        res.json({
            success: true,
            leaderboard: leaderboardData,
            pagination: {
                limit,
                offset,
                hasMore: leaderboardData.length === limit
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /leaderboard/user/:userId - Get user's ranking
router.get('/user/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { community, contest, timeRange } = req.query;
        
        let userRanking = null;
        
        if (contest) {
            userRanking = await getUserContestRanking(userId, contest);
        } else if (community) {
            userRanking = await getUserCommunityRanking(userId, community, timeRange);
        } else {
            userRanking = await getUserGlobalRanking(userId, timeRange);
        }

        if (!userRanking) {
            return res.status(404).json({ success: false, error: 'User ranking not found' });
        }

        res.json({
            success: true,
            ranking: userRanking
        });
    } catch (error) {
        console.error('Get user ranking error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Helper function to get global leaderboard
async function getGlobalLeaderboard(timeRange, limit, offset) {
    const startDate = getStartDate(timeRange);
    
    // Get user submissions with scores
    const submissionsSnapshot = await db.collection('submissions')
        .where('createdAt', '>=', startDate)
        .where('status', '==', 'evaluated')
        .get();

    // Calculate scores per user
    const userScores = {};
    submissionsSnapshot.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        
        if (!userScores[userId]) {
            userScores[userId] = {
                userId,
                totalScore: 0,
                submissionCount: 0,
                averageScore: 0
            };
        }
        
        userScores[userId].totalScore += data.score || 0;
        userScores[userId].submissionCount += 1;
    });

    // Calculate average scores
    Object.values(userScores).forEach(user => {
        user.averageScore = user.totalScore / user.submissionCount;
    });

    // Sort by average score
    const sortedUsers = Object.values(userScores)
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(offset, offset + limit);

    // Get user details
    const leaderboard = await Promise.all(
        sortedUsers.map(async (user, index) => {
            const userDoc = await db.collection('users').doc(user.userId).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            
            return {
                rank: offset + index + 1,
                userId: user.userId,
                displayName: userData.displayName || 'Anonymous',
                photoURL: userData.photoURL || '',
                totalScore: user.totalScore,
                submissionCount: user.submissionCount,
                averageScore: Math.round(user.averageScore * 100) / 100
            };
        })
    );

    return leaderboard;
}

// Helper function to get community leaderboard
async function getCommunityLeaderboard(communityId, timeRange, limit, offset) {
    const startDate = getStartDate(timeRange);
    
    // Get community members
    const communityDoc = await db.collection('communities').doc(communityId).get();
    if (!communityDoc.exists) {
        throw new Error('Community not found');
    }
    
    const communityData = communityDoc.data();
    const memberIds = communityData.members || [];
    
    // Get submissions from community members
    const submissionsSnapshot = await db.collection('submissions')
        .where('community', '==', communityId)
        .where('createdAt', '>=', startDate)
        .where('status', '==', 'evaluated')
        .get();

    // Calculate scores per user
    const userScores = {};
    submissionsSnapshot.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        
        if (memberIds.includes(userId)) {
            if (!userScores[userId]) {
                userScores[userId] = {
                    userId,
                    totalScore: 0,
                    submissionCount: 0,
                    averageScore: 0
                };
            }
            
            userScores[userId].totalScore += data.score || 0;
            userScores[userId].submissionCount += 1;
        }
    });

    // Calculate average scores
    Object.values(userScores).forEach(user => {
        user.averageScore = user.totalScore / user.submissionCount;
    });

    // Sort by average score
    const sortedUsers = Object.values(userScores)
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(offset, offset + limit);

    // Get user details
    const leaderboard = await Promise.all(
        sortedUsers.map(async (user, index) => {
            const userDoc = await db.collection('users').doc(user.userId).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            
            return {
                rank: offset + index + 1,
                userId: user.userId,
                displayName: userData.displayName || 'Anonymous',
                photoURL: userData.photoURL || '',
                totalScore: user.totalScore,
                submissionCount: user.submissionCount,
                averageScore: Math.round(user.averageScore * 100) / 100
            };
        })
    );

    return leaderboard;
}

// Helper function to get contest leaderboard
async function getContestLeaderboard(contestId, limit, offset) {
    // Get contest submissions
    const submissionsSnapshot = await db.collection('submissions')
        .where('contestId', '==', contestId)
        .where('status', '==', 'evaluated')
        .orderBy('score', 'desc')
        .orderBy('createdAt', 'asc')
        .limit(limit)
        .offset(offset)
        .get();

    // Get user details for each submission
    const leaderboard = await Promise.all(
        submissionsSnapshot.docs.map(async (doc, index) => {
            const data = doc.data();
            const userDoc = await db.collection('users').doc(data.userId).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            
            return {
                rank: offset + index + 1,
                userId: data.userId,
                displayName: userData.displayName || 'Anonymous',
                photoURL: userData.photoURL || '',
                score: data.score,
                submissionId: doc.id,
                submittedAt: data.createdAt,
                executionTime: data.executionTime,
                memoryUsed: data.memoryUsed
            };
        })
    );

    return leaderboard;
}

// Helper function to get user's global ranking
async function getUserGlobalRanking(userId, timeRange) {
    const startDate = getStartDate(timeRange);
    
    // Get all user submissions
    const submissionsSnapshot = await db.collection('submissions')
        .where('userId', '==', userId)
        .where('createdAt', '>=', startDate)
        .where('status', '==', 'evaluated')
        .get();

    let totalScore = 0;
    let submissionCount = 0;
    
    submissionsSnapshot.forEach(doc => {
        const data = doc.data();
        totalScore += data.score || 0;
        submissionCount += 1;
    });

    const averageScore = submissionCount > 0 ? totalScore / submissionCount : 0;
    
    // Count users with higher average scores
    const allSubmissionsSnapshot = await db.collection('submissions')
        .where('createdAt', '>=', startDate)
        .where('status', '==', 'evaluated')
        .get();

    const userScores = {};
    allSubmissionsSnapshot.forEach(doc => {
        const data = doc.data();
        const uid = data.userId;
        
        if (!userScores[uid]) {
            userScores[uid] = { totalScore: 0, count: 0 };
        }
        
        userScores[uid].totalScore += data.score || 0;
        userScores[uid].count += 1;
    });

    let rank = 1;
    Object.values(userScores).forEach(user => {
        const userAvg = user.totalScore / user.count;
        if (userAvg > averageScore) {
            rank += 1;
        }
    });

    return {
        userId,
        rank,
        totalScore,
        submissionCount,
        averageScore: Math.round(averageScore * 100) / 100
    };
}

// Helper function to get user's community ranking
async function getUserCommunityRanking(userId, communityId, timeRange) {
    const startDate = getStartDate(timeRange);
    
    // Get community members
    const communityDoc = await db.collection('communities').doc(communityId).get();
    if (!communityDoc.exists) {
        throw new Error('Community not found');
    }
    
    const communityData = communityDoc.data();
    const memberIds = communityData.members || [];
    
    if (!memberIds.includes(userId)) {
        throw new Error('User is not a member of this community');
    }
    
    // Get user's submissions in this community
    const userSubmissionsSnapshot = await db.collection('submissions')
        .where('userId', '==', userId)
        .where('community', '==', communityId)
        .where('createdAt', '>=', startDate)
        .where('status', '==', 'evaluated')
        .get();

    let totalScore = 0;
    let submissionCount = 0;
    
    userSubmissionsSnapshot.forEach(doc => {
        const data = doc.data();
        totalScore += data.score || 0;
        submissionCount += 1;
    });

    const averageScore = submissionCount > 0 ? totalScore / submissionCount : 0;
    
    // Calculate rank among community members
    const communitySubmissionsSnapshot = await db.collection('submissions')
        .where('community', '==', communityId)
        .where('createdAt', '>=', startDate)
        .where('status', '==', 'evaluated')
        .get();

    const memberScores = {};
    communitySubmissionsSnapshot.forEach(doc => {
        const data = doc.data();
        const uid = data.userId;
        
        if (memberIds.includes(uid)) {
            if (!memberScores[uid]) {
                memberScores[uid] = { totalScore: 0, count: 0 };
            }
            
            memberScores[uid].totalScore += data.score || 0;
            memberScores[uid].count += 1;
        }
    });

    let rank = 1;
    Object.values(memberScores).forEach(member => {
        const memberAvg = member.totalScore / member.count;
        if (memberAvg > averageScore) {
            rank += 1;
        }
    });

    return {
        userId,
        communityId,
        rank,
        totalScore,
        submissionCount,
        averageScore: Math.round(averageScore * 100) / 100
    };
}

// Helper function to get user's contest ranking
async function getUserContestRanking(userId, contestId) {
    // Get user's submission in this contest
    const userSubmissionSnapshot = await db.collection('submissions')
        .where('userId', '==', userId)
        .where('contestId', '==', contestId)
        .where('status', '==', 'evaluated')
        .get();

    if (userSubmissionSnapshot.empty) {
        return null;
    }

    const userSubmission = userSubmissionSnapshot.docs[0];
    const userScore = userSubmission.data().score || 0;
    
    // Count submissions with higher scores
    const higherScoreSnapshot = await db.collection('submissions')
        .where('contestId', '==', contestId)
        .where('status', '==', 'evaluated')
        .where('score', '>', userScore)
        .get();

    const rank = higherScoreSnapshot.size + 1;

    return {
        userId,
        contestId,
        rank,
        score: userScore,
        submissionId: userSubmission.id
    };
}

// Helper function to get start date based on time range
function getStartDate(timeRange) {
    const now = new Date();
    
    switch (timeRange) {
        case 'daily':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        case 'weekly':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            return weekStart;
        case 'monthly':
            return new Date(now.getFullYear(), now.getMonth(), 1);
        default:
            return new Date(0); // All time
    }
}

module.exports = router;
