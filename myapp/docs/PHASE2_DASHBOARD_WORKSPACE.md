# Phase 2: Sales Rep Dashboard / Workspace

Phase 2 constructed the **Sales Rep Dashboard / Workspace** (`/dashboard`), transforming the application from a shell into a data-driven operational cockpit.

---

## 🎯 Workspace Philosophy

```text
Login → Sales Rep Dashboard → Understand Sales Situation → Take Action
```

The Sales Rep workspace allows account executives to instantly evaluate pipeline health, spot high-risk discount concessions, resolve pending approval bottlenecks, and monitor quota attainment.

---

## 🧩 Component Suite ([`src/components/dashboard/`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/))

### 1. `DashboardHeader.jsx` ([`src/components/dashboard/DashboardHeader.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/DashboardHeader.jsx))
- **Dynamic Time Greeting**: Automatically displays "Good morning", "Good afternoon", or "Good evening" along with the rep's name.
- **Live Search**: Filters quotations in real-time by Quote ID, Customer Name, or Product.
- **Multi-Criteria Filter Dropdowns**:
  - **Time Period**: `All Time`, `Today`, `This Week`, `This Month`, `This Quarter`
  - **Deal Stage**: `All Stages`, `Draft`, `Pending Approval`, `Negotiation`, `Confirmed`
  - **Deal Health**: `All Health`, `Healthy`, `At Risk`, `Critical`
- **Data Sync & Reset**: Includes a spinning sync button and one-click "Reset Filters" action.

---

### 2. `KPICard.jsx` ([`src/components/dashboard/KPICard.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/KPICard.jsx))
Renders 6 key metric cards:
1. **Active Deals**: In-flight negotiations and active proposals.
2. **Pipeline Value**: Total tracked monetary value ($1.42M).
3. **Pending Approvals**: Quotes exceeding rep authorization limits (e.g. 22% discount on `Q-1041`).
4. **Won Deals (QTD)**: Closed contracts and booking volume.
5. **Deal Health**: Portfolio health percentage (88% Healthy).
6. **Monthly Revenue**: Revenue vs quota attainment (108%).

---

### 3. `PipelineOverview.jsx` ([`src/components/dashboard/PipelineOverview.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/PipelineOverview.jsx))
- **Visual Segmented Progress Bar**: Proportional color-coded bar representing relative monetary weights of stages.
- **Interactive Stage Cards**: Shows deal counts and total value for `Draft`, `Pending Approval`, `Negotiation`, and `Confirmed`. Clicking a stage card filters the dashboard quotes.

---

### 4. `DealHealth.jsx` ([`src/components/dashboard/DealHealth.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/DealHealth.jsx))
- **Health Breakdown Gauge**: Visual display of Healthy (14), At Risk (3), and Critical (1) deals.
- **Flagged Deal Risk Cards**: Displays AI/Governance risk scores (e.g. `Q-1041` with Risk Score 78/100, `Q-1038` with Risk Score 85/100) and suggested mitigation recommendations.

---

### 5. `RecentQuotations.jsx` ([`src/components/dashboard/RecentQuotations.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/RecentQuotations.jsx))
- Displays recent quotes with customer name, value, stage badge, health badge, margin %, and updated timestamps.
- **Working Actions**:
  - `View`: Opens the `QuoteDetailModal`.
  - `Edit`: Navigates to `/quotations`.
  - `Continue`: Advances the quote workflow with immediate toast feedback.

---

### 6. `PendingActions.jsx` ([`src/components/dashboard/PendingActions.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/PendingActions.jsx))
- Displays actionable tasks:
  - `Discount approval required` (Quote #Q-1041)
  - `Customer negotiation reply` (Quote #Q-1042)
  - `Fulfillment inventory bottleneck` (Quote #Q-1038)
  - `Quotation expiring soon` (Quote #Q-1036)
- Each item has a working button opening the `ActionResolutionModal`.

---

### 7. `SalesPerformance.jsx` ([`src/components/dashboard/SalesPerformance.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/SalesPerformance.jsx))
- 4 Performance metric boxes: `Quotes Created`, `Quotes Won`, `Win Rate`, `Average Deal Value`.
- **Interactive Sales Trend Visualization**: Responsive bar visualization showing monthly booked revenue vs quota targets with hover tooltips.

---

### 8. `ActivityTimeline.jsx` ([`src/components/dashboard/ActivityTimeline.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/ActivityTimeline.jsx))
- Chronological event stream displaying quote creations, approval escalations, customer replies, and contract confirmations.

---

### 9. Interactive Modals
- **`QuoteDetailModal.jsx` ([`src/components/dashboard/QuoteDetailModal.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/QuoteDetailModal.jsx))**: Inspects full quote breakdown including line items, discounts, margin status, and PDF export preview.
- **`ActionResolutionModal.jsx` ([`src/components/dashboard/ActionResolutionModal.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/ActionResolutionModal.jsx))**: Allows sales reps to enter justification notes, submit counter-terms, or split shipments. Resolving an action removes it from the queue and logs an audit trail event in real time.
- **`DashboardSkeleton.jsx` ([`src/components/dashboard/DashboardSkeleton.jsx`](file:///f:/odoo-dealflow/myapp/src/components/dashboard/DashboardSkeleton.jsx))**: Pulsing skeleton screen for loading states.
