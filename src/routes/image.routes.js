const express = require('express')
const path = require('path')
const router = express.Router()
const imageController = require('../controllers/image.controller')
const { upload } = require('../Middleware/image.middleware')



router.use('/static', express.static('C:/uploads'))

router.post('/upload', upload.single('image'), imageController.uploadImage)
router.get('/get/images/:idServiceOrder', imageController.getImages)

module.exports = router