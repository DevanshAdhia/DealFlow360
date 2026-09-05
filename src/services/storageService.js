// Live API & Session Storage Service

export const getFromStorage = (key, defaultVal = null) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

export const setToStorage = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

// Purge any legacy mock storage keys
export const initializeData = () => {
  const keysToRemove = [
    'df_data_version', 'df_users', 'df_roles', 'df_customers', 'df_categories',
    'df_products', 'df_discount_rules', 'df_approval_rules', 'df_inventory',
    'df_audit', 'df_settings', 'df_pricelists', 'df_quotations', 'df_orders',
    'df_warehouses', 'df_invoices', 'df_notifications'
  ];
  keysToRemove.forEach(k => localStorage.removeItem(k));
};

// Authentication Session Management
export const getSession = () => {
  const token = localStorage.getItem('access_token');
  const session = getFromStorage('df_session', null);
  if (!token || !session) {
    return null;
  }
  return session;
};

export const setSession = (user) => {
  if (user) {
    setToStorage('df_session', user);
  } else {
    localStorage.removeItem('df_session');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

// Data getters
export const getUsers = () => getFromStorage('df_users', []);
export const getRoles = () => getFromStorage('df_roles', []);
export const getCustomers = () => getFromStorage('df_customers', []);
export const getCategories = () => getFromStorage('df_categories', []);
export const getProducts = () => getFromStorage('df_products', []);
export const getDiscountRules = () => getFromStorage('df_discount_rules', []);
export const getApprovalRules = () => getFromStorage('df_approval_rules', []);
export const getInventory = () => getFromStorage('df_inventory', []);
export const getAuditLogs = () => getFromStorage('df_audit', []);
export const getSettings = () => getFromStorage('df_settings', {});
export const setSettings = (settings) => setToStorage('df_settings', settings);

export const getPriceLists = () => getFromStorage('df_pricelists', []);
export const getQuotations = () => getFromStorage('df_quotations', []);
export const getOrders = () => getFromStorage('df_orders', []);
export const getWarehouses = () => getFromStorage('df_warehouses', []);
export const getInvoices = () => getFromStorage('df_invoices', []);
export const getNotifications = () => getFromStorage('df_notifications', []);

export const addAuditLog = (user, action, entity, description) => {
  const logs = getAuditLogs();
  const newLog = {
    id: `al_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user?.name || 'System',
    role: user?.role || 'System',
    action,
    entity,
    description
  };
  setToStorage('df_audit', [newLog, ...logs]);
};

// Basic CRUD for a generic entity (to simplify operations in services)
export const saveEntity = (key, entity, isNew = false) => {
  const data = getFromStorage(key, []);
  let updated;
  if (isNew) {
    updated = [...data, { ...entity, id: `id_${Date.now()}` }];
  } else {
    updated = data.map(i => (i.id === entity.id ? entity : i));
  }
  setToStorage(key, updated);
};
