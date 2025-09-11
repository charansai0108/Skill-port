const express = require('express');
const admin = require('firebase-admin');
const Joi = require('joi');
const router = express.Router();

const db = admin.firestore();

// Input validation schemas
const notificationSchema = Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid('welcome', 'contest_start', 'contest_end', 'submission_evaluated', 'community_invite', 'mentor_feedback', 'achievement').required(),
    title: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(1000).required(),
    data: Joi.object().optional(),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium')
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

// GET /notifications - Get user notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { limit = 20, offset = 0, unreadOnly = false } = req.query;
        
        let query = db.collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(parseInt(limit))
            .offset(parseInt(offset));

        if (unreadOnly === 'true') {
            query = query.where('read', '==', false);
        }

        const notificationsSnapshot = await query.get();
        const notifications = [];
        
        notificationsSnapshot.forEach(doc => {
            notifications.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Get unread count
        const unreadSnapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        res.json({
            success: true,
            notifications,
            unreadCount: unreadSnapshot.size,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: notifications.length === parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /notifications - Create notification
router.post('/', verifyToken, async (req, res) => {
    try {
        const { error, value } = notificationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const notificationData = {
            ...value,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const notificationRef = await db.collection('notifications').add(notificationData);
        
        res.json({
            success: true,
            message: 'Notification created successfully',
            notification: {
                id: notificationRef.id,
                ...notificationData
            }
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /notifications/:id/read - Mark notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const notificationDoc = await db.collection('notifications').doc(id).get();
        
        if (!notificationDoc.exists) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        const notificationData = notificationDoc.data();
        
        // Check if user owns this notification
        if (notificationData.userId !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: 'You can only mark your own notifications as read' 
            });
        }

        await db.collection('notifications').doc(id).update({
            read: true,
            readAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /notifications/read-all - Mark all notifications as read
router.put('/read-all', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        
        const unreadNotificationsSnapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        const batch = db.batch();
        unreadNotificationsSnapshot.forEach(doc => {
            batch.update(doc.ref, {
                read: true,
                readAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        
        res.json({
            success: true,
            message: `${unreadNotificationsSnapshot.size} notifications marked as read`
        });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /notifications/:id - Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const notificationDoc = await db.collection('notifications').doc(id).get();
        
        if (!notificationDoc.exists) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        const notificationData = notificationDoc.data();
        
        // Check if user owns this notification
        if (notificationData.userId !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: 'You can only delete your own notifications' 
            });
        }

        await db.collection('notifications').doc(id).delete();
        
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /notifications/bulk - Send bulk notifications
router.post('/bulk', verifyToken, async (req, res) => {
    try {
        const { userIds, type, title, message, data, priority } = req.body;
        
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'userIds must be a non-empty array' 
            });
        }

        const batch = db.batch();
        const notifications = [];

        userIds.forEach(userId => {
            const notificationRef = db.collection('notifications').doc();
            const notificationData = {
                userId,
                type,
                title,
                message,
                data: data || {},
                priority: priority || 'medium',
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            
            batch.set(notificationRef, notificationData);
            notifications.push({
                id: notificationRef.id,
                ...notificationData
            });
        });

        await batch.commit();
        
        res.json({
            success: true,
            message: `${notifications.length} notifications sent successfully`,
            notifications
        });
    } catch (error) {
        console.error('Send bulk notifications error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /notifications/stats - Get notification statistics
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        
        const notificationsSnapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .get();

        let totalCount = 0;
        let unreadCount = 0;
        const typeStats = {};

        notificationsSnapshot.forEach(doc => {
            const data = doc.data();
            totalCount += 1;
            
            if (!data.read) {
                unreadCount += 1;
            }
            
            if (!typeStats[data.type]) {
                typeStats[data.type] = 0;
            }
            typeStats[data.type] += 1;
        });

        res.json({
            success: true,
            stats: {
                totalCount,
                unreadCount,
                readCount: totalCount - unreadCount,
                typeStats
            }
        });
    } catch (error) {
        console.error('Get notification stats error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
