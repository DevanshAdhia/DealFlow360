import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getStoredSession, saveSession, clearSession } from '../utils/storage.js';
import { authenticateCredentials } from '../utils/auth.js';
import { MOCK_USERS } from '../data/users.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session on initial application mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = getStoredSession();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Default to Alex Morgan for the Internal Sales App
          const defaultSalesUser = MOCK_USERS[0];
          saveSession(defaultSalesUser, true);
          setUser(defaultSalesUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Failed to restore authentication session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    setLoading(true);
    setAuthError(null);

    // Simulate realistic server verification delay for enterprise feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = authenticateCredentials(email, password);

    if (result.success) {
      const savedUser = saveSession(result.user, rememberMe);
      setUser(savedUser);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true, user: savedUser };
    } else {
      setAuthError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  // Hackathon demo shortcut: switch role directly
  const switchDemoRole = useCallback((roleName) => {
    const targetUser = MOCK_USERS.find((u) => u.role === roleName) || MOCK_USERS[0];
    const savedUser = saveSession(targetUser, true);
    setUser(savedUser);
    setIsAuthenticated(true);
    return savedUser;
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    error: authError,
    login,
    logout,
    switchDemoRole,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => React.useContext(AuthContext);
