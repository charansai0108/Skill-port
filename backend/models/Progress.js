const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    // User and Community Reference
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    community: {
        type: mongoose.Schema.ObjectId,
        ref: 'Community',
        required: function() {
            return this.user && ['student', 'mentor'].includes(this.user.role);
        }
    },
    
    // Progress Type
    type: {
        type: String,
        enum: ['skill', 'course', 'project', 'contest', 'extension'],
        required: [true, 'Progress type is required']
    },
    
    // Skill/Course Information
    skillName: {
        type: String,
        required: function() {
            return ['skill', 'course'].includes(this.type);
        }
    },
    category: {
        type: String,
        enum: ['algorithms', 'web-development', 'mobile-development', 'data-structures', 'database', 'machine-learning', 'cybersecurity', 'devops', 'other'],
        required: function() {
            return ['skill', 'course'].includes(this.type);
        }
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner'
    },
    
    // Progress Metrics
    totalProblems: {
        type: Number,
        default: 0
    },
    solvedProblems: {
        type: Number,
        default: 0
    },
    progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    // Points and Scoring
    totalPoints: {
        type: Number,
        default: 0
    },
    weeklyPoints: {
        type: Number,
        default: 0
    },
    monthlyPoints: {
        type: Number,
        default: 0
    },
    
    // Time Tracking
    timeSpent: {
        type: Number, // in minutes
        default: 0
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    
    // Streak Information
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastStreakDate: {
        type: Date,
        default: Date.now
    },
    
    // Platform-specific data (for extension)
    platformData: {
        leetcode: {
            username: String,
            totalSolved: { type: Number, default: 0 },
            easySolved: { type: Number, default: 0 },
            mediumSolved: { type: Number, default: 0 },
            hardSolved: { type: Number, default: 0 },
            ranking: Number,
            lastSync: Date
        },
        hackerrank: {
            username: String,
            totalSolved: { type: Number, default: 0 },
            points: { type: Number, default: 0 },
            rank: String,
            lastSync: Date
        },
        codechef: {
            username: String,
            totalSolved: { type: Number, default: 0 },
            rating: Number,
            stars: Number,
            lastSync: Date
        },
        codeforces: {
            username: String,
            totalSolved: { type: Number, default: 0 },
            rating: Number,
            rank: String,
            lastSync: Date
        }
    },
    
    // Weekly Progress Tracking
    weeklyProgress: [{
        week: {
            type: String, // Format: 'YYYY-WW'
            required: true
        },
        problemsSolved: {
            type: Number,
            default: 0
        },
        timeSpent: {
            type: Number,
            default: 0
        },
        pointsEarned: {
            type: Number,
            default: 0
        },
        dailyActivity: [{
            date: Date,
            problemsSolved: { type: Number, default: 0 },
            timeSpent: { type: Number, default: 0 },
            points: { type: Number, default: 0 }
        }]
    }],
    
    // Achievements and Milestones
    achievements: [{
        type: {
            type: String,
            enum: ['first_solve', 'streak_milestone', 'points_milestone', 'skill_completion', 'contest_win', 'project_completion']
        },
        title: String,
        description: String,
        earnedAt: {
            type: Date,
            default: Date.now
        },
        points: {
            type: Number,
            default: 0
        }
    }],
    
    // Goals and Targets
    goals: {
        dailyTarget: {
            type: Number,
            default: 1
        },
        weeklyTarget: {
            type: Number,
            default: 7
        },
        monthlyTarget: {
            type: Number,
            default: 30
        },
        customGoals: [{
            title: String,
            target: Number,
            current: { type: Number, default: 0 },
            deadline: Date,
            isCompleted: { type: Boolean, default: false },
            completedAt: Date
        }]
    },
    
    // Status and Metadata
    status: {
        type: String,
        enum: ['active', 'paused', 'completed'],
        default: 'active'
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    tags: [String]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
ProgressSchema.index({ user: 1, type: 1, skillName: 1 });
ProgressSchema.index({ community: 1, type: 1 });
ProgressSchema.index({ user: 1, lastActivity: -1 });
ProgressSchema.index({ 'weeklyProgress.week': 1 });

// Virtual for completion percentage
ProgressSchema.virtual('completionRate').get(function() {
    if (this.totalProblems === 0) return 0;
    return Math.round((this.solvedProblems / this.totalProblems) * 100);
});

// Virtual for current week
ProgressSchema.virtual('currentWeek').get(function() {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil((now - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-${String(week).padStart(2, '0')}`;
});

// Pre-save middleware to update progress percentage
ProgressSchema.pre('save', function(next) {
    if (this.totalProblems > 0) {
        this.progressPercentage = Math.round((this.solvedProblems / this.totalProblems) * 100);
    }
    next();
});

// Method to update streak
ProgressSchema.methods.updateStreak = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastStreakDate = new Date(this.lastStreakDate);
    lastStreakDate.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastStreakDate.getTime() === today.getTime()) {
        // Already updated today
        return this.currentStreak;
    } else if (lastStreakDate.getTime() === yesterday.getTime()) {
        // Continue streak
        this.currentStreak += 1;
        this.lastStreakDate = today;
        
        if (this.currentStreak > this.longestStreak) {
            this.longestStreak = this.currentStreak;
        }
    } else {
        // Reset streak
        this.currentStreak = 1;
        this.lastStreakDate = today;
    }
    
    return this.currentStreak;
};

// Method to add weekly progress
ProgressSchema.methods.addWeeklyProgress = function(problemsSolved, timeSpent, points) {
    const currentWeek = this.currentWeek;
    
    let weeklyEntry = this.weeklyProgress.find(wp => wp.week === currentWeek);
    
    if (!weeklyEntry) {
        weeklyEntry = {
            week: currentWeek,
            problemsSolved: 0,
            timeSpent: 0,
            pointsEarned: 0,
            dailyActivity: []
        };
        this.weeklyProgress.push(weeklyEntry);
    }
    
    // Update weekly totals
    weeklyEntry.problemsSolved += problemsSolved;
    weeklyEntry.timeSpent += timeSpent;
    weeklyEntry.pointsEarned += points;
    
    // Add daily activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyEntry = weeklyEntry.dailyActivity.find(da => 
        new Date(da.date).setHours(0, 0, 0, 0) === today.getTime()
    );
    
    if (!dailyEntry) {
        dailyEntry = {
            date: today,
            problemsSolved: 0,
            timeSpent: 0,
            points: 0
        };
        weeklyEntry.dailyActivity.push(dailyEntry);
    }
    
    dailyEntry.problemsSolved += problemsSolved;
    dailyEntry.timeSpent += timeSpent;
    dailyEntry.points += points;
    
    return weeklyEntry;
};

// Method to add achievement
ProgressSchema.methods.addAchievement = function(type, title, description, points = 0) {
    const achievement = {
        type,
        title,
        description,
        points,
        earnedAt: new Date()
    };
    
    this.achievements.push(achievement);
    this.totalPoints += points;
    
    return achievement;
};

// Method to update platform data
ProgressSchema.methods.updatePlatformData = function(platform, data) {
    if (!this.platformData) {
        this.platformData = {};
    }
    
    if (!this.platformData[platform]) {
        this.platformData[platform] = {};
    }
    
    Object.assign(this.platformData[platform], data);
    this.platformData[platform].lastSync = new Date();
    
    return this.platformData[platform];
};

// Static method to get user's overall progress
ProgressSchema.statics.getUserOverallProgress = async function(userId) {
    const progress = await this.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalPoints: { $sum: '$totalPoints' },
                totalProblems: { $sum: '$totalProblems' },
                totalSolved: { $sum: '$solvedProblems' },
                totalTimeSpent: { $sum: '$timeSpent' },
                averageProgress: { $avg: '$progressPercentage' },
                skillCount: { $sum: 1 },
                achievements: { $sum: { $size: '$achievements' } }
            }
        }
    ]);
    
    return progress[0] || {
        totalPoints: 0,
        totalProblems: 0,
        totalSolved: 0,
        totalTimeSpent: 0,
        averageProgress: 0,
        skillCount: 0,
        achievements: 0
    };
};

// Static method to get leaderboard
ProgressSchema.statics.getLeaderboard = async function(communityId, limit = 10) {
    const matchStage = communityId ? { community: new mongoose.Types.ObjectId(communityId) } : {};
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$user',
                totalPoints: { $sum: '$totalPoints' },
                totalSolved: { $sum: '$solvedProblems' },
                averageProgress: { $avg: '$progressPercentage' }
            }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $project: {
                _id: 1,
                totalPoints: 1,
                totalSolved: 1,
                averageProgress: 1,
                'user.firstName': 1,
                'user.lastName': 1,
                'user.avatar': 1,
                'user.studentId': 1
            }
        }
    ]);
};

module.exports = mongoose.model('Progress', ProgressSchema);
