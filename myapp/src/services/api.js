// DealFlow360 — Mock Service Layer
// Bridges legacy API helper calls to dataService without backend network dependencies

import { dataService } from './dataService.js';
import { BASE_STATS } from '../data/dashboard.js';

export const fetchResource = async (resource) => {
  switch (resource) {
    case 'users': return dataService.getUsers();
    case 'customers': return dataService.getCustomers();
    case 'products': return dataService.getProducts();
    case 'quotations': return dataService.getInitialQuotations();
    case 'dashboard': return { baseStats: BASE_STATS };
    default: return [];
  }
};

export const fetchResourceById = async (resource, id) => {
  switch (resource) {
    case 'users': return dataService.getUserById(id);
    case 'customers': return dataService.getCustomerById(id);
    case 'products': return dataService.getProductById(id);
    case 'quotations': return dataService.getInitialQuotations().find(q => q.id === id || q.quotationNumber === id) || null;
    default: return null;
  }
};

export const createResource = async (resource, data) => {
  return { id: `${resource.slice(0, 3).toUpperCase()}-${Date.now()}`, ...data };
};

export const updateResource = async (resource, id, updates) => {
  return { id, ...updates };
};

export const deleteResource = async (resource, id) => {
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
export const fetchDashboard = () => fetchResource('dashboard');

