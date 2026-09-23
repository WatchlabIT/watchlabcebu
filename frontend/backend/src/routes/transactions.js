const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dbOps = require('../db');
const { requireAdminAuth } = require('../middleware/auth');
const { triggerAutoSync } = require('../services/googleSheetsService');

const router = express.Router();

const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) {}
}

const storage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadsDir),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, 'tx-' + uniqueSuffix + ext);
      }
    });

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// GET /api/transactions - Public list of featured client transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await dbOps.getAllTransactions();
    res.json({ count: transactions.length, transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured transactions.' });
  }
});

// GET /api/transactions/:id - Public single transaction details
router.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await dbOps.getTransactionById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    res.json({ transaction });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction details.' });
  }
});

// POST /api/transactions - Admin create new featured transaction (Protected)
router.post('/transactions', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, location, category, badge, note } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Transaction Title is required.' });
    }
    if (!subtitle || !String(subtitle).trim()) {
      return res.status(400).json({ error: 'Transaction Subtitle / Client note is required.' });
    }

    let image_url = req.body.image_url;
    if (req.file) {
      if (req.file.buffer) {
        image_url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else {
        image_url = `/uploads/${req.file.filename}`;
      }
    }

    if (!image_url) {
      return res.status(400).json({ error: 'Transaction image is required.' });
    }

    const newTx = dbOps.createTransaction({
      title: String(title).trim(),
      subtitle: String(subtitle).trim(),
      location: location ? String(location).trim() : 'Cebu',
      category: category ? String(category).trim() : 'Meetups',
      badge: badge ? String(badge).trim() : 'Handover',
      note: note ? String(note).trim() : '',
      image_url
    });

    // Auto-sync to Google Sheets in "Transactions" tab
    await triggerAutoSync('upsert_transaction', newTx);

    res.status(201).json({ message: 'Featured transaction added successfully.', transaction: newTx });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: 'Failed to create featured transaction.' });
  }
});

// PUT /api/transactions/:id - Admin update featured transaction (Protected)
router.put('/transactions/:id', requireAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const existing = dbOps.getTransactionById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const { title, subtitle, location, category, badge, note } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
      if (req.file.buffer) {
        image_url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else {
        image_url = `/uploads/${req.file.filename}`;
      }
    }

    const updatedTx = dbOps.updateTransaction(req.params.id, {
      title: title ? String(title).trim() : undefined,
      subtitle: subtitle ? String(subtitle).trim() : undefined,
      location: location ? String(location).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      badge: badge ? String(badge).trim() : undefined,
      note: note ? String(note).trim() : undefined,
      image_url
    });

    // Auto-sync update to Google Sheets "Transactions" tab
    await triggerAutoSync('upsert_transaction', updatedTx);

    res.json({ message: 'Featured transaction updated successfully.', transaction: updatedTx });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
});

// DELETE /api/transactions/:id - Admin delete transaction (Protected)
router.delete('/transactions/:id', requireAdminAuth, async (req, res) => {
  try {
    const txId = req.params.id;

    // Auto-sync deletion to Google Sheets "Transactions" tab
    try {
      await triggerAutoSync('delete_transaction', txId);
    } catch (syncErr) {
      console.error('Google Sheets delete transaction error:', syncErr.message);
    }

    const deleted = dbOps.deleteTransaction(txId);

    res.json({
      message: 'Featured transaction deleted successfully.',
      transaction: deleted || { id: Number(txId) }
    });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

module.exports = router;
