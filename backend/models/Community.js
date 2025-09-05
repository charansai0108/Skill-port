const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Community name is required'],
        trim: true,
        maxlength: [100, 'Community name cannot exceed 100 characters']
    },
    code: {
        type: String,
        required: [true, 'Community code is required'],
        unique: true,
        uppercase: true,
        match: [/^[A-Z0-9]{2,10}$/, 'Community code must be 2-10 uppercase letters/numbers']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    admin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mentors: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    students: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    batches: [{
        name: {
            type: String,
            required: true
        },
        description: String,
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        students: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }]
    }],
    contests: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Contest'
    }],
    settings: {
        allowStudentRegistration: {
            type: Boolean,
            default: true
        },
        requireEmailVerification: {
            type: Boolean,
            default: true
        },
        maxStudentsPerBatch: {
            type: Number,
            default: 50
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
CommunitySchema.index({ code: 1 });
CommunitySchema.index({ admin: 1 });
CommunitySchema.index({ isActive: 1 });

// Virtual for total members
CommunitySchema.virtual('totalMembers').get(function() {
    return this.mentors.length + this.students.length + 1; // +1 for admin
});

// Method to add mentor
CommunitySchema.methods.addMentor = function(mentorId) {
    if (!this.mentors.includes(mentorId)) {
        this.mentors.push(mentorId);
        return this.save();
    }
    return Promise.resolve(this);
};

    // Method to add student
CommunitySchema.methods.addStudent = function(studentId) {
    if (!this.students.includes(studentId)) {
        this.students.push(studentId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to add contest
CommunitySchema.methods.addContest = function(contestId) {
    if (!this.contests.includes(contestId)) {
        this.contests.push(contestId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to remove mentor
CommunitySchema.methods.removeMentor = function(mentorId) {
    this.mentors = this.mentors.filter(id => !id.equals(mentorId));
    return this.save();
};

// Method to remove student
CommunitySchema.methods.removeStudent = function(studentId) {
    this.students = this.students.filter(id => !id.equals(studentId));
    return this.save();
};

// Method to create batch
CommunitySchema.methods.createBatch = function(batchData, createdBy) {
    const batch = {
        name: batchData.name,
        description: batchData.description || '',
        createdBy: createdBy,
        students: []
    };
    this.batches.push(batch);
    return this.save();
};

module.exports = mongoose.model('Community', CommunitySchema);