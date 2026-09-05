const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      console.warn('Unauthorized request - Token expired or invalidated');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('df_session');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      let errMsg = '';
      if (errorData.error) {
        const { message, details } = errorData.error;
        if (details && typeof details === 'object' && Object.keys(details).length > 0) {
          const formattedDetails = Object.entries(details)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
          errMsg = `${message} (${formattedDetails})`;
        } else {
          errMsg = message;
        }
      } else if (errorData.detail) {
        errMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
        errMsg = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      } else {
        errMsg = `API Error (HTTP ${response.status})`;
      }

      const err = new Error(errMsg);
      err.status = response.status;
      err.errorData = errorData;
      throw err;
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed'))) {
      const netErr = new Error('Backend server is offline or unreachable. Please start Django backend (python manage.py runserver).');
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw error;
  }
};

// API Endpoints Mapping
export const api = {
  // Auth & User Management
  login: (credentials) => apiFetch('/login/', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData) => apiFetch('/signup/', { method: 'POST', body: JSON.stringify(userData) }),
  getUsers: () => apiFetch('/signup/users/'),
  createUser: (userData) => apiFetch('/signup/users/', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) => apiFetch(`/signup/${id}/manage/`, { method: 'PUT', body: JSON.stringify(userData) }),
  deleteUser: (id) => apiFetch(`/signup/${id}/manage/`, { method: 'DELETE' }),
  setUserStatus: (id, status) => apiFetch(`/signup/${id}/manage/`, { method: 'POST', body: JSON.stringify({ status }) }),
  getUserRoles: () => apiFetch('/signup/roles/'),

  // Forgot Password (3-step OTP flow)
  requestPasswordReset: (email) => apiFetch('/login/forgot-password/', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyPasswordOTP: (email, otp) => apiFetch('/login/verify-otp/', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resetPassword: (email, otp, new_password, confirm_password) => apiFetch('/login/reset-password/', { method: 'POST', body: JSON.stringify({ email, otp, new_password, confirm_password }) }),

  // Dashboard
  getDashboardMetrics: () => apiFetch('/sales/quotations/dashboard/'),

  // Customers
  getCustomers: () => apiFetch('/customer/customers/?page_size=1000'),
  createCustomer: (data) => apiFetch('/customer/customers/', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => apiFetch(`/customer/customers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCustomer: (id) => apiFetch(`/customer/customers/${id}/`, { method: 'DELETE' }),
  getCustomerTiers: () => apiFetch('/customer/tiers/'),

  // Products & Categories
  getProducts: () => apiFetch('/product/products/?page_size=1000'),
  createProduct: (data) => apiFetch('/product/products/', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => apiFetch(`/product/products/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (id) => apiFetch(`/product/products/${id}/`, { method: 'DELETE' }),
  getCategories: () => apiFetch('/product/categories/?page_size=1000'),
  createCategory: (data) => apiFetch('/product/categories/', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => apiFetch(`/product/categories/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id) => apiFetch(`/product/categories/${id}/`, { method: 'DELETE' }),
  getPriceLists: () => apiFetch('/product/price-lists/?page_size=1000'),
  createPriceList: (data) => apiFetch('/product/price-lists/', { method: 'POST', body: JSON.stringify(data) }),
  updatePriceList: (id, data) => apiFetch(`/product/price-lists/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePriceList: (id) => apiFetch(`/product/price-lists/${id}/`, { method: 'DELETE' }),

  // Quotations & Sales
  getQuotations: () => apiFetch('/sales/quotations/?page_size=1000'),
  getQuotationDetail: (id) => apiFetch(`/sales/quotations/${id}/`),
  createQuotation: (data) => apiFetch('/sales/quotations/', { method: 'POST', body: JSON.stringify(data) }),
  submitQuotation: (id) => apiFetch(`/sales/quotations/${id}/submit/`, { method: 'POST' }),
  sendQuotation: (id) => apiFetch(`/sales/quotations/${id}/send/`, { method: 'POST' }),
  addQuotationItem: (quoteId, itemData) => apiFetch(`/sales/quotations/${quoteId}/items/`, { method: 'POST', body: JSON.stringify(itemData) }),

  // Discount & Rules
  getDiscountRules: () => apiFetch('/discount/rules/?page_size=1000'),
  createDiscountRule: (data) => apiFetch('/discount/rules/', { method: 'POST', body: JSON.stringify(data) }),
  updateDiscountRule: (id, data) => apiFetch(`/discount/rules/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteDiscountRule: (id) => apiFetch(`/discount/rules/${id}/`, { method: 'DELETE' }),
  getApprovalLevels: () => apiFetch('/discount/approval-levels/?page_size=1000'),
  getApprovalRules: () => apiFetch('/discount/approval-rules/?page_size=1000'),
  createApprovalRule: (data) => apiFetch('/discount/approval-rules/', { method: 'POST', body: JSON.stringify(data) }),
  updateApprovalRule: (id, data) => apiFetch(`/discount/approval-rules/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteApprovalRule: (id) => apiFetch(`/discount/approval-rules/${id}/`, { method: 'DELETE' }),

  // Warehouse & Inventory
  getWarehouses: () => apiFetch('/warehouse/warehouses/?page_size=1000'),
  createWarehouse: (data) => apiFetch('/warehouse/warehouses/', { method: 'POST', body: JSON.stringify(data) }),
  updateWarehouse: (id, data) => apiFetch(`/warehouse/warehouses/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteWarehouse: (id) => apiFetch(`/warehouse/warehouses/${id}/`, { method: 'DELETE' }),
  getInventory: () => apiFetch('/warehouse/inventories/?page_size=1000'),
  updateInventory: (id, data) => apiFetch(`/warehouse/inventories/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  getOrders: () => apiFetch('/warehouse/orders/?page_size=1000'),
  updateOrder: (id, data) => apiFetch(`/warehouse/orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteOrder: (id) => apiFetch(`/warehouse/orders/${id}/`, { method: 'DELETE' }),

  // Subscriptions & Billing
  getSubscriptions: () => apiFetch('/subscription/subscriptions/?page_size=1000'),
  getInvoices: () => apiFetch('/subscription/invoices/?page_size=1000'),
  updateInvoice: (id, data) => apiFetch(`/subscription/invoices/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteInvoice: (id) => apiFetch(`/subscription/invoices/${id}/`, { method: 'DELETE' }),
  getPayments: () => apiFetch('/subscription/payments/?page_size=1000'),

  // Negotiations
  getNegotiations: () => apiFetch('/negotiations/negotiations/'),
  respondNegotiation: (id, data) => apiFetch(`/negotiations/negotiations/${id}/respond/`, { method: 'POST', body: JSON.stringify(data) }),

  // Deal Health Alerts
  getDealAlerts: () => apiFetch('/deal-health/alerts/'),
  resolveDealAlert: (id) => apiFetch(`/deal-health/alerts/${id}/resolve/`, { method: 'POST' }),

  // Reports
  getReports: () => apiFetch('/reports/reports/'),
  generateReport: (data) => apiFetch('/reports/reports/', { method: 'POST', body: JSON.stringify(data) }),
};

