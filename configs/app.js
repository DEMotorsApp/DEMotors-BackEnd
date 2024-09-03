'use strict'

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const swaggerDocs = require('./swagger');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require ('cors');

const employeeTypeRoutes = require('../src/routes/employeeTypes.controller');
const surveyQuestionRoutes = require('../src/routes/surveyQuestion.routes');

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const envPath = path.resolve(__dirname, `../.env.${ENVIRONMENT}`);
const app = express();


dotenv.config({ path: envPath });
const port = process.env.PORT || 3000; 
swaggerDocs(app);

app.use(express.json());
app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

// Routes //
app.use('/api/employee-types', employeeTypeRoutes);
app.use('/api/survey-question', surveyQuestionRoutes);

exports.initServer = ()=> app.listen(port, async ()=>
{
    console.log(`Listening on port ${port}`)
});

