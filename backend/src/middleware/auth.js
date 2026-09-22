const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'watchlab_cebu_super_secret_jwt_key_2026';

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin session token.' });
  }
}

module.exports = {
  requireAdminAuth,
  JWT_SECRET
};
