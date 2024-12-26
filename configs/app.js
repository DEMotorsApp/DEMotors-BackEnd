'use strict'

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const swaggerDocs = require('./swagger');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require ('cors');
const fileUpload = require('express-fileupload')

const employeeTypeRoutes = require('../src/routes/employeeTypes.controller');
const surveyQuestionRoutes = require('../src/routes/surveyQuestion.routes');
const equipmentSerieRoutes = require('../src/routes/equipmentSerie.routes');
const clientRoutes = require('../src/routes/client.routes')
const equipmentRoutes = require('../src/routes/equipment.routes')
const servicesOrdersRoutes = require('../src/routes/servicesOrder.routes')
const imageRoutes = require('../src/routes/image.routes');
const compression = require('compression');

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const envPath = path.resolve(__dirname, `../.env.${ENVIRONMENT}`);
const app = express();


dotenv.config({ path: envPath });
const port = process.env.PORT || 3000; 
swaggerDocs(app);

app.use(cors())
app.use(fileUpload())
app.use(express.urlencoded({ extended: true }))
app.use(express.text())
app.use(bodyParser.json())
app.use(compression())
app.use(express.json())
// app.use(helmet());
// app.use(bodyParser.urlencoded({extended: false}));
/* app.use(cors({
    origin: '*', // Permitir solicitudes desde cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
})); */

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next()
})

// Routes //
app.use('/api/employee-types', employeeTypeRoutes);
app.use('/api/survey-question', surveyQuestionRoutes);
app.use('/api/equipment-serie', equipmentSerieRoutes);
app.use('/api/client', clientRoutes)
app.use('/api/equipment', equipmentRoutes)
app.use('/api/services-order', servicesOrdersRoutes)
app.use('/api/image', imageRoutes)

exports.initServer = ()=> app.listen(port, async ()=>
{
    console.log(`Listening on port ${port}`)
});

