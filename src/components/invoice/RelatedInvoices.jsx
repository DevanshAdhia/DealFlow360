import React from 'react';
import { formatCurrency, getInvoiceTypeBadgeClass, getPaymentStatusBadgeClass } from '../../services/invoiceCalculationService';

export default function RelatedInvoices({ relatedInvoices = [], currentInvoiceId, onSelectInvoice }) {
  if (!relatedInvoices || relatedInvoices.length === 0) return null;

  return (
    <div className="invoice-items-card">
      <div className="invoice-items-section-header">
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Related Invoices
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Other invoices associated with this customer or order/subscription relationships.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {relatedInvoices.map((inv) => {
          return (
            <div
              key={inv.id}
              onClick={() => onSelectInvoice(inv.id)}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-lg, 8px)',
                border: '1.5px solid var(--border, #e2e8f0)',
                background: 'var(--surface-secondary, #f8fafc)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="clickable-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--primary, #4f46e5)', fontFamily: 'Courier New, monospace' }}>
                  {inv.invoiceNumber}
                </span>
                <span className={`badge-status badge-status-${(inv.paymentStatus || 'unpaid').toLowerCase()}`}>
                  {inv.paymentStatus.replace('_', ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span className={`badge-type badge-type-${(inv.invoiceType || 'mixed').toLowerCase().replace('_', '')}`}>
                  {inv.invoiceType.replace('_', ' ')}
                </span>
                <span>Due: {inv.dueDate || '—'}</span>
              </div>

              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCurrency(inv.totalAmount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
