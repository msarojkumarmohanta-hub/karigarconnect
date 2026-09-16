function validate(req, res, next) {
  const errors = req.validationErrors || [];
  if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: errors } });
  next();
}
module.exports = { validate };
