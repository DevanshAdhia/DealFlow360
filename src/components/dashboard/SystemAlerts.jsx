import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SystemAlerts = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.card}>
      {/* Card Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>System Alerts</h3>
        <span style={styles.activeBadge}>2 ACTIVE</span>
      </div>

      {/* Alerts List */}
      <div style={styles.alertsList}>
        {/* Alert 1 */}
        <div 
          style={styles.alertItemRed}
          onClick={() => navigate('/fulfillment')}
        >
          <div style={styles.sphereRed} />
          <div style={styles.alertTextGroup}>
            <div style={styles.alertTitleRed}>1 products below reorder level</div>
            <div style={styles.alertSubRed}>Inventory requires immediate attention</div>
          </div>
        </div>

        {/* Alert 2 */}
        <div 
          style={styles.alertItemYellow}
          onClick={() => navigate('/approvals')}
        >
          <div style={styles.sphereYellow} />
          <div style={styles.alertTextGroup}>
            <div style={styles.alertTitleYellow}>1 quotes pending approval</div>
            <div style={styles.alertSubYellow}>Awaiting Sales Manager review</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  activeBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    fontSize: '0.6875rem',
    fontWeight: '800',
    padding: '0.2rem 0.55rem',
    borderRadius: '9999px',
    letterSpacing: '0.04em'
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem'
  },
  alertItemRed: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '10px',
    padding: '0.75rem 0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    transition: 'all 150ms ease'
  },
  sphereRed: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #f87171, #dc2626)',
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
    flexShrink: 0
  },
  alertItemYellow: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    borderRadius: '10px',
    padding: '0.75rem 0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    transition: 'all 150ms ease'
  },
  sphereYellow: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #fde047, #d97706)',
    boxShadow: '0 2px 4px rgba(217, 119, 6, 0.3)',
    flexShrink: 0
  },
  alertTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  alertTitleRed: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#991b1b'
  },
  alertSubRed: {
    fontSize: '0.7rem',
    color: '#b91c1c',
    marginTop: '1px'
  },
  alertTitleYellow: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#92400e'
  },
  alertSubYellow: {
    fontSize: '0.7rem',
    color: '#b45309',
    marginTop: '1px'
  }
};
