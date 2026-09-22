const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'watchlab.json');

const initialData = {
  admins: [],
  watches: []
};

// Seed default data if database does not exist
function loadDatabase() {
  if (!fs.existsSync(dbPath)) {
    saveDatabase(initialData);
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, resetting to initial state:', err);
    saveDatabase(initialData);
    return initialData;
  }
}

function saveDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function seedIfEmpty() {
  const db = loadDatabase();

  // Seed Admin Account if none exists
  if (!db.admins || db.admins.length === 0) {
    const defaultPassword = 'watchlab2026!';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPassword, salt);

    db.admins = [
      {
        id: 1,
        email: 'admin@watchlabcebu.com',
        password_hash: hash,
        created_at: new Date().toISOString()
      }
    ];
    console.log('Seeded default admin account: admin@watchlabcebu.com / watchlab2026!');
  }

  // Seed Watch Catalog if empty
  if (!db.watches || db.watches.length === 0) {
    const sampleWatches = [
      {
        id: 1,
        name: 'Rolex Submariner Date 41mm',
        brand: 'Rolex',
        price: 850000,
        stock: 2,
        condition: 'Brand New',
        description: 'Iconic Oystersteel luxury diving watch with black Cerachrom bezel and black dial. Unworn, 2026 papers and full set warranty box.',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Rolex Daytona Cosmograph Gold',
        brand: 'Rolex',
        price: 1850000,
        stock: 1,
        condition: 'Pre-Owned',
        description: 'Exquisite 18ct Yellow Gold Daytona featuring black sub-dials. Mint condition with original box, papers, and certified authenticity.',
        image_url: 'https://images.unsplash.com/photo-1547996160-01c178269865?q=80&w=1000&auto=format&fit=crop',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Omega Speedmaster Moonwatch Professional',
        brand: 'Omega',
        price: 420000,
        stock: 3,
        condition: 'Brand New',
        description: 'Legendary chronograph tested on lunar missions. Calibre 3861 manual-winding movement with Hesalite glass and step dial.',
        image_url: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1000&auto=format&fit=crop',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Omega Seamaster Diver 300M Co-Axial',
        brand: 'Omega',
        price: 330000,
        stock: 1,
        condition: 'Pre-Owned',
        description: 'Blue laser-engraved ceramic wave dial with helium escape valve. Master Chronometer certified, pristine condition.',
        image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Seiko Presage Cocktail Time Automatic',
        brand: 'Seiko',
        price: 32000,
        stock: 5,
        condition: 'Brand New',
        description: 'Sunburst blue textured dial inspired by classic cocktails. 4R35 automatic caliber with 41-hour power reserve.',
        image_url: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000&auto=format&fit=crop',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Tissot PRX Powermatic 80 Ice Blue',
        brand: 'Tissot',
        price: 45000,
        stock: 4,
        condition: 'Brand New',
        description: 'Integrated bracelet stainless steel watch with waffle pattern ice blue dial and 80-hour power reserve Powermatic 80 movement.',
        image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 7,
        name: 'Audemars Piguet Royal Oak Selfwinding',
        brand: 'Audemars Piguet',
        price: 2450000,
        stock: 1,
        condition: 'Pre-Owned',
        description: 'Ultra-luxurious 41mm Royal Oak with Blue "Grande Tapisserie" dial. Octagonal bezel with hexagonal screws. Complete full set.',
        image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 8,
        name: 'Casio G-Shock GM-2100 Metal Oak',
        brand: 'Casio',
        price: 15500,
        stock: 0,
        condition: 'Brand New',
        description: 'Stainless steel bezel covered Octagonal G-Shock. Impact resistant structure with dark grey sunray dial.',
        image_url: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1000&auto=format&fit=crop',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    db.watches = sampleWatches;
    console.log('Seeded sample watch collection into database.');
  }

  saveDatabase(db);
}

seedIfEmpty();

// Database Operations Wrapper
const dbOps = {
  // Admins
  getAdminByEmail: (email) => {
    const db = loadDatabase();
    return db.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  },
  getAdminById: (id) => {
    const db = loadDatabase();
    return db.admins.find(a => a.id === Number(id));
  },

  // Watches
  getAllWatches: ({ brand, condition, search } = {}) => {
    const db = loadDatabase();
    let result = [...db.watches];

    if (brand && brand !== 'All') {
      result = result.filter(w => w.brand.toLowerCase() === brand.toLowerCase());
    }

    if (condition && condition !== 'All') {
      result = result.filter(w => w.condition === condition);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.brand.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q)
      );
    }

    // Sort by created_at descending by default
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return result;
  },

  getNewArrivals: (limit = 4) => {
    const db = loadDatabase();
    return [...db.watches]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  },

  getWatchById: (id) => {
    const db = loadDatabase();
    return db.watches.find(w => w.id === Number(id));
  },

  getUniqueBrands: () => {
    const db = loadDatabase();
    const brandsSet = new Set(db.watches.map(w => w.brand));
    return Array.from(brandsSet).sort();
  },

  createWatch: (watchData) => {
    const db = loadDatabase();
    const maxId = db.watches.reduce((max, w) => (w.id > max ? w.id : max), 0);
    const newWatch = {
      id: maxId + 1,
      name: watchData.name,
      brand: watchData.brand,
      price: Number(watchData.price),
      stock: Number(watchData.stock),
      condition: watchData.condition,
      description: watchData.description,
      image_url: watchData.image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.watches.unshift(newWatch);
    saveDatabase(db);
    return newWatch;
  },

  updateWatch: (id, watchData) => {
    const db = loadDatabase();
    const index = db.watches.findIndex(w => w.id === Number(id));
    if (index === -1) return null;

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
      updated_at: new Date().toISOString()
    };

    db.watches[index] = updatedWatch;
    saveDatabase(db);
    return updatedWatch;
  },

  deleteWatch: (id) => {
    const db = loadDatabase();
    const index = db.watches.findIndex(w => w.id === Number(id));
    if (index === -1) return false;

    const removed = db.watches.splice(index, 1);
    saveDatabase(db);
    return removed[0];
  },

  getInventoryStats: () => {
    const db = loadDatabase();
    const totalWatches = db.watches.length;
    const availableStock = db.watches.reduce((sum, w) => sum + (w.stock > 0 ? w.stock : 0), 0);
    const soldOutCount = db.watches.filter(w => w.stock === 0).length;
    const totalValue = db.watches.reduce((sum, w) => sum + (w.price * w.stock), 0);

    return {
      totalWatches,
      availableStock,
      soldOutCount,
      totalValue
    };
  }
};

module.exports = dbOps;
