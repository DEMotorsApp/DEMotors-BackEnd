const express = require('express');
const router = express.Router();
const equipmentSerieController = require('../controllers/equipmentSerie.controller');

// Rutas CAT_SURVEY_QUESTION //
router.post('/createEquipmentSerie', equipmentSerieController.createEquipmentSerie);
router.get('/getAllEquipmentSerie', equipmentSerieController.getAllEquipmentSeries);

module.exports = router;
