import React, { createContext, useContext, useState, useCallback } from 'react';
import { dataService } from '../services/dataService.js';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState(() => dataService.getCustomers());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCustomers = useCallback(() => {
    try {
      const data = dataService.getCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError('Failed to load customers');
    }
  }, []);

  const addCustomer = (customerData) => {
    const newCustomer = { id: `CUS-${Date.now()}`, ...customerData };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id, updates) => {
    let updated;
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        updated = { ...c, ...updates };
        return updated;
      }
      return c;
    }));
    return updated;
  };

  const deleteCustomerItem = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  return (
    <CustomerContext.Provider value={{ customers, isLoading, error, addCustomer, updateCustomer, deleteCustomer: deleteCustomerItem, reloadCustomers: loadCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) throw new Error('useCustomers must be used within CustomerProvider');
  return context;
};
