const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['coding', 'learning', 'project', 'interview', 'personal', 'other'],
    default: 'coding'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed', 'cancelled'],
    default: 'todo'
  },
  
  // Timing
  deadline: {
    type: Date
  },
  estimatedTime: {
    type: Number, // in minutes
    min: [1, 'Estimated time must be at least 1 minute']
  },
  startedAt: Date,
  completedAt: Date,
  
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Assignment Information (if assigned by mentor/admin)
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  assignmentNotes: String,
  
  // Platform Integration
  platform: {
    type: String,
    enum: ['leetcode', 'hackerrank', 'gfg', 'interviewbit', 'skillport', 'other'],
    default: 'other'
  },
  platformProblemId: String,
  platformProblemTitle: String,
  platformProblemUrl: String,
  
  // Progress Tracking
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  
  // Tags and Labels
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert']
  },
  
  // Notes and Reflection
  notes: String,
  reflection: String,
  lessonsLearned: String,
  
  // Metadata
  isPublic: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
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
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, deadline: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ assignedBy: 1, status: 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.deadline || this.status === 'completed') return false;
  return new Date() > this.deadline;
});

// Virtual for time remaining
taskSchema.virtual('timeRemaining').get(function() {
  if (!this.deadline || this.status === 'completed') return null;
  const now = new Date();
  const remaining = this.deadline - now;
  return remaining > 0 ? remaining : 0;
});

// Pre-save middleware to update timestamps
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update startedAt when status changes to in_progress
  if (this.isModified('status') && this.status === 'in_progress' && !this.startedAt) {
    this.startedAt = new Date();
  }
  
  // Update completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Instance methods
taskSchema.methods.startTask = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
  return this.save();
};

taskSchema.methods.completeTask = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress = 100;
  return this.save();
};

taskSchema.methods.updateProgress = function(progress, timeSpent = 0) {
  this.progress = Math.min(100, Math.max(0, progress));
  if (timeSpent > 0) {
    this.timeSpent += timeSpent;
  }
  return this.save();
};

// Static methods
taskSchema.statics.getUserTasks = function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;
  if (filters.platform) query.platform = filters.platform;
  
  return this.find(query).sort({ createdAt: -1 });
};

taskSchema.statics.getOverdueTasks = function(userId) {
  return this.find({
    user: userId,
    deadline: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  }).sort({ deadline: 1 });
};

taskSchema.statics.getUpcomingDeadlines = function(userId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    user: userId,
    deadline: { $gte: new Date(), $lte: futureDate },
    status: { $nin: ['completed', 'cancelled'] }
  }).sort({ deadline: 1 });
};

module.exports = mongoose.model('Task', taskSchema);
