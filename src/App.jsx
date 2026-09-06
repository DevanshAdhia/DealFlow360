import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getSession, initializeData } from './services/storageService';

// Auth Pages (default exports)
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages (default exports)
import Users from './pages/Users';
import Roles from './pages/Roles';
import PriceLists from './pages/PriceLists';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';
import Inventory from './pages/Inventory';
import DiscountRules from './pages/DiscountRules';
import ApprovalRules from './pages/ApprovalRules';
import Categories from './pages/Categories';
import AuditLogs from './pages/AuditLogs';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Quotations from './pages/Quotations';
import Warehouses from './pages/Warehouses';
import Billing from './pages/Billing';
import Settings from './pages/Settings';

// Other Admin & Sales Pages
import { ProductDetail } from './pages/ProductDetail';
import { QuotationDetail } from './pages/QuotationDetail';
import { CreateQuotation } from './pages/CreateQuotation';
import { Pipeline } from './pages/Pipeline';
import { DealHealth } from './pages/DealHealth';
import { DealHealthDetail } from './pages/DealHealthDetail';
import { Reports } from './pages/Reports';
import { ReportDetail } from './pages/ReportDetail';
import { Approvals } from './pages/Approvals';
import { ApprovalDetail } from './pages/ApprovalDetail';
import { FulfillmentDetail } from './pages/FulfillmentDetail';
import { Invoices } from './pages/Invoices';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Subscriptions } from './pages/Subscriptions';

import AdminLayout from './components/layout/AdminLayout';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';
import { ProductProvider } from './context/ProductContext';
import { CustomerProvider } from './context/CustomerContext';
import { QuotationProvider } from './context/QuotationContext';
import { DashboardProvider } from './context/DashboardContext';
import { ApprovalProvider } from './context/ApprovalContext';
import { BillingProvider } from './context/BillingContext';
import { FulfillmentProvider } from './context/FulfillmentContext';
import { InvoiceProvider } from './context/InvoiceContext';

import { CustomerLayout } from './components/layout/CustomerLayout';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CustomerQuotations } from './pages/CustomerQuotations';
import { CustomerQuotationDetail } from './pages/CustomerQuotationDetail';
import { CustomerQuotationReject } from './pages/CustomerQuotationReject';
import { CustomerNegotiations } from './pages/CustomerNegotiations';
import { CustomerProfile } from './pages/CustomerProfile';
import { CustomerProfileEdit } from './pages/CustomerProfileEdit';
import { CustomerHelp } from './pages/CustomerHelp';

initializeData();

function App() {
  // Session is populated by the Login page after real JWT auth.
  // getSession() reads from localStorage so page refreshes stay logged in.
  const [session, setSessionState] = useState(() => getSession());

  const handleLogin = (user) => {
    if (!user) return;
    try {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('dealflow360_user', JSON.stringify(user));
      localStorage.removeItem('dealflow360_logged_out');
    } catch {}
    setSessionState(user);
  };

  const handleLogout = () => {
    // Best-effort blacklist on backend
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      fetch('http://localhost:8000/api/login/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      }).catch(() => {});
    }
    // Clear all session keys
    ['access_token', 'refresh_token', 'user', 'dealflow360_user',
     'dealflow360_session', 'df_session'].forEach(k => localStorage.removeItem(k));
    localStorage.setItem('dealflow360_logged_out', '1');
    setSessionState(null);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <UserProvider>
            <ProductProvider>
              <CustomerProvider>
                <QuotationProvider>
                  <DashboardProvider>
                    <ApprovalProvider>
                      <BillingProvider>
                        <FulfillmentProvider>
                          <InvoiceProvider>
                            <Routes>
                              {/* Auth Routes */}
                              <Route path="/login" element={<Login onLogin={handleLogin} />} />
                              <Route path="/signup" element={<Signup />} />
                              <Route path="/forgot-password" element={<ForgotPassword />} />
                              
                              {/* Customer Portal Routes (Default Landing View) */}
                              <Route path="/customer" element={<CustomerLayout />}>
                                <Route path="dashboard" element={<CustomerDashboard />} />
                                <Route path="quotations" element={<CustomerQuotations />} />
                                <Route path="quotations/:quotationId" element={<CustomerQuotationDetail />} />
                                <Route path="quotations/:quotationId/reject" element={<CustomerQuotationReject />} />
                                <Route path="negotiations" element={<CustomerNegotiations />} />
                                <Route path="profile" element={<CustomerProfile />} />
                                <Route path="profile/edit" element={<CustomerProfileEdit />} />
                                <Route path="help" element={<CustomerHelp />} />
                              </Route>

                              {/* Admin Portal Routes */}
                              <Route path="/admin" element={
                                session ? <AdminLayout onLogout={handleLogout} user={session} /> : <Navigate to="/login" replace />
                              }>
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="users" element={<Users />} />
                                <Route path="roles" element={<Roles />} />
                                <Route path="customers" element={<Customers />} />
                                <Route path="products" element={<Products />} />
                                <Route path="products/:productId" element={<ProductDetail />} />
                                <Route path="categories" element={<Categories />} />
                                <Route path="price-lists" element={<PriceLists />} />
                                <Route path="discount-rules" element={<DiscountRules />} />
                                <Route path="approval-rules" element={<ApprovalRules />} />
                                <Route path="quotations" element={<Quotations />} />
                                <Route path="quotations/new" element={<CreateQuotation />} />
                                <Route path="quotations/:quotationId" element={<QuotationDetail />} />
                                <Route path="pipeline" element={<Pipeline />} />
                                <Route path="deal-health" element={<DealHealth />} />
                                <Route path="deal-health/:id" element={<DealHealthDetail />} />
                                <Route path="reports" element={<Reports />} />
                                <Route path="reports/:reportId" element={<ReportDetail />} />
                                <Route path="approvals" element={<Approvals />} />
                                <Route path="approvals/:quotationId" element={<ApprovalDetail />} />
                                <Route path="fulfillment" element={<FulfillmentDetail />} />
                                <Route path="invoices" element={<Invoices />} />
                                <Route path="invoices/:invoiceId" element={<InvoiceDetail />} />
                                <Route path="subscriptions" element={<Subscriptions />} />
                                <Route path="orders" element={<Orders />} />
                                <Route path="warehouses" element={<Warehouses />} />
                                <Route path="inventory" element={<Inventory />} />
                                <Route path="billing" element={<Billing />} />
                                <Route path="notifications" element={<Notifications />} />
                                <Route path="audit-logs" element={<AuditLogs />} />
                                <Route path="settings" element={<Settings />} />
                              </Route>

                              {/* Dedicated Sales Portal Routes */}
                              <Route path="/sales" element={
                                session ? <AdminLayout onLogout={handleLogout} user={session} /> : <Navigate to="/login" replace />
                              }>
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="quotations" element={<Quotations />} />
                                <Route path="quotations/new" element={<CreateQuotation />} />
                                <Route path="quotations/:quotationId" element={<QuotationDetail />} />
                                <Route path="pipeline" element={<Pipeline />} />
                                <Route path="deal-health" element={<DealHealth />} />
                                <Route path="deal-health/:id" element={<DealHealthDetail />} />
                                <Route path="reports" element={<Reports />} />
                                <Route path="reports/:reportId" element={<ReportDetail />} />
                                <Route path="approvals" element={<Approvals />} />
                                <Route path="approvals/:quotationId" element={<ApprovalDetail />} />
                                <Route path="fulfillment" element={<FulfillmentDetail />} />
                                <Route path="subscriptions" element={<Subscriptions />} />
                                <Route path="invoices" element={<Invoices />} />
                                <Route path="invoices/:invoiceId" element={<InvoiceDetail />} />
                                <Route path="products" element={<Products />} />
                                <Route path="products/:productId" element={<ProductDetail />} />
                                <Route path="customers" element={<Customers />} />
                                <Route path="orders" element={<Orders />} />
                                <Route path="inventory" element={<Inventory />} />
                                <Route path="billing" element={<Billing />} />
                              </Route>

                              {/* Direct Aliases & Redirects for Navigation Compatibility */}
                              <Route path="/dashboard" element={<Navigate to="/customer/dashboard" replace />} />
                              <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />
                              <Route path="/products" element={<Navigate to="/admin/products" replace />} />
                              <Route path="/quotations" element={<Navigate to="/customer/quotations" replace />} />
                              <Route path="/quotations/new" element={<Navigate to="/admin/quotations/new" replace />} />
                              <Route path="/quotations/:quotationId" element={<Navigate to="/customer/quotations/:quotationId" replace />} />
                              <Route path="/pipeline" element={<Navigate to="/admin/pipeline" replace />} />
                              <Route path="/deal-health" element={<Navigate to="/admin/deal-health" replace />} />
                              <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
                              <Route path="/approvals" element={<Navigate to="/admin/approvals" replace />} />
                              <Route path="/fulfillment" element={<Navigate to="/admin/fulfillment" replace />} />
                              <Route path="/invoices" element={<Navigate to="/admin/invoices" replace />} />
                              <Route path="/subscriptions" element={<Navigate to="/admin/subscriptions" replace />} />
                              <Route path="/orders" element={<Navigate to="/admin/orders" replace />} />
                              <Route path="/inventory" element={<Navigate to="/admin/inventory" replace />} />
                              <Route path="/billing" element={<Navigate to="/admin/billing" replace />} />
                              <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
                              <Route path="/users" element={<Navigate to="/admin/users" replace />} />
                              <Route path="/roles" element={<Navigate to="/admin/roles" replace />} />
                              <Route path="/categories" element={<Navigate to="/admin/categories" replace />} />
                              <Route path="/price-lists" element={<Navigate to="/admin/price-lists" replace />} />
                              <Route path="/discount-rules" element={<Navigate to="/admin/discount-rules" replace />} />
                              <Route path="/approval-rules" element={<Navigate to="/admin/approval-rules" replace />} />
                              <Route path="/warehouses" element={<Navigate to="/admin/warehouses" replace />} />
                              <Route path="/notifications" element={<Navigate to="/admin/notifications" replace />} />
                              <Route path="/audit-logs" element={<Navigate to="/admin/audit-logs" replace />} />

                              <Route path="/" element={<Navigate to="/customer/dashboard" replace />} />
                              <Route path="*" element={<div className="content"><h1>404 Not Found</h1></div>} />
                            </Routes>
                            <ToastContainer position="bottom-right" autoClose={3000} />
                          </InvoiceProvider>
                        </FulfillmentProvider>
                      </BillingProvider>
                    </ApprovalProvider>
                  </DashboardProvider>
                </QuotationProvider>
              </CustomerProvider>
            </ProductProvider>
          </UserProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
