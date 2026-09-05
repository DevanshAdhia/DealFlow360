import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login.jsx';
import { ForgotPassword } from '../pages/auth/ForgotPassword.jsx';
import { Unauthorized } from '../pages/Unauthorized.jsx';

import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

import { Dashboard } from '../pages/Dashboard.jsx';
import { Quotations } from '../pages/Quotations.jsx';
import { CreateQuotation } from '../pages/CreateQuotation.jsx';
import { QuotationDetail } from '../pages/QuotationDetail.jsx';
import { QuotationBuilder } from '../pages/QuotationBuilder.jsx';
import { Pipeline } from '../pages/Pipeline.jsx';
import { Customers } from '../pages/Customers.jsx';
import { Approvals } from '../pages/Approvals.jsx';
import { ApprovalDetail } from '../pages/ApprovalDetail.jsx';
import { Fulfillment } from '../pages/Fulfillment.jsx';
import { FulfillmentDetail } from '../pages/FulfillmentDetail.jsx';
import { Warehouses } from '../pages/Warehouses.jsx';
import { Billing } from '../pages/Billing.jsx';
import { InvoicesList } from '../pages/InvoicesList.jsx';
import { InvoiceDetail } from '../pages/InvoiceDetail.jsx';
import { Subscriptions } from '../pages/Subscriptions.jsx';
import { ReportList } from '../pages/ReportList.jsx';
import { ReportDetail } from '../pages/ReportDetail.jsx';
import { Products } from '../pages/Products.jsx';
import { ProductDetail } from '../pages/ProductDetail.jsx';
import { Settings } from '../pages/Settings.jsx';
import { DealHealth } from '../pages/DealHealth.jsx';
import { DealHealthDetail } from '../pages/DealHealthDetail.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected App Routes wrapped in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales/dashboard" element={<Dashboard />} />
        
        {/* Quotations */}
        <Route path="/quotations" element={<Quotations />} />
        <Route path="/sales/quotations" element={<Quotations />} />
        <Route path="/quotations/new" element={<CreateQuotation />} />
        <Route path="/sales/quotations/new" element={<CreateQuotation />} />
        <Route path="/quotations/:id" element={<QuotationDetail />} />
        <Route path="/sales/quotations/:id" element={<QuotationDetail />} />
        <Route path="/sales/quotations/:quotationId" element={<QuotationDetail />} />
        <Route path="/quotations/:id/builder" element={<QuotationBuilder />} />
        <Route path="/sales/quotations/:id/builder" element={<QuotationBuilder />} />

        {/* Products */}
        <Route path="/products" element={<Products />} />
        <Route path="/sales/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/sales/products/:productId" element={<ProductDetail />} />
        <Route path="/sales/products/:id" element={<ProductDetail />} />
        
        {/* Sales Pipeline */}
        <Route 
          path="/pipeline" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <Pipeline />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/pipeline" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'admin']}>
              <Pipeline />
            </ProtectedRoute>
          } 
        />
        
        {/* Deal Health */}
        <Route 
          path="/deal-health" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <DealHealth />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/deal-health" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <DealHealth />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/deal-health/:quotationId" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <DealHealthDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/deal-health/:id" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <DealHealthDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/deal-health/:quotationId" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <DealHealthDetail />
            </ProtectedRoute>
          } 
        />

        {/* Customers */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/sales/customers" element={<Customers />} />
        
        {/* Approvals */}
        <Route 
          path="/approvals" 
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'finance', 'admin', 'sales_rep']}>
              <Approvals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/approvals" 
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'finance', 'admin', 'sales_rep']}>
              <Approvals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/approvals/:id" 
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'finance', 'admin', 'sales_rep']}>
              <ApprovalDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/approvals/:id" 
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'finance', 'admin', 'sales_rep']}>
              <ApprovalDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/approvals/:quotationId" 
          element={
            <ProtectedRoute allowedRoles={['sales_manager', 'finance', 'admin', 'sales_rep']}>
              <ApprovalDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* Fulfillment */}
        <Route 
          path="/fulfillment" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin', 'sales_manager', 'sales_rep']}>
              <Fulfillment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/fulfillment" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin', 'sales_manager', 'sales_rep']}>
              <Fulfillment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fulfillment/:id" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin', 'sales_manager', 'sales_rep']}>
              <FulfillmentDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/fulfillment/:id" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin', 'sales_manager', 'sales_rep']}>
              <FulfillmentDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/fulfillment/:fulfillmentId" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin', 'sales_manager', 'sales_rep']}>
              <FulfillmentDetail />
            </ProtectedRoute>
          } 
        />

        {/* Warehouses */}
        <Route 
          path="/warehouses" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin']}>
              <Warehouses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/warehouses" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin']}>
              <Warehouses />
            </ProtectedRoute>
          } 
        />
        
        {/* Billing & Subscriptions */}
        <Route 
          path="/billing" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <Billing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/billing" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <Billing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscriptions" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin', 'sales_manager', 'sales_rep']}>
              <Subscriptions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/subscriptions" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'admin', 'sales_manager', 'sales_rep']}>
              <Subscriptions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/subscriptions/:id" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <Billing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/subscriptions/:id" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <Billing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/subscriptions/:subscriptionId" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <Billing />
            </ProtectedRoute>
          } 
        />

        {/* Invoices */}
        <Route 
          path="/invoices" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <InvoicesList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/invoices" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <InvoicesList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/invoices/:id" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <InvoiceDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/invoices/:id" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <InvoiceDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/invoices/:invoiceId" 
          element={
            <ProtectedRoute allowedRoles={['finance', 'customer', 'admin', 'sales_manager', 'sales_rep']}>
              <InvoiceDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* Reports & Analytics */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <ReportList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/reports" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <ReportList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports/:reportId" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <ReportDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/reports/:reportId" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <ReportDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <ReportList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales/analytics" 
          element={
            <ProtectedRoute allowedRoles={['sales_rep', 'sales_manager', 'finance', 'admin']}>
              <ReportList />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/settings" element={<Settings />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Default Catch-all redirect */}
      <Route path="*" element={<Navigate to="/sales/dashboard" replace />} />
    </Routes>
  );
};
