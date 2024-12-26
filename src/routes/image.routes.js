const express = require('express')
const path = require('path')
const router = express.Router()
const imageController = require('../controllers/image.controller')
const { upload } = require('../Middleware/image.middleware')



router.use('/static', express.static('C:/uploads'))

router.post('/upload', imageController.uploadImage)
router.get('/get/images/:idServiceOrder', imageController.getImages)
router.get('/get/images/clients/:idClient/:startDate/:endDate', imageController.getImagesReportClient)
router.get('/get/images/equipment/:idClient/:noSerie/:startDate/:endDate', imageController.getImagesReportEquipment)

module.exports = router