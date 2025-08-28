const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Post title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [10000, 'Post content cannot exceed 10,000 characters']
  },
  
  // Post Type and Category
  type: {
    type: String,
    enum: ['discussion', 'question', 'announcement', 'resource', 'achievement', 'other'],
    default: 'discussion'
  },
  category: {
    type: String,
    enum: ['general', 'algorithms', 'data-structures', 'web-development', 'mobile-development', 'ai-ml', 'system-design', 'interview-prep', 'other'],
    default: 'general'
  },
  
  // Author and Community
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  
  // Content Features
  tags: [String],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  
  // Engagement Metrics
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dislikedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  
  // Comments
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Moderation
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ author: 1, community: 1, type: 1, category: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'likes.user': 1 });
postSchema.index({ 'comments.author': 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
postSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for net score
postSchema.virtual('score').get(function() {
  return this.likes.length - this.dislikes.length;
});

// Ensure virtuals are serialized
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Methods
postSchema.methods.addLike = function(userId) {
  // Remove dislike if exists
  this.dislikes = this.dislikes.filter(dislike => 
    dislike.user.toString() !== userId.toString()
  );
  
  // Add like if not already exists
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => 
    like.user.toString() !== userId.toString()
  );
  return this.save();
};

postSchema.methods.addDislike = function(userId) {
  // Remove like if exists
  this.likes = this.likes.filter(like => 
    like.user.toString() !== userId.toString()
  );
  
  // Add dislike if not already exists
  const existingDislike = this.dislikes.find(dislike => 
    dislike.user.toString() === userId.toString()
  );
  
  if (!existingDislike) {
    this.dislikes.push({ user: userId });
  }
  
  return this.save();
};

postSchema.methods.removeDislike = function(userId) {
  this.dislikes = this.dislikes.filter(dislike => 
    dislike.user.toString() !== userId.toString()
  );
  return this.save();
};

postSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content
  });
  return this.save();
};

postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

postSchema.methods.isAuthor = function(userId) {
  return this.author.toString() === userId.toString();
};

postSchema.methods.canModify = function(userId, userRole) {
  // Author can always modify
  if (this.isAuthor(userId)) {
    return true;
  }
  
  // Community admins can modify
  if (userRole === 'admin') {
    return true;
  }
  
  // Community moderators can modify
  if (userRole === 'moderator') {
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('Post', postSchema);
