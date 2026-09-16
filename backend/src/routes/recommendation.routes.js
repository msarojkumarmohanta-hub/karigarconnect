const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth.middleware');
const { list } = require('../controllers/recommendation.controller');
router.get('/', optionalAuth, list);
module.exports = router;
