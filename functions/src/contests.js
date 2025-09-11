const express = require('express');
const admin = require('firebase-admin');
const Joi = require('joi');
const router = express.Router();

const db = admin.firestore();

// Input validation schemas
const contestSchema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    community: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    rules: Joi.array().items(Joi.string()).optional(),
    prizes: Joi.array().items(Joi.object({
        position: Joi.number().required(),
        description: Joi.string().required(),
        value: Joi.string().optional()
    })).optional(),
    maxParticipants: Joi.number().min(1).max(1000).optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'mixed').default('mixed')
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

// GET /contests - Get contests
router.get('/', verifyToken, async (req, res) => {
    try {
        const { community, status } = req.query;
        let query = db.collection('contests');

        if (community) {
            query = query.where('community', '==', community);
        }

        if (status) {
            query = query.where('status', '==', status);
        }

        const contestsSnapshot = await query
            .orderBy('createdAt', 'desc')
            .get();

        const contests = [];
        contestsSnapshot.forEach(doc => {
            contests.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            contests
        });
    } catch (error) {
        console.error('Get contests error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /contests/:id - Get specific contest
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const contestDoc = await db.collection('contests').doc(id).get();
        
        if (!contestDoc.exists) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        res.json({
            success: true,
            contest: {
                id: contestDoc.id,
                ...contestDoc.data()
            }
        });
    } catch (error) {
        console.error('Get contest error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /contests - Create new contest
router.post('/', verifyToken, async (req, res) => {
    try {
        const { error, value } = contestSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const userId = req.user.uid;
        
        // Check if user can create contests (mentor or admin)
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (!['mentor', 'community-admin'].includes(userData.role)) {
            return res.status(403).json({ 
                success: false, 
                error: 'Only mentors and admins can create contests' 
            });
        }

        // Check if user belongs to the community
        if (userData.community !== value.community) {
            return res.status(403).json({ 
                success: false, 
                error: 'You can only create contests in your community' 
            });
        }

        const contestData = {
            ...value,
            createdBy: userId,
            status: 'upcoming',
            participants: [],
            submissions: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const contestRef = await db.collection('contests').add(contestData);
        
        res.json({
            success: true,
            message: 'Contest created successfully',
            contest: {
                id: contestRef.id,
                ...contestData
            }
        });
    } catch (error) {
        console.error('Create contest error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /contests/:id - Update contest
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = contestSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const userId = req.user.uid;
        
        // Check if user can update contest
        const contestDoc = await db.collection('contests').doc(id).get();
        if (!contestDoc.exists) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        const contestData = contestDoc.data();
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (contestData.createdBy !== userId && userData.role !== 'community-admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Only contest creator or admin can update contest' 
            });
        }

        const updateData = {
            ...value,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('contests').doc(id).update(updateData);
        
        res.json({
            success: true,
            message: 'Contest updated successfully'
        });
    } catch (error) {
        console.error('Update contest error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /contests/:id/join - Join contest
router.post('/:id/join', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const contestDoc = await db.collection('contests').doc(id).get();
        if (!contestDoc.exists) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        const contestData = contestDoc.data();
        
        // Check if contest is still accepting participants
        if (contestData.status !== 'upcoming' && contestData.status !== 'active') {
            return res.status(400).json({ 
                success: false, 
                error: 'Contest is not accepting new participants' 
            });
        }

        // Check if user is already a participant
        if (contestData.participants.includes(userId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'User is already a participant in this contest' 
            });
        }

        // Check max participants
        if (contestData.maxParticipants && contestData.participants.length >= contestData.maxParticipants) {
            return res.status(400).json({ 
                success: false, 
                error: 'Contest has reached maximum participants' 
            });
        }

        // Add user to contest
        await db.collection('contests').doc(id).update({
            participants: admin.firestore.FieldValue.arrayUnion(userId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Successfully joined contest'
        });
    } catch (error) {
        console.error('Join contest error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /contests/:id/start - Start contest
router.post('/:id/start', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const contestDoc = await db.collection('contests').doc(id).get();
        if (!contestDoc.exists) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        const contestData = contestDoc.data();
        
        // Check if user can start contest
        if (contestData.createdBy !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: 'Only contest creator can start contest' 
            });
        }

        if (contestData.status !== 'upcoming') {
            return res.status(400).json({ 
                success: false, 
                error: 'Contest is not in upcoming status' 
            });
        }

        // Start contest
        await db.collection('contests').doc(id).update({
            status: 'active',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Contest started successfully'
        });
    } catch (error) {
        console.error('Start contest error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /contests/:id/end - End contest
router.post('/:id/end', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const contestDoc = await db.collection('contests').doc(id).get();
        if (!contestDoc.exists) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        const contestData = contestDoc.data();
        
        // Check if user can end contest
        if (contestData.createdBy !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: 'Only contest creator can end contest' 
            });
        }

        if (contestData.status !== 'active') {
            return res.status(400).json({ 
                success: false, 
                error: 'Contest is not active' 
            });
        }

        // End contest
        await db.collection('contests').doc(id).update({
            status: 'completed',
            endedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Contest ended successfully'
        });
    } catch (error) {
        console.error('End contest error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /contests/:id - Delete contest
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const contestDoc = await db.collection('contests').doc(id).get();
        if (!contestDoc.exists) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        const contestData = contestDoc.data();
        
        // Check if user can delete contest
        if (contestData.createdBy !== userId) {
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            
            if (userData.role !== 'community-admin') {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Only contest creator or admin can delete contest' 
                });
            }
        }

        // Delete contest
        await db.collection('contests').doc(id).delete();
        
        res.json({
            success: true,
            message: 'Contest deleted successfully'
        });
    } catch (error) {
        console.error('Delete contest error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
