export const initialUsers = [
  { id: 'u1', name: 'Admin User', email: 'admin@dealflow360.com', role: 'Admin', department: 'IT', status: 'Active', created: '2024-01-15', lastLogin: '2024-09-05' },
  { id: 'u2', name: 'Sarah Connor', email: 'sarah@dealflow360.com', role: 'Sales Manager', department: 'Sales', status: 'Active', created: '2024-02-10', lastLogin: '2024-09-04' },
  { id: 'u3', name: 'John Doe', email: 'john@dealflow360.com', role: 'Sales Representative', department: 'Sales', status: 'Active', created: '2024-03-05', lastLogin: '2024-09-05' },
  { id: 'u4', name: 'Jane Smith', email: 'jane@dealflow360.com', role: 'Finance', department: 'Finance', status: 'Active', created: '2024-03-20', lastLogin: '2024-09-03' },
  { id: 'u5', name: 'Mike Ross', email: 'mike@dealflow360.com', role: 'Operations', department: 'Ops', status: 'Inactive', created: '2024-04-12', lastLogin: '2024-08-20' },
  { id: 'u6', name: 'Rachel Green', email: 'rachel@dealflow360.com', role: 'Sales Representative', department: 'Sales', status: 'Active', created: '2024-04-18', lastLogin: '2024-09-05' },
  { id: 'u7', name: 'Tom Hardy', email: 'tom@dealflow360.com', role: 'Finance', department: 'Finance', status: 'Active', created: '2024-05-01', lastLogin: '2024-09-01' },
  { id: 'u8', name: 'Lisa Park', email: 'lisa@dealflow360.com', role: 'Operations', department: 'Ops', status: 'Active', created: '2024-05-15', lastLogin: '2024-09-04' },
  { id: 'u9', name: 'Kevin Hart', email: 'kevin@dealflow360.com', role: 'Sales Manager', department: 'Sales', status: 'Suspended', created: '2024-06-01', lastLogin: '2024-07-15' },
  { id: 'u10', name: 'Amy Johnson', email: 'amy@dealflow360.com', role: 'Sales Representative', department: 'Sales', status: 'Active', created: '2024-06-10', lastLogin: '2024-09-05' },
  { id: 'u11', name: 'Robert Chen', email: 'robert@dealflow360.com', role: 'Finance', department: 'Finance', status: 'Active', created: '2024-06-22', lastLogin: '2024-09-02' },
  { id: 'u12', name: 'Priya Sharma', email: 'priya@dealflow360.com', role: 'Sales Representative', department: 'Sales', status: 'Active', created: '2024-07-01', lastLogin: '2024-09-05' },
  { id: 'u13', name: 'James Wilson', email: 'james@dealflow360.com', role: 'Operations', department: 'Ops', status: 'Inactive', created: '2024-07-10', lastLogin: '2024-08-01' },
  { id: 'u14', name: 'Emma Davis', email: 'emma@dealflow360.com', role: 'Admin', department: 'IT', status: 'Active', created: '2024-07-20', lastLogin: '2024-09-04' },
  { id: 'u15', name: 'Carlos Ruiz', email: 'carlos@dealflow360.com', role: 'Sales Representative', department: 'Sales', status: 'Active', created: '2024-08-01', lastLogin: '2024-09-03' }
];

export const initialRoles = [
  { id: 'r1', name: 'Admin', description: 'Full system access — all modules and configuration', users: 2, status: 'Active' },
  { id: 'r2', name: 'Sales Manager', description: 'Can approve quotes and manage team pipeline', users: 2, status: 'Active' },
  { id: 'r3', name: 'Sales Representative', description: 'Can create quotes and view own pipeline', users: 6, status: 'Active' },
  { id: 'r4', name: 'Finance', description: 'Can approve margins and view billing', users: 2, status: 'Active' },
  { id: 'r5', name: 'Operations', description: 'Can manage inventory and fulfillment orders', users: 2, status: 'Active' },
  { id: 'r6', name: 'Customer', description: 'External portal access only (read-only)', users: 0, status: 'Active' }
];

export const initialCustomers = [
  { id: 'c1', name: 'Acme Corporation', email: 'billing@acme.com', phone: '555-0100', industry: 'Technology', tier: 'Enterprise', creditLimit: 500000, paymentTerms: 'Net 30', status: 'Active' },
  { id: 'c2', name: 'Globex Inc', email: 'purchasing@globex.com', phone: '555-0200', industry: 'Manufacturing', tier: 'Gold', creditLimit: 200000, paymentTerms: 'Net 45', status: 'Active' },
  { id: 'c3', name: 'Soylent Corp', email: 'procurement@soylent.com', phone: '555-0300', industry: 'Food & Beverage', tier: 'Silver', creditLimit: 80000, paymentTerms: 'Net 30', status: 'Inactive' },
  { id: 'c4', name: 'Initech Solutions', email: 'it@initech.com', phone: '555-0401', industry: 'Software', tier: 'Gold', creditLimit: 150000, paymentTerms: 'Net 30', status: 'Active' },
  { id: 'c5', name: 'Umbrella Corp', email: 'supply@umbrella.com', phone: '555-0500', industry: 'Biotech', tier: 'Enterprise', creditLimit: 750000, paymentTerms: 'Net 60', status: 'Active' },
  { id: 'c6', name: 'Weyland Industries', email: 'orders@weyland.com', phone: '555-0601', industry: 'Industrial', tier: 'Platinum', creditLimit: 350000, paymentTerms: 'Net 45', status: 'Active' },
  { id: 'c7', name: 'Tyrell Corp', email: 'purchasing@tyrell.com', phone: '555-0700', industry: 'Robotics', tier: 'Enterprise', creditLimit: 900000, paymentTerms: 'Net 30', status: 'Active' },
  { id: 'c8', name: 'Massive Dynamic', email: 'finance@massivedynamic.com', phone: '555-0800', industry: 'R&D', tier: 'Platinum', creditLimit: 420000, paymentTerms: 'Net 60', status: 'Active' },
  { id: 'c9', name: 'Cyberdyne Systems', email: 'orders@cyberdyne.com', phone: '555-0900', industry: 'Defense Tech', tier: 'Gold', creditLimit: 220000, paymentTerms: 'Net 45', status: 'Inactive' },
  { id: 'c10', name: 'Oscorp Industries', email: 'proc@oscorp.com', phone: '555-1000', industry: 'Chemicals', tier: 'Silver', creditLimit: 90000, paymentTerms: 'Net 30', status: 'Active' },
  { id: 'c11', name: 'Stark Industries', email: 'supply@stark.com', phone: '555-1100', industry: 'Aerospace', tier: 'Enterprise', creditLimit: 1000000, paymentTerms: 'Net 60', status: 'Active' },
  { id: 'c12', name: 'Wayne Enterprises', email: 'orders@wayne.com', phone: '555-1200', industry: 'Conglomerate', tier: 'Enterprise', creditLimit: 800000, paymentTerms: 'Net 30', status: 'Active' },
  { id: 'c13', name: 'Rekall Corporation', email: 'purchasing@rekall.com', phone: '555-1300', industry: 'Healthcare', tier: 'Standard', creditLimit: 40000, paymentTerms: 'Net 15', status: 'Active' },
  { id: 'c14', name: 'Nakatomi Corp', email: 'finance@nakatomi.com', phone: '555-1400', industry: 'Real Estate', tier: 'Silver', creditLimit: 75000, paymentTerms: 'Net 30', status: 'Active' },
  { id: 'c15', name: 'Virtucon Ltd', email: 'orders@virtucon.com', phone: '555-1500', industry: 'Technology', tier: 'Gold', creditLimit: 180000, paymentTerms: 'Net 45', status: 'Inactive' },
  { id: 'c16', name: 'Solex Industries', email: 'supply@solex.com', phone: '555-1600', industry: 'Energy', tier: 'Platinum', creditLimit: 310000, paymentTerms: 'Net 60', status: 'Active' },
  { id: 'c17', name: 'Frobozz Inc', email: 'procurement@frobozz.com', phone: '555-1700', industry: 'Gaming', tier: 'Standard', creditLimit: 25000, paymentTerms: 'Net 15', status: 'Active' },
  { id: 'c18', name: 'Omni Consumer Products', email: 'ocp@omni.com', phone: '555-1800', industry: 'Consumer Goods', tier: 'Gold', creditLimit: 200000, paymentTerms: 'Net 30', status: 'Active' },
  { id: 'c19', name: 'Globochem Corp', email: 'purchasing@globochem.com', phone: '555-1900', industry: 'Chemicals', tier: 'Silver', creditLimit: 85000, paymentTerms: 'Net 30', status: 'Active' },
  { id: 'c20', name: 'LexCorp', email: 'finance@lexcorp.com', phone: '555-2000', industry: 'Conglomerate', tier: 'Enterprise', creditLimit: 650000, paymentTerms: 'Net 60', status: 'Active' }
];

export const initialCategories = [
  { id: 'cat1', name: 'Enterprise Servers', description: 'High-performance computing hardware', status: 'Active' },
  { id: 'cat2', name: 'Cloud Storage', description: 'Scalable NAS and SAN storage solutions', status: 'Active' },
  { id: 'cat3', name: 'Networking', description: 'Switches, routers and firewall appliances', status: 'Active' },
  { id: 'cat4', name: 'Security Systems', description: 'Physical and cyber security hardware', status: 'Active' },
  { id: 'cat5', name: 'Workstations', description: 'High-end professional workstations', status: 'Active' },
  { id: 'cat6', name: 'Software Licenses', description: 'Enterprise software subscriptions', status: 'Active' },
  { id: 'cat7', name: 'Support Contracts', description: 'Maintenance and SLA packages', status: 'Active' },
  { id: 'cat8', name: 'Accessories', description: 'Cables, mounts, and peripherals', status: 'Inactive' }
];

export const initialProducts = [
  { id: 'p1', name: 'ProServer X1', sku: 'SRV-X1-001', category: 'Enterprise Servers', costPrice: 40000, basePrice: 55000, tax: 18, stock: 45, status: 'Active' },
  { id: 'p2', name: 'ProServer X2 Ultra', sku: 'SRV-X2-001', category: 'Enterprise Servers', costPrice: 65000, basePrice: 89000, tax: 18, stock: 22, status: 'Active' },
  { id: 'p3', name: 'Storage Node 50TB', sku: 'STG-050-001', category: 'Cloud Storage', costPrice: 15000, basePrice: 22000, tax: 18, stock: 80, status: 'Active' },
  { id: 'p4', name: 'Storage Node 100TB', sku: 'STG-100-001', category: 'Cloud Storage', costPrice: 28000, basePrice: 39000, tax: 18, stock: 55, status: 'Active' },
  { id: 'p5', name: 'Router Gateway Pro', sku: 'NET-GW-001', category: 'Networking', costPrice: 8000, basePrice: 13500, tax: 18, stock: 15, status: 'Active' },
  { id: 'p6', name: 'Firewall Enterprise FW-500', sku: 'NET-FW-500', category: 'Networking', costPrice: 12000, basePrice: 19500, tax: 18, stock: 8, status: 'Active' },
  { id: 'p7', name: 'SecureVault HSM', sku: 'SEC-HSM-001', category: 'Security Systems', costPrice: 22000, basePrice: 35000, tax: 18, stock: 12, status: 'Active' },
  { id: 'p8', name: 'CCTV Pro Kit (32ch)', sku: 'SEC-CCTV-32', category: 'Security Systems', costPrice: 18000, basePrice: 27500, tax: 18, stock: 25, status: 'Active' },
  { id: 'p9', name: 'Workstation Pro WS-8000', sku: 'WS-8000-001', category: 'Workstations', costPrice: 35000, basePrice: 49000, tax: 18, stock: 30, status: 'Active' },
  { id: 'p10', name: 'Workstation Lite WS-2000', sku: 'WS-2000-001', category: 'Workstations', costPrice: 18000, basePrice: 25000, tax: 18, stock: 60, status: 'Active' },
  { id: 'p11', name: 'ERP Suite License (Annual)', sku: 'SW-ERP-ANN', category: 'Software Licenses', costPrice: 50000, basePrice: 75000, tax: 18, stock: 999, status: 'Active' },
  { id: 'p12', name: 'Security Suite Pro', sku: 'SW-SEC-PRO', category: 'Software Licenses', costPrice: 12000, basePrice: 18000, tax: 18, stock: 999, status: 'Active' },
  { id: 'p13', name: 'Platinum SLA (12 months)', sku: 'SVC-SLA-PLT', category: 'Support Contracts', costPrice: 8000, basePrice: 14000, tax: 18, stock: 999, status: 'Active' },
  { id: 'p14', name: 'Gold SLA (12 months)', sku: 'SVC-SLA-GLD', category: 'Support Contracts', costPrice: 4500, basePrice: 8000, tax: 18, stock: 999, status: 'Active' },
  { id: 'p15', name: 'NAS Drive 10TB', sku: 'STG-NAS-10', category: 'Cloud Storage', costPrice: 5000, basePrice: 7500, tax: 18, stock: 4, status: 'Active' },
  { id: 'p16', name: 'Cat8 Ethernet Cable (50m)', sku: 'ACC-CAT8-50', category: 'Accessories', costPrice: 800, basePrice: 1400, tax: 18, stock: 200, status: 'Inactive' },
  { id: 'p17', name: 'Rack Mount Kit (42U)', sku: 'ACC-RACK-42', category: 'Accessories', costPrice: 3000, basePrice: 5000, tax: 18, stock: 18, status: 'Active' },
  { id: 'p18', name: 'Blade Server B10', sku: 'SRV-B10-001', category: 'Enterprise Servers', costPrice: 55000, basePrice: 78000, tax: 18, stock: 10, status: 'Active' },
  { id: 'p19', name: 'UPS Power Unit 20KVA', sku: 'PWR-UPS-20K', category: 'Accessories', costPrice: 25000, basePrice: 38000, tax: 18, stock: 14, status: 'Active' },
  { id: 'p20', name: 'Core Switch 48-Port', sku: 'NET-SW-48', category: 'Networking', costPrice: 9500, basePrice: 15000, tax: 18, stock: 20, status: 'Active' },
  { id: 'p21', name: 'Identity Manager Pro', sku: 'SW-IDM-PRO', category: 'Software Licenses', costPrice: 22000, basePrice: 34000, tax: 18, stock: 999, status: 'Active' },
  { id: 'p22', name: 'Backup Appliance BA-500', sku: 'STG-BA-500', category: 'Cloud Storage', costPrice: 32000, basePrice: 47000, tax: 18, stock: 7, status: 'Active' },
  { id: 'p23', name: 'SD-WAN Controller', sku: 'NET-SDWAN-01', category: 'Networking', costPrice: 14000, basePrice: 22500, tax: 18, stock: 11, status: 'Active' },
  { id: 'p24', name: 'Biometric Access Unit', sku: 'SEC-BIO-001', category: 'Security Systems', costPrice: 6000, basePrice: 10000, tax: 18, stock: 35, status: 'Active' },
  { id: 'p25', name: 'Silver SLA (12 months)', sku: 'SVC-SLA-SLV', category: 'Support Contracts', costPrice: 2500, basePrice: 4500, tax: 18, stock: 999, status: 'Active' },
  { id: 'p26', name: 'Hyper-Converged Node HC-1', sku: 'SRV-HC1-001', category: 'Enterprise Servers', costPrice: 95000, basePrice: 135000, tax: 18, stock: 5, status: 'Active' },
  { id: 'p27', name: 'AI Accelerator GPU Card', sku: 'SRV-GPU-A10', category: 'Enterprise Servers', costPrice: 45000, basePrice: 68000, tax: 18, stock: 9, status: 'Active' },
  { id: 'p28', name: 'VPN Concentrator', sku: 'NET-VPN-001', category: 'Networking', costPrice: 7000, basePrice: 11500, tax: 18, stock: 22, status: 'Active' },
  { id: 'p29', name: 'Patch Panel 48-Port', sku: 'ACC-PP-48', category: 'Accessories', costPrice: 1200, basePrice: 2200, tax: 18, stock: 50, status: 'Active' },
  { id: 'p30', name: 'Monitoring Suite Ent.', sku: 'SW-MON-ENT', category: 'Software Licenses', costPrice: 18000, basePrice: 28000, tax: 18, stock: 999, status: 'Active' }
];

export const initialDiscountRules = [
  { id: 'dr1', name: 'Enterprise Servers – Enterprise', tier: 'Enterprise', category: 'Enterprise Servers', maxDiscount: 20, minMargin: 15, priority: 1, status: 'Active' },
  { id: 'dr2', name: 'Cloud Storage – Gold', tier: 'Gold', category: 'Cloud Storage', maxDiscount: 15, minMargin: 20, priority: 2, status: 'Active' },
  { id: 'dr3', name: 'Software – Any Tier', tier: 'All', category: 'Software Licenses', maxDiscount: 25, minMargin: 40, priority: 3, status: 'Active' },
  { id: 'dr4', name: 'Networking – Platinum', tier: 'Platinum', category: 'Networking', maxDiscount: 18, minMargin: 18, priority: 4, status: 'Active' },
  { id: 'dr5', name: 'Support – Standard', tier: 'Standard', category: 'Support Contracts', maxDiscount: 10, minMargin: 30, priority: 5, status: 'Active' },
  { id: 'dr6', name: 'Security – Gold', tier: 'Gold', category: 'Security Systems', maxDiscount: 12, minMargin: 22, priority: 6, status: 'Active' },
  { id: 'dr7', name: 'Workstations – Silver', tier: 'Silver', category: 'Workstations', maxDiscount: 8, minMargin: 25, priority: 7, status: 'Inactive' },
  { id: 'dr8', name: 'Enterprise Servers – Platinum', tier: 'Platinum', category: 'Enterprise Servers', maxDiscount: 22, minMargin: 14, priority: 8, status: 'Active' },
  { id: 'dr9', name: 'Cloud Storage – Enterprise', tier: 'Enterprise', category: 'Cloud Storage', maxDiscount: 20, minMargin: 18, priority: 9, status: 'Active' },
  { id: 'dr10', name: 'Accessories – Any', tier: 'All', category: 'Accessories', maxDiscount: 5, minMargin: 35, priority: 10, status: 'Active' }
];

export const initialApprovalRules = [
  { id: 'ar1', name: 'High Discount Approval', condition: 'Discount', operator: 'Greater Than', value: 15, approvalRole: 'Sales Manager', priority: 1, status: 'Active' },
  { id: 'ar2', name: 'Low Margin Risk', condition: 'Margin', operator: 'Less Than', value: 20, approvalRole: 'Finance', priority: 2, status: 'Active' },
  { id: 'ar3', name: 'High Risk Quote', condition: 'Risk Score', operator: 'Greater Than', value: 70, approvalRole: 'Finance', priority: 3, status: 'Active' },
  { id: 'ar4', name: 'Large Quote Value', condition: 'Quote Value', operator: 'Greater Than', value: 500000, approvalRole: 'Sales Manager', priority: 4, status: 'Active' },
  { id: 'ar5', name: 'Non-Standard Payment', condition: 'Payment Terms', operator: 'Equals', value: 'Net 90', approvalRole: 'Finance', priority: 5, status: 'Active' },
  { id: 'ar6', name: 'Enterprise Discount Check', condition: 'Discount', operator: 'Greater Than', value: 20, approvalRole: 'Finance', priority: 6, status: 'Active' },
  { id: 'ar7', name: 'Critical Margin Floor', condition: 'Margin', operator: 'Less Than', value: 12, approvalRole: 'Admin', priority: 7, status: 'Active' },
  { id: 'ar8', name: 'Very Large Order', condition: 'Quote Value', operator: 'Greater Than', value: 1000000, approvalRole: 'Admin', priority: 8, status: 'Active' },
  { id: 'ar9', name: 'Standard Tier Limit', condition: 'Customer Tier', operator: 'Equals', value: 'Standard', approvalRole: 'Sales Manager', priority: 9, status: 'Active' },
  { id: 'ar10', name: 'Excessive Risk Block', condition: 'Risk Score', operator: 'Greater Than', value: 90, approvalRole: 'Admin', priority: 10, status: 'Inactive' }
];

export const initialInventory = [
  { id: 'inv1', product: 'ProServer X1', sku: 'SRV-X1-001', warehouse: 'Main Hub', available: 45, reserved: 5, incoming: 10, reorderLevel: 10, status: 'Healthy' },
  { id: 'inv2', product: 'ProServer X2 Ultra', sku: 'SRV-X2-001', warehouse: 'Main Hub', available: 22, reserved: 3, incoming: 0, reorderLevel: 10, status: 'Healthy' },
  { id: 'inv3', product: 'Storage Node 50TB', sku: 'STG-050-001', warehouse: 'East Coast', available: 80, reserved: 12, incoming: 20, reorderLevel: 15, status: 'Healthy' },
  { id: 'inv4', product: 'Storage Node 100TB', sku: 'STG-100-001', warehouse: 'East Coast', available: 55, reserved: 8, incoming: 0, reorderLevel: 10, status: 'Healthy' },
  { id: 'inv5', product: 'Router Gateway Pro', sku: 'NET-GW-001', warehouse: 'West Coast', available: 4, reserved: 1, incoming: 50, reorderLevel: 10, status: 'Low Stock' },
  { id: 'inv6', product: 'Firewall Enterprise FW-500', sku: 'NET-FW-500', warehouse: 'Main Hub', available: 8, reserved: 2, incoming: 0, reorderLevel: 5, status: 'Healthy' },
  { id: 'inv7', product: 'SecureVault HSM', sku: 'SEC-HSM-001', warehouse: 'Main Hub', available: 2, reserved: 1, incoming: 10, reorderLevel: 5, status: 'Low Stock' },
  { id: 'inv8', product: 'CCTV Pro Kit (32ch)', sku: 'SEC-CCTV-32', warehouse: 'West Coast', available: 25, reserved: 4, incoming: 0, reorderLevel: 8, status: 'Healthy' },
  { id: 'inv9', product: 'Workstation Pro WS-8000', sku: 'WS-8000-001', warehouse: 'Main Hub', available: 30, reserved: 6, incoming: 0, reorderLevel: 10, status: 'Healthy' },
  { id: 'inv10', product: 'Workstation Lite WS-2000', sku: 'WS-2000-001', warehouse: 'East Coast', available: 60, reserved: 10, incoming: 25, reorderLevel: 15, status: 'Healthy' },
  { id: 'inv11', product: 'NAS Drive 10TB', sku: 'STG-NAS-10', warehouse: 'Main Hub', available: 4, reserved: 2, incoming: 0, reorderLevel: 8, status: 'Critical' },
  { id: 'inv12', product: 'Blade Server B10', sku: 'SRV-B10-001', warehouse: 'West Coast', available: 10, reserved: 1, incoming: 5, reorderLevel: 5, status: 'Healthy' },
  { id: 'inv13', product: 'UPS Power Unit 20KVA', sku: 'PWR-UPS-20K', warehouse: 'Main Hub', available: 14, reserved: 3, incoming: 0, reorderLevel: 5, status: 'Healthy' },
  { id: 'inv14', product: 'Core Switch 48-Port', sku: 'NET-SW-48', warehouse: 'East Coast', available: 20, reserved: 5, incoming: 0, reorderLevel: 8, status: 'Healthy' },
  { id: 'inv15', product: 'Backup Appliance BA-500', sku: 'STG-BA-500', warehouse: 'Main Hub', available: 0, reserved: 0, incoming: 5, reorderLevel: 3, status: 'Backordered' },
  { id: 'inv16', product: 'SD-WAN Controller', sku: 'NET-SDWAN-01', warehouse: 'West Coast', available: 11, reserved: 2, incoming: 0, reorderLevel: 5, status: 'Healthy' },
  { id: 'inv17', product: 'Biometric Access Unit', sku: 'SEC-BIO-001', warehouse: 'East Coast', available: 35, reserved: 5, incoming: 0, reorderLevel: 10, status: 'Healthy' },
  { id: 'inv18', product: 'Hyper-Converged Node HC-1', sku: 'SRV-HC1-001', warehouse: 'Main Hub', available: 5, reserved: 2, incoming: 3, reorderLevel: 3, status: 'Healthy' },
  { id: 'inv19', product: 'AI Accelerator GPU Card', sku: 'SRV-GPU-A10', warehouse: 'Main Hub', available: 3, reserved: 1, incoming: 6, reorderLevel: 5, status: 'Low Stock' },
  { id: 'inv20', product: 'VPN Concentrator', sku: 'NET-VPN-001', warehouse: 'West Coast', available: 22, reserved: 3, incoming: 0, reorderLevel: 8, status: 'Healthy' },
  { id: 'inv21', product: 'Rack Mount Kit (42U)', sku: 'ACC-RACK-42', warehouse: 'Main Hub', available: 18, reserved: 2, incoming: 10, reorderLevel: 5, status: 'Healthy' },
  { id: 'inv22', product: 'Patch Panel 48-Port', sku: 'ACC-PP-48', warehouse: 'East Coast', available: 50, reserved: 5, incoming: 0, reorderLevel: 10, status: 'Healthy' },
  { id: 'inv23', product: 'ERP Suite License', sku: 'SW-ERP-ANN', warehouse: 'Digital', available: 999, reserved: 12, incoming: 0, reorderLevel: 0, status: 'Healthy' },
  { id: 'inv24', product: 'Security Suite Pro', sku: 'SW-SEC-PRO', warehouse: 'Digital', available: 999, reserved: 8, incoming: 0, reorderLevel: 0, status: 'Healthy' },
  { id: 'inv25', product: 'Monitoring Suite Ent.', sku: 'SW-MON-ENT', warehouse: 'Digital', available: 999, reserved: 5, incoming: 0, reorderLevel: 0, status: 'Healthy' },
  { id: 'inv26', product: 'Platinum SLA', sku: 'SVC-SLA-PLT', warehouse: 'Digital', available: 999, reserved: 7, incoming: 0, reorderLevel: 0, status: 'Healthy' },
  { id: 'inv27', product: 'Gold SLA', sku: 'SVC-SLA-GLD', warehouse: 'Digital', available: 999, reserved: 14, incoming: 0, reorderLevel: 0, status: 'Healthy' },
  { id: 'inv28', product: 'Silver SLA', sku: 'SVC-SLA-SLV', warehouse: 'Digital', available: 999, reserved: 9, incoming: 0, reorderLevel: 0, status: 'Healthy' },
  { id: 'inv29', product: 'Identity Manager Pro', sku: 'SW-IDM-PRO', warehouse: 'Digital', available: 999, reserved: 4, incoming: 0, reorderLevel: 0, status: 'Healthy' },
  { id: 'inv30', product: 'UPS Power Unit 20KVA', sku: 'PWR-UPS-20K', warehouse: 'East Coast', available: 0, reserved: 0, incoming: 4, reorderLevel: 3, status: 'Backordered' }
];

export const initialAuditLogs = [
  { id: 'al1', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Created Product', entity: 'Product', description: 'Created product: ProServer X1 (SRV-X1-001)' },
  { id: 'al2', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Sarah Connor', role: 'Sales Manager', action: 'Approved Quote', entity: 'Quotation', description: 'Approved Q-1024 for Acme Corp — ₹54,000' },
  { id: 'al3', timestamp: new Date(Date.now() - 10800000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Updated Discount Rule', entity: 'Discount Rule', description: 'Updated max discount for Enterprise Servers — Enterprise to 20%' },
  { id: 'al4', timestamp: new Date(Date.now() - 14400000).toISOString(), user: 'Mike Ross', role: 'Operations', action: 'Adjusted Inventory', entity: 'Inventory', description: 'Stock adjustment for Router Gateway Pro: +50 units at West Coast' },
  { id: 'al5', timestamp: new Date(Date.now() - 21600000).toISOString(), user: 'Jane Smith', role: 'Finance', action: 'Created Invoice', entity: 'Invoice', description: 'Invoice INV-2024-002 raised for Acme Corp — ₹54,000' },
  { id: 'al6', timestamp: new Date(Date.now() - 43200000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Created User', entity: 'User', description: 'New user Carlos Ruiz added as Sales Representative' },
  { id: 'al7', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'Sarah Connor', role: 'Sales Manager', action: 'Rejected Quote', entity: 'Quotation', description: 'Rejected Q-1025 — margin below threshold' },
  { id: 'al8', timestamp: new Date(Date.now() - 172800000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Updated Settings', entity: 'Settings', description: 'Changed approval timeout from 24h to 48h' },
  { id: 'al9', timestamp: new Date(Date.now() - 259200000).toISOString(), user: 'Mike Ross', role: 'Operations', action: 'Updated Warehouse', entity: 'Warehouse', description: 'Updated East Coast warehouse manager to Sarah Connor' },
  { id: 'al10', timestamp: new Date(Date.now() - 345600000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Created Approval Rule', entity: 'Approval Rule', description: 'Added rule: Large Quote Value > ₹500K requires Sales Manager approval' },
  { id: 'al11', timestamp: new Date(Date.now() - 432000000).toISOString(), user: 'Jane Smith', role: 'Finance', action: 'Updated Invoice', entity: 'Invoice', description: 'Marked invoice INV-2024-001 as Paid' },
  { id: 'al12', timestamp: new Date(Date.now() - 518400000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Deactivated User', entity: 'User', description: 'User Kevin Hart suspended — policy violation' },
  { id: 'al13', timestamp: new Date(Date.now() - 604800000).toISOString(), user: 'Lisa Park', role: 'Operations', action: 'Adjusted Inventory', entity: 'Inventory', description: 'Stock decrease for NAS Drive 10TB: -6 units shipped to Weyland Industries' },
  { id: 'al14', timestamp: new Date(Date.now() - 691200000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Created Price List', entity: 'Price List', description: 'Created new Enterprise Base price list for Q1 2025' },
  { id: 'al15', timestamp: new Date(Date.now() - 777600000).toISOString(), user: 'Sarah Connor', role: 'Sales Manager', action: 'Approved Quote', entity: 'Quotation', description: 'Approved Q-1022 for Stark Industries — ₹285,000' },
  { id: 'al16', timestamp: new Date(Date.now() - 864000000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Updated Category', entity: 'Category', description: 'Deactivated Accessories category — under review' },
  { id: 'al17', timestamp: new Date(Date.now() - 950400000).toISOString(), user: 'John Doe', role: 'Sales Representative', action: 'Created Quotation', entity: 'Quotation', description: 'New quote Q-1031 created for LexCorp — ₹124,000' },
  { id: 'al18', timestamp: new Date(Date.now() - 1036800000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Deleted Product', entity: 'Product', description: 'Deleted discontinued product: Old Router RG-100' },
  { id: 'al19', timestamp: new Date(Date.now() - 1123200000).toISOString(), user: 'Mike Ross', role: 'Operations', action: 'Created Warehouse', entity: 'Warehouse', description: 'New warehouse added: South Hub, Dallas TX' },
  { id: 'al20', timestamp: new Date(Date.now() - 1209600000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Updated Discount Rule', entity: 'Discount Rule', description: 'Min margin raised to 40% for Software Licenses' },
  { id: 'al21', timestamp: new Date(Date.now() - 1296000000).toISOString(), user: 'Rachel Green', role: 'Sales Representative', action: 'Created Quotation', entity: 'Quotation', description: 'New quote Q-1029 created for Wayne Enterprises — ₹390,000' },
  { id: 'al22', timestamp: new Date(Date.now() - 1382400000).toISOString(), user: 'Jane Smith', role: 'Finance', action: 'Created Invoice', entity: 'Invoice', description: 'Invoice INV-2024-010 raised for Tyrell Corp — ₹89,500' },
  { id: 'al23', timestamp: new Date(Date.now() - 1468800000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Updated Approval Rule', entity: 'Approval Rule', description: 'Risk Score threshold raised to 70 for Finance approval' },
  { id: 'al24', timestamp: new Date(Date.now() - 1555200000).toISOString(), user: 'Tom Hardy', role: 'Finance', action: 'Updated Invoice', entity: 'Invoice', description: 'Invoice INV-2024-006 marked Overdue — payment not received' },
  { id: 'al25', timestamp: new Date(Date.now() - 1641600000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Created Customer', entity: 'Customer', description: 'New customer Stark Industries added — Enterprise tier' },
  { id: 'al26', timestamp: new Date(Date.now() - 1728000000).toISOString(), user: 'Sarah Connor', role: 'Sales Manager', action: 'Updated Customer', entity: 'Customer', description: 'Globex Inc tier upgraded from Silver to Gold' },
  { id: 'al27', timestamp: new Date(Date.now() - 1814400000).toISOString(), user: 'Mike Ross', role: 'Operations', action: 'Adjusted Inventory', entity: 'Inventory', description: 'Transfer: 10 units ProServer X1 from East Coast to Main Hub' },
  { id: 'al28', timestamp: new Date(Date.now() - 1900800000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Created Role', entity: 'Role', description: 'New role "Finance Analyst" created — limited billing access' },
  { id: 'al29', timestamp: new Date(Date.now() - 1987200000).toISOString(), user: 'Amy Johnson', role: 'Sales Representative', action: 'Created Quotation', entity: 'Quotation', description: 'New quote Q-1030 created for Umbrella Corp — ₹215,000' },
  { id: 'al30', timestamp: new Date(Date.now() - 2073600000).toISOString(), user: 'Admin User', role: 'Admin', action: 'Updated Settings', entity: 'Settings', description: 'Email notification alerts enabled for Inventory warnings' }
];

export const initialSettings = {
  companyName: 'DealFlow360',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  quoteExpiry: 30,
  defaultTax: 18,
  defaultPaymentTerms: 'Net 30',
  approvalTimeout: 48,
  escalationEnabled: true,
  lowStockThreshold: 10,
  autoAllocation: false,
  backorderEnabled: true,
  emailNotification: true,
  approvalNotification: true,
  inventoryAlert: true,
  billingAlert: true
};

export const initialPriceLists = [
  { id: 'pl1', name: 'Enterprise Base 2024', tier: 'Enterprise', currency: 'INR', effective: '2024-01-01', expiry: '2024-12-31', status: 'Active' },
  { id: 'pl2', name: 'Platinum Q3 2024', tier: 'Platinum', currency: 'INR', effective: '2024-07-01', expiry: '2024-09-30', status: 'Active' },
  { id: 'pl3', name: 'Gold Annual 2024', tier: 'Gold', currency: 'INR', effective: '2024-01-01', expiry: '2024-12-31', status: 'Active' },
  { id: 'pl4', name: 'Silver Standard 2024', tier: 'Silver', currency: 'INR', effective: '2024-01-01', expiry: '2024-12-31', status: 'Active' },
  { id: 'pl5', name: 'SMB Standard 2024', tier: 'Standard', currency: 'INR', effective: '2024-01-01', expiry: '2024-12-31', status: 'Active' },
  { id: 'pl6', name: 'Enterprise 2023 Archive', tier: 'Enterprise', currency: 'INR', effective: '2023-01-01', expiry: '2023-12-31', status: 'Inactive' },
  { id: 'pl7', name: 'US Dollar Export', tier: 'Enterprise', currency: 'USD', effective: '2024-01-01', expiry: '2024-12-31', status: 'Active' },
  { id: 'pl8', name: 'Partner Reseller 2024', tier: 'Gold', currency: 'INR', effective: '2024-04-01', expiry: '2025-03-31', status: 'Active' }
];

export const initialQuotations = [
  { id: 'q1', quoteId: 'Q-1024', customer: 'Acme Corp', rep: 'John Doe', amount: 540000, discount: 10, margin: 25, risk: 'Low', status: 'Approved', created: '2024-09-01', expiry: '2024-10-01' },
  { id: 'q2', quoteId: 'Q-1025', customer: 'Globex Inc', rep: 'John Doe', amount: 125000, discount: 22, margin: 12, risk: 'High', status: 'Pending', created: '2024-09-02', expiry: '2024-10-02' },
  { id: 'q3', quoteId: 'Q-1026', customer: 'Umbrella Corp', rep: 'Rachel Green', amount: 890000, discount: 15, margin: 20, risk: 'Medium', status: 'Negotiating', created: '2024-09-03', expiry: '2024-10-03' },
  { id: 'q4', quoteId: 'Q-1027', customer: 'Stark Industries', rep: 'Amy Johnson', amount: 1250000, discount: 18, margin: 22, risk: 'Low', status: 'Pending', created: '2024-09-04', expiry: '2024-10-04' },
  { id: 'q5', quoteId: 'Q-1028', customer: 'Tyrell Corp', rep: 'Carlos Ruiz', amount: 345000, discount: 8, margin: 30, risk: 'Low', status: 'Approved', created: '2024-09-04', expiry: '2024-10-04' },
  { id: 'q6', quoteId: 'Q-1029', customer: 'Wayne Enterprises', rep: 'Rachel Green', amount: 390000, discount: 12, margin: 28, risk: 'Low', status: 'Draft', created: '2024-09-05', expiry: '2024-10-05' },
  { id: 'q7', quoteId: 'Q-1030', customer: 'LexCorp', rep: 'Amy Johnson', amount: 215000, discount: 5, margin: 35, risk: 'Low', status: 'Approved', created: '2024-08-25', expiry: '2024-09-25' },
  { id: 'q8', quoteId: 'Q-1031', customer: 'Massive Dynamic', rep: 'John Doe', amount: 680000, discount: 20, margin: 16, risk: 'High', status: 'Rejected', created: '2024-08-20', expiry: '2024-09-20' },
  { id: 'q9', quoteId: 'Q-1032', customer: 'Weyland Industries', rep: 'Carlos Ruiz', amount: 175000, discount: 6, margin: 33, risk: 'Low', status: 'Confirmed', created: '2024-08-18', expiry: '2024-09-18' },
  { id: 'q10', quoteId: 'Q-1033', customer: 'Initech Solutions', rep: 'Priya Sharma', amount: 95000, discount: 10, margin: 27, risk: 'Low', status: 'Approved', created: '2024-08-15', expiry: '2024-09-15' },
  { id: 'q11', quoteId: 'Q-1034', customer: 'Oscorp Industries', rep: 'Priya Sharma', amount: 48000, discount: 5, margin: 40, risk: 'Low', status: 'Draft', created: '2024-09-05', expiry: '2024-10-05' },
  { id: 'q12', quoteId: 'Q-1035', customer: 'Nakatomi Corp', rep: 'Amy Johnson', amount: 72000, discount: 8, margin: 29, risk: 'Low', status: 'Pending', created: '2024-09-05', expiry: '2024-10-05' },
  { id: 'q13', quoteId: 'Q-1036', customer: 'Rekall Corporation', rep: 'John Doe', amount: 28000, discount: 3, margin: 45, risk: 'Low', status: 'Approved', created: '2024-09-01', expiry: '2024-10-01' },
  { id: 'q14', quoteId: 'Q-1037', customer: 'Cyberdyne Systems', rep: 'Rachel Green', amount: 420000, discount: 25, margin: 10, risk: 'Critical', status: 'Pending', created: '2024-09-04', expiry: '2024-10-04' },
  { id: 'q15', quoteId: 'Q-1038', customer: 'Globochem Corp', rep: 'Carlos Ruiz', amount: 65000, discount: 7, margin: 31, risk: 'Low', status: 'Negotiating', created: '2024-09-03', expiry: '2024-10-03' },
  { id: 'q16', quoteId: 'Q-1039', customer: 'Solex Industries', rep: 'Priya Sharma', amount: 315000, discount: 12, margin: 24, risk: 'Medium', status: 'Approved', created: '2024-08-28', expiry: '2024-09-28' },
  { id: 'q17', quoteId: 'Q-1040', customer: 'OCP Industries', rep: 'Amy Johnson', amount: 158000, discount: 14, margin: 21, risk: 'Medium', status: 'Pending', created: '2024-09-05', expiry: '2024-10-05' },
  { id: 'q18', quoteId: 'Q-1041', customer: 'Frobozz Inc', rep: 'John Doe', amount: 19500, discount: 5, margin: 42, risk: 'Low', status: 'Draft', created: '2024-09-05', expiry: '2024-10-05' },
  { id: 'q19', quoteId: 'Q-1042', customer: 'Acme Corp', rep: 'Rachel Green', amount: 275000, discount: 9, margin: 28, risk: 'Low', status: 'Confirmed', created: '2024-08-10', expiry: '2024-09-10' },
  { id: 'q20', quoteId: 'Q-1043', customer: 'Virtucon Ltd', rep: 'Carlos Ruiz', amount: 88500, discount: 18, margin: 15, risk: 'High', status: 'Pending', created: '2024-09-05', expiry: '2024-10-05' }
];

export const initialOrders = [
  { id: 'o1', orderId: 'ORD-5501', customer: 'Acme Corp', quoteId: 'Q-1024', amount: 540000, status: 'Processing', fulfillment: 'Pending', payment: 'Unpaid', created: '2024-09-02' },
  { id: 'o2', orderId: 'ORD-5502', customer: 'Tyrell Corp', quoteId: 'Q-1028', amount: 345000, status: 'Processing', fulfillment: 'Pending', payment: 'Paid', created: '2024-09-05' },
  { id: 'o3', orderId: 'ORD-5503', customer: 'Weyland Industries', quoteId: 'Q-1032', amount: 175000, status: 'Fulfilled', fulfillment: 'Shipped', payment: 'Paid', created: '2024-08-19' },
  { id: 'o4', orderId: 'ORD-5504', customer: 'LexCorp', quoteId: 'Q-1030', amount: 215000, status: 'Fulfilled', fulfillment: 'Shipped', payment: 'Paid', created: '2024-08-26' },
  { id: 'o5', orderId: 'ORD-5505', customer: 'Initech Solutions', quoteId: 'Q-1033', amount: 95000, status: 'Processing', fulfillment: 'Partially Fulfilled', payment: 'Partially Paid', created: '2024-08-16' },
  { id: 'o6', orderId: 'ORD-5506', customer: 'Acme Corp', quoteId: 'Q-1042', amount: 275000, status: 'Fulfilled', fulfillment: 'Shipped', payment: 'Paid', created: '2024-08-12' },
  { id: 'o7', orderId: 'ORD-5507', customer: 'Rekall Corporation', quoteId: 'Q-1036', amount: 28000, status: 'Created', fulfillment: 'Pending', payment: 'Unpaid', created: '2024-09-03' },
  { id: 'o8', orderId: 'ORD-5508', customer: 'Solex Industries', quoteId: 'Q-1039', amount: 315000, status: 'Processing', fulfillment: 'Pending', payment: 'Unpaid', created: '2024-08-29' },
  { id: 'o9', orderId: 'ORD-5509', customer: 'Globex Inc', quoteId: 'Q-0990', amount: 85000, status: 'Fulfilled', fulfillment: 'Shipped', payment: 'Paid', created: '2024-08-01' },
  { id: 'o10', orderId: 'ORD-5510', customer: 'Wayne Enterprises', quoteId: 'Q-1000', amount: 190000, status: 'Cancelled', fulfillment: 'Cancelled', payment: 'Refunded', created: '2024-07-20' },
  { id: 'o11', orderId: 'ORD-5511', customer: 'Massive Dynamic', quoteId: 'Q-1010', amount: 560000, status: 'Fulfilled', fulfillment: 'Shipped', payment: 'Paid', created: '2024-07-15' },
  { id: 'o12', orderId: 'ORD-5512', customer: 'Umbrella Corp', quoteId: 'Q-1015', amount: 430000, status: 'Processing', fulfillment: 'Partially Fulfilled', payment: 'Partially Paid', created: '2024-08-05' },
  { id: 'o13', orderId: 'ORD-5513', customer: 'Stark Industries', quoteId: 'Q-1020', amount: 975000, status: 'Created', fulfillment: 'Pending', payment: 'Unpaid', created: '2024-09-05' },
  { id: 'o14', orderId: 'ORD-5514', customer: 'Oscorp Industries', quoteId: 'Q-0980', amount: 42000, status: 'Fulfilled', fulfillment: 'Shipped', payment: 'Paid', created: '2024-07-10' },
  { id: 'o15', orderId: 'ORD-5515', customer: 'Nakatomi Corp', quoteId: 'Q-0975', amount: 68000, status: 'Fulfilled', fulfillment: 'Shipped', payment: 'Overdue', created: '2024-07-01' }
];

export const initialWarehouses = [
  { id: 'wh1', name: 'Main Hub', location: 'New York, NY', manager: 'Mike Ross', capacity: '100,000 sqft', status: 'Active' },
  { id: 'wh2', name: 'East Coast DC', location: 'Newark, NJ', manager: 'Lisa Park', capacity: '75,000 sqft', status: 'Active' },
  { id: 'wh3', name: 'West Coast Hub', location: 'Los Angeles, CA', manager: 'Kevin Hart', capacity: '80,000 sqft', status: 'Active' },
  { id: 'wh4', name: 'South Hub', location: 'Dallas, TX', manager: 'James Wilson', capacity: '60,000 sqft', status: 'Active' },
  { id: 'wh5', name: 'Digital Fulfillment', location: 'Cloud / Remote', manager: 'Admin User', capacity: 'Unlimited', status: 'Active' }
];

export const initialInvoices = [
  { id: 'inv_1', invoiceId: 'INV-2024-001', customer: 'Globex Inc', order: 'ORD-5509', amount: 85000, due: '2024-08-31', status: 'Paid' },
  { id: 'inv_2', invoiceId: 'INV-2024-002', customer: 'Acme Corp', order: 'ORD-5501', amount: 540000, due: '2024-10-02', status: 'Issued' },
  { id: 'inv_3', invoiceId: 'INV-2024-003', customer: 'Weyland Industries', order: 'ORD-5503', amount: 175000, due: '2024-09-18', status: 'Paid' },
  { id: 'inv_4', invoiceId: 'INV-2024-004', customer: 'LexCorp', order: 'ORD-5504', amount: 215000, due: '2024-09-25', status: 'Paid' },
  { id: 'inv_5', invoiceId: 'INV-2024-005', customer: 'Initech Solutions', order: 'ORD-5505', amount: 47500, due: '2024-09-15', status: 'Partially Paid' },
  { id: 'inv_6', invoiceId: 'INV-2024-006', customer: 'Nakatomi Corp', order: 'ORD-5515', amount: 68000, due: '2024-07-31', status: 'Overdue' },
  { id: 'inv_7', invoiceId: 'INV-2024-007', customer: 'Acme Corp', order: 'ORD-5506', amount: 275000, due: '2024-09-11', status: 'Paid' },
  { id: 'inv_8', invoiceId: 'INV-2024-008', customer: 'Rekall Corporation', order: 'ORD-5507', amount: 28000, due: '2024-10-03', status: 'Draft' },
  { id: 'inv_9', invoiceId: 'INV-2024-009', customer: 'Solex Industries', order: 'ORD-5508', amount: 315000, due: '2024-09-28', status: 'Issued' },
  { id: 'inv_10', invoiceId: 'INV-2024-010', customer: 'Tyrell Corp', order: 'ORD-5502', amount: 345000, due: '2024-10-05', status: 'Issued' },
  { id: 'inv_11', invoiceId: 'INV-2024-011', customer: 'Massive Dynamic', order: 'ORD-5511', amount: 560000, due: '2024-08-14', status: 'Paid' },
  { id: 'inv_12', invoiceId: 'INV-2024-012', customer: 'Umbrella Corp', order: 'ORD-5512', amount: 215000, due: '2024-09-04', status: 'Partially Paid' },
  { id: 'inv_13', invoiceId: 'INV-2024-013', customer: 'Stark Industries', order: 'ORD-5513', amount: 975000, due: '2024-10-05', status: 'Draft' },
  { id: 'inv_14', invoiceId: 'INV-2024-014', customer: 'Oscorp Industries', order: 'ORD-5514', amount: 42000, due: '2024-08-09', status: 'Paid' },
  { id: 'inv_15', invoiceId: 'INV-2024-015', customer: 'Globex Inc', order: 'ORD-5512', amount: 38000, due: '2024-08-01', status: 'Overdue' }
];

export const initialNotifications = [
  { id: 'n1', title: 'Quote Q-1025 Requires Approval', type: 'Approval', recipient: 'Sarah Connor', priority: 'High', status: 'Unread', created: '2024-09-05' },
  { id: 'n2', title: 'Low Stock Alert: NAS Drive 10TB', type: 'Inventory', recipient: 'Mike Ross', priority: 'High', status: 'Unread', created: '2024-09-05' },
  { id: 'n3', title: 'Invoice INV-2024-006 Overdue', type: 'Billing', recipient: 'Jane Smith', priority: 'High', status: 'Unread', created: '2024-09-04' },
  { id: 'n4', title: 'Quote Q-1027 Submitted for Approval', type: 'Approval', recipient: 'Sarah Connor', priority: 'High', status: 'Read', created: '2024-09-04' },
  { id: 'n5', title: 'Critical: Backup Appliance BA-500 Backordered', type: 'Inventory', recipient: 'Lisa Park', priority: 'High', status: 'Unread', created: '2024-09-04' },
  { id: 'n6', title: 'New Customer: Stark Industries Onboarded', type: 'System', recipient: 'Admin User', priority: 'Medium', status: 'Read', created: '2024-09-03' },
  { id: 'n7', title: 'Quote Q-1037 Requires Finance Review', type: 'Approval', recipient: 'Jane Smith', priority: 'High', status: 'Unread', created: '2024-09-03' },
  { id: 'n8', title: 'Order ORD-5505 Partially Fulfilled', type: 'Order', recipient: 'Lisa Park', priority: 'Medium', status: 'Read', created: '2024-09-02' },
  { id: 'n9', title: 'Discount Rule Updated: Software Licenses', type: 'System', recipient: 'Admin User', priority: 'Low', status: 'Read', created: '2024-09-01' },
  { id: 'n10', title: 'User Kevin Hart Suspended', type: 'System', recipient: 'Admin User', priority: 'Medium', status: 'Read', created: '2024-08-30' },
  { id: 'n11', title: 'Invoice INV-2024-015 Overdue', type: 'Billing', recipient: 'Tom Hardy', priority: 'High', status: 'Unread', created: '2024-09-05' },
  { id: 'n12', title: 'Low Stock: Router Gateway Pro (4 units)', type: 'Inventory', recipient: 'Mike Ross', priority: 'High', status: 'Read', created: '2024-09-03' },
  { id: 'n13', title: 'Quote Q-1040 Awaiting Manager Sign-off', type: 'Approval', recipient: 'Sarah Connor', priority: 'High', status: 'Unread', created: '2024-09-05' },
  { id: 'n14', title: 'Deal Health Alert: Globex Inc — At Risk', type: 'Deal Health', recipient: 'Sarah Connor', priority: 'High', status: 'Unread', created: '2024-09-04' },
  { id: 'n15', title: 'New Order: ORD-5513 from Stark Industries', type: 'Order', recipient: 'Lisa Park', priority: 'Medium', status: 'Unread', created: '2024-09-05' },
  { id: 'n16', title: 'Quote Q-1035 Submitted by Amy Johnson', type: 'Quotation', recipient: 'Sarah Connor', priority: 'Medium', status: 'Read', created: '2024-09-05' },
  { id: 'n17', title: 'Price List Expiring: Platinum Q3 2024', type: 'System', recipient: 'Admin User', priority: 'Medium', status: 'Unread', created: '2024-09-01' },
  { id: 'n18', title: 'GPU Card AI Accelerator Low Stock', type: 'Inventory', recipient: 'Mike Ross', priority: 'High', status: 'Unread', created: '2024-09-05' },
  { id: 'n19', title: 'Quote Q-1043 Flagged — High Margin Risk', type: 'Approval', recipient: 'Jane Smith', priority: 'High', status: 'Unread', created: '2024-09-05' },
  { id: 'n20', title: 'Approval Timeout: Q-1020 Escalated', type: 'Approval', recipient: 'Admin User', priority: 'High', status: 'Read', created: '2024-09-03' }
];
