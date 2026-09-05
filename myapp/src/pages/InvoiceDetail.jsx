import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoiceContext';
import { formatINR } from '../utils/formatters.js';
import InvoiceTimeline from '../components/invoice/InvoiceTimeline';
import RecordPaymentModal from '../components/invoice/RecordPaymentModal';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  CreditCard, 
  Printer, 
  CheckCircle, 
  Package, 
  Repeat, 
  Layers, 
  Clock, 
  DollarSign, 
  Building2, 
  ExternalLink,
  Download 
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

const STATUS_MAP = {
  PAID: 'billing-badge-paid',
  Paid: 'billing-badge-paid',
  PARTIALLY_PAID: 'billing-badge-issued',
  'Partially Paid': 'billing-badge-issued',
  UNPAID: 'billing-badge-neutral',
  Unpaid: 'billing-badge-neutral',
  ISSUED: 'billing-badge-issued',
  Issued: 'billing-badge-issued',
  OVERDUE: 'billing-badge-overdue',
  Overdue: 'billing-badge-overdue',
  CANCELLED: 'billing-badge-cancelled',
  Cancelled: 'billing-badge-cancelled',
};

const TYPE_BADGE_MAP = {
  ONE_TIME: 'badge-type badge-type-onetime',
  RECURRING: 'badge-type badge-type-recurring',
  MIXED: 'badge-type badge-type-mixed'
};

export default function InvoiceDetail() {
  const { id, invoiceId } = useParams();
  const navigate = useNavigate();
  const { invoices = [], getInvoiceDetails, recordPayment } = useInvoices();
  const { success, error } = useToast();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const targetId = invoiceId || id || (invoices[0]?.id || 'INV-1042');
  const invoiceDetails = getInvoiceDetails(targetId);

  if (!invoiceDetails || !invoiceDetails.invoice) {
    return (
      <div className="invoice-detail-page">
        <div className="billing-empty-state">
          <FileText size={48} />
          <h2>Invoice Not Found</h2>
          <p>Could not locate invoice with identifier &ldquo;{targetId}&rdquo;.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/sales/invoices')}>
            <ArrowLeft size={14} /> Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const {
    invoice,
    customer,
    items = [],
    payments = [],
    oneTimeItems = [],
    recurringItems = [],
    subscription,
    billingSchedule,
    reconciliationSummary = {},
    timelineStages = [],
    totalAmount = 0,
    paidAmount = 0,
    balanceAmount = 0,
    isFullyPaid = false,
    relatedInvoices = []
  } = invoiceDetails;

  const oneTimeSubtotal = (oneTimeItems || []).reduce((acc, it) => acc + (it.totalPrice || it.lineTotal || 0), 0);
  const recurringSubtotal = (recurringItems || []).reduce((acc, it) => acc + (it.totalPrice || it.lineTotal || 0), 0);

  const handleRecordPaymentSubmit = (paymentPayload) => {
    try {
      recordPayment(invoice.id, paymentPayload);
      success(
        'Payment Recorded Successfully',
        `Recorded ₹${Number(paymentPayload.amount).toLocaleString('en-IN')} against ${invoice.invoiceNumber || invoice.id}.`
      );
      setIsPaymentModalOpen(false);
    } catch (err) {
      error('Payment Failed', err.message || 'Unable to record payment.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const statusBadgeClass = STATUS_MAP[invoice.paymentStatus] || 'billing-badge-neutral';
  const typeBadgeClass = TYPE_BADGE_MAP[invoice.invoiceType] || 'badge-type badge-type-mixed';

  return (
    <div className="invoice-detail-page print:p-0">
      {/* 1. Page Header */}
      <div className="invoice-detail-header print:hidden">
        <div>
          <button className="invoice-detail-back-btn" onClick={() => navigate('/sales/invoices')}>
            <ArrowLeft size={15} /> Back to Invoices
          </button>

          <h1 className="invoice-detail-id">
            <FileText size={24} color="var(--primary-500)" />
            {invoice.invoiceNumber || invoice.id}
            <span className={`billing-badge ${statusBadgeClass}`}>
              {invoice.paymentStatus ? invoice.paymentStatus.replace('_', ' ') : 'UNPAID'}
            </span>
            <span className={typeBadgeClass} style={{ fontSize: '0.75rem' }}>
              {invoice.invoiceType ? invoice.invoiceType.replace('_', ' ') : 'MIXED'}
            </span>
          </h1>

          <div className="invoice-detail-meta">
            <span className="invoice-detail-meta-item">
              <Calendar size={14} />
              Issued: <strong>{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('en-IN') : '—'}</strong>
            </span>
            <span className="invoice-detail-meta-item">
              <Calendar size={14} />
              Due: <strong style={{ color: invoice.paymentStatus === 'OVERDUE' ? 'var(--color-error)' : 'inherit' }}>
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : '—'}
              </strong>
            </span>
            <span className="invoice-detail-meta-item">
              <Building2 size={14} />
              Customer: <strong style={{ color: 'var(--text-primary)' }}>{customer?.name || invoice.customerId}</strong>
              {customer?.companyName && ` (${customer.companyName})`}
            </span>
          </div>
        </div>

        <div className="invoice-detail-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              const dataStr = JSON.stringify(invoiceDetails, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `invoice_${invoice.invoiceNumber || invoice.id}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              success('Invoice Downloaded', `Saved invoice_${invoice.invoiceNumber || invoice.id}.json`);
            }}
            title="Download Invoice Data as JSON"
          >
            <Download size={15} /> Download JSON
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print / PDF
          </button>
          {!isFullyPaid && (
            <button className="btn btn-primary" onClick={() => setIsPaymentModalOpen(true)}>
              <CreditCard size={16} /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Fully Paid Banner */}
      {isFullyPaid && (
        <div className="invoice-paid-banner">
          <CheckCircle size={22} />
          <span>Payment settled in full on {(payments?.length > 0 ? payments[payments.length - 1]?.paymentDate : null) || 'recent date'}. Outstanding balance is ₹0.</span>
        </div>
      )}

      {/* 2. Lifecycle Stepper Timeline */}
      <InvoiceTimeline stages={timelineStages} />

      {/* 3. Two-Column Grid: Line Items on Left, Side View Details on Right */}
      <div className="invoice-body-grid">
        {/* Left Column: Line Items & Payment History */}
        <div className="invoice-line-items">
          {/* ONE-TIME ORDER LINES */}
          {oneTimeItems.length > 0 && (
            <div className="invoice-items-panel">
              <div className="invoice-items-panel-header">
                <Package size={16} color="var(--primary-500)" />
                <span>One-Time Order Lines</span>
                <span className="badge-type badge-type-onetime" style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>
                  Delivery Reconciled
                </span>
              </div>

              <div className="billing-table-wrap">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Item / Product</th>
                      <th style={{ textAlign: 'center' }}>Ordered</th>
                      <th style={{ textAlign: 'center' }}>Fulfilled</th>
                      <th style={{ textAlign: 'center', background: 'rgba(79, 70, 229, 0.04)', color: 'var(--primary-600)' }}>Invoiced Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Line Total</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oneTimeItems.map((item) => {
                      const ordered = item.orderedQuantity ?? item.quantity ?? 1;
                      const fulfilled = item.fulfilledQuantity ?? item.quantity ?? 1;
                      const invoiced = item.quantity;
                      const isPartial = fulfilled < ordered;

                      return (
                        <tr key={item.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.description}</div>
                            {item.productId && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {item.productId}</div>}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{ordered}</td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: '#059669' }}>{fulfilled}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary-600)', background: 'rgba(79, 70, 229, 0.04)' }}>{invoiced}</td>
                          <td style={{ textAlign: 'right' }}>{formatINR(item.unitPrice)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }} className="billing-amount-cell">{formatINR(item.totalPrice)}</td>
                          <td style={{ textAlign: 'center' }}>
                            {isPartial ? (
                              <span className="reconciliation-chip partial">Partial ({fulfilled}/{ordered})</span>
                            ) : (
                              <span className="reconciliation-chip ok">Fulfilled & Billed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="invoice-items-subtotal">
                <span className="summary-label">One-Time Subtotal:</span>
                <span className="summary-value">{formatINR(oneTimeSubtotal)}</span>
              </div>
            </div>
          )}

          {/* RECURRING SUBSCRIPTION LINES */}
          {recurringItems.length > 0 && (
            <div className="invoice-items-panel">
              <div className="invoice-items-panel-header recurring">
                <Repeat size={16} />
                <span>Recurring Subscription Lines</span>
                <span className="badge-type badge-type-recurring" style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>
                  Subscription Schedule
                </span>
              </div>

              <div className="billing-table-wrap">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Service / Plan</th>
                      <th>Billing Period</th>
                      <th style={{ textAlign: 'center' }}>Seats / Qty</th>
                      <th style={{ textAlign: 'right' }}>Cycle Rate</th>
                      <th style={{ textAlign: 'right' }}>Line Total</th>
                      <th style={{ textAlign: 'center' }}>Cadence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.description}</div>
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
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatINR(item.unitPrice)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }} className="billing-amount-cell">{formatINR(item.totalPrice)}</td>
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

              <div className="invoice-items-subtotal recurring">
                <span className="summary-label">Recurring Subtotal:</span>
                <span className="summary-value">{formatINR(recurringSubtotal)}</span>
              </div>
            </div>
          )}

          {/* PAYMENT HISTORY & LEDGER PANEL */}
          <div className="invoice-items-panel">
            <div className="invoice-items-panel-header">
              <CreditCard size={16} color="var(--primary-500)" />
              <span>Payment Ledger & Receipts</span>
              {!isFullyPaid && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="billing-table-action-btn"
                  style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                >
                  + Add Payment
                </button>
              )}
            </div>

            {payments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem', display: 'block' }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No payment records found yet. Balance of {formatINR(balanceAmount)} is outstanding.</p>
              </div>
            ) : (
              <div className="billing-table-wrap">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th style={{ textAlign: 'right' }}>Amount Paid</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th>Reference / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td><span className="billing-invoice-id">{p.id}</span></td>
                        <td>{p.paymentDate}</td>
                        <td style={{ fontWeight: 600 }}>{p.paymentMethod || 'Bank Transfer'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          {formatINR(p.amount)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="billing-badge billing-badge-paid">
                            {p.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {p.notes || p.reference || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Side View Details */}
        <div className="invoice-sidebar print:hidden">
          {/* Financial Summary Panel */}
          <div className="invoice-panel">
            <div className="invoice-panel-header">Financial Summary</div>
            <div className="invoice-panel-body">
              {oneTimeItems.length > 0 && (
                <div className="invoice-summary-row">
                  <span className="summary-label">One-Time Items</span>
                  <span className="summary-value">{formatINR(oneTimeSubtotal)}</span>
                </div>
              )}
              {recurringItems.length > 0 && (
                <div className="invoice-summary-row">
                  <span className="summary-label">Recurring Services</span>
                  <span className="summary-value">{formatINR(recurringSubtotal)}</span>
                </div>
              )}
              <div className="invoice-summary-row total-row">
                <span className="summary-label">Total Amount</span>
                <span className="summary-value total">{formatINR(totalAmount)}</span>
              </div>
              <div className="invoice-summary-row">
                <span className="summary-label">Amount Settled</span>
                <span className="summary-value" style={{ color: '#059669', fontWeight: 700 }}>
                  {formatINR(paidAmount)}
                </span>
              </div>
              <div className="invoice-summary-row" style={{ borderBottom: 'none' }}>
                <span className="summary-label">Balance Due</span>
                <span className="summary-value" style={{ color: balanceAmount > 0 ? '#b45309' : '#059669', fontWeight: 800 }}>
                  {formatINR(balanceAmount)}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <span>Settlement</span>
                  <span>{Math.min(100, Math.round((paidAmount / (totalAmount || 1)) * 100))}%</span>
                </div>
                <div style={{ width: '100%', background: 'var(--surface-secondary, #e2e8f0)', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '6px',
                      borderRadius: '9999px',
                      background: isFullyPaid ? '#10b981' : '#4f46e5',
                      width: `${Math.min(100, Math.round((paidAmount / (totalAmount || 1)) * 100))}%`,
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              {!isFullyPaid && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}
                >
                  <CreditCard size={16} /> Pay Outstanding Balance
                </button>
              )}
            </div>
          </div>

          {/* References & Relations Panel */}
          <div className="invoice-panel">
            <div className="invoice-panel-header">References & Commercial Relations</div>
            <div className="invoice-panel-body">
              <div className="invoice-ref-row">
                <span className="invoice-ref-label">Customer</span>
                <span className="invoice-ref-value">{customer?.name || invoice.customerId}</span>
              </div>
              {invoice.orderId && (
                <div className="invoice-ref-row">
                  <span className="invoice-ref-label">Sales Order</span>
                  <span className="invoice-ref-value" style={{ color: 'var(--primary-600)', fontFamily: 'Courier New, monospace' }}>
                    {invoice.orderId}
                  </span>
                </div>
              )}
              {invoice.subscriptionId && (
                <div className="invoice-ref-row">
                  <span className="invoice-ref-label">Subscription</span>
                  <span className="invoice-ref-value" style={{ color: '#7e22ce', fontFamily: 'Courier New, monospace' }}>
                    {invoice.subscriptionId}
                  </span>
                </div>
              )}
              <div className="invoice-ref-row">
                <span className="invoice-ref-label">Issue Date</span>
                <span className="invoice-ref-value">{invoice.issueDate || '—'}</span>
              </div>
              <div className="invoice-ref-row">
                <span className="invoice-ref-label">Payment Terms</span>
                <span className="invoice-ref-value">Net 30 Days</span>
              </div>
            </div>
          </div>

          {/* Related Invoices Panel */}
          {relatedInvoices.length > 0 && (
            <div className="invoice-panel">
              <div className="invoice-panel-header">Related Customer Invoices</div>
              <div className="invoice-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {relatedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => navigate(`/sales/invoices/${inv.id}`)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md, 6px)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface-secondary, #f8fafc)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    className="clickable-row"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span className="billing-invoice-id" style={{ fontSize: '0.8125rem' }}>
                        {inv.invoiceNumber || inv.id}
                      </span>
                      <span className={`billing-badge ${STATUS_MAP[inv.paymentStatus] || 'billing-badge-neutral'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                        {inv.paymentStatus}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{inv.invoiceType ? inv.invoiceType.replace('_', ' ') : 'ONE TIME'}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatINR(inv.totalAmount ?? inv.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoiceDetails={invoiceDetails}
        onRecordPayment={handleRecordPaymentSubmit}
      />
    </div>
  );
}

export { InvoiceDetail };
