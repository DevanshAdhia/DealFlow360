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
