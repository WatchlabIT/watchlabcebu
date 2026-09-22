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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', watchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', business: 'WatchLab Cebu', time: new Date().toISOString() });
});

// Global 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Start Express HTTP Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` WatchLab Cebu API Server running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
