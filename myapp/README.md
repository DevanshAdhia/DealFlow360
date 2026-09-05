# DealFlow360 — Intelligent Quote-to-Cash & Sales Operations Platform

**DealFlow360** is an enterprise SaaS platform built with **React + Vite** designed to streamline quote-to-cash workflows, configure dynamic CPQ pricing, enforce governance rules, and track sales pipeline velocity in real time.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation & Running Locally
```bash
# Navigate to the project root
cd myapp

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build
```

The application will be accessible at `http://localhost:5173/`.

---

## 👥 Demo Personas & Logins

| Persona Role | Demo Email | Password | Assigned Workspace | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Sales Rep** | `sales@dealflow360.demo` | `Sales@123` | Sales Workspace | View Dashboard, Manage Quotes, View Pipeline, Create Drafts |
| **Sales Manager** | `manager@dealflow360.demo` | `Manager@123` | Manager Workspace | Discount Approvals, Team Analytics, Full Governance |
| **Finance / Ops** | `finance@dealflow360.demo` | `Finance@123` | Finance Workspace | High Discount Reviews, Fulfillment, Billing |
| **Customer Portal** | `customer@dealflow360.demo` | `Customer@123` | Customer Portal | View Quotes, Counter-Offers, Digital Signatures |
| **Administrator** | `admin@dealflow360.demo` | `Admin@123` | Admin Workspace | System Administration & All Permissions |

> **Theme & Currency:** The entire DealFlow360 platform is built in a modern **Enterprise Light Theme** and defaults to **Indian Rupee (INR / ₹)** with Indian numerical grouping (`en-IN`, Lakhs `L`, and Crores `Cr`).
> **Tip:** You can switch roles instantly in the UI using the demo role switcher in the sidebar footer or on the login page.

---

## 📂 Project Structure

```text
myapp/
├── docs/                                # Detailed technical documentation
│   ├── ARCHITECTURE.md                  # Global architecture & data flow
│   ├── PHASE1_AUTHENTICATION_AND_SHELL.md # Phase 1 Auth & Shell docs
│   ├── PHASE2_DASHBOARD_WORKSPACE.md    # Phase 2 Dashboard docs
│   ├── PHASE3_QUOTATIONS_AND_PIPELINE.md# Phase 3 Quotations & Pipeline docs
│   └── DEVELOPMENT_GUIDE.md             # Developer onboarding & extension guide
├── src/
│   ├── components/                      # Reusable UI component modules
│   │   ├── common/                      # Common placeholder & utility components
│   │   ├── dashboard/                   # 13 Dashboard modular components & modals
│   │   ├── layout/                      # Header, Sidebar, NotificationModal
│   │   ├── pipeline/                    # Kanban Columns, Cards, Metrics
│   │   ├── quotations/                  # Quotation Table, Cards, Filters, Form Builders
│   │   └── ui/                          # Toast notification container
│   ├── context/                         # Central state providers (React Context)
│   │   ├── AuthContext.jsx              # Auth session, roles, localStorage
│   │   ├── QuotationContext.jsx         # Quotations state, calculations, persistence
│   │   └── ToastContext.jsx             # Global toast notification dispatch
│   ├── data/                            # Reusable mock datasets
│   │   ├── customers.js                 # Customer accounts database
│   │   ├── dashboard.js                 # Dashboard stats, feeds, and calculations
│   │   ├── products.js                  # Product catalog presets
│   │   ├── quotations.js                # Initial quotations master dataset
│   │   └── users.js                     # User database & role badges
│   ├── hooks/                           # Custom React hooks
│   │   ├── useAuth.js                   # Hook to access auth state
│   │   └── useToast.js                  # Hook to trigger toast notifications
│   ├── layouts/                         # Layout wrappers
│   │   ├── AuthLayout.jsx               # Login & Forgot Password wrapper
│   │   └── DashboardLayout.jsx          # App shell (Sidebar + Header + Outlet)
│   ├── pages/                           # Application page views
│   │   ├── auth/                        # Login & ForgotPassword pages
│   │   ├── CreateQuotation.jsx          # 3-step CPQ quote creation wizard (/quotations/new)
│   │   ├── Dashboard.jsx                # Main Sales Rep Workspace (/dashboard)
│   │   ├── Pipeline.jsx                 # Kanban Sales Pipeline (/pipeline)
│   │   ├── QuotationDetail.jsx          # Full quotation record (/quotations/:id)
│   │   ├── Quotations.jsx               # Quotations ledger (/quotations)
│   │   └── ... (Module placeholders)    # Future phase placeholders
│   ├── routes/                          # React Router configuration
│   │   ├── AppRoutes.jsx                # Route definitions & guards
│   │   └── ProtectedRoute.jsx           # Role-based route guard
│   └── styles/                          # CSS design system & tokens
│       ├── dashboard.css                # Dashboard styling
│       ├── global.css                   # Global reset, typography, buttons, inputs
│       ├── pipeline.css                 # Kanban board styling
│       ├── quotations.css               # Quotation ledger & wizard styling
│       ├── responsive.css               # Mobile & tablet layout rules
│       └── variables.css                # Design system tokens (colors, radii, shadows)
├── index.html
├── package.json
└── vite.config.js
```

---

## 📖 In-Depth Documentation

For complete technical details on how each module works, explore the [`docs/`](file:///f:/odoo-dealflow/myapp/docs) folder:

1. [**System Architecture & Data Flow**](file:///f:/odoo-dealflow/myapp/docs/ARCHITECTURE.md)
2. [**Phase 1: Authentication & Navigation Shell**](file:///f:/odoo-dealflow/myapp/docs/PHASE1_AUTHENTICATION_AND_SHELL.md)
3. [**Phase 2: Sales Rep Dashboard Workspace**](file:///f:/odoo-dealflow/myapp/docs/PHASE2_DASHBOARD_WORKSPACE.md)
4. [**Phase 3: Quotation Management & Sales Pipeline**](file:///f:/odoo-dealflow/myapp/docs/PHASE3_QUOTATIONS_AND_PIPELINE.md)
5. [**Developer Guide & Future Phases**](file:///f:/odoo-dealflow/myapp/docs/DEVELOPMENT_GUIDE.md)
