const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('watchlab_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchWatches(params = {}) {
  const query = new URLSearchParams();
  if (params.brand && params.brand !== 'All') query.append('brand', params.brand);
  if (params.condition && params.condition !== 'All') query.append('condition', params.condition);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/watches?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch watches catalog.');
  return await res.json();
}

export async function fetchNewArrivals(limit = 4) {
  const res = await fetch(`${API_BASE}/watches/new-arrivals?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch new arrivals.');
  return await res.json();
}

export async function fetchBrands() {
  const res = await fetch(`${API_BASE}/watches/brands`);
  if (!res.ok) throw new Error('Failed to fetch watch brands.');
  return await res.json();
}

export async function fetchWatchById(id) {
  const res = await fetch(`${API_BASE}/watches/${id}`);
  if (!res.ok) throw new Error('Failed to fetch watch details.');
  return await res.json();
}

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed.');
  return data;
}

export async function checkAdminSession() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch admin stats.');
  return await res.json();
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

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create watch listing.');
  return data;
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

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update watch listing.');
  return data;
}

export async function deleteWatch(id) {
  const res = await fetch(`${API_BASE}/watches/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete watch listing.');
  return data;
}
