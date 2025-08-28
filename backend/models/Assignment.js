const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Assignment title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Assignment description cannot exceed 1000 characters']
  },
  
  // Assignment Details
  type: {
    type: String,
    enum: ['problem', 'project', 'reading', 'practice', 'other'],
    default: 'problem'
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
  
  // Platform Integration
  platform: {
    type: String,
    enum: ['leetcode', 'hackerrank', 'gfg', 'interviewbit', 'skillport', 'other'],
    default: 'other'
  },
  platformProblemId: String,
  platformProblemTitle: String,
  platformProblemUrl: String,
  
  // Assignment Settings
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  estimatedTime: {
    type: Number, // in minutes
    min: [1, 'Estimated time must be at least 1 minute']
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: [1, 'Max attempts must be at least 1']
  },
  points: {
    type: Number,
    default: 100,
    min: [1, 'Points must be at least 1']
  },
  
  // Assignment Status
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Assignment Relationships
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'overdue', 'cancelled'],
      default: 'assigned'
    },
    startedAt: Date,
    completedAt: Date,
    attempts: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100']
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    feedback: String,
    mentorNotes: String
  }],
  
  // Community/Contest Context
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },
  
  // Tags and Metadata
  tags: [String],
  prerequisites: [String],
  learningObjectives: [String],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
assignmentSchema.index({ assignedBy: 1, status: 1 });
assignmentSchema.index({ 'assignedTo.user': 1, status: 1 });
assignmentSchema.index({ community: 1, status: 1 });
assignmentSchema.index({ contest: 1, status: 1 });
assignmentSchema.index({ deadline: 1 });
assignmentSchema.index({ platform: 1, platformProblemId: 1 });

// Virtual for assignment status based on deadline
assignmentSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'archived') return false;
  return new Date() > this.deadline;
});

// Virtual for completion rate
assignmentSchema.virtual('completionRate').get(function() {
  if (this.assignedTo.length === 0) return 0;
  const completed = this.assignedTo.filter(a => a.status === 'completed').length;
  return Math.round((completed / this.assignedTo.length) * 100);
});

// Virtual for active assignments count
assignmentSchema.virtual('activeAssignments').get(function() {
  return this.assignedTo.filter(a => 
    ['assigned', 'in_progress'].includes(a.status)
  ).length;
});

// Pre-save middleware
assignmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Instance methods
assignmentSchema.methods.assignToUser = function(userId) {
  // Check if user is already assigned
  const existingAssignment = this.assignedTo.find(a => a.user.toString() === userId);
  if (existingAssignment) {
    return { success: false, message: 'User already assigned to this assignment' };
  }
  
  // Add user to assignment
  this.assignedTo.push({
    user: userId,
    status: 'assigned',
    assignedAt: new Date()
  });
  
  return { success: true, message: 'User assigned successfully' };
};

assignmentSchema.methods.removeUser = function(userId) {
  this.assignedTo = this.assignedTo.filter(a => a.user.toString() !== userId);
  return { success: true, message: 'User removed from assignment' };
};

assignmentSchema.methods.updateUserStatus = function(userId, status, data = {}) {
  const assignment = this.assignedTo.find(a => a.user.toString() === userId);
  if (!assignment) {
    return { success: false, message: 'User not found in assignment' };
  }
  
  // Update status
  assignment.status = status;
  
  // Update additional fields based on status
  if (status === 'in_progress' && !assignment.startedAt) {
    assignment.startedAt = new Date();
  }
  
  if (status === 'completed' && !assignment.completedAt) {
    assignment.completedAt = new Date();
  }
  
  // Update other fields if provided
  if (data.score !== undefined) assignment.score = data.score;
  if (data.attempts !== undefined) assignment.attempts = data.attempts;
  if (data.submission !== undefined) assignment.submission = data.submission;
  if (data.feedback !== undefined) assignment.feedback = data.feedback;
  if (data.mentorNotes !== undefined) assignment.mentorNotes = data.mentorNotes;
  
  return { success: true, message: 'Assignment status updated successfully' };
};

// Static methods
assignmentSchema.statics.getUserAssignments = function(userId, filters = {}) {
  const query = { 'assignedTo.user': userId };
  
  if (filters.status) query['assignedTo.status'] = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.platform) query.platform = filters.platform;
  
  return this.find(query)
    .populate('assignedBy', 'firstName lastName username')
    .populate('community', 'name')
    .populate('contest', 'name')
    .sort({ deadline: 1 });
};

assignmentSchema.statics.getMentorAssignments = function(mentorId, filters = {}) {
  const query = { assignedBy: mentorId };
  
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  
  return this.find(query)
    .populate('assignedTo.user', 'firstName lastName username')
    .populate('community', 'name')
    .populate('contest', 'name')
    .sort({ createdAt: -1 });
};

assignmentSchema.statics.getOverdueAssignments = function() {
  return this.find({
    deadline: { $lt: new Date() },
    status: { $in: ['published', 'active'] },
    'assignedTo.status': { $in: ['assigned', 'in_progress'] }
  }).populate('assignedTo.user', 'firstName lastName username');
};

module.exports = mongoose.model('Assignment', assignmentSchema);
