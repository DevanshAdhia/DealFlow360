import React from 'react';
import { Truck, DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { formatINRCompact } from '../../utils/formatters.js';

export const FulfillmentSummary = ({
  totalShipments = 0,
  shippingCost = 0,
  fulfilledQty = 0,
  pendingQty = 0,
  backorderQty = 0
}) => {
  return (
    <div className="approvals-kpi-grid" style={{ marginBottom: '1.5rem' }}>
      <div className="kpi-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="kpi-label">Total Shipments</span>
          <Truck size={18} color="var(--primary-500)" />
        </div>
        <div className="kpi-value" style={{ color: 'var(--primary-500)' }}>
          {totalShipments}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Consolidated warehouse dispatches
        </div>
      </div>

      <div className="kpi-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="kpi-label">Shipping Cost</span>
          <DollarSign size={18} color="var(--color-info)" />
        </div>
        <div className="kpi-value" style={{ color: 'var(--color-info)' }}>
          ${shippingCost.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Calculated logistics base cost
        </div>
      </div>

      <div className="kpi-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="kpi-label">Fulfilled Quantity</span>
          <CheckCircle2 size={18} color="var(--color-success)" />
        </div>
        <div className="kpi-value" style={{ color: 'var(--color-success)' }}>
          {fulfilledQty}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Stock reserved & allocated
        </div>
      </div>

      <div className="kpi-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="kpi-label">Pending / Unallocated</span>
          <Clock size={18} color="var(--color-warning)" />
        </div>
        <div className="kpi-value" style={{ color: pendingQty > 0 ? 'var(--color-warning)' : 'inherit' }}>
          {pendingQty}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Awaiting allocation confirmation
        </div>
      </div>

      <div className="kpi-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span className="kpi-label">Backorder Quantity</span>
          <AlertTriangle size={18} color={backorderQty > 0 ? 'var(--color-error)' : 'var(--text-muted)'} />
        </div>
        <div className="kpi-value" style={{ color: backorderQty > 0 ? 'var(--color-error)' : 'inherit' }}>
          {backorderQty}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {backorderQty > 0 ? 'Requires inbound replenishment' : 'Zero backorders'}
        </div>
      </div>
    </div>
  );
};
