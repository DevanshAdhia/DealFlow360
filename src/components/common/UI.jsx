import React, { useState } from 'react';

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
        <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
          {typeof opt === 'object' ? opt.label : opt}
        </option>
      ))}
    </select>
  </div>
);

// Common Badge Component (Clean Visual Indicator)
export const Badge = ({ children, type = 'default' }) => {
  const map = {
    Active: 'success', 
    Inactive: 'default', 
    Suspended: 'danger',
    Pending: 'warning', 
    Approved: 'success', 
    Rejected: 'danger', 
    Healthy: 'success', 
    'Low Stock': 'warning', 
    Critical: 'danger',
    Backordered: 'danger',
    Draft: 'default',
    Issued: 'info',
    Paid: 'success',
    'Partially Paid': 'warning',
    Overdue: 'danger',
    Cancelled: 'default',
    Created: 'info',
    Processing: 'warning',
    'Partially Fulfilled': 'warning',
    Fulfilled: 'success',
    Shipped: 'success',
    Unread: 'warning',
    Read: 'default'
  };
  
  const badgeType = (type === 'default' && map[children]) ? map[children] : type;
  return <span className={`badge badge-${badgeType}`}>{children}</span>;
};

// Common Modal Component
export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ margin: 0, color: 'var(--secondary)' }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ fontSize: '1.5rem', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// Reusable Confirmation Dialog
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ marginBottom: 'var(--space-6)', marginTop: 'var(--space-2)', color: 'var(--text-secondary)' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Confirm Action</Button>
      </div>
    </Modal>
  );
};

// Premium Data Table Component with Sorting & Pagination (useState-only, no useMemo)
export const DataTable = ({ columns, data, loading, emptyMessage = 'No records found.', emptyAction }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting Logic using inline sort (no useMemo)
  let sortedData = [...data];
  if (sortConfig.key !== null) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination Logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  if (loading) {
    return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data...</div>;
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>{emptyMessage}</p>
        {emptyAction && emptyAction}
      </div>
    );
  }

  return (
    <div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  onClick={() => col.sortable && col.accessor ? requestSort(col.accessor) : null}
                  style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {col.Header}
                    {col.sortable && sortConfig.key === col.accessor && (
                      <span style={{ color: 'var(--primary)' }}>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.Cell ? col.Cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', borderTop: '1px solid var(--border)', background: 'var(--surface-secondary)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} results
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '0.25rem 0.75rem' }}>Prev</Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(page => (
              <Button 
                key={page} 
                variant={currentPage === page ? 'primary' : 'secondary'} 
                onClick={() => setCurrentPage(page)}
                style={{ padding: '0.25rem 0.75rem' }}
              >
                {page}
              </Button>
            ))}
            <Button variant="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '0.25rem 0.75rem' }}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};
