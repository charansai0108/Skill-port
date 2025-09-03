const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Contest title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Contest description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    
    // Community and Creator
    community: {
        type: mongoose.Schema.ObjectId,
        ref: 'Community',
        required: [true, 'Community is required']
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required']
    },
    
    // Contest Type and Configuration
    type: {
        type: String,
        enum: ['individual', 'team', 'practice'],
        default: 'individual'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
        default: 'mixed'
    },
    category: {
        type: String,
        enum: ['algorithms', 'web-development', 'mobile-development', 'data-structures', 'database', 'machine-learning', 'cybersecurity', 'general'],
        default: 'algorithms'
    },
    
    // Timing
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Duration is required']
    },
    
    // Registration
    registrationStart: {
        type: Date,
        required: [true, 'Registration start is required']
    },
    registrationEnd: {
        type: Date,
        required: [true, 'Registration end is required']
    },
    maxParticipants: {
        type: Number,
        default: 100,
        min: [1, 'Max participants must be at least 1']
    },
    
    // Contest Rules and Settings
    rules: {
        allowedLanguages: [{
            type: String,
            enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'php', 'ruby', 'kotlin', 'swift']
        }],
        scoringSystem: {
            type: String,
            enum: ['icpc', 'ioi', 'custom'],
            default: 'icpc'
        },
        penaltyPerWrongSubmission: {
            type: Number,
            default: 20 // minutes
        },
        allowPartialScoring: {
            type: Boolean,
            default: false
        },
        allowClarifications: {
            type: Boolean,
            default: true
        }
    },
    
    // Problems
    problems: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },
        points: {
            type: Number,
            default: 100
        },
        timeLimit: {
            type: Number, // in seconds
            default: 1
        },
        memoryLimit: {
            type: Number, // in MB
            default: 256
        },
        sampleInput: String,
        sampleOutput: String,
        testCases: [{
            input: String,
            output: String,
            isHidden: { type: Boolean, default: true }
        }],
        tags: [String],
        order: {
            type: Number,
            default: 1
        }
    }],
    
    // Participants and Teams
    participants: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        team: {
            name: String,
            members: [{
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }]
        },
        status: {
            type: String,
            enum: ['registered', 'participating', 'completed', 'disqualified'],
            default: 'registered'
        }
    }],
    
    // Submissions
    submissions: [{
        participant: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        problem: {
            type: Number, // problem index
            required: true
        },
        language: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'],
            default: 'pending'
        },
        score: {
            type: Number,
            default: 0
        },
        executionTime: Number, // in ms
        memoryUsed: Number, // in KB
        testCasesPassed: {
            type: Number,
            default: 0
        },
        totalTestCases: {
            type: Number,
            default: 0
        }
    }],
    
    // Leaderboard and Results
    leaderboard: [{
        participant: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        rank: {
            type: Number,
            required: true
        },
        totalScore: {
            type: Number,
            default: 0
        },
        problemsSolved: {
            type: Number,
            default: 0
        },
        totalTime: {
            type: Number, // in minutes
            default: 0
        },
        penalty: {
            type: Number,
            default: 0
        },
        problemScores: [{
            problem: Number,
            score: Number,
            attempts: Number,
            solvedAt: Date,
            timeToSolve: Number // in minutes from contest start
        }]
    }],
    
    // Contest Status
    status: {
        type: String,
        enum: ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
        default: 'draft'
    },
    
    // Prizes and Rewards
    prizes: [{
        rank: {
            type: Number,
            required: true
        },
        title: String,
        description: String,
        points: {
            type: Number,
            default: 0
        },
        certificate: {
            type: Boolean,
            default: false
        }
    }],
    
    // Analytics and Statistics
    stats: {
        totalParticipants: { type: Number, default: 0 },
        totalSubmissions: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        problemStats: [{
            problem: Number,
            totalSubmissions: { type: Number, default: 0 },
            acceptedSubmissions: { type: Number, default: 0 },
            averageAttempts: { type: Number, default: 0 }
        }]
    },
    
    // Clarifications
    clarifications: [{
        participant: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        problem: Number, // problem index, null for general
        question: {
            type: String,
            required: true
        },
        answer: String,
        isPublic: {
            type: Boolean,
            default: false
        },
        askedAt: {
            type: Date,
            default: Date.now
        },
        answeredAt: Date,
        answeredBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    }],
    
    // Settings
    settings: {
        showLeaderboardDuringContest: {
            type: Boolean,
            default: true
        },
        freezeLeaderboard: {
            type: Boolean,
            default: false
        },
        freezeTime: Number, // minutes before end
        allowLateSubmissions: {
            type: Boolean,
            default: false
        },
        autoPublishResults: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
ContestSchema.index({ community: 1, status: 1 });
ContestSchema.index({ startTime: 1, endTime: 1 });
ContestSchema.index({ 'participants.user': 1 });
ContestSchema.index({ 'submissions.participant': 1, 'submissions.submittedAt': -1 });

// Virtual for contest duration in hours
ContestSchema.virtual('durationHours').get(function() {
    return this.duration / 60;
});

// Virtual for registration status
ContestSchema.virtual('registrationStatus').get(function() {
    const now = new Date();
    if (now < this.registrationStart) return 'not_started';
    if (now > this.registrationEnd) return 'closed';
    return 'open';
});

// Virtual for contest phase
ContestSchema.virtual('phase').get(function() {
    const now = new Date();
    if (now < this.registrationStart) return 'upcoming';
    if (now < this.startTime) return 'registration';
    if (now < this.endTime) return 'running';
    return 'ended';
});

// Virtual for participants count
ContestSchema.virtual('participantCount').get(function() {
    return this.participants.length;
});

// Pre-save middleware to validate dates
ContestSchema.pre('save', function(next) {
    if (this.registrationStart >= this.registrationEnd) {
        return next(new Error('Registration end must be after registration start'));
    }
    if (this.registrationEnd > this.startTime) {
        return next(new Error('Contest start must be after registration end'));
    }
    if (this.startTime >= this.endTime) {
        return next(new Error('Contest end must be after contest start'));
    }
    
    // Calculate duration from start and end time
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
    
    next();
});

// Method to register participant
ContestSchema.methods.registerParticipant = function(userId, teamData = null) {
    // Check if already registered
    const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
    if (existingParticipant) {
        throw new Error('User is already registered for this contest');
    }
    
    // Check registration limits
    if (this.participants.length >= this.maxParticipants) {
        throw new Error('Contest is full');
    }
    
    // Check registration timing
    const now = new Date();
    if (now < this.registrationStart || now > this.registrationEnd) {
        throw new Error('Registration is not open');
    }
    
    const participant = {
        user: userId,
        registeredAt: now,
        status: 'registered'
    };
    
    if (this.type === 'team' && teamData) {
        participant.team = teamData;
    }
    
    this.participants.push(participant);
    this.stats.totalParticipants = this.participants.length;
    
    return participant;
};

// Method to submit solution
ContestSchema.methods.submitSolution = function(userId, problemIndex, language, code) {
    // Check if contest is running
    const now = new Date();
    if (now < this.startTime || now > this.endTime) {
        throw new Error('Contest is not running');
    }
    
    // Check if user is registered
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (!participant) {
        throw new Error('User is not registered for this contest');
    }
    
    // Check if problem exists
    if (problemIndex < 0 || problemIndex >= this.problems.length) {
        throw new Error('Invalid problem index');
    }
    
    const submission = {
        participant: userId,
        problem: problemIndex,
        language,
        code,
        submittedAt: now,
        status: 'pending'
    };
    
    this.submissions.push(submission);
    this.stats.totalSubmissions = this.submissions.length;
    
    return submission;
};

// Method to update leaderboard
ContestSchema.methods.updateLeaderboard = function() {
    const participantScores = new Map();
    
    // Initialize participant scores
    this.participants.forEach(p => {
        participantScores.set(p.user.toString(), {
            participant: p.user,
            totalScore: 0,
            problemsSolved: 0,
            totalTime: 0,
            penalty: 0,
            problemScores: new Array(this.problems.length).fill(null).map((_, i) => ({
                problem: i,
                score: 0,
                attempts: 0,
                solvedAt: null,
                timeToSolve: 0
            }))
        });
    });
    
    // Process submissions
    this.submissions
        .sort((a, b) => a.submittedAt - b.submittedAt)
        .forEach(sub => {
            const participantId = sub.participant.toString();
            const participantScore = participantScores.get(participantId);
            
            if (!participantScore) return;
            
            const problemScore = participantScore.problemScores[sub.problem];
            problemScore.attempts++;
            
            if (sub.status === 'accepted' && problemScore.score === 0) {
                // First accepted solution
                problemScore.score = this.problems[sub.problem].points;
                problemScore.solvedAt = sub.submittedAt;
                problemScore.timeToSolve = Math.round((sub.submittedAt - this.startTime) / (1000 * 60));
                
                participantScore.totalScore += problemScore.score;
                participantScore.problemsSolved++;
                participantScore.totalTime += problemScore.timeToSolve;
                
                // Add penalty for wrong attempts
                participantScore.penalty += (problemScore.attempts - 1) * this.rules.penaltyPerWrongSubmission;
            }
        });
    
    // Convert to array and sort
    const leaderboard = Array.from(participantScores.values())
        .sort((a, b) => {
            if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
            if (a.problemsSolved !== b.problemsSolved) return b.problemsSolved - a.problemsSolved;
            return (a.totalTime + a.penalty) - (b.totalTime + b.penalty);
        })
        .map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
    
    this.leaderboard = leaderboard;
    
    // Update stats
    if (leaderboard.length > 0) {
        this.stats.averageScore = leaderboard.reduce((sum, p) => sum + p.totalScore, 0) / leaderboard.length;
        this.stats.completionRate = (leaderboard.filter(p => p.problemsSolved > 0).length / leaderboard.length) * 100;
    }
    
    return leaderboard;
};

// Method to add clarification
ContestSchema.methods.addClarification = function(participantId, problemIndex, question) {
    const clarification = {
        participant: participantId,
        problem: problemIndex,
        question,
        askedAt: new Date()
    };
    
    this.clarifications.push(clarification);
    return clarification;
};

// Method to answer clarification
ContestSchema.methods.answerClarification = function(clarificationId, answer, answeredBy, isPublic = false) {
    const clarification = this.clarifications.id(clarificationId);
    if (!clarification) {
        throw new Error('Clarification not found');
    }
    
    clarification.answer = answer;
    clarification.answeredBy = answeredBy;
    clarification.answeredAt = new Date();
    clarification.isPublic = isPublic;
    
    return clarification;
};

// Static method to get upcoming contests
ContestSchema.statics.getUpcomingContests = function(communityId = null, limit = 10) {
    const match = {
        startTime: { $gt: new Date() },
        status: { $in: ['published', 'registration_open'] }
    };
    
    if (communityId) {
        match.community = mongoose.Types.ObjectId(communityId);
    }
    
    return this.find(match)
        .populate('community', 'name code')
        .populate('createdBy', 'firstName lastName')
        .sort({ startTime: 1 })
        .limit(limit);
};

// Static method to get contest statistics
ContestSchema.statics.getContestStats = function(communityId) {
    return this.aggregate([
        { $match: { community: mongoose.Types.ObjectId(communityId) } },
        {
            $group: {
                _id: null,
                totalContests: { $sum: 1 },
                activeContests: {
                    $sum: {
                        $cond: [
                            { $eq: ['$status', 'ongoing'] },
                            1,
                            0
                        ]
                    }
                },
                totalParticipants: { $sum: '$stats.totalParticipants' },
                totalSubmissions: { $sum: '$stats.totalSubmissions' }
            }
        }
    ]);
};

module.exports = mongoose.model('Contest', ContestSchema);