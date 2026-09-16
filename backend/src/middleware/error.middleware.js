const logger = require('../utils/logger');
function notFound(req, res) { res.status(404).json({ success: false, message: 'Route not found', error: { code: 'NOT_FOUND' } }); }
function errorHandler(error, req, res, next) {
  logger.error({ err: error, path: req.path }, error.message);
  const status = error.status || (error.name === 'ValidationError' ? 422 : error.name === 'CastError' ? 400 : error.code === 11000 ? 409 : 500);
  const code = error.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
  res.status(status).json({ success: false, message: status === 500 ? 'An unexpected error occurred' : error.message, error: { code } });
}
module.exports = { notFound, errorHandler };
