const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, subscriptionController.listSubscriptions);
router.get('/:id', authenticateToken, subscriptionController.getSubscription);
router.post('/:id/lifecycle', authenticateToken, requireRole(['admin', 'staff', 'customer']), subscriptionController.updateLifecycle);

module.exports = router;
