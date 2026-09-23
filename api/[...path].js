const app = require('../backend/src/server.js');

module.exports = (req, res) => {
  try {
    const parsed = new URL(req.url, 'http://localhost');
    const pathParam = parsed.searchParams.get('path');

    if (pathParam) {
      parsed.searchParams.delete('path');
      const searchStr = parsed.searchParams.toString();
      const targetPath = pathParam.startsWith('/') ? pathParam : '/' + pathParam;
      req.url = targetPath + (searchStr ? '?' + searchStr : '');
    }
  } catch (err) {}

  return app(req, res);
};
