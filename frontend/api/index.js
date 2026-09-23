const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('../../backend/src/routes/auth');
const watchRoutes = require('../../backend/src/routes/watches');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', business: 'Watch Lab Cebu', time: new Date().toISOString() });
});

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api', '/'], watchRoutes);

module.exports = app;
