const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error(`❌ Error: ${err.message}`.red);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        let message = 'Duplicate field value entered';
        
        // Extract field name from error
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        
        if (field === 'email') {
            message = `Email ${value} is already registered`;
        } else if (field === 'code') {
            message = `Code ${value} is already taken`;
        } else if (field === 'studentId') {
            message = `Student ID ${value} already exists`;
        } else {
            message = `${field} '${value}' already exists`;
        }
        
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ErrorResponse(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new ErrorResponse(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new ErrorResponse(message, 401);
    }

    // MongoDB connection errors
    if (err.name === 'MongoNetworkError') {
        const message = 'Database connection failed';
        error = new ErrorResponse(message, 500);
    }

    // Rate limiting errors
    if (err.status === 429) {
        const message = 'Too many requests, please try again later';
        error = new ErrorResponse(message, 429);
    }

    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = `File size too large. Maximum size is ${process.env.MAX_FILE_SIZE || '5MB'}`;
        error = new ErrorResponse(message, 400);
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const message = 'Unexpected file field';
        error = new ErrorResponse(message, 400);
    }

    // Email service errors
    if (err.code === 'EAUTH' || err.responseCode === 535) {
        const message = 'Email service authentication failed';
        error = new ErrorResponse(message, 500);
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server Error';

    // Prepare error response
    const errorResponse = {
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    };

    // Add additional error info for specific status codes
    if (statusCode === 400) {
        errorResponse.type = 'ValidationError';
    } else if (statusCode === 401) {
        errorResponse.type = 'AuthenticationError';
    } else if (statusCode === 403) {
        errorResponse.type = 'AuthorizationError';
    } else if (statusCode === 404) {
        errorResponse.type = 'NotFoundError';
    } else if (statusCode === 429) {
        errorResponse.type = 'RateLimitError';
        errorResponse.retryAfter = err.retryAfter || 900;
    } else if (statusCode >= 500) {
        errorResponse.type = 'ServerError';
    }

    // Log error details for monitoring
    if (statusCode >= 500) {
        console.error(`🚨 Server Error [${req.method} ${req.originalUrl}]:`, {
            error: message,
            user: req.user?.id || 'anonymous',
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });
    }

    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
