const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, discountController.listDiscounts);
router.post('/', authenticateToken, requireRole(['admin']), discountController.createDiscount);
router.put('/:id', authenticateToken, requireRole(['admin']), discountController.updateDiscount);
router.delete('/:id', authenticateToken, requireRole(['admin']), discountController.deleteDiscount);

module.exports = router;
