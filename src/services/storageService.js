// DealFlow360 — Storage Service Layer

export const STORAGE_KEYS = {
  USERS: 'dealflow360_users',
  ROLES: 'dealflow360_roles',
  CUSTOMERS: 'dealflow360_customers',
  CUSTOMER_TIERS: 'dealflow360_customer_tiers',
  CATEGORIES: 'dealflow360_categories',
  PRODUCTS: 'dealflow360_products',
  PRICE_LISTS: 'dealflow360_price_lists',
  PRICE_LIST_ITEMS: 'dealflow360_price_list_items',
  DISCOUNT_RULES: 'dealflow360_discount_rules',
  APPROVAL_RULES: 'dealflow360_approval_rules',
  APPROVAL_LEVELS: 'dealflow360_approval_levels',
  APPROVAL_RULE_STEPS: 'dealflow360_approval_rule_steps',
  QUOTATIONS: 'dealflow360_quotations',
  QUOTATION_ITEMS: 'dealflow360_quotation_items',
  QUOTATION_VERSIONS: 'dealflow360_quotation_versions',
  QUOTATION_COMMENTS: 'dealflow360_quotation_comments',
  RECOMMENDATION_RULES: 'dealflow360_recommendation_rules',
  NEGOTIATION_REQUESTS: 'dealflow360_negotiation_requests',
  NEGOTIATION_ITEMS: 'dealflow360_negotiation_items',
  ORDERS: 'dealflow360_orders',
  FULFILLMENT_ORDERS: 'dealflow360_fulfillment_orders',
  WAREHOUSES: 'dealflow360_warehouses',
  SUBSCRIPTIONS: 'dealflow360_subscriptions',
  BILLING_SCHEDULES: 'dealflow360_billing_schedules',
  INVOICES: 'dealflow360_invoices',
  PAYMENTS: 'dealflow360_payments',
  DEAL_HEALTH: 'dealflow360_deal_health',
};

export const storageService = {
  getData: (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(`storageService.getData fallback [] on [${key}]:`, err);
      return [];
    }
  },

  setData: (key, data) => {
    try {
      const safeArray = Array.isArray(data) ? data : [];
      localStorage.setItem(key, JSON.stringify(safeArray));
      return true;
    } catch (err) {
      console.error(`storageService.setData error on [${key}]:`, err);
      return false;
    }
  },

  addData: (key, item) => {
    try {
      const list = storageService.getData(key);
      const updated = [item, ...list];
      storageService.setData(key, updated);
      return item;
    } catch (err) {
      console.error(`storageService.addData error on [${key}]:`, err);
      return null;
    }
  },

  updateData: (key, id, changes) => {
    try {
      const list = storageService.getData(key);
      let updatedItem = null;
      const updatedList = list.map(item => {
        if (item.id === id || item.quotationNumber === id) {
          updatedItem = { ...item, ...changes, updatedAt: new Date().toISOString() };
          return updatedItem;
        }
        return item;
      });
      storageService.setData(key, updatedList);
      return updatedItem;
    } catch (err) {
      console.error(`storageService.updateData error on [${key}, id:${id}]:`, err);
      return null;
    }
  },

  deleteData: (key, id) => {
    try {
      const list = storageService.getData(key);
      const filtered = list.filter(item => item.id !== id && item.quotationNumber !== id);
      storageService.setData(key, filtered);
      return true;
    } catch (err) {
      console.error(`storageService.deleteData error on [${key}, id:${id}]:`, err);
      return false;
    }
  },

  seedInitialData: () => true,

  getAllCollectionsSnapshot: () => {
    const result = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      result[name] = storageService.getData(key);
    });
    return result;
  }
};

export const getSession = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (user) => {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  } catch {}
};

export const initializeData = () => true;

export const getNotifications = () => [];
