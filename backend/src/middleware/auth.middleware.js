const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Authentication required', error: { code: 'AUTH_REQUIRED' } });
    const payload = verifyAccessToken(header.slice(7));
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Account is unavailable', error: { code: 'ACCOUNT_UNAVAILABLE' } });
    req.user = user; next();
  } catch (error) { next(Object.assign(new Error('Invalid or expired token'), { status: 401, code: 'INVALID_TOKEN' })); }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  try { req.user = { _id: verifyAccessToken(header.slice(7)).sub }; } catch (_) { /* public request remains public */ }
  next();
}
module.exports = { authenticate, optionalAuth };
