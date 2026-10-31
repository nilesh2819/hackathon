const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, quotationController.listQuotations);
router.post('/', authenticateToken, requireRole(['admin', 'staff']), quotationController.createQuotation);
router.post('/:id/convert', authenticateToken, requireRole(['admin', 'staff']), quotationController.convertToSubscription);

module.exports = router;
