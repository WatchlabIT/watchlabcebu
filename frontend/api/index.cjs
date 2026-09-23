const path = require('path');
const app = require(path.resolve(__dirname, '../../backend/src/server.js'));

module.exports = (req, res) => {
  return app(req, res);
};
