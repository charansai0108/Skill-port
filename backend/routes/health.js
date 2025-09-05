const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/v1/health
// @access  Public
router.get('/', async (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {}
    };

    try {
        // Check database connection
        if (mongoose.connection.readyState === 1) {
            healthCheck.services.database = {
                status: 'OK',
                connection: 'Connected',
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name
            };
        } else {
            healthCheck.services.database = {
                status: 'ERROR',
                connection: 'Disconnected',
                error: 'Database connection failed'
            };
            healthCheck.status = 'ERROR';
        }

        // Check memory usage
        const memUsage = process.memoryUsage();
        healthCheck.services.memory = {
            status: 'OK',
            rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
            external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
        };

        // Check CPU usage
        const cpuUsage = process.cpuUsage();
        healthCheck.services.cpu = {
            status: 'OK',
            user: cpuUsage.user,
            system: cpuUsage.system
        };

        // Check if critical environment variables are set
        const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
        const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
        
        if (missingEnvVars.length > 0) {
            healthCheck.services.environment = {
                status: 'WARNING',
                missing: missingEnvVars
            };
        } else {
            healthCheck.services.environment = {
                status: 'OK',
                message: 'All required environment variables are set'
            };
        }

        // Set HTTP status code based on overall health
        const statusCode = healthCheck.status === 'OK' ? 200 : 503;
        
        res.status(statusCode).json(healthCheck);

    } catch (error) {
        healthCheck.status = 'ERROR';
        healthCheck.error = error.message;
        res.status(503).json(healthCheck);
    }
});

// @desc    Detailed health check with database queries
// @route   GET /api/v1/health/detailed
// @access  Private (Admin only)
router.get('/detailed', async (req, res) => {
    const detailedHealth = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {},
        database: {}
    };

    try {
        // Test database operations
        if (mongoose.connection.readyState === 1) {
            const User = require('../models/User');
            const Community = require('../models/Community');
            
            // Count documents in each collection
            const userCount = await User.countDocuments();
            const communityCount = await Community.countDocuments();
            
            detailedHealth.database = {
                status: 'OK',
                connection: 'Connected',
                collections: {
                    users: userCount,
                    communities: communityCount
                },
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name
            };
        } else {
            detailedHealth.database = {
                status: 'ERROR',
                connection: 'Disconnected'
            };
            detailedHealth.status = 'ERROR';
        }

        // System information
        detailedHealth.system = {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            pid: process.pid,
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        };

        // API endpoints status
        detailedHealth.api = {
            status: 'OK',
            endpoints: {
                auth: '/api/v1/auth',
                users: '/api/v1/users',
                communities: '/api/v1/communities',
                contests: '/api/v1/contests'
            }
        };

        const statusCode = detailedHealth.status === 'OK' ? 200 : 503;
        res.status(statusCode).json(detailedHealth);

    } catch (error) {
        detailedHealth.status = 'ERROR';
        detailedHealth.error = error.message;
        res.status(503).json(detailedHealth);
    }
});

module.exports = router;
