import React from 'react';
import { Warehouse, Package } from 'lucide-react';
import { formatINRCompact } from '../../utils/formatters.js';

export const FulfillmentAllocationTable = ({
  orderItems = [],
  fulfillmentItems = [],
  warehouses = [],
  suggestedSplit = null
}) => {
  const warehouseMap = new Map(warehouses.map(w => [w.id, w]));

  const rows = [];

  if (fulfillmentItems.length > 0) {
    fulfillmentItems.forEach(fi => {
      const wh = warehouseMap.get(fi.warehouseId);
      const oi = orderItems.find(item => item.id === fi.orderItemId) || orderItems[0];
      rows.push({
        id: fi.id,
        warehouseName: fi.warehouseName || wh?.name || fi.warehouseId,
        warehouseCode: wh?.code || fi.warehouseId,
        productName: fi.productName || oi?.productName || 'Product',
        productId: fi.productId,
        orderedQty: oi ? oi.quantity : (fi.allocatedQty || 0),
        allocatedQty: fi.allocatedQty || 0,
        fulfilledQty: fi.fulfilledQty || 0,
        pendingQty: fi.pendingQty || 0,
        shipments: 1,
        shippingCost: fi.shippingCost || wh?.shippingCostBase || 150,
        status: fi.status || 'ALLOCATED',
        isSuggested: false
      });
    });
  } else if (suggestedSplit && suggestedSplit.allocations && suggestedSplit.allocations.length > 0) {
    suggestedSplit.allocations.forEach((alloc, idx) => {
      const wh = warehouseMap.get(alloc.warehouseId);
      const oi = orderItems.find(item => item.id === alloc.orderItemId) || orderItems[0];
      rows.push({
        id: `SUGG-${alloc.warehouseId}-${idx}`,
        warehouseName: alloc.warehouseName || wh?.name || alloc.warehouseId,
        warehouseCode: wh?.code || alloc.warehouseId,
        productName: alloc.productName || oi?.productName || 'Product',
        productId: alloc.productId,
        orderedQty: oi ? oi.quantity : alloc.allocatedQty,
        allocatedQty: alloc.allocatedQty,
        fulfilledQty: alloc.allocatedQty,
        pendingQty: 0,
        shipments: 1,
        shippingCost: alloc.shippingCost || wh?.shippingCostBase || 150,
        status: 'SUGGESTED',
        isSuggested: true
      });
    });
  } else {
    orderItems.forEach(oi => {
      rows.push({
        id: `PENDING-${oi.id}`,
        warehouseName: 'Pending Allocation (Main + East suggested)',
        warehouseCode: 'UNASSIGNED',
        productName: oi.productName,
        productId: oi.productId,
        orderedQty: oi.quantity,
        allocatedQty: 0,
        fulfilledQty: 0,
        pendingQty: oi.quantity,
        shipments: 0,
        shippingCost: 0,
        status: 'PENDING',
        isSuggested: false
      });
    });
  }

  return (
    <div className="card-surface" style={{ marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={18} color="var(--primary-500)" />
          Stock Allocation & Logistics Breakdown
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Per-warehouse item breakdown indicating physical origin, units fulfilled, remaining shortage, estimated shipments, and carrier freight.
        </p>
      </div>

      <div className="table-border-wrapper">
        <table className="dealflow-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Warehouse</th>
              <th style={{ textAlign: 'left' }}>Product</th>
              <th style={{ textAlign: 'right' }}>Ordered</th>
              <th style={{ textAlign: 'right' }}>Allocated</th>
              <th style={{ textAlign: 'right' }}>Qty Fulfilled</th>
              <th style={{ textAlign: 'right' }}>Pending</th>
              <th style={{ textAlign: 'center' }}>Estimated Shipments</th>
              <th style={{ textAlign: 'right' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Warehouse size={14} color="var(--text-muted)" />
                    {row.warehouseName}
                    {row.isSuggested && (
                      <span className="badge" style={{ fontSize: '0.6875rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-500)' }}>
                        Suggested
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.warehouseCode}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.productName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {row.productId}</div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{row.orderedQty}</td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: row.allocatedQty > 0 ? 'var(--primary-500)' : 'var(--text-muted)' }}>
                  {row.allocatedQty}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: row.fulfilledQty > 0 ? 'var(--color-success)' : 'var(--text-muted)' }}>
                  {row.fulfilledQty}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: row.pendingQty > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                  {row.pendingQty}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                    {row.shipments > 0 ? `${row.shipments} Shipment` : '—'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {row.shippingCost > 0 ? `$${row.shippingCost.toLocaleString()}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
