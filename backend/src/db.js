const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Determine writable DB path (support Vercel read-only filesystem via /tmp)
let dbPath = path.join(__dirname, '..', 'watchlab.json');
const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
if (isVercel) {
  dbPath = path.join('/tmp', 'watchlab.json');
}

// In-memory fallback cache for serverless environments
let memoryDb = null;

let seedData = null;
try {
  seedData = require('../watchlab.json');
} catch (e) {
  seedData = null;
}

function getDefaultAdminHash() {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync('watchlab2026!', salt);
}

function getInitialState() {
  if (seedData && Array.isArray(seedData.admins) && seedData.admins.length > 0) {
    return {
      admins: seedData.admins,
      watches: Array.isArray(seedData.watches) ? seedData.watches : [],
      settings: seedData.settings || {
        google_sheets: {
          webhook_url: process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbyXdt8GP2HZ0KAaPLfVDaQD1YiPym949VTCyTmTVqbVOXy8d40tsaw6rGbp2ylnDdjnAg/exec',
          auto_sync: true,
          last_synced: null
        }
      }
    };
  }

  return {
    admins: [
      {
        id: 1,
        email: 'admin@watchlabcebu.com',
        password_hash: getDefaultAdminHash(),
        created_at: new Date().toISOString()
      }
    ],
    watches: [],
    settings: {
      google_sheets: {
        webhook_url: process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbyXdt8GP2HZ0KAaPLfVDaQD1YiPym949VTCyTmTVqbVOXy8d40tsaw6rGbp2ylnDdjnAg/exec',
        auto_sync: true,
        last_synced: null
      }
    }
  };
}

function loadDatabase() {
  if (memoryDb && Array.isArray(memoryDb.admins) && Array.isArray(memoryDb.watches)) {
    return memoryDb;
  }

  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf8');
      memoryDb = JSON.parse(raw);
      if (memoryDb && Array.isArray(memoryDb.admins)) {
        if (!Array.isArray(memoryDb.watches)) memoryDb.watches = [];
        return memoryDb;
      }
    }
    // Check seed JSON file if /tmp/watchlab.json does not exist yet on Vercel
    const seedPath = path.join(__dirname, '..', 'watchlab.json');
    if (fs.existsSync(seedPath)) {
      const raw = fs.readFileSync(seedPath, 'utf8');
      memoryDb = JSON.parse(raw);
      if (memoryDb && Array.isArray(memoryDb.admins)) {
        if (!Array.isArray(memoryDb.watches)) memoryDb.watches = [];
        saveDatabase(memoryDb);
        return memoryDb;
      }
    }
  } catch (err) {
    console.error('File read failed, using memory DB:', err.message);
  }

  memoryDb = getInitialState();
  saveDatabase(memoryDb);
  return memoryDb;
}

function saveDatabase(data) {
  memoryDb = data;
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Read-only filesystem detected, maintaining state in memory.');
  }
}

// Database Operations Wrapper
const dbOps = {
  // Admins
  getAdminByEmail: (email) => {
    const db = loadDatabase();
    const admins = (db && Array.isArray(db.admins)) ? db.admins : [];
    return admins.find(a => a && a.email && a.email.toLowerCase() === email.toLowerCase());
  },
  getAdminById: (id) => {
    const db = loadDatabase();
    const admins = (db && Array.isArray(db.admins)) ? db.admins : [];
    return admins.find(a => a && a.id === Number(id));
  },

  // Watches (Google Sheets as primary live database with local fallback)
  getRawWatchesList: async () => {
    try {
      const { fetchLiveWatchesFromSheets } = require('./services/googleSheetsService');
      const liveWatches = await fetchLiveWatchesFromSheets();
      if (liveWatches && Array.isArray(liveWatches)) {
        const db = loadDatabase();
        db.watches = liveWatches;
        saveDatabase(db);
        return liveWatches;
      }
    } catch (err) {
      console.warn('Google Sheets live fetch fallback to local DB:', err.message);
    }
    const db = loadDatabase();
    return (db && Array.isArray(db.watches)) ? db.watches : [];
  },

  getAllWatches: async ({ brand, condition, search } = {}) => {
    const watches = await dbOps.getRawWatchesList();
    let result = Array.isArray(watches) ? [...watches] : [];

    if (brand && brand !== 'All') {
      result = result.filter(w => w && w.brand && w.brand.toLowerCase() === brand.toLowerCase());
    }

    if (condition && condition !== 'All') {
      result = result.filter(w => w && w.condition === condition);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(w =>
        w && (
          (w.name && w.name.toLowerCase().includes(q)) ||
          (w.brand && w.brand.toLowerCase().includes(q)) ||
          (w.description && w.description.toLowerCase().includes(q))
        )
      );
    }

    result.sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0));
    return result;
  },

  getNewArrivals: async (limit = 4) => {
    const watches = await dbOps.getRawWatchesList();
    const list = Array.isArray(watches) ? [...watches] : [];
    return list
      .sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0))
      .slice(0, limit);
  },

  getWatchById: async (id) => {
    const watches = await dbOps.getRawWatchesList();
    const targetId = Number(id);
    return watches.find(w => Number(w.id) === targetId || String(w.id).trim() === String(id).trim());
  },

  getUniqueBrands: async () => {
    const watches = await dbOps.getRawWatchesList();
    const brandsSet = new Set(watches.map(w => w.brand).filter(Boolean));
    return Array.from(brandsSet).sort();
  },

  createWatch: (watchData) => {
    const db = loadDatabase();
    const maxId = db.watches.reduce((max, w) => (Number(w.id) > max ? Number(w.id) : max), 0);
    const newWatch = {
      id: maxId + 1,
      name: watchData.name,
      brand: watchData.brand,
      price: Number(watchData.price),
      stock: Number(watchData.stock),
      condition: watchData.condition,
      description: watchData.description,
      image_url: watchData.image_url,
      is_featured: watchData.is_featured ? true : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (newWatch.is_featured) {
      db.watches.forEach(w => { w.is_featured = false; });
    }
    db.watches.unshift(newWatch);
    saveDatabase(db);
    return newWatch;
  },

  updateWatch: (id, watchData) => {
    const db = loadDatabase();
    const targetId = Number(id);
    const index = db.watches.findIndex(w => Number(w.id) === targetId || String(w.id).trim() === String(id).trim());
    if (index === -1) return null;

    if (watchData.is_featured === true) {
      db.watches.forEach(w => {
        w.is_featured = false;
      });
    }

    const existing = db.watches[index];
    const updatedWatch = {
      ...existing,
      name: watchData.name !== undefined ? watchData.name : existing.name,
      brand: watchData.brand !== undefined ? watchData.brand : existing.brand,
      price: watchData.price !== undefined ? Number(watchData.price) : existing.price,
      stock: watchData.stock !== undefined ? Number(watchData.stock) : existing.stock,
      condition: watchData.condition !== undefined ? watchData.condition : existing.condition,
      description: watchData.description !== undefined ? watchData.description : existing.description,
      image_url: watchData.image_url !== undefined ? watchData.image_url : existing.image_url,
      is_featured: watchData.is_featured !== undefined ? !!watchData.is_featured : (existing.is_featured || false),
      updated_at: new Date().toISOString()
    };

    db.watches[index] = updatedWatch;
    saveDatabase(db);
    return updatedWatch;
  },

  deleteWatch: (id) => {
    const db = loadDatabase();
    const targetId = Number(id);
    const index = db.watches.findIndex(w => Number(w.id) === targetId || String(w.id).trim() === String(id).trim());
    if (index === -1) return false;

    const removed = db.watches.splice(index, 1);
    saveDatabase(db);
    return removed[0];
  },

  getInventoryStats: async () => {
    const watches = await dbOps.getRawWatchesList();
    const totalWatches = watches.length;
    const availableStock = watches.reduce((sum, w) => sum + (w.stock > 0 ? w.stock : 0), 0);
    const soldOutCount = watches.filter(w => w.stock === 0).length;
    const totalValue = watches.reduce((sum, w) => sum + (w.price * w.stock), 0);

    return {
      totalWatches,
      availableStock,
      soldOutCount,
      totalValue
    };
  },

  getGoogleSheetsConfig: () => {
    const db = loadDatabase();
    if (!db.settings) {
      db.settings = { google_sheets: { webhook_url: process.env.GOOGLE_SHEET_WEBHOOK_URL || '', auto_sync: true, last_synced: null } };
      saveDatabase(db);
    } else if (!db.settings.google_sheets) {
      db.settings.google_sheets = { webhook_url: process.env.GOOGLE_SHEET_WEBHOOK_URL || '', auto_sync: true, last_synced: null };
      saveDatabase(db);
    }
    return db.settings.google_sheets;
  },

  updateGoogleSheetsConfig: (newConfig) => {
    const db = loadDatabase();
    if (!db.settings) db.settings = {};
    const existing = db.settings.google_sheets || { webhook_url: process.env.GOOGLE_SHEET_WEBHOOK_URL || '', auto_sync: true, last_synced: null };
    
    db.settings.google_sheets = {
      ...existing,
      ...newConfig
    };
    saveDatabase(db);
    return db.settings.google_sheets;
  },

  // Transactions CRUD Operations
  getAllTransactions: async () => {
    try {
      const { fetchLiveTransactionsFromSheets } = require('./services/googleSheetsService');
      const liveTx = await fetchLiveTransactionsFromSheets();
      if (liveTx && Array.isArray(liveTx)) {
        const db = loadDatabase();
        db.transactions = liveTx;
        saveDatabase(db);
        return liveTx;
      }
    } catch (err) {
      console.warn('Google Sheets live transaction fetch fallback:', err.message);
    }
    const db = loadDatabase();
    return (db && Array.isArray(db.transactions)) ? db.transactions : [];
  },

  getTransactionById: async (id) => {
    const transactions = await dbOps.getAllTransactions();
    const targetId = Number(id);
    return transactions.find(t => Number(t.id) === targetId || String(t.id).trim() === String(id).trim());
  },

  createTransaction: (data) => {
    const db = loadDatabase();
    if (!db.transactions || !Array.isArray(db.transactions)) {
      db.transactions = [];
    }

    const maxId = db.transactions.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0);
    const newTx = {
      id: maxId + 1,
      title: data.title,
      subtitle: data.subtitle,
      location: data.location || 'Cebu',
      category: data.category || 'Handover',
      badge: data.badge || 'Handover',
      note: data.note || '',
      image_url: data.image_url,
      is_featured: data.is_featured !== undefined ? !!data.is_featured : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.transactions.unshift(newTx);
    saveDatabase(db);
    return newTx;
  },

  updateTransaction: (id, updates) => {
    const db = loadDatabase();
    if (!db.transactions) db.transactions = [];

    const targetId = Number(id);
    const index = db.transactions.findIndex(t => Number(t.id) === targetId || String(t.id).trim() === String(id).trim());
    if (index === -1) return null;

    const existing = db.transactions[index];
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      is_featured: updates.is_featured !== undefined ? !!updates.is_featured : (existing.is_featured !== undefined ? existing.is_featured : true),
      updated_at: new Date().toISOString()
    };

    db.transactions[index] = updated;
    saveDatabase(db);
    return updated;
  },

  deleteTransaction: (id) => {
    const db = loadDatabase();
    if (!db.transactions) db.transactions = [];

    const targetId = Number(id);
    const index = db.transactions.findIndex(t => Number(t.id) === targetId || String(t.id).trim() === String(id).trim());
    if (index === -1) return null;

    const removed = db.transactions.splice(index, 1);
    saveDatabase(db);
    return removed[0];
  }
};

module.exports = dbOps;
