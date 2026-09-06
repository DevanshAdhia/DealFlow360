import React from 'react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = ({ onTriggerNewQuote }) => {
  const navigate = useNavigate();

  const actionButtons = [
    {
      label: '+ New Quote',
      bg: '#e0e7ff',
      color: '#4338ca',
      action: () => {
        if (onTriggerNewQuote) onTriggerNewQuote();
        else navigate('/quotations/new');
      }
    },
    {
      label: '+ Add Customer',
      bg: '#dcfce7',
      color: '#15803d',
      action: () => navigate('/customers')
    },
    {
      label: '+ Add Product',
      bg: '#e0f2fe',
      color: '#0369a1',
      action: () => navigate('/quotations/new')
    },
    {
      label: 'View Orders',
      bg: '#fef3c7',
      color: '#b45309',
      action: () => navigate('/pipeline')
    },
    {
      label: 'Inventory Alerts',
      bg: '#fee2e2',
      color: '#b91c1c',
      action: () => navigate('/fulfillment')
    },
    {
      label: 'Audit Logs',
      bg: '#ede9fe',
      color: '#6d28d9',
      action: () => navigate('/reports')
    }
  ];

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Quick Actions</h3>

      <div style={styles.grid}>
        {actionButtons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.action}
            style={{
              ...styles.button,
              backgroundColor: btn.bg,
              color: btn.color
            }}
            className="quick-action-pill-btn"
          >
            {btn.label}
          </button>
        ))}
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
    gap: '1rem'
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.625rem'
  },
  button: {
    border: 'none',
    borderRadius: '8px',
    padding: '0.625rem 0.75rem',
    fontSize: '0.775rem',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 150ms ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};
