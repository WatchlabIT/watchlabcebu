const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('watchlab_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJsonResponse(res, fallbackErrorMsg = 'Request failed.') {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || fallbackErrorMsg);
    return data;
  }
  if (!res.ok) {
    throw new Error(`API Connection Error (${res.status}). Please verify API deployment.`);
  }
  return {};
}

export async function fetchWatches(params = {}) {
  const query = new URLSearchParams();
  if (params.brand && params.brand !== 'All') query.append('brand', params.brand);
  if (params.condition && params.condition !== 'All') query.append('condition', params.condition);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/watches?${query.toString()}`);
  return await parseJsonResponse(res, 'Failed to fetch watches catalog.');
}

export async function fetchNewArrivals(limit = 4) {
  const res = await fetch(`${API_BASE}/watches/new-arrivals?limit=${limit}`);
  return await parseJsonResponse(res, 'Failed to fetch new arrivals.');
}

export async function fetchBrands() {
  const res = await fetch(`${API_BASE}/watches/brands`);
  return await parseJsonResponse(res, 'Failed to fetch watch brands.');
}

export async function fetchWatchById(id) {
  const res = await fetch(`${API_BASE}/watches/${id}`);
  return await parseJsonResponse(res, 'Failed to fetch watch details.');
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
  const res = await fetch(`${API_BASE}/watches/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return await parseJsonResponse(res, 'Failed to delete watch listing.');
}

// Google Sheets API Helpers
export async function fetchGoogleSheetsConfig() {
  const res = await fetch(`${API_BASE}/google-sheets/config`, {
    headers: getAuthHeaders()
  });
  return await parseJsonResponse(res, 'Failed to fetch Google Sheets config.');
}

export async function saveGoogleSheetsConfig(config) {
  const res = await fetch(`${API_BASE}/google-sheets/config`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });
  return await parseJsonResponse(res, 'Failed to save Google Sheets config.');
}

export async function syncToGoogleSheets(webhook_url) {
  const res = await fetch(`${API_BASE}/google-sheets/sync`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ webhook_url })
  });
  return await parseJsonResponse(res, 'Failed to sync with Google Sheets.');
}

export async function pullFromGoogleSheets(webhook_url) {
  const res = await fetch(`${API_BASE}/google-sheets/pull`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ webhook_url })
  });
  return await parseJsonResponse(res, 'Failed to import from Google Sheets.');
}

export async function fetchGoogleAppsScriptCode() {
  const res = await fetch(`${API_BASE}/google-sheets/apps-script`);
  return await parseJsonResponse(res, 'Failed to fetch Google Apps Script code.');
}

