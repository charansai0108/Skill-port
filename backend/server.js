const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import security middleware
const {
  helmetConfig,
  xssConfig,
  corsConfig,
  securityHeaders,
  compressionConfig,
  requestSizeLimit,
  requestTimeout,
  morganConfig,
  logger,
  requestLogger,
  errorLogger,
  sanitizeInput,
  extractIP,
  fileUploadSecurity,
  apiRateLimit
} = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const communitiesRoutes = require('./routes/communities');
const contestsRoutes = require('./routes/contests');
const usersRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const postsRoutes = require('./routes/posts');
const problemsRoutes = require('./routes/problems');

const app = express();

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB successfully');
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Security middleware (order is important)
app.use(helmetConfig);
app.use(xssConfig);
app.use(corsConfig);
app.use(securityHeaders);
app.use(extractIP);

// Performance middleware
app.use(compressionConfig);
app.use(requestSizeLimit);
app.use(requestTimeout(30000)); // 30 second timeout

// Logging middleware
app.use(morganConfig);
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization - after body parsing
app.use(sanitizeInput);

// Rate limiting for API endpoints
app.use('/api/', apiRateLimit);

// File upload security - only apply to file upload routes
app.use('/upload', fileUploadSecurity);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SkillPort API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes (order is important - API routes before static files)
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/communities', communitiesRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/portfolios', require('./routes/portfolios'));

// Serve static files from the community-ui directory
app.use(express.static(path.join(__dirname, '../community-ui')));

// Catch-all route for SPA (must be after API routes)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  
  res.sendFile(path.join(__dirname, '../community-ui/index.html'));
});

// Error handling middleware (must be last)
app.use(errorLogger);

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } else {
    res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  console.log('🔄 SIGTERM received, shutting down gracefully');
  
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  console.log('🔄 SIGINT received, shutting down gracefully');
  
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler - don't crash the server
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('❌ Uncaught Exception:', error);
  // Don't exit - just log the error and continue
  // process.exit(1); // ← REMOVED THIS LINE
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API Base: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

module.exports = app;
