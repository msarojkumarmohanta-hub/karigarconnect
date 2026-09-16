const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true, select: false, minlength: 8 },
  role: { type: String, enum: ['artisan', 'buyer', 'admin'], default: 'buyer', index: true },
  avatar: String,
  bio: String,
  location: { village: String, district: String, state: String, country: { type: String, default: 'India' } },
  craftType: String,
  language: { type: String, default: 'en' },
  verified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  refreshTokenHash: { type: String, select: false },
  resetTokenHash: { type: String, select: false },
  resetTokenExpires: Date,
  verificationTokenHash: { type: String, select: false },
  verificationTokenExpires: Date
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function comparePassword(value) { return bcrypt.compare(value, this.password); };
userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password; delete obj.refreshTokenHash; delete obj.resetTokenHash; delete obj.resetTokenExpires; delete obj.verificationTokenHash; delete obj.verificationTokenExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
