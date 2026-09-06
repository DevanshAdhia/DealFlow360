// DealFlow360 — Live API Data Service Layer
import { fetchResource, fetchResourceById, createResource, updateResource, deleteResource } from './api.js';

const deepClone = (data) => {
  if (!data) return data;
  if (typeof structuredClone === 'function') {
    return structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data));
};

export const dataService = {
  // Products & Categories
  getProducts: async () => await fetchResource('products'),
  getProductById: async (id) => await fetchResourceById('products', id),
  getCategories: async () => await fetchResource('categories'),

  // Customers & Tiers
  getCustomers: async () => await fetchResource('customers'),
  getCustomerById: async (id) => await fetchResourceById('customers', id),
  getCustomerTiers: async () => [],
  getCustomerTierById: (id) => ({
    id: id || 'gold',
    name: 'Gold Enterprise Partner',
    discountPct: 15,
    defaultPaymentTerms: 'Net 30',
    minMarginPct: 20
  }),
  getProductPriceInTier: (prodId, unitPrice) => unitPrice || 0,

  // Users & Roles
  getUsers: async () => await fetchResource('users'),
  getUserById: async (id) => await fetchResourceById('users', id),

  // Quotations
  getInitialQuotations: async () => await fetchResource('quotations'),
  createQuotation: async (data) => await createResource('quotations', data),
  updateQuotation: async (id, updates) => await updateResource('quotations', id, updates),
  deleteQuotation: async (id) => await deleteResource('quotations', id),

  // Warehouses & Orders
  getWarehouses: async () => await fetchResource('warehouses'),
  getOrders: async () => await fetchResource('orders'),

  // Invoices & Subscriptions
  getInvoices: async () => await fetchResource('invoices'),
  getSubscriptions: async () => await fetchResource('subscriptions'),

  deepClone,
};
