import React from 'react';

const BADGE_THEMES = {
  ACTIVE: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  APPROVED: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  CONFIRMED: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  PAID: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  FULFILLED: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },

  PENDING: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  'PENDING APPROVAL': { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  ISSUED: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  INVOICED: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'PARTIALLY PAID': { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  PARTIAL: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },

  DRAFT: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  INACTIVE: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  ARCHIVED: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  CANCELLED: { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  REJECTED: { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  OVERDUE: { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  BACKORDER: { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' },
  STALLED: { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' }
};

export const StatusBadge = ({ status = 'ACTIVE', size = 'md', className = '' }) => {
  const normStatus = String(status || '').toUpperCase().trim();
  const theme = BADGE_THEMES[normStatus] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isSmall ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderRadius: '9999px',
        backgroundColor: theme.bg,
        color: theme.color,
        border: `1px solid ${theme.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap'
      }}
      className={`status-badge-custom ${className}`}
    >
      {status}
    </span>
  );
};
