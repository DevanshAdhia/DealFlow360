import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { storageService } from '../services/storageService.js';
import { customerService } from '../services/customerService.js';

const CustomerContext = createContext(null);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState(() => storageService.getCustomers());
  const [currentCustomerId, setCurrentCustomerIdState] = useState(() => storageService.getCurrentCustomerId());

  const setCurrentCustomerId = useCallback((id) => {
    setCurrentCustomerIdState(id);
    storageService.saveCurrentCustomerId(id);
  }, []);

  const currentCustomer = useMemo(() => {
    return customerService.getCustomerById(currentCustomerId, customers) || customers[0] || null;
  }, [currentCustomerId, customers]);

  const updateCustomerProfile = useCallback((updatedFields) => {
    const updated = customerService.updateCustomer(currentCustomerId, updatedFields, customers);
    setCustomers(updated);
    return true;
  }, [currentCustomerId, customers]);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        currentCustomerId,
        currentCustomer,
        setCurrentCustomerId,
        updateCustomerProfile
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
