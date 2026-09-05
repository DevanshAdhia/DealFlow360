import React, { useMemo, useState } from 'react';
import { ArrowUpCircle, Zap, Plus, RefreshCw, X } from 'lucide-react';
import PRODUCTS_DATA from '../../data/products.json';
import { getRecommendations, hydrateRecommendations } from '../../data/recommendationRules.js';
import { formatINR } from '../../utils/formatters.js';

export const RecommendationPanel = ({
  cartItems = [],
  customerTier = 'Standard',
  customerIndustry = '',
  onAddProduct,
  onReplaceProduct,
}) => {
  const [confirmReplace, setConfirmReplace] = useState(null); // { sourceProductId, targetProduct }

  const { upsells, crossSells } = useMemo(() => {
    const raw = getRecommendations(cartItems, customerTier, customerIndustry);
    return hydrateRecommendations(raw, PRODUCTS_DATA);
  }, [cartItems, customerTier, customerIndustry]);

  const totalRecs = upsells.length + crossSells.length;

  const handleAddCrossSell = (product) => {
    onAddProduct(product);
  };

  const handleUpsellClick = (rec) => {
    if (rec.isReplace) {
      setConfirmReplace(rec);
    } else {
      onAddProduct(rec.product);
    }
  };

  const handleConfirmReplace = () => {
    if (!confirmReplace) return;
    onReplaceProduct(confirmReplace.sourceProductId, confirmReplace.product);
    setConfirmReplace(null);
  };

  return (
    <>
      {/* Confirm Replace Dialog */}
      {confirmReplace && (
        <div className="confirm-overlay" onClick={() => setConfirmReplace(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={20} color="var(--color-warning)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Replace Product?</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This will replace the current product with{' '}
              <strong>{confirmReplace.product.name}</strong> in the cart.
              Quantity and discount will be preserved.
            </p>
            <div style={{
              background: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>New price</span>
                <strong>{formatINR(confirmReplace.product.price)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Price impact</span>
                <strong style={{ color: 'var(--primary-600)' }}>{confirmReplace.priceImpact}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmReplace(null)}>
                <X size={15} /> Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirmReplace}>
                <RefreshCw size={15} /> Replace
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {totalRecs === 0 ? (
          <div className="rec-empty">
            <Zap size={28} color="var(--border-medium)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {cartItems.length === 0
                ? 'Add products to the cart to see recommendations.'
                : 'No additional recommendations for the current selection.'}
            </p>
          </div>
        ) : (
          <>
            {/* Upsell */}
            {upsells.length > 0 && (
              <div>
                <div className="rec-section-label">
                  <ArrowUpCircle size={11} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                  Upgrade Recommendation
                </div>
                {upsells.map((rec, i) => (
                  <div key={i} className="rec-card upsell">
                    <div className="rec-card-header">
                      <div className="rec-card-name">
                        ⬆ {rec.product.name}
                      </div>
                      <span className="rec-price-badge">{rec.priceImpact}</span>
                    </div>
                    <p className="rec-reason">{rec.reason}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {formatINR(rec.product.price)}
                      </span>
                      <button
                        className={`rec-add-btn ${rec.isReplace ? 'rec-replace-btn' : ''}`}
                        onClick={() => handleUpsellClick(rec)}
                      >
                        <RefreshCw size={11} />
                        {rec.isReplace ? 'Replace' : 'Add'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cross-sell */}
            {crossSells.length > 0 && (
              <div>
                <div className="rec-section-label">
                  <Zap size={11} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                  Recommended For You
                </div>
                {crossSells.map((rec, i) => (
                  <div key={i} className="rec-card cross-sell">
                    <div className="rec-card-header">
                      <div className="rec-card-name">{rec.product.name}</div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                        {rec.product.category}
                      </span>
                    </div>
                    <p className="rec-reason">{rec.reason}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {formatINR(rec.product.price)}
                      </span>
                      <button
                        className="rec-add-btn"
                        onClick={() => handleAddCrossSell(rec.product)}
                      >
                        <Plus size={11} />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
