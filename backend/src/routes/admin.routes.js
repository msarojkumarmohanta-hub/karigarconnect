const router = require('express').Router();
const c = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
router.use(authenticate, allowRoles('admin'));
router.get('/dashboard', c.dashboard); router.get('/users', c.users); router.get('/artisans', c.artisans); router.get('/products', c.products); router.get('/orders', c.orders);
router.patch('/products/:id/approve', c.moderate); router.patch('/products/:id/reject', c.moderate);
router.patch('/users/:id/block', c.block); router.patch('/users/:id/unblock', c.unblock);
module.exports = router;
