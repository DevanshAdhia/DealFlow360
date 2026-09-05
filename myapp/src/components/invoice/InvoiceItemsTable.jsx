import React from 'react';
import OneTimeInvoiceLines from './OneTimeInvoiceLines';
import RecurringInvoiceLines from './RecurringInvoiceLines';
import { formatCurrency } from '../../services/invoiceCalculationService';

export default function InvoiceItemsTable({ 
  oneTimeItems = [], 
  recurringItems = [], 
  subscription, 
  billingSchedule,
  reconciliationSummary,
  totalAmount,
  taxAmount = 0
}) {
  const oneTimeSubtotal = oneTimeItems.reduce((acc, it) => acc + (it.totalPrice || 0), 0);
  const recurringSubtotal = recurringItems.reduce((acc, it) => acc + (it.totalPrice || 0), 0);
  const calculatedGrandTotal = totalAmount ?? (oneTimeSubtotal + recurringSubtotal + taxAmount);

  return (
    <div className="invoice-items-card">
      <div className="invoice-items-section-header">
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Line Items & Billing Structure
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Single invoice entity grouping one-time physical items and recurring subscription schedules.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {oneTimeItems.length > 0 && (
            <span className="badge-type badge-type-onetime">
              {oneTimeItems.length} One-Time Line{oneTimeItems.length > 1 ? 's' : ''}
            </span>
          )}
          {recurringItems.length > 0 && (
            <span className="badge-type badge-type-recurring">
              {recurringItems.length} Recurring Line{recurringItems.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ONE-TIME ORDER LINES (if any) */}
      <OneTimeInvoiceLines 
        items={oneTimeItems} 
        reconciliationSummary={reconciliationSummary} 
      />

      {/* RECURRING SUBSCRIPTION LINES (if any) */}
      <RecurringInvoiceLines 
        items={recurringItems} 
        subscription={subscription} 
        billingSchedule={billingSchedule} 
      />

      {/* Empty State if neither */}
      {oneTimeItems.length === 0 && recurringItems.length === 0 && (
        <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No line items found for this invoice.
        </div>
      )}

      {/* Totals & Financial Breakdown */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <div className="invoice-totals-box">
          {oneTimeItems.length > 0 && (
            <div className="invoice-total-row">
              <span>One-Time Subtotal:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(oneTimeSubtotal)}</span>
            </div>
          )}
          {recurringItems.length > 0 && (
            <div className="invoice-total-row">
              <span>Recurring Subtotal:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(recurringSubtotal)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="invoice-total-row">
              <span>Applicable Tax:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="invoice-total-row grand-total">
            <span>Invoice Total:</span>
            <span className="amount">{formatCurrency(calculatedGrandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
