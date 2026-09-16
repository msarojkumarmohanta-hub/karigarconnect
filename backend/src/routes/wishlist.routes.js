const router = require('express').Router(); const c = require('../controllers/wishlist.controller'); const { authenticate } = require('../middleware/auth.middleware');
router.use(authenticate); router.get('/', c.list); router.post('/:productId', c.add); router.delete('/:productId', c.remove); module.exports = router;
