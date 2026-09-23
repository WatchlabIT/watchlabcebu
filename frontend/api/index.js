const app = require('../../backend/src/server.js');

module.exports = (req, res) => {
  if (req.url === '/api/health' || req.url === '/health' || req.url === '/api') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ status: 'ok', business: 'Watch Lab Cebu', time: new Date().toISOString() }));
  }
  return app(req, res);
};
