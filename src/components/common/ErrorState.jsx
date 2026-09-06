import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const ErrorState = ({
  title = 'Record Not Found',
  message = 'The requested record could not be found or has been removed.',
  backButton = { label: 'Go Back', path: '/sales/dashboard' }
}) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        textAlign: 'center',
        margin: '2rem auto',
        maxWidth: '540px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}
      className="error-state-box"
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          marginBottom: '1.25rem'
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
        {title}
      </h2>

      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
        {message}
      </p>

      {backButton && (
        <button
          onClick={() => {
            if (backButton.path) {
              navigate(backButton.path);
            } else {
              navigate(-1);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            backgroundColor: '#1e40af',
            color: '#ffffff',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
        >
          <ArrowLeft size={16} />
          {backButton.label}
        </button>
      )}
    </div>
  );
};
