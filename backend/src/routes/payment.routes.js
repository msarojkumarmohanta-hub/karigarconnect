const router = require('express').Router(); const { authenticate } = require('../middleware/auth.middleware'); const { success } = require('../utils/response');
router.post('/create-order', authenticate, (req, res) => success(res, { provider: 'manual', status: 'pending', amount: req.body.amount }, 'Payment order created; configure a provider for live payments'));
router.post('/verify', authenticate, (req, res) => success(res, { verified: false, status: 'pending' }, 'Payment verification requires a configured provider'));
router.post('/webhook', (req, res) => success(res, null, 'Webhook received'));
module.exports = router;
