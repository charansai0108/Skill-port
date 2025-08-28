const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Specific rate limiters
const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many authentication attempts, please try again in 15 minutes.'
);

const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many API requests, please try again in 15 minutes.'
);

const strictRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 requests per window
  'Too many requests, please slow down.'
);

// Helmet security configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      formAction: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'skillport-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Morgan HTTP request logger
const morganConfig = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});

// Compression middleware
const compressionConfig = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// XSS protection
const xssConfig = xss();

// CORS configuration
const corsConfig = (req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:8000',
    'http://127.0.0.1:5501',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5001',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:50031',
    'http://127.0.0.1:52566'
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

// Request size limiter
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large. Maximum size is 10MB.'
    });
  }

  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  next(err);
};

// IP address extraction middleware
const extractIP = (req, res, next) => {
  req.ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip;
  
  next();
};

// Request timeout middleware
const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    // Skip timeout for certain routes that might take longer
    if (req.path.startsWith('/api/auth/send-otp') || 
        req.path.startsWith('/api/auth/verify-otp') ||
        req.path.startsWith('/upload')) {
      return next();
    }
    
    const timer = setTimeout(() => {
      // Check if response has already been sent
      if (!res.headersSent && !res.finished) {
        try {
          res.status(408).json({
            success: false,
            message: 'Request timeout. Please try again.'
          });
        } catch (error) {
          // Ignore errors if response is already sent
        }
      }
    }, timeout);

    // Clean up timer on response events
    res.on('finish', () => {
      clearTimeout(timer);
    });

    res.on('close', () => {
      clearTimeout(timer);
    });

    res.on('error', () => {
      clearTimeout(timer);
    });

    next();
  };
};

// File upload security middleware
const fileUploadSecurity = (req, res, next) => {
  // Check file size
  if (req.headers['content-length']) {
    const fileSize = parseInt(req.headers['content-length']);
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (fileSize > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }

  // Check content type - allow JSON for API requests
  if (req.headers['content-type']) {
    const contentType = req.headers['content-type'];
    
    // Allow JSON content types for API requests
    if (contentType.includes('application/json') || contentType.includes('application/x-www-form-urlencoded')) {
      return next();
    }
    
    // Check file uploads against allowed types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ];

    if (!allowedTypes.includes(contentType)) {
      return res.status(415).json({
        success: false,
        message: 'Unsupported file type.'
      });
    }
  }

  next();
};

// API key validation middleware (for extension submissions)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== process.env.EXTENSION_SECRET) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key.'
    });
  }

  next();
};

// Brute force protection middleware
const bruteForceProtection = (req, res, next) => {
  // This would integrate with a Redis store in production
  // For now, we'll use a simple in-memory approach
  
  const clientIP = req.ip;
  const key = `brute_force:${clientIP}`;
  
  // In production, this would use Redis
  // For now, we'll just pass through
  next();
};

// Export all middleware
module.exports = {
  // Rate limiting
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  
  // Security
  helmetConfig,
  xssConfig,
  corsConfig,
  securityHeaders,
  
  // Performance
  compressionConfig,
  requestSizeLimit,
  requestTimeout,
  
  // Logging
  morganConfig,
  logger,
  requestLogger,
  errorLogger,
  
  // Input processing
  sanitizeInput,
  extractIP,
  
  // File handling
  fileUploadSecurity,
  
  // API security
  validateApiKey,
  bruteForceProtection,
  
  // Utility functions
  createRateLimit
};
