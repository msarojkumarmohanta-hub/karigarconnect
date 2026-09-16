const { validationResult } = require('express-validator');
function expressValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: result.array() } });
  next();
}
module.exports = { expressValidation };
