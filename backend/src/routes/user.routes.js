const router = require('express').Router();
const c = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
router.patch('/me', authenticate, c.updateMe);
router.get('/', authenticate, allowRoles('admin'), c.listUsers);
router.patch('/:id/status', authenticate, allowRoles('admin'), c.setActive);
router.get('/admin/analytics', authenticate, allowRoles('admin'), c.analytics);
module.exports = router;
