const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    // Basic Information
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
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Visual Branding
    logo: {
        type: String,
        default: null
    },
    banner: {
        type: String,
        default: null
    },
    primaryColor: {
        type: String,
        default: '#3B82F6',
        match: [/^#[0-9A-F]{6}$/i, 'Primary color must be a valid hex color']
    },
    secondaryColor: {
        type: String,
        default: '#1E40AF',
        match: [/^#[0-9A-F]{6}$/i, 'Secondary color must be a valid hex color']
    },
    
    // Community Admin
    admin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [false, 'Community admin is required']
    },
    
    // Status and Settings
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    allowSelfRegistration: {
        type: Boolean,
        default: false
    },
    
    // Limits and Quotas
    maxStudents: {
        type: Number,
        default: 100,
        min: [1, 'Max students must be at least 1'],
        max: [1000, 'Max students cannot exceed 1000']
    },
    maxMentors: {
        type: Number,
        default: 10,
        min: [1, 'Max mentors must be at least 1'],
        max: [50, 'Max mentors cannot exceed 50']
    },
    maxBatches: {
        type: Number,
        default: 10,
        min: [1, 'Max batches must be at least 1'],
        max: [50, 'Max batches cannot exceed 50']
    },
    
    // Batches Configuration
    batches: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            uppercase: true
        },
        description: String,
        startDate: Date,
        endDate: Date,
        maxStudents: {
            type: Number,
            default: 50
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'completed'],
            default: 'active'
        },
        mentors: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }]
    }],
    
    // Features and Modules
    features: {
        contests: { type: Boolean, default: true },
        leaderboard: { type: Boolean, default: true },
        certificates: { type: Boolean, default: true },
        mentorship: { type: Boolean, default: true },
        projects: { type: Boolean, default: true },
        discussions: { type: Boolean, default: true },
        analytics: { type: Boolean, default: true }
    },
    
    // Statistics
    stats: {
        totalStudents: { type: Number, default: 0 },
        totalMentors: { type: Number, default: 0 },
        totalContests: { type: Number, default: 0 },
        totalProjects: { type: Number, default: 0 },
        averageProgress: { type: Number, default: 0 }
    },
    
    // Contact Information
    contactInfo: {
        email: {
            type: String,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email'
            ]
        },
        phone: String,
        website: String,
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        }
    },
    
    // Social Links
    socialLinks: {
        website: String,
        linkedin: String,
        twitter: String,
        github: String,
        discord: String
    },
    
    // Subscription and Billing (for future use)
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: 'free'
        },
        expiresAt: Date,
        isActive: { type: Boolean, default: true }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
CommunitySchema.index({ code: 1 });
CommunitySchema.index({ admin: 1 });
CommunitySchema.index({ status: 1 });
CommunitySchema.index({ 'batches.code': 1 });

// Virtual for active students count
CommunitySchema.virtual('activeStudentsCount', {
    ref: 'User',
    localField: '_id',
    foreignField: 'community',
    count: true,
    match: { role: 'student', status: 'active' }
});

// Virtual for active mentors count
CommunitySchema.virtual('activeMentorsCount', {
    ref: 'User',
    localField: '_id',
    foreignField: 'community',
    count: true,
    match: { role: 'mentor', status: 'active' }
});

// Pre-save middleware to update stats
CommunitySchema.pre('save', async function(next) {
    if (this.isModified('batches')) {
        // Update batch codes if not set
        this.batches.forEach((batch, index) => {
            if (!batch.code) {
                batch.code = `${this.code}-B${String(index + 1).padStart(2, '0')}`;
            }
        });
    }
    next();
});

// Method to add a batch
CommunitySchema.methods.addBatch = function(batchData) {
    if (this.batches.length >= this.maxBatches) {
        throw new Error('Maximum number of batches reached');
    }
    
    const batchCode = batchData.code || `${this.code}-B${String(this.batches.length + 1).padStart(2, '0')}`;
    
    this.batches.push({
        ...batchData,
        code: batchCode
    });
    
    return this.save();
};

// Method to get batch by code
CommunitySchema.methods.getBatchByCode = function(batchCode) {
    return this.batches.find(batch => batch.code === batchCode);
};

// Method to check if user can join
CommunitySchema.methods.canAddStudent = function() {
    return this.stats.totalStudents < this.maxStudents;
};

// Method to check if mentor can be added
CommunitySchema.methods.canAddMentor = function() {
    return this.stats.totalMentors < this.maxMentors;
};

// Method to update statistics
CommunitySchema.methods.updateStats = async function() {
    const User = mongoose.model('User');
    const Contest = mongoose.model('Contest');
    const Project = mongoose.model('Project');
    
    const [studentCount, mentorCount, contestCount, projectCount] = await Promise.all([
        User.countDocuments({ community: this._id, role: 'student', status: 'active' }),
        User.countDocuments({ community: this._id, role: 'mentor', status: 'active' }),
        Contest.countDocuments({ community: this._id }),
        Project.countDocuments({ community: this._id })
    ]);
    
    // Calculate average progress (placeholder - implement based on your progress model)
    const students = await User.find({ community: this._id, role: 'student', status: 'active' });
    const averageProgress = students.length > 0 
        ? students.reduce((sum, student) => sum + (student.totalPoints || 0), 0) / students.length 
        : 0;
    
    this.stats = {
        totalStudents: studentCount,
        totalMentors: mentorCount,
        totalContests: contestCount,
        totalProjects: projectCount,
        averageProgress: Math.round(averageProgress)
    };
    
    return this.save();
};

module.exports = mongoose.model('Community', CommunitySchema);