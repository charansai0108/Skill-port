const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    index: true,
    lowercase: true,
    trim: true
  },
  code: { 
    type: String, 
    required: true 
  },
  hashedCode: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  used: { 
    type: Boolean, 
    default: false 
  },
  purpose: { 
    type: String,
    enum: ['registration', 'password-reset', 'email-verification'],
    default: 'registration'
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  }
}, { timestamps: true });

// Hash OTP before saving
otpSchema.pre('save', async function(next) {
  if (this.isModified('code')) {
    this.hashedCode = await bcrypt.hash(this.code, 12);
  }
  next();
});

otpSchema.statics.createOtp = async function (email, code, ttlMinutes = 10, purpose = 'registration') {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  return this.create({ email, code, expiresAt, purpose });
};

otpSchema.statics.verifyOtp = async function (email, code, purpose = 'registration') {
  const otp = await this.findOne({ 
    email, 
    purpose,
    used: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otp) return false;
  
  if (otp.attempts >= 3) {
    return false;
  }
  
  const isValid = await bcrypt.compare(code, otp.hashedCode);
  
  if (!isValid) {
    otp.attempts += 1;
    await otp.save();
    return false;
  }
  
  otp.used = true;
  await otp.save();
  return true;
};

// Clean up expired OTPs
otpSchema.statics.cleanupExpired = async function() {
  await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { used: true, createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Delete used OTPs older than 24 hours
    ]
  });
};

// Additional indexes for performance
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
