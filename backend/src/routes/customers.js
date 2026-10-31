const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, customerController.listCustomers);
router.get('/:id', authenticateToken, customerController.getCustomer);
router.post('/', authenticateToken, requireRole(['admin', 'staff']), customerController.createCustomer);
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), customerController.updateCustomer);

module.exports = router;
