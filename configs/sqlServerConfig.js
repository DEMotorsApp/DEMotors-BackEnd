'use strict';

const sql = require('mssql');
const path = require('path');
const dotenv = require('dotenv');

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const envPath = path.resolve(__dirname, `../.env.${ENVIRONMENT}`);

dotenv.config({ path: envPath });
const config = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
  options: 
  {
    encrypt: false,
    enableArithAbort: true,
    enablerithPort: false,
    trustedConnection: false,
    trustServerCertificate: true,
  },
};
console.log(config)

exports.init = async () => {
  try 
  {
    await sql.connect(config);
    console.log(`Conexión exitosa a ${process.env.DB_NAME}`);
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
  }
};