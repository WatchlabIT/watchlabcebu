const app = require('../../../backend/src/server.js');

module.exports = (req, res) => {
  return app(req, res);
};
