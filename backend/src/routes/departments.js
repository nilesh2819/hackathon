const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, departmentController.listDepartments);

module.exports = router;
