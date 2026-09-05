# DealFlow360 — System Architecture & Data Flow

This document details the high-level architecture, state management patterns, routing guards, and styling system of **DealFlow360**.

---

## 🏛️ High-Level Architectural Overview

DealFlow360 is built as a single-page enterprise SaaS application adhering to modern React principles:
- **Clean Separation of Concerns**: Pages assemble modular components; state is managed through React Contexts with `localStorage` synchronization; data layers are isolated in `src/data/`.
- **Zero Heavy External Dependencies**: Employs vanilla CSS variables, Lucide React icons, and subtle Framer Motion transitions for optimum performance and maintainability.
- **Enterprise Light Design Language**: Consistent crisp light enterprise palette (`#f8fafc` background, `#ffffff` card surfaces, `#0f172a` primary text), high-contrast typography, and responsive multi-column layouts.
- **Indian Rupee (INR / ₹) Currency System**: Centralized currency formatting (`src/utils/formatters.js`) supporting standard INR currency formatting (`en-IN`), Lakhs (`L`), and Crores (`Cr`) metric abbreviations.

```mermaid
graph TD
    A[User / Browser] --> B[React Router (AppRoutes)]
    B --> C[ProtectedRoute]
    C -->|Unauthenticated| D[Login / AuthLayout]
    C -->|Authenticated| E[DashboardLayout]
    E --> F[Sidebar & Role Switcher]
    E --> G[Header & Search]
    E --> H[Active Page View]
    
    H --> I[/dashboard - Sales Rep Workspace]
    H --> J[/quotations - Quotations Ledger]
    H --> K[/quotations/new - 3-Step Wizard]
    H --> L[/quotations/:id - Quotation Details]
    H --> M[/pipeline - Sales Pipeline Kanban]

    I & J & K & L & M <--> N[(QuotationContext)]
    N <--> O[localStorage: dealflow360_quotations]
    
    D & F <--> P[(AuthContext)]
    P <--> Q[localStorage: dealflow360_user]
    
    H & N --> R[(ToastContext)]
```

---

## 🧠 State Management Layer

The application utilizes three centralized React Context providers located in `src/context/`:

### 1. `AuthContext` ([`src/context/AuthContext.jsx`](file:///f:/odoo-dealflow/myapp/src/context/AuthContext.jsx))
- **Responsibilities**:
  - Manages active user authentication state (`user`, `isAuthenticated`).
  - Persists active login session in `localStorage` (`dealflow360_user`).
  - Handles `login(email, password)`, `logout()`, and `switchDemoRole(roleName)` for seamless hackathon persona evaluation.
  - Exposes user permissions array for fine-grained UI capability checks.

### 2. `QuotationContext` ([`src/context/QuotationContext.jsx`](file:///f:/odoo-dealflow/myapp/src/context/QuotationContext.jsx))
- **Responsibilities**:
  - Serves as the single source of truth for all quotations across the workspace.
  - Automatically loads from and syncs with `localStorage` (`dealflow360_quotations`).
  - Implements CPQ standard pricing arithmetic:
    $$\text{Subtotal} = \sum (\text{unitPrice} \times \text{quantity})$$
    $$\text{Discount Amount} = \text{Subtotal} \times \frac{\text{discount}\%}{100}$$
    $$\text{Taxable Amount} = \text{Subtotal} - \text{Discount Amount}$$
    $$\text{Tax (8\%)} = \text{Taxable Amount} \times 0.08$$
    $$\text{Total} = \text{Taxable Amount} + \text{Tax}$$
  - Enforces **Stage Transition Governance** rules (e.g. prohibits invalid shortcuts like `draft` $\rightarrow$ `confirmed`).
  - Provides dynamic pipeline statistical computations (`getPipelineMetrics()`).

### 3. `ToastContext` ([`src/context/ToastContext.jsx`](file:///f:/odoo-dealflow/myapp/src/context/ToastContext.jsx))
- **Responsibilities**:
  - Global event notification system providing `success()`, `error()`, `info()`, and `warning()` dispatchers.
  - Auto-dismisses toasts after 4 seconds with animated entrance/exit effects.

---

## 🛡️ Routing & Access Governance

Configured in `src/routes/AppRoutes.jsx` and guarded by `src/routes/ProtectedRoute.jsx`:

| Route | View Component | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `Login.jsx` | Public | Multi-persona login & demo pill selection |
| `/dashboard` | `Dashboard.jsx` | All Authenticated | Sales rep operational workspace & KPI dashboard |
| `/quotations` | `Quotations.jsx` | All Authenticated | Quotations ledger with filters, search, and sorting |
| `/quotations/new` | `CreateQuotation.jsx` | All Authenticated | 3-Step CPQ quotation creation wizard |
| `/quotations/:id` | `QuotationDetail.jsx` | All Authenticated | Full quote record with line items & stage stepper |
| `/pipeline` | `Pipeline.jsx` | `sales_rep`, `sales_manager`, `admin` | 4-Stage Kanban pipeline board |
| `/customers` | `Customers.jsx` | `sales_rep`, `sales_manager`, `admin` | Customer accounts overview |
| `/approvals` | `Approvals.jsx` | `sales_manager`, `finance`, `admin` | Approval workflow matrix |
| `/fulfillment` | `Fulfillment.jsx` | `finance`, `admin` | Multi-warehouse routing |
| `/billing` | `Billing.jsx` | `finance`, `customer`, `admin` | Invoices & ledger |
| `/reports` | `Reports.jsx` | `sales_manager`, `finance`, `admin` | Margin & revenue analytics |
| `/settings` | `Settings.jsx` | All Authenticated | Role configuration & user profiles |

---

## 🎨 Design System & CSS Token Architecture

Located in `src/styles/`:
- **`variables.css`**: Design tokens including color palette (Slate `#0b0f19`, Surface `#151d30`, Primary Blue `#3b82f6`, Success Green `#10b981`, Warning Amber `#f59e0b`, Error Red `#ef4444`), radii, transitions, and typography.
- **`global.css`**: Global resets, scrollbar styling, button classes (`.btn-primary`, `.btn-secondary`, `.btn-outline`), form input styles, badges, and card utilities.
- **`dashboard.css`**: Grid systems for KPI cards, timeline connector lines, sales trend bar visualizations, and modal drawers.
- **`quotations.css`**: 3-step wizard indicators, line item builder rows, customer selection cards, and pricing arithmetic summary boxes.
- **`pipeline.css`**: 4-column responsive Kanban board with stage color accents and deal cards.
- **`responsive.css`**: Breakpoint definitions adapting desktop multi-column layouts into tablet and mobile single-column experiences.
