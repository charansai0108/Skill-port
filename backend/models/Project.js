const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    
    // Owner and Community
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Project owner is required']
    },
    community: {
        type: mongoose.Schema.ObjectId,
        ref: 'Community',
        required: function() {
            return this.owner && ['student', 'mentor'].includes(this.owner.role);
        }
    },
    
    // Project Details
    category: {
        type: String,
        enum: ['web-development', 'mobile-development', 'desktop-application', 'machine-learning', 'data-science', 'game-development', 'cybersecurity', 'blockchain', 'iot', 'other'],
        required: [true, 'Project category is required']
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
        default: 'planning'
    },
    
    // Technologies and Skills
    technologies: [{
        name: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['frontend', 'backend', 'database', 'framework', 'library', 'tool', 'language', 'other'],
            default: 'other'
        }
    }],
    skillsRequired: [{
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'react', 'nodejs', 'mongodb', 'sql', 'git', 'docker', 'aws', 'other']
    }],
    
    // Timeline
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    estimatedHours: {
        type: Number,
        min: 0
    },
    actualHours: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Project Links and Resources
    githubUrl: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https:\/\/github\.com\//.test(v);
            },
            message: 'GitHub URL must start with https://github.com/'
        }
    },
    liveUrl: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\//.test(v);
            },
            message: 'Live URL must be a valid URL'
        }
    },
    documentationUrl: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\//.test(v);
            },
            message: 'Documentation URL must be a valid URL'
        }
    },
    
    // Media and Files
    images: [{
        url: String,
        caption: String,
        isPrimary: { type: Boolean, default: false }
    }],
    files: [{
        name: String,
        url: String,
        size: Number, // in bytes
        type: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Features and Milestones
    keyFeatures: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        isCompleted: {
            type: Boolean,
            default: false
        },
        completedAt: Date
    }],
    milestones: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        dueDate: Date,
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'overdue'],
            default: 'pending'
        },
        completedAt: Date
    }],
    
    // Collaboration
    collaborators: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'collaborator', 'contributor', 'reviewer'],
            default: 'collaborator'
        },
        permissions: {
            canEdit: { type: Boolean, default: false },
            canDelete: { type: Boolean, default: false },
            canInvite: { type: Boolean, default: false },
            canManage: { type: Boolean, default: false }
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        contribution: String
    }],
    
    // Reviews and Feedback
    reviews: [{
        reviewer: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment: String,
        reviewedAt: {
            type: Date,
            default: Date.now
        },
        isPublic: {
            type: Boolean,
            default: true
        }
    }],
    
    // Metrics and Analytics
    metrics: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        forks: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
        stars: { type: Number, default: 0 }
    },
    
    // Learning Outcomes
    learningOutcomes: [{
        skill: String,
        description: String,
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        }
    }],
    
    // Project Settings
    settings: {
        isPublic: {
            type: Boolean,
            default: true
        },
        allowCollaboration: {
            type: Boolean,
            default: true
        },
        allowReviews: {
            type: Boolean,
            default: true
        },
        allowForks: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: false
        }
    },
    
    // Tags and Search
    tags: [String],
    searchKeywords: [String],
    
    // Progress Tracking
    progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    // Competition/Contest Integration
    contestSubmission: {
        contest: {
            type: mongoose.Schema.ObjectId,
            ref: 'Contest'
        },
        submittedAt: Date,
        score: Number,
        rank: Number
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
ProjectSchema.index({ owner: 1, status: 1 });
ProjectSchema.index({ community: 1, status: 1 });
ProjectSchema.index({ category: 1, difficulty: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ 'metrics.views': -1 });
ProjectSchema.index({ createdAt: -1 });

// Virtual for completion status
ProjectSchema.virtual('isCompleted').get(function() {
    return this.status === 'completed';
});

// Virtual for average rating
ProjectSchema.virtual('averageRating').get(function() {
    if (this.reviews.length === 0) return 0;
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / this.reviews.length) * 10) / 10;
});

// Virtual for total reviews
ProjectSchema.virtual('totalReviews').get(function() {
    return this.reviews.length;
});

// Virtual for completed features percentage
ProjectSchema.virtual('featuresCompletionRate').get(function() {
    if (this.keyFeatures.length === 0) return 0;
    const completedFeatures = this.keyFeatures.filter(feature => feature.isCompleted).length;
    return Math.round((completedFeatures / this.keyFeatures.length) * 100);
});

// Virtual for overdue milestones
ProjectSchema.virtual('overdueMilestones').get(function() {
    const now = new Date();
    return this.milestones.filter(milestone => 
        milestone.dueDate && 
        milestone.dueDate < now && 
        milestone.status !== 'completed'
    );
});

// Pre-save middleware to update progress percentage
ProjectSchema.pre('save', function(next) {
    // Calculate progress based on completed features and milestones
    let totalTasks = this.keyFeatures.length + this.milestones.length;
    let completedTasks = this.keyFeatures.filter(f => f.isCompleted).length + 
                        this.milestones.filter(m => m.status === 'completed').length;
    
    if (totalTasks > 0) {
        this.progressPercentage = Math.round((completedTasks / totalTasks) * 100);
    }
    
    // Update milestone statuses
    const now = new Date();
    this.milestones.forEach(milestone => {
        if (milestone.dueDate && milestone.dueDate < now && milestone.status === 'pending') {
            milestone.status = 'overdue';
        }
    });
    
    next();
});

// Method to add collaborator
ProjectSchema.methods.addCollaborator = function(userId, role = 'collaborator', permissions = {}) {
    // Check if user is already a collaborator
    const existingCollaborator = this.collaborators.find(c => c.user.toString() === userId.toString());
    if (existingCollaborator) {
        throw new Error('User is already a collaborator');
    }
    
    const defaultPermissions = {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManage: false
    };
    
    const collaborator = {
        user: userId,
        role,
        permissions: { ...defaultPermissions, ...permissions },
        joinedAt: new Date()
    };
    
    this.collaborators.push(collaborator);
    return collaborator;
};

// Method to update collaborator permissions
ProjectSchema.methods.updateCollaboratorPermissions = function(userId, permissions) {
    const collaborator = this.collaborators.find(c => c.user.toString() === userId.toString());
    if (!collaborator) {
        throw new Error('Collaborator not found');
    }
    
    Object.assign(collaborator.permissions, permissions);
    return collaborator;
};

// Method to remove collaborator
ProjectSchema.methods.removeCollaborator = function(userId) {
    const index = this.collaborators.findIndex(c => c.user.toString() === userId.toString());
    if (index === -1) {
        throw new Error('Collaborator not found');
    }
    
    return this.collaborators.splice(index, 1)[0];
};

// Method to add review
ProjectSchema.methods.addReview = function(reviewerId, rating, comment = '', isPublic = true) {
    // Check if user already reviewed
    const existingReview = this.reviews.find(r => r.reviewer.toString() === reviewerId.toString());
    if (existingReview) {
        // Update existing review
        existingReview.rating = rating;
        existingReview.comment = comment;
        existingReview.reviewedAt = new Date();
        existingReview.isPublic = isPublic;
        return existingReview;
    }
    
    const review = {
        reviewer: reviewerId,
        rating,
        comment,
        isPublic,
        reviewedAt: new Date()
    };
    
    this.reviews.push(review);
    return review;
};

// Method to complete feature
ProjectSchema.methods.completeFeature = function(featureId) {
    const feature = this.keyFeatures.id(featureId);
    if (!feature) {
        throw new Error('Feature not found');
    }
    
    feature.isCompleted = true;
    feature.completedAt = new Date();
    return feature;
};

// Method to complete milestone
ProjectSchema.methods.completeMilestone = function(milestoneId) {
    const milestone = this.milestones.id(milestoneId);
    if (!milestone) {
        throw new Error('Milestone not found');
    }
    
    milestone.status = 'completed';
    milestone.completedAt = new Date();
    return milestone;
};

// Method to increment view count
ProjectSchema.methods.incrementViews = function() {
    this.metrics.views += 1;
    return this.save({ validateBeforeSave: false });
};

// Method to toggle like
ProjectSchema.methods.toggleLike = function(userId) {
    // This would typically be tracked in a separate likes collection
    // For now, just increment/decrement the counter
    this.metrics.likes += 1;
    return this.save({ validateBeforeSave: false });
};

// Static method to get trending projects
ProjectSchema.statics.getTrendingProjects = function(communityId = null, limit = 10, days = 7) {
    const match = {
        'settings.isPublic': true,
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    };
    
    if (communityId) {
        match.community = mongoose.Types.ObjectId(communityId);
    }
    
    return this.find(match)
        .populate('owner', 'firstName lastName avatar')
        .populate('community', 'name code')
        .sort({ 'metrics.views': -1, 'metrics.likes': -1 })
        .limit(limit);
};

// Static method to get project statistics
ProjectSchema.statics.getProjectStats = function(userId, communityId = null) {
    const match = { owner: mongoose.Types.ObjectId(userId) };
    
    if (communityId) {
        match.community = mongoose.Types.ObjectId(communityId);
    }
    
    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalProjects: { $sum: 1 },
                completedProjects: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                    }
                },
                inProgressProjects: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
                    }
                },
                totalViews: { $sum: '$metrics.views' },
                totalLikes: { $sum: '$metrics.likes' },
                averageRating: { $avg: { $avg: '$reviews.rating' } },
                totalHours: { $sum: '$actualHours' }
            }
        }
    ]);
};

// Static method to search projects
ProjectSchema.statics.searchProjects = function(query, filters = {}) {
    const searchStage = {
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
            { searchKeywords: { $in: [new RegExp(query, 'i')] } }
        ]
    };
    
    const matchStage = {
        'settings.isPublic': true,
        ...searchStage
    };
    
    // Apply filters
    if (filters.category) {
        matchStage.category = filters.category;
    }
    
    if (filters.difficulty) {
        matchStage.difficulty = filters.difficulty;
    }
    
    if (filters.status) {
        matchStage.status = filters.status;
    }
    
    if (filters.technologies && filters.technologies.length > 0) {
        matchStage['technologies.name'] = { $in: filters.technologies };
    }
    
    if (filters.communityId) {
        matchStage.community = mongoose.Types.ObjectId(filters.communityId);
    }
    
    return this.find(matchStage)
        .populate('owner', 'firstName lastName avatar')
        .populate('community', 'name code')
        .sort(filters.sortBy || { createdAt: -1 })
        .limit(filters.limit || 20);
};

module.exports = mongoose.model('Project', ProjectSchema);
