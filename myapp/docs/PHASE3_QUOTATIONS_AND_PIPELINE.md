# Phase 3: Quotation Management & Sales Pipeline

Phase 3 delivered the complete **Quotation Management System + Sales Pipeline Kanban**, establishing an end-to-end Quote-to-Cash operational flow in **DealFlow360**.

---

## 🔄 The Quotation Lifecycle Flow

```text
Dashboard 
   ↓
Quotations (/quotations)
   ↓
Create Quotation (/quotations/new)
   ↓ Step 1: Select Customer Account
   ↓ Step 2: Quotation Setup & Line Item Builder
   ↓ Step 3: Review Draft Summary
   ↓
Quotation Details (/quotations/:id)
   ↓ (Inspect, Edit Pricing, Clone, or Move Stage)
   ↓
Sales Pipeline Kanban (/pipeline)
   ↓ (Track Deal Velocity across Draft → Pending Approval → Negotiation → Confirmed)
```

---

## 💾 Data Models & Persistence

### 1. Customer Database ([`src/data/customers.js`](file:///f:/odoo-dealflow/myapp/src/data/customers.js))
- Fields: `id`, `companyName`, `contactName`, `email`, `phone`, `industry`, `tier`, `paymentTerms`, `address`, `avatar`.
- Accounts: `Acme Corporation`, `NovaTech Solutions`, `GlobalSoft Industries`, `Vertex Systems`, `BluePeak Technologies`, `Horizon Dynamics`, `Vanguard Logistics`, `Helios Medical`.

### 2. Product Catalog ([`src/data/products.js`](file:///f:/odoo-dealflow/myapp/src/data/products.js))
- Presets for rapid CPQ scoping: `Cloud DealFlow Enterprise ($380/seat)`, `Security Gateway Appliance Pro ($7,200)`, `Global Data Pipeline Core ($28,000)`, `24/7 Dedicated SLA ($5,500)`, `Custom ERP Connector ($9,500)`, etc.

### 3. Quotation Schema ([`src/data/quotations.js`](file:///f:/odoo-dealflow/myapp/src/data/quotations.js))
Each quotation record contains:
```javascript
{
  id: "Q-1042",
  customerId: "CUST-001",
  customerName: "Acme Corporation",
  contactPerson: "Sarah Connor",
  contactEmail: "s.connor@acmecorp.com",
  salesRepId: "USR-001",
  salesRepName: "Alex Morgan",
  status: "Negotiation",
  stage: "negotiation", // 'draft' | 'pending_approval' | 'negotiation' | 'confirmed'
  health: "Healthy",    // 'Healthy' | 'At Risk' | 'Critical'
  riskScore: 15,
  currency: "USD",
  subtotal: 24500,
  discount: 8,          // Percentage (0-100)
  discountAmount: 1960,
  taxRate: 8,           // Percentage
  tax: 1803.2,
  total: 24343.2,
  createdAt: "2026-09-04T08:30:00Z",
  updatedAt: "2026-09-05T09:15:00Z",
  validUntil: "2026-09-25",
  paymentTerms: "Net 30",
  notes: "Customer requested 8% multi-year discount.",
  isArchived: false,
  items: [
    {
      id: "item-1",
      name: "Cloud DealFlow Enterprise (Per Seat)",
      description: "50 Enterprise Seats with Real-time CPQ Engine",
      quantity: 50,
      unitPrice: 380,
      total: 19000
    }
  ],
  activity: [
    { id: "act-1", event: "Created quotation draft", user: "Alex Morgan", date: "2026-09-04 08:30" }
  ]
}
```

---

## 🧮 Pricing Arithmetic Formulas

All calculations in [`src/context/QuotationContext.jsx`](file:///f:/odoo-dealflow/myapp/src/context/QuotationContext.jsx) follow standard accounting rules:

1. **Subtotal (Gross)**:
   $$\text{Subtotal} = \sum_{i=1}^{n} (\text{unitPrice}_i \times \text{quantity}_i)$$

2. **Discount Amount**:
   $$\text{Discount Amount} = \text{Subtotal} \times \left(\frac{\text{discount}\%}{100}\right)$$

3. **Taxable Net Amount**:
   $$\text{Taxable Amount} = \text{Subtotal} - \text{Discount Amount}$$

4. **Tax (8%)**:
   $$\text{Tax} = \text{Taxable Amount} \times \left(\frac{\text{taxRate}}{100}\right)$$

5. **Grand Total**:
   $$\text{Total} = \text{Taxable Amount} + \text{Tax}$$

---

## 📄 Pages & Workflows

### 1. Quotations Ledger (`/quotations` — [`src/pages/Quotations.jsx`](file:///f:/odoo-dealflow/myapp/src/pages/Quotations.jsx))
- **KPI Metrics Header**: `Total Quotes`, `Draft`, `Pending Approval`, `Negotiation`, `Confirmed`, `Pipeline Value`.
- **Search & Filters**: Multi-criteria search by Quote ID, Customer Name, or Sales Rep; status filters; health filters; customer account filters; date range filters.
- **Sorting Options**: `Newest First`, `Oldest First`, `Highest Value`, `Lowest Value`, `Customer A-Z`.
- **View Toggle**: Switch seamlessly between High-Density Table View ([`QuotationTable.jsx`](file:///f:/odoo-dealflow/myapp/src/components/quotations/QuotationTable.jsx)) and Responsive Card View ([`QuotationCard.jsx`](file:///f:/odoo-dealflow/myapp/src/components/quotations/QuotationCard.jsx)).
- **Actions**: View Details, Clone (Duplicate), Quick Stage Mover, Archive, and Restore.

---

### 2. 3-Step Create Quotation Wizard (`/quotations/new` — [`src/pages/CreateQuotation.jsx`](file:///f:/odoo-dealflow/myapp/src/pages/CreateQuotation.jsx))
- **Step 1: Select Customer**: Searchable customer account grid ([`CustomerSelector.jsx`](file:///f:/odoo-dealflow/myapp/src/components/quotations/CustomerSelector.jsx)).
- **Step 2: Quotation Setup & Line Items**: 
  - Currency, validity date, payment terms.
  - Interactive line item editor ([`LineItemBuilder.jsx`](file:///f:/odoo-dealflow/myapp/src/components/quotations/LineItemBuilder.jsx)) with catalog presets, quantities, unit prices, discount slider, and live arithmetic calculations.
  - Discount governance limit warnings (alerts rep if discount exceeds 15%).
- **Step 3: Review & Create Draft**: 
  - Summary review of account details, pricing arithmetic, and predicted deal health risk score.
  - Creating draft automatically adds the quote to `QuotationContext`, syncs `localStorage`, and navigates to `/quotations/:id`.

---

### 3. Quotation Details (`/quotations/:id` — [`src/pages/QuotationDetail.jsx`](file:///f:/odoo-dealflow/myapp/src/pages/QuotationDetail.jsx))
- **Stage Progress Stepper**: Interactive breadcrumb bar (`Draft` $\rightarrow$ `Pending Approval` $\rightarrow$ `Negotiation` $\rightarrow$ `Confirmed`). Clicking a stage advances the quote (subject to governance validation).
- **Inline Editing Mode**: Toggle "Edit Pricing" to modify line items, quantities, discounts, and commercial terms in place.
- **Quote Actions**: `Clone Quote` (duplicates quote with new ID in Draft state), `Archive`, `Restore`, and `Export PDF`.
- **Audit Trail**: Logs all modifications, stage movements, and creator actions with exact timestamps.

---

### 4. Sales Pipeline Kanban (`/pipeline` — [`src/pages/Pipeline.jsx`](file:///f:/odoo-dealflow/myapp/src/pages/Pipeline.jsx))
- **Dynamic Metrics Header** ([`PipelineStats.jsx`](file:///f:/odoo-dealflow/myapp/src/components/pipeline/PipelineStats.jsx)): Calculates `Total Pipeline Value`, `Active Deals`, `Negotiation Value`, `Confirmed Value`, and `Stage Win Rate` directly from the live quotations database.
- **4 Kanban Columns** ([`PipelineColumn.jsx`](file:///f:/odoo-dealflow/myapp/src/components/pipeline/PipelineColumn.jsx)): `Draft`, `Pending Approval`, `Negotiation`, and `Confirmed / Won`.
- **Kanban Deal Cards** ([`PipelineCard.jsx`](file:///f:/odoo-dealflow/myapp/src/components/pipeline/PipelineCard.jsx)): Displays Quote ID, customer, amount, health badge, valid date, and quick stage move selector.

---

## 🛡️ Stage Transition Governance Rules

To preserve enterprise business integrity, the application validates stage transitions in [`src/context/QuotationContext.jsx`](file:///f:/odoo-dealflow/myapp/src/context/QuotationContext.jsx):

| Current Stage | Target Stage | Allowed? | Reason / Rule |
| :--- | :--- | :--- | :--- |
| `Draft` | `Pending Approval` | ✅ Yes | Submits quote for manager review |
| `Draft` | `Negotiation` | ✅ Yes | Advances standard quote without extra approvals |
| `Draft` | `Confirmed` | ❌ **PROHIBITED** | **Direct jump from Draft to Confirmed is blocked**. A quote must pass intermediate review. |
| `Pending Approval` | `Negotiation` | ✅ Yes | Approval granted; sent to customer |
| `Pending Approval` | `Draft` | ✅ Yes | Returned for revision |
| `Negotiation` | `Confirmed` | ✅ Yes | Customer signed agreement; deal closed won |
| `Negotiation` | `Draft` | ✅ Yes | Major redlines requiring recalculation |
| `Confirmed` | `Negotiation` | ✅ Yes | Reopening contract for renegotiation |
