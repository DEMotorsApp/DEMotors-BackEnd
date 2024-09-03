'use strict';

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const dotenv = require('dotenv');

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const envPath = path.resolve(__dirname, `../.env.${ENVIRONMENT}`);
dotenv.config({ path: envPath });

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API DEMOTORS Documentation',
      version: '1.0.0',
      description: 'Documentación de la API DEMOTORS',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: `Servidor ${process.env.ENVIRONMENT} | API ${ENVIRONMENT}`,
      },
    ],
  },
  apis: [], // Ruta a tus archivos de rutas
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = swaggerDocs;
