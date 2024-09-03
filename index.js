'use strict'

const app = require('./configs/app');
const sqlServer = require('./configs/sqlServerConfig');

sqlServer.init();
app.initServer();
