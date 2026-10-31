const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', authenticateToken, requireRole(['admin']), productController.createProduct);
router.put('/:id', authenticateToken, requireRole(['admin']), productController.updateProduct);
router.delete('/:id', authenticateToken, requireRole(['admin']), productController.deleteProduct);

module.exports = router;
