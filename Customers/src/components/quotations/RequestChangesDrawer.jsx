import React, { useState } from 'react';
import { X, MessageSquareQuote, AlertCircle } from 'lucide-react';

const CHANGE_TYPES = [
  'Quantity Change',
  'Discount Request',
  'Product Change',
  'Requirement Change',
  'General Request'
];

export const RequestChangesDrawer = ({
  isOpen,
  onClose,
  quotation,
  lineItems = [],
  onSubmit,
  isCounterRequest = false,
  roundNumber = 1
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

    // Reset fields
    setRequestedValue('');
    setReason('');
    
    onClose();
  };

  return (
    <div className={`drawer-overlay ${isOpen ? 'drawer-open' : ''}`} onClick={onClose}>
      <div className={`drawer-content ${isOpen ? 'drawer-open' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquareQuote size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isCounterRequest ? `Negotiation Round ${roundNumber}` : 'Request Changes'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Quotation {quotation.quotationNumber || quotation.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.5rem', border: 'none', background: 'transparent' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body / Form */}
        <div className="drawer-body">
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                marginBottom: '1.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{validationError}</span>
              </div>
            )}

            {isCounterRequest && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--primary-50)',
                borderLeft: '4px solid var(--primary-600)',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                fontSize: '0.875rem',
                color: 'var(--primary-800)'
              }}>
                <strong>Counter Request:</strong> You are submitting a new request based on the previous round. Please provide the new requested values and reasoning.
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="quotation-line-select">
                Quotation Line Item <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                id="quotation-line-select"
                className="form-select"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                required
              >
                <option value="">-- Select an item to negotiate --</option>
                {lineItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.productName} (Current: {item.quantity} units, {item.discount}% discount)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="change-type-select">
                Change Type <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                id="change-type-select"
                className="form-select"
                value={changeType}
                onChange={(e) => setChangeType(e.target.value)}
                required
              >
                {CHANGE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="requested-value-input">
                Requested Value {changeType === 'Discount Request' ? '(e.g. 15%)' : changeType === 'Quantity Change' ? '(e.g. 15)' : ''}
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

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="change-reason-textarea">
                Reason / Comment <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <textarea
                id="change-reason-textarea"
                rows={4}
                className="form-textarea"
                placeholder="e.g. Can you provide better pricing for the complete package?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div style={{ flexGrow: 1 }}></div>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}>
              Submitting this request will inform your sales representative. Your quotation status will transition to <strong>Under Negotiation</strong>. You will not be able to accept the quotation until this negotiation is resolved.
            </div>

            {/* Drawer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
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
                {isCounterRequest ? 'Submit Counter Request' : 'Submit Change Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
