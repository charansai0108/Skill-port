const express = require('express');
const admin = require('firebase-admin');
const Joi = require('joi');
const router = express.Router();

const db = admin.firestore();

// Input validation schemas
const userSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('personal', 'student', 'mentor', 'community-admin').required(),
    experience: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    bio: Joi.string().max(500).optional(),
    cgpa: Joi.number().min(0).max(4).optional()
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

// GET /users - Get user profile
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const userData = userDoc.data();
        res.json({
            success: true,
            user: {
                uid: userId,
                ...userData
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /users - Update user profile
router.put('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { error, value } = userSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const updateData = {
            ...value,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(userId).update(updateData);
        
        res.json({
            success: true,
            message: 'User profile updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /users/community/:communityId - Get users in a community
router.get('/community/:communityId', verifyToken, async (req, res) => {
    try {
        const { communityId } = req.params;
        const userRole = req.user.role;

        // Check if user has permission to view community users
        if (userRole !== 'community-admin' && userRole !== 'mentor') {
            return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }

        const usersSnapshot = await db.collection('users')
            .where('community', '==', communityId)
            .get();

        const users = [];
        usersSnapshot.forEach(doc => {
            users.push({
                uid: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get community users error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /users/create - Create user document (called after OTP verification)
router.post('/create', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { error, value } = userSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const userData = {
            ...value,
            uid: userId,
            emailVerified: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(userId).set(userData);
        
        res.json({
            success: true,
            message: 'User created successfully',
            user: userData
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /users - Delete user account
router.delete('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;

        // Delete user document
        await db.collection('users').doc(userId).delete();
        
        // Delete user from Firebase Auth
        await admin.auth().deleteUser(userId);
        
        res.json({
            success: true,
            message: 'User account deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
