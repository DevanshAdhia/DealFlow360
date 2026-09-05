import React from 'react';
import { ToastProvider } from './context/ToastContext.jsx';
import { CustomerProvider } from './context/CustomerContext.jsx';
import { QuotationProvider } from './context/QuotationContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';

export function App() {
  return (
    <ToastProvider>
      <CustomerProvider>
        <QuotationProvider>
          <AppRoutes />
        </QuotationProvider>
      </CustomerProvider>
    </ToastProvider>
  );
}

export default App;
