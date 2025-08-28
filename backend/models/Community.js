const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    maxlength: [100, 'Community name cannot exceed 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  
  // Category and Type
  category: {
    type: String,
    enum: ['algorithms', 'data-structures', 'web-development', 'mobile-development', 'ai-ml', 'system-design', 'other'],
    required: true
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  
  // Members Management
  members: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['member', 'moderator', 'admin'], 
      default: 'member' 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Limits and Settings
  maxMembers: {
    type: Number,
    default: 1000,
    min: [10, 'Community must have at least 10 members']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Content and Rules
  rules: [String],
  tags: [String],
  image: String,
  banner: String,
  
  // Statistics
  memberCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  contestCount: {
    type: Number,
    default: 0
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  
  // Settings
  allowMemberInvites: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: false
  },
  autoApprove: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
communitySchema.index({ name: 'text', description: 'text', tags: 'text' });
communitySchema.index({ category: 1, privacy: 1, status: 1 });
communitySchema.index({ 'members.user': 1 });
communitySchema.index({ createdAt: -1 });

// Pre-save middleware to update member count
communitySchema.pre('save', function(next) {
  if (this.isModified('members')) {
    this.memberCount = this.members.filter(member => member.isActive).length;
  }
  next();
});

// Methods
communitySchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.isActive = true;
    existingMember.role = role;
    existingMember.lastActivity = new Date();
  } else {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
      lastActivity: new Date()
    });
  }
  
  return this.save();
};

communitySchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(member => 
    member.user.toString() === userId.toString()
  );
  
  if (memberIndex !== -1) {
    this.members[memberIndex].isActive = false;
    return this.save();
  }
  
  return Promise.resolve(this);
};

communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && member.isActive
  );
};

communitySchema.methods.isAdmin = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && 
    member.role === 'admin' && 
    member.isActive
  );
};

communitySchema.methods.isModerator = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && 
    (member.role === 'moderator' || member.role === 'admin') && 
    member.isActive
  );
};

module.exports = mongoose.model('Community', communitySchema);
