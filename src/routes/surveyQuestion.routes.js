const express = require('express');
const router = express.Router();
const surveyQuestionController = require('../controllers/surveyQuestion.controller');

// Rutas CAT_SURVEY_QUESTION //
router.post('/createSurveyQuestion', surveyQuestionController.createSurveyQuestion);
router.get('/getAllQuestion', surveyQuestionController.getAllQuestion);

module.exports = router;
