import React from 'react';
import { Trash2, Minus, Plus, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { computeLineItem } from '../../utils/quotationCalculations.js';
import { evaluateLineDiscount } from '../../data/discountRules.js';
import { formatINR } from '../../utils/formatters.js';

const GOVERNANCE_ICONS = {
  allowed:          <CheckCircle2 size={11} />,
  warning:          <AlertTriangle size={11} />,
  approval_required:<ShieldAlert size={11} />,
  critical:         <ShieldAlert size={11} />,
};

const GOVERNANCE_LABELS = {
  allowed:          'Within Limit',
  warning:          'Near Limit',
  approval_required:'Approval Required',
  critical:         'Exceeds Limit',
};

export const CartLineItem = ({ item, customerTier = 'Standard', onUpdate, onRemove }) => {
  const computed = computeLineItem(item);
  const gov = evaluateLineDiscount(item, customerTier);

  const handleQtyChange = (delta) => {
    const newQty = Math.max(1, Math.min((item.stock || 9999), (Number(item.quantity) || 1) + delta));
    onUpdate(item.cartId || item.id, 'quantity', newQty);
  };

  const handleQtyInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    const clamped = Math.max(1, Math.min(item.stock || 9999, val));
    onUpdate(item.cartId || item.id, 'quantity', clamped);
  };

  const handleDiscountInput = (e) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val) || val < 0) {
      onUpdate(item.cartId || item.id, 'discount', 0);
      return;
    }
    onUpdate(item.cartId || item.id, 'discount', Math.min(val, 100));
  };

  const govClass = gov.status === 'allowed' ? 'allowed'
    : gov.status === 'warning' ? 'warning'
    : 'approval_required';

  const marginColor = computed.margin >= 30
    ? 'var(--color-success)'
    : computed.margin >= 15
      ? 'var(--color-warning)'
      : 'var(--color-error)';

  return (
    <div className={`cart-item-card ${gov.isExceeded ? 'has-governance-error' : gov.status === 'warning' ? 'has-governance-warning' : ''}`}>
      {/* Header */}
      <div className="cart-item-header">
        <div style={{ flex: 1 }}>
          <div className="cart-item-name">{item.name || item.productName}</div>
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
              {item.category}
            </span>
            <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
              GST {item.gstRate || 18}%
            </span>
            <span className={`line-governance-badge ${govClass}`}>
              {GOVERNANCE_ICONS[gov.status]}
              {GOVERNANCE_LABELS[gov.status]}
              {gov.isExceeded && ` (+${gov.exceeded.toFixed(1)}%)`}
            </span>
          </div>
        </div>
        <button
          className="cart-item-remove-btn"
          onClick={() => onRemove(item.cartId || item.id)}
          title="Remove from cart"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Controls: Qty | Unit Price | Discount % */}
      <div className="cart-item-controls">
        {/* Quantity Stepper */}
        <div>
          <div className="line-field-label" style={{ marginBottom: '0.25rem' }}>Qty</div>
          <div className="qty-stepper">
            <button
              className="qty-btn"
              onClick={() => handleQtyChange(-1)}
              disabled={(Number(item.quantity) || 1) <= 1}
            >−</button>
            <input
              type="number"
              className="qty-input"
              value={item.quantity}
              onChange={handleQtyInput}
              min={1}
              max={item.stock || 9999}
            />
            <button
              className="qty-btn"
              onClick={() => handleQtyChange(1)}
              disabled={(Number(item.quantity) || 1) >= (item.stock || 9999)}
            >+</button>
          </div>
          {item.stock < 9999 && (
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Max: {item.stock}
            </div>
          )}
        </div>

        {/* Unit Price */}
        <div className="line-field">
          <div className="line-field-label">Unit Price (₹)</div>
          <input
            type="number"
            className="line-field-input"
            value={item.unitPrice}
            onChange={e => onUpdate(item.cartId || item.id, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
            min={0}
          />
        </div>

        {/* Discount % */}
        <div className="line-field">
          <div className="line-field-label" style={{ color: gov.isExceeded ? 'var(--color-error)' : undefined }}>
            Discount %
          </div>
          <input
            type="number"
            className={`line-field-input ${gov.isExceeded ? 'has-error' : ''}`}
            value={item.discount || 0}
            onChange={handleDiscountInput}
            min={0}
            max={100}
            step={0.5}
            title={`Max allowed: ${gov.effectiveLimit}% (Tier: ${gov.tierLimit}%, Category: ${gov.catLimit}%)`}
          />
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            Max: {gov.effectiveLimit}%
          </div>
        </div>
      </div>

      {/* Totals Row */}
      <div className="cart-item-totals">
        <div className="cart-total-cell">
          <span className="cart-total-label">Subtotal</span>
          <span className="cart-total-value">{formatINR(computed.lineSubtotal)}</span>
        </div>
        <div className="cart-total-cell">
          <span className="cart-total-label">GST ({item.gstRate || 18}%)</span>
          <span className="cart-total-value">{formatINR(computed.gstAmount)}</span>
        </div>
        <div className="cart-total-cell">
          <span className="cart-total-label">Line Total</span>
          <span className="cart-total-value" style={{ color: 'var(--primary-600)' }}>
            {formatINR(computed.lineTotal)}
          </span>
        </div>
      </div>

      {/* Margin indicator */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            MARGIN
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: marginColor }}>
            {computed.margin.toFixed(1)}%
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
              (Profit: {formatINR(computed.profit)})
            </span>
          </span>
        </div>
        <div className="margin-bar-track">
          <div
            className="margin-bar-fill"
            style={{
              width: `${Math.min(computed.margin, 100)}%`,
              background: marginColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};
