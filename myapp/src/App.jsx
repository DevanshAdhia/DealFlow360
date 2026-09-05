import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { QuotationProvider } from './context/QuotationContext.jsx';
import { ApprovalProvider } from './context/ApprovalContext.jsx';
import { FulfillmentProvider } from './context/FulfillmentContext.jsx';
import { BillingProvider } from './context/BillingContext.jsx';
import { InvoiceProvider } from './context/InvoiceContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';
import './styles/variables.css';
import './styles/global.css';
import './styles/dashboard.css';
import './styles/quotations.css';
import './styles/pipeline.css';
import './styles/responsive.css';
import './styles/builder.css';
import './styles/approvals.css';
import './styles/billing.css';
import './styles/customers.css';
import './styles/settings.css';
import './styles/dealHealth.css';
import './styles/reports.css';
import './styles/fulfillment.css';
import './styles/invoiceModule.css';
import './styles/appNavigation.css';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <QuotationProvider>
            <ApprovalProvider>
              <FulfillmentProvider>
                <BillingProvider>
                  <InvoiceProvider>
                    <AppRoutes />
                  </InvoiceProvider>
                </BillingProvider>
              </FulfillmentProvider>
            </ApprovalProvider>
          </QuotationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
