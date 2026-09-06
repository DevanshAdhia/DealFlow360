import React from 'react';

export const SummaryCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  badgeText,
  badgeType = 'neutral',
  color = '#2563eb'
}) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        minWidth: 0
      }}
      className="summary-card-box"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {value}
        </span>
        {badgeText && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
            backgroundColor: badgeType === 'success' ? '#dcfce7' : badgeType === 'warning' ? '#fef3c7' : '#f1f5f9',
            color: badgeType === 'success' ? '#166534' : badgeType === 'warning' ? '#92400e' : '#475569'
          }}>
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
          {subtext}
        </div>
      )}
    </div>
  );
};
