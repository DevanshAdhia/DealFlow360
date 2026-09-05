import React, { useState, useMemo } from 'react';
import { useFulfillment } from '../../context/FulfillmentContext.jsx';
import { getStockLevels } from '../../services/inventoryService.js';
import { Warehouse, Search, Filter, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const StockTable = () => {
  const { inventory, warehouses, products, simulateRestock } = useFulfillment();
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate live stock levels dynamically (available = onHandQty - reservedQty)
  const stockRows = useMemo(() => {
    return getStockLevels(inventory, warehouses, products);
  }, [inventory, warehouses, products]);

  const filteredRows = useMemo(() => {
    return stockRows.filter(row => {
      if (selectedWarehouse !== 'ALL' && row.warehouseId !== selectedWarehouse) {
        return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          row.productName.toLowerCase().includes(term) ||
          row.productCode.toLowerCase().includes(term) ||
          row.warehouseName.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [stockRows, selectedWarehouse, searchTerm]);

  return (
    <div className="card-surface" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Warehouse size={20} color="var(--primary-500)" />
            Live Stock per Warehouse
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Calculated in real-time from active inventory allocations. Available = In Stock − Reserved.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Warehouse Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={selectedWarehouse}
              onChange={e => setSelectedWarehouse(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="ALL">All Warehouses ({warehouses.length})</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', width: '160px' }}
            />
          </div>

          {/* Simulate East Depot Restock Button */}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => simulateRestock('PROD-007', 'WH-EAST', 4)}
            title="Simulate inbound restock of +4 Laptop Pro 14 at East Depot"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
          >
            <RefreshCw size={14} color="var(--color-success)" />
            +4 East Depot Restock
          </button>
        </div>
      </div>

      <div className="table-border-wrapper">
        <table className="dealflow-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '22%' }}>Warehouse</th>
              <th style={{ textAlign: 'left', width: '28%' }}>Product</th>
              <th style={{ textAlign: 'right', width: '12%' }}>In Stock</th>
              <th style={{ textAlign: 'right', width: '12%' }}>Reserved</th>
              <th style={{ textAlign: 'right', width: '12%', fontWeight: 700 }}>Available</th>
              <th style={{ textAlign: 'center', width: '14%' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No stock records match the current filter.
                </td>
              </tr>
            ) : (
              filteredRows.map(row => (
                <tr key={row.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.warehouseName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.warehouseLocation}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {row.productCode}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9375rem' }}>{row.onHandQty}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.9375rem', color: row.reservedQty > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                    {row.reservedQty}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace', color: row.availableQty > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {row.availableQty}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.availableQty === 0 ? (
                      <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertCircle size={12} /> Out of Stock
                      </span>
                    ) : row.availableQty <= row.reorderLevel ? (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertCircle size={12} /> Low Stock
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={12} /> In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
