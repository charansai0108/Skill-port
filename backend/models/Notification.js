const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Sender (optional - for system notifications)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notification Type
  type: {
    type: String,
    enum: [
      'contest_invitation',
      'contest_reminder',
      'contest_result',
      'community_invitation',
      'community_join_request',
      'community_post',
      'community_comment',
      'problem_solved',
      'achievement_earned',
      'streak_milestone',
      'system_announcement',
      'security_alert',
      'profile_update',
      'friend_request',
      'message_received'
    ],
    required: true
  },
  
  // Title and Content
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // Related Data (for deep linking)
  relatedData: {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest'
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    }
  },
  
  // Action Buttons
  actions: [{
    label: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    url: String,
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Read Status
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Delivery Status
  deliveryStatus: {
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  
  // Scheduling
  scheduledFor: Date,
  expiresAt: Date,
  
  // Metadata
  metadata: {
    category: String,
    tags: [String],
    source: String,
    version: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'relatedData.contest': 1 });
notificationSchema.index({ 'relatedData.community': 1 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set default expiration (30 days from creation)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Set scheduled time if not provided
  if (!this.scheduledFor) {
    this.scheduledFor = new Date();
  }
  
  next();
});

// Methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  return this.save();
};

notificationSchema.methods.updateDeliveryStatus = function(channel, status) {
  if (this.deliveryStatus[channel] !== undefined) {
    this.deliveryStatus[channel] = status;
  }
  return this.save();
};

notificationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

notificationSchema.methods.isScheduled = function() {
  return this.scheduledFor && new Date() < this.scheduledFor;
};

notificationSchema.methods.canDeliver = function() {
  return !this.isExpired() && !this.isScheduled() && this.status === 'pending';
};

// Static methods
notificationSchema.statics.createContestInvitation = function(recipientId, contestId, senderId) {
  return this.create({
    recipient: recipientId,
    sender: senderId,
    type: 'contest_invitation',
    title: 'Contest Invitation',
    message: 'You have been invited to participate in a contest!',
    relatedData: { contest: contestId },
    actions: [
      {
        label: 'View Contest',
        action: 'view_contest',
        url: `/contests/${contestId}`
      },
      {
        label: 'Accept',
        action: 'accept_invitation',
        data: { contestId, action: 'accept' }
      },
      {
        label: 'Decline',
        action: 'decline_invitation',
        data: { contestId, action: 'decline' }
      }
    ],
    priority: 'high'
  });
};

notificationSchema.statics.createContestReminder = function(recipientId, contestId, contestName, startTime) {
  const startDate = new Date(startTime);
  const timeUntilStart = startDate - new Date();
  const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60));
  
  let message = '';
  if (hoursUntilStart > 24) {
    message = `Contest "${contestName}" starts in ${Math.floor(hoursUntilStart / 24)} days`;
  } else if (hoursUntilStart > 0) {
    message = `Contest "${contestName}" starts in ${hoursUntilStart} hours`;
  } else {
    message = `Contest "${contestName}" is starting now!`;
  }
  
  return this.create({
    recipient: recipientId,
    type: 'contest_reminder',
    title: 'Contest Reminder',
    message: message,
    relatedData: { contest: contestId },
    actions: [
      {
        label: 'Join Contest',
        action: 'join_contest',
        url: `/contests/${contestId}`
      }
    ],
    priority: hoursUntilStart <= 1 ? 'urgent' : 'high'
  });
};

notificationSchema.statics.createContestResult = function(recipientId, contestId, contestName, rank, score) {
  let message = '';
  let priority = 'normal';
  
  if (rank === 1) {
    message = `🎉 Congratulations! You won the contest "${contestName}" with ${score} points!`;
    priority = 'high';
  } else if (rank <= 3) {
    message = `🏆 Great job! You secured ${rank}${rank === 2 ? 'nd' : 'rd'} place in "${contestName}" with ${score} points!`;
    priority = 'high';
  } else if (rank <= 10) {
    message = `🎯 Well done! You finished ${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} in "${contestName}" with ${score} points!`;
    priority = 'normal';
  } else {
    message = `Contest "${contestName}" completed! You finished ${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'} with ${score} points.`;
    priority = 'low';
  }
  
  return this.create({
    recipient: recipientId,
    type: 'contest_result',
    title: 'Contest Result',
    message: message,
    relatedData: { contest: contestId },
    actions: [
      {
        label: 'View Results',
        action: 'view_results',
        url: `/contests/${contestId}/results`
      },
      {
        label: 'View Leaderboard',
        action: 'view_leaderboard',
        url: `/contests/${contestId}/leaderboard`
      }
    ],
    priority: priority
  });
};

notificationSchema.statics.createCommunityInvitation = function(recipientId, communityId, communityName, senderId) {
  return this.create({
    recipient: recipientId,
    sender: senderId,
    type: 'community_invitation',
    title: 'Community Invitation',
    message: `You have been invited to join the community "${communityName}"!`,
    relatedData: { community: communityId },
    actions: [
      {
        label: 'View Community',
        action: 'view_community',
        url: `/communities/${communityId}`
      },
      {
        label: 'Accept',
        action: 'accept_invitation',
        data: { communityId, action: 'accept' }
      },
      {
        label: 'Decline',
        action: 'decline_invitation',
        data: { communityId, action: 'decline' }
      }
    ],
    priority: 'normal'
  });
};

notificationSchema.statics.createAchievementNotification = function(recipientId, achievementName, achievementDescription) {
  return this.create({
    recipient: recipientId,
    type: 'achievement_earned',
    title: '🏆 Achievement Unlocked!',
    message: `Congratulations! You've earned the "${achievementName}" achievement: ${achievementDescription}`,
    actions: [
      {
        label: 'View Achievements',
        action: 'view_achievements',
        url: '/profile/achievements'
      }
    ],
    priority: 'high'
  });
};

notificationSchema.statics.createStreakMilestone = function(recipientId, streakType, currentStreak, milestone) {
  let message = '';
  let priority = 'normal';
  
  if (streakType === 'login') {
    if (currentStreak === 7) {
      message = `🔥 7-day login streak! Keep the momentum going!`;
      priority = 'high';
    } else if (currentStreak === 30) {
      message = `🔥🔥 30-day login streak! You're on fire!`;
      priority = 'high';
    } else if (currentStreak === 100) {
      message = `🔥🔥🔥 100-day login streak! Legendary consistency!`;
      priority = 'urgent';
    }
  } else if (streakType === 'problem') {
    if (currentStreak === 5) {
      message = `💪 5-day problem-solving streak! You're building great habits!`;
      priority = 'high';
    } else if (currentStreak === 10) {
      message = `💪💪 10-day problem-solving streak! Unstoppable!`;
      priority = 'high';
    }
  }
  
  if (message) {
    return this.create({
      recipient: recipientId,
      type: 'streak_milestone',
      title: 'Streak Milestone!',
      message: message,
      actions: [
        {
          label: 'View Stats',
          action: 'view_stats',
          url: '/profile/stats'
        }
      ],
      priority: priority
    });
  }
  
  return null;
};

// Clean up expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
