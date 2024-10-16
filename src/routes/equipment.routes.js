const express = require('express')
const router = express.Router()
const equipmentController = require('../controllers/equipment.controller')

router.post('/createEquipment', equipmentController.createEquipment)
router.get('/getDetailsEquipment/:idClient/:noSerie/:startDate/:endDate', equipmentController.getDetailsEquipment)

module.exports = router