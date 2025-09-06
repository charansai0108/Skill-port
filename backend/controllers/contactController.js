const logger = require('../config/logger');

// @desc    Send contact message
// @route   POST /api/v1/contact
// @access  Public
exports.sendContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Log the contact message (in production, you'd send an email or save to database)
    logger.info('Contact form submission:', {
      firstName,
      lastName,
      email,
      message: message.substring(0, 100) + '...', // Truncate for logging
      timestamp: new Date().toISOString()
    });

    // In a real application, you would:
    // 1. Send an email to admin
    // 2. Save to database
    // 3. Send auto-reply to user

    res.status(200).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!'
    });
  } catch (error) {
    logger.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
};
