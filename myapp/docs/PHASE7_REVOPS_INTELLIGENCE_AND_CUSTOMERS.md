# Phase 7: RevOps Intelligence, Customer Accounts & System Governance

Phase 7 delivered executive revenue analytics, interactive chart visualizations, centralized customer accounts management, and enterprise governance controls (`/reports`, `/customers`, and `/settings`).

---

## 📊 Analytics & Reporting Engine (`/reports`)

Built using **Recharts** and configured in [`src/utils/analyticsUtils.js`](file:///f:/odoo-dealflow/myapp/src/utils/analyticsUtils.js):

### 1. Key Performance Indicators (KPIs)
- **Gross Invoiced Revenue**: Total billed amount across paid and active invoices.
- **Active Pipeline Value**: Sum of all unclosed deals across Draft, Pending Approval, and Negotiation stages.
- **Conversion / Win Rate**: Ratio of closed-won quotations to total submitted quotations.
- **Average Deal Value (ACV)**: Mean value per transaction in Indian Rupees (INR ₹).
- **Approval Turnaround Rate**: Percentage of exception requests resolved within SLA.
- **Monthly Recurring Revenue (MRR)**: Active annualized run rate across active SaaS contracts.

### 2. Interactive Visualizations
- **Monthly Revenue Trend**: Multi-bar / line comparison of billed vs collected revenue over time.
- **Pipeline Stage Distribution**: Breakdown of deal values and volumes across pipeline phases.
- **Deal Health Risk Donut**: Proportion of healthy, at-risk, and critical deals.
- **Sales Rep Performance Matrix**: Leaderboard ranking reps by closed quota attainment.
- **Top Products by Revenue**: Volume and revenue analysis per catalog line item.

---

## 👥 Customer Accounts & Directory (`/customers`)

- **Enterprise Customer Directory**: Complete account profiles with GSTIN, location, credit limits, and contact information.
- **Linked Deals Ledger**: Direct integration with `QuotationContext` displaying all past and current deals for each account.
- **Quick Scoping Action**: Direct one-click quote generation for any customer.
- **Account Creation**: Add new enterprise clients directly to the directory with automatic validation and persistence.

---

## ⚙️ Enterprise Settings & Governance (`/settings`)

- **Discount Escalation Rules**: Configurable multi-tier thresholds with live sliders (Auto-approved, Manager review, Finance review).
- **Role-Based Access Control (RBAC)**: Comprehensive matrix detailing access levels for Sales Reps, Managers, Finance, Customers, and Administrators.
- **Localization Engine**: Configurable currency formatting (INR ₹ default with Lakhs/Crores grouping), GST tax rates, and corporate legal entity details.
- **Audit & Demo Controls**: Full audit snapshot JSON export and one-click demo sandbox data reset.
