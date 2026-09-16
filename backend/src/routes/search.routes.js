const router = require('express').Router(); const c = require('../controllers/product.controller'); router.get('/products', c.search); module.exports = router;
