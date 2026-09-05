// DealFlow360 — Product Catalog & Service Packages (Admin-Configured Mock Data)

export const MOCK_PRODUCTS = [
  {
    id: 'PROD-001',
    productCode: 'PRD-CF-ENT',
    name: 'Cloud DealFlow Enterprise (Per Seat)',
    category: 'Software Subscription',
    description: 'Full-featured Quote-to-Cash SaaS license including CPQ engine & real-time governance.',
    unitPrice: 3200,
    costPrice: 1200,
    unit: 'Seat / Month',
    defaultQty: 25,
    minMargin: 35,
    gstRate: 18,
    isSubscription: true
  },
  {
    id: 'PROD-002',
    productCode: 'PRD-SEC-GATE',
    name: 'Security Gateway Appliance Pro',
    category: 'Hardware Infrastructure',
    description: 'Dedicated enterprise security hardware module with hardware-level encryption.',
    unitPrice: 185000,
    costPrice: 110000,
    unit: 'Appliance',
    defaultQty: 2,
    minMargin: 28,
    gstRate: 18,
    isSubscription: false
  },
  {
    id: 'PROD-003',
    productCode: 'PRD-CORE-PIPE',
    name: 'Global Data Pipeline Core Engine',
    category: 'Platform Core',
    description: 'High-throughput event streaming & multi-region database synchronization hub.',
    unitPrice: 750000,
    costPrice: 420000,
    unit: 'Cluster License',
    defaultQty: 1,
    minMargin: 40,
    gstRate: 18,
    isSubscription: true
  },
  {
    id: 'PROD-004',
    productCode: 'PRD-SLA-SUPP',
    name: '24/7 Dedicated SLA Support Tier',
    category: 'Premium Support',
    description: '15-minute response time SLA, dedicated Technical Account Manager, and custom escalation tree.',
    unitPrice: 140000,
    costPrice: 60000,
    unit: 'Annual Package',
    defaultQty: 1,
    minMargin: 50,
    gstRate: 18,
    isSubscription: true
  },
  {
    id: 'PROD-005',
    productCode: 'PRD-ERP-CONN',
    name: 'Custom ERP Connector & Advisory Pack',
    category: 'Professional Services',
    description: '40 hours of solutions engineering for custom ERP/CRM webhook integration.',
    unitPrice: 240000,
    costPrice: 120000,
    unit: 'Project Pack',
    defaultQty: 1,
    minMargin: 45,
    gstRate: 18,
    isSubscription: false
  },
  {
    id: 'PROD-006',
    productCode: 'PRD-IOT-SENS',
    name: 'Fleet Telemetry Edge Sensor Units',
    category: 'IoT Hardware',
    description: 'Ruggedized IoT GPS and vibration sensor kit for multi-warehouse asset monitoring.',
    unitPrice: 14500,
    costPrice: 8500,
    unit: 'Sensor Kit',
    defaultQty: 10,
    minMargin: 30,
    gstRate: 18,
    isSubscription: false
  },
  {
    id: 'PROD-007',
    productCode: 'PRD-ANALYTICS-AI',
    name: 'DealFlow AI Predictive Analytics Module',
    category: 'Software Add-on',
    description: 'Machine learning module for predictive deal health and win-rate forecasting.',
    unitPrice: 8500,
    costPrice: 2000,
    unit: 'Module / Month',
    defaultQty: 1,
    minMargin: 60,
    gstRate: 18,
    isSubscription: true
  },
  {
    id: 'PROD-008',
    productCode: 'PRD-MIGRATE-ENT',
    name: 'Enterprise Data Migration Service',
    category: 'Professional Services',
    description: 'White-glove migration of legacy CRM and ERP data into the DealFlow ecosystem.',
    unitPrice: 350000,
    costPrice: 180000,
    unit: 'Project',
    defaultQty: 1,
    minMargin: 40,
    gstRate: 18,
    isSubscription: false
  },
  {
    id: 'PROD-009',
    productCode: 'PRD-TRAINING-PKG',
    name: 'On-Site Team Enablement Training',
    category: 'Professional Services',
    description: '3-day on-site training bootcamp for sales reps and RevOps administrators.',
    unitPrice: 120000,
    costPrice: 40000,
    unit: 'Bootcamp',
    defaultQty: 1,
    minMargin: 55,
    gstRate: 18,
    isSubscription: false
  },
  {
    id: 'PROD-010',
    productCode: 'PRD-SEC-AUDIT',
    name: 'Annual Security & Compliance Audit',
    category: 'Consulting',
    description: 'Comprehensive annual security audit by certified professionals (SOC2, ISO27001 readiness).',
    unitPrice: 250000,
    costPrice: 150000,
    unit: 'Audit',
    defaultQty: 1,
    minMargin: 35,
    gstRate: 18,
    isSubscription: false
  }
];

export const getProductById = (id) => {
  return MOCK_PRODUCTS.find(p => p.id === id || p.id === id.replace('P-', 'PROD-00')) || MOCK_PRODUCTS[0];
};
