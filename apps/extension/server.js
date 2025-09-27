// Minimal Express server to accept flags from the extension and write to Firestore
// Run locally during development; in production this would be a Cloud Function/hosting endpoint

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const Joi = require('joi');
let admin = null;
let db = null;

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

// CORS configuration - restrict to localhost only
app.use(cors({ 
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Firebase Admin SDK
try {
  admin = require('firebase-admin');
  
  // Initialize with service account credentials
  if (process.env.ADMIN_SERVICE_ACCOUNT_KEY_PATH) {
    const serviceAccount = require(process.env.ADMIN_SERVICE_ACCOUNT_KEY_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'skillport-a0c39.firebasestorage.app'
    });
    console.log('Firebase Admin initialized with service account key');
  } else if (process.env.FIREBASE_SA_JSON) {
    const creds = JSON.parse(process.env.FIREBASE_SA_JSON);
    admin.initializeApp({ 
      credential: admin.credential.cert(creds),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'skillport-a0c39.firebasestorage.app'
    });
    console.log('Firebase Admin initialized with FIREBASE_SA_JSON');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'skillport-a0c39.firebasestorage.app'
    });
    console.log('Firebase Admin initialized with GOOGLE_APPLICATION_CREDENTIALS');
  } else {
    // For production, use default credentials
    admin.initializeApp({
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'skillport-a0c39.firebasestorage.app'
    });
    console.log('Firebase Admin initialized with default credentials');
  }
  
  db = admin.firestore();
  console.log('Firebase Admin and Firestore initialized successfully');
} catch (e) {
  console.warn('Firebase Admin not initialized. Falling back to in-memory flags.', e.message);
}

// In-memory fallback
const flags = [];

// Input validation schemas
const flagSchema = Joi.object({
  userId: Joi.string().required().min(1).max(100),
  platform: Joi.string().valid('leetcode', 'geeksforgeeks', 'hackerrank', 'interviewbit').required(),
  questionId: Joi.string().min(1).max(100).allow(''),
  title: Joi.string().required().min(1).max(200),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  codePrev: Joi.string().max(10000).allow(''),
  codeCurr: Joi.string().max(10000).allow(''),
  previous: Joi.object().optional(),
  current: Joi.object().optional(),
  gapMs: Joi.number().integer().min(0).max(86400000), // Max 24 hours
  // Additional LeetCode fields
  submissionId: Joi.string().max(50).allow(''),
  language: Joi.string().max(20).allow(''),
  executionTime: Joi.number().min(0).allow(0),
  memoryUsed: Joi.number().min(0).allow(0),
  verdict: Joi.string().max(20).allow(''),
  timestamp: Joi.number().min(0).allow(0)
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Sanitize string inputs
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key]);
      }
    });
  }
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

app.use(requestLogger);

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic submission schema (without code)
const submissionSchema = Joi.object({
  userId: Joi.string().max(50).required(),
  platform: Joi.string().valid('leetcode', 'geeksforgeeks', 'hackerrank', 'interviewbit').required(),
  questionId: Joi.string().max(100).required(),
  title: Joi.string().max(200).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  verdict: Joi.string().max(20).required(),
  timestamp: Joi.number().min(0).required(),
  submissionId: Joi.string().max(50).allow(''),
  language: Joi.string().max(20).allow(''),
  executionTime: Joi.number().min(0).allow(0),
  memoryUsed: Joi.number().min(0).allow(0),
  code: Joi.string().max(10000).allow('') // Empty for regular submissions
});

app.post('/api/v1/submissions', sanitizeInput, async (req, res) => {
  try {
    // Validate input
    const { error, value } = submissionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const payload = value;
    
    // Store in memory (you can replace with database)
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const doc = {
      id: submissionId,
      userId: payload.userId,
      platform: payload.platform,
      questionId: payload.questionId,
      title: payload.title,
      difficulty: payload.difficulty,
      verdict: payload.verdict,
      timestamp: payload.timestamp,
      submissionId: payload.submissionId || '',
      language: payload.language || '',
      executionTime: payload.executionTime || 0,
      memoryUsed: payload.memoryUsed || 0,
      code: payload.code || '', // Will be empty for regular submissions
      createdAt: new Date().toISOString(),
      hasCode: payload.code && payload.code.length > 0
    };

    // Store in Firebase or memory
    if (db) {
      const ref = await db.collection('submissions').add(doc);
      console.log(`📝 New submission stored in Firebase: ${payload.title} (${payload.difficulty}) - Code: ${doc.hasCode ? 'YES' : 'NO'}`);
      
      // Also store in flags collection for tracking
      await db.collection('flags').add({
        userId: payload.userId,
        platform: payload.platform,
        title: payload.title,
        difficulty: payload.difficulty,
        submissionId: payload.submissionId || '',
        language: payload.language || '',
        executionTime: payload.executionTime || 0,
        memoryUsed: payload.memoryUsed || 0,
        verdict: payload.verdict || '',
        timestamp: payload.timestamp || Date.now(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Flag stored in Firestore');
      
      res.json({ 
        success: true, 
        id: ref.id,
        message: 'Submission stored in Firebase successfully',
        hasCode: doc.hasCode
      });
    } else {
      // Store in memory array as fallback
      if (!global.submissions) global.submissions = [];
      global.submissions.push(doc);
      console.log(`📝 New submission stored in memory: ${payload.title} (${payload.difficulty}) - Code: ${doc.hasCode ? 'YES' : 'NO'}`);
      res.json({ 
        success: true, 
        id: submissionId,
        message: 'Submission stored in memory (Firebase not available)',
        hasCode: doc.hasCode
      });
    }

  } catch (error) {
    console.error('❌ Error storing submission:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.post('/api/v1/flags', sanitizeInput, async (req, res) => {
  try {
    // Validate input
    const { error, value } = flagSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details.map(d => d.message) 
      });
    }

    const payload = value;
    
    // Additional security checks
    if (!payload.userId || typeof payload.userId !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid userId required' });
    }

    // Check for potential XSS in code content
    if (payload.codePrev && payload.codePrev.length > 10000) {
      return res.status(400).json({ success: false, message: 'Code content too large' });
    }
    if (payload.codeCurr && payload.codeCurr.length > 10000) {
      return res.status(400).json({ success: false, message: 'Code content too large' });
    }

    const doc = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: payload.userId,
      platform: payload.platform,
      questionId: payload.questionId || '',
      title: payload.title,
      difficulty: payload.difficulty,
      codePrev: payload.codePrev || '',
      codeCurr: payload.codeCurr || '',
      previous: payload.previous,
      current: payload.current,
      gapMs: payload.gapMs || 0,
      status: 'open',
      flaggedAt: Date.now(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      // Additional LeetCode fields
      submissionId: payload.submissionId || '',
      language: payload.language || '',
      executionTime: payload.executionTime || 0,
      memoryUsed: payload.memoryUsed || 0,
      verdict: payload.verdict || '',
      timestamp: payload.timestamp || Date.now()
    };

    if (db) {
      const ref = await db.collection('flags').add(doc);
      res.json({ success: true, data: { id: ref.id } });
    } else {
      flags.unshift(doc);
      res.json({ success: true, data: { id: doc.id } });
    }
  } catch (e) {
    console.error('Flag creation error:', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/v1/flags', async (req, res) => {
  try {
    if (db) {
      const snap = await db.collection('flags').where('status', '==', 'open').orderBy('flaggedAt', 'desc').limit(100).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      res.json({ success: true, data: items });
    } else {
      res.json({ success: true, data: flags });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/v1/flags/:id/resolve', async (req, res) => {
  try {
    const id = req.params.id;
    if (db) {
      await db.collection('flags').doc(id).update({ status: 'resolved', resolvedAt: Date.now() });
      return res.json({ success: true });
    }
    const idx = flags.findIndex(f => f.id === id);
    if (idx >= 0) {
      flags[idx].status = 'resolved';
      flags[idx].resolvedAt = Date.now();
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

const PORT = process.env.PORT || 5001;
const HOST = '127.0.0.1'; // Bind to localhost only for security

app.listen(PORT, HOST, () => {
  console.log(`🔒 Secure flag server running on http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛡️ Security features: Rate limiting, CORS, Helmet, Input validation`);
});


