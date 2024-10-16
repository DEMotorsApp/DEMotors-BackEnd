const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client.controller')

router.post('/createClient', clientController.createClient)
router.get('/getClients', clientController.getClients)
router.get('/getEquipmentByClients/:idClient/:startDate/:endDate', clientController.getReportClientsEquipment)

module.exports = router