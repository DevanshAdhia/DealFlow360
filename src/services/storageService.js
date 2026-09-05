import { 
  initialUsers, initialRoles, initialCustomers, initialCategories, initialProducts,
  initialDiscountRules, initialApprovalRules, initialInventory, initialAuditLogs, initialSettings,
  initialPriceLists, initialQuotations, initialOrders, initialWarehouses, initialInvoices, initialNotifications
} from '../data/mockData';

// Generic get/set for localStorage
export const getFromStorage = (key, defaultVal = []) => {
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

// Initialization hook replacement (called synchronously on app start)
const DATA_VERSION = 'v2';
export const initializeData = () => {
  if (localStorage.getItem('df_data_version') !== DATA_VERSION) {
    // Clear old data and reload fresh mock data
    const keysToRemove = ['df_users','df_roles','df_customers','df_categories','df_products','df_discount_rules','df_approval_rules','df_inventory','df_audit','df_settings','df_pricelists','df_quotations','df_orders','df_warehouses','df_invoices','df_notifications'];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    localStorage.setItem('df_data_version', DATA_VERSION);
  }
  if (!localStorage.getItem('df_users')) setToStorage('df_users', initialUsers);
  if (!localStorage.getItem('df_roles')) setToStorage('df_roles', initialRoles);
  if (!localStorage.getItem('df_customers')) setToStorage('df_customers', initialCustomers);
  if (!localStorage.getItem('df_categories')) setToStorage('df_categories', initialCategories);
  if (!localStorage.getItem('df_products')) setToStorage('df_products', initialProducts);
  if (!localStorage.getItem('df_discount_rules')) setToStorage('df_discount_rules', initialDiscountRules);
  if (!localStorage.getItem('df_approval_rules')) setToStorage('df_approval_rules', initialApprovalRules);
  if (!localStorage.getItem('df_inventory')) setToStorage('df_inventory', initialInventory);
  if (!localStorage.getItem('df_audit')) setToStorage('df_audit', initialAuditLogs);
  if (!localStorage.getItem('df_settings')) setToStorage('df_settings', initialSettings);
  if (!localStorage.getItem('df_pricelists')) setToStorage('df_pricelists', initialPriceLists);
  if (!localStorage.getItem('df_quotations')) setToStorage('df_quotations', initialQuotations);
  if (!localStorage.getItem('df_orders')) setToStorage('df_orders', initialOrders);
  if (!localStorage.getItem('df_warehouses')) setToStorage('df_warehouses', initialWarehouses);
  if (!localStorage.getItem('df_invoices')) setToStorage('df_invoices', initialInvoices);
  if (!localStorage.getItem('df_notifications')) setToStorage('df_notifications', initialNotifications);
};


// Session
export const getSession = () => getFromStorage('df_session', null);
export const setSession = (user) => setToStorage('df_session', user);

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
    updated = data.map(item => item.id === entity.id ? entity : item);
  }
  setToStorage(key, updated);
  return updated;
};

export const deleteEntity = (key, id) => {
  const data = getFromStorage(key, []);
  const updated = data.filter(item => item.id !== id);
  setToStorage(key, updated);
  return updated;
};
