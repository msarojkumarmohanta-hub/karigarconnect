const crypto = require('crypto');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { success, created } = require('../utils/response');

async function register(req, res, next) {
  try {
    const { name, email, phone, password, role = 'buyer', craftType } = req.body;
    if (!name || !email || !password || password.length < 8) return next(Object.assign(new Error('Name, email and a password of at least 8 characters are required'), { status: 422, code: 'INVALID_INPUT' }));
    if (!['artisan', 'buyer'].includes(role)) return next(Object.assign(new Error('Only artisan or buyer registration is allowed'), { status: 422, code: 'INVALID_ROLE' }));
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ name, email, phone, password, role, craftType, verificationTokenHash: crypto.createHash('sha256').update(verificationToken).digest('hex'), verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 });
    if (role === 'artisan') await Artisan.create({ userId: user._id, craftType });
    return created(res, { user: user.toSafeJSON(), accessToken: signAccessToken(user), refreshToken: signRefreshToken(user), verificationToken: process.env.NODE_ENV === 'production' ? undefined : verificationToken }, 'Registration successful');
  } catch (error) { next(error); }
}
async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await user.comparePassword(req.body.password))) return next(Object.assign(new Error('Invalid email or password'), { status: 401, code: 'INVALID_CREDENTIALS' }));
    return success(res, { user: user.toSafeJSON(), accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) }, 'Login successful');
  } catch (error) { next(error); }
}
async function refresh(req, res, next) {
  try { const payload = verifyRefreshToken(req.body.refreshToken); const user = await User.findById(payload.sub); if (!user) throw Object.assign(new Error('Invalid refresh token'), { status: 401, code: 'INVALID_REFRESH_TOKEN' }); return success(res, { accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) }, 'Token refreshed'); } catch (error) { next(Object.assign(error, { status: 401, code: 'INVALID_REFRESH_TOKEN' })); }
}
async function verifyEmail(req, res, next) {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.body.token || '').digest('hex');
    const user = await User.findOne({ verificationTokenHash: tokenHash, verificationTokenExpires: { $gt: Date.now() } }).select('+verificationTokenHash');
    if (!user) return next(Object.assign(new Error('Verification token is invalid or expired'), { status: 400, code: 'INVALID_VERIFICATION_TOKEN' }));
    user.verified = true; user.verificationTokenHash = undefined; user.verificationTokenExpires = undefined; await user.save();
    return success(res, user.toSafeJSON(), 'Email verified successfully');
  } catch (error) { next(error); }
}
async function requestPasswordReset(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      user.resetTokenExpires = Date.now() + 60 * 60 * 1000;
      await user.save();
      return success(res, { resetToken: process.env.NODE_ENV === 'production' ? undefined : token }, 'If the account exists, reset instructions have been created');
    }
    return success(res, {}, 'If the account exists, reset instructions have been created');
  } catch (error) { next(error); }
}
async function resetPassword(req, res, next) {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.body.token || '').digest('hex');
    const user = await User.findOne({ resetTokenHash: tokenHash, resetTokenExpires: { $gt: Date.now() } }).select('+resetTokenHash');
    if (!user || !req.body.password || req.body.password.length < 8) return next(Object.assign(new Error('Reset token is invalid or password is too short'), { status: 400, code: 'INVALID_PASSWORD_RESET' }));
    user.password = req.body.password; user.resetTokenHash = undefined; user.resetTokenExpires = undefined; await user.save();
    return success(res, null, 'Password reset successfully');
  } catch (error) { next(error); }
}
async function me(req, res) { return success(res, req.user.toSafeJSON(), 'Profile fetched successfully'); }
async function logout(req, res) { return success(res, null, 'Logged out successfully'); }
module.exports = { register, login, refresh, verifyEmail, requestPasswordReset, resetPassword, me, logout };
