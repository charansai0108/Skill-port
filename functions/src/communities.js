const express = require('express');
const admin = require('firebase-admin');
const Joi = require('joi');
const router = express.Router();

const db = admin.firestore();

// Input validation schemas
const communitySchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    code: Joi.string().min(3).max(20).required(),
    description: Joi.string().max(500).optional(),
    settings: Joi.object({
        allowStudentRegistration: Joi.boolean().default(true),
        requireApproval: Joi.boolean().default(false),
        maxStudents: Joi.number().min(1).max(1000).optional()
    }).optional()
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

// GET /communities - Get all communities
router.get('/', verifyToken, async (req, res) => {
    try {
        const communitiesSnapshot = await db.collection('communities')
            .orderBy('createdAt', 'desc')
            .get();

        const communities = [];
        communitiesSnapshot.forEach(doc => {
            communities.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            communities
        });
    } catch (error) {
        console.error('Get communities error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /communities/:id - Get specific community
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const communityDoc = await db.collection('communities').doc(id).get();
        
        if (!communityDoc.exists) {
            return res.status(404).json({ success: false, error: 'Community not found' });
        }

        res.json({
            success: true,
            community: {
                id: communityDoc.id,
                ...communityDoc.data()
            }
        });
    } catch (error) {
        console.error('Get community error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /communities - Create new community
router.post('/', verifyToken, async (req, res) => {
    try {
        const { error, value } = communitySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const userId = req.user.uid;
        
        // Check if user is admin
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (userData.role !== 'community-admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Only community admins can create communities' 
            });
        }

        // Check if community code already exists
        const existingCommunity = await db.collection('communities')
            .where('code', '==', value.code)
            .get();

        if (!existingCommunity.empty) {
            return res.status(400).json({ 
                success: false, 
                error: 'Community code already exists' 
            });
        }

        const communityData = {
            ...value,
            admin: userId,
            members: [userId],
            mentors: [],
            students: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const communityRef = await db.collection('communities').add(communityData);
        
        // Update user's community
        await db.collection('users').doc(userId).update({
            community: communityRef.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Community created successfully',
            community: {
                id: communityRef.id,
                ...communityData
            }
        });
    } catch (error) {
        console.error('Create community error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /communities/:id - Update community
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = communitySchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const userId = req.user.uid;
        
        // Check if user is community admin
        const communityDoc = await db.collection('communities').doc(id).get();
        if (!communityDoc.exists) {
            return res.status(404).json({ success: false, error: 'Community not found' });
        }

        const communityData = communityDoc.data();
        if (communityData.admin !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: 'Only community admin can update community' 
            });
        }

        const updateData = {
            ...value,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('communities').doc(id).update(updateData);
        
        res.json({
            success: true,
            message: 'Community updated successfully'
        });
    } catch (error) {
        console.error('Update community error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /communities/:id/join - Join community
router.post('/:id/join', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const communityDoc = await db.collection('communities').doc(id).get();
        if (!communityDoc.exists) {
            return res.status(404).json({ success: false, error: 'Community not found' });
        }

        const communityData = communityDoc.data();
        
        // Check if user is already a member
        if (communityData.members.includes(userId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'User is already a member of this community' 
            });
        }

        // Add user to community
        await db.collection('communities').doc(id).update({
            members: admin.firestore.FieldValue.arrayUnion(userId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update user's community
        await db.collection('users').doc(userId).update({
            community: id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Successfully joined community'
        });
    } catch (error) {
        console.error('Join community error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /communities/:id - Delete community
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const communityDoc = await db.collection('communities').doc(id).get();
        if (!communityDoc.exists) {
            return res.status(404).json({ success: false, error: 'Community not found' });
        }

        const communityData = communityDoc.data();
        if (communityData.admin !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: 'Only community admin can delete community' 
            });
        }

        // Delete community
        await db.collection('communities').doc(id).delete();
        
        res.json({
            success: true,
            message: 'Community deleted successfully'
        });
    } catch (error) {
        console.error('Delete community error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
