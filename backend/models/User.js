const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    },
    password: {
        type: String,
        required: function() {
            return !this.isTemporaryPassword;
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    
    // User Role and Status
    role: {
        type: String,
        enum: ['personal', 'community-admin', 'mentor', 'student'],
        required: [true, 'User role is required']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending'],
        default: 'pending'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isTemporaryPassword: {
        type: Boolean,
        default: false
    },
    
    // Profile Information
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    dateOfBirth: {
        type: Date
    },
    phoneNumber: {
        type: String,
        match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    
    // Community Association (for all users except personal users who can optionally join)
    community: {
        type: mongoose.Schema.ObjectId,
        ref: 'Community',
        required: function() {
            return ['community-admin', 'mentor', 'student'].includes(this.role);
        }
    },
    
    // Personal users can join multiple communities (optional)
    joinedCommunities: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Community'
    }],
    
    // Student-specific fields
    batch: {
        type: String,
        required: function() {
            return this.role === 'student';
        }
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true
    },
    
    // Mentor-specific fields
    expertise: [{
        type: String
    }],
    yearsOfExperience: {
        type: Number,
        min: 0
    },
    
    // Personal user specific fields
    extensionInstalled: {
        type: Boolean,
        default: false
    },
    lastExtensionSync: {
        type: Date
    },
    
    // Coding platform usernames
    platforms: {
        leetcode: {
            type: String,
            trim: true
        },
        geeksforgeeks: {
            type: String,
            trim: true
        },
        hackerrank: {
            type: String,
            trim: true
        },
        interviewbit: {
            type: String,
            trim: true
        },
        github: {
            type: String,
            trim: true
        }
    },
    
    // Progress and Statistics
    totalPoints: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    streak: {
        type: Number,
        default: 0
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    
    // Security fields
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otpCode: String,
    otpExpire: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    
    // Preferences
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            contests: { type: Boolean, default: true },
            achievements: { type: Boolean, default: true }
        },
        privacy: {
            profileVisible: { type: Boolean, default: true },
            progressVisible: { type: Boolean, default: true },
            leaderboardVisible: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ community: 1, role: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ studentId: 1 }, { sparse: true });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Pre-save middleware to generate student ID
UserSchema.pre('save', async function(next) {
    if (this.role === 'student' && !this.studentId) {
        const community = await mongoose.model('Community').findById(this.community);
        if (community) {
            const studentCount = await this.constructor.countDocuments({
                community: this.community,
                role: 'student'
            });
            this.studentId = `${community.code}-${String(studentCount + 1).padStart(4, '0')}`;
        }
    }
    next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { 
            id: this._id,
            role: this.role,
            community: this.community ? this.community._id || this.community : null
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Method to generate email verification token
UserSchema.methods.getEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verificationToken;
};

// Method to generate reset password token
UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

// Method to generate OTP
UserSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.otpCode = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
    
    this.otpExpire = Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES) * 60 * 1000;
    
    return otp;
};

// Method to verify OTP
UserSchema.methods.verifyOTP = function(otp) {
    const hashedOTP = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
    
    return hashedOTP === this.otpCode && this.otpExpire > Date.now();
};

// Method to handle login attempts
UserSchema.methods.incLoginAttempts = function() {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { loginAttempts: 1, lockUntil: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
        };
    }
    
    return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

module.exports = mongoose.model('User', UserSchema);