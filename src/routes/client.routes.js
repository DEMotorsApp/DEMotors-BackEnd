const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client.controller')

router.post('/createClient', clientController.createClient)

module.exports = router