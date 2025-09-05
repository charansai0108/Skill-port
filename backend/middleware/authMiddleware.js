const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * requireAuth - Standardized auth middleware
 * Reads access token from httpOnly cookie 'accessToken'
 * Verifies token, loads user and attaches to req.user
 * Returns 401 on missing/expired/invalid token
 */
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ ok: false, message: 'Not authenticated' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ ok: false, message: 'Token invalid or expired' });
    }

    const user = await User.findById(payload.id).select('-password -otp');
    if (!user) return res.status(401).json({ ok: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('requireAuth error', err);
    return res.status(500).json({ ok: false, message: 'Server error in auth' });
  }
};

module.exports = requireAuth;
