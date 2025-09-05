const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');

class SessionService {
    // Create a new session
    static async createSession(userId, token, options = {}) {
        try {
            // Deactivate any existing sessions for this user
            await Session.updateMany(
                { user: userId, isActive: true },
                { isActive: false }
            );

            // Create new session
            const session = await Session.createSession(userId, token, options);
            
            console.log('🔐 SessionService: Session created for user:', userId);
            return session;
        } catch (error) {
            console.error('🔐 SessionService: Error creating session:', error);
            throw error;
        }
    }

    // Get active session by token
    static async getActiveSession(token) {
        try {
            const session = await Session.findActiveSession(token);
            
            if (session) {
                // Update last activity
                await session.refresh();
                console.log('🔐 SessionService: Active session found for user:', session.user._id);
            }
            
            return session;
        } catch (error) {
            console.error('🔐 SessionService: Error getting session:', error);
            return null;
        }
    }

    // Update session data
    static async updateSessionData(token, data) {
        try {
            const session = await Session.findOne({ token, isActive: true });
            
            if (!session) {
                throw new Error('Session not found');
            }

            await session.updateData(data);
            console.log('🔐 SessionService: Session data updated');
            return session;
        } catch (error) {
            console.error('🔐 SessionService: Error updating session data:', error);
            throw error;
        }
    }

    // Get session data
    static async getSessionData(token) {
        try {
            const session = await Session.findOne({ token, isActive: true });
            return session ? session.data : {};
        } catch (error) {
            console.error('🔐 SessionService: Error getting session data:', error);
            return {};
        }
    }

    // Deactivate session (logout)
    static async deactivateSession(token) {
        try {
            const session = await Session.findOne({ token, isActive: true });
            
            if (session) {
                await session.deactivate();
                console.log('🔐 SessionService: Session deactivated for user:', session.user._id);
            }
            
            return true;
        } catch (error) {
            console.error('🔐 SessionService: Error deactivating session:', error);
            throw error;
        }
    }

    // Deactivate all sessions for a user
    static async deactivateAllUserSessions(userId) {
        try {
            await Session.updateMany(
                { user: userId, isActive: true },
                { isActive: false }
            );
            
            console.log('🔐 SessionService: All sessions deactivated for user:', userId);
            return true;
        } catch (error) {
            console.error('🔐 SessionService: Error deactivating user sessions:', error);
            throw error;
        }
    }

    // Clean up expired sessions
    static async cleanupExpiredSessions() {
        try {
            const result = await Session.deleteMany({
                expiresAt: { $lt: new Date() }
            });
            
            console.log('🔐 SessionService: Cleaned up expired sessions:', result.deletedCount);
            return result.deletedCount;
        } catch (error) {
            console.error('🔐 SessionService: Error cleaning up sessions:', error);
            throw error;
        }
    }

    // Get user's active sessions
    static async getUserActiveSessions(userId) {
        try {
            const sessions = await Session.find({
                user: userId,
                isActive: true,
                expiresAt: { $gt: new Date() }
            }).select('type userAgent ipAddress lastActivity createdAt');

            return sessions;
        } catch (error) {
            console.error('🔐 SessionService: Error getting user sessions:', error);
            return [];
        }
    }

    // Verify session and return user
    static async verifySession(token) {
        try {
            const session = await this.getActiveSession(token);
            
            if (!session) {
                return null;
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (decoded.id !== session.user._id.toString()) {
                // Token doesn't match session, deactivate session
                await session.deactivate();
                return null;
            }

            return session.user;
        } catch (error) {
            console.error('🔐 SessionService: Error verifying session:', error);
            return null;
        }
    }
}

module.exports = SessionService;
