const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // User and Contest Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },

  // Submission Details
  language: {
    type: String,
    enum: ['python', 'java', 'cpp', 'c', 'javascript', 'go', 'rust', 'kotlin', 'swift'],
    required: true
  },
  code: {
    type: String,
    required: [true, 'Code submission is required'],
    maxlength: [50000, 'Code cannot exceed 50,000 characters']
  },
  codeLength: {
    type: Number,
    required: true
  },

  // Platform Information (from extension)
  platform: {
    type: String,
    enum: ['leetcode', 'hackerrank', 'gfg', 'interviewbit', 'skillport'],
    required: true
  },
  platformProblemId: String,
  platformUsername: String,

  // Problem Information
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  problemTitle: String,
  problemUrl: String,

  // Submission Timing
  submittedAt: {
    type: Date,
    default: Date.now
  },
  submissionTime: {
    type: Number, // in minutes
    required: true,
    min: [0, 'Submission time cannot be negative']
  },
  timeLimit: {
    type: Number, // in seconds
    default: 1000
  },

  // Results and Scoring
  status: {
    type: String,
    enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error', 'internal_error'],
    default: 'pending'
  },
  score: {
    type: Number,
    default: 0,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  points: {
    type: Number,
    default: 0
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  memoryUsed: {
    type: Number, // in MB
    default: 0
  },

  // Test Cases
  testCases: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    status: {
      type: String,
      enum: ['passed', 'failed', 'error'],
      default: 'pending'
    },
    executionTime: Number,
    memoryUsed: Number,
    errorMessage: String
  }],
  totalTestCases: {
    type: Number,
    default: 0
  },
  passedTestCases: {
    type: Number,
    default: 0
  },

  // Academic Integrity Flagging
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    enum: ['suspicious_time', 'plagiarism', 'multiple_accounts', 'other'],
    default: null
  },
  flagDetails: {
    type: String,
    maxlength: [500, 'Flag details cannot exceed 500 characters']
  },
  flagSeverity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: null
  },
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: Date,
  flagStatus: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'false_positive'],
    default: 'pending'
  },
  flagResolution: {
    type: String,
    maxlength: [500, 'Flag resolution cannot exceed 500 characters']
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,

  // Performance Analysis
  complexity: {
    time: String,
    space: String
  },
  codeQuality: {
    readability: {
      type: Number,
      min: 1,
      max: 10
    },
    efficiency: {
      type: Number,
      min: 1,
      max: 10
    },
    bestPractices: {
      type: Number,
      min: 1,
      max: 10
    }
  },

  // Feedback and Comments
  mentorFeedback: {
    type: String,
    maxlength: [1000, 'Mentor feedback cannot exceed 1000 characters']
  },
  mentorRating: {
    type: Number,
    min: 1,
    max: 5
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedbackAt: Date,

  // Metadata
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  version: {
    type: String,
    default: '1.0.0'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
submissionSchema.index({ user: 1 });
submissionSchema.index({ contest: 1 });
submissionSchema.index({ problem: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: 1 });
submissionSchema.index({ platform: 1 });
submissionSchema.index({ difficulty: 1 });
submissionSchema.index({ isFlagged: 1 });
submissionSchema.index({ flagStatus: 1 });

// Compound indexes for common queries
submissionSchema.index({ user: 1, contest: 1 });
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ contest: 1, status: 1 });
submissionSchema.index({ platform: 1, difficulty: 1 });

// Virtual for success rate
submissionSchema.virtual('successRate').get(function() {
  if (this.totalTestCases === 0) return 0;
  return (this.passedTestCases / this.totalTestCases) * 100;
});

// Virtual for is suspicious submission
submissionSchema.virtual('isSuspicious').get(function() {
  // Flag if medium/hard problem solved in less than 15 minutes
  if (this.difficulty === 'medium' && this.submissionTime < 15) return true;
  if (this.difficulty === 'hard' && this.submissionTime < 15) return true;
  if (this.difficulty === 'expert' && this.submissionTime < 20) return true;
  return false;
});

// Pre-save middleware to update timestamp
submissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to calculate code length
submissionSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.codeLength = this.code.length;
  }
  next();
});

// Pre-save middleware to auto-flag suspicious submissions
submissionSchema.pre('save', function(next) {
  if (this.isNew && this.isSuspicious && !this.isFlagged) {
    this.isFlagged = true;
    this.flagReason = 'suspicious_time';
    this.flagSeverity = this.difficulty === 'expert' ? 'high' : 'medium';
    this.flagDetails = `Problem solved in ${this.submissionTime} minutes (difficulty: ${this.difficulty})`;
    this.flaggedAt = new Date();
  }
  next();
});

// Instance method to calculate score
submissionSchema.methods.calculateScore = function() {
  if (this.status === 'accepted') {
    // Base score based on difficulty
    let baseScore = 0;
    switch (this.difficulty) {
      case 'easy': baseScore = 10; break;
      case 'medium': baseScore = 25; break;
      case 'hard': baseScore = 50; break;
      case 'expert': baseScore = 100; break;
    }
    
    // Bonus for fast submission
    let timeBonus = 0;
    if (this.submissionTime < 5) timeBonus = baseScore * 0.2;
    else if (this.submissionTime < 10) timeBonus = baseScore * 0.1;
    
    // Bonus for efficient code
    let efficiencyBonus = 0;
    if (this.codeQuality && this.codeQuality.efficiency >= 8) {
      efficiencyBonus = baseScore * 0.1;
    }
    
    this.score = Math.min(100, baseScore + timeBonus + efficiencyBonus);
  } else {
    this.score = 0;
  }
  
  return this.score;
};

// Instance method to update test case results
submissionSchema.methods.updateTestResults = function(testResults) {
  this.testCases = testResults;
  this.totalTestCases = testResults.length;
  this.passedTestCases = testResults.filter(tc => tc.status === 'passed').length;
  
  // Update status based on test results
  if (this.passedTestCases === this.totalTestCases) {
    this.status = 'accepted';
  } else if (this.passedTestCases > 0) {
    this.status = 'wrong_answer';
  } else {
    this.status = 'wrong_answer';
  }
  
  return this.save();
};

// Instance method to flag submission
submissionSchema.methods.flagSubmission = function(reason, details, severity, flaggedBy) {
  this.isFlagged = true;
  this.flagReason = reason;
  this.flagDetails = details;
  this.flagSeverity = severity;
  this.flaggedBy = flaggedBy;
  this.flaggedAt = new Date();
  this.flagStatus = 'pending';
  
  return this.save();
};

// Instance method to resolve flag
submissionSchema.methods.resolveFlag = function(resolution, resolvedBy) {
  this.flagStatus = 'resolved';
  this.flagResolution = resolution;
  this.resolvedBy = resolvedBy;
  this.resolvedAt = new Date();
  
  return this.save();
};

// Static method to find flagged submissions
submissionSchema.statics.findFlagged = function(filters = {}) {
  const query = { isFlagged: true, ...filters };
  return this.find(query).populate('user', 'firstName lastName email username');
};

// Static method to find submissions by platform
submissionSchema.statics.findByPlatform = function(platform, filters = {}) {
  const query = { platform, ...filters };
  return this.find(query).populate('user', 'firstName lastName email username');
};

// Static method to find suspicious submissions
submissionSchema.statics.findSuspicious = function() {
  return this.find({
    $or: [
      { difficulty: 'medium', submissionTime: { $lt: 15 } },
      { difficulty: 'hard', submissionTime: { $lt: 15 } },
      { difficulty: 'expert', submissionTime: { $lt: 20 } }
    ]
  }).populate('user', 'firstName lastName email username');
};

// Static method to get user statistics
submissionSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        acceptedSubmissions: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
        averageScore: { $avg: '$score' },
        totalPoints: { $sum: '$points' },
        problemsSolved: { $addToSet: '$problem' }
      }
    },
    {
      $project: {
        totalSubmissions: 1,
        acceptedSubmissions: 1,
        successRate: { $multiply: [{ $divide: ['$acceptedSubmissions', '$totalSubmissions'] }, 100] },
        averageScore: 1,
        totalPoints: 1,
        uniqueProblemsSolved: { $size: '$problemsSolved' }
      }
    }
  ]);
};

// JSON transform
submissionSchema.methods.toJSON = function() {
  const submission = this.toObject();
  // Don't include sensitive information in public responses
  if (submission.flagStatus === 'pending') {
    delete submission.mentorFeedback;
    delete submission.mentorRating;
  }
  return submission;
};

module.exports = mongoose.model('Submission', submissionSchema);
