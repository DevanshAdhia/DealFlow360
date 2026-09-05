import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Copy, 
  Archive, 
  RotateCcw,
  Code,
  TrendingUp,
  Percent,
  Calendar,
  Trash2
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';
import { Badge, QuickStatusBadge, Button } from '../common/UI.jsx';
import { JsonInspectorModal } from '../common/JsonInspectorModal.jsx';
import { dataService } from '../../services/dataService.js';

export const QuotationTable = ({ 
  quotations = [], 
  onDuplicate, 
  onArchive, 
  onRestore, 
  onMoveStage,
  onDelete
}) => {
  const navigate = useNavigate();
  const [inspectQuote, setInspectQuote] = useState(null);

  const getHealthBadge = (health) => {
    switch (health) {
      case 'Healthy': return <Badge variant="success">Healthy</Badge>;
      case 'At Risk': return <Badge variant="warning">At Risk</Badge>;
      case 'Critical': return <Badge variant="danger">Critical</Badge>;
      default: return <Badge variant="neutral">{health || 'Normal'}</Badge>;
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft', variant: 'neutral' },
    { value: 'pending_approval', label: 'Pending Approval', variant: 'warning' },
    { value: 'negotiation', label: 'Negotiation', variant: 'info' },
    { value: 'confirmed', label: 'Confirmed', variant: 'success' }
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontFamily: 'var(--font-family)',
        fontSize: '0.8125rem'
      }} className="data-table">
        <thead>
          <tr style={{ backgroundColor: 'var(--surface-secondary)' }}>
            <th style={styles.th}>Quote Number & ID</th>
            <th style={styles.th}>Customer & Tier</th>
            <th style={styles.th}>Sales Rep</th>
            <th style={styles.th}>Total (INR)</th>
            <th style={styles.th}>Margin %</th>
            <th style={styles.th}>Stage</th>
            <th style={styles.th}>Health</th>
            <th style={styles.th}>Discount</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((quote) => {
            const tier = quote.customerTierId ? dataService.getCustomerTierById(quote.customerTierId) : null;
            const marginVal = Number(quote.margin) || 35.0;

            return (
              <tr 
                key={quote.id} 
                style={styles.tr} 
                className="data-table-row"
                onClick={() => navigate(`/quotations/${quote.quotationNumber || quote.id}`)}
              >
                {/* Quote Number & Internal ID */}
                <td style={styles.td}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: '800',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-light)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      width: 'fit-content'
                    }}>
                      {quote.quotationNumber || quote.id}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                      ID: {quote.id}
                    </span>
                  </div>
                </td>

                {/* Customer & Tier */}
                <td style={styles.td}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {quote.customerName || quote.customer}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {tier && (
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: '600',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: tier.badgeBg,
                          color: tier.badgeColor
                        }}>
                          {tier.name}
                        </span>
                      )}
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                        {quote.contactPerson || quote.contactEmail}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Sales Rep */}
                <td style={styles.td}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    {quote.salesRepName || 'Alex Morgan'}
                  </span>
                </td>

                {/* Total */}
                <td style={styles.td}>
                  <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>
                    {formatINR(quote.total || quote.subtotal || 0)}
                  </span>
                </td>

                {/* Margin % */}
                <td style={styles.td}>
                  <span style={{
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: marginVal < 25 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: marginVal < 25 ? '#EF4444' : '#059669',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <TrendingUp size={11} />
                    {marginVal}%
                  </span>
                </td>

                {/* Stage dropdown */}
                <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                  <QuickStatusBadge
                    currentStatus={quote.stage || 'draft'}
                    options={statusOptions}
                    onStatusChange={(newStage) => onMoveStage && onMoveStage(quote.id, newStage)}
                  />
                </td>

                {/* Health */}
                <td style={styles.td}>
                  {getHealthBadge(quote.health)}
                </td>

                {/* Discount */}
                <td style={styles.td}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: (quote.discount || 0) > 15 ? 'var(--color-error)' : 'var(--text-secondary)'
                  }}>
                    {quote.discount || 0}%
                  </span>
                </td>

                {/* Action Buttons */}
                <td style={{ ...styles.td, textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                    {/* View Details */}
                    <button
                      onClick={() => navigate(`/quotations/${quote.quotationNumber || quote.id}`)}
                      title="View Commercial Terms"
                      style={styles.actionBtn}
                      className="table-action-btn"
                    >
                      <Eye size={14} />
                    </button>

                    {/* View Raw JSON */}
                    <button
                      onClick={() => setInspectQuote(quote)}
                      title="Inspect Raw JSON Payload"
                      style={{ ...styles.actionBtn, color: '#4F46E5', backgroundColor: '#EEF2FF' }}
                      className="table-action-btn"
                    >
                      <Code size={14} />
                    </button>

                    {/* Clone */}
                    <button
                      onClick={() => onDuplicate && onDuplicate(quote.id)}
                      title="Clone Draft"
                      style={styles.actionBtn}
                      className="table-action-btn"
                    >
                      <Copy size={14} />
                    </button>

                    {/* Archive / Restore */}
                    {quote.isArchived ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore && onRestore(quote.id);
                        }}
                        title="Restore to Active"
                        style={{ ...styles.actionBtn, color: 'var(--color-success)' }}
                        className="table-action-btn"
                      >
                        <RotateCcw size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive && onArchive(quote.id);
                        }}
                        title="Archive Record"
                        style={styles.actionBtn}
                        className="table-action-btn"
                      >
                        <Archive size={14} />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete quotation ${quote.quotationNumber || quote.id}?`)) {
                          onDelete && onDelete(quote.id);
                        }
                      }}
                      title="Delete Quotation"
                      style={{ ...styles.actionBtn, color: '#ef4444' }}
                      className="table-action-btn delete-quote-btn"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Row-level Live JSON Inspector Modal */}
      {inspectQuote && (
        <JsonInspectorModal
          isOpen={Boolean(inspectQuote)}
          onClose={() => setInspectQuote(null)}
          quotationData={inspectQuote}
          title={`Quotation JSON: ${inspectQuote.quotationNumber || inspectQuote.id}`}
        />
      )}
    </div>
  );
};

const styles = {
  th: {
    padding: '0.75rem 1rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle'
  },
  tr: {
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
};
