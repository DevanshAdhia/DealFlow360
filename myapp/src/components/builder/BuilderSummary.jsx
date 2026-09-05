import React, { useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, TrendingUp,
  IndianRupee, Percent, Save, CheckCircle2
} from 'lucide-react';
import {
  computeLineItem,
  calculateQuotationMargin,
} from '../../utils/quotationCalculations.js';
import {
  evaluateQuotationGovernance,
  getRiskLevel,
  TIER_DISCOUNT_LIMITS,
} from '../../data/discountRules.js';
import { formatINR, formatINRCompact } from '../../utils/formatters.js';

export const BuilderSummary = ({
  cartItems = [],
  customerTier = 'Standard',
  customerName = '',
  onSave,
  isSaving = false,
}) => {
  const computedItems = useMemo(() => cartItems.map(computeLineItem), [cartItems]);

  // Totals
  const subtotal    = computedItems.reduce((s, i) => s + i.lineSubtotal, 0);
  const totalDisc   = computedItems.reduce((s, i) => s + i.discountAmount, 0);
  const taxableAmt  = Math.max(subtotal - totalDisc, 0);
  const totalGST    = computedItems.reduce((s, i) => s + i.gstAmount, 0);
  const grandTotal  = taxableAmt + totalGST;

  // Margin
  const marginStats = calculateQuotationMargin(computedItems);
  const totalRevenue = marginStats?.totalRevenue ?? 0;
  const totalCost    = marginStats?.totalCost ?? 0;
  const profit       = marginStats?.profit ?? 0;
  const margin       = marginStats?.margin ?? 0;

  // Governance
  const governance = useMemo(
    () => evaluateQuotationGovernance(cartItems, customerTier, margin),
    [cartItems, customerTier, margin]
  );
  const riskLevel = getRiskLevel(governance.riskScore);
  const panelClass = governance.riskScore <= 30 ? 'safe'
    : governance.riskScore <= 60 ? 'warning' : 'danger';
  const tierLimit = TIER_DISCOUNT_LIMITS[customerTier] ?? 5;

  const marginColor = margin >= 30
    ? 'var(--color-success)'
    : margin >= 15
      ? 'var(--color-warning)'
      : 'var(--color-error)';

  const riskFillColor = riskLevel.score <= 30
    ? 'var(--color-success)'
    : riskLevel.score <= 60
      ? 'var(--color-warning)'
      : 'var(--color-error)';

  return (
    <div className="builder-panel" style={{ overflow: 'hidden' }}>
      <div className="builder-col-header">
        <span className="builder-col-title">
          <IndianRupee size={13} />
          Summary
        </span>
        {cartItems.length > 0 && (
          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="builder-col-body" style={{ gap: 0, padding: 0 }}>
        {/* Totals Section */}
        <div className="summary-section">
          <div className="summary-section-title">
            <IndianRupee size={12} />
            Pricing Breakdown
          </div>
          <div className="summary-row">
            <span className="summary-row-label">Subtotal</span>
            <span className="summary-row-value">{formatINR(subtotal)}</span>
          </div>
          {totalDisc > 0 && (
            <div className="summary-row">
              <span className="summary-row-label" style={{ color: 'var(--color-warning)' }}>
                − Discount
              </span>
              <span className="summary-row-value" style={{ color: 'var(--color-warning)' }}>
                − {formatINR(totalDisc)}
              </span>
            </div>
          )}
          <div className="summary-row">
            <span className="summary-row-label">Taxable Amount</span>
            <span className="summary-row-value">{formatINR(taxableAmt)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row-label">+ GST (18%)</span>
            <span className="summary-row-value">{formatINR(totalGST)}</span>
          </div>
          <div className="summary-row total">
            <span className="summary-row-label">Grand Total</span>
            <span className="summary-row-value">{formatINR(grandTotal)}</span>
          </div>
        </div>

        {/* Margin Section */}
        <div className="summary-section">
          <div className="summary-section-title">
            <TrendingUp size={12} />
            Margin Analysis
          </div>
          <div className="summary-profit-grid">
            <div className="summary-profit-cell">
              <span className="summary-profit-label">Revenue</span>
              <span className="summary-profit-value">{formatINRCompact(totalRevenue)}</span>
            </div>
            <div className="summary-profit-cell">
              <span className="summary-profit-label">Cost</span>
              <span className="summary-profit-value">{formatINRCompact(totalCost)}</span>
            </div>
            <div className="summary-profit-cell">
              <span className="summary-profit-label">Profit</span>
              <span className="summary-profit-value" style={{ color: profit > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                {formatINRCompact(profit)}
              </span>
            </div>
            <div className="summary-profit-cell">
              <span className="summary-profit-label">Margin %</span>
              <span className="summary-profit-value" style={{ color: marginColor }}>
                {(margin ?? 0).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Margin bar */}
          <div style={{ marginTop: '0.75rem' }}>
            <div className="margin-bar-track" style={{ height: 6 }}>
              <div
                className="margin-bar-fill"
                style={{ width: `${Math.min(margin ?? 0, 100)}%`, background: marginColor }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>0%</span>
              <span style={{ color: marginColor, fontWeight: 700 }}>{(margin ?? 0).toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Discount Governance Section */}
        <div className="summary-section">
          <div className="summary-section-title">
            <ShieldCheck size={12} />
            Discount Governance
          </div>

          <div className={`governance-panel ${panelClass}`}>
            <div className="governance-panel-header">
              {panelClass === 'safe'
                ? <ShieldCheck size={14} />
                : panelClass === 'warning'
                  ? <AlertTriangle size={14} />
                  : <ShieldAlert size={14} />}
              {panelClass === 'safe' ? 'Within Limits'
                : panelClass === 'warning' ? 'Approaching Limits'
                : 'Approval Required'}
            </div>

            <div className="governance-panel-body">
              <div className="gov-row">
                <span className="gov-row-label">Customer Tier</span>
                <span className="gov-row-value">{customerTier}</span>
              </div>
              <div className="gov-row">
                <span className="gov-row-label">Tier Max Discount</span>
                <span className="gov-row-value">{tierLimit}%</span>
              </div>
              <div className="gov-row">
                <span className="gov-row-label">Approval Status</span>
                <span className="gov-row-value" style={{
                  color: governance.approvalRequired ? 'var(--color-error)' : 'var(--color-success)'
                }}>
                  {governance.approvalRequired ? 'Required' : 'Not Required'}
                </span>
              </div>

              {/* Risk Score */}
              <div className="risk-score-wrap">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.725rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>RISK SCORE</span>
                  <span style={{ fontWeight: 800, color: riskFillColor }}>
                    {governance.riskScore} — {riskLevel.label}
                  </span>
                </div>
                <div className="risk-score-track">
                  <div
                    className="risk-score-fill"
                    style={{ width: `${governance.riskScore}%`, background: riskFillColor }}
                  />
                </div>
                <div className="risk-score-labels">
                  <span>0 Low</span>
                  <span>30</span>
                  <span>60</span>
                  <span>High 100</span>
                </div>
              </div>

              {/* Per-line exceeded */}
              {governance.lineEvaluations.filter(e => e.isExceeded).length > 0 && (
                <div style={{
                  marginTop: '0.4rem',
                  padding: '0.5rem',
                  background: 'var(--color-error-bg)',
                  borderRadius: 'var(--radius-xs)',
                }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-error)', marginBottom: '0.3rem' }}>
                    EXCEEDED LINES
                  </div>
                  {governance.lineEvaluations.filter(e => e.isExceeded).map((e, i) => (
                    <div key={i} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                      • {e.productName}: {e.requestedDiscount}% vs {e.effectiveLimit}% limit (+{(e.exceeded ?? 0).toFixed(1)}%)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="summary-section">
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
            onClick={onSave}
            disabled={isSaving || cartItems.length === 0}
          >
            {isSaving ? (
              <>
                <span className="spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Quotation</span>
              </>
            )}
          </button>

          {cartItems.length === 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              Add products to the cart to save.
            </p>
          )}

          {governance.approvalRequired && cartItems.length > 0 && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-warning-bg)',
              border: '1px solid rgba(217,119,6,0.25)',
              fontSize: '0.75rem',
              color: 'var(--color-warning)',
              display: 'flex',
              gap: '0.35rem',
              alignItems: 'flex-start',
            }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span>Discount exceeds limits. Quotation will be flagged for manager approval in Phase 5.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
