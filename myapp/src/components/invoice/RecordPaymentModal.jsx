import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../services/invoiceCalculationService';

export default function RecordPaymentModal({ 
  isOpen, 
  onClose, 
  invoiceDetails, 
  onRecordPayment 
}) {
  if (!isOpen || !invoiceDetails) return null;

  const { invoice, balanceAmount } = invoiceDetails;

  const [amount, setAmount] = useState(balanceAmount > 0 ? balanceAmount.toString() : '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFillFull = () => {
    setAmount(balanceAmount.toString());
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }

    if (numAmount > balanceAmount) {
      setError(`Overpayment blocked: Payment cannot exceed remaining balance of ${formatCurrency(balanceAmount)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      onRecordPayment({
        invoiceId: invoice.id,
        amount: numAmount,
        paymentDate,
        paymentMethod,
        reference,
        notes
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="invoice-modal-overlay" onClick={onClose}>
      <div 
        className="invoice-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="invoice-modal-header">
          <div>
            <h3 className="invoice-modal-title">Record Payment</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
              Invoice {invoice.invoiceNumber} &bull; Ledger Entry
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="invoice-modal-body">
            {/* Remaining Balance Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1rem',
              background: 'rgba(245, 158, 11, 0.08)',
              borderRadius: 'var(--radius-lg, 8px)',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>Remaining Balance</span>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#92400e' }}>{formatCurrency(balanceAmount)}</div>
              </div>
              <button
                type="button"
                onClick={handleFillFull}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                Pay Full Balance
              </button>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md, 6px)',
                color: '#b91c1c',
                fontSize: '0.8125rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Payment Amount (₹) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balanceAmount}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem 0.625rem 2rem',
                    borderRadius: 'var(--radius-md, 6px)',
                    border: '1.5px solid var(--border, #e2e8f0)',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit'
                  }}
                  placeholder="0.00"
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Overpayment strictly prevented. Max: {formatCurrency(balanceAmount)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md, 6px)',
                    border: '1.5px solid var(--border, #e2e8f0)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md, 6px)',
                    border: '1.5px solid var(--border, #e2e8f0)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    background: '#fff',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="UPI">UPI / Net Banking</option>
                  <option value="CHECK">Check</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Transaction / Reference ID
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. TXN-998231 or UTR-2026-X"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md, 6px)',
                  border: '1.5px solid var(--border, #e2e8f0)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Internal Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes regarding this settlement..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md, 6px)',
                  border: '1.5px solid var(--border, #e2e8f0)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'none'
                }}
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="invoice-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || balanceAmount <= 0}
              className="btn btn-primary"
              style={{ background: '#059669', borderColor: '#059669' }}
            >
              {isSubmitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
