const crypto = require('crypto');
const Otp = require('../models/Otp');

// Generate OTP
exports.generateOTP = (length = 6) => {
  return crypto.randomInt(10 ** (length - 1), 10 ** length - 1).toString();
};

// Create OTP record
exports.createOTP = async (email, purpose = 'verification', ttlMinutes = 10) => {
  try {
    // Delete any existing OTPs for this email and purpose
    await Otp.deleteMany({ email, purpose });
    
    const code = exports.generateOTP();
    const otp = await Otp.createOtp(email, code, ttlMinutes, purpose);
    
    return { code, otp };
  } catch (error) {
    throw new Error('Failed to create OTP');
  }
};

// Verify OTP
exports.verifyOTP = async (email, code, purpose = 'verification') => {
  try {
    const isValid = await Otp.verifyOtp(email, code, purpose);
    return isValid;
  } catch (error) {
    return false;
  }
};

// Clean expired OTPs
exports.cleanExpiredOTPs = async () => {
  try {
    const result = await Otp.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount;
  } catch (error) {
    throw new Error('Failed to clean expired OTPs');
  }
};
