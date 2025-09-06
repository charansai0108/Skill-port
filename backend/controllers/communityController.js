const mongoose = require('mongoose');
const Community = require('../models/Community');
const User = require('../models/User');
const Contest = require('../models/Contest');
const { sendOTPEmail, sendMentorWelcomeEmail, sendStudentInvitationEmail } = require('../utils/mailer');
const logger = require('../config/logger');

// @desc    Get all communities
exports.getAllCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find().populate('admin', 'firstName lastName email');
    res.status(200).json({
      success: true,
      count: communities.length,
      data: communities
    });
  } catch (error) {
    logger.error('Get communities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single community by ID or Code
exports.getCommunity = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let community;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      community = await Community.findById(identifier).populate('admin', 'firstName lastName email');
    } else {
      community = await Community.findOne({ code: identifier.toUpperCase() }).populate('admin', 'firstName lastName email');
    }

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    // Check if user is part of the community or admin
    if (!req.user.community || !req.user.community.equals(community._id) && req.user.role !== 'community-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this community' });
    }

    res.status(200).json({
      success: true,
      data: community
    });
  } catch (error) {
    logger.error('Get community error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update community details
exports.updateCommunity = async (req, res, next) => {
  try {
    let community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    // Ensure user is community admin
    if (!community.admin.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this community' });
    }

    community = await Community.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: community
    });
  } catch (error) {
    logger.error('Update community error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add mentor to community
exports.addMentor = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    if (!community.admin.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to add mentors to this community' });
    }

    const { firstName, lastName, email, password } = req.body;

    let mentor = await User.findOne({ email });
    if (mentor) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    mentor = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'mentor',
      community: community._id,
      status: 'active',
      isEmailVerified: true,
      isTemporaryPassword: false
    });

    await community.addMentor(mentor._id);

    // Send welcome email to mentor
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/pages/auth/login.html`;
      await sendMentorWelcomeEmail(mentor.email, mentor.firstName, loginUrl, password);
    } catch (emailError) {
      logger.error('Mentor welcome email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Mentor added successfully',
      data: mentor
    });
  } catch (error) {
    logger.error('Add mentor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add student to community
exports.addStudent = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    if (!community.admin.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to add students to this community' });
    }

    const { firstName, lastName, email, batch } = req.body;

    let student = await User.findOne({ email });
    if (student) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    student = await User.create({
      firstName,
      lastName,
      email,
      role: 'student',
      community: community._id,
      batch,
      status: 'pending',
      isEmailVerified: false,
      isTemporaryPassword: true
    });

    await community.addStudent(student._id);

    // Send invitation email to student
    try {
      const joinUrl = `${process.env.FRONTEND_URL}/pages/personal/communities.html?action=join&email=${encodeURIComponent(email)}&communityCode=${community.code}`;
      await sendStudentInvitationEmail(student.email, student.firstName, community.name, joinUrl);
    } catch (emailError) {
      logger.error('Student invitation email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Student pre-registered successfully. An invitation email has been sent.',
      data: student
    });
  } catch (error) {
    logger.error('Add student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get community statistics
exports.getCommunityStats = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    // Ensure user is part of the community or admin
    if (!req.user.community || !req.user.community.equals(community._id) && req.user.role !== 'community-admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access stats for this community' });
    }

    const totalMentors = await User.countDocuments({ community: community._id, role: 'mentor' });
    const totalStudents = await User.countDocuments({ community: community._id, role: 'student' });
    const activeStudents = await User.countDocuments({ community: community._id, role: 'student', status: 'active' });
    const totalContests = await Contest.countDocuments({ community: community._id });
    const activeContests = await Contest.countDocuments({ community: community._id, status: 'active' });

    res.status(200).json({
      success: true,
      data: {
        totalMentors,
        totalStudents,
        activeStudents,
        totalContests,
        activeContests,
        memberCount: community.memberCount
      }
    });
  } catch (error) {
    logger.error('Get community stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Check if email exists in community
// @route   POST /api/v1/communities/:id/check-email
// @access  Public
exports.checkEmailInCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Check if community exists
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ 
        success: false, 
        message: 'Community not found' 
      });
    }

    // Check if user exists with this email in this community
    const user = await User.findOne({ 
      email, 
      community: id 
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email not found in this community' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email found in community',
      userType: user.role,
      community: {
        _id: community._id,
        name: community.name
      }
    });
  } catch (error) {
    logger.error('Check email in community error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
