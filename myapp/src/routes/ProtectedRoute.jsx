import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { isRoleAuthorized } from '../utils/auth.js';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loaderBox}>
          <div className="spinner" style={{ width: '2rem', height: '2rem', color: 'var(--primary-500)' }} />
          <p style={styles.loadingText}>Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !isRoleAuthorized(user.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-dark)'
  },
  loaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  loadingText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)'
  }
};
