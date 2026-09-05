import React from 'react';
import { Split, Check, SlidersHorizontal, Warehouse, ShieldCheck, AlertCircle } from 'lucide-react';

export const SplitSuggestion = ({
  suggestedSplit,
  onAcceptSplit,
  onOpenManualOverride,
  isOperationsUser = true,
  isAllocated = false,
  orderStatus
}) => {
  if (!suggestedSplit) return null;

  return (
    <div className="card-surface" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-500)', background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.04) 0%, rgba(59, 130, 246, 0.01) 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge" style={{ background: 'var(--primary-500)', color: '#ffffff', fontWeight: 700, padding: '0.2rem 0.6rem' }}>
              AUTOMATIC SPLIT ENGINE
            </span>
            {suggestedSplit.isSplit && (
              <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-500)' }}>
                Multi-Warehouse Split
              </span>
            )}
            {suggestedSplit.backorderQty > 0 && (
              <span className="badge badge-error">
                Stock Shortage ({suggestedSplit.backorderQty} Backorder)
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Split size={20} color="var(--primary-500)" />
            Optimal Warehouse Allocation Suggestion
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Algorithmic split prioritizing minimal warehouse hops, lowest carrier transit cost, and available stock integrity.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-outline"
            onClick={onOpenManualOverride}
            disabled={!isOperationsUser}
            title={!isOperationsUser ? 'Only Operations role may perform manual overrides' : 'Customize warehouse allocation breakdown'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <SlidersHorizontal size={16} />
            Manual Override
          </button>

          <button
            className="btn btn-primary"
            onClick={onAcceptSplit}
            disabled={!isOperationsUser || isAllocated}
            title={!isOperationsUser ? 'Only Operations role may execute allocations' : isAllocated ? 'Split already accepted & allocated' : 'Accept suggested split and reserve warehouse inventory'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <Check size={16} />
            {isAllocated ? 'Split Accepted' : 'Accept Suggested Split'}
          </button>
        </div>
      </div>

      {/* Suggested Allocation Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {suggestedSplit.allocations.map((alloc, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <Warehouse size={16} color="var(--primary-500)" />
                {alloc.warehouseName}
              </div>
              <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                {alloc.allocatedQty} units
              </span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Product: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alloc.productName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
              <span>Transit Route: 1 Shipment</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Shipping Base: ${alloc.shippingCost}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary strip */}
      <div style={{
        marginTop: '1.25rem',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(59, 130, 246, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <ShieldCheck size={18} color="var(--primary-500)" />
          <span>
            Optimization: <strong>{suggestedSplit.totalShipments} Shipments</strong> required. Estimated logistics cost: <strong>${suggestedSplit.totalShippingCost.toLocaleString()}</strong>.
          </span>
        </div>

        {suggestedSplit.backorderQty > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-error)', fontWeight: 600 }}>
            <AlertCircle size={16} />
            <span>Shortfall of {suggestedSplit.backorderQty} units will trigger an automated Backorder.</span>
          </div>
        ) : (
          <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>
            ✓ 100% of requested quantity satisfied across warehouses.
          </div>
        )}
      </div>
    </div>
  );
};
