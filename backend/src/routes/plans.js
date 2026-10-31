const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', planController.listPlans);
router.post('/', authenticateToken, requireRole(['admin']), planController.createPlan);
router.put('/:id', authenticateToken, requireRole(['admin']), planController.updatePlan);
router.delete('/:id', authenticateToken, requireRole(['admin']), planController.deletePlan);

module.exports = router;
