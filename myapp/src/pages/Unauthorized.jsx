import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { getRoleBadgeColor } from '../data/users.js';

export const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card} className="card-surface glass-panel">
        <div style={styles.iconWrapper}>
          <ShieldAlert size={36} color="var(--color-error)" />
        </div>

        <h1 style={styles.title}>Access Restricted</h1>
        
        <p style={styles.description}>
          You don't have permission to access this area of DealFlow360.
        </p>

        {user && (
          <div style={styles.userInfoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Current User:</span>
              <span style={styles.infoValue}>{user.name}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Active Role:</span>
              <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                {user.roleLabel}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Assigned Workspace:</span>
              <span style={styles.infoValue}>{user.assignedWorkspace}</span>
            </div>
          </div>
        )}

        <div style={styles.actions}>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-primary"
            style={styles.actionBtn}
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - var(--header-height) - 4rem)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.25rem'
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-error-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800'
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  userInfoBox: {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'var(--bg-surface-2)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    textAlign: 'left'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8125rem'
  },
  infoLabel: {
    color: 'var(--text-muted)'
  },
  infoValue: {
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  actions: {
    width: '100%',
    marginTop: '0.5rem'
  },
  actionBtn: {
    width: '100%',
    padding: '0.75rem'
  }
};
