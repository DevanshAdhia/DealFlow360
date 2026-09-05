import React from 'react';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { Building2, Package } from 'lucide-react';

export const Warehouses = () => {
  const { warehouses, inventory } = useFulfillment();

  // Helper to calculate total inventory count per warehouse
  const getWarehouseStock = (warehouseId) => {
    return inventory
      .filter(i => i.warehouseId === warehouseId)
      .reduce((sum, item) => sum + item.availableQuantity, 0);
  };

  return (
    <div className="quotations-page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={24} color="var(--primary-500)" />
          Warehouses & Facilities
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Master list of fulfillment hubs and capacity.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {warehouses.map(wh => (
          <div key={wh.id} className="card-surface" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{wh.name}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{wh.location}</div>
              </div>
              <span className={`badge badge-${wh.status === 'Active' ? 'success' : 'warning'}`}>{wh.status}</span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Stock</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-600)' }}>{getWarehouseStock(wh.id)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capacity</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{wh.capacity.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: 'auto' }}>
              <span style={{ fontWeight: 600 }}>Manager:</span> {wh.manager} <br />
              <span style={{ fontWeight: 600 }}>Type:</span> {wh.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
