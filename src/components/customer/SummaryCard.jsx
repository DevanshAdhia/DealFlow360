import React from 'react';

export const SummaryCard = ({ title, value, description, icon: Icon, color = 'blue', onClick }) => {
  const colorMap = {
    blue:   { bg: '#eff6ff', icon: '#2563eb', border: '#93c5fd', top: '#2563eb' },
    green:  { bg: '#f0fdf4', icon: '#16a34a', border: '#86efac', top: '#16a34a' },
    amber:  { bg: '#fffbeb', icon: '#d97706', border: '#fcd34d', top: '#d97706' },
    red:    { bg: '#fef2f2', icon: '#dc2626', border: '#fca5a5', top: '#dc2626' },
    purple: { bg: '#f5f3ff', icon: '#7c3aed', border: '#c4b5fd', top: '#7c3aed' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="summary-card"
      style={{ borderTop: `4px solid ${c.top}`, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={`${title}: ${value}`}
    >
      <div className="summary-card-top">
        <div className="summary-card-text">
          <div className="summary-card-title">{title}</div>
          <div className="summary-card-value">{value}</div>
        </div>
        <div className="summary-card-icon" style={{ backgroundColor: c.bg, color: c.icon, border: `1px solid ${c.border}` }}>
          <Icon size={22} />
        </div>
      </div>
      <div className="summary-card-desc">{description}</div>
    </div>
  );
};
