import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService.js';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.warn('Failed to load users:', err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const addUser = (userData) => {
    const newUser = { id: `USR-${Date.now()}`, ...userData };
    setUsers(prev => [...(Array.isArray(prev) ? prev : []), newUser]);
    return newUser;
  };

  const updateUser = (id, updates) => {
    let updated;
    setUsers(prev => (Array.isArray(prev) ? prev : []).map(u => {
      if (u.id === id) {
        updated = { ...u, ...updates };
        return updated;
      }
      return u;
    }));
    return updated;
  };

  const deleteUserItem = (id) => {
    setUsers(prev => (Array.isArray(prev) ? prev : []).filter(u => u.id !== id));
  };

  const usersList = Array.isArray(users) ? users : [];

  return (
    <UserContext.Provider value={{ users: usersList, isLoading, error, addUser, updateUser, deleteUser: deleteUserItem, reloadUsers: loadUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUsers must be used within UserProvider');
  return context;
};
