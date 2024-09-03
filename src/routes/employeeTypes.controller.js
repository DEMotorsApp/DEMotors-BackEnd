const express = require('express');
const router = express.Router();
const employeeTypeController = require('../controllers/employeeTypes.controller');

// Rutas CRUD para CAT_TIPO_EMPLEADO
router.get('/', employeeTypeController.getAllEmployeeTypes);
router.get('/:id', employeeTypeController.getEmployeeTypeById);
router.post('/', employeeTypeController.createEmployeeType);
router.put('/:id', employeeTypeController.updateEmployeeType);
router.delete('/', employeeTypeController.deleteEmployeeType);
router.post('/createSurveyQuestion', employeeTypeController.createSurveyQuestion);

module.exports = router;
