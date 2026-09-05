import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, DataTable, ConfirmDialog } from '../components/common/UI';
import { getInventory, saveEntity } from '../services/storageService';

function Inventory() {
  const [inventory, setInventory] = useState(() => getInventory());
  const [search, setSearch] = useState('');

  const filtered = inventory.filter(i => 
    i.product.toLowerCase().includes(search.toLowerCase()) || 
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { Header: 'Product', accessor: 'product', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.product}</strong> },
    { Header: 'SKU', accessor: 'sku', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.sku}</span> },
    { Header: 'Warehouse', accessor: 'warehouse', sortable: true },
    { Header: 'Available', accessor: 'available', sortable: true, Cell: row => <strong style={{ fontSize: '1.1rem', color: row.available <= row.reorderLevel ? 'var(--danger)' : 'inherit' }}>{row.available}</strong> },
    { Header: 'Reserved', accessor: 'reserved', sortable: true },
    { Header: 'Incoming', accessor: 'incoming', sortable: true },
    { Header: 'Reorder Level', accessor: 'reorderLevel', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge type={row.status === 'Healthy' ? 'success' : row.status === 'Low Stock' ? 'warning' : 'danger'}>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        <Button variant="secondary" style={{ padding: '0.375rem 0.75rem' }}>Adjust Stock</Button>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Inventory Operations</h1>
          <p className="page-subtitle">Monitor stock levels, manage allocations, and track multi-warehouse capacity.</p>
        </div>
        <Button className="btn-primary">+ Stock Transfer</Button>
      </div>

      <div className="metric-grid">
        <div className="metric-card active">
          <div className="metric-header">
            <span className="metric-title">TOTAL STOCK</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div className="metric-value text-brand">{inventory.reduce((acc, curr) => acc + curr.available, 0)}</div>
          <div className="metric-subtitle">Units available to promise</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">RESERVED</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div className="metric-value text-warning">{inventory.reduce((acc, curr) => acc + curr.reserved, 0)}</div>
          <div className="metric-subtitle">Allocated to active orders</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">CRITICAL ITEMS</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="metric-value text-danger">{inventory.filter(i => i.available <= i.reorderLevel).length}</div>
          <div className="metric-subtitle">Below reorder threshold</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <svg className="filter-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            className="filter-search-input"
            placeholder="Search SKU or Product Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select className="filter-select">
          <option>Warehouse: All Facilities</option>
        </select>
        
        <select className="filter-select">
          <option>Status: All Statuses</option>
          <option>Healthy</option>
          <option>Low Stock</option>
          <option>Critical</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <div className="empty-state" style={{ minHeight: '250px', border: 'none', backgroundColor: 'transparent' }}>
            <div className="empty-state-icon-container">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="empty-state-title">No Inventory Found</h3>
            <p className="empty-state-desc">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;
