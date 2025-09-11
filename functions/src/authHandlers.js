const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

/**
 * Triggered when a new user is created in Firebase Auth
 * Creates a corresponding user document in Firestore
 */
exports.createUserTrigger = functions.auth.user().onCreate(async (user) => {
    console.log('New user created:', user.uid);
    
    try {
        // Create user document in Firestore
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            emailVerified: user.emailVerified,
            provider: user.providerData[0]?.providerId || 'email',
            role: 'personal', // Default role
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(user.uid).set(userData);
        
        console.log('User document created successfully for:', user.uid);
        
        // Send welcome notification
        await sendWelcomeNotification(user.uid, user.email);
        
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
});

/**
 * Triggered when a user is deleted from Firebase Auth
 * Cleans up user data from Firestore
 */
exports.onDeleteUser = functions.auth.user().onDelete(async (user) => {
    console.log('User deleted:', user.uid);
    
    try {
        const batch = db.batch();
        
        // Delete user document
        const userRef = db.collection('users').doc(user.uid);
        batch.delete(userRef);
        
        // Delete user's submissions
        const submissionsSnapshot = await db.collection('submissions')
            .where('userId', '==', user.uid)
            .get();
        
        submissionsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Delete user's notifications
        const notificationsSnapshot = await db.collection('notifications')
            .where('userId', '==', user.uid)
            .get();
        
        notificationsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Remove user from communities
        const communitiesSnapshot = await db.collection('communities')
            .where('members', 'array-contains', user.uid)
            .get();
        
        communitiesSnapshot.forEach(doc => {
            const communityData = doc.data();
            const updatedMembers = communityData.members.filter(memberId => memberId !== user.uid);
            const updatedMentors = communityData.mentors?.filter(mentorId => mentorId !== user.uid) || [];
            const updatedStudents = communityData.students?.filter(studentId => studentId !== user.uid) || [];
            
            batch.update(doc.ref, {
                members: updatedMembers,
                mentors: updatedMentors,
                students: updatedStudents,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        
        // Remove user from contests
        const contestsSnapshot = await db.collection('contests')
            .where('participants', 'array-contains', user.uid)
            .get();
        
        contestsSnapshot.forEach(doc => {
            const contestData = doc.data();
            const updatedParticipants = contestData.participants.filter(participantId => participantId !== user.uid);
            
            batch.update(doc.ref, {
                participants: updatedParticipants,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        
        console.log('User data cleaned up successfully for:', user.uid);
        
    } catch (error) {
        console.error('Error cleaning up user data:', error);
        throw error;
    }
});

/**
 * Send welcome notification to new user
 */
async function sendWelcomeNotification(userId, email) {
    try {
        const notificationData = {
            userId,
            type: 'welcome',
            title: 'Welcome to SkillPort!',
            message: `Welcome to SkillPort! We're excited to have you join our community of learners and mentors.`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('notifications').add(notificationData);
        
        console.log('Welcome notification sent to:', userId);
    } catch (error) {
        console.error('Error sending welcome notification:', error);
        // Don't throw error as this is not critical
    }
}

module.exports = {
    createUserTrigger: exports.createUserTrigger,
    onDeleteUser: exports.onDeleteUser
};
