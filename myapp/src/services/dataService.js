// DealFlow360 — Dedicated JSON Data & Relational Service Layer
// Loads all seed/master/transaction demo data from src/data/*.json
// No localStorage. React state manages runtime modifications.
// Never mutates imported JSON objects directly (always returns immutable deep copies).
// All relationships are maintained strictly through foreign-key IDs.

import ROLES_DATA from '../data/roles.json';
import USERS_DATA from '../data/users.json';
import CUSTOMER_TIERS_DATA from '../data/customerTiers.json';
import CUSTOMERS_DATA from '../data/customers.json';
import CATEGORIES_DATA from '../data/categories.json';
import PRODUCTS_DATA from '../data/products.json';
import PRICE_LISTS_DATA from '../data/priceLists.json';
import PRICE_LIST_ITEMS_DATA from '../data/priceListItems.json';
import DISCOUNT_RULES_DATA from '../data/discountRules.json';
import APPROVAL_LEVELS_DATA from '../data/approvalLevels.json';
import APPROVAL_RULES_DATA from '../data/approvalRules.json';
import QUOTATIONS_DATA from '../data/quotations.json';
import QUOTATION_ITEMS_DATA from '../data/quotationItems.json';
import RECOMMENDATION_RULES_DATA from '../data/recommendationRules.json';
import NEGOTIATION_REQUESTS_DATA from '../data/negotiationRequests.json';
import FULFILLMENT_ORDERS_DATA from '../data/fulfillmentOrders.json';
import WAREHOUSES_DATA from '../data/warehouses.json';
import SUBSCRIPTIONS_DATA from '../data/subscriptions.json';

// Utility helper for safe deep cloning without mutations
const deepClone = (data) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data));
};

export const dataService = {
  // ─── MASTER RECORD LOOKUPS ──────────────────────────────────────────

  getRoles: () => deepClone(ROLES_DATA),
  getRoleById: (id) => deepClone(ROLES_DATA.find(r => r.id === id) || null),

  getUsers: () => deepClone(USERS_DATA),
  getUserById: (id) => deepClone(USERS_DATA.find(u => u.id === id) || null),

  getCustomerTiers: () => deepClone(CUSTOMER_TIERS_DATA),
  getCustomerTierById: (id) => deepClone(CUSTOMER_TIERS_DATA.find(t => t.id === id) || CUSTOMER_TIERS_DATA[2]),

  getCustomers: () => deepClone(CUSTOMERS_DATA),
  getCustomerById: (id) => deepClone(CUSTOMERS_DATA.find(c => c.id === id) || CUSTOMERS_DATA[0]),

  getCategories: () => deepClone(CATEGORIES_DATA),
  getCategoryById: (id) => deepClone(CATEGORIES_DATA.find(c => c.id === id) || null),

  getProducts: () => {
    return deepClone(PRODUCTS_DATA.map(p => {
      const cat = CATEGORIES_DATA.find(c => c.id === p.categoryId);
      const categoryName = cat?.name || 'Software';
      return {
        ...p,
        price: p.unitPrice,
        category: categoryName,
        categoryName
      };
    }));
  },
  getProductById: (id) => {
    const prod = PRODUCTS_DATA.find(p => p.id === id);
    if (!prod) return null;
    const category = CATEGORIES_DATA.find(c => c.id === prod.categoryId);
    const categoryName = category?.name || 'Software';
    return deepClone({
      ...prod,
      price: prod.unitPrice,
      category: categoryName,
      categoryName
    });
  },

  getPriceLists: () => deepClone(PRICE_LISTS_DATA),
  getPriceListForTier: (customerTierId) => {
    return deepClone(PRICE_LISTS_DATA.find(pl => pl.customerTierId === customerTierId) || PRICE_LISTS_DATA[2]);
  },

  getPriceListItems: () => deepClone(PRICE_LIST_ITEMS_DATA),
  getProductPriceInTier: (productId, basePrice, customerTierId) => {
    const priceList = PRICE_LISTS_DATA.find(pl => pl.customerTierId === customerTierId) || PRICE_LISTS_DATA[2];
    const customItem = PRICE_LIST_ITEMS_DATA.find(
      pli => pli.priceListId === priceList.id && pli.productId === productId
    );
    if (customItem && customItem.customPrice) {
      return customItem.customPrice;
    }
    return Math.round(basePrice * (priceList.multiplier || 1.0));
  },

  getDiscountRules: () => deepClone(DISCOUNT_RULES_DATA),
  getDiscountRule: (customerTierId, categoryId) => {
    return deepClone(DISCOUNT_RULES_DATA.find(
      dr => dr.customerTierId === customerTierId && dr.categoryId === categoryId
    ) || null);
  },

  getApprovalLevels: () => deepClone(APPROVAL_LEVELS_DATA),
  getApprovalRules: () => deepClone(APPROVAL_RULES_DATA),
  getRecommendationRules: () => deepClone(RECOMMENDATION_RULES_DATA),
  getWarehouses: () => deepClone(WAREHOUSES_DATA),
  getFulfillmentOrders: () => deepClone(FULFILLMENT_ORDERS_DATA),
  getSubscriptions: () => deepClone(SUBSCRIPTIONS_DATA),
  getNegotiationRequests: () => deepClone(NEGOTIATION_REQUESTS_DATA),

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
  hydrateQuotation: (rawQuote, allItems = QUOTATION_ITEMS_DATA) => {
    const q = deepClone(rawQuote);

    // 1. Resolve Customer & Customer Tier
    const customer = CUSTOMERS_DATA.find(c => c.id === q.customerId) || CUSTOMERS_DATA[0];
    const customerTier = CUSTOMER_TIERS_DATA.find(t => t.id === customer.customerTierId) || CUSTOMER_TIERS_DATA[2];

    // 2. Resolve Sales Rep
    const salesRep = USERS_DATA.find(u => u.id === q.salesRepId) || USERS_DATA[0];

    // 3. Resolve Line Items & Products
    const itemsForQuote = (allItems.filter(it => it.quotationId === q.id) || []).map(it => {
      const product = PRODUCTS_DATA.find(p => p.id === it.productId) || PRODUCTS_DATA[0];
      const category = CATEGORIES_DATA.find(c => c.id === product.categoryId);

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
    const negotiation = NEGOTIATION_REQUESTS_DATA.find(n => n.quotationId === q.id) || null;

    // 5. Resolve Fulfillment Details
    const fulfillment = FULFILLMENT_ORDERS_DATA.find(f => f.quotationId === q.id) || null;
    const warehouse = fulfillment ? WAREHOUSES_DATA.find(w => w.id === fulfillment.warehouseId) : null;

    // 6. Resolve Subscription Details
    const subscription = SUBSCRIPTIONS_DATA.find(s => s.quotationId === q.id) || null;

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
   * Initializes initial in-memory React state from src/data/*.json
   */
  getInitialQuotations: () => {
    return QUOTATIONS_DATA.map(q => dataService.hydrateQuotation(q, QUOTATION_ITEMS_DATA));
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
    const newId = `QID-${String(nextNum).padStart(3, '0')}`;
    const newNumber = `Q-${nextNum}`;

    const customer = CUSTOMERS_DATA.find(c => c.id === newFormData.customerId) || CUSTOMERS_DATA[0];
    const customerTier = CUSTOMER_TIERS_DATA.find(t => t.id === (newFormData.customerTierId || customer.customerTierId)) || CUSTOMER_TIERS_DATA[2];
    const salesRep = USERS_DATA.find(u => u.id === (newFormData.salesRepId || 'USR-001')) || USERS_DATA[0];

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
