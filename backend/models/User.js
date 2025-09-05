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
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function(password) {
                if (!password) return true; // Allow empty for temporary passwords
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        },
        select: false
    },
    
    // User Role and Status
    role: {
        type: String,
        enum: ['personal', 'community-admin', 'mentor', 'student'],
        required: [true, 'User role is required']
    },
    
    // Community association (for community users)
    community: {
        type: mongoose.Schema.ObjectId,
        ref: 'Community',
        required: function() {
            return ['community-admin', 'mentor', 'student'].includes(this.role);
        }
    },
    
    // Batch association (for students)
    batch: {
        type: String,
        required: function() {
            return this.role === 'student';
        }
    },
    
    // Experience level (for personal users)
    experience: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: function() {
            return this.role === 'personal';
        }
    },
    
    // Skills (for personal users)
    skills: [{
        type: String
    }],
    
    // Bio (for personal users)
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
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
    
    // Community Association (for community-admin, mentor, student)
    community: {
        type: mongoose.Schema.ObjectId,
        ref: 'Community',
        required: function() {
            return ['community-admin', 'mentor', 'student'].includes(this.role);
        }
    },
    
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
    
    // Additional security fields
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    lastPasswordChange: {
        type: Date,
        default: Date.now
    },
    passwordHistory: [{
        password: String,
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
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
    otpAttempts: {
        type: Number,
        default: 0
    },
    otpLockUntil: Date,
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

// Virtual for OTP lock status
UserSchema.virtual('isOTPLocked').get(function() {
    return !!(this.otpLockUntil && this.otpLockUntil > Date.now());
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

// Method to handle OTP attempts
UserSchema.methods.incOTPAttempts = function() {
    if (this.otpLockUntil && this.otpLockUntil < Date.now()) {
        return this.updateOne({
            $unset: { otpAttempts: 1, otpLockUntil: 1 }
        });
    }
    
    const updates = { $inc: { otpAttempts: 1 } };
    
    if (this.otpAttempts + 1 >= 5 && !this.isOTPLocked) {
        updates.$set = {
            otpLockUntil: Date.now() + 15 * 60 * 1000 // 15 minutes
        };
    }
    
    return this.updateOne(updates);
};

// Method to reset OTP attempts
UserSchema.methods.resetOTPAttempts = function() {
    return this.updateOne({
        $unset: { otpAttempts: 1, otpLockUntil: 1 }
    });
};

// Method to check if password was used recently
UserSchema.methods.isPasswordRecentlyUsed = function(password) {
    if (!this.passwordHistory || this.passwordHistory.length === 0) {
        return false;
    }
    
    // Check last 5 passwords
    const recentPasswords = this.passwordHistory.slice(-5);
    return recentPasswords.some(entry => bcrypt.compareSync(password, entry.password));
};

// Method to add password to history
UserSchema.methods.addPasswordToHistory = function(password) {
    if (!this.passwordHistory) {
        this.passwordHistory = [];
    }
    
    // Keep only last 10 passwords
    if (this.passwordHistory.length >= 10) {
        this.passwordHistory = this.passwordHistory.slice(-9);
    }
    
    this.passwordHistory.push({
        password: password,
        changedAt: new Date()
    });
    
    this.lastPasswordChange = new Date();
};

// Method to check if account needs password change
UserSchema.methods.needsPasswordChange = function() {
    if (!this.lastPasswordChange) return false;
    
    const daysSinceChange = (Date.now() - this.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceChange > 90; // 90 days
};

// Method to get user statistics
UserSchema.methods.getUserStats = function() {
    return {
        totalPoints: this.totalPoints || 0,
        level: this.level || 1,
        streak: this.streak || 0,
        lastActivity: this.lastActivity,
        accountAge: Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        isActive: this.status === 'active',
        isEmailVerified: this.isEmailVerified,
        needsPasswordChange: this.needsPasswordChange()
    };
};

module.exports = mongoose.model('User', UserSchema);