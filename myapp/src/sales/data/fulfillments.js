export const INITIAL_FULFILLMENTS = [
  {
    id: "F-3001",
    quotationId: "Q-1043", // Confirmed deal
    customerName: "TechCorp India",
    status: "Processing", // Pending, Processing, Partially Fulfilled, Fulfilled, Cancelled
    createdAt: "2026-09-02T10:00:00Z",
    updatedAt: "2026-09-03T14:30:00Z",
    items: [
      {
        id: "FI-1",
        productId: "P-001", // Enterprise License
        productName: "Enterprise Software License - Annual",
        requestedQuantity: 50,
        fulfilledQuantity: 0,
        backorderQuantity: 0,
        allocations: []
      }
    ],
    shipments: [],
    history: [
      {
        id: "FH-1",
        action: "Created",
        comment: "Fulfillment automatically initiated from Quotation Q-1043.",
        timestamp: "2026-09-02T10:00:00Z",
        actor: "System"
      }
    ]
  },
  {
    id: "F-3002",
    quotationId: "Q-1045",
    customerName: "NovaTech Solutions",
    status: "Partially Fulfilled",
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-03T16:00:00Z",
    items: [
      {
        id: "FI-2",
        productId: "P-005",
        productName: "Enterprise Server",
        requestedQuantity: 2,
        fulfilledQuantity: 1,
        backorderQuantity: 1,
        allocations: [{ warehouseId: "WH-A", quantity: 1 }]
      },
      {
        id: "FI-3",
        productId: "P-001",
        productName: "Business Laptop",
        requestedQuantity: 6,
        fulfilledQuantity: 3,
        backorderQuantity: 3,
        allocations: [{ warehouseId: "WH-A", quantity: 3 }]
      }
    ],
    shipments: [],
    history: [
      {
        id: "FH-2",
        action: "Backorder Flagged",
        comment: "Partial fulfillment staged; 4 total items marked as backorder awaiting supplier arrival.",
        timestamp: "2026-09-03T16:00:00Z",
        actor: "Warehouse System"
      }
    ]
  }
];
