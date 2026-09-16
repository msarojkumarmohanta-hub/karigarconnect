const router = require('express').Router();
const c = require('../controllers/artisan.controller');
const pc = require('../controllers/product.controller');
const oc = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.get('/', c.listArtisans); router.get('/me', authenticate, allowRoles('artisan'), c.getMe); router.put('/me', authenticate, allowRoles('artisan'), c.updateMe); router.get('/dashboard', authenticate, allowRoles('artisan'), c.dashboard);
router.get('/analytics', authenticate, allowRoles('artisan'), c.analytics);
router.get('/orders', authenticate, allowRoles('artisan'), oc.list);
router.get('/:id', c.getArtisan); router.get('/:artisanId/products', pc.artisanProducts);

module.exports = router;
