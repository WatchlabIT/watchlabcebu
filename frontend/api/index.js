const serverless = require('serverless-http');
const app = require('../../backend/src/server.js');

module.exports = serverless(app);
