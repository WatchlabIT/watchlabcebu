let app;
let initError = null;

try {
  app = require('../backend/src/server.js');
} catch (err) {
  initError = err;
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      error: 'Vercel Initialization Error (Root API)',
      message: initError.message,
      stack: initError.stack
    });
  }

  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      error: 'Vercel Runtime Execution Error (Root API)',
      message: err.message,
      stack: err.stack
    });
  }
};
