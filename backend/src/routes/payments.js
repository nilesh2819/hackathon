const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, paymentController.listPayments);
router.post('/', authenticateToken, requireRole(['admin', 'staff', 'customer']), paymentController.recordPayment);

module.exports = router;
