const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Contest title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Contest description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    community: {
        type: mongoose.Schema.ObjectId,
        ref: 'Community',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    assignedMentor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    assignedBatch: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
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
            required: true
        },
        points: {
            type: Number,
            required: true,
            min: 1
        },
        testCases: [{
            input: String,
            expectedOutput: String,
            isHidden: {
                type: Boolean,
                default: false
            }
        }],
        constraints: String,
        sampleInput: String,
        sampleOutput: String
    }],
    participants: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        score: {
            type: Number,
            default: 0
        },
        solvedProblems: [{
            problemIndex: Number,
            solvedAt: Date,
            attempts: Number
        }]
    }],
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
        default: 'draft'
    },
    settings: {
        allowLateSubmission: {
            type: Boolean,
            default: false
        },
        showLeaderboard: {
            type: Boolean,
            default: true
        },
        maxAttemptsPerProblem: {
            type: Number,
            default: 10
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
ContestSchema.index({ community: 1, status: 1 });
ContestSchema.index({ createdBy: 1 });
ContestSchema.index({ startDate: 1, endDate: 1 });

// Virtual for total points
ContestSchema.virtual('totalPoints').get(function() {
    return this.problems.reduce((total, problem) => total + problem.points, 0);
});

// Virtual for participant count
ContestSchema.virtual('participantCount').get(function() {
    return this.participants.length;
});

// Method to add participant
ContestSchema.methods.addParticipant = function(userId) {
    const existingParticipant = this.participants.find(p => p.user.equals(userId));
    if (!existingParticipant) {
        this.participants.push({
            user: userId,
            joinedAt: new Date(),
            score: 0,
            solvedProblems: []
        });
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to update participant score
ContestSchema.methods.updateParticipantScore = function(userId, problemIndex, points) {
    const participant = this.participants.find(p => p.user.equals(userId));
    if (participant) {
        const existingProblem = participant.solvedProblems.find(p => p.problemIndex === problemIndex);
        if (existingProblem) {
            existingProblem.solvedAt = new Date();
            existingProblem.attempts += 1;
        } else {
            participant.solvedProblems.push({
                problemIndex,
                solvedAt: new Date(),
                attempts: 1
            });
        }
        participant.score += points;
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to check if contest is active
ContestSchema.methods.isActive = function() {
    const now = new Date();
    return this.status === 'active' && this.startDate <= now && this.endDate >= now;
};

// Method to check if user can participate
ContestSchema.methods.canParticipate = function(userId, userRole, userBatch) {
    // Check if contest is active
    if (!this.isActive()) return false;
    
    // Check if user is already participating
    const isParticipating = this.participants.some(p => p.user.equals(userId));
    if (isParticipating) return true;
    
    // Check if user is in the assigned batch
    if (userRole === 'student' && userBatch !== this.assignedBatch) {
        return false;
    }
    
    return true;
};

module.exports = mongoose.model('Contest', ContestSchema);