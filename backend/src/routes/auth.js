const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Admin-only user management
router.get('/users', authenticateToken, requireRole(['admin']), authController.listUsers);
router.post('/users', authenticateToken, requireRole(['admin']), authController.createStaff);

module.exports = router;
