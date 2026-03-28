const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String, default: '' },
  passwordResetCode: { type: String, default: '' },
  totpSecret: { type: String, default: '' },
  totpEnabled: { type: Boolean, default: false },
  googleId: { type: String, default: '' },
  phone:    { type: String, default: '' },
  balance:  { type: Number, default: 100000 },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
