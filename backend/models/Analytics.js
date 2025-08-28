const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // User Analytics
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contest Performance
  contestStats: {
    totalContests: {
      type: Number,
      default: 0
    },
    contestsWon: {
      type: Number,
      default: 0
    },
    contestsParticipated: {
      type: Number,
      default: 0
    },
    averageRank: {
      type: Number,
      default: 0
    },
    totalScore: {
      type: Number,
      default: 0
    },
    bestRank: {
      type: Number,
      default: null
    },
    worstRank: {
      type: Number,
      default: null
    }
  },
  
  // Problem Solving Stats
  problemStats: {
    totalProblems: {
      type: Number,
      default: 0
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    problemsAttempted: {
      type: Number,
      default: 0
    },
    successRate: {
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
  
  // Submission Statistics
  submissionStats: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    acceptedSubmissions: {
      type: Number,
      default: 0
    },
    rejectedSubmissions: {
      type: Number,
      default: 0
    },
    compilationErrors: {
      type: Number,
      default: 0
    },
    runtimeErrors: {
      type: Number,
      default: 0
    },
    timeLimitExceeded: {
      type: Number,
      default: 0
    },
    memoryLimitExceeded: {
      type: Number,
      default: 0
    }
  },
  
  // Community Engagement
  communityStats: {
    communitiesJoined: {
      type: Number,
      default: 0
    },
    communitiesCreated: {
      type: Number,
      default: 0
    },
    postsCreated: {
      type: Number,
      default: 0
    },
    commentsMade: {
      type: Number,
      default: 0
    },
    likesReceived: {
      type: Number,
      default: 0
    },
    likesGiven: {
      type: Number,
      default: 0
    }
  },
  
  // Skill Development
  skillProgress: [{
    skill: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Language Proficiency
  languageStats: [{
    language: {
      type: String,
      required: true
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Achievement Tracking
  achievements: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['contest', 'problem', 'community', 'streak', 'milestone'],
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String,
    points: {
      type: Number,
      default: 0
    }
  }],
  
  // Streaks and Consistency
  streaks: {
    currentLoginStreak: {
      type: Number,
      default: 0
    },
    longestLoginStreak: {
      type: Number,
      default: 0
    },
    currentProblemStreak: {
      type: Number,
      default: 0
    },
    longestProblemStreak: {
      type: Number,
      default: 0
    },
    lastLoginDate: Date,
    lastProblemSolvedDate: Date
  },
  
  // Platform Usage
  usageStats: {
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    averageSessionTime: {
      type: Number,
      default: 0 // in minutes
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  
  // Performance Metrics
  performanceMetrics: {
    accuracy: {
      type: Number,
      default: 0
    },
    efficiency: {
      type: Number,
      default: 0
    },
    consistency: {
      type: Number,
      default: 0
    },
    improvement: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
analyticsSchema.index({ user: 1 });
analyticsSchema.index({ 'contestStats.totalScore': -1 });
analyticsSchema.index({ 'problemStats.problemsSolved': -1 });
analyticsSchema.index({ 'communityStats.postsCreated': -1 });
analyticsSchema.index({ updatedAt: -1 });

// Pre-save middleware to calculate derived statistics
analyticsSchema.pre('save', function(next) {
  // Calculate success rate
  if (this.submissionStats.totalSubmissions > 0) {
    this.submissionStats.successRate = (this.submissionStats.acceptedSubmissions / this.submissionStats.totalSubmissions) * 100;
  }
  
  // Calculate problem solving success rate
  if (this.problemStats.problemsAttempted > 0) {
    this.problemStats.successRate = (this.problemStats.problemsSolved / this.problemStats.problemsAttempted) * 100;
  }
  
  // Calculate average contest rank
  if (this.contestStats.contestsParticipated > 0) {
    this.contestStats.averageRank = this.contestStats.totalScore / this.contestStats.contestsParticipated;
  }
  
  next();
});

// Methods
analyticsSchema.methods.updateContestStats = function(contestData) {
  this.contestStats.totalContests += 1;
  this.contestStats.contestsParticipated += 1;
  this.contestStats.totalScore += contestData.score || 0;
  
  if (contestData.rank) {
    if (contestData.rank === 1) {
      this.contestStats.contestsWon += 1;
    }
    
    if (!this.contestStats.bestRank || contestData.rank < this.contestStats.bestRank) {
      this.contestStats.bestRank = contestData.rank;
    }
    
    if (!this.contestStats.worstRank || contestData.rank > this.contestStats.worstRank) {
      this.contestStats.worstRank = contestData.rank;
    }
  }
  
  return this.save();
};

analyticsSchema.methods.updateProblemStats = function(problemData) {
  this.problemStats.problemsAttempted += 1;
  
  if (problemData.status === 'accepted') {
    this.problemStats.problemsSolved += 1;
  }
  
  if (problemData.executionTime) {
    const totalTime = this.problemStats.averageTime * (this.problemStats.problemsAttempted - 1) + problemData.executionTime;
    this.problemStats.averageTime = totalTime / this.problemStats.problemsAttempted;
  }
  
  if (problemData.memoryUsed) {
    const totalMemory = this.problemStats.averageMemory * (this.problemStats.problemsAttempted - 1) + problemData.memoryUsed;
    this.problemStats.averageMemory = totalMemory / this.problemStats.problemsAttempted;
  }
  
  return this.save();
};

analyticsSchema.methods.updateSubmissionStats = function(submissionData) {
  this.submissionStats.totalSubmissions += 1;
  
  switch (submissionData.status) {
    case 'accepted':
      this.submissionStats.acceptedSubmissions += 1;
      break;
    case 'compilation_error':
      this.submissionStats.compilationErrors += 1;
      break;
    case 'runtime_error':
      this.submissionStats.runtimeErrors += 1;
      break;
    case 'time_limit_exceeded':
      this.submissionStats.timeLimitExceeded += 1;
      break;
    case 'memory_limit_exceeded':
      this.submissionStats.memoryLimitExceeded += 1;
      break;
    default:
      this.submissionStats.rejectedSubmissions += 1;
  }
  
  return this.save();
};

analyticsSchema.methods.updateCommunityStats = function(action, data) {
  switch (action) {
    case 'join_community':
      this.communityStats.communitiesJoined += 1;
      break;
    case 'create_community':
      this.communityStats.communitiesCreated += 1;
      break;
    case 'create_post':
      this.communityStats.postsCreated += 1;
      break;
    case 'make_comment':
      this.communityStats.commentsMade += 1;
      break;
    case 'receive_like':
      this.communityStats.likesReceived += 1;
      break;
    case 'give_like':
      this.communityStats.likesGiven += 1;
      break;
  }
  
  return this.save();
};

analyticsSchema.methods.updateSkillProgress = function(skill, progress, problemsSolved) {
  let skillEntry = this.skillProgress.find(s => s.skill === skill);
  
  if (!skillEntry) {
    skillEntry = {
      skill: skill,
      level: 'beginner',
      progress: 0,
      problemsSolved: 0,
      lastUpdated: new Date()
    };
    this.skillProgress.push(skillEntry);
  }
  
  skillEntry.progress = progress;
  skillEntry.problemsSolved = problemsSolved;
  skillEntry.lastUpdated = new Date();
  
  // Update skill level based on progress
  if (progress >= 90) skillEntry.level = 'expert';
  else if (progress >= 70) skillEntry.level = 'advanced';
  else if (progress >= 40) skillEntry.level = 'intermediate';
  else skillEntry.level = 'beginner';
  
  return this.save();
};

analyticsSchema.methods.updateLanguageStats = function(language, submissionData) {
  let languageEntry = this.languageStats.find(l => l.language === language);
  
  if (!languageEntry) {
    languageEntry = {
      language: language,
      problemsSolved: 0,
      totalSubmissions: 0,
      successRate: 0,
      averageTime: 0,
      lastUsed: new Date()
    };
    this.languageStats.push(languageEntry);
  }
  
  languageEntry.totalSubmissions += 1;
  languageEntry.lastUsed = new Date();
  
  if (submissionData.status === 'accepted') {
    languageEntry.problemsSolved += 1;
  }
  
  if (submissionData.executionTime) {
    const totalTime = languageEntry.averageTime * (languageEntry.totalSubmissions - 1) + submissionData.executionTime;
    languageEntry.averageTime = totalTime / languageEntry.totalSubmissions;
  }
  
  languageEntry.successRate = (languageEntry.problemsSolved / languageEntry.totalSubmissions) * 100;
  
  return this.save();
};

analyticsSchema.methods.addAchievement = function(achievement) {
  const existingAchievement = this.achievements.find(a => a.name === achievement.name);
  
  if (!existingAchievement) {
    this.achievements.push(achievement);
    return this.save();
  }
  
  return Promise.resolve(this);
};

analyticsSchema.methods.updateStreaks = function(action) {
  const now = new Date();
  
  if (action === 'login') {
    if (this.streaks.lastLoginDate) {
      const daysDiff = Math.floor((now - this.streaks.lastLoginDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        this.streaks.currentLoginStreak += 1;
        if (this.streaks.currentLoginStreak > this.streaks.longestLoginStreak) {
          this.streaks.longestLoginStreak = this.streaks.currentLoginStreak;
        }
      } else if (daysDiff > 1) {
        this.streaks.currentLoginStreak = 1;
      }
    } else {
      this.streaks.currentLoginStreak = 1;
    }
    
    this.streaks.lastLoginDate = now;
  }
  
  if (action === 'solve_problem') {
    if (this.streaks.lastProblemSolvedDate) {
      const daysDiff = Math.floor((now - this.streaks.lastProblemSolvedDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        this.streaks.currentProblemStreak += 1;
        if (this.streaks.currentProblemStreak > this.streaks.longestProblemStreak) {
          this.streaks.longestProblemStreak = this.streaks.currentProblemStreak;
        }
      } else if (daysDiff > 1) {
        this.streaks.currentProblemStreak = 1;
      }
    } else {
      this.streaks.currentProblemStreak = 1;
    }
    
    this.streaks.lastProblemSolvedDate = now;
  }
  
  return this.save();
};

module.exports = mongoose.model('Analytics', analyticsSchema);
