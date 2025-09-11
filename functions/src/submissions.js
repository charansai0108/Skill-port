const express = require('express');
const admin = require('firebase-admin');
const Joi = require('joi');
const router = express.Router();

const db = admin.firestore();

// Input validation schemas
const submissionSchema = Joi.object({
    contestId: Joi.string().required(),
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    code: Joi.string().max(10000).optional(),
    language: Joi.string().max(20).optional(),
    platform: Joi.string().valid('leetcode', 'geeksforgeeks', 'hackerrank', 'interviewbit').optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
    executionTime: Joi.number().min(0).optional(),
    memoryUsed: Joi.number().min(0).optional(),
    verdict: Joi.string().max(20).optional()
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

// GET /submissions - Get user's submissions
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const { contestId, limit = 20, offset = 0 } = req.query;
        
        let query = db.collection('submissions')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(parseInt(limit))
            .offset(parseInt(offset));

        if (contestId) {
            query = query.where('contestId', '==', contestId);
        }

        const submissionsSnapshot = await query.get();
        const submissions = [];
        
        submissionsSnapshot.forEach(doc => {
            submissions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            submissions
        });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// GET /submissions/:id - Get specific submission
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const submissionDoc = await db.collection('submissions').doc(id).get();
        
        if (!submissionDoc.exists) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        const submissionData = submissionDoc.data();
        
        // Check if user can view this submission
        if (submissionData.userId !== userId) {
            // Check if user is mentor or admin in the same community
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            
            if (!['mentor', 'community-admin'].includes(userData.role) || 
                userData.community !== submissionData.community) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Insufficient permissions to view this submission' 
                });
            }
        }

        res.json({
            success: true,
            submission: {
                id: submissionDoc.id,
                ...submissionData
            }
        });
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /submissions - Create new submission
router.post('/', verifyToken, async (req, res) => {
    try {
        const { error, value } = submissionSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const userId = req.user.uid;
        
        // Verify contest exists and user is participant
        const contestDoc = await db.collection('contests').doc(value.contestId).get();
        if (!contestDoc.exists) {
            return res.status(404).json({ success: false, error: 'Contest not found' });
        }

        const contestData = contestDoc.data();
        if (!contestData.participants.includes(userId)) {
            return res.status(403).json({ 
                success: false, 
                error: 'You are not a participant in this contest' 
            });
        }

        // Check if contest is active
        if (contestData.status !== 'active') {
            return res.status(400).json({ 
                success: false, 
                error: 'Contest is not active' 
            });
        }

        const submissionData = {
            ...value,
            userId,
            community: contestData.community,
            status: 'submitted',
            score: 0,
            feedback: '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const submissionRef = await db.collection('submissions').add(submissionData);
        
        // Add submission to contest
        await db.collection('contests').doc(value.contestId).update({
            submissions: admin.firestore.FieldValue.arrayUnion(submissionRef.id),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Submission created successfully',
            submission: {
                id: submissionRef.id,
                ...submissionData
            }
        });
    } catch (error) {
        console.error('Create submission error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// PUT /submissions/:id - Update submission
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = submissionSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: 'Validation failed', 
                details: error.details[0].message 
            });
        }

        const userId = req.user.uid;
        
        const submissionDoc = await db.collection('submissions').doc(id).get();
        if (!submissionDoc.exists) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        const submissionData = submissionDoc.data();
        
        // Check if user can update this submission
        if (submissionData.userId !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: 'You can only update your own submissions' 
            });
        }

        // Check if submission can still be updated
        if (submissionData.status === 'evaluated') {
            return res.status(400).json({ 
                success: false, 
                error: 'Submission has been evaluated and cannot be updated' 
            });
        }

        const updateData = {
            ...value,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('submissions').doc(id).update(updateData);
        
        res.json({
            success: true,
            message: 'Submission updated successfully'
        });
    } catch (error) {
        console.error('Update submission error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /submissions/:id/evaluate - Evaluate submission (mentor/admin only)
router.post('/:id/evaluate', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { score, feedback } = req.body;
        const userId = req.user.uid;
        
        const submissionDoc = await db.collection('submissions').doc(id).get();
        if (!submissionDoc.exists) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        const submissionData = submissionDoc.data();
        
        // Check if user can evaluate this submission
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (!['mentor', 'community-admin'].includes(userData.role) || 
            userData.community !== submissionData.community) {
            return res.status(403).json({ 
                success: false, 
                error: 'Insufficient permissions to evaluate this submission' 
            });
        }

        const updateData = {
            score: parseInt(score) || 0,
            feedback: feedback || '',
            status: 'evaluated',
            evaluatedBy: userId,
            evaluatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('submissions').doc(id).update(updateData);
        
        res.json({
            success: true,
            message: 'Submission evaluated successfully'
        });
    } catch (error) {
        console.error('Evaluate submission error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// DELETE /submissions/:id - Delete submission
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        const submissionDoc = await db.collection('submissions').doc(id).get();
        if (!submissionDoc.exists) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        const submissionData = submissionDoc.data();
        
        // Check if user can delete this submission
        if (submissionData.userId !== userId) {
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            
            if (userData.role !== 'community-admin') {
                return res.status(403).json({ 
                    success: false, 
                    error: 'You can only delete your own submissions' 
                });
            }
        }

        // Delete submission
        await db.collection('submissions').doc(id).delete();
        
        res.json({
            success: true,
            message: 'Submission deleted successfully'
        });
    } catch (error) {
        console.error('Delete submission error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
