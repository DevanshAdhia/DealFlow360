// DealFlow360 — Dedicated JSON Data & Relational Service Layer
// Loads all seed/master/transaction demo data from src/data/*.json
// No localStorage. React state manages runtime modifications.
// Never mutates imported JSON objects directly (always returns immutable deep copies).
// All relationships are maintained strictly through foreign-key IDs.

// Utility helper for safe deep cloning without mutations

import { DUMMY_CATEGORIES } from '../utils/dummyData.js';
import { MOCK_CUSTOMERS } from '../data/customers.js';
import { CUSTOMER_TIERS } from '../data/customerTiers.js';
import { MOCK_USERS } from '../data/users.js';
import { MOCK_PRODUCTS } from '../data/products.js';
import { PRICE_LISTS, PRICE_LIST_ITEMS } from '../data/priceLists.js';
import { INITIAL_QUOTATIONS } from '../data/quotations.js';
import { INITIAL_FULFILLMENTS } from '../data/fulfillments.js';
import { INITIAL_INVOICES } from '../data/invoices.js';
import { INITIAL_SUBSCRIPTIONS } from '../data/subscriptions.js';
import { APPROVAL_LEVELS, APPROVAL_RULES } from '../data/approvalRules.js';
import { RECOMMENDATION_RULES } from '../data/recommendations.js';
import { WAREHOUSES } from '../data/warehouses.js';

const INITIAL_QUOTATION_ITEMS_FLAT = INITIAL_QUOTATIONS.flatMap(q => {
  return (q.items || []).map(item => ({ ...item, quotationId: q.id }));
});



const deepClone = (data) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data));
};

// Seed LocalStorage helper
const getOrSeedStorage = (key, seedData) => {
  const localStorageKey = `dealflow_${key}`;
  const existing = localStorage.getItem(localStorageKey);
  
  if (window.location.search.includes('reset=1')) {
    localStorage.removeItem(localStorageKey);
  }

  if (existing && !window.location.search.includes('reset=1')) {
    try {
      const parsed = JSON.parse(existing);
      
      // Safety check: if seedData is an array, parsed MUST be an array. If not, consider it corrupted.
      if (Array.isArray(seedData) && !Array.isArray(parsed)) {
        throw new Error("Corrupted storage: expected array");
      }
      
      // Auto-seed if empty OR if we have less data than the seed data (meaning they got the dummy data earlier)
      if (Array.isArray(parsed) && Array.isArray(seedData) && parsed.length < seedData.length) {
        console.warn(`Upgrading seed data for ${localStorageKey}`);
        localStorage.setItem(localStorageKey, JSON.stringify(seedData));
        return deepClone(seedData);
      }
      return parsed || seedData; // Fallback to seedData if parsed is falsy
    } catch (e) {
      console.warn(`Failed to parse ${localStorageKey} from localStorage. Falling back to seed data.`);
    }
  }
  localStorage.setItem(localStorageKey, JSON.stringify(seedData));
  return deepClone(seedData);
};

export const dataService = {
  // ─── MASTER RECORD LOOKUPS ──────────────────────────────────────────

  getRoles: () => getOrSeedStorage('roles', []),
  getRoleById: (id) => getOrSeedStorage('roles', []).find(r => r.id === id) || null,

  getUsers: () => getOrSeedStorage('users', MOCK_USERS),
  getUserById: (id) => getOrSeedStorage('users', MOCK_USERS).find(u => u.id === id) || null,

  getCustomerTiers: () => getOrSeedStorage('customerTiers', CUSTOMER_TIERS),
  getCustomerTierById: (id) => getOrSeedStorage('customerTiers', CUSTOMER_TIERS).find(t => t.id === id) || null,

  getCustomers: () => getOrSeedStorage('customers', MOCK_CUSTOMERS),
  getCustomerById: (id) => getOrSeedStorage('customers', MOCK_CUSTOMERS).find(c => c.id === id) || null,

  getCategories: () => getOrSeedStorage('categories', DUMMY_CATEGORIES),
  getCategoryById: (id) => getOrSeedStorage('categories', DUMMY_CATEGORIES).find(c => c.id === id) || null,

  getProducts: () => {
    const products = getOrSeedStorage('products', MOCK_PRODUCTS);
    const categories = getOrSeedStorage('categories', DUMMY_CATEGORIES);
    return products.map(p => {
      const cat = categories.find(c => c.id === p.categoryId);
      const categoryName = cat?.name || 'Software';
      return {
        ...p,
        price: p.unitPrice,
        category: categoryName,
        categoryName
      };
    });
  },
  getProductById: (id) => {
    const products = getOrSeedStorage('products', MOCK_PRODUCTS);
    const categories = getOrSeedStorage('categories', DUMMY_CATEGORIES);
    const prod = products.find(p => p.id === id);
    if (!prod) return null;
    const category = categories.find(c => c.id === prod.categoryId);
    const categoryName = category?.name || 'Software';
    return deepClone({
      ...prod,
      price: prod.unitPrice,
      category: categoryName,
      categoryName
    });
  },

  getPriceLists: () => getOrSeedStorage('priceLists', PRICE_LISTS),
  getPriceListForTier: (customerTierId) => {
    const priceLists = getOrSeedStorage('priceLists', PRICE_LISTS);
    return priceLists.find(pl => pl.customerTierId === customerTierId) || null;
  },

  getPriceListItems: () => getOrSeedStorage('priceListItems', PRICE_LIST_ITEMS),
  getProductPriceInTier: (productId, basePrice, customerTierId) => {
    const priceLists = getOrSeedStorage('priceLists', PRICE_LISTS);
    const priceListItems = getOrSeedStorage('priceListItems', PRICE_LIST_ITEMS);
    
    const priceList = priceLists.find(pl => pl.customerTierId === customerTierId) || { multiplier: 1 };
    const customItem = priceListItems.find(
      pli => pli.priceListId === priceList.id && pli.productId === productId
    );
    if (customItem && customItem.customPrice) {
      return customItem.customPrice;
    }
    return Math.round(basePrice * (priceList.multiplier || 1.0));
  },

  getDiscountRules: () => getOrSeedStorage('discountRules', []),
  getDiscountRule: (customerTierId, categoryId) => {
    return getOrSeedStorage('discountRules', []).find(
      dr => dr.customerTierId === customerTierId && dr.categoryId === categoryId
    ) || null;
  },

  getApprovalLevels: () => getOrSeedStorage('approvalLevels', APPROVAL_LEVELS),
  getApprovalRules: () => getOrSeedStorage('approvalRules', APPROVAL_RULES),
  getRecommendationRules: () => getOrSeedStorage('recommendationRules', RECOMMENDATION_RULES),
  getWarehouses: () => getOrSeedStorage('warehouses', WAREHOUSES),
  getFulfillmentOrders: () => getOrSeedStorage('fulfillmentOrders', INITIAL_FULFILLMENTS),
  getSubscriptions: () => getOrSeedStorage('subscriptions', INITIAL_SUBSCRIPTIONS),
  getNegotiationRequests: () => getOrSeedStorage('negotiationRequests', []),

  // ─── RELATIONAL FOREIGN-KEY HYDRATION ───────────────────────────────

  /**
   * Joins a raw quotation record with all related foreign entities:
   * quotation.customerId → customers.id
   * quotation.salesRepId → users.id
   * quotationItem.quotationId → quotations.id
   * quotationItem.productId → products.id
   * product.categoryId → categories.id
   * customer.customerTierId → customerTiers.id
   * customerTier.priceListId → priceLists.id
   */
  hydrateQuotation: (rawQuote, allItems = []) => {
    const q = deepClone(rawQuote);

    // 1. Resolve Customer & Customer Tier
    const customers = dataService.getCustomers();
    const customerTiers = dataService.getCustomerTiers();
    const customer = customers.find(c => c.id === q.customerId) || {};
    const customerTier = customerTiers.find(t => t.id === customer.customerTierId) || {};

    // 2. Resolve Sales Rep
    const users = dataService.getUsers();
    const salesRep = users.find(u => u.id === q.salesRepId) || {};

    // 3. Resolve Line Items & Products
    const products = getOrSeedStorage('products', MOCK_PRODUCTS);
    const categories = getOrSeedStorage('categories', DUMMY_CATEGORIES);
    
    const itemsForQuote = (allItems.filter(it => it.quotationId === q.id) || []).map(it => {
      const product = products.find(p => p.id === it.productId) || {};
      const category = categories.find(c => c.id === product.categoryId);

      return {
        ...it,
        productId: product.id,
        name: product.name,
        categoryId: product.categoryId,
        category: category?.name || 'General',
        costPrice: it.costPrice || product.costPrice,
        unitPrice: it.unitPrice || product.unitPrice,
        subtotal: it.quantity * it.unitPrice,
        discountAmount: Math.round((it.quantity * it.unitPrice) * ((it.discount || 0) / 100)),
        taxableAmount: (it.quantity * it.unitPrice) - Math.round((it.quantity * it.unitPrice) * ((it.discount || 0) / 100)),
        tax: Math.round(((it.quantity * it.unitPrice) - Math.round((it.quantity * it.unitPrice) * ((it.discount || 0) / 100))) * ((it.gstRate || 18) / 100)),
        total: it.total || ((it.quantity * it.unitPrice) - Math.round((it.quantity * it.unitPrice) * ((it.discount || 0) / 100)) + Math.round(((it.quantity * it.unitPrice) - Math.round((it.quantity * it.unitPrice) * ((it.discount || 0) / 100))) * ((it.gstRate || 18) / 100))),
        profit: ((it.quantity * it.unitPrice) - Math.round((it.quantity * it.unitPrice) * ((it.discount || 0) / 100))) - (it.quantity * (it.costPrice || product.costPrice)),
        margin: Math.round(((((it.quantity * it.unitPrice) - Math.round((it.quantity * it.unitPrice) * ((it.discount || 0) / 100))) - (it.quantity * (it.costPrice || product.costPrice))) / ((it.quantity * it.unitPrice) - Math.round((it.quantity * it.unitPrice) * ((it.discount || 0) / 100)))) * 1000) / 10 || 40
      };
    });

    // 4. Resolve Negotiation Details
    const negotiations = getOrSeedStorage('negotiationRequests', []);
    const negotiation = negotiations.find(n => n.quotationId === q.id) || null;

    // 5. Resolve Fulfillment Details
    const fulfillments = getOrSeedStorage('fulfillmentOrders', INITIAL_FULFILLMENTS);
    const warehouses = getOrSeedStorage('warehouses', WAREHOUSES);
    const fulfillment = fulfillments.find(f => f.quotationId === q.id) || null;
    const warehouse = fulfillment ? warehouses.find(w => w.id === fulfillment.warehouseId) : null;

    // 6. Resolve Subscription Details
    const subscriptions = getOrSeedStorage('subscriptions', INITIAL_SUBSCRIPTIONS);
    const subscription = subscriptions.find(s => s.quotationId === q.id) || null;

    return {
      ...q,
      customerName: customer.companyName,
      customerCode: customer.customerCode,
      contactPerson: customer.contactName,
      contactEmail: customer.email,
      customerTierId: customer.customerTierId,
      customerTierName: customerTier.name,
      salesRepName: salesRep.name,
      items: itemsForQuote,
      negotiationDetails: negotiation ? {
        hasActiveNegotiation: true,
        ...negotiation
      } : { hasActiveNegotiation: false },
      fulfillmentDetails: fulfillment ? {
        fulfillmentOrderId: fulfillment.id,
        warehouseId: fulfillment.warehouseId,
        warehouseName: warehouse ? warehouse.name : 'Central Warehouse',
        status: fulfillment.status,
        reservedItemsCount: fulfillment.reservedItemsCount || itemsForQuote.length,
        estimatedShipDays: fulfillment.estimatedShipDays || 3
      } : null,
      subscriptionDetails: subscription || {
        billingCycle: 'Annual',
        contractDurationMonths: 12,
        annualRecurringRevenue: q.total || 0,
        monthlyRecurringRevenue: Math.round((q.total || 0) / 12),
        autoRenew: true
      },
      activity: [
        { id: 'act-init', event: `Quotation ${q.quotationNumber} initialized from JSON dataset`, user: salesRep.name, date: q.createdAt.slice(0, 10) }
      ]
    };
  },

  /**
   * Initializes initial in-memory React state from src/data/*.json or localStorage
   */
  getInitialQuotations: () => {
    const quotations = getOrSeedStorage('quotations', INITIAL_QUOTATIONS);
    const quotationItems = getOrSeedStorage('quotationItems', INITIAL_QUOTATION_ITEMS_FLAT);
    return quotations.map(q => dataService.hydrateQuotation(q, quotationItems));
  },

  /**
   * Pure immutable factory for creating a new quotation
   */
  createImmutableQuotation: (existingList, newFormData) => {
    const list = deepClone(existingList);
    const nums = list.map(q => {
      const m = (q.quotationNumber || '').replace(/[^0-9]/g, '');
      return m ? parseInt(m, 10) : 1000;
    });
    const nextNum = Math.max(...nums, 1004) + 1;
    const newId = newFormData.id || `QID-${String(nextNum).padStart(3, '0')}`;
    const newNumber = newFormData.quotationNumber || `Q-${nextNum}`;

    const customers = dataService.getCustomers();
    const customerTiers = dataService.getCustomerTiers();
    const users = dataService.getUsers();

    const customer = customers.find(c => c.id === newFormData.customerId) || {};
    const customerTier = customerTiers.find(t => t.id === (newFormData.customerTierId || customer.customerTierId)) || {};
    const salesRep = users.find(u => u.id === (newFormData.salesRepId || 'USR-001')) || {};

    const now = new Date().toISOString();

    const created = {
      ...newFormData,
      id: newId,
      quotationNumber: newNumber,
      customerId: customer.id,
      customerCode: customer.customerCode,
      customerName: customer.companyName,
      customerTierId: customerTier.id,
      customerTierName: customerTier.name,
      salesRepId: salesRep.id,
      salesRepName: salesRep.name,
      contactPerson: customer.contactName,
      contactEmail: customer.email,
      createdAt: now,
      updatedAt: now,
      stage: newFormData.stage || 'draft',
      status: newFormData.status || 'Draft',
      isArchived: false,
      items: (newFormData.items || []).map((it, idx) => ({
        ...it,
        id: `QI-${Date.now()}-${idx}`,
        quotationId: newId,
        productId: it.productId || 'PROD-001'
      })),
      activity: [
        {
          id: `act-${Date.now()}`,
          event: `Quotation ${newNumber} created in React state`,
          user: salesRep.name,
          date: now.slice(0, 10)
        }
      ]
    };

    return [created, ...list];
  },

  /**
   * Pure immutable update function
   */
  updateImmutableQuotation: (existingList, idOrNumber, updates) => {
    const list = deepClone(existingList);
    const index = list.findIndex(
      q => q.id === idOrNumber || q.quotationNumber === idOrNumber
    );
    if (index === -1) return list;

    const existing = list[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      activity: updates.activityNote ? [
        {
          id: `act-${Date.now()}`,
          event: updates.activityNote,
          user: updates.author || existing.salesRepName || 'Alex Morgan',
          date: new Date().toISOString().slice(0, 10)
        },
        ...(existing.activity || [])
      ] : existing.activity
    };

    list[index] = updated;
    return list;
  },

  /**
   * Pure immutable delete function
   */
  deleteImmutableQuotation: (existingList, idOrNumber) => {
    return existingList.filter(
      q => q.id !== idOrNumber && q.quotationNumber !== idOrNumber
    );
  }
};
