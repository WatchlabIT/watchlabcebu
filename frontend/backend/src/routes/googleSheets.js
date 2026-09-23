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
    const envUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    const effectiveUrl = envUrl || config.webhook_url || '';
    const is_configured = Boolean(effectiveUrl && effectiveUrl.startsWith('http'));
    
    res.json({
      config: {
        is_configured,
        auto_sync: config.auto_sync ?? true,
        last_synced: config.last_synced || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve Google Sheets configuration.' });
  }
});

// POST /api/google-sheets/config - Save Google Sheets Settings (Protected)
router.post('/google-sheets/config', requireAdminAuth, (req, res) => {
  try {
    const { auto_sync } = req.body;
    const updated = dbOps.updateGoogleSheetsConfig({
      auto_sync: auto_sync !== undefined ? Boolean(auto_sync) : undefined
    });
    const envUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    const effectiveUrl = envUrl || updated.webhook_url || '';

    res.json({
      message: 'Google Sheets configuration updated.',
      config: {
        is_configured: Boolean(effectiveUrl && effectiveUrl.startsWith('http')),
        auto_sync: updated.auto_sync,
        last_synced: updated.last_synced
      }
    });
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
