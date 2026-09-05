export const initialUsers = [
  { id: 'u1', name: 'Admin User', email: 'admin@dealflow360.com', role: 'Admin', department: 'IT', status: 'Active', created: '2023-01-15' },
  { id: 'u2', name: 'Sarah Connor', email: 'sarah@dealflow360.com', role: 'Sales Manager', department: 'Sales', status: 'Active', created: '2023-02-10' },
  { id: 'u3', name: 'John Doe', email: 'john@dealflow360.com', role: 'Sales Representative', department: 'Sales', status: 'Active', created: '2023-03-05' },
  { id: 'u4', name: 'Jane Smith', email: 'jane@dealflow360.com', role: 'Finance', department: 'Finance', status: 'Active', created: '2023-03-20' },
  { id: 'u5', name: 'Mike Ross', email: 'mike@dealflow360.com', role: 'Operations', department: 'Ops', status: 'Inactive', created: '2023-04-12' }
];

export const initialRoles = [
  { id: 'r1', name: 'Admin', description: 'Full system access', status: 'Active' },
  { id: 'r2', name: 'Sales Manager', description: 'Can approve quotes and manage pipeline', status: 'Active' },
  { id: 'r3', name: 'Sales Representative', description: 'Can create quotes and view own pipeline', status: 'Active' },
  { id: 'r4', name: 'Finance', description: 'Can approve margins and view billing', status: 'Active' },
  { id: 'r5', name: 'Operations', description: 'Can manage inventory and fulfillment', status: 'Active' },
  { id: 'r6', name: 'Customer', description: 'External portal access only', status: 'Active' }
];

export const initialCustomers = [
  { id: 'c1', name: 'Acme Corp', company: 'Acme Corporation', email: 'billing@acme.com', phone: '555-0100', industry: 'Technology', tier: 'Enterprise', status: 'Active' },
  { id: 'c2', name: 'Globex', company: 'Globex Inc', email: 'purchasing@globex.com', phone: '555-0200', industry: 'Manufacturing', tier: 'Gold', status: 'Active' },
  { id: 'c3', name: 'Soylent', company: 'Soylent Corp', email: 'procurement@soylent.com', phone: '555-0300', industry: 'Food', tier: 'Silver', status: 'Inactive' }
];

export const initialCategories = [
  { id: 'cat1', name: 'Enterprise Servers', description: 'High-performance computing', status: 'Active' },
  { id: 'cat2', name: 'Cloud Storage', description: 'Scalable storage solutions', status: 'Active' },
  { id: 'cat3', name: 'Networking', description: 'Switches and routers', status: 'Active' }
];

export const initialProducts = [
  { id: 'p1', name: 'ProServer X1', sku: 'SRV-X1', category: 'Enterprise Servers', cost: 4000, price: 5500, stock: 45, status: 'Active' },
  { id: 'p2', name: 'Storage Node 100TB', sku: 'STG-100', category: 'Cloud Storage', cost: 2000, price: 3200, stock: 120, status: 'Active' },
  { id: 'p3', name: 'Router Gateway Pro', sku: 'NET-GW', category: 'Networking', cost: 800, price: 1500, stock: 15, status: 'Active' }
];

export const initialDiscountRules = [
  { id: 'dr1', tier: 'Enterprise', category: 'Enterprise Servers', maxDiscount: 20, minMargin: 15, priority: 1, status: 'Active' },
  { id: 'dr2', tier: 'Gold', category: 'Cloud Storage', maxDiscount: 15, minMargin: 20, priority: 2, status: 'Active' }
];

export const initialApprovalRules = [
  { id: 'ar1', name: 'High Discount Approval', condition: 'Discount', operator: 'Greater Than', value: 15, role: 'Sales Manager', priority: 1, status: 'Active' },
  { id: 'ar2', name: 'Low Margin Risk', condition: 'Margin', operator: 'Less Than', value: 20, role: 'Finance', priority: 2, status: 'Active' }
];

export const initialInventory = [
  { id: 'inv1', product: 'ProServer X1', warehouse: 'Main Hub', available: 45, reserved: 5, incoming: 10, status: 'Healthy' },
  { id: 'inv2', product: 'Storage Node 100TB', warehouse: 'East Coast', available: 120, reserved: 20, incoming: 0, status: 'Healthy' },
  { id: 'inv3', product: 'Router Gateway Pro', warehouse: 'West Coast', available: 2, reserved: 1, incoming: 50, status: 'Low Stock' }
];

export const initialAuditLogs = [
  { id: 'al1', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Created Product', entity: 'Product', description: 'Created product ProServer X1' },
  { id: 'al2', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Sarah Connor', role: 'Sales Manager', action: 'Approved Quote', entity: 'Quote', description: 'Approved Q-1024 for Acme Corp' }
];

export const initialSettings = {
  companyName: 'DealFlow360',
  currency: 'USD',
  timezone: 'UTC',
  approvalTimeout: 48,
  lowStockThreshold: 10
};

export const initialPriceLists = [
  { id: 'pl1', name: 'Enterprise Base', tier: 'Enterprise', currency: 'USD', effective: '2023-01-01', expiry: '2024-12-31', status: 'Active' },
  { id: 'pl2', name: 'SMB Standard', tier: 'Standard', currency: 'USD', effective: '2023-01-01', expiry: '2024-12-31', status: 'Active' }
];

export const initialQuotations = [
  { id: 'q1', quoteId: 'Q-1024', customer: 'Acme Corp', rep: 'John Doe', amount: 54000, discount: 10, margin: 25, risk: 'Low', status: 'Approved', created: '2023-10-15', expiry: '2023-11-15' },
  { id: 'q2', quoteId: 'Q-1025', customer: 'Globex Inc', rep: 'John Doe', amount: 12500, discount: 20, margin: 12, risk: 'High', status: 'Pending', created: '2023-10-18', expiry: '2023-11-18' }
];

export const initialOrders = [
  { id: 'o1', orderId: 'ORD-5501', customer: 'Acme Corp', quoteId: 'Q-1024', amount: 54000, status: 'Processing', fulfillment: 'Pending', payment: 'Unpaid', created: '2023-10-20' },
  { id: 'o2', orderId: 'ORD-5502', customer: 'Globex Inc', quoteId: 'Q-0990', amount: 8500, status: 'Fulfilled', fulfillment: 'Shipped', payment: 'Paid', created: '2023-09-12' }
];

export const initialWarehouses = [
  { id: 'wh1', name: 'Main Hub', location: 'New York, NY', manager: 'Mike Ross', capacity: '100,000 sqft', status: 'Active' },
  { id: 'wh2', name: 'West Coast', location: 'Los Angeles, CA', manager: 'Sarah Connor', capacity: '75,000 sqft', status: 'Active' }
];

export const initialInvoices = [
  { id: 'inv_1', invoiceId: 'INV-2023-001', customer: 'Globex Inc', order: 'ORD-5502', amount: 8500, due: '2023-10-12', status: 'Paid' },
  { id: 'inv_2', invoiceId: 'INV-2023-002', customer: 'Acme Corp', order: 'ORD-5501', amount: 54000, due: '2023-11-20', status: 'Issued' }
];

export const initialNotifications = [
  { id: 'n1', title: 'Pending Approval', type: 'Approval', recipient: 'Sarah Connor', priority: 'High', status: 'Unread', created: '2023-10-18' },
  { id: 'n2', title: 'Low Stock Alert', type: 'Inventory', recipient: 'Mike Ross', priority: 'Medium', status: 'Read', created: '2023-10-19' }
];
