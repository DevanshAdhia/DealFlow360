import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getStoredSession, saveSession, clearSession } from '../utils/storage.js';

export const AuthContext = createContext(null);

const API_BASE = 'http://localhost:8000/api';

/**
 * Staff roles that should be routed to the admin/sales dashboard.
 */
const STAFF_ROLES = new Set(['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE']);

const getRedirectPath = (profileRole) => {
  if (!profileRole) return '/customer/dashboard';
  const role = (profileRole || '').toUpperCase().replace(/\s+/g, '_');
  return STAFF_ROLES.has(role) ? '/admin/dashboard' : '/customer/dashboard';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Prefer user stored alongside real JWT token
        const accessToken = localStorage.getItem('access_token');
        const storedUser = getStoredSession()
          || JSON.parse(localStorage.getItem('dealflow360_user') || localStorage.getItem('user') || 'null');

        if (storedUser && (accessToken || storedUser.id)) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to restore authentication session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ── Real JWT Login ──────────────────────────────────────────────────────────
  const login = useCallback(async (identifier, password, rememberMe = false) => {
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error?.message
          || data?.detail
          || data?.non_field_errors?.[0]
          || 'Invalid credentials. Please try again.';
        setAuthError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }

      // Persist JWT tokens
      if (data.access) localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

      // Build normalized user object
      const backendUser = data.user || {};
      const profileRole = backendUser?.profile?.role || '';

      const userObj = {
        id:          backendUser.id       || null,
        username:    backendUser.username || identifier,
        name:        backendUser.name     || `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim() || identifier,
        email:       backendUser.email    || '',
        role:        profileRole,
        roleDisplay: backendUser.role     || profileRole,
        company:     backendUser?.profile?.company || '',
        phone:       backendUser?.profile?.phone   || '',
        is_active:   backendUser.is_active ?? true,
        redirectPath: getRedirectPath(profileRole),
      };

      // Persist session
      const savedUser = saveSession(userObj, rememberMe);
      localStorage.setItem('user',             JSON.stringify(userObj));
      localStorage.setItem('dealflow360_user', JSON.stringify(userObj));
      localStorage.removeItem('dealflow360_logged_out');

      setUser(savedUser || userObj);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true, user: savedUser || userObj, redirectPath: getRedirectPath(profileRole) };

    } catch (networkErr) {
      const errMsg = 'Cannot connect to DealFlow360 server. Please ensure the backend is running.';
      setAuthError(errMsg);
      setLoading(false);
      return { success: false, error: errMsg };
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // Blacklist refresh token on backend (best-effort, non-blocking)
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      fetch(`${API_BASE}/login/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      }).catch(() => {});
    }

    clearSession();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('dealflow360_user');
    localStorage.removeItem('dealflow360_session');
    localStorage.setItem('dealflow360_logged_out', '1');

    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getStoredSessionHelper = useCallback(() => {
    return getStoredSession()
      || JSON.parse(localStorage.getItem('dealflow360_user') || localStorage.getItem('user') || 'null');
  }, []);

  const isStaff = user
    ? STAFF_ROLES.has((user.role || '').toUpperCase().replace(/\s+/g, '_'))
    : false;

  const value = {
    user,
    isAuthenticated,
    loading,
    error: authError,
    isStaff,
    login,
    logout,
    clearError,
    getStoredSession: getStoredSessionHelper,
    getRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => React.useContext(AuthContext);
