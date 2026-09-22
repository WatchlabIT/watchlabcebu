const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbOps = require('../db');
const { requireAdminAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = dbOps.getAdminByEmail(email);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Admin authentication successful.',
    token,
    admin: {
      id: admin.id,
      email: admin.email
    }
  });
});

// GET /api/auth/me
router.get('/me', requireAdminAuth, (req, res) => {
  const admin = dbOps.getAdminById(req.admin.id);
  if (!admin) {
    return res.status(404).json({ error: 'Admin account not found.' });
  }

  return res.json({
    admin: {
      id: admin.id,
      email: admin.email
    }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.json({ message: 'Successfully logged out.' });
});

module.exports = router;
