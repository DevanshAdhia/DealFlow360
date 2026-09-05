import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={13} color="#94a3b8" />}
            {item.path && !isLast ? (
              <Link 
                to={item.path} 
                style={{ 
                  color: '#475569', 
                  textDecoration: 'none', 
                  fontWeight: 500,
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1e40af'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: isLast ? '#0f172a' : '#64748b', fontWeight: isLast ? 600 : 400 }}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
