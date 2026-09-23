import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const JWT_SECRET = 'watchlab_cebu_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default Admin Credentials Hash
const defaultPasswordHash = bcrypt.hashSync('watchlab2026!', 10);

// 100% Verified High-Resolution Luxury Wristwatch Photos Catalog
const sampleWatches = [
  {
    id: 1,
    name: 'Rolex Submariner Date 41mm',
    brand: 'Rolex',
    price: 850000,
    stock: 2,
    condition: 'Brand New',
    description: 'Iconic Oystersteel luxury diving watch with black Cerachrom bezel and black dial. Unworn, 2026 papers and full set warranty box.',
    image_url: 'https://images.unsplash.com/photo-1760541791863-424a4af5de1c?q=80&w=1000&auto=format&fit=crop',
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
    image_url: 'https://images.unsplash.com/photo-1639006570490-79c0c53f1080?q=80&w=1000&auto=format&fit=crop',
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
    image_url: 'https://images.unsplash.com/photo-1755440321869-9cab2985d9c6?q=80&w=1000&auto=format&fit=crop',
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
    image_url: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?q=80&w=1000&auto=format&fit=crop',
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
    image_url: 'https://images.unsplash.com/photo-1773414685933-bfc3ccf89a3c?q=80&w=1000&auto=format&fit=crop',
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

let watchesStore = [...sampleWatches];

// Auth middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Token required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', business: 'Watch Lab Cebu', time: new Date().toISOString() });
});

// Admin Auth
app.post(['/api/auth/login', '/auth/login'], (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (email.toLowerCase() !== 'admin@watchlabcebu.com') {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const isMatch = bcrypt.compareSync(password, defaultPasswordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = jwt.sign({ id: 1, email: 'admin@watchlabcebu.com' }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    message: 'Admin authentication successful.',
    token,
    admin: { id: 1, email: 'admin@watchlabcebu.com' }
  });
});

app.get(['/api/auth/me', '/auth/me'], requireAdmin, (req, res) => {
  res.json({ admin: { id: 1, email: 'admin@watchlabcebu.com' } });
});

// Watch Catalog Endpoints
app.get(['/api/watches/brands', '/watches/brands'], (req, res) => {
  const brands = Array.from(new Set(watchesStore.map(w => w.brand))).sort();
  res.json({ brands });
});

app.get(['/api/watches/new-arrivals', '/watches/new-arrivals'], (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 4;
  const items = [...watchesStore]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
  res.json({ count: items.length, watches: items });
});

app.get(['/api/watches', '/watches'], (req, res) => {
  const { brand, condition, search } = req.query;
  let items = [...watchesStore];

  if (brand && brand !== 'All') {
    items = items.filter(w => w.brand.toLowerCase() === brand.toLowerCase());
  }
  if (condition && condition !== 'All') {
    items = items.filter(w => w.condition === condition);
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.brand.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q)
    );
  }
  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ count: items.length, watches: items });
});

app.get(['/api/watches/:id', '/watches/:id'], (req, res) => {
  const watch = watchesStore.find(w => w.id === Number(req.params.id));
  if (!watch) return res.status(404).json({ error: 'Watch not found.' });
  res.json({ watch });
});

app.get(['/api/admin/stats', '/admin/stats'], requireAdmin, (req, res) => {
  const totalWatches = watchesStore.length;
  const availableStock = watchesStore.reduce((sum, w) => sum + (w.stock > 0 ? w.stock : 0), 0);
  const soldOutCount = watchesStore.filter(w => w.stock === 0).length;
  const totalValue = watchesStore.reduce((sum, w) => sum + (w.price * w.stock), 0);
  res.json({ stats: { totalWatches, availableStock, soldOutCount, totalValue } });
});

app.post(['/api/watches', '/watches'], requireAdmin, (req, res) => {
  const { name, brand, price, stock, condition, description, image_url } = req.body;
  if (!name || !brand || price === undefined || stock === undefined || !condition || !description) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const maxId = watchesStore.reduce((max, w) => (w.id > max ? w.id : max), 0);
  const newWatch = {
    id: maxId + 1,
    name,
    brand,
    price: Number(price),
    stock: Number(stock),
    condition,
    description,
    image_url: image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  watchesStore.unshift(newWatch);
  res.status(201).json({ message: 'Watch created successfully.', watch: newWatch });
});

app.put(['/api/watches/:id', '/watches/:id'], requireAdmin, (req, res) => {
  const index = watchesStore.findIndex(w => w.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Watch not found.' });
  const existing = watchesStore[index];
  const { name, brand, price, stock, condition, description, image_url } = req.body;
  const updated = {
    ...existing,
    name: name !== undefined ? name : existing.name,
    brand: brand !== undefined ? brand : existing.brand,
    price: price !== undefined ? Number(price) : existing.price,
    stock: stock !== undefined ? Number(stock) : existing.stock,
    condition: condition !== undefined ? condition : existing.condition,
    description: description !== undefined ? description : existing.description,
    image_url: image_url !== undefined ? image_url : existing.image_url,
    updated_at: new Date().toISOString()
  };
  watchesStore[index] = updated;
  res.json({ message: 'Watch updated.', watch: updated });
});

app.delete(['/api/watches/:id', '/watches/:id'], requireAdmin, (req, res) => {
  const index = watchesStore.findIndex(w => w.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Watch not found.' });
  const removed = watchesStore.splice(index, 1);
  res.json({ message: 'Watch deleted.', watch: removed[0] });
});

export default function handler(req, res) {
  return app(req, res);
}
