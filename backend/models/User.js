const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  additionalEmails: [{
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    label: {
      type: String,
      enum: ['college', 'university', 'company', 'other'],
      default: 'other'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['personal', 'community', 'admin'],
    default: 'personal'
  },
  
  // Personal User fields
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: function() { return this.role === 'personal'; }
  },
  primaryInterest: {
    type: String,
    enum: ['algorithms', 'web-development', 'mobile-development', 'data-science', 'system-design', 'cybersecurity', 'game-development', 'other'],
    required: function() { return this.role === 'personal'; }
  },
  educationLevel: {
    type: String,
    enum: ['high-school', 'bachelor', 'master', 'phd', 'self-taught', 'other'],
    required: function() { return this.role === 'personal'; }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Community User fields
  organizationName: {
    type: String,
    maxlength: [200, 'Organization name cannot exceed 200 characters'],
    required: function() { return this.role === 'community'; }
  },
  organizationType: {
    type: String,
    enum: ['university', 'bootcamp', 'company', 'school', 'nonprofit', 'other'],
    required: function() { return this.role === 'community'; }
  },
  organizationSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: function() { return this.role === 'community'; }
  },
  position: {
    type: String,
    maxlength: [100, 'Position cannot exceed 100 characters'],
    required: function() { return this.role === 'community'; }
  },
  organizationWebsite: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  // Common fields
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  lastLoginDate: {
    type: Date
  },
  lastActive: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  // Email verification fields
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  profilePicture: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's actually modified (not just other fields)
  if (!this.isModified('password')) {
    console.log('🔐 Password not modified, skipping hash');
    return next();
  }
  
  try {
    console.log('🔐 Hashing password for user:', this.email);
    console.log('🔐 Original password length:', this.password.length);
    
    // Check if password is already hashed (bcrypt hashes are always 60 chars)
    if (this.password.length === 60 && this.password.startsWith('$2a$')) {
      console.log('🔐 Password already hashed, skipping');
      return next();
    }
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    console.log('🔐 Password hashed successfully');
    console.log('🔐 Hashed password length:', this.password.length);
    
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Find user by any email (primary or additional)
userSchema.statics.findByAnyEmail = function(email) {
  return this.findOne({
    $or: [
      { email: email.toLowerCase() },
      { 'additionalEmails.email': email.toLowerCase() }
    ]
  });
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
