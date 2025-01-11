const express = require('express')
const router = express.Router()
const servicesOrdersController = require('../controllers/servicesOrder.controller')

router.get('/getServicesOrders/:idClient/:startDate/:endDate', servicesOrdersController.getServicesOrders)
router.post('/createServicesOrders', servicesOrdersController.createServicesOrder)
router.post('/createClientServicesOrder', servicesOrdersController.createClientServices)
router.get('/validateServicesOrder/:idServiceOrder', servicesOrdersController.validateServicesOrder)
router.get('/getClientServicesOrder/:servicesOrder', servicesOrdersController.getClientServices)
router.delete('/deleteClientServices/:servicesOrder/:idClient', servicesOrdersController.deleteClientServices)

module.exports = router