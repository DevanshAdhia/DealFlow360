import React, { useState } from 'react';
import { X, MessageSquareQuote, AlertCircle } from 'lucide-react';

const CHANGE_TYPES = [
  'Quantity Change',
  'Discount Request',
  'Product Change',
  'Requirement Change',
  'General Request'
];

export const RequestChangesModal = ({
  isOpen,
  onClose,
  quotation,
  lineItems = [],
  onSubmit
}) => {
  const [selectedItemId, setSelectedItemId] = useState(lineItems[0]?.id || '');
  const [changeType, setChangeType] = useState('Discount Request');
  const [requestedValue, setRequestedValue] = useState('');
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const selectedItem = lineItems.find(i => i.id === selectedItemId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!reason.trim()) {
      setValidationError('Reason / Comment is required so our sales team can address your request.');
      return;
    }

    if ((changeType === 'Quantity Change' || changeType === 'Discount Request') && !requestedValue.trim()) {
      setValidationError('Requested Value is required for this change type.');
      return;
    }

    let currentValueStr = '';
    if (selectedItem) {
      if (changeType === 'Discount Request') {
        currentValueStr = `${selectedItem.discount}%`;
      } else if (changeType === 'Quantity Change') {
        currentValueStr = `${selectedItem.quantity} units`;
      } else {
        currentValueStr = selectedItem.productName;
      }
    } else {
      currentValueStr = `${quotation.discount}%`;
    }

    onSubmit({
      quotationId: quotation.quotationNumber || quotation.id,
      quotationItemId: selectedItemId || null,
      changeType,
      currentValue: currentValueStr,
      requestedValue: requestedValue.trim(),
      reason: reason.trim()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquareQuote size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Request Changes
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Quotation {quotation.quotationNumber || quotation.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.5rem' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {validationError && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quotation Line Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="quotation-line-select">
              Quotation Line Item
            </label>
            <select
              id="quotation-line-select"
              className="form-select"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              <option value="">Entire Quotation Terms</option>
              {lineItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.productName} (Current: {item.quantity} units, {item.discount}% discount)
                </option>
              ))}
            </select>
          </div>

          {/* Change Type Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="change-type-select">
              Change Type
            </label>
            <select
              id="change-type-select"
              className="form-select"
              value={changeType}
              onChange={(e) => setChangeType(e.target.value)}
            >
              {CHANGE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Requested Value */}
          <div className="form-group">
            <label className="form-label" htmlFor="requested-value-input">
              Requested Value {changeType === 'Discount Request' ? '(e.g. 15%)' : changeType === 'Quantity Change' ? '(e.g. 15 units)' : ''}
            </label>
            <input
              id="requested-value-input"
              type="text"
              className="form-input"
              placeholder={changeType === 'Discount Request' ? '15%' : changeType === 'Quantity Change' ? '15' : 'Specify details'}
              value={requestedValue}
              onChange={(e) => setRequestedValue(e.target.value)}
            />
          </div>

          {/* Reason / Comment */}
          <div className="form-group">
            <label className="form-label" htmlFor="change-reason-textarea">
              Reason / Comment <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <textarea
              id="change-reason-textarea"
              rows={3}
              className="form-textarea"
              placeholder="e.g. We need five additional units for our new engineering cohort."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem'
          }}>
            Submitting this request will inform your sales representative. Your quotation status will transition to <strong>Under Negotiation</strong>.
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Submit Change Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
