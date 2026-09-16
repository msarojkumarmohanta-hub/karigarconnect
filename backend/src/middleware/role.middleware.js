function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.user.role) ? next() : next(Object.assign(new Error('You do not have permission for this action'), { status: 403, code: 'FORBIDDEN' }));
}
module.exports = { allowRoles };
