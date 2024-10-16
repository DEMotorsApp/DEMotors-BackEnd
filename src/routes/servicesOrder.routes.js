const express = require('express')
const router = express.Router()
const servicesOrdersController = require('../controllers/servicesOrder.controller')

router.get('/getServicesOrders/:idClient/:startDate/:endDate', servicesOrdersController.getServicesOrders)
router.post('/createServicesOrders', servicesOrdersController.createServicesOrder)

module.exports = router