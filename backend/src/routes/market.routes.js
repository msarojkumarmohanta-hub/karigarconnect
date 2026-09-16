const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth.middleware');
const recommendations = require('../controllers/recommendation.controller');
const products = require('../controllers/product.controller');
router.get('/recommendations', optionalAuth, recommendations.list);
router.get('/search', products.search);
module.exports = router;
