import React from 'react';
import { 
  Plus, 
  Trash2, 
  Package, 
  DollarSign, 
  Percent, 
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  BarChart2,
  Lock,
  TrendingDown,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import PRODUCTS_DATA from '../../data/products.json';
import { calculateQuotationTotals } from '../../utils/quotationCalculations.js';
import { formatINR } from '../../utils/formatters.js';

export const LineItemBuilder = ({ 
  items = [], 
  onChangeItems, 
  setItems,
  discount = 0, 
  onChangeDiscount, 
  setDiscount,
  taxRate = 18,
  onChangeTaxRate,
  setTaxRate
}) => {
  const updateItems = onChangeItems || setItems || (() => {});
  const updateDiscount = onChangeDiscount || setDiscount || (() => {});
  
  // Applicable GST is fixed at 18% (Standard GST for India)
  const fixedTaxRate = 18;
  const totals = calculateQuotationTotals(items, discount, fixedTaxRate);

  const handleAddItem = (preset) => {
    const newItem = preset ? {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: preset.id,
      name: preset.name,
      description: preset.description,
      quantity: preset.defaultQty || 1,
      unitPrice: preset.unitPrice,
      unit: preset.unit || 'Unit'
    } : {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      unit: 'Unit'
    };

    updateItems([...items, newItem]);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' || field === 'unitPrice' 
        ? (value === '' ? '' : Math.max(0, Number(value))) 
        : value
    };
    updateItems(updated);
  };

  const handleRemoveItem = (index) => {
    updateItems(items.filter((_, i) => i !== index));
  };

  // Discount Governance Tiers
  const discountVal = Number(discount) || 0;
  const isManagerEscalation = discountVal > 15 && discountVal <= 25;
  const isVpEscalation = discountVal > 25;
  const isWithinRepLimit = discountVal <= 15;

  const marginRetention = Math.max(100 - discountVal, 0);

  return (
    <div className="line-item-builder-container">
      {/* Product Catalog Quick Add Presets Bar */}
      <div className="product-presets-bar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            QUICK ADD FROM ENTERPRISE CATALOG (INR)
          </span>
          <button
            type="button"
            onClick={() => handleAddItem(null)}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            <Plus size={12} />
            <span>Add Custom Line</span>
          </button>
        </div>

        <div className="preset-buttons-wrap">
          {PRODUCTS_DATA.map((prod) => (
            <button
              key={prod.id}
              type="button"
              onClick={() => handleAddItem({ ...prod, unitPrice: prod.price, defaultQty: 1 })}
              className="btn btn-secondary"
              style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)' }}
              title={prod.description}
            >
              <Plus size={12} color="var(--primary-500)" />
              <span>{prod.name} ({formatINR(prod.price)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="line-items-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr 1.2fr 40px', gap: '0.75rem', padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
          <span>PRODUCT / SERVICE</span>
          <span>QUANTITY</span>
          <span>UNIT PRICE (INR)</span>
          <span>LINE TOTAL (INR)</span>
          <span />
        </div>

        {items.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-medium)',
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}>
            No items added yet. Click a product preset above or add a blank line item.
          </div>
        ) : (
          items.map((item, index) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            const lineTotal = qty * price;

            return (
              <div key={item.id || index} className="line-item-row">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                  placeholder="Item name / package description"
                  className="form-input"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
                  required
                />

                <input
                  type="number"
                  min="1"
                  value={item.quantity === 0 ? '' : item.quantity}
                  onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                  placeholder="1"
                  className="form-input"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
                  required
                />

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.unitPrice === 0 ? '' : item.unitPrice}
                  onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                  placeholder="0"
                  className="form-input"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem' }}
                  required
                />

                <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--text-primary)', paddingLeft: '0.5rem' }}>
                  {formatINR(lineTotal)}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="btn-icon"
                  style={{ color: 'var(--color-error)' }}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Commercial Terms & Pricing Summary Section */}
      <div className="commercials-calculation-grid">
        {/* Left Column: Discount & GST Controls + Deal Health & Margin Visual Chart */}
        <div className="discount-controls-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Commercial Discount & Margin Rules
            </span>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              INR Governance
            </span>
          </div>

          <div className="discount-input-row">
            {/* Commercial Discount Input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>
                Commercial Discount (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDiscount(val === '' ? 0 : Math.min(100, Math.max(0, Number(val))));
                  }}
                  placeholder="0"
                  className="form-input"
                  style={{ paddingRight: '2rem' }}
                />
                <Percent size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '10px', top: '12px' }} />
              </div>
            </div>

            {/* Applicable GST (Fixed 18% Standard) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>
                <span>Applicable GST (Fixed Rate)</span>
                <Lock size={12} color="var(--text-muted)" />
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value="18% (Standard GST)"
                  readOnly
                  disabled
                  className="form-input"
                  style={{ 
                    backgroundColor: 'var(--bg-surface-3)', 
                    cursor: 'not-allowed', 
                    fontWeight: '600',
                    color: 'var(--text-secondary)'
                  }}
                />
                <span style={{ position: 'absolute', right: '10px', top: '11px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary-600)', background: 'rgba(37,99,235,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  9% CGST + 9% SGST
                </span>
              </div>
            </div>
          </div>

          {/* Discount Escalation Warning / Success Notices */}
          {isVpEscalation ? (
            <div className="governance-warning-box critical">
              <ShieldAlert size={18} color="var(--color-error)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--color-error)' }}>Critical Escalation Warning: </strong>
                Discount of {discountVal}% exceeds 25%. This requires <strong>VP of Sales & Finance Committee</strong> sign-off.
              </div>
            </div>
          ) : isManagerEscalation ? (
            <div className="governance-warning-box">
              <AlertTriangle size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--color-warning)' }}>Manager Escalation Required: </strong>
                Discount of {discountVal}% exceeds the standard 15% sales rep authority limit.
              </div>
            </div>
          ) : (
            <div className="governance-success-box">
              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.775rem' }}>
                <strong>Authorized: </strong>
                Discount of {discountVal}% is within standard Sales Rep authorization limit (15%).
              </div>
            </div>
          )}

          {/* Dynamic Deal Health & Margin Impact Visual Chart Widget */}
          <div className="deal-health-chart-box">
            <div className="chart-header">
              <div className="chart-title">
                <BarChart2 size={15} color="var(--primary-500)" />
                <span>Deal Margin & Governance Analysis</span>
              </div>
              <span className={`badge ${isVpEscalation ? 'badge-error' : isManagerEscalation ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                {isVpEscalation ? 'VP Sign-off Required' : isManagerEscalation ? 'Manager Approval' : 'Rep Pre-Approved'}
              </span>
            </div>

            {/* Visual Margin Distribution Stacked Bar */}
            <div className="deal-breakdown-bar-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>Realized Margin ({marginRetention}%)</span>
                <span>Discount Loss ({discountVal}%)</span>
              </div>
              <div className="deal-breakdown-bar">
                <div 
                  className="bar-segment realized" 
                  style={{ width: `${marginRetention}%` }} 
                  title={`Realized Revenue: ${marginRetention}%`}
                />
                <div 
                  className={`bar-segment ${isVpEscalation ? 'discount-critical' : isManagerEscalation ? 'discount-warning' : 'discount-low'}`} 
                  style={{ width: `${discountVal}%` }} 
                  title={`Discount Erosion: ${discountVal}%`}
                />
              </div>
            </div>

            {/* 0% to 50% Threshold Meter */}
            <div className="deal-threshold-scale">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                <span>0%</span>
                <span style={{ color: 'var(--color-warning)', fontWeight: '700' }}>15% Rep Limit</span>
                <span>50% Max</span>
              </div>
              <div className="scale-track">
                <div 
                  className="scale-fill" 
                  style={{ 
                    width: `${Math.min(discountVal * 2, 100)}%`,
                    backgroundColor: isVpEscalation ? 'var(--color-error)' : isManagerEscalation ? 'var(--color-warning)' : 'var(--color-success)'
                  }} 
                />
                <div className="scale-marker-15" title="15% Sales Rep Limit" />
              </div>
            </div>

            {/* 3 Metric Stat Cards */}
            <div className="chart-stats-grid">
              <div className="chart-stat-card">
                <span className="chart-stat-label">Net Base Value</span>
                <span className="chart-stat-value" style={{ color: 'var(--primary-600)' }}>
                  {formatINR(totals.subtotal - totals.discountAmount)}
                </span>
              </div>

              <div className="chart-stat-card">
                <span className="chart-stat-label">Discount Erosion</span>
                <span className="chart-stat-value" style={{ color: discountVal > 0 ? (isWithinRepLimit ? 'var(--color-success)' : 'var(--color-warning)') : 'var(--text-muted)' }}>
                  -{formatINR(totals.discountAmount)}
                </span>
              </div>

              <div className="chart-stat-card">
                <span className="chart-stat-label">Deal Health</span>
                <span className="chart-stat-value" style={{ color: isVpEscalation ? 'var(--color-error)' : isManagerEscalation ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  {marginRetention >= 85 ? 'Optimal' : marginRetention >= 75 ? 'Moderate' : 'High Risk'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Pricing Summary Calculation Box */}
        <div className="pricing-summary-box">
          <span style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            Quotation Arithmetic Summary
          </span>

          <div className="pricing-summary-row">
            <span>Subtotal (Gross)</span>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              {formatINR(totals.subtotal)}
            </span>
          </div>

          <div className="pricing-summary-row">
            <span>Commercial Discount ({totals.discount}%)</span>
            <span style={{ color: totals.discountAmount > 0 ? 'var(--color-warning)' : 'var(--text-muted)', fontWeight: '600' }}>
              -{formatINR(totals.discountAmount)}
            </span>
          </div>

          <div className="pricing-summary-row">
            <span>Taxable Net Amount</span>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              {formatINR(totals.subtotal - totals.discountAmount)}
            </span>
          </div>

          <div className="pricing-summary-row">
            <span>Applicable GST (18% Fixed)</span>
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
              +{formatINR(totals.tax)}
            </span>
          </div>

          <div className="pricing-summary-row total">
            <span>Total Quotation Value (INR)</span>
            <span style={{ color: 'var(--primary-600)' }}>
              {formatINR(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

