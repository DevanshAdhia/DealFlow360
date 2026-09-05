import React from 'react';

// Common Button Component
export const Button = ({ children, variant = 'primary', className = '', ...props }) => (
  <button className={`btn btn-${variant} ${className}`} {...props}>
    {children}
  </button>
);

// Common Input Component
export const Input = ({ label, ...props }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <input className="form-input" {...props} />
  </div>
);

// Common Select Component
export const Select = ({ label, options, ...props }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <select className="form-select" {...props}>
      {options.map((opt, i) => (
        <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
  </div>
);

// Common Badge Component
export const Badge = ({ children, type = 'default' }) => {
  const map = {
    Active: 'success', Inactive: 'default', Pending: 'warning', 
    Approved: 'success', Rejected: 'danger', Healthy: 'success', 
    'Low Stock': 'warning', Critical: 'danger'
  };
  const badgeType = type === 'default' && map[children] ? map[children] : type;
  return <span className={`badge badge-${badgeType}`}>{children}</span>;
};

// Common Modal Component
export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
