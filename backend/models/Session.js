const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    // User reference
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Session token (JWT)
    token: {
        type: String,
        required: true,
        unique: true
    },
    
    // Session type (web, extension, mobile)
    type: {
        type: String,
        enum: ['web', 'extension', 'mobile'],
        default: 'web'
    },
    
    // User agent and device info
    userAgent: {
        type: String,
        default: ''
    },
    
    // IP address
    ipAddress: {
        type: String,
        default: ''
    },
    
    // Session data (user preferences, temporary data)
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Session status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Expiration time
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    
    // Last activity
    lastActivity: {
        type: Date,
        default: Date.now
    },
    
    // Created at
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for performance
SessionSchema.index({ user: 1, isActive: 1 });
SessionSchema.index({ token: 1 });
SessionSchema.index({ expiresAt: 1 });

// Update last activity on save
SessionSchema.pre('save', function(next) {
    this.lastActivity = new Date();
    next();
});

// Static method to create session
SessionSchema.statics.createSession = async function(userId, token, options = {}) {
    const session = new this({
        user: userId,
        token: token,
        type: options.type || 'web',
        userAgent: options.userAgent || '',
        ipAddress: options.ipAddress || '',
        data: options.data || {},
        expiresAt: options.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    return await session.save();
};

// Static method to find active session by token
SessionSchema.statics.findActiveSession = async function(token) {
    return await this.findOne({
        token: token,
        isActive: true,
        expiresAt: { $gt: new Date() }
    }).populate('user');
};

// Instance method to update session data
SessionSchema.methods.updateData = async function(newData) {
    this.data = { ...this.data, ...newData };
    this.lastActivity = new Date();
    return await this.save();
};

// Instance method to deactivate session
SessionSchema.methods.deactivate = async function() {
    this.isActive = false;
    return await this.save();
};

// Instance method to refresh session
SessionSchema.methods.refresh = async function(expiresAt) {
    this.lastActivity = new Date();
    if (expiresAt) {
        this.expiresAt = expiresAt;
    }
    return await this.save();
};

module.exports = mongoose.model('Session', SessionSchema);
