const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Contest name is required'],
    trim: true,
    maxlength: [100, 'Contest name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Contest description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },

  // Contest Details
  type: {
    type: String,
    enum: ['practice', 'competitive', 'assessment', 'hackathon'],
    default: 'practice',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true
  },
  category: {
    type: String,
    enum: ['algorithms', 'data-structures', 'mathematics', 'strings', 'arrays', 'dynamic-programming', 'graph-theory', 'other'],
    required: true
  },

  // Timing
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [15, 'Contest must be at least 15 minutes'],
    max: [1440, 'Contest cannot exceed 24 hours']
  },

  // Problems
  problems: [{
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: [1, 'Problem must have at least 1 point'],
      max: [1000, 'Problem cannot exceed 1000 points']
    },
    order: {
      type: Number,
      required: true,
      min: [1, 'Problem order must be at least 1']
    }
  }],

  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    startTime: Date,
    endTime: Date,
    score: {
      type: Number,
      default: 0
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    rank: Number,
    isDisqualified: {
      type: Boolean,
      default: false
    },
    disqualificationReason: String
  }],

  // Rules and Settings
  rules: [String],
  allowedLanguages: [{
    type: String,
    enum: ['python', 'java', 'cpp', 'c', 'javascript', 'go', 'rust', 'kotlin', 'swift']
  }],
  maxSubmissions: {
    type: Number,
    default: 10,
    min: [1, 'Max submissions must be at least 1']
  },
  plagiarismCheck: {
    type: Boolean,
    default: true
  },
  autoJudge: {
    type: Boolean,
    default: true
  },

  // Scoring and Ranking
  scoringSystem: {
    type: String,
    enum: ['standard', 'weighted', 'time-based', 'custom'],
    default: 'standard'
  },
  tieBreaker: {
    type: String,
    enum: ['time', 'submissions', 'difficulty', 'none'],
    default: 'time'
  },
  bonusPoints: {
    earlySubmission: {
      type: Number,
      default: 0
    },
    perfectScore: {
      type: Number,
      default: 0
    }
  },

  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'archived', 'cancelled'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },

  // Access Control
  allowedRoles: [{
    type: String,
    enum: ['personal', 'community', 'admin']
  }],
  allowedInstitutions: [String],
  password: String, // For private contests
  maxParticipants: {
    type: Number,
    min: [1, 'Max participants must be at least 1']
  },

  // Metadata
  tags: [String],
  image: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Statistics
  totalParticipants: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
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
contestSchema.index({ startDate: 1 });
contestSchema.index({ endDate: 1 });
contestSchema.index({ status: 1 });
contestSchema.index({ type: 1 });
contestSchema.index({ difficulty: 1 });
contestSchema.index({ category: 1 });
contestSchema.index({ isPublic: 1 });
contestSchema.index({ createdBy: 1 });

// Virtual for contest duration in hours
contestSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual for contest status based on dates
contestSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  if (now < this.startDate) return 'upcoming';
  if (now >= this.startDate && now <= this.endDate) return 'active';
  return 'completed';
});

// Virtual for remaining time
contestSchema.virtual('remainingTime').get(function() {
  const now = new Date();
  if (now < this.startDate) return this.startDate - now;
  if (now <= this.endDate) return this.endDate - now;
  return 0;
});

// Pre-save middleware to update timestamp
contestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to validate dates
contestSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  
  if (this.startDate <= new Date()) {
    return next(new Error('Start date must be in the future'));
  }
  
  next();
});

// Instance method to check if contest is active
contestSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Instance method to check if contest has started
contestSchema.methods.hasStarted = function() {
  return new Date() >= this.startDate;
};

// Instance method to check if contest has ended
contestSchema.methods.hasEnded = function() {
  return new Date() > this.endDate;
};

// Instance method to add participant
contestSchema.methods.addParticipant = function(userId) {
  if (this.participants.some(p => p.user.toString() === userId.toString())) {
    throw new Error('User is already a participant');
  }
  
  if (this.maxParticipants && this.participants.length >= this.maxParticipants) {
    throw new Error('Contest is full');
  }
  
  this.participants.push({ user: userId });
  this.totalParticipants = this.participants.length;
  return this.save();
};

// Instance method to remove participant
contestSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  this.totalParticipants = this.participants.length;
  return this.save();
};

// Instance method to update participant score
contestSchema.methods.updateParticipantScore = function(userId, score, problemsSolved) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.score = score;
    participant.problemsSolved = problemsSolved;
    return this.save();
  }
  throw new Error('Participant not found');
};

// Static method to find active contests
contestSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
    status: 'active'
  });
};

// Static method to find upcoming contests
contestSchema.statics.findUpcoming = function() {
  const now = new Date();
  return this.find({
    startDate: { $gt: now },
    status: 'published'
  });
};

// Static method to find contests by difficulty
contestSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty, status: { $in: ['published', 'active'] } });
};

// JSON transform
contestSchema.methods.toJSON = function() {
  const contest = this.toObject();
  delete contest.password;
  return contest;
};

module.exports = mongoose.model('Contest', contestSchema);
