import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { Package, Truck, Warehouse, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { AwaitingFulfillmentTable } from '../components/fulfillment/AwaitingFulfillmentTable.jsx';
import { StockTable } from '../components/fulfillment/StockTable.jsx';

export const FulfillmentList = () => {
  const navigate = useNavigate();
  const { awaitingOrders, inventory, warehouses, backorders } = useFulfillment();

  // Metric counts
  const pendingOrdersCount = awaitingOrders.filter(o => o.status !== 'FULFILLED').length;
  const totalStockUnits = inventory.reduce((sum, inv) => sum + (Number(inv.onHandQty) || 0), 0);
  const totalReservedUnits = inventory.reduce((sum, inv) => sum + (Number(inv.reservedQty) || 0), 0);
  const activeHubsCount = warehouses.filter(w => w.status === 'Active').length;
  const openBackordersCount = backorders.filter(bo => bo.status === 'OPEN').length;

  return (
    <div className="quotations-page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Package size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Fulfillment and Stock (List)
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.375rem' }}>
            Live stock per warehouse, plus every order that still needs fulfillment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/fulfillment/SO-1042')}>
            <Truck size={16} /> Open SO-1042 Demo
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="approvals-kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="kpi-label">Awaiting Fulfillment</span>
            <Truck size={18} color="var(--primary-500)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary-500)' }}>
            {pendingOrdersCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Orders needing split or dispatch
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="kpi-label">Active Warehouses</span>
            <Warehouse size={18} color="var(--color-success)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>
            {activeHubsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Main, East, West & regional hubs
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="kpi-label">Total Stock / Reserved</span>
            <Package size={18} color="var(--color-info)" />
          </div>
          <div className="kpi-value" style={{ color: 'var(--color-info)' }}>
            {totalStockUnits} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {totalReservedUnits} res</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Net available: {totalStockUnits - totalReservedUnits} units
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="kpi-label">Open Backorders</span>
            <AlertTriangle size={18} color={openBackordersCount > 0 ? 'var(--color-error)' : 'var(--text-muted)'} />
          </div>
          <div className="kpi-value" style={{ color: openBackordersCount > 0 ? 'var(--color-error)' : 'inherit' }}>
            {openBackordersCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {openBackordersCount > 0 ? 'Replenishment pending' : 'No shortages'}
          </div>
        </div>
      </div>

      {/* Section 1: Orders Awaiting Fulfillment */}
      <AwaitingFulfillmentTable />

      {/* Section 2: Live Stock Per Warehouse */}
      <StockTable />
    </div>
  );
};
