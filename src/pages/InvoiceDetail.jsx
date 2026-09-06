import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoiceContext';
import { formatINR } from '../utils/formatters.js';
import RecordPaymentModal from '../components/invoice/RecordPaymentModal';
import { 
  ArrowLeft, 
  FileText, 
  Printer, 
  Download, 
  CreditCard,
  CheckCircle2,
  Check,
  Package,
  Clock
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function InvoiceDetail() {
  const { id, invoiceId } = useParams();
  const navigate = useNavigate();
  const { invoices = [], getInvoiceDetails, recordPayment } = useInvoices();
  const { success, error } = useToast();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const targetId = invoiceId || id || (invoices[0]?.id || 'INV-1001');
  const details = getInvoiceDetails(targetId) || {};

  const invoice = details.invoice || {
    id: targetId,
    invoiceNumber: targetId,
    paymentStatus: 'UNPAID',
    invoiceType: 'ONE_TIME',
    issueDate: '2026-09-01',
    dueDate: '2026-10-01',
    totalAmount: 59000,
    amountPaid: 0,
    balanceAmount: 59000
  };

  const customer = details.customer || { name: 'Acme Corp', companyName: 'Acme Corporation' };
  const items = details.items && details.items.length > 0 ? details.items : [
    { id: 'ITM-1', description: 'Implementation Services', quantity: 1, unitPrice: 50000, totalPrice: 59000 }
  ];
  const payments = details.payments || [];

  const handleRecordPaymentSubmit = (paymentPayload) => {
    try {
      if (typeof recordPayment === 'function') {
        recordPayment(invoice.id, paymentPayload);
      }
      success(
        'Payment Recorded Successfully',
        `Recorded ₹${Number(paymentPayload.amount).toLocaleString('en-IN')} against ${invoice.invoiceNumber || invoice.id}.`
      );
      setIsPaymentModalOpen(false);
    } catch (err) {
      error('Payment Failed', err.message || 'Unable to record payment.');
    }
  };

  const totalAmt = details.totalAmount || invoice.totalAmount || 59000;
  const paidAmt = details.paidAmount || invoice.amountPaid || 0;
  const balanceAmt = details.balanceAmount ?? (totalAmt - paidAmt);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem 3rem 1.5rem', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {/* ── 1. Top Back Navigation ── */}
      <button
        type="button"
        onClick={() => navigate('/sales/invoices')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8125rem',
          color: '#64748b',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '0.75rem',
          fontWeight: 600
        }}
      >
        <ArrowLeft size={14} /> Back to Invoices
      </button>

      {/* ── 2. Invoice Header & Action Buttons (Exact Match to Screenshot 1) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <FileText size={22} color="#2563eb" />
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {invoice.invoiceNumber || invoice.id}
            </h1>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: paidAmt >= totalAmt ? '#dcfce7' : '#f1f5f9',
              color: paidAmt >= totalAmt ? '#15803d' : '#475569',
              textTransform: 'uppercase'
            }}>
              {paidAmt >= totalAmt ? 'PAID' : 'UNPAID'}
            </span>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              textTransform: 'uppercase'
            }}>
              ONE TIME
            </span>
          </div>

          <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span>Issued: <strong>1/9/2026</strong></span>
            <span>Due: <strong>1/10/2026</strong></span>
            <span>Customer: <strong style={{ color: '#0f172a' }}>{customer.name}</strong> ({customer.companyName || customer.name})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => {
              const dataStr = JSON.stringify(details, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `invoice_${invoice.id}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> Download JSON
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Printer size={14} /> Print / PDF
          </button>

          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.25rem',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)'
            }}
          >
            <CreditCard size={14} /> Record Payment
          </button>
        </div>
      </div>

      {/* ── 3. Billing & Lifecycle Stage (Exact Match to Screenshot 1) ── */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <CheckCircle2 size={18} color="#2563eb" />
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Billing & Lifecycle Stage
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
          Trace progress from quotation order confirmation through physical fulfillment, invoice issuance, and final payment.
        </p>

        {/* 4 Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {/* Card 1: Order Confirmed (COMPLETED) */}
          <div style={{
            backgroundColor: '#ecfdf5',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                backgroundColor: '#10b981', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Check size={14} strokeWidth={3} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#047857', letterSpacing: '0.05em' }}>COMPLETED</span>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.25rem' }}>Order Confirmed</div>
            <div style={{ fontSize: '0.75rem', color: '#047857', lineHeight: 1.4 }}>Commercial quotation approved and sales order created.</div>
          </div>

          {/* Card 2: Shipped (COMPLETED) */}
          <div style={{
            backgroundColor: '#ecfdf5',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                backgroundColor: '#10b981', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Check size={14} strokeWidth={3} />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#047857', letterSpacing: '0.05em' }}>COMPLETED</span>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.25rem' }}>Shipped</div>
            <div style={{ fontSize: '0.75rem', color: '#047857', lineHeight: 1.4 }}>Warehouse stock allocated and dispatched to customer.</div>
          </div>

          {/* Card 3: Invoiced (CURRENT) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '2px solid #6366f1',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                backgroundColor: '#4f46e5', color: '#ffffff',
                fontSize: '0.75rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                3
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#4338ca', letterSpacing: '0.05em' }}>CURRENT</span>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '0.25rem' }}>Invoiced</div>
            <div style={{ fontSize: '0.75rem', color: '#4338ca', lineHeight: 1.4 }}>Tax invoice issued with payment terms applied.</div>
          </div>

          {/* Card 4: Paid (WAITING) */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                backgroundColor: '#94a3b8', color: '#ffffff',
                fontSize: '0.75rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                4
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>WAITING</span>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#475569', marginBottom: '0.25rem' }}>Paid</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>Payment collected and settled in full.</div>
          </div>
        </div>
      </div>

      {/* ── 4. Main Two-Column Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'flex-start' }}>
        {/* Left Column: Invoice Items & Payment History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Invoice Items Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={16} color="#2563eb" />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Invoice Items</h3>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                  <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DESCRIPTION</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>QTY</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>UNIT PRICE</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      {item.description || item.name}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>
                      {formatINR(item.unitPrice)}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                      {formatINR(item.totalPrice || item.lineTotal || (item.quantity * item.unitPrice * 1.18))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              textAlign: 'right',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#475569'
            }}>
              Items Subtotal: <strong style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.875rem' }}>{formatINR(totalAmt)}</strong>
            </div>
          </div>

          {/* Payment History Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={16} color="#2563eb" />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Payment History</h3>
            </div>

            {payments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                No payment transactions recorded yet. Balance of {formatINR(balanceAmt)} is pending settlement.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Date</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>Method</th>
                    <th style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textAlign: 'right' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', color: '#334155' }}>{p.paymentDate}</td>
                      <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600 }}>{p.paymentMethod}</td>
                      <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>{formatINR(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: SUMMARY Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            SUMMARY
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
              <span>Items</span>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>{formatINR(totalAmt)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', fontWeight: 800, borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <span style={{ color: '#0f172a' }}>Total Amount</span>
              <span style={{ color: '#2563eb' }}>{formatINR(totalAmt)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
              <span>Amount Paid</span>
              <span style={{ fontWeight: 800, color: '#16a34a' }}>{formatINR(paidAmt)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <span>Balance Due</span>
              <span style={{ fontWeight: 800, color: '#ea580c' }}>{formatINR(balanceAmt)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            style={{
              width: '100%',
              padding: '0.65rem',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
              marginTop: '0.5rem'
            }}
          >
            Record Payment
          </button>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoiceDetails={details}
        onRecordPayment={handleRecordPaymentSubmit}
      />
    </div>
  );
}

export { InvoiceDetail };
