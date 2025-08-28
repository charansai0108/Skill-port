const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    maxlength: [200, 'Problem title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
    maxlength: [10000, 'Problem description cannot exceed 10,000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Problem Details
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  category: {
    type: String,
    enum: ['algorithms', 'data-structures', 'mathematics', 'strings', 'arrays', 'dynamic-programming', 'graph-theory', 'greedy', 'binary-search', 'two-pointers', 'sliding-window', 'other'],
    required: true
  },
  tags: [String],
  
  // Test Cases
  testCases: [{
    input: {
      type: String,
      required: true
    },
    expectedOutput: {
      type: String,
      required: true
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    description: String,
    points: {
      type: Number,
      default: 1
    }
  }],
  
  // Constraints
  constraints: {
    timeLimit: {
      type: Number,
      default: 1000, // milliseconds
      min: [100, 'Time limit must be at least 100ms'],
      max: [30000, 'Time limit cannot exceed 30 seconds']
    },
    memoryLimit: {
      type: Number,
      default: 256, // MB
      min: [16, 'Memory limit must be at least 16MB'],
      max: [2048, 'Memory limit cannot exceed 2GB']
    },
    inputSize: {
      type: Number,
      default: 1000000 // 1MB
    }
  },
  
  // Problem Statistics
  stats: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    acceptedSubmissions: {
      type: Number,
      default: 0
    },
    acceptanceRate: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    averageMemory: {
      type: Number,
      default: 0
    }
  },
  
  // Problem Settings
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowMultipleSubmissions: {
    type: Boolean,
    default: true
  },
  maxSubmissions: {
    type: Number,
    default: 10,
    min: [1, 'Max submissions must be at least 1']
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },
  
  // Platform Information
  platform: {
    type: String,
    enum: ['skillport', 'leetcode', 'hackerrank', 'gfg', 'codeforces', 'other'],
    default: 'skillport'
  },
  platformProblemId: String,
  platformUrl: String,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Indexes for performance
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });
problemSchema.index({ difficulty: 1, category: 1, status: 1 });
problemSchema.index({ createdBy: 1 });
problemSchema.index({ community: 1 });
problemSchema.index({ contest: 1 });
problemSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate acceptance rate
problemSchema.pre('save', function(next) {
  if (this.isModified('stats.totalSubmissions') || this.isModified('stats.acceptedSubmissions')) {
    if (this.stats.totalSubmissions > 0) {
      this.stats.acceptanceRate = (this.stats.acceptedSubmissions / this.stats.totalSubmissions) * 100;
    }
  }
  next();
});

// Methods
problemSchema.methods.updateStats = function(submissionData) {
  this.stats.totalSubmissions += 1;
  
  if (submissionData.status === 'accepted') {
    this.stats.acceptedSubmissions += 1;
  }
  
  // Update average time
  if (submissionData.executionTime) {
    const totalTime = this.stats.averageTime * (this.stats.totalSubmissions - 1) + submissionData.executionTime;
    this.stats.averageTime = totalTime / this.stats.totalSubmissions;
  }
  
  // Update average memory
  if (submissionData.memoryUsed) {
    const totalMemory = this.stats.averageMemory * (this.stats.totalSubmissions - 1) + submissionData.memoryUsed;
    this.stats.averageMemory = totalMemory / this.stats.totalSubmissions;
  }
  
  return this.save();
};

problemSchema.methods.isAccessible = function(userId, userRole) {
  // Public problems are accessible to everyone
  if (this.isPublic && this.status === 'published') {
    return true;
  }
  
  // Creator can always access
  if (this.createdBy.toString() === userId.toString()) {
    return true;
  }
  
  // Community admins can access community problems
  if (this.community && userRole === 'admin') {
    return true;
  }
  
  // Contest participants can access contest problems
  if (this.contest) {
    // This would need to be checked against contest participation
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('Problem', problemSchema);
