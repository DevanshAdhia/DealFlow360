import React from 'react';
import { formatCurrency } from '../../services/invoiceCalculationService';

export default function PaymentSummary({ 
  payments = [], 
  totalAmount = 0, 
  paidAmount = 0, 
  balanceAmount = 0,
  isFullyPaid,
  onOpenPaymentModal 
}) {
  return (
    <div className="invoice-items-card">
      <div className="invoice-items-section-header">
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Payment History & Ledger
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Audit of all financial settlements and receipts recorded against this invoice.
          </p>
        </div>
        {!isFullyPaid && (
          <button
            type="button"
            onClick={onOpenPaymentModal}
            className="btn btn-secondary"
            style={{ color: '#059669', borderColor: '#a7f3d0', background: 'rgba(16, 185, 129, 0.05)' }}
          >
            + Add Payment Record
          </button>
        )}
      </div>

      {payments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: 'var(--surface-secondary, #f8fafc)',
          borderRadius: 'var(--radius-lg, 8px)',
          border: '1.5px dashed var(--border, #cbd5e1)'
        }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No payments recorded yet</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Full balance of {formatCurrency(balanceAmount)} is outstanding.</p>
        </div>
      ) : (
        <div className="invoice-table-wrapper" style={{ border: '1px solid var(--border, #e2e8f0)', borderRadius: 'var(--radius-lg, 8px)' }}>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Receipt / Ref #</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Courier New, monospace' }}>
                    {p.id}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {p.paymentDate}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.paymentMethod || 'Bank Transfer'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge-status badge-status-paid">
                      {p.status || 'COMPLETED'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {p.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Financial Health Bar */}
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border, #e2e8f0)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          <span>Settlement Progress</span>
          <span>{Math.min(100, Math.round((paidAmount / (totalAmount || 1)) * 100))}% Paid</span>
        </div>
        <div style={{ width: '100%', background: 'var(--surface-secondary, #e2e8f0)', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
          <div 
            style={{
              height: '8px',
              borderRadius: '9999px',
              background: isFullyPaid ? '#10b981' : '#4f46e5',
              transition: 'width 0.4s ease',
              width: `${Math.min(100, Math.round((paidAmount / (totalAmount || 1)) * 100))}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
