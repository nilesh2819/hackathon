const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, invoiceController.listInvoices);
router.get('/:id', authenticateToken, invoiceController.getInvoice);
router.get('/:id/pdf', invoiceController.downloadPdf); // PDF downloadable directly
router.post('/generate-recurring', authenticateToken, requireRole(['admin', 'staff']), invoiceController.generateRecurringInvoice);
router.patch('/:id/status', authenticateToken, requireRole(['admin', 'staff']), invoiceController.updateStatus);

module.exports = router;
