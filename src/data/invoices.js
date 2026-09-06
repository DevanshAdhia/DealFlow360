export const INITIAL_INVOICES = [
  {
    id: 'INV-904',
    invoiceNumber: 'INV-904',
    quotationId: 'Q-1042',
    fulfillmentId: 'FO-1042',
    customerId: 'CUST-0001',
    customerName: 'Acme Global Ltd',
    customerCompany: 'Acme Global Ltd',
    amount: 4850000,
    total: 4850000,
    subtotal: 4110169,
    tax: 739831,
    status: 'Issued',
    issueDate: '2026-09-01T10:00:00Z',
    dueDate: '2026-10-01T10:00:00Z',
    paymentMethod: 'Bank Wire',
    items: [
      { id: '1', productName: 'Dell PowerEdge R750 Enterprise Server', sku: 'HW-SRV-750', unitPrice: 2800000, quantity: 1, total: 2800000 },
      { id: '2', productName: 'Cisco Catalyst 9300 48-Port Switch', sku: 'NW-SW-9300', unitPrice: 1250000, quantity: 1, total: 1250000 },
      { id: '3', productName: 'Enterprise Security & SLA Support Pack', sku: 'SV-SLA-ENT', unitPrice: 800000, quantity: 1, total: 800000 }
    ],
    history: [
      { id: 'IH-1', action: 'Issued', comment: 'Invoice generated from fulfilled order.', timestamp: '2026-09-01T10:00:00Z', actor: 'System' }
    ]
  },
  {
    id: 'INV-905',
    invoiceNumber: 'INV-905',
    quotationId: 'Q-1041',
    fulfillmentId: 'FO-1041',
    customerId: 'CUST-0002',
    customerName: 'Nexus Tech Systems',
    customerCompany: 'Nexus Tech Systems',
    amount: 2400000,
    total: 2400000,
    subtotal: 2033898,
    tax: 366102,
    status: 'Paid',
    issueDate: '2026-08-28T14:30:00Z',
    dueDate: '2026-09-28T14:30:00Z',
    paymentDate: '2026-09-02T11:00:00Z',
    paymentMethod: 'NEFT / RTGS',
    items: [
      { id: '1', productName: 'Dell PowerEdge R750 Enterprise Server', sku: 'HW-SRV-750', unitPrice: 2400000, quantity: 1, total: 2400000 }
    ],
    history: [
      { id: 'IH-2', action: 'Paid', comment: 'Full payment received via NEFT.', timestamp: '2026-09-02T11:00:00Z', actor: 'Finance Dept' }
    ]
  },
  {
    id: 'INV-906',
    invoiceNumber: 'INV-906',
    quotationId: 'Q-1040',
    fulfillmentId: 'FO-1040',
    customerId: 'CUST-0003',
    customerName: 'Stark Enterprises',
    customerCompany: 'Stark Enterprises',
    amount: 8900000,
    total: 8900000,
    subtotal: 7542372,
    tax: 1357628,
    status: 'Overdue',
    issueDate: '2026-08-01T09:00:00Z',
    dueDate: '2026-08-31T09:00:00Z',
    paymentMethod: 'Corporate Credit',
    items: [
      { id: '1', productName: 'Enterprise Cloud Infrastructure Pack', sku: 'SW-CLD-ENT', unitPrice: 8900000, quantity: 1, total: 8900000 }
    ],
    history: [
      { id: 'IH-3', action: 'Overdue', comment: 'Payment overdue past 30 days notice.', timestamp: '2026-09-01T00:00:00Z', actor: 'System' }
    ]
  }
];
