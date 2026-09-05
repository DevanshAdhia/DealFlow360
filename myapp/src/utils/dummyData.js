export const DUMMY_CUSTOMERS = [
  {
    id: "CUS-1001",
    customerCode: "ACME-001",
    companyName: "Acme Corporation",
    industry: "Technology",
    contactName: "Wile E. Coyote",
    email: "wile@acme.corp",
    customerTierId: "TIER-2",
    paymentTerms: "Net 30"
  },
  {
    id: "CUS-1002",
    customerCode: "GLB-002",
    companyName: "Global Tech Solutions",
    industry: "Enterprise Software",
    contactName: "Jane Doe",
    email: "jane.doe@globaltech.com",
    customerTierId: "TIER-1",
    paymentTerms: "Net 60"
  }
];

export const DUMMY_TIERS = [
  {
    id: "TIER-1",
    name: "Enterprise",
    priceListId: "PL-01",
    defaultPaymentTerms: "Net 60",
    maxRepDiscount: 20
  },
  {
    id: "TIER-2",
    name: "Mid-Market",
    priceListId: "PL-02",
    defaultPaymentTerms: "Net 30",
    maxRepDiscount: 10
  }
];

export const DUMMY_USERS = [
  {
    id: "USR-001",
    name: "Alex Morgan",
    email: "alex.morgan@dealflow360.com",
    role: "Sales Representative"
  }
];

export const DUMMY_CATEGORIES = [
  {
    id: "CAT-1",
    name: "Software Subscriptions",
    code: "SW_SUB"
  }
];

export const DUMMY_PRODUCTS = [
  {
    id: "PROD-101",
    name: "Enterprise Cloud ERP",
    categoryId: "CAT-1",
    description: "Full suite cloud ERP solution for large enterprises.",
    unitPrice: 150000,
    costPrice: 90000,
    defaultQty: 1
  },
  {
    id: "PROD-102",
    name: "Analytics Pro Add-on",
    categoryId: "CAT-1",
    description: "Advanced analytics and AI forecasting module.",
    unitPrice: 25000,
    costPrice: 10000,
    defaultQty: 1
  },
  {
    id: "PROD-103",
    name: "Standard Support Package",
    categoryId: "CAT-1",
    description: "24/7 technical support and SLA guarantee.",
    unitPrice: 12000,
    costPrice: 5000,
    defaultQty: 1
  }
];

export const DUMMY_PRICE_LISTS = [
  {
    id: "PL-01",
    customerTierId: "TIER-1",
    multiplier: 0.85 
  },
  {
    id: "PL-02",
    customerTierId: "TIER-2",
    multiplier: 1.0 
  }
];
