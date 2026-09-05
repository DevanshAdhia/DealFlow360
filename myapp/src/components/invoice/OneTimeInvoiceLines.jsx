import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../services/invoiceCalculationService';

export default function OneTimeInvoiceLines({ items, reconciliationSummary }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div className="invoice-items-section-header">
        <div className="invoice-items-section-title">
          <span className="section-bullet onetime"></span>
          <span>One-Time Order Lines</span>
          <span className="badge-type badge-type-onetime" style={{ fontSize: '0.7rem' }}>
            Delivery Reconciled
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
          Rule: Invoiced qty cannot exceed dispatched qty
        </span>
      </div>

      <div className="invoice-table-wrapper" style={{ border: '1px solid var(--border, #e2e8f0)', borderRadius: 'var(--radius-lg, 8px)' }}>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item / Description</th>
              <th style={{ textAlign: 'center' }}>Ordered</th>
              <th style={{ textAlign: 'center' }}>Fulfilled</th>
              <th style={{ textAlign: 'center', background: 'rgba(79, 70, 229, 0.04)', color: 'var(--primary, #4f46e5)' }}>Invoiced Qty</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Line Total</th>
              <th style={{ textAlign: 'center' }}>Fulfillment Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const ordered = item.orderedQuantity ?? item.quantity ?? 1;
              const fulfilled = item.fulfilledQuantity ?? item.quantity ?? 1;
              const invoiced = item.quantity;
              const isPartiallyFulfilled = fulfilled < ordered;

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.description}</div>
                    {item.productId && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {item.productId}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {ordered}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                    {fulfilled}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary, #4f46e5)', background: 'rgba(79, 70, 229, 0.04)' }}>
                    {invoiced}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(item.totalPrice)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isPartiallyFulfilled ? (
                      <span className="reconciliation-chip partial">
                        Partial ({fulfilled}/{ordered})
                      </span>
                    ) : (
                      <span className="reconciliation-chip ok">
                        Fulfilled & Billed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reconciliationSummary?.hasBackorder && (
        <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.75rem', color: '#92400e' }}>
          <AlertTriangle size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>Reconciliation Alert:</strong> Some items have unfulfilled quantities transferred to backorder. 
            Only confirmed dispatched hardware has been billed on this invoice.
          </div>
        </div>
      )}
    </div>
  );
}
