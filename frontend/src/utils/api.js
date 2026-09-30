const DEFAULT_RAILWAY_URL = 'https://watchlabcebu-production.up.railway.app';
const ENV_URL = import.meta.env.VITE_API_URL;
const RAW_API_URL = (ENV_URL && ENV_URL.trim() !== '') ? ENV_URL.trim() : DEFAULT_RAILWAY_URL;
const API_BASE = `${RAW_API_URL.replace(/\/+$/, '')}/api`;

// In-Memory API Cache & Inflight Request Deduplication for Ultra-Fast Loads
const apiCache = {
  watches: null,
  watchesTime: 0,
  brands: null,
  brandsTime: 0,
  transactions: null,
  transactionsTime: 0
};

const inflightRequests = {};
const CACHE_TTL = 15000; // 15 seconds cache TTL

export function clearApiCache() {
  apiCache.watches = null;
  apiCache.watchesTime = 0;
  apiCache.brands = null;
  apiCache.brandsTime = 0;
  apiCache.transactions = null;
  apiCache.transactionsTime = 0;
}

function getAuthHeaders() {
  const token = sessionStorage.getItem('watchlab_token') || localStorage.getItem('watchlab_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJsonResponse(res, fallbackErrorMsg = 'Request failed.') {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || fallbackErrorMsg);
    return data;
  }
  if (!res.ok) {
    if (res.status === 413) {
      throw new Error('Uploaded image or payload size is too large (413 Payload Too Large). Please upload a smaller image.');
    }
    if (res.status === 405 || res.status === 404) {
      throw new Error(`API Connection Error (${res.status}). Please set VITE_API_URL in Vercel Environment Variables to your Railway backend URL.`);
    }
    throw new Error(`API Connection Error (${res.status}). Please verify API deployment.`);
  }
  return {};
}

/**
 * Deduplicates concurrent parallel fetch requests to avoid redundant backend calls
 */
async function dedupedFetch(key, fetchFn) {
  if (inflightRequests[key]) {
    return await inflightRequests[key];
  }
  const promise = (async () => {
    try {
      return await fetchFn();
    } finally {
      delete inflightRequests[key];
    }
  })();
  inflightRequests[key] = promise;
  return await promise;
}

export async function fetchWatches(params = {}) {
  const isDefaultQuery = !params || (
    (!params.brand || params.brand === 'All') &&
    (!params.condition || params.condition === 'All') &&
    !params.search
  );

  // Return cached result if fresh
  if (isDefaultQuery && apiCache.watches && (Date.now() - apiCache.watchesTime < CACHE_TTL)) {
    return apiCache.watches;
  }

  const query = new URLSearchParams();
  if (params.brand && params.brand !== 'All') query.append('brand', params.brand);
  if (params.condition && params.condition !== 'All') query.append('condition', params.condition);
  if (params.search) query.append('search', params.search);

  const cacheKey = `watches_${query.toString()}`;

  const data = await dedupedFetch(cacheKey, async () => {
    const res = await fetch(`${API_BASE}/watches?${query.toString()}`);
    return await parseJsonResponse(res, 'Failed to fetch watches catalog.');
  });

  if (isDefaultQuery && data && Array.isArray(data.watches)) {
    apiCache.watches = data;
    apiCache.watchesTime = Date.now();
  }

  return data;
}

export async function fetchNewArrivals(limit = 4) {
  const cacheKey = `new_arrivals_${limit}`;
  return await dedupedFetch(cacheKey, async () => {
    const res = await fetch(`${API_BASE}/watches/new-arrivals?limit=${limit}`);
    return await parseJsonResponse(res, 'Failed to fetch new arrivals.');
  });
}

export async function fetchBrands() {
  if (apiCache.brands && (Date.now() - apiCache.brandsTime < CACHE_TTL)) {
    return apiCache.brands;
  }

  const data = await dedupedFetch('brands', async () => {
    const res = await fetch(`${API_BASE}/watches/brands`);
    return await parseJsonResponse(res, 'Failed to fetch watch brands.');
  });

  if (data && Array.isArray(data.brands)) {
    apiCache.brands = data;
    apiCache.brandsTime = Date.now();
  }

  return data;
}

export async function fetchWatchById(id) {
  const cacheKey = `watch_${id}`;
  return await dedupedFetch(cacheKey, async () => {
    const res = await fetch(`${API_BASE}/watches/${id}`);
    return await parseJsonResponse(res, 'Failed to fetch watch details.');
  });
}

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  return await parseJsonResponse(res, 'Invalid email or password.');
}

export async function checkAdminSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await parseJsonResponse(res);
  } catch (err) {
    return null;
  }
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: getAuthHeaders()
  });
  return await parseJsonResponse(res, 'Failed to fetch admin stats.');
}

export async function createWatch(formData) {
  clearApiCache();
  const headers = getAuthHeaders();
  
  let body = formData;
  let isMultipart = formData instanceof FormData;

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(formData);
  }

  const res = await fetch(`${API_BASE}/watches`, {
    method: 'POST',
    headers,
    body
  });

  return await parseJsonResponse(res, 'Failed to create watch listing.');
}

export async function updateWatch(id, formData) {
  clearApiCache();
  const headers = getAuthHeaders();
  
  let body = formData;
  let isMultipart = formData instanceof FormData;

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(formData);
  }

  const res = await fetch(`${API_BASE}/watches/${id}`, {
    method: 'PUT',
    headers,
    body
  });

  return await parseJsonResponse(res, 'Failed to update watch listing.');
}

export async function deleteWatch(id) {
  clearApiCache();
  const res = await fetch(`${API_BASE}/watches/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return await parseJsonResponse(res, 'Failed to delete watch listing.');
}

export async function batchImportWatches(items) {
  clearApiCache();
  const headers = getAuthHeaders();
  headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}/watches/batch-import`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ items })
  });

  return await parseJsonResponse(res, 'Failed to import watches.');
}

// Transactions API Helpers
export async function fetchTransactions() {
  if (apiCache.transactions && (Date.now() - apiCache.transactionsTime < CACHE_TTL)) {
    return apiCache.transactions;
  }

  const data = await dedupedFetch('transactions', async () => {
    const res = await fetch(`${API_BASE}/transactions`);
    return await parseJsonResponse(res, 'Failed to fetch featured transactions.');
  });

  if (data && Array.isArray(data.transactions)) {
    apiCache.transactions = data;
    apiCache.transactionsTime = Date.now();
  }

  return data;
}

export async function createTransaction(formData) {
  clearApiCache();
  const headers = getAuthHeaders();
  let body = formData;
  let isMultipart = formData instanceof FormData;

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(formData);
  }

  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers,
    body
  });

  return await parseJsonResponse(res, 'Failed to create transaction.');
}

export async function updateTransaction(id, formData) {
  clearApiCache();
  const headers = getAuthHeaders();
  let body = formData;
  let isMultipart = formData instanceof FormData;

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(formData);
  }

  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'PUT',
    headers,
    body
  });

  return await parseJsonResponse(res, 'Failed to update transaction.');
}

export async function deleteTransaction(id) {
  clearApiCache();
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return await parseJsonResponse(res, 'Failed to delete transaction.');
}
