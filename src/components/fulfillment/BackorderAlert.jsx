import React from 'react';
import { AlertTriangle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const BackorderAlert = ({
  backorders = [],
  restockMatch,
  onConsolidateBackorder,
  isOperationsUser = true
}) => {
  const openBackorders = backorders.filter(bo => bo.status === 'OPEN' && bo.quantityPending > 0);

  if (openBackorders.length === 0 && !restockMatch?.hasMatch) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      {/* 1. Restock Detection Banner (if available stock >= pending backorder) */}
      {restockMatch?.hasMatch && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
          border: '1px solid var(--color-success)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>
                Restock Match Detected!
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.15rem' }}>
                <strong>{restockMatch.message}</strong> Sufficient inventory is now available to fully resolve this order.
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={onConsolidateBackorder}
            disabled={!isOperationsUser}
            title={!isOperationsUser ? 'Only Operations role may consolidate backorders' : 'Allocate replenished stock and complete fulfillment'}
            style={{
              background: 'var(--color-success)',
              borderColor: 'var(--color-success)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              padding: '0.5rem 1.25rem'
            }}
          >
            <CheckCircle2 size={16} />
            Consolidate Remaining Backorder
          </button>
        </div>
      )}

      {/* 2. Standard Backorder Alert Card */}
      {openBackorders.length > 0 && !restockMatch?.hasMatch && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="var(--color-error)" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-error)', fontSize: '0.9375rem' }}>
                Active Backorder Shortage
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.15rem' }}>
                {openBackorders.map(bo => (
                  <span key={bo.id}>
                    <strong>{bo.quantityPending} units</strong> of {bo.productName || 'product'} awaiting inbound restock (Est. {bo.expectedDate}).
                  </span>
                ))}
              </div>
            </div>
          </div>

          <span className="badge badge-error" style={{ fontWeight: 700 }}>
            STATUS: OPEN
          </span>
        </div>
      )}
    </div>
  );
};
