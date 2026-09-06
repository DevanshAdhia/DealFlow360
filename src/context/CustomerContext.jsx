import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService.js';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getCustomers();
      const list = Array.isArray(data) ? data : [];
      setCustomers(list);
      if (list.length > 0 && !currentCustomerId) {
        setCurrentCustomerId(list[0].id);
      }
      setError(null);
    } catch (err) {
      console.warn('Failed to load customers from API:', err);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCustomerId]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const addCustomer = (customerData) => {
    const newCustomer = { id: `CUS-${Date.now()}`, ...customerData };
    setCustomers(prev => [...(Array.isArray(prev) ? prev : []), newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id, updates) => {
    let updated;
    setCustomers(prev => (Array.isArray(prev) ? prev : []).map(c => {
      if (c.id === id) {
        updated = { ...c, ...updates };
        return updated;
      }
      return c;
    }));
    return updated;
  };

  const deleteCustomerItem = (id) => {
    setCustomers(prev => (Array.isArray(prev) ? prev : []).filter(c => c.id !== id));
  };

  const customersList = Array.isArray(customers) ? customers : [];
  
  // Read logged in user from localStorage if available
  const storedUserRaw = localStorage.getItem('dealflow360_user') || localStorage.getItem('user');
  let activeUser = null;
  try {
    if (storedUserRaw) activeUser = JSON.parse(storedUserRaw);
  } catch {}

  const matchedCustomer = customersList.find(c => 
    (activeUser?.email && c.email?.toLowerCase() === activeUser.email.toLowerCase()) ||
    (activeUser?.name && c.contactName?.toLowerCase() === activeUser.name.toLowerCase()) ||
    (currentCustomerId && String(c.id) === String(currentCustomerId))
  );

  const currentCustomer = matchedCustomer || (activeUser ? {
    id: activeUser.id || 'CUS-USER',
    customerCode: activeUser.customerCode || 'CUS-OM',
    companyName: activeUser.company || `${activeUser.name || 'User'}'s Business`,
    contactName: activeUser.name || 'Om',
    email: activeUser.email || 'om@gmail.com',
    phone: activeUser.phone || 'Not Provided',
    industry: activeUser.industry || 'Not Specified',
    status: 'ACTIVE',
    currency: 'INR',
    billingAddress: activeUser.billingAddress || 'No billing address provided.',
    shippingAddress: activeUser.shippingAddress || 'No shipping address provided.',
    paymentTerms: activeUser.paymentTerms || 'Net 30'
  } : (customersList[0] || null));

  return (
    <CustomerContext.Provider value={{
      customers: customersList,
      currentCustomerId,
      currentCustomer,
      setCurrentCustomerId,
      isLoading,
      error,
      addCustomer,
      updateCustomer,
      deleteCustomer: deleteCustomerItem,
      reloadCustomers: loadCustomers,
      updateCustomerProfile: (fields) => updateCustomer(currentCustomerId, fields)
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) throw new Error('useCustomers must be used within CustomerProvider');
  return context;
}

export function useCustomer() {
  return useCustomers();
}
