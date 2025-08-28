const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User');

class AutoValidationService {
  /**
   * Auto-validate assignment when user submits solution via extension
   * @param {Object} submissionData - Data from browser extension
   * @param {string} userId - User ID who submitted
   * @returns {Object} Validation result
   */
  static async validateAssignment(submissionData, userId) {
    try {
      console.log(`🔍 Auto-validating assignment for user ${userId} with submission:`, submissionData);

      // Find active assignments for this user
      const userAssignments = await Assignment.find({
        'assignedTo.user': userId,
        'assignedTo.status': { $in: ['assigned', 'in_progress'] },
        status: { $in: ['published', 'active'] }
      }).populate('assignedTo.user', 'firstName lastName username');

      if (!userAssignments || userAssignments.length === 0) {
        console.log(`📝 No active assignments found for user ${userId}`);
        return { validated: false, message: 'No active assignments found' };
      }

      let validationResults = [];

      for (const assignment of userAssignments) {
        const result = await this.validateSingleAssignment(assignment, submissionData, userId);
        if (result.validated) {
          validationResults.push(result);
        }
      }

      if (validationResults.length > 0) {
        console.log(`✅ Auto-validated ${validationResults.length} assignments for user ${userId}`);
        return {
          validated: true,
          message: `Successfully validated ${validationResults.length} assignment(s)`,
          results: validationResults
        };
      }

      return { validated: false, message: 'No assignments matched the submission' };

    } catch (error) {
      console.error('❌ Auto-validation error:', error);
      return { validated: false, message: 'Auto-validation failed', error: error.message };
    }
  }

  /**
   * Validate a single assignment against submission data
   * @param {Object} assignment - Assignment object
   * @param {Object} submissionData - Submission data from extension
   * @param {string} userId - User ID
   * @returns {Object} Validation result
   */
  static async validateSingleAssignment(assignment, submissionData, userId) {
    try {
      // Check if assignment matches submission criteria
      const isMatch = this.checkAssignmentMatch(assignment, submissionData);
      
      if (!isMatch) {
        return { validated: false, assignmentId: assignment._id, reason: 'Assignment criteria not matched' };
      }

      // Find user's assignment record
      const userAssignment = assignment.assignedTo.find(a => a.user.toString() === userId);
      if (!userAssignment) {
        return { validated: false, assignmentId: assignment._id, reason: 'User not found in assignment' };
      }

      // Check if assignment is already completed
      if (userAssignment.status === 'completed') {
        return { validated: false, assignmentId: assignment._id, reason: 'Assignment already completed' };
      }

      // Check if submission is successful
      if (submissionData.verdict !== 'Accepted') {
        // Update attempts count for failed submissions
        userAssignment.attempts += 1;
        await assignment.save();
        
        return { 
          validated: false, 
          assignmentId: assignment._id, 
          reason: 'Submission not accepted',
          attempts: userAssignment.attempts
        };
      }

      // Check if max attempts exceeded
      if (userAssignment.attempts >= assignment.maxAttempts) {
        return { 
          validated: false, 
          assignmentId: assignment._id, 
          reason: 'Max attempts exceeded',
          attempts: userAssignment.attempts,
          maxAttempts: assignment.maxAttempts
        };
      }

      // Validation successful! Update assignment status
      const validationResult = await this.completeAssignment(assignment, userId, submissionData);
      
      return {
        validated: true,
        assignmentId: assignment._id,
        assignmentTitle: assignment.title,
        message: 'Assignment completed successfully!',
        score: validationResult.score,
        completionTime: validationResult.completionTime
      };

    } catch (error) {
      console.error(`❌ Error validating assignment ${assignment._id}:`, error);
      return { 
        validated: false, 
        assignmentId: assignment._id, 
        reason: 'Validation error',
        error: error.message 
      };
    }
  }

  /**
   * Check if assignment matches submission criteria
   * @param {Object} assignment - Assignment object
   * @param {Object} submissionData - Submission data
   * @returns {boolean} True if assignment matches
   */
  static checkAssignmentMatch(assignment, submissionData) {
    // Check platform match
    if (assignment.platform && assignment.platform !== 'other') {
      if (assignment.platform !== submissionData.platform) {
        return false;
      }
    }

    // Check problem ID match if specified
    if (assignment.platformProblemId && assignment.platformProblemId !== submissionData.submissionId) {
      return false;
    }

    // Check problem title match if specified
    if (assignment.platformProblemTitle) {
      const assignmentTitle = assignment.platformProblemTitle.toLowerCase();
      const submissionTitle = submissionData.problemTitle?.toLowerCase() || submissionData.slug?.toLowerCase();
      
      if (!submissionTitle || !submissionTitle.includes(assignmentTitle) && !assignmentTitle.includes(submissionTitle)) {
        return false;
      }
    }

    // Check difficulty match if specified
    if (assignment.difficulty && submissionData.difficulty) {
      if (assignment.difficulty !== submissionData.difficulty) {
        return false;
      }
    }

    return true;
  }

  /**
   * Complete assignment for user
   * @param {Object} assignment - Assignment object
   * @param {string} userId - User ID
   * @param {Object} submissionData - Submission data
   * @returns {Object} Completion result
   */
  static async completeAssignment(assignment, userId, submissionData) {
    try {
      const userAssignment = assignment.assignedTo.find(a => a.user.toString() === userId);
      
      // Calculate score based on assignment settings and submission
      let score = assignment.points || 100;
      
      // Apply time-based penalties if needed
      const deadline = new Date(assignment.deadline);
      const now = new Date();
      const isOverdue = now > deadline;
      
      if (isOverdue) {
        // Reduce score for overdue submissions
        const overdueHours = Math.floor((now - deadline) / (1000 * 60 * 60));
        const penalty = Math.min(20, overdueHours * 2); // Max 20% penalty
        score = Math.max(0, score - penalty);
      }
      
      // Update assignment status
      userAssignment.status = 'completed';
      userAssignment.completedAt = new Date();
      userAssignment.score = score;
      userAssignment.attempts += 1;
      
      // Calculate completion time
      const completionTime = userAssignment.startedAt ? 
        Math.floor((now - userAssignment.startedAt) / (1000 * 60)) : // minutes
        null;
      
      // Save assignment
      await assignment.save();
      
      // Update assignment overall status if all users completed
      const allCompleted = assignment.assignedTo.every(a => a.status === 'completed');
      if (allCompleted && assignment.status !== 'completed') {
        assignment.status = 'completed';
        await assignment.save();
      }
      
      console.log(`🎉 Assignment ${assignment.title} completed for user ${userId} with score ${score}`);
      
      return {
        score,
        completionTime,
        isOverdue,
        penalty: assignment.points - score
      };
      
    } catch (error) {
      console.error(`❌ Error completing assignment:`, error);
      throw error;
    }
  }

  /**
   * Get validation statistics for a user
   * @param {string} userId - User ID
   * @returns {Object} Validation statistics
   */
  static async getUserValidationStats(userId) {
    try {
      const stats = await Assignment.aggregate([
        { $match: { 'assignedTo.user': userId } },
        { $unwind: '$assignedTo' },
        { $match: { 'assignedTo.user': userId } },
        {
          $group: {
            _id: null,
            totalAssigned: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$assignedTo.status', 'completed'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$assignedTo.status', 'in_progress'] }, 1, 0] } },
            overdue: { $sum: { $cond: [{ $eq: ['$assignedTo.status', 'overdue'] }, 1, 0] } },
            totalScore: { $sum: { $cond: [{ $eq: ['$assignedTo.status', 'completed'] }, '$assignedTo.score', 0] } },
            avgScore: { $avg: { $cond: [{ $eq: ['$assignedTo.status', 'completed'] }, '$assignedTo.score', null] } }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          totalAssigned: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0,
          completionRate: 0,
          averageScore: 0,
          totalScore: 0
        };
      }

      const stat = stats[0];
      const completionRate = stat.totalAssigned > 0 ? 
        Math.round((stat.completed / stat.totalAssigned) * 100) : 0;

      return {
        totalAssigned: stat.totalAssigned,
        completed: stat.completed,
        inProgress: stat.inProgress,
        overdue: stat.overdue,
        completionRate,
        averageScore: Math.round(stat.avgScore || 0),
        totalScore: stat.totalScore
      };

    } catch (error) {
      console.error('❌ Error getting validation stats:', error);
      throw error;
    }
  }

  /**
   * Get validation statistics for a mentor
   * @param {string} mentorId - Mentor ID
   * @returns {Object} Validation statistics
   */
  static async getMentorValidationStats(mentorId) {
    try {
      const stats = await Assignment.aggregate([
        { $match: { assignedBy: mentorId } },
        { $unwind: '$assignedTo' },
        {
          $group: {
            _id: null,
            totalAssignments: { $sum: 1 },
            totalAssigned: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$assignedTo.status', 'completed'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$assignedTo.status', 'in_progress'] }, 1, 0] } },
            overdue: { $sum: { $cond: [{ $eq: ['$assignedTo.status', 'overdue'] }, 1, 0] } },
            totalScore: { $sum: { $cond: [{ $eq: ['$assignedTo.status', 'completed'] }, '$assignedTo.score', 0] } },
            avgScore: { $avg: { $cond: [{ $eq: ['$assignedTo.status', 'completed'] }, '$assignedTo.score', null] } }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          totalAssignments: 0,
          totalAssigned: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0,
          completionRate: 0,
          averageScore: 0,
          totalScore: 0
        };
      }

      const stat = stats[0];
      const completionRate = stat.totalAssigned > 0 ? 
        Math.round((stat.completed / stat.totalAssigned) * 100) : 0;

      return {
        totalAssignments: stat.totalAssignments,
        totalAssigned: stat.totalAssigned,
        completed: stat.completed,
        inProgress: stat.inProgress,
        overdue: stat.overdue,
        completionRate,
        averageScore: Math.round(stat.avgScore || 0),
        totalScore: stat.totalScore
      };

    } catch (error) {
      console.error('❌ Error getting mentor validation stats:', error);
      throw error;
    }
  }
}

module.exports = AutoValidationService;
