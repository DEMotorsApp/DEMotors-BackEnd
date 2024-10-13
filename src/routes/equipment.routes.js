const express = require('express')
const router = express.Router()
const equipmentController = require('../controllers/equipment.controller')

router.post('/createEquipment', equipmentController.createEquipment)

module.exports = router