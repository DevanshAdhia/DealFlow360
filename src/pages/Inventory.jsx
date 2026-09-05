import React, { useState } from 'react';
import { getInventory, saveEntity, addAuditLog } from '../services/storageService';
import { DataTable, Modal, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const WAREHOUSES = ['Main Hub', 'East Coast DC', 'West Coast Hub', 'South Hub', 'Digital Fulfillment'];
const REASONS = ['Stock Received', 'Sales Fulfillment', 'Damage/Write-off', 'Return', 'Audit Correction', 'Transfer'];

function Inventory() {
  const [data, setData] = useState(() => getInventory());
  const [search, setSearch] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjForm, setAdjForm] = useState({ type: 'Increase', quantity: '', reason: 'Stock Received' });
  const [adjError, setAdjError] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = () => setData(getInventory());
  const filtered = data.filter(item => {
    const s = !search || item.product?.toLowerCase().includes(search.toLowerCase()) || item.sku?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterWarehouse || item.warehouse === filterWarehouse) && (!filterStatus || item.status === filterStatus);
  });

  const handleAdjust = (item) => { setSelectedItem(item); setAdjForm({ type: 'Increase', quantity: '', reason: 'Stock Received' }); setAdjError(''); setIsAdjustOpen(true); };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const qty = Number(adjForm.quantity);
    if (!qty || qty <= 0) { setAdjError('Enter a valid quantity > 0'); return; }
    if (adjForm.type === 'Decrease' && qty > selectedItem.available) { setAdjError(`Cannot decrease by ${qty} — only ${selectedItem.available} available`); return; }
    setLoading(true);
    setTimeout(() => {
      const newAvailable = adjForm.type === 'Increase' ? selectedItem.available + qty : selectedItem.available - qty;
      const newStatus = newAvailable === 0 ? 'Backordered' : newAvailable < 5 ? 'Critical' : newAvailable < 10 ? 'Low Stock' : 'Healthy';
      saveEntity('df_inventory', { ...selectedItem, available: newAvailable, status: newStatus }, false);
      addAuditLog(null, 'Adjusted Inventory', 'Inventory', `${adjForm.type} ${qty} units of ${selectedItem.product} — ${adjForm.reason}`);
      toast.success(`Inventory adjusted — ${adjForm.type} by ${qty} units.`);
      setIsAdjustOpen(false); setLoading(false); refresh();
    }, 500);
  };

  const totalItems = data.length;
  const healthyCount = data.filter(i => i.status === 'Healthy').length;
  const lowStockCount = data.filter(i => i.status === 'Low Stock').length;
  const criticalCount = data.filter(i => i.status === 'Critical' || i.status === 'Backordered').length;

  const columns = [
    { Header: 'Product', accessor: 'product', sortable: true },
    { Header: 'SKU', accessor: 'sku', sortable: true },
    { Header: 'Warehouse', accessor: 'warehouse', sortable: true },
    { Header: 'Available', accessor: 'available', sortable: true },
    { Header: 'Reorder Lvl', accessor: 'reorderLevel', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge onChange={s => { saveEntity('df_inventory', { ...row, status: s }, false); toast.success(`Stock status updated to ${s}`); refresh(); }}>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => <button onClick={() => handleAdjust(row)} className="btn-table-action edit">Adjust Stock</button> }
  ];

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Real-time stock levels across all warehouses with manual adjustment tools.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">SKUs TRACKED</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div className="metric-value text-brand">{totalItems}</div>
          <div className="metric-subtitle">Active inventory items</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">HEALTHY STOCK</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{healthyCount}</div>
          <div className="metric-subtitle">Above reorder level</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">LOW STOCK</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="metric-value text-warning">{lowStockCount}</div>
          <div className="metric-subtitle">Reorder recommended</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">CRITICAL / BACKORDER</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-danger">{criticalCount}</div>
          <div className="metric-subtitle">Immediate action needed</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>Inventory Records ({filtered.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or SKU…" className="form-input" style={{ width: '200px', height: '32px' }} />
            <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)} className="form-select" style={{ width: '170px', height: '32px' }}>
              <option value="">All Warehouses</option>{WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Statuses</option>
              <option value="Healthy">Healthy</option><option value="Low Stock">Low Stock</option><option value="Critical">Critical</option><option value="Backordered">Backordered</option>
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No inventory records found." />
      </div>

      <Modal isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} title="Adjust Inventory">
        {selectedItem && (
          <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="card-body" style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{selectedItem.product}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>SKU: {selectedItem.sku} · {selectedItem.warehouse} · Available: <strong style={{ color: '#111827' }}>{selectedItem.available}</strong></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={lbl}>Adjustment Type</label><select value={adjForm.type} onChange={e => setAdjForm({ ...adjForm, type: e.target.value })} style={inp}><option value="Increase">Increase</option><option value="Decrease">Decrease</option></select></div>
              <div><label style={lbl}>Quantity *</label><input type="number" min="1" value={adjForm.quantity} onChange={e => { setAdjForm({ ...adjForm, quantity: e.target.value }); setAdjError(''); }} style={{ ...inp, borderColor: adjError ? '#ef4444' : '#d1d5db' }} /></div>
            </div>
            <div><label style={lbl}>Reason</label><select value={adjForm.reason} onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })} style={inp}>{REASONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            {adjError && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 14px', color: '#dc2626', fontSize: '0.875rem' }}>{adjError}</div>}
            {adjForm.quantity && Number(adjForm.quantity) > 0 && !adjError && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 14px', color: '#15803d', fontSize: '0.875rem' }}>
                New stock level: <strong>{adjForm.type === 'Increase' ? selectedItem.available + Number(adjForm.quantity) : Math.max(0, selectedItem.available - Number(adjForm.quantity))} units</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              <button type="button" onClick={() => setIsAdjustOpen(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Adjusting…' : 'Apply Adjustment'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Inventory;
