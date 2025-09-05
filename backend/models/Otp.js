const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  purpose: { type: String },
}, { timestamps: true });

otpSchema.statics.createOtp = async function (email, code, ttlMinutes = 10, purpose = '') {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  return this.create({ email, code, expiresAt, purpose });
};

otpSchema.statics.verifyOtp = async function (email, code, purpose = '') {
  const otp = await this.findOne({ 
    email, 
    code, 
    purpose,
    used: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otp) return false;
  
  otp.used = true;
  await otp.save();
  return true;
};

module.exports = mongoose.model('Otp', otpSchema);
