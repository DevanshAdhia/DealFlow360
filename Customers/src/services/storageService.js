import seedCustomers from '../data/customers.json';
import seedQuotations from '../data/quotations.json';
import seedQuotationItems from '../data/quotationItems.json';
import seedProducts from '../data/products.json';
import seedCategories from '../data/categories.json';
import seedSubcategories from '../data/subcategories.json';
import seedNegotiationRequests from '../data/negotiationRequests.json';
import seedNegotiationItems from '../data/negotiationItems.json';
import seedQuotationComments from '../data/quotationComments.json';
import seedQuotationVersions from '../data/quotationVersions.json';

const STORAGE_KEYS = {
  CUSTOMERS: 'dealflow_customers',
  QUOTATIONS: 'dealflow_quotations',
  QUOTATION_ITEMS: 'dealflow_quotation_items',
  NEGOTIATION_REQUESTS: 'dealflow_negotiation_requests',
  NEGOTIATION_ITEMS: 'dealflow_negotiation_items',
  COMMENTS: 'dealflow_quotation_comments',
  CURRENT_CUSTOMER_ID: 'dealflow_current_customer_id'
};

const safeGet = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`localStorage read error for ${key}:`, e);
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`localStorage write error for ${key}:`, e);
  }
};

export const storageService = {
  getCustomers: () => {
    const data = safeGet(STORAGE_KEYS.CUSTOMERS, seedCustomers);
    if (!Array.isArray(data) || !data.some(c => c.contactName === 'John Carter')) {
      safeSet(STORAGE_KEYS.CUSTOMERS, seedCustomers);
      return seedCustomers;
    }
    return data;
  },
  saveCustomers: (data) => safeSet(STORAGE_KEYS.CUSTOMERS, data),

  getQuotations: () => {
    const data = safeGet(STORAGE_KEYS.QUOTATIONS, seedQuotations);
    if (!Array.isArray(data) || !data.some(q => q.id === 'Q-1024')) {
      safeSet(STORAGE_KEYS.QUOTATIONS, seedQuotations);
      return seedQuotations;
    }
    return data;
  },
  saveQuotations: (data) => safeSet(STORAGE_KEYS.QUOTATIONS, data),

  getQuotationItems: () => {
    const data = safeGet(STORAGE_KEYS.QUOTATION_ITEMS, seedQuotationItems);
    if (!Array.isArray(data) || !data.some(i => i.quotationId === 'Q-1024')) {
      safeSet(STORAGE_KEYS.QUOTATION_ITEMS, seedQuotationItems);
      return seedQuotationItems;
    }
    return data;
  },
  saveQuotationItems: (data) => safeSet(STORAGE_KEYS.QUOTATION_ITEMS, data),

  getNegotiationRequests: () => {
    const data = safeGet(STORAGE_KEYS.NEGOTIATION_REQUESTS, seedNegotiationRequests);
    if (!Array.isArray(data) || !data.some(n => n.quotationId === 'Q-1021')) {
      safeSet(STORAGE_KEYS.NEGOTIATION_REQUESTS, seedNegotiationRequests);
      return seedNegotiationRequests;
    }
    return data;
  },
  saveNegotiationRequests: (data) => safeSet(STORAGE_KEYS.NEGOTIATION_REQUESTS, data),

  getNegotiationItems: () => safeGet(STORAGE_KEYS.NEGOTIATION_ITEMS, seedNegotiationItems),
  saveNegotiationItems: (data) => safeSet(STORAGE_KEYS.NEGOTIATION_ITEMS, data),

  getComments: () => safeGet(STORAGE_KEYS.COMMENTS, seedQuotationComments),
  saveComments: (data) => safeSet(STORAGE_KEYS.COMMENTS, data),

  getCurrentCustomerId: () => safeGet(STORAGE_KEYS.CURRENT_CUSTOMER_ID, 'CUS-001'),
  saveCurrentCustomerId: (id) => safeSet(STORAGE_KEYS.CURRENT_CUSTOMER_ID, id),

  getProducts: () => JSON.parse(JSON.stringify(seedProducts)),
  getCategories: () => JSON.parse(JSON.stringify(seedCategories)),
  getSubcategories: () => JSON.parse(JSON.stringify(seedSubcategories)),
  getQuotationVersions: () => JSON.parse(JSON.stringify(seedQuotationVersions)),

  resetAllData: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
      localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
      localStorage.removeItem(STORAGE_KEYS.QUOTATION_ITEMS);
      localStorage.removeItem(STORAGE_KEYS.NEGOTIATION_REQUESTS);
      localStorage.removeItem(STORAGE_KEYS.NEGOTIATION_ITEMS);
      localStorage.removeItem(STORAGE_KEYS.COMMENTS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CUSTOMER_ID);
    } catch (e) {
      console.warn('Reset error:', e);
    }
  }
};
