const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes - authenticate user using JWT
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for access token in cookies (primary method)
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }
    // Check for token in headers (fallback for API calls)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new ErrorResponse('User not found', 401));
        }

        // Check if user is active
        if (user.status !== 'active') {
            return next(new ErrorResponse('Account is not active', 401));
        }

        // Check if user is locked
        if (user.isLocked) {
            return next(new ErrorResponse('Account is temporarily locked', 401));
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (err) {
        console.error('🔐 Auth Middleware: JWT verification error:', err);
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role '${req.user?.role || 'none'}' is not authorized to access this route`, 403));
        }
        next();
    };
};

// Check if user belongs to the same community (for community-scoped resources)
exports.checkCommunityAccess = asyncHandler(async (req, res, next) => {
    const { communityId } = req.params;

    // Super admin can access any community
    if (req.user.role === 'super-admin') {
        return next();
    }

    // Community admin can only access their own community
    if (req.user.role === 'community-admin') {
        if (!req.user.community || String(req.user.community._id) !== String(communityId)) {
            return next(new ErrorResponse('Not authorized to access this community', 403));
        }
    }

    // Mentors and students can only access their own community
    if (['mentor', 'student'].includes(req.user.role)) {
        if (!req.user.community || String(req.user.community._id) !== String(communityId)) {
            return next(new ErrorResponse('Not authorized to access this community', 403));
        }
    }

    next();
});

// Check if user can access specific user data
exports.checkUserAccess = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    // Users can always access their own data
    if (req.user._id.toString() === userId) {
        return next();
    }

    // Community admin can access users in their community
    if (req.user.role === 'community-admin') {
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return next(new ErrorResponse('User not found', 404));
        }
        
        if (targetUser.community && String(targetUser.community) !== String(req.user.community._id)) {
            return next(new ErrorResponse('Not authorized to access this user', 403));
        }
    }

    // Mentors can access students in their community and batches
    if (req.user.role === 'mentor') {
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return next(new ErrorResponse('User not found', 404));
        }
        
        if (targetUser.role !== 'student' || 
            !targetUser.community || 
            String(targetUser.community) !== String(req.user.community._id)) {
            return next(new ErrorResponse('Not authorized to access this user', 403));
        }
    }

    // Students can only access their own data (already handled above)
    if (req.user.role === 'student') {
        return next(new ErrorResponse('Not authorized to access other user data', 403));
    }

    next();
});

// Extension authentication middleware
exports.authenticateExtension = asyncHandler(async (req, res, next) => {
    let token;

    // Check for extension token in headers
    if (req.headers['x-extension-token']) {
        token = req.headers['x-extension-token'];
    }

    if (!token) {
        return next(new ErrorResponse('Extension token required', 401));
    }

    try {
        // Verify extension token
        const decoded = jwt.verify(token, process.env.EXTENSION_SECRET);

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return next(new ErrorResponse('Invalid extension token', 401));
        }

        // Check if user is personal user (extension only for personal users)
        if (user.role !== 'personal') {
            return next(new ErrorResponse('Extension access only for personal users', 403));
        }

        // Check if extension is installed
        if (!user.extensionInstalled) {
            return next(new ErrorResponse('Extension not properly installed', 403));
        }

        req.user = user;
        next();
    } catch (err) {
        return next(new ErrorResponse('Invalid extension token', 401));
    }
});

// Optional authentication - doesn't fail if no token
exports.optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).populate('community');
            
            if (user && user.status === 'active') {
                req.user = user;
            }
        } catch (err) {
            // Continue without authentication
        }
    }

    next();
});

// Rate limiting by user
exports.userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const userRequests = new Map();

    return (req, res, next) => {
        if (!req.user) {
            return next();
        }

        const userId = req.user._id.toString();
        const now = Date.now();
        
        if (!userRequests.has(userId)) {
            userRequests.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const userLimit = userRequests.get(userId);
        
        if (now > userLimit.resetTime) {
            userRequests.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }

        if (userLimit.count >= maxRequests) {
            return next(new ErrorResponse('User rate limit exceeded', 429));
        }

        userLimit.count++;
        next();
    };
};

module.exports = exports;