const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dbOps = require('../db');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer file upload storage
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, 'watch-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, JPEG, PNG, and WebP image formats are supported.'));
  }
});

// GET /api/watches - Public watch catalog listing with brand, condition, and search filters
router.get('/watches', (req, res) => {
  const { brand, condition, search } = req.query;
  const watches = dbOps.getAllWatches({ brand, condition, search });
  res.json({ count: watches.length, watches });
});

// GET /api/watches/new-arrivals - Public endpoint for newest watch listings
router.get('/watches/new-arrivals', (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 4;
  const watches = dbOps.getNewArrivals(limit);
  res.json({ count: watches.length, watches });
});

// GET /api/watches/brands - Public endpoint for dynamically generated brand filter list
router.get('/watches/brands', (req, res) => {
  const brands = dbOps.getUniqueBrands();
  res.json({ brands });
});

// GET /api/watches/:id - Public single watch detail page data
router.get('/watches/:id', (req, res) => {
  const watch = dbOps.getWatchById(req.params.id);
  if (!watch) {
    return res.status(404).json({ error: 'Watch listing not found.' });
  }
  res.json({ watch });
});

// GET /api/admin/stats - Admin dashboard metrics (Protected)
router.get('/admin/stats', requireAdminAuth, (req, res) => {
  const stats = dbOps.getInventoryStats();
  res.json({ stats });
});

// POST /api/upload - Admin image upload endpoint (Protected)
router.post('/upload', requireAdminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ message: 'Image uploaded successfully.', image_url: imageUrl });
});

const { triggerAutoSync } = require('../services/googleSheetsService');

// POST /api/watches - Admin create watch listing (Protected, supports JSON or multipart)
router.post('/watches', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, brand, price, stock, condition, description } = req.body;

    if (!name || !brand || price === undefined || stock === undefined || !condition || !description) {
      return res.status(400).json({ error: 'Watch Name, Brand, Price, Stock, Condition, and Description are required.' });
    }

    if (!['Brand New', 'Pre-Owned'].includes(condition)) {
      return res.status(400).json({ error: 'Condition must be either "Brand New" or "Pre-Owned".' });
    }

    let image_url = req.body.image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    if (!image_url) {
      return res.status(400).json({ error: 'Watch image is required.' });
    }

    const newWatch = dbOps.createWatch({
      name,
      brand,
      price: Number(price),
      stock: Number(stock),
      condition,
      description,
      image_url
    });

    // Auto-sync to Google Sheets (await to prevent serverless cancellation)
    await triggerAutoSync('upsert', newWatch);

    res.status(201).json({ message: 'Watch created successfully.', watch: newWatch });
  } catch (err) {
    console.error('Error creating watch:', err);
    res.status(500).json({ error: 'Failed to create watch listing.' });
  }
});

// PUT /api/watches/:id - Admin update watch listing (Protected)
router.put('/watches/:id', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const existingWatch = dbOps.getWatchById(req.params.id);
    if (!existingWatch) {
      return res.status(404).json({ error: 'Watch listing not found.' });
    }

    const { name, brand, price, stock, condition, description } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    if (condition && !['Brand New', 'Pre-Owned'].includes(condition)) {
      return res.status(400).json({ error: 'Condition must be either "Brand New" or "Pre-Owned".' });
    }

    const updatedWatch = dbOps.updateWatch(req.params.id, {
      name,
      brand,
      price: price !== undefined ? Number(price) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      condition,
      description,
      image_url
    });

    // Auto-sync to Google Sheets (await to prevent serverless cancellation)
    await triggerAutoSync('upsert', updatedWatch);

    res.json({ message: 'Watch updated successfully.', watch: updatedWatch });
  } catch (err) {
    console.error('Error updating watch:', err);
    res.status(500).json({ error: 'Failed to update watch listing.' });
  }
});

// DELETE /api/watches/:id - Admin delete watch listing (Protected)
router.delete('/watches/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = dbOps.deleteWatch(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Watch listing not found.' });
    }

    // Auto-sync deletion to Google Sheets (await to prevent serverless cancellation)
    await triggerAutoSync('delete', req.params.id);

    res.json({ message: 'Watch listing deleted successfully.', watch: deleted });
  } catch (err) {
    console.error('Error deleting watch:', err);
    res.status(500).json({ error: 'Failed to delete watch listing.' });
  }
});

module.exports = router;
