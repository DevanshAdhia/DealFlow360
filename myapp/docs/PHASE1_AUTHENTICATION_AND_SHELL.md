# Phase 1: Authentication & Navigation Shell

Phase 1 established the enterprise authentication foundation, multi-persona access controls, and responsive layout shell for **DealFlow360**.

---

## 🔑 Key Features & Architecture

### 1. Multi-Persona Authentication Architecture ([`src/data/users.js`](file:///f:/odoo-dealflow/myapp/src/data/users.js))
DealFlow360 provides 5 built-in enterprise personas:
1. **Alex Morgan (Sales Rep)**: Focuses on quotation creation, pipeline management, and discount approvals.
2. **Sarah Jenkins (Sales Manager)**: VP of Global Sales with discount approval governance and team analytics.
3. **Marcus Vance (Finance / Ops)**: RevOps Director managing margin compliance, fulfillment, and billing.
4. **Elena Rostova (Customer)**: Client Procurement Director interacting via Customer Portal.
5. **David Sterling (Administrator)**: Full administrative access.

---

### 2. Authentication State & Session ([`src/context/AuthContext.jsx`](file:///f:/odoo-dealflow/myapp/src/context/AuthContext.jsx))
- **`user` State**: Tracks current user object, role, department, avatar, and assigned workspace.
- **`localStorage` Persistence**: Stores the active user under `dealflow360_user`, ensuring sessions survive page refreshes.
- **Role Switching**: The `switchDemoRole(roleName)` utility allows instantaneous switching between hackathon personas without having to log out and re-enter credentials.

---

### 3. Role-Based Route Guard ([`src/routes/ProtectedRoute.jsx`](file:///f:/odoo-dealflow/myapp/src/routes/ProtectedRoute.jsx))
- Verifies that a user is authenticated before rendering private views.
- Accepts an optional `allowedRoles` array (e.g. `['sales_manager', 'finance', 'admin']`).
- If an unauthorized persona attempts to access a restricted route, it cleanly redirects to the `/unauthorized` explanation screen.

---

### 4. Layout Shell Components ([`src/layouts/DashboardLayout.jsx`](file:///f:/odoo-dealflow/myapp/src/layouts/DashboardLayout.jsx))
- **Sidebar ([`src/components/layout/Sidebar.jsx`](file:///f:/odoo-dealflow/myapp/src/components/layout/Sidebar.jsx))**:
  - Collapsible desktop navigation bar (260px $\rightarrow$ 76px).
  - Mobile drawer with backdrop overlay.
  - Active route highlighting and role-based "Restricted" badges.
  - Embedded **Demo Role Switcher** widget in the footer.
- **Header ([`src/components/layout/Header.jsx`](file:///f:/odoo-dealflow/myapp/src/components/layout/Header.jsx))**:
  - Dynamic breadcrumb path and page title.
  - Global search bar with `Ctrl+K` hint.
  - Notification icon with unread indicator and popover modal ([`NotificationModal.jsx`](file:///f:/odoo-dealflow/myapp/src/components/layout/NotificationModal.jsx)).
  - User profile dropdown with account details, workspace tags, and sign-out button.
- **Centralized Toast Container ([`src/components/ui/ToastContainer.jsx`](file:///f:/odoo-dealflow/myapp/src/components/ui/ToastContainer.jsx))**:
  - Renders floating status banners for real-time feedback across the application.
