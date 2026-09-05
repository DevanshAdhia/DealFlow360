# Developer Guide & Extension Manual

This guide is for engineers onboarding to **DealFlow360** or implementing upcoming modules.

---

## 🛠️ Development Environment Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **Package Manager**: npm (v9+) or pnpm

### 2. Local Setup
```bash
# Clone the repository and navigate into the app folder
cd myapp

# Install dependencies
npm install

# Start local development server with HMR (Hot Module Replacement)
npm run dev

# Run full production build check
npm run build

# Preview production build locally
npm run preview
```

---

## 🏗️ Codebase Conventions & Best Practices

### 1. Component Modularity
- Place reusable domain components in subdirectories under `src/components/` (e.g. `src/components/dashboard/`, `src/components/quotations/`, `src/components/pipeline/`).
- Keep components focused and reusable. Pass state and handlers via props.
- Keep page views in `src/pages/` as container assemblies.

### 2. State & Context Usage
- Do not maintain isolated local state for shared domain entities (e.g., quotations, user session).
- Utilize the dedicated Context hooks:
  - `const { user, login, logout, switchDemoRole } = useAuth();`
  - `const { quotations, addQuotation, updateQuotation, duplicateQuotation, moveQuotationStage } = useQuotations();`
  - `const { success, error, info, warning } = useToast();`

### 3. Styling & Design System
- Use **CSS Custom Properties (Variables)** from [`src/styles/variables.css`](file:///f:/odoo-dealflow/myapp/src/styles/variables.css) instead of hardcoding hex colors.
- Maintain consistent dark glassmorphic styling (`var(--bg-dark)`, `var(--bg-surface-1)`, `var(--bg-surface-2)`, `var(--border-subtle)`).
- Avoid unnecessary external UI libraries (such as Tailwind or Bootstrap) — the existing design system provides all required utilities.

### 4. Role-Based Routing
- When adding a new route in [`src/routes/AppRoutes.jsx`](file:///f:/odoo-dealflow/myapp/src/routes/AppRoutes.jsx), wrap it with `<ProtectedRoute allowedRoles={['...']}>` if it is restricted to specific personas.

---

## 🗺️ Roadmap: Completed Platform Phases

```text
Phase 1: Authentication & Navigation Shell       [COMPLETE ✅]
Phase 2: Sales Rep Dashboard Workspace          [COMPLETE ✅]
Phase 3: Quotation Management & Sales Pipeline  [COMPLETE ✅]
Phase 4: Multi-Tier Approval Workflow Matrix     [COMPLETE ✅]
Phase 5: Multi-Warehouse Fulfillment & Logistics [COMPLETE ✅]
Phase 6: Billing, Invoicing & Subscription Ledger [COMPLETE ✅]
Phase 7: Advanced RevOps Intelligence & Settings  [COMPLETE ✅]
```

### Detailed Phase Documentation
- [Phase 1: Authentication & Navigation Shell](file:///f:/odoo-dealflow/myapp/docs/PHASE1_AUTHENTICATION_AND_SHELL.md)
- [Phase 2: Sales Rep Dashboard Workspace](file:///f:/odoo-dealflow/myapp/docs/PHASE2_DASHBOARD_WORKSPACE.md)
- [Phase 3: Quotation Management & Sales Pipeline](file:///f:/odoo-dealflow/myapp/docs/PHASE3_QUOTATIONS_AND_PIPELINE.md)
- [Phase 4: Multi-Tier Approval Workflow Matrix](file:///f:/odoo-dealflow/myapp/docs/PHASE4_APPROVALS_AND_GOVERNANCE.md)
- [Phase 5: Multi-Warehouse Fulfillment & Logistics](file:///f:/odoo-dealflow/myapp/docs/PHASE5_FULFILLMENT_AND_WAREHOUSES.md)
- [Phase 6: Billing, Invoicing & Subscription Ledger](file:///f:/odoo-dealflow/myapp/docs/PHASE6_BILLING_AND_INVOICING.md)
- [Phase 7: Advanced RevOps Intelligence & System Governance](file:///f:/odoo-dealflow/myapp/docs/PHASE7_REVOPS_INTELLIGENCE_AND_CUSTOMERS.md)

