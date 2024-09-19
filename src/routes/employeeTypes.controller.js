const express = require('express');
const router = express.Router();
const employeeTypeController = require('../controllers/employeeTypes.controller');

// Rutas CAT_EMPLOYEE_TYPE //
router.post('/createEmployeeType', employeeTypeController.createEmployeeType);
router.get('/getAllEmployeeType', employeeTypeController.getAllEmployeeTypes);

module.exports = router;
