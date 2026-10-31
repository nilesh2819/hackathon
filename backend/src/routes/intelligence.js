const express = require('express');
const router = express.Router();
const intelController = require('../controllers/intelligenceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 1. Usage-to-Value
router.get('/usage-to-value', authenticateToken, intelController.getUsageToValue);
router.post('/usage-to-value/record', authenticateToken, requireRole(['admin', 'staff']), intelController.recordManualUsage);

// 2. Sharing Intelligence
router.get('/sharing', authenticateToken, intelController.getSharingIntelligence);

// 3. Subscription Value Exchange
router.get('/exchange', authenticateToken, intelController.getValueExchange);
router.post('/exchange/process', authenticateToken, requireRole(['admin']), intelController.processExchangeReallocation);

// 4. Waste Predictor
router.post('/predict-waste', authenticateToken, intelController.predictFutureWaste);

// 5. AI Business Assistant
router.post('/assistant', authenticateToken, intelController.askAssistant);

module.exports = router;
