# Phase 5: Multi-Warehouse Fulfillment, Stock Integrity & Backorder Logistics

Phase 5 delivers the enterprise **DealFlow360 Fulfillment Module**, featuring deterministic multi-warehouse inventory allocation, split-routing algorithms, manual overrides, backorder replenishment tracking, and live restock detection.

---

## 🏗️ Architecture & Relational Data Flow

```text
Approved Quotation (quotations.json)
        ↓
Order (orders.json)
        ↓
Order Items (orderItems.json)
        ↓
Inventory Check: available = onHandQty - reservedQty (inventory.json)
        ↓
Automatic Split Engine: calculateSuggestedSplit() (greedy fewest hubs, lowest shipping cost)
        ↓
Screen 7: Fulfillment and Stock (List) (/fulfillment)
        ↓ (Row click: passes orderId only)
Screen 8: Fulfillment Detail (/fulfillment/:id)
   ┌────────────────────────────────┴────────────────────────────────┐
   ↓                                                                 ↓
[ Accept Suggested Split ]                                 [ Manual Override ]
   ↓                                                                 ↓
Update Reserved Stock & Status                               Validate Stock & Order Limits
   ↓                                                                 ↓
If Shortage: Backorder (backorders.json)                   Recalculate State
   ↓
Restock Inbound Arrival (e.g. +4 East Depot)
   ↓
Restock Detection Engine: "4 units are now available at East Depot."
   ↓
[ Consolidate Remaining Backorder ]
   ↓
Backorder = 0, Status = FULFILLED (COMPLETE)
```

---

## 📂 Entity Relational Schema

| Entity | Relational Key | Foreign Key Target | Description |
| :--- | :--- | :--- | :--- |
| `orders` | `quotationId` | `quotations.id` | Order header generated from approved quotation |
| `orders` | `customerId` | `customers.id` | Purchasing enterprise account |
| `orderItems` | `orderId` | `orders.id` | Line items belonging to the sales order |
| `orderItems` | `productId` | `products.id` | Catalog item specification |
| `inventory` | `warehouseId` | `warehouses.id` | Facility physical stock level |
| `inventory` | `productId` | `products.id` | Stocked item reference |
| `fulfillmentOrders` | `orderId` | `orders.id` | Fulfillment execution tracking record |
| `fulfillmentItems` | `fulfillmentOrderId`| `fulfillmentOrders.id`| Line-level warehouse allocation assignment |
| `fulfillmentItems` | `warehouseId` | `warehouses.id` | Originating physical shipping facility |
| `fulfillmentItems` | `orderItemId` | `orderItems.id` | Linked purchase order line |
| `backorders` | `orderId` | `orders.id` | Outstanding unfulfilled quantity tracking |
| `backorders` | `orderItemId` | `orderItems.id` | Line item under shortage |

---

## ⚙️ Core Engines & Services

### 1. Automatic Split Engine (`fulfillmentService.js`)
- **Greedy Minimum Hops**: Evaluates if a single warehouse can fulfill 100% with the lowest shipping cost. Otherwise, greedy-packs by descending available stock.
- **Stock Integrity**: Enforces `available = onHandQty - reservedQty`. Never allocates phantom or reserved stock.
- **Cost Minimization**: Accumulates shipping cost across involved warehouses based on `shippingCostBase`.
- **Automatic Backorder Generation**: Remaining unfulfilled demand seamlessly produces an `OPEN` backorder record.

### 2. Manual Override Engine (`fulfillmentService.js` & `ManualOverrideModal.jsx`)
- Permits Operations users to customize allocation quantities per warehouse.
- **Validations**:
  1. Negative quantities disallowed.
  2. Allocation per warehouse cannot exceed its available stock (`onHandQty - reservedQty`).
  3. Total allocated quantity cannot exceed ordered quantity.
  4. Remaining quantity is tracked into backorders.

### 3. Restock Detection & Consolidation Engine (`backorderService.js`)
- Watches inventory mutations.
- When `availableStock >= pendingBackorder`, triggers real-time banner:
  `"${requiredQty} units are now available at ${warehouseName}."`
- **Consolidation**: 1-click execution to reserve inbound stock, increment fulfillment items, clear the backorder, and transition the order to `FULFILLED`.

---

## 🖥️ Screen Reference

### Screen 7 — Fulfillment and Stock (List) (`/fulfillment`)
- **Header**: "Fulfillment and Stock (List)"
- **Subtitle**: *"Live stock per warehouse, plus every order that still needs fulfillment."*
- **KPI Metrics**: Awaiting Orders, Active Warehouses, Total / Reserved Stock, Open Backorders.
- **Orders Awaiting Fulfillment**: Displays `SO-1042 | Acme Corp | Split Pending | Main + East`.
- **Live Stock Table**: Displays Warehouse, Product, In Stock, Reserved, Available, and Status with search and filter controls.

### Screen 8 — Fulfillment Detail (`/fulfillment/:id`)
- **Header**: Order Number, Customer, Status badge, Quotation reference, Shipping Address.
- **5-Metric Summary Cards**: Total Shipments, Shipping Cost, Fulfilled Quantity, Pending Quantity, Backorder Quantity.
- **Actions**: `[ Accept Suggested Split ]` and `[ Manual Override ]` gated by Operations role.
- **Stock Allocation Table**: Warehouse, Product, Ordered, Allocated, Qty Fulfilled, Pending, Estimated Shipments, Cost.
- **Interactive Scenarios**:
  - `24 Units`: Full split across Main (22) + East (2) with 2 shipments and $300 shipping.
  - `30 Units`: Shortage creating 4 backordered units.
  - `+4 Restock (East)`: Inbound replenishment triggering instant consolidation prompt.
