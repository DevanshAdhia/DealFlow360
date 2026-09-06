import React from 'react';
import { Filter, Search, Tag, DollarSign } from 'lucide-react';

export const InvoiceFilters = ({
  selectedType = 'ALL',
  onTypeChange,
  selectedStatus = 'ALL',
  onStatusChange,
  searchTerm = '',
  onSearchChange
}) => {
  const typeFilters = [
    { id: 'ALL', label: 'All Types' },
    { id: 'ONE_TIME', label: 'One-Time' },
    { id: 'RECURRING', label: 'Recurring' },
    { id: 'MIXED', label: 'Mixed' }
  ];

  const statusFilters = [
    { id: 'ALL', label: 'All Statuses' },
    { id: 'UNPAID', label: 'Unpaid' },
    { id: 'PARTIALLY_PAID', label: 'Partially Paid' },
    { id: 'PAID', label: 'Paid' },
    { id: 'OVERDUE', label: 'Overdue' }
  ];

  return (
    <div className="invoice-toolbar">
      {/* Search and Dropdowns Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-secondary)',
          padding: '0.45rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          minWidth: '260px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>

        {/* Invoice Type Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            Type:
          </span>
          {typeFilters.map(t => (
            <button
              key={t.id}
              onClick={() => onTypeChange(t.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid',
                cursor: 'pointer',
                background: selectedType === t.id ? 'var(--primary-500)' : 'var(--bg-secondary)',
                color: selectedType === t.id ? '#ffffff' : 'var(--text-secondary)',
                borderColor: selectedType === t.id ? 'var(--primary-500)' : 'var(--border-color)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Status Filter Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
          Payment:
        </span>
        {statusFilters.map(s => (
          <button
            key={s.id}
            onClick={() => onStatusChange(s.id)}
            style={{
              padding: '0.3rem 0.7rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.775rem',
              fontWeight: selectedStatus === s.id ? 700 : 500,
              border: '1px solid',
              cursor: 'pointer',
              background: selectedStatus === s.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: selectedStatus === s.id ? 'var(--primary-600)' : 'var(--text-secondary)',
              borderColor: selectedStatus === s.id ? 'var(--primary-500)' : 'var(--border-color)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};
