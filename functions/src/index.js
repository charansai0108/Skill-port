const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Initialize Firebase Admin
const admin = require("firebase-admin");
admin.initializeApp();

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'https://skillport-a0c39.web.app',
        'https://skillport-a0c39.firebaseapp.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        ok: true, 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Route handlers
app.use('/users', require('./users'));
app.use('/communities', require('./communities'));
app.use('/contests', require('./contests'));
app.use('/otp', require('./otp'));
app.use('/submissions', require('./submissions'));
app.use('/leaderboard', require('./leaderboard'));
app.use('/notifications', require('./notifications'));
app.use('/analytics', require('./analytics'));

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);

// Scheduled functions
exports.scheduledAnalytics = require('./scheduled/analytics');

// Auth triggers
exports.createUserTrigger = require('./authHandlers').createUserTrigger;
exports.onDeleteUser = require('./authHandlers').onDeleteUser;
