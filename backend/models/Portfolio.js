const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Portfolio Settings
  isPublic: {
    type: Boolean,
    default: true
  },
  customUrl: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^[a-zA-Z0-9-]+$/, 'Custom URL can only contain letters, numbers, and hyphens']
  },
  theme: {
    type: String,
    enum: ['default', 'dark', 'light', 'professional', 'creative'],
    default: 'default'
  },
  
  // Personal Information
  headline: {
    type: String,
    maxlength: [200, 'Headline cannot exceed 200 characters']
  },
  summary: {
    type: String,
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative']
    },
    category: {
      type: String,
      enum: ['programming', 'framework', 'database', 'cloud', 'tool', 'language', 'other'],
      default: 'programming'
    }
  }],
  
  // Coding Statistics
  codingStats: {
    totalProblems: {
      type: Number,
      default: 0
    },
    solvedProblems: {
      type: Number,
      default: 0
    },
    totalContests: {
      type: Number,
      default: 0
    },
    contestRankings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    maxRating: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    }
  },
  
  // Platform Profiles
  platformProfiles: [{
    platform: {
      type: String,
      enum: ['leetcode', 'hackerrank', 'gfg', 'interviewbit', 'github', 'codeforces', 'other'],
      required: true
    },
    username: {
      type: String,
      required: true
    },
    profileUrl: String,
    rating: Number,
    rank: String,
    solvedCount: Number,
    totalProblems: Number,
    badgeCount: Number,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Projects
  projects: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Project title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Project description cannot exceed 1000 characters']
    },
    technologies: [String],
    githubUrl: String,
    liveUrl: String,
    imageUrl: String,
    isPublic: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'on_hold', 'cancelled'],
      default: 'completed'
    }
  }],
  
  // Achievements & Certifications
  achievements: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    issuer: String,
    date: Date,
    imageUrl: String,
    certificateUrl: String,
    category: {
      type: String,
      enum: ['contest', 'certification', 'award', 'recognition', 'other'],
      default: 'other'
    }
  }],
  
  // Education & Experience
  education: [{
    institution: {
      type: String,
      required: true
    },
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    gpa: Number,
    description: String,
    isPublic: {
      type: Boolean,
      default: true
    }
  }],
  
  experience: [{
    company: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    startDate: Date,
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: String,
    technologies: [String],
    isPublic: {
      type: Boolean,
      default: true
    }
  }],
  
  // Social Links
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    website: String,
    blog: String,
    youtube: String
  },
  
  // Contact Information
  contactInfo: {
    email: String,
    phone: String,
    location: String,
    timezone: String
  },
  
  // Portfolio Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    downloadCount: {
      type: Number,
      default: 0
    }
  },
  
  // Interview Mode Settings
  interviewMode: {
    enabled: {
      type: Boolean,
      default: false
    },
    availableSlots: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
      timezone: String
    }],
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative']
    },
    skills: [String],
    description: String
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
portfolioSchema.index({ user: 1 });
portfolioSchema.index({ customUrl: 1 });
portfolioSchema.index({ isPublic: 1 });
portfolioSchema.index({ 'skills.category': 1 });
portfolioSchema.index({ 'platformProfiles.platform': 1 });
portfolioSchema.index({ 'interviewMode.enabled': 1 });

// Virtual for completion percentage
portfolioSchema.virtual('completionPercentage').get(function() {
  let totalFields = 0;
  let completedFields = 0;
  
  // Check required fields
  if (this.headline) completedFields++;
  totalFields++;
  
  if (this.summary) completedFields++;
  totalFields++;
  
  if (this.skills && this.skills.length > 0) completedFields++;
  totalFields++;
  
  if (this.projects && this.projects.length > 0) completedFields++;
  totalFields++;
  
  if (this.platformProfiles && this.platformProfiles.length > 0) completedFields++;
  totalFields++;
  
  if (this.education && this.education.length > 0) completedFields++;
  totalFields++;
  
  if (this.experience && this.experience.length > 0) completedFields++;
  totalFields++;
  
  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
});

// Virtual for skill categories
portfolioSchema.virtual('skillCategories').get(function() {
  if (!this.skills || this.skills.length === 0) return {};
  
  const categories = {};
  this.skills.forEach(skill => {
    if (!categories[skill.category]) {
      categories[skill.category] = [];
    }
    categories[skill.category].push(skill);
  });
  
  return categories;
});

// Pre-save middleware
portfolioSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate custom URL if not provided
  if (!this.customUrl && this.user) {
    // This will be set after user population
    this.customUrl = `user-${this.user}`;
  }
  
  next();
});

// Instance methods
portfolioSchema.methods.updateCodingStats = async function() {
  try {
    // Get user's actual coding statistics from submissions
    const Submission = require('./Submission');
    const Contest = require('./Contest');
    
    // Calculate total and solved problems
    const submissionStats = await Submission.aggregate([
      { $match: { user: this.user } },
      {
        $group: {
          _id: null,
          totalProblems: { $addToSet: '$problemId' },
          solvedProblems: { $addToSet: { $cond: [{ $eq: ['$verdict', 'Accepted'] }, '$problemId', null] } }
        }
      }
    ]);
    
    if (submissionStats.length > 0) {
      const stats = submissionStats[0];
      this.codingStats.totalProblems = stats.totalProblems.length;
      this.codingStats.solvedProblems = stats.solvedProblems.filter(id => id !== null).length;
    }
    
    // Calculate contest statistics
    const contestStats = await Contest.aggregate([
      { $match: { 'participants.user': this.user } },
      {
        $group: {
          _id: null,
          totalContests: { $sum: 1 },
          contestRankings: { $sum: '$participants.rank' }
        }
      }
    ]);
    
    if (contestStats.length > 0) {
      this.codingStats.totalContests = contestStats[0].totalContests;
      this.codingStats.contestRankings = contestStats[0].contestRankings;
    }
    
    await this.save();
    return true;
  } catch (error) {
    console.error('Error updating coding stats:', error);
    return false;
  }
};

portfolioSchema.methods.addView = async function() {
  if (!this.analytics) {
    this.analytics = { views: 0, uniqueVisitors: 0, downloadCount: 0 };
  }
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  await this.save();
};

portfolioSchema.methods.addUniqueVisitor = async function(visitorId) {
  // This is a simplified version - in production you'd use a more sophisticated tracking system
  if (!this.analytics) {
    this.analytics = { views: 0, uniqueVisitors: 0, downloadCount: 0 };
  }
  this.analytics.uniqueVisitors += 1;
  await this.save();
};

// Static methods
portfolioSchema.statics.getPublicPortfolios = function(filters = {}) {
  const query = { isPublic: true };
  
  if (filters.skills) {
    query['skills.name'] = { $in: filters.skills };
  }
  
  if (filters.platforms) {
    query['platformProfiles.platform'] = { $in: filters.platforms };
  }
  
  if (filters.location) {
    query['contactInfo.location'] = { $regex: filters.location, $options: 'i' };
  }
  
  return this.find(query)
    .populate('user', 'firstName lastName username email')
    .sort({ 'codingStats.solvedProblems': -1, 'analytics.views': -1 });
};

portfolioSchema.statics.getPortfolioByCustomUrl = function(customUrl) {
  return this.findOne({ customUrl, isPublic: true })
    .populate('user', 'firstName lastName username email')
    .populate('projects')
    .populate('achievements');
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
