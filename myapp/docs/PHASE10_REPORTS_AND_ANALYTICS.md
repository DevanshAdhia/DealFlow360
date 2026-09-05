# DEALFLOW360 — PHASE 10: REPORTS & ANALYTICS

## Executive Summary
Phase 10 introduces the enterprise **Reports & Business Intelligence module** for DealFlow360.
The system synthesizes live data from every stage of the sales pipeline (Quotations, Discount Governance, Approvals, Negotiations, Fulfillments, Billing & Subscriptions, and Deal Health) into reactive, multi-dimensional executive insights.

**Core Rules Followed:**
- **Zero hard-coded values:** All KPIs and chart datasets are calculated deterministically in JavaScript.
- **Visuals powered by Recharts** with responsive containers and tooltips.
- Global multi-criteria filters that dynamically recalculate every metric without requiring a page reload.
- Full CSV export and print-ready formats for management reviews.

---

## 1. Master 9 KPIs

| KPI Metric | Calculation Source | Formula / Logic |
| :--- | :--- | :--- |
| **Total Revenue** | `BillingContext` | Sum of all `Paid` invoices in the filtered pool |
| **Pipeline Value** | `QuotationContext` | Sum of all active, unconfirmed quotations (`stage !== 'confirmed'`) |
| **Confirmed Deals** | `QuotationContext` | Count and sum total of all won contracts (`stage === 'confirmed'`) |
| **Conversion Rate** | `QuotationContext` | $(\text{Won Deals} / \text{Total Non-Archived Deals}) \times 100$ |
| **Average Deal Value** | `QuotationContext` | $\text{Total Confirmed Value} / \text{Confirmed Deals Count}$ |
| **Pending Approvals** | `ApprovalContext` | Count of discount proposals in `Pending` state |
| **Fulfillment Rate** | `FulfillmentContext` | $(\sum \text{Fulfilled Units} / \sum \text{Requested Units}) \times 100$ |
| **Active Subscriptions** | `BillingContext` | Count of recurring contracts in `Active` status |
| **Monthly Recurring Revenue (MRR)** | `BillingContext` | Normalized monthly equivalent across Monthly, Quarterly, and Annual billing cycles |

---

## 2. Global Multi-Criteria Filtering

Every chart and metric responds synchronously to 6 simultaneous global filter criteria:
1. **Date Range**: All Time, Past 7 Days, Past 30 Days, Past 90 Days, This Year
2. **Customer Account**: Filter by specific corporate buyer
3. **Sales Representative**: Filter by individual quota holder
4. **Product Line**: Filter by specific product or service catalog SKU
5. **Deal Stage / Status**: Filter by Draft, Pending Approval, Negotiation, Confirmed
6. **Deal Health**: Filter by Healthy (0–30), At Risk (31–60), Critical (61–100)

---

## 3. Dedicated Report Domains (Tabs)

### 1. Sales Report
- **Monthly Revenue Trend (`LineChart`)**: Tracks cash inflow from paid invoices across the trailing 6 months.
- **Pipeline by Stage (`BarChart`)**: Visualizes monetary pipeline volume across Draft, Pending Approval, Negotiation, and Confirmed milestones.
- **Deals Distribution by Status (`PieChart`)**: Volume share across quotation statuses.
- **Sales Rep Performance (`BarChart`)**: Horizontal comparative ranking of revenue closed per representative.

### 2. Customer Report
- **Customer Portfolio Analysis Table**: Comprehensive breakdown of Total Quotes, Win Rate %, Pipeline Value, Confirmed Contract Value, Realized Paid Revenue, and Average Contract Size per account.

### 3. Product Report
- **Catalog Performance & Velocity Table**: Units sold, total revenue realization, and average discount applied per catalog product item.

### 4. Deal Health Report
- **Portfolio Health Distribution (`PieChart`)**: Proportion of portfolio in Healthy, At Risk, and Critical states.
- **Risk Factor Impact (`BarChart`)**: Detailed breakdown of average risk scores across Discount, Customer Inactivity, Approval Delay, Negotiation Delay, Expiry, and Fulfillment.

### 5. Financial Report
- **Payment Collection Status (`PieChart`)**: Real-time breakdown of Paid vs Pending vs Overdue accounts receivable.
- **Revenue Streams Split (`BarChart`)**: One-time transaction revenue vs Annualized Recurring SaaS revenue.

### 6. Operational Report
- **Fulfillment Order Status (`PieChart`)**: Fulfilled vs Partially Fulfilled vs Processing staging.
- **Warehouse Performance (`BarChart` & Matrix)**: Allocation and dispatch metrics across `WH-A`, `WH-B`, `WH-C`, and `WH-D`.
- **Approval SLA Analytics (`PieChart` & `BarChart`)**: Decision rates, average turnaround days, and routing role distributions.

### 7. Discount Governance Report
- **Discount Leakage Log**: Line-by-line inspection of requested discount vs standard 15% threshold, excess concession %, discount value in INR, and formal approval status.

---

## 4. Routes & RBAC Integration
- **Routes**:
  - `/reports`: Master analytics and reporting dashboard.
  - `/analytics`: Direct alias pointing to the full analytics module.
- **Role Permissions**: Accessible to `sales_rep`, `sales_manager`, `finance`, and `admin`. Customers are protected and restricted.
- **Exporting**: One-click **Export CSV** downloads active calculated data rows, and **Print Report** formats the view for PDF/paper review.
