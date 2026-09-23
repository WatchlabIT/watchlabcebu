const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const watchRoutes = require('./routes/watches');

const app = express();
const PORT = process.env.PORT || 5005;

// Enable CORS for frontend cross-origin access
app.use(cors());

// Middleware for parsing JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static watch image uploads
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint (supports both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', business: 'Watch Lab Cebu', time: new Date().toISOString() });
});

// API Routes (supports both /api/auth and /auth for Vercel Serverless Function compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api', watchRoutes);
app.use('/', watchRoutes);

// Start Express HTTP Server locally if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Watch Lab Cebu API Server running on port ${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
