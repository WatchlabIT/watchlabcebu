const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const watchRoutes = require('./routes/watches');
const googleSheetsRoutes = require('./routes/googleSheets');

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

// Middleware to normalize Vercel serverless request URLs
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  } else if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace('/api/index', '') || '/';
  }
  next();
});

// Health check endpoint (supports /api/health, /health, /api, and root /)
app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
  res.json({ status: 'ok', business: 'Watch Lab Cebu', time: new Date().toISOString() });
});

// API Routes (supports both /api/auth and /auth for Vercel Serverless Function compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api', googleSheetsRoutes);
app.use('/', googleSheetsRoutes);

app.use('/api', watchRoutes);
app.use('/', watchRoutes);

// Catch-all 404 handler for unmatched Express routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found in WatchLab API',
    url: req.url,
    originalUrl: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('WatchLab Express Runtime Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected runtime error occurred.'
  });
});

// Start Express HTTP Server locally if run directly outside Vercel
const isVercelEnvironment = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
if (!isVercelEnvironment && require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Watch Lab Cebu API Server running on port ${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
