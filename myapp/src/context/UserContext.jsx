import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService.js';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(() => dataService.getUsers());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(() => {
    try {
      const data = dataService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    }
  }, []);

  const addUser = (userData) => {
    const newUser = { id: `USR-${Date.now()}`, ...userData };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id, updates) => {
    let updated;
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        updated = { ...u, ...updates };
        return updated;
      }
      return u;
    }));
    return updated;
  };

  const deleteUserItem = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <UserContext.Provider value={{ users, isLoading, error, addUser, updateUser, deleteUser: deleteUserItem, reloadUsers: loadUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUsers must be used within UserProvider');
  return context;
};
