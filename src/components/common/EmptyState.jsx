import React from 'react';
import { FileQuestion } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'No Records Found',
  message = 'There are no items matching the selected criteria.',
  action = null
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        textAlign: 'center',
        margin: '1rem 0'
      }}
      className="empty-state-box"
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          marginBottom: '1rem'
        }}
      >
        <Icon size={26} />
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '420px', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
        {message}
      </p>

      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};
