# Phase 6: Billing, Invoicing & Subscription Ledger

Phase 6 implemented the financial engine of **DealFlow360**, covering tax-compliant invoices, automated payment collection workflows, and recurring SaaS subscription management (`/billing`, `/invoices`, `/invoices/:id`, and `/subscriptions`).

---

## 💳 Billing Engine & Architecture

All billing entities are managed centrally in [`src/context/BillingContext.jsx`](file:///f:/odoo-dealflow/myapp/src/context/BillingContext.jsx):
- **Invoices**: GST-compliant tax invoices generated directly from Confirmed Quotations or Fulfillment Orders.
- **Subscriptions**: Recurring revenue contracts (MRR / ARR) with automated billing intervals (Monthly, Quarterly, Annually).
- **Payment Reconciliation**: Records full or partial payments, transaction references, and payment methods (NEFT/RTGS, UPI, Corporate Card).

---

## 📑 Invoicing Workflow & Indian GST Rules

1. **Tax Invoice Generation**:
   - Computes CGST (9%) + SGST (9%) for intra-state or IGST (18%) for inter-state transactions.
   - Embeds Customer GSTIN, Corporate GSTIN, and unique HSN/SAC codes.
2. **Aging & Statuses**:
   - `Draft`: Editable provisional invoice.
   - `Issued / Sent`: Active invoice awaiting customer settlement.
   - `Partially Paid`: Partial payment registered against total balance.
   - `Paid`: Balance cleared.
   - `Overdue`: Passed payment due date without full settlement.

---

## 📄 Key Pages & Modules

### 1. Billing Overview (`/billing` — [`src/pages/Billing.jsx`](file:///f:/odoo-dealflow/myapp/src/pages/Billing.jsx))
- Executive financial summary: `Total Invoiced`, `Outstanding Receivables`, `Collected Revenue`, and `Active MRR`.
- Recent invoices feed and active subscription alerts.

### 2. Invoices Ledger (`/invoices` — [`src/pages/Invoices.jsx`](file:///f:/odoo-dealflow/myapp/src/pages/Invoices.jsx))
- High-density table of all invoices with search, status filters, customer filters, and payment recording modals.

### 3. Tax Invoice Detail (`/invoices/:id` — [`src/pages/InvoiceDetail.jsx`](file:///f:/odoo-dealflow/myapp/src/pages/InvoiceDetail.jsx))
- Printable, tax-compliant invoice layout with corporate branding, tax breakups, bank details, and digital signature block.

### 4. Subscription Ledger (`/subscriptions` — [`src/pages/Subscriptions.jsx`](file:///f:/odoo-dealflow/myapp/src/pages/Subscriptions.jsx))
- SaaS recurring contract tracker with automatic next billing date calculation, pause/resume, and churn prevention.
