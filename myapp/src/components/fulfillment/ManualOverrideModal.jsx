import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, AlertCircle, Check, Warehouse } from 'lucide-react';

export const ManualOverrideModal = ({
  isOpen,
  onClose,
  orderId,
  orderItems = [],
  inventory = [],
  warehouses = [],
  onApplyOverride
}) => {
  const primaryItem = orderItems[0];
  const requestedQty = primaryItem ? Number(primaryItem.quantity) : 0;
  const productId = primaryItem?.productId || 'PROD-007';

  // Build warehouse options with their current available stock
  const warehouseOptions = warehouses.map(wh => {
    const inv = inventory.find(i => i.productId === productId && i.warehouseId === wh.id);
    const onHand = inv ? Number(inv.onHandQty) || 0 : 0;
    const reserved = inv ? Number(inv.reservedQty) || 0 : 0;
    const available = Math.max(0, onHand - reserved);
    return {
      warehouseId: wh.id,
      warehouseName: wh.name,
      shippingCostBase: wh.shippingCostBase || 150,
      availableStock: available
    };
  });

  const [allocations, setAllocations] = useState({});
  const [error, setError] = useState(null);

  // Initialize with current available distributions (e.g. 22 at Main, 2 at East)
  useEffect(() => {
    if (isOpen) {
      const initial = {};
      warehouseOptions.forEach(wh => {
        initial[wh.warehouseId] = 0;
      });
      // Default sample: Main = 22, East = 2 if available
      if (initial['WH-MAIN'] !== undefined) initial['WH-MAIN'] = Math.min(22, warehouseOptions.find(w => w.warehouseId === 'WH-MAIN')?.availableStock || 0);
      if (initial['WH-EAST'] !== undefined) initial['WH-EAST'] = Math.min(2, warehouseOptions.find(w => w.warehouseId === 'WH-EAST')?.availableStock || 0);
      setAllocations(initial);
      setError(null);
    }
  }, [isOpen, requestedQty]);

  if (!isOpen) return null;

  const handleQtyChange = (whId, val) => {
    const num = parseInt(val, 10);
    const validNum = isNaN(num) ? 0 : Math.max(0, num);
    setAllocations(prev => ({
      ...prev,
      [whId]: validNum
    }));
    setError(null);
  };

  const totalAllocated = Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const remainingRequired = Math.max(0, requestedQty - totalAllocated);

  const handleSave = () => {
    // 1. Validation: Negative quantities not allowed
    for (const [whId, qty] of Object.entries(allocations)) {
      if (qty < 0) {
        setError(`Negative allocation is not permitted for warehouse ${whId}.`);
        return;
      }
    }

    // 2. Validation: Allocation cannot exceed available stock
    for (const wh of warehouseOptions) {
      const allocated = Number(allocations[wh.warehouseId]) || 0;
      if (allocated > wh.availableStock) {
        setError(`Allocation of ${allocated} at ${wh.warehouseName} exceeds available stock of ${wh.availableStock}.`);
        return;
      }
    }

    // 3. Validation: Total allocation cannot exceed ordered quantity
    if (totalAllocated > requestedQty) {
      setError(`Total allocated quantity (${totalAllocated}) cannot exceed ordered quantity (${requestedQty}).`);
      return;
    }

    const payload = Object.entries(allocations).map(([whId, qty]) => ({
      warehouseId: whId,
      warehouseName: warehouseOptions.find(w => w.warehouseId === whId)?.warehouseName || whId,
      allocatedQty: Number(qty) || 0
    }));

    try {
      onApplyOverride(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-content card-surface" style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-color)',
        padding: '1.75rem'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={20} color="var(--primary-500)" />
              Operations Manual Override
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Order: <strong>{orderId}</strong> | Required: <strong>{requestedQty} units</strong> ({primaryItem?.productName || 'Laptop Pro 14'})
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-error)',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Warehouse input rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {warehouseOptions.map(wh => {
            const val = allocations[wh.warehouseId] || 0;
            const isExceeded = val > wh.availableStock;

            return (
              <div
                key={wh.warehouseId}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: isExceeded ? '1px solid var(--color-error)' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Warehouse size={15} color="var(--primary-500)" />
                    {wh.warehouseName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isExceeded ? 'var(--color-error)' : 'var(--text-muted)' }}>
                    Available Stock: <strong>{wh.availableStock}</strong> units | Carrier Base: ${wh.shippingCostBase}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="0"
                    max={wh.availableStock}
                    value={val}
                    onChange={e => handleQtyChange(wh.warehouseId, e.target.value)}
                    style={{
                      width: '80px',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isExceeded ? '1px solid var(--color-error)' : '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      textAlign: 'right',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>units</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Calculation Tally */}
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Required:</span>
            <span style={{ fontWeight: 700 }}>{requestedQty} units</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Manually Allocated:</span>
            <span style={{ fontWeight: 700, color: totalAllocated === requestedQty ? 'var(--color-success)' : 'var(--primary-500)' }}>
              {totalAllocated} units
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.375rem', borderTop: '1px dashed var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Calculated Backorder Shortfall:</span>
            <span style={{ fontWeight: 700, color: remainingRequired > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
              {remainingRequired} units {remainingRequired > 0 && '(Will create Backorder)'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={totalAllocated === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <Check size={16} />
            Apply & Recalculate State
          </button>
        </div>
      </div>
    </div>
  );
};
