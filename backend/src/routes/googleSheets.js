const express = require('express');
const dbOps = require('../db');
const { requireAdminAuth } = require('../middleware/auth');
const {
  GOOGLE_APPS_SCRIPT_CODE,
  syncAllToSheets,
  pullFromSheets
} = require('../services/googleSheetsService');

const router = express.Router();

// GET /api/google-sheets/config - Get Google Sheets configuration (Protected)
router.get('/google-sheets/config', requireAdminAuth, (req, res) => {
  try {
    const config = dbOps.getGoogleSheetsConfig();
    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve Google Sheets configuration.' });
  }
});

// POST /api/google-sheets/config - Save Google Sheets Webhook URL & Settings (Protected)
router.post('/google-sheets/config', requireAdminAuth, (req, res) => {
  try {
    const { webhook_url, auto_sync } = req.body;
    const updated = dbOps.updateGoogleSheetsConfig({
      webhook_url: webhook_url !== undefined ? webhook_url.trim() : undefined,
      auto_sync: auto_sync !== undefined ? Boolean(auto_sync) : undefined
    });
    res.json({ message: 'Google Sheets configuration updated.', config: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save Google Sheets configuration.' });
  }
});

// POST /api/google-sheets/sync - Push current inventory to Google Sheets (Protected)
router.post('/google-sheets/sync', requireAdminAuth, async (req, res) => {
  try {
    const { webhook_url } = req.body;
    const result = await syncAllToSheets(webhook_url);
    res.json({ message: 'Inventory synchronized with Google Sheets.', result });
  } catch (err) {
    console.error('Google Sheets Sync Error:', err);
    res.status(400).json({ error: err.message || 'Failed to sync with Google Sheets.' });
  }
});

// POST /api/google-sheets/pull - Pull / Import inventory from Google Sheets (Protected)
router.post('/google-sheets/pull', requireAdminAuth, async (req, res) => {
  try {
    const { webhook_url } = req.body;
    const result = await pullFromSheets(webhook_url);
    res.json({ message: 'Inventory imported from Google Sheets.', result });
  } catch (err) {
    console.error('Google Sheets Pull Error:', err);
    res.status(400).json({ error: err.message || 'Failed to pull from Google Sheets.' });
  }
});

// GET /api/google-sheets/apps-script - Get Google Apps Script Code Template
router.get('/google-sheets/apps-script', (req, res) => {
  res.json({ code: GOOGLE_APPS_SCRIPT_CODE });
});

module.exports = router;
