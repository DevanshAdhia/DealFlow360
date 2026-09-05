import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../components/layout/CustomerLayout.jsx';
import { CustomerDashboard } from '../pages/CustomerDashboard.jsx';
import { CustomerQuotations } from '../pages/CustomerQuotations.jsx';
import { CustomerQuotationDetail } from '../pages/CustomerQuotationDetail.jsx';
import { CustomerQuotationReject } from '../pages/CustomerQuotationReject.jsx';
import { CustomerNegotiations } from '../pages/CustomerNegotiations.jsx';
import { CustomerProfile } from '../pages/CustomerProfile.jsx';
import { CustomerProfileEdit } from '../pages/CustomerProfileEdit.jsx';
import { CustomerHelp } from '../pages/CustomerHelp.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirects directly to customer dashboard */}
      <Route path="/" element={<Navigate to="/customer/dashboard" replace />} />
      <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />

      {/* Customer Portal Layout Routes */}
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
    </Routes>
  );
};
