import React from 'react';

export const AnalyticsKPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'var(--primary-500)',
  bg = 'rgba(59, 130, 246, 0.12)'
}) => {
  return (
    <div className="reports-kpi-card">
      <div>
        <div className="reports-kpi-title">{title}</div>
        <div className="reports-kpi-value">{value}</div>
        {subtitle && <div className="reports-kpi-sub">{subtitle}</div>}
      </div>
      <div className="reports-kpi-icon" style={{ background: bg, color }}>
        {Icon && <Icon size={20} />}
      </div>
    </div>
  );
};
