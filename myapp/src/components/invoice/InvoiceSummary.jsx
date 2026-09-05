import React from 'react';
import { Printer, CreditCard } from 'lucide-react';
import { formatCurrency, getInvoiceTypeBadgeClass, getPaymentStatusBadgeClass } from '../../services/invoiceCalculationService';

export default function InvoiceSummary({ invoiceDetails, onOpenPaymentModal, onPrint }) {
  if (!invoiceDetails || !invoiceDetails.invoice) return null;

  const { invoice, customer, totalAmount, paidAmount, balanceAmount, isFullyPaid } = invoiceDetails;

  return (
    <div className="invoice-items-card">
      <div className="invoice-page-header" style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border, #e2e8f0)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {invoice.invoiceNumber}
            </h1>
            <span className={`badge-type badge-type-${(invoice.invoiceType || 'mixed').toLowerCase().replace('_', '')}`}>
              {invoice.invoiceType.replace('_', ' ')}
            </span>
            <span className={`badge-status badge-status-${(invoice.paymentStatus || 'unpaid').toLowerCase()}`}>
              {invoice.paymentStatus.replace('_', ' ')}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Customer: <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{customer?.name || invoice.customerId}</strong>
            {customer?.companyName && ` (${customer.companyName})`} &bull; Contact: {customer?.email || 'N/A'}
          </p>
        </div>

        <div className="invoice-header-actions">
          <button
            type="button"
            onClick={onPrint}
            className="btn btn-secondary"
          >
            <Printer size={16} style={{ marginRight: '6px' }} />
            Print / Summary
          </button>
          
          <button
            type="button"
            onClick={onOpenPaymentModal}
            disabled={isFullyPaid}
            className={`btn ${isFullyPaid ? 'btn-secondary' : 'btn-primary'}`}
            style={!isFullyPaid ? { background: '#059669', borderColor: '#059669', color: '#fff' } : {}}
          >
            <CreditCard size={16} style={{ marginRight: '6px' }} />
            {isFullyPaid ? 'Fully Paid' : 'Record Payment'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', paddingTop: '0.5rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--surface-secondary, #f8fafc)', borderRadius: 'var(--radius-lg, 8px)', border: '1px solid var(--border, #e2e8f0)' }}>
          <span style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Issue Date</span>
          <span style={{ marginTop: '0.25rem', display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{invoice.issueDate || '—'}</span>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--surface-secondary, #f8fafc)', borderRadius: 'var(--radius-lg, 8px)', border: '1px solid var(--border, #e2e8f0)' }}>
          <span style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Due Date</span>
          <span style={{ marginTop: '0.25rem', display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{invoice.dueDate || '—'}</span>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--surface-secondary, #f8fafc)', borderRadius: 'var(--radius-lg, 8px)', border: '1px solid var(--border, #e2e8f0)' }}>
          <span style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>Order Ref</span>
          <span style={{ marginTop: '0.25rem', display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary, #4f46e5)' }}>{invoice.orderId || '—'}</span>
        </div>
        <div style={{ padding: '0.75rem', background: 'rgba(79, 70, 229, 0.05)', borderRadius: 'var(--radius-lg, 8px)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
          <span style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>Total Amount</span>
          <span style={{ marginTop: '0.25rem', display: 'block', fontSize: '1rem', fontWeight: 800, color: '#4f46e5' }}>{formatCurrency(totalAmount)}</span>
        </div>
        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-lg, 8px)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Paid Amount</span>
          <span style={{ marginTop: '0.25rem', display: 'block', fontSize: '1rem', fontWeight: 800, color: '#059669' }}>{formatCurrency(paidAmount)}</span>
        </div>
        <div style={{
          padding: '0.75rem',
          background: balanceAmount > 0 ? 'rgba(245, 158, 11, 0.08)' : 'var(--surface-secondary, #f8fafc)',
          borderRadius: 'var(--radius-lg, 8px)',
          border: balanceAmount > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border, #e2e8f0)'
        }}>
          <span style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: balanceAmount > 0 ? '#b45309' : 'var(--text-muted)', textTransform: 'uppercase' }}>
            Balance Due
          </span>
          <span style={{ marginTop: '0.25rem', display: 'block', fontSize: '1rem', fontWeight: 800, color: balanceAmount > 0 ? '#b45309' : 'var(--text-secondary)' }}>
            {formatCurrency(balanceAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
