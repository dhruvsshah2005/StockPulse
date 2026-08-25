const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Activity Audit Logs
  getActivityLogs: () => fetchJson('/activity-logs'),

  // Auth & Users
  login: (email, password) =>
    fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password, role) =>
    fetchJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  getUsers: () => fetchJson('/auth/users'),

  // Products
  getProducts: (category, status) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    return fetchJson(`/products?${params.toString()}`);
  },

  updateStock: (id, stockLevel) =>
    fetchJson(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stockLevel }),
    }),

  simulateSale: (id, quantity = 1) =>
    fetchJson(`/products/${id}/orders`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    }),

  suggestPricing: (id) =>
    fetchJson(`/products/${id}/suggest-pricing`, {
      method: 'POST',
    }),

  suggestReorder: (id) =>
    fetchJson(`/products/${id}/suggest-reorder`, {
      method: 'POST',
    }),

  // Suggestions
  getPricingSuggestions: (status) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return fetchJson(`/pricing-suggestions?${params.toString()}`);
  },

  getReorderSuggestions: (status) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return fetchJson(`/reorder-suggestions?${params.toString()}`);
  },

  patchPricingSuggestion: (id, status) =>
    fetchJson(`/pricing-suggestions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  patchReorderSuggestion: (id, status) =>
    fetchJson(`/reorder-suggestions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Strategy & Seed
  getStrategy: () => fetchJson('/config/strategy'),
  setStrategy: (strategy) =>
    fetchJson('/config/strategy', {
      method: 'POST',
      body: JSON.stringify({ strategy }),
    }),

  seedDatabase: () =>
    fetchJson('/seed', {
      method: 'POST',
    }),
};
