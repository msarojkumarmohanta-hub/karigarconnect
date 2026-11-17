const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean);

function allowOrigin(origin, callback) {
  const isLocalDevelopmentOrigin = process.env.NODE_ENV !== 'production'
    && /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin || '');

  if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
    return callback(null, true);
  }

  return callback(new Error('Origin not allowed by CORS'));
}

module.exports = { origin: allowOrigin, credentials: true };
