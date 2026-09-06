import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Inbox, Eye, ArrowUpDown, Filter, ChevronRight } from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const normalize = (s) => (s || '').toUpperCase().replace(/\s+/g, '_');

const FILTER_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'NEW', label: 'New' },
  { id: 'UNDER_NEGOTIATION', label: 'Under Negotiation' },
  { id: 'REVISED', label: 'Revised' },
  { id: 'APPROVAL_REQUIRED', label: 'Approval Required' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'CONFIRMED', label: 'Confirmed' }
];

export const CustomerQuotations = () => {
  const { quotations, customerQuotations } = useQuotations();
  const safeQuotes = Array.isArray(customerQuotations) ? customerQuotations : (Array.isArray(quotations) ? quotations : []);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Filtered & Sorted Quotations
  const filteredAndSortedQuotations = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();

    // 1. Filter
    const filtered = safeQuotes.filter(q => {
      const id = (q.quotationNumber || q.id || '').toLowerCase();
      const title = (q.title || '').toLowerCase();
      const s = normalize(q.status);

      // Search match
      const matchesSearch = !trimmed || id.includes(trimmed) || title.includes(trimmed);
      if (!matchesSearch) return false;

      // Tab match
      if (activeTab === 'ALL') return true;
      if (activeTab === 'NEW') return s === 'SENT' || s === 'NEW';
      if (activeTab === 'UNDER_NEGOTIATION') return s === 'UNDER_NEGOTIATION';
      if (activeTab === 'REVISED') return s === 'REVISED';
      if (activeTab === 'APPROVAL_REQUIRED') return s === 'APPROVAL_REQUIRED';
      if (activeTab === 'APPROVED') return s === 'APPROVED';
      if (activeTab === 'REJECTED') return s === 'REJECTED';
      if (activeTab === 'CONFIRMED') return s === 'CONFIRMED';
      return true;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'highest') {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === 'lowest') {
        return (a.total || 0) - (b.total || 0);
      }
      return 0;
    });
  }, [safeQuotes, searchTerm, activeTab, sortBy]);

  const getStatusBadge = (status) => {
    const s = normalize(status);
    switch (s) {
      case 'SENT':
      case 'NEW':
        return { label: 'Sent', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'UNDER_NEGOTIATION':
        return { label: 'Under Negotiation', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'REVISED':
        return { label: 'Revised', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'APPROVAL_REQUIRED':
        return { label: 'Approval Required', bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };
      case 'APPROVED':
        return { label: 'Approved', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'REJECTED':
        return { label: 'Rejected', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case 'CONFIRMED':
        return { label: 'Confirmed', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      default:
        return { label: status, bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div className="content-wrapper">
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Quotations
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Review commercial proposals, negotiate terms, or confirm active quotations.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by quote # or title..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 8px' }}>
            <ArrowUpDown size={14} color="#64748b" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                padding: '9px 4px',
                fontSize: '0.875rem',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Value</option>
              <option value="lowest">Lowest Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        {FILTER_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: isActive ? '1px solid #2563eb' : '1px solid transparent',
                background: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#1d4ed8' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quotations Table */}
      {filteredAndSortedQuotations.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#f1f5f9',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Inbox size={24} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
            No quotations found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 20px' }}>
            {searchTerm || activeTab !== 'ALL'
              ? 'No quotations match the active search criteria or status filter.'
              : 'When your sales representative sends you a quotation, it will appear here.'}
          </p>
          {(searchTerm || activeTab !== 'ALL') && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setActiveTab('ALL'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Quote #</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Quotation Title</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Date</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Valid Until</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Total</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedQuotations.map(q => {
                  const id = q.quotationNumber || q.id;
                  const badge = getStatusBadge(q.status);
                  const s = normalize(q.status);

                  let actionText = 'Review';
                  let actionRoute = `/customer/quotations/${id}`;
                  let actionBtnStyle = { background: '#2563eb', color: '#ffffff' };

                  if (s === 'UNDER_NEGOTIATION' || s === 'REVISED') {
                    actionText = 'Continue';
                    actionRoute = `/customer/quotations/${id}`;
                  } else if (s === 'APPROVED') {
                    actionText = 'Confirm';
                    actionRoute = `/customer/quotations/${id}`;
                    actionBtnStyle = { background: '#16a34a', color: '#ffffff' };
                  } else if (s === 'REJECTED') {
                    actionText = 'View Reason';
                    actionRoute = `/customer/quotations/${id}/reject`;
                    actionBtnStyle = { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
                  } else if (s === 'CONFIRMED') {
                    actionText = 'View';
                    actionRoute = `/customer/quotations/${id}`;
                    actionBtnStyle = { background: '#f1f5f9', color: '#334155' };
                  }

                  return (
                    <tr
                      key={id}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      onClick={() => navigate(actionRoute)}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                        {id}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#1e293b', fontWeight: 500 }}>
                        {q.title || 'Quotation Proposal'}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {formatDate(q.createdAt)}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {formatDate(q.validUntil)}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                        {formatCurrency(q.total)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); navigate(actionRoute); }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '7px',
                            border: 'none',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            ...actionBtnStyle
                          }}
                        >
                          {actionText}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
