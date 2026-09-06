import React from 'react';
import { formatCurrency } from '../../services/invoiceCalculationService';

export default function RecurringInvoiceLines({ items, subscription, billingSchedule }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div className="invoice-items-section-header">
        <div className="invoice-items-section-title">
          <span className="section-bullet recurring"></span>
          <span>Recurring Subscription Lines</span>
          <span className="badge-type badge-type-recurring" style={{ fontSize: '0.7rem' }}>
            Subscription Schedule
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
          Generated from active subscription contract billing cycles
        </span>
      </div>

      <div className="invoice-table-wrapper" style={{ border: '1px solid var(--border, #e2e8f0)', borderRadius: 'var(--radius-lg, 8px)' }}>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Service / Subscription</th>
              <th>Billing Period</th>
              <th style={{ textAlign: 'center' }}>Qty / Seats</th>
              <th style={{ textAlign: 'right' }}>Cycle Rate</th>
              <th style={{ textAlign: 'right' }}>Line Total</th>
              <th style={{ textAlign: 'center' }}>Cadence</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Contract: {item.subscriptionId || subscription?.subscriptionNumber || 'SUB-DEFAULT'}
                  </div>
                </td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {item.periodStart && item.periodEnd ? (
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.periodStart} to {item.periodEnd}
                    </span>
                  ) : billingSchedule ? (
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      Cycle {billingSchedule.cycleNumber || 'Current'}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Current active period</span>
                  )}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.quantity}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {formatCurrency(item.unitPrice)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency(item.totalPrice)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge-type badge-type-recurring">
                    {item.cadence || subscription?.billingFrequency || 'Monthly'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
