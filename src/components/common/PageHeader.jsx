import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs.jsx';

export const PageHeader = ({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  backButton = null, // { label: 'Back to Quotations', path: '/sales/quotations' }
  actions = null
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: '1.5rem' }} className="page-header-container">
      {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          {backButton && (
            <button
              onClick={() => {
                if (typeof backButton.onClick === 'function') {
                  backButton.onClick();
                } else if (backButton.path) {
                  navigate(backButton.path);
                } else {
                  navigate(-1);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#475569',
                background: 'none',
                border: 'none',
                padding: '0 0 0.5rem 0',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1e40af'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
            >
              <ArrowLeft size={14} />
              {backButton.label || 'Back'}
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            {badge && (
              <div>{badge}</div>
            )}
          </div>

          {subtitle && (
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
