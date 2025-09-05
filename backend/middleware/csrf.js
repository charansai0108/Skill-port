const csrf = require('csrf');
const logger = require('../config/logger');

// Create CSRF instance
const csrfProtection = csrf({
    secret: process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production',
    saltLength: 8,
    tokenLength: 32
});

// CSRF middleware
const csrfMiddleware = (req, res, next) => {
    // Skip CSRF for certain routes
    const skipPaths = [
        '/api/v1/auth/login',
        '/api/v1/auth/register',
        '/api/v1/auth/verify-otp',
        '/api/v1/auth/resend-otp',
        '/api/v1/auth/forgot-password',
        '/api/v1/auth/reset-password',
        '/api/v1/auth/check-email',
        '/health'
    ];

    // Skip CSRF for GET requests and certain paths
    if (req.method === 'GET' || skipPaths.includes(req.path)) {
        return next();
    }

    // Skip CSRF for API routes that don't need it (like public endpoints)
    if (req.path.startsWith('/api/v1/extension/')) {
        return next();
    }

    try {
        // Get CSRF token from header or body
        const token = req.headers['x-csrf-token'] || req.body._csrf;
        
        if (!token) {
            logger.warn(`CSRF token missing for ${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                user: req.user?.id || 'anonymous'
            });
            return res.status(403).json({
                success: false,
                error: 'CSRF token missing',
                type: 'CSRFError'
            });
        }

        // Verify CSRF token
        if (!csrfProtection.verify(process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production', token)) {
            logger.warn(`Invalid CSRF token for ${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                user: req.user?.id || 'anonymous',
                token: token.substring(0, 8) + '...'
            });
            return res.status(403).json({
                success: false,
                error: 'Invalid CSRF token',
                type: 'CSRFError'
            });
        }

        next();
    } catch (error) {
        logger.error('CSRF middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'CSRF verification failed',
            type: 'CSRFError'
        });
    }
};

// Generate CSRF token
const generateCSRFToken = (req, res, next) => {
    try {
        const token = csrfProtection.create(process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production');
        
        // Set token in response header
        res.setHeader('X-CSRF-Token', token);
        
        // Also send token in response body for frontend
        res.locals.csrfToken = token;
        
        next();
    } catch (error) {
        logger.error('CSRF token generation error:', error);
        next(error);
    }
};

// Get CSRF token endpoint
const getCSRFToken = (req, res) => {
    try {
        const token = csrfProtection.create(process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production');
        
        res.json({
            success: true,
            data: {
                csrfToken: token
            }
        });
    } catch (error) {
        logger.error('CSRF token generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate CSRF token'
        });
    }
};

module.exports = {
    csrfMiddleware,
    generateCSRFToken,
    getCSRFToken
};
