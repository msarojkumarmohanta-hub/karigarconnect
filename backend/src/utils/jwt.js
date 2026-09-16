const jwt = require('jsonwebtoken');

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, name: user.name }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_TTL || '15m' });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString(), type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_TTL || '30d' });
}

function verifyAccessToken(token) { return jwt.verify(token, process.env.JWT_ACCESS_SECRET); }
function verifyRefreshToken(token) { return jwt.verify(token, process.env.JWT_REFRESH_SECRET); }

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
