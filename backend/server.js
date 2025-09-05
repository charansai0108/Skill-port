const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('./config/logger');
const { csrfMiddleware, generateCSRFToken, getCSRFToken } = require('./middleware/csrf');

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to database
const connectDB = require('./config/database');
connectDB();

// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const mentorRoutes = require('./routes/mentor');
const userSpecificRoutes = require('./routes/user');
const personalRoutes = require('./routes/personal');
const communityRoutes = require('./routes/communities');
const communityDashboardRoutes = require('./routes/community');
const newCommunityRoutes = require('./routes/community');
const studentRoutes = require('./routes/student');
const contestRoutes = require('./routes/contests');
const newContestRoutes = require('./routes/contest');
const projectRoutes = require('./routes/projects');
const progressRoutes = require('./routes/progress');
const extensionRoutes = require('./routes/extension');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const contactRoutes = require('./routes/contact');
const healthRoutes = require('./routes/health');

// Middleware files
const errorHandler = require('./middleware/error');
const { protect } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:8080', 'http://localhost:8002'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Extension-Token', 'X-CSRF-Token']
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Cookie parsing middleware
app.use(cookieParser());

// CSRF protection middleware
app.use(csrfMiddleware);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter); // Rate limiting enabled

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 auth requests per windowMs (increased for testing)
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/v1/auth', authLimiter); // Auth rate limiting enabled

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Static file serving for frontend
app.use(express.static(path.join(__dirname, '../client')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SkillPort API is running',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1',
        environment: process.env.NODE_ENV || 'development'
    });
});

// CSRF token endpoint
app.get('/api/csrf-token', getCSRFToken);

// API health check endpoint
app.get(`/api/${process.env.API_VERSION || 'v1'}/health`, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/users`, protect, userRoutes);
app.use(`/api/${apiVersion}/mentor`, protect, mentorRoutes);
app.use(`/api/${apiVersion}/student`, protect, studentRoutes);
app.use(`/api/${apiVersion}/user`, protect, userSpecificRoutes);
app.use(`/api/${apiVersion}/personal`, protect, personalRoutes);
app.use(`/api/${apiVersion}/communities`, protect, communityRoutes);
app.use(`/api/${apiVersion}/community`, protect, communityDashboardRoutes);
app.use(`/api/${apiVersion}/community`, newCommunityRoutes);
app.use(`/api/${apiVersion}/contests`, protect, contestRoutes);
app.use(`/api/${apiVersion}/contests`, newContestRoutes);
app.use(`/api/${apiVersion}/projects`, protect, projectRoutes);
app.use(`/api/${apiVersion}/progress`, protect, progressRoutes);
app.use(`/api/${apiVersion}/extension`, extensionRoutes);
app.use(`/api/${apiVersion}/upload`, protect, uploadRoutes);
app.use(`/api/${apiVersion}/admin`, protect, adminRoutes);
app.use(`/api/${apiVersion}/analytics`, protect, analyticsRoutes);
app.use(`/api/${apiVersion}/contact`, contactRoutes);
app.use(`/api/${apiVersion}/health`, healthRoutes);

// Handle undefined routes
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
        availableRoutes: [
            `GET /health`,
            `POST /api/${apiVersion}/auth/register`,
            `POST /api/${apiVersion}/auth/login`,
            `GET /api/${apiVersion}/users/profile`,
            `GET /api/${apiVersion}/mentor/students`,
            `GET /api/${apiVersion}/mentor/contests`,
            `GET /api/${apiVersion}/user/contests`,
            `GET /api/${apiVersion}/user/profile`,
            `GET /api/${apiVersion}/communities`,
            `GET /api/${apiVersion}/contests`,
            `GET /api/${apiVersion}/projects`,
            `GET /api/${apiVersion}/progress`,
            `POST /api/${apiVersion}/extension/sync`,
            `GET /api/${apiVersion}/admin/users`,
            `GET /api/${apiVersion}/admin/analytics`,
            `GET /api/${apiVersion}/analytics/dashboard`,
            `GET /api/${apiVersion}/analytics/community/:id`
        ]
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`❌ Uncaught Exception: ${err.message}`);
    console.log('🔄 Shutting down the server due to Uncaught Exception');
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received. Shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received. Shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    logger.info(`🚀 SkillPort API Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`📍 Health check: 
        http://localhost:${PORT}/health`);
    logger.info(`🔗 API Base URL: http://localhost:${PORT}/api/${apiVersion}`);
    logger.info(`📁 Static files: http://localhost:${PORT}/uploads`);
});

module.exports = app;