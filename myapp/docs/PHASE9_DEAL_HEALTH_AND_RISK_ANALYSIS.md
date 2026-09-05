# DEALFLOW360 — PHASE 9: DEAL HEALTH & RISK ANALYSIS

## Executive Summary
Phase 9 introduces the **Deal Health & Risk Analysis Engine**, a deterministic, rule-based risk intelligence system that synthesizes live signals across the entire sales lifecycle—from Quotation and Discount Governance, to Approvals, Customer Negotiations & Inactivity, Expiry timelines, and Warehouse Fulfillment.

**Strict Architectural Constraint:** 100% rule-based and explainable. **No AI / ML APIs or black-box predictions.**

---

## 1. Architecture & Data Flow

```text
QuotationContext ────────┐
ApprovalContext ─────────┤
Customer & Negotiation ──┤
FulfillmentContext ──────┤
BillingContext ──────────┘
           ↓
     dealHealthUtils.js
           ↓
  1. Discount Risk        (25%)
  2. Customer Engagement  (20%)
  3. Approval Delay       (15%)
  4. Negotiation Delay    (15%)
  5. Expiry Risk          (10%)
  6. Fulfillment Risk     (15%)
           ↓
  Master Risk Score (0–100)
           ↓
  Classification:
  • 0–30   → Healthy
  • 31–60  → At Risk
  • 61–100 → Critical
           ↓
  Explainable Risk Reasons (Data-Backed)
           ↓
  Next Best Action (Deterministic Mitigation)
```

---

## 2. Risk Calculation Formula & Weights

The total risk score is a deterministic sum of weighted signal components:

$$\text{Final Risk Score} = (D \times 0.25) + (CE \times 0.20) + (AD \times 0.15) + (ND \times 0.15) + (ER \times 0.10) + (FR \times 0.15)$$

### Risk Factors Breakdown

| Risk Factor | Weight | Business Input Signals | Calculation Rules |
| :--- | :---: | :--- | :--- |
| **Discount Risk** | 25% | `requestedDiscount`, `allowedDiscount` (15% standard limit), margin impact | - Discount $\le$ allowed: $0 - 20$ pts<br>- Excess discount: Base $30 + (\text{excess} \times 4.5)$ pts (capped at 100) |
| **Customer Engagement** | 20% | Days elapsed since last customer event / response | - $\le 2$ days inactive: $15$ pts (High engagement)<br>- $3-5$ days: $45$ pts<br>- $6-9$ days: $75$ pts<br>- $\ge 10$ days: $95$ pts |
| **Approval Delay** | 15% | Approval status (`Pending`, `Approved`, `Rejected`), `submittedAt` timestamp | - Approved: $5$ pts<br>- Rejected: $95$ pts<br>- Pending $\le 1$ day: $35$ pts<br>- Pending $2-3$ days: $65$ pts<br>- Pending $\ge 4$ days: $90$ pts |
| **Negotiation Delay** | 15% | `stage === 'negotiation'`, duration in negotiation stage | - Not in negotiation: $0-10$ pts<br>- Active $\le 3$ days: $30$ pts<br>- Protracted $4-7$ days: $60$ pts<br>- Stalled $\ge 8$ days: $85$ pts |
| **Expiry Risk** | 10% | `validUntil` dynamic JavaScript date difference | - Signed/Confirmed: $0$ pts<br>- $\ge 15$ days left: $10$ pts<br>- $7-14$ days left: $40$ pts<br>- $1-6$ days left: $75$ pts<br>- Expired ($\le 0$ days): $95 - 100$ pts |
| **Fulfillment Risk** | 15% | Fulfillment status, backorder quantities, inventory shortages | - Fulfilled: $0$ pts<br>- Partially fulfilled / backorders: $75$ pts<br>- Warehouse stock shortfall: $70$ pts<br>- Normal staging: $15 - 30$ pts |

---

## 3. Routes & UI Modules

### 1. `/deal-health` (Portfolio Health Matrix)
- **KPI Summary Cards**:
  - Total Analyzed Deals
  - Healthy Deals Count (0–30)
  - At Risk Deals Count (31–60)
  - Critical Deals Count (61–100)
  - Portfolio Average Risk Score & Index Gauge
- **Search & Multi-Filters**:
  - Real-time text search by quotation ID, customer name, sales rep
  - Filter by Health Classification (Healthy, At Risk, Critical)
  - Filter by Deal Stage (Draft, Pending Approval, Negotiation, Confirmed)
  - Filter by Customer & Sales Rep
  - Sort by Highest Risk, Lowest Risk, Highest Value, Lowest Value
- **Deals Table**:
  - Quotation ID, Customer & Rep, Deal Value & Discount %, Risk Score badge with visual mini-bar, Top Risk Signal with impact score, Rule-based recommended action, and "Deep Dive" trigger.

### 2. `/deal-health/:quotationId` (Deal Risk Deep-Dive)
- **Hero Risk Gauge**:
  - Circular animated risk index meter colored dynamically (green, amber, red)
  - Deal metadata (Customer, Rep, Value, Stage, Valid Until, Discount %)
  - Highlighted Next Best Action snippet
- **6 Risk Signal Breakdown Cards**:
  - Dedicated meter for Discount Risk, Customer Engagement, Approval Delay, Negotiation Delay, Expiry Risk, and Fulfillment Risk.
  - Shows exact raw score (0–100), weight %, weighted contribution points, and explanatory business rationale.
- **Data-Backed Risk Reasons List**:
  - Categorized observations (Critical, Warning, Healthy) linking directly to live data properties.
- **Next Best Action Card**:
  - Direct single-click mitigation buttons routing to the relevant subsystem (`/approvals`, `/quotations/:id/builder`, `/fulfillment`).
- **Activity & Governance History**:
  - Chronological audit log of customer interactions and commercial revisions.

### 3. Dashboard Integration (`/dashboard`)
- Upgraded the **Deal Health & AI Risk Scoring** dashboard widget to compute live metrics from `QuotationContext`, `ApprovalContext`, and `FulfillmentContext`.
- Added clickable links to `/deal-health` and direct inspection of flagged critical deals.

---

## 4. Role-Based Access Control (RBAC)

| Role | Access Level | Restrictions |
| :--- | :--- | :--- |
| **Sales Rep** | View Deal Health, Factors, Reasons & Recommended Actions | Restricted to authorized workspace deals |
| **Sales Manager** | Full Portfolio Health view, monitoring & review | Full access |
| **Finance** | Full access to financial and discount risk breakdowns | Full access |
| **Admin** | Unrestricted access across all deals and configurations | Full access |
| **Customer** | **NO ACCESS** | Blocked via `ProtectedRoute` (returns unauthorized view). Customers cannot view internal risk scores or analysis. |

---

## 5. Sidebar Navigation Updates
- **Added**: `Deal Health` (`/deal-health`) with the `Activity` icon for Sales Rep, Sales Manager, Finance, and Admin.
- **Removed**: `Warehouses` (`/warehouses`) removed from the sidebar navigation as per instructions.
