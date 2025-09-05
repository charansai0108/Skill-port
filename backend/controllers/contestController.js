const Contest = require('../models/Contest');
const Community = require('../models/Community');
const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Get all contests
exports.getContests = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query = { community: req.user.community, batch: req.user.batch };
    } else if (req.user.role === 'mentor') {
      query = { community: req.user.community, mentor: req.user.id };
    } else if (req.user.role === 'community-admin') {
      query = { community: req.user.community };
    }

    const contests = await Contest.find(query)
      .populate('community', 'name code')
      .populate('mentor', 'firstName lastName email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: contests.length,
      data: contests
    });
  } catch (error) {
    logger.error('Get contests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single contest by ID
exports.getContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('community', 'name code')
      .populate('mentor', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Authorization check: User must be part of the community or admin/mentor of this contest
    if (!req.user.community || !req.user.community.equals(contest.community._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this contest' });
    }

    if (req.user.role === 'student' && contest.batch !== req.user.batch) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this contest batch' });
    }

    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (error) {
    logger.error('Get contest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new contest
exports.createContest = async (req, res, next) => {
  try {
    const { name, description, community, mentor, batch, startTime, endTime, problems } = req.body;

    // Ensure community exists and belongs to the admin
    const existingCommunity = await Community.findById(community);
    if (!existingCommunity || !existingCommunity.admin.equals(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Community not found or not authorized' });
    }

    // Ensure mentor exists and belongs to the same community
    const existingMentor = await User.findOne({ _id: mentor, role: 'mentor', community: community });
    if (!existingMentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found or not in this community' });
    }

    const contest = await Contest.create({
      name,
      description,
      community,
      mentor,
      batch,
      startTime,
      endTime,
      problems,
      createdBy: req.user.id
    });

    // Add contest to community's contests array
    await existingCommunity.addContest(contest._id);

    res.status(201).json({
      success: true,
      data: contest
    });
  } catch (error) {
    logger.error('Create contest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update contest details
exports.updateContest = async (req, res, next) => {
  try {
    let contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Authorization check
    if (req.user.role === 'community-admin' && !contest.community.equals(req.user.community)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this contest' });
    }
    if (req.user.role === 'mentor' && !contest.mentor.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this contest' });
    }

    contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (error) {
    logger.error('Update contest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Start a contest
exports.startContest = async (req, res, next) => {
  try {
    let contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Authorization check
    if (req.user.role === 'community-admin' && !contest.community.equals(req.user.community)) {
      return res.status(403).json({ success: false, message: 'Not authorized to start this contest' });
    }
    if (req.user.role === 'mentor' && !contest.mentor.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to start this contest' });
    }

    if (contest.status === 'active') {
      return res.status(400).json({ success: false, message: 'Contest is already active' });
    }

    contest.status = 'active';
    await contest.save();

    res.status(200).json({
      success: true,
      message: 'Contest started',
      data: contest
    });
  } catch (error) {
    logger.error('Start contest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Join a contest
exports.joinContest = async (req, res, next) => {
  try {
    let contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Authorization check: student must be in the correct community and batch
    if (!contest.community.equals(req.user.community) || contest.batch !== req.user.batch) {
      return res.status(403).json({ success: false, message: 'Not authorized to join this contest' });
    }

    if (contest.isEnded) {
      return res.status(400).json({ success: false, message: 'Contest has already ended' });
    }

    await contest.addParticipant(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Successfully joined contest',
      data: contest
    });
  } catch (error) {
    logger.error('Join contest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit solution to a contest problem
exports.submitSolution = async (req, res, next) => {
  try {
    let contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Authorization check
    if (!contest.community.equals(req.user.community) || contest.batch !== req.user.batch) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit to this contest' });
    }

    if (!contest.isActive) {
      return res.status(400).json({ success: false, message: 'Contest is not active for submissions' });
    }

    const { problemId, code, language } = req.body;
    const problem = contest.problems.id(problemId);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found in this contest' });
    }

    const participant = contest.participants.find(p => p.user.equals(req.user.id));
    if (!participant) {
      return res.status(400).json({ success: false, message: 'User is not a participant in this contest' });
    }

    // Simulate submission processing
    const submissionStatus = Math.random() > 0.5 ? 'accepted' : 'wrong answer';
    const scoreAwarded = submissionStatus === 'accepted' ? problem.points : 0;

    participant.submissions.push({
      problemId,
      code,
      language,
      status: submissionStatus
    });

    if (submissionStatus === 'accepted') {
      participant.score += scoreAwarded;
    }

    await contest.save();

    res.status(200).json({
      success: true,
      message: `Submission received. Status: ${submissionStatus}`,
      data: {
        submissionStatus,
        scoreAwarded,
        currentScore: participant.score
      }
    });
  } catch (error) {
    logger.error('Submit solution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get contest leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('participants.user', 'firstName lastName email role');

    if (!contest) {
      return res.status(404).json({ success: false, message: 'Contest not found' });
    }

    // Authorization check
    if (!req.user.community || !req.user.community.equals(contest.community._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this leaderboard' });
    }

    const leaderboard = contest.participants
      .sort((a, b) => b.score - a.score)
      .map(p => ({
        user: {
          id: p.user._id,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          email: p.user.email,
          role: p.user.role
        },
        score: p.score,
        submissions: p.submissions.length
      }));

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
