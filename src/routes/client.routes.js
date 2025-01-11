const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client.controller')

router.post('/createClient', clientController.createClient)
router.get('/getClients', clientController.getClients)
router.get('/getClientsServices', clientController.getClientsServices)
router.get('/getClient/:idClient', clientController.getClient)
router.get('/getEquipmentByClients/:idClient/:startDate/:endDate', clientController.getReportClientsEquipment)
router.delete('/deleteClient/:idClient', clientController.deleteClient)

module.exports = router