const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Scheduled function to generate daily analytics
 * Runs every day at 2 AM UTC
 */
exports.dailyAnalytics = functions.pubsub
    .schedule('0 2 * * *')
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Starting daily analytics generation...');
        
        try {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Generate analytics for yesterday
            const analytics = await generateDailyAnalytics(yesterday);
            
            // Store analytics in Firestore
            await db.collection('analytics').doc(yesterday.toISOString().split('T')[0]).set({
                date: yesterday,
                type: 'daily',
                data: analytics,
                generatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Daily analytics generated successfully for:', yesterday.toISOString().split('T')[0]);
            return null;
        } catch (error) {
            console.error('Error generating daily analytics:', error);
            throw error;
        }
    });

/**
 * Scheduled function to clean up expired OTPs
 * Runs every hour
 */
exports.cleanupExpiredOtps = functions.pubsub
    .schedule('0 * * * *')
    .timeZone('UTC')
    .onRun(async (context) => {
        console.log('Starting OTP cleanup...');
        
        try {
            const now = Date.now();
            const expiredOtps = await db.collection('otps')
                .where('expiry', '<', now)
                .get();
            
            const batch = db.batch();
            expiredOtps.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            console.log(`Cleaned up ${expiredOtps.size} expired OTPs`);
            return null;
        } catch (error) {
            console.error('Error cleaning up expired OTPs:', error);
            throw error;
        }
    });

/**
 * Generate daily analytics data
 */
async function generateDailyAnalytics(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const analytics = {
        users: {
            total: 0,
            new: 0,
            active: 0
        },
        communities: {
            total: 0,
            new: 0
        },
        contests: {
            total: 0,
            new: 0,
            active: 0,
            completed: 0
        },
        submissions: {
            total: 0,
            new: 0
        }
    };
    
    // Get total users
    const totalUsersSnapshot = await db.collection('users').get();
    analytics.users.total = totalUsersSnapshot.size;
    
    // Get new users (created yesterday)
    const newUsersSnapshot = await db.collection('users')
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .get();
    analytics.users.new = newUsersSnapshot.size;
    
    // Get total communities
    const totalCommunitiesSnapshot = await db.collection('communities').get();
    analytics.communities.total = totalCommunitiesSnapshot.size;
    
    // Get new communities (created yesterday)
    const newCommunitiesSnapshot = await db.collection('communities')
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .get();
    analytics.communities.new = newCommunitiesSnapshot.size;
    
    // Get total contests
    const totalContestsSnapshot = await db.collection('contests').get();
    analytics.contests.total = totalContestsSnapshot.size;
    
    // Get new contests (created yesterday)
    const newContestsSnapshot = await db.collection('contests')
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .get();
    analytics.contests.new = newContestsSnapshot.size;
    
    // Get active contests
    const activeContestsSnapshot = await db.collection('contests')
        .where('status', '==', 'active')
        .get();
    analytics.contests.active = activeContestsSnapshot.size;
    
    // Get completed contests
    const completedContestsSnapshot = await db.collection('contests')
        .where('status', '==', 'completed')
        .get();
    analytics.contests.completed = completedContestsSnapshot.size;
    
    // Get total submissions
    const totalSubmissionsSnapshot = await db.collection('submissions').get();
    analytics.submissions.total = totalSubmissionsSnapshot.size;
    
    // Get new submissions (created yesterday)
    const newSubmissionsSnapshot = await db.collection('submissions')
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .get();
    analytics.submissions.new = newSubmissionsSnapshot.size;
    
    return analytics;
}

module.exports = {
    dailyAnalytics: exports.dailyAnalytics,
    cleanupExpiredOtps: exports.cleanupExpiredOtps
};
