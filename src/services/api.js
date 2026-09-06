// DealFlow360 — Live Backend API Service Layer for frontend app
const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  if (!token || token === 'undefined' || token === 'null') {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const apiFetch = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (res.status === 401) {
      // Clear invalid / expired tokens from localStorage to prevent repeated 401 auth errors
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }

    if (res.status === 204) return null;

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    return null;
  }
};

const RESOURCE_ENDPOINT_MAP = {
  users: '/signup/users/',
  customers: '/customer/customers/',
  products: '/product/products/',
  quotations: '/sales/quotations/',
  categories: '/product/categories/',
  warehouses: '/warehouse/warehouses/',
  orders: '/warehouse/orders/',
  invoices: '/subscription/invoices/',
  subscriptions: '/subscription/subscriptions/',
};

export const fetchResource = async (resource) => {
  const endpoint = RESOURCE_ENDPOINT_MAP[resource];
  if (!endpoint) return [];
  try {
    const data = await apiFetch(`${endpoint}?page_size=1000`);
    if (!data) return [];
    return data.results || (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
};

export const fetchResourceById = async (resource, id) => {
  const endpoint = RESOURCE_ENDPOINT_MAP[resource];
  if (!endpoint) return null;
  try {
    return await apiFetch(`${endpoint}${id}/`);
  } catch {
    return null;
  }
};

export const createResource = async (resource, data) => {
  const endpoint = RESOURCE_ENDPOINT_MAP[resource];
  if (!endpoint) return data;
  return await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateResource = async (resource, id, updates) => {
  const endpoint = RESOURCE_ENDPOINT_MAP[resource];
  if (!endpoint) return updates;
  return await apiFetch(`${endpoint}${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const deleteResource = async (resource, id) => {
  const endpoint = RESOURCE_ENDPOINT_MAP[resource];
  if (!endpoint) return true;
  await apiFetch(`${endpoint}${id}/`, {
    method: 'DELETE',
  });
  return true;
};

export const fetchQuotations = () => fetchResource('quotations');
export const fetchQuotationById = (id) => fetchResourceById('quotations', id);
export const createQuotation = (quotation) => createResource('quotations', quotation);
export const updateQuotationApi = (id, updates) => updateResource('quotations', id, updates);
export const deleteQuotation = (id) => deleteResource('quotations', id);

export const fetchCustomers = () => fetchResource('customers');
export const fetchProducts = () => fetchResource('products');
export const fetchUsers = () => fetchResource('users');
export const fetchDashboard = async () => {
  try {
    const res = await apiFetch('/sales/quotations/dashboard/');
    return res || { baseStats: {} };
  } catch {
    return { baseStats: {} };
  }
};
