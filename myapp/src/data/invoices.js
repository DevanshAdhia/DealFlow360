export const INITIAL_INVOICES = [
  {
    id: "INV-2026-001",
    quotationId: "Q-1042",
    fulfillmentId: "F-2099",
    customerId: "CUST-001",
    customerName: "Acme Corporation",
    items: [
      {
        id: "P-001",
        name: "Enterprise Software License - Annual",
        category: "Software",
        billingType: "recurring",
        billingCycle: "Yearly",
        quantity: 50,
        unitPrice: 15000,
        gstRate: 0.18
      },
      {
        id: "P-004",
        name: "Professional Onboarding Services",
        category: "Service",
        billingType: "one-time",
        quantity: 1,
        unitPrice: 50000,
        gstRate: 0.18
      }
    ],
    recurringItemsDetails: [
      {
        id: "P-001",
        name: "Enterprise Software License - Annual",
        category: "Software",
        billingType: "recurring",
        billingCycle: "Yearly",
        quantity: 50,
        unitPrice: 15000
      }
    ],
    subtotal: 800000,
    discount: 80000,
    taxableAmount: 720000,
    gst: 129600,
    total: 849600,
    status: "Paid",
    issueDate: "2026-08-15T10:00:00Z",
    dueDate: "2026-09-14T10:00:00Z",
    paymentDate: "2026-08-20T14:30:00Z",
    paymentMethod: "Bank Transfer",
    history: [
      { id: "IH-1", action: "Issued", comment: "Invoice generated for fulfilled order.", timestamp: "2026-08-15T10:00:00Z", actor: "System" },
      { id: "IH-2", action: "Paid", comment: "Payment received via Bank Transfer.", timestamp: "2026-08-20T14:30:00Z", actor: "Finance" }
    ]
  },
  {
    id: "INV-2026-002",
    quotationId: "Q-1045",
    fulfillmentId: "F-2100",
    customerId: "CUST-001",
    customerName: "Acme Corporation",
    items: [
      {
        id: "P-BL-001",
        name: "Business Laptop (ThinkPad X1)",
        category: "Hardware",
        billingType: "one-time",
        quantity: 1,
        unitPrice: 80000,
        gstRate: 0.18
      },
      {
        id: "P-CRM-001",
        name: "CRM Enterprise License",
        category: "Software",
        billingType: "recurring",
        billingCycle: "Yearly",
        quantity: 1,
        unitPrice: 20000,
        gstRate: 0.18
      },
      {
        id: "P-CS-001",
        name: "Cloud Storage Pro (500 GB)",
        category: "Cloud",
        billingType: "recurring",
        billingCycle: "Monthly",
        quantity: 1,
        unitPrice: 2000,
        gstRate: 0.18
      }
    ],
    recurringItemsDetails: [
      {
        id: "P-CRM-001",
        name: "CRM Enterprise License",
        category: "Software",
        billingType: "recurring",
        billingCycle: "Yearly",
        quantity: 1,
        unitPrice: 20000
      },
      {
        id: "P-CS-001",
        name: "Cloud Storage Pro (500 GB)",
        category: "Cloud",
        billingType: "recurring",
        billingCycle: "Monthly",
        quantity: 1,
        unitPrice: 2000
      }
    ],
    subtotal: 102000,
    discount: 5100,
    taxableAmount: 96900,
    gst: 17442,
    total: 114342,
    status: "Issued",
    issueDate: "2026-09-01T09:00:00Z",
    dueDate: "2026-10-01T09:00:00Z",
    paymentDate: null,
    paymentMethod: null,
    history: [
      { id: "IH-3", action: "Issued", comment: "Invoice generated from fulfilled order F-2100.", timestamp: "2026-09-01T09:00:00Z", actor: "System" }
    ]
  },
  {
    id: "INV-2026-003",
    quotationId: "Q-1038",
    fulfillmentId: "F-2097",
    customerId: "CUST-002",
    customerName: "TechVenture Solutions",
    items: [
      {
        id: "P-002",
        name: "Cloud Infrastructure Setup",
        category: "Cloud",
        billingType: "one-time",
        quantity: 1,
        unitPrice: 120000,
        gstRate: 0.18
      }
    ],
    recurringItemsDetails: [],
    subtotal: 120000,
    discount: 12000,
    taxableAmount: 108000,
    gst: 19440,
    total: 127440,
    status: "Overdue",
    issueDate: "2026-07-01T10:00:00Z",
    dueDate: "2026-07-31T10:00:00Z",
    paymentDate: null,
    paymentMethod: null,
    history: [
      { id: "IH-5", action: "Issued", comment: "Invoice issued.", timestamp: "2026-07-01T10:00:00Z", actor: "System" },
      { id: "IH-6", action: "Overdue", comment: "Payment due date passed without receipt.", timestamp: "2026-08-01T00:00:00Z", actor: "System" }
    ]
  },
  {
    id: "INV-2026-004",
    quotationId: "Q-1036",
    fulfillmentId: "F-2095",
    customerId: "CUST-003",
    customerName: "Global Retail Group",
    items: [
      {
        id: "P-003",
        name: "ERP Implementation Services",
        category: "Service",
        billingType: "one-time",
        quantity: 1,
        unitPrice: 250000,
        gstRate: 0.18
      }
    ],
    recurringItemsDetails: [],
    subtotal: 250000,
    discount: 25000,
    taxableAmount: 225000,
    gst: 40500,
    total: 265500,
    status: "Partially Paid",
    issueDate: "2026-08-01T10:00:00Z",
    dueDate: "2026-09-01T10:00:00Z",
    paymentDate: "2026-08-15T12:00:00Z",
    paymentMethod: "UPI",
    amountPaid: 132750,
    history: [
      { id: "IH-7", action: "Issued", comment: "Invoice issued.", timestamp: "2026-08-01T10:00:00Z", actor: "System" },
      { id: "IH-8", action: "Partially Paid", comment: "₹1,32,750 received via UPI. Balance outstanding.", timestamp: "2026-08-15T12:00:00Z", actor: "Finance" }
    ]
  },
  {
    id: "INV-2026-005",
    quotationId: "Q-1033",
    fulfillmentId: "F-2090",
    customerId: "CUST-004",
    customerName: "Sunrise Hospitality",
    items: [
      {
        id: "P-005",
        name: "POS Hardware Bundle",
        category: "Hardware",
        billingType: "one-time",
        quantity: 5,
        unitPrice: 18000,
        gstRate: 0.12
      }
    ],
    recurringItemsDetails: [],
    subtotal: 90000,
    discount: 9000,
    taxableAmount: 81000,
    gst: 9720,
    total: 90720,
    status: "Cancelled",
    issueDate: "2026-08-10T10:00:00Z",
    dueDate: "2026-09-09T10:00:00Z",
    paymentDate: null,
    paymentMethod: null,
    history: [
      { id: "IH-9", action: "Issued", comment: "Invoice issued.", timestamp: "2026-08-10T10:00:00Z", actor: "System" },
      { id: "IH-10", action: "Cancelled", comment: "Customer requested cancellation — order revoked.", timestamp: "2026-08-12T09:00:00Z", actor: "Finance" }
    ]
  }
];
