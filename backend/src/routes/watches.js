const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dbOps = require('../db');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer file upload storage
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) {}
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
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
router.get('/watches', async (req, res) => {
  try {
    const { brand, condition, search } = req.query;
    const watches = await dbOps.getAllWatches({ brand, condition, search });
    res.json({ count: watches.length, watches });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watch catalog.' });
  }
});

// GET /api/watches/new-arrivals - Public endpoint for newest watch listings
router.get('/watches/new-arrivals', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 4;
    const watches = await dbOps.getNewArrivals(limit);
    res.json({ count: watches.length, watches });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch new arrivals.' });
  }
});

// GET /api/watches/brands - Public endpoint for dynamically generated brand filter list
router.get('/watches/brands', async (req, res) => {
  try {
    const brands = await dbOps.getUniqueBrands();
    res.json({ brands });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watch brands.' });
  }
});

// GET /api/watches/:id - Public single watch detail page data
router.get('/watches/:id', async (req, res) => {
  try {
    const watch = await dbOps.getWatchById(req.params.id);
    if (!watch) {
      return res.status(404).json({ error: 'Watch listing not found.' });
    }
    res.json({ watch });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watch details.' });
  }
});

// GET /api/admin/stats - Admin dashboard metrics (Protected)
router.get('/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await dbOps.getInventoryStats();
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

// POST /api/upload - Admin image upload endpoint (Protected)
router.post('/upload', requireAdminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }
  let imageUrl;
  if (req.file.buffer) {
    imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  } else {
    imageUrl = `/uploads/${req.file.filename}`;
  }
  res.json({ message: 'Image uploaded successfully.', image_url: imageUrl });
});



// POST /api/watches/batch-import - Admin batch import watches from Excel/CSV (Protected)
router.post('/watches/batch-import', requireAdminAuth, express.json({ limit: '20mb' }), async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No watch items provided for import.' });
    }

    const createdWatches = [];
    for (const item of items) {
      const name = item.name ? String(item.name).trim() : '';
      const brand = item.brand ? String(item.brand).trim() : '';
      const priceVal = Number(item.price);
      const stockVal = Number(item.stock !== undefined ? item.stock : 1);
      const condition = item.condition && ['Brand New', 'Pre-Owned'].includes(item.condition) ? item.condition : 'Brand New';
      const gender = item.gender && ['Unisex', 'Men', 'Women'].includes(item.gender) ? item.gender : 'Unisex';
      const description = item.description ? String(item.description).trim() : 'Watch details provided via Excel import.';
      let image_url = item.image_url || item.image || item['Image Link'] || item['Image URL'] || '';
      let images = Array.isArray(item.images) ? item.images : (image_url ? [image_url] : []);

      if (name && brand && !isNaN(priceVal)) {
        const w = dbOps.createWatch({
          name,
          brand,
          price: priceVal,
          stock: isNaN(stockVal) ? 1 : stockVal,
          condition,
          gender,
          description,
          image_url: images[0] || image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'],
          is_featured: !!item.is_featured
        });
        createdWatches.push(w);
      }
    }

    res.json({ message: `Successfully imported ${createdWatches.length} watch listings.`, importedCount: createdWatches.length });
  } catch (err) {
    console.error('Batch import error:', err);
    res.status(500).json({ error: 'Failed to import watches.' });
  }
});

// POST /api/watches - Admin create watch listing (Protected, supports JSON or multipart)
router.post('/watches', requireAdminAuth, upload.any(), async (req, res) => {
  try {
    const name = req.body.name ? String(req.body.name).trim() : '';
    const brand = req.body.brand ? String(req.body.brand).trim() : '';
    const priceVal = req.body.price !== undefined && req.body.price !== null && req.body.price !== '' ? Number(req.body.price) : NaN;
    const stockVal = req.body.stock !== undefined && req.body.stock !== null && req.body.stock !== '' ? Number(req.body.stock) : NaN;
    const condition = req.body.condition ? String(req.body.condition).trim() : '';
    const description = req.body.description ? String(req.body.description).trim() : '';
    const gender = req.body.gender ? String(req.body.gender).trim() : 'Unisex';

    if (!name) return res.status(400).json({ error: 'Watch Name is required.' });
    if (!brand) return res.status(400).json({ error: 'Watch Brand is required.' });
    if (isNaN(priceVal) || priceVal < 0) return res.status(400).json({ error: 'Valid Price is required.' });
    if (isNaN(stockVal) || stockVal < 0) return res.status(400).json({ error: 'Valid Stock Quantity is required.' });
    if (!condition || !['Brand New', 'Pre-Owned'].includes(condition)) return res.status(400).json({ error: 'Condition must be either "Brand New" or "Pre-Owned".' });
    if (!description) return res.status(400).json({ error: 'Watch Description is required.' });

    let images = [];
    if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        images = req.body.images;
      } else if (typeof req.body.images === 'string') {
        try {
          const parsed = JSON.parse(req.body.images);
          if (Array.isArray(parsed)) images = parsed;
          else images = [req.body.images];
        } catch (e) {
          images = [req.body.images];
        }
      }
    } else if (req.body.image_url) {
      images.push(req.body.image_url);
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.buffer) {
          images.push(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
        } else if (file.path && fs.existsSync(file.path)) {
          try {
            const fileBuf = fs.readFileSync(file.path);
            images.push(`data:${file.mimetype};base64,${fileBuf.toString('base64')}`);
          } catch (e) {
            images.push(`/uploads/${file.filename}`);
          }
        } else {
          images.push(`/uploads/${file.filename}`);
        }
      }
    }

    if (images.length === 0) {
      return res.status(400).json({ error: 'Watch image is required (upload file or provide image URL).' });
    }

    const newWatch = dbOps.createWatch({
      name,
      brand,
      price: priceVal,
      stock: stockVal,
      condition,
      gender: ['Unisex', 'Men', 'Women'].includes(gender) ? gender : 'Unisex',
      description,
      image_url: images[0],
      images
    });

    res.status(201).json({ message: 'Watch created successfully.', watch: newWatch });
  } catch (err) {
    console.error('Error creating watch:', err);
    res.status(500).json({ error: 'Failed to create watch listing.' });
  }
});

// PUT /api/watches/:id - Admin update watch listing (Protected)
router.put('/watches/:id', requireAdminAuth, upload.any(), async (req, res) => {
  try {
    const existingWatch = await dbOps.getWatchById(req.params.id);
    if (!existingWatch) {
      return res.status(404).json({ error: 'Watch listing not found.' });
    }

    const { name, brand, price, stock, condition, gender, description, is_featured } = req.body;
    let images = undefined;

    if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        images = req.body.images;
      } else if (typeof req.body.images === 'string') {
        try {
          const parsed = JSON.parse(req.body.images);
          if (Array.isArray(parsed)) images = parsed;
          else images = [req.body.images];
        } catch (e) {
          images = [req.body.images];
        }
      }
    }

    if (req.files && req.files.length > 0) {
      if (!images) images = [];
      for (const file of req.files) {
        if (file.buffer) {
          images.push(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
        } else if (file.path && fs.existsSync(file.path)) {
          try {
            const fileBuf = fs.readFileSync(file.path);
            images.push(`data:${file.mimetype};base64,${fileBuf.toString('base64')}`);
          } catch (e) {
            images.push(`/uploads/${file.filename}`);
          }
        } else {
          images.push(`/uploads/${file.filename}`);
        }
      }
    }

    if (condition && !['Brand New', 'Pre-Owned'].includes(condition)) {
      return res.status(400).json({ error: 'Condition must be either "Brand New" or "Pre-Owned".' });
    }

    const isFeaturedBool = is_featured === true || is_featured === 'true' || is_featured === 1;

    const updatedWatch = dbOps.updateWatch(req.params.id, {
      name: name ? String(name).trim() : undefined,
      brand: brand ? String(brand).trim() : undefined,
      price: price !== undefined && price !== '' ? Number(price) : undefined,
      stock: stock !== undefined && stock !== '' ? Number(stock) : undefined,
      condition,
      gender: gender && ['Unisex', 'Men', 'Women'].includes(String(gender).trim()) ? String(gender).trim() : undefined,
      description: description ? String(description).trim() : undefined,
      images,
      image_url: images && images.length > 0 ? images[0] : req.body.image_url,
      is_featured: is_featured !== undefined ? isFeaturedBool : undefined
    });

    res.json({ message: 'Watch updated successfully.', watch: updatedWatch });
  } catch (err) {
    console.error('Error updating watch:', err);
    res.status(500).json({ error: 'Failed to update watch listing.' });
  }
});

// DELETE /api/watches/:id - Admin delete watch listing (Protected)
router.delete('/watches/:id', requireAdminAuth, async (req, res) => {
  try {
    const watchId = req.params.id;



    const deleted = dbOps.deleteWatch(watchId);

    res.json({
      message: 'Watch listing deleted successfully.',
      watch: deleted || { id: Number(watchId) }
    });
  } catch (err) {
    console.error('Error deleting watch:', err);
    res.status(500).json({ error: 'Failed to delete watch listing.' });
  }
});

module.exports = router;
