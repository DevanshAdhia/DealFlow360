import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const WAREHOUSES = ['Main Hub', 'East Coast DC', 'West Coast Hub', 'South Hub', 'Digital Fulfillment'];
const REASONS = ['Stock Received', 'Sales Fulfillment', 'Damage/Write-off', 'Return', 'Audit Correction', 'Transfer'];

function Inventory() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjForm, setAdjForm] = useState({ type: 'Increase', quantity: '', reason: 'Stock Received' });
  const [adjError, setAdjError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchInventory = async () => {
    setPageLoading(true);
    try {
      const res = await api.getInventory();
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load inventory from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Reset to page 1 when search or filters change
  useEffect(() => { setTablePage(1); }, [search, filterWarehouse, filterStatus]);

  const warehouseOptions = Array.from(new Set(data.map(i => i.warehouse_name || i.warehouse))).filter(Boolean);

  const filtered = data.filter(item => {
    const pName = item.product_name || item.product || '';
    const pSku = item.product_sku || item.sku || '';
    const wName = item.warehouse_name || item.warehouse || '';
    const s = !search || String(pName).toLowerCase().includes(search.toLowerCase()) || String(pSku).toLowerCase().includes(search.toLowerCase());
    const qty = item.available_to_allocate ?? item.quantity_on_hand ?? item.available ?? 0;
    const statusMatch = !filterStatus || (
      filterStatus === 'Healthy' ? (qty > 10) :
      filterStatus === 'Low Stock' ? (qty > 0 && qty <= 10) :
      filterStatus === 'Critical' ? (qty === 0) : true
    );
    return s && (!filterWarehouse || wName === filterWarehouse) && statusMatch;
  });

  const handleAdjust = (item) => { setSelectedItem(item); setAdjForm({ type: 'Increase', quantity: '', reason: 'Stock Received' }); setAdjError(''); setIsAdjustOpen(true); };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(adjForm.quantity);
    if (!qty || qty <= 0) { setAdjError('Enter a valid quantity > 0'); return; }
    
    setLoading(true);
    try {
      const currentQty = Number(selectedItem.quantity_on_hand ?? selectedItem.available_to_allocate ?? selectedItem.available ?? 0);
      const newQty = adjForm.type === 'Increase' ? currentQty + qty : Math.max(0, currentQty - qty);
      await api.updateInventory(selectedItem.id, { quantity_on_hand: newQty });
      toast.success(`Inventory updated to ${newQty} units.`);
      setIsAdjustOpen(false);
      await fetchInventory();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock.');
    } finally {
      setLoading(false);
    }
  };

  const totalItems = data.length;
  const healthyCount = data.filter(i => (i.available_to_allocate ?? i.quantity_on_hand ?? 0) > 10).length;
  const lowStockCount = data.filter(i => {
    const q = i.available_to_allocate ?? i.quantity_on_hand ?? 0;
    return q > 0 && q <= 10;
  }).length;
  const criticalCount = data.filter(i => (i.available_to_allocate ?? i.quantity_on_hand ?? 0) === 0).length;

  const columns = [
    { Header: 'Product', accessor: 'product_name', sortable: true, Cell: row => row.product_name || row.product || 'N/A' },
    { Header: 'SKU', accessor: 'product_sku', sortable: true, Cell: row => row.product_sku || row.sku || 'N/A' },
    { Header: 'Warehouse', accessor: 'warehouse_name', sortable: true, Cell: row => row.warehouse_name || row.warehouse || 'N/A' },
    { Header: 'Available', accessor: 'quantity_on_hand', sortable: true, Cell: row => row.available_to_allocate ?? row.quantity_on_hand ?? row.available ?? 0 },
    { Header: 'Reorder Lvl', accessor: 'reorderLevel', sortable: true, Cell: row => row.reorderLevel || row.reorder_level || 10 },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => {
        const qty = row.available_to_allocate ?? row.quantity_on_hand ?? row.available ?? 0;
        const st = qty > 10 ? 'Healthy' : qty > 0 ? 'Low Stock' : 'Critical';
        return <Badge>{st}</Badge>;
      } 
    },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => <button onClick={() => handleAdjust(row)} className="btn-table-action edit">Adjust Stock</button> }
  ];

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
              <option value="">All Warehouses</option>
              {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Statuses</option>
              <option value="Healthy">Healthy</option><option value="Low Stock">Low Stock</option><option value="Critical">Critical</option><option value="Backordered">Backordered</option>
            </select>
          </div>
        </div>
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading inventory from backend…</div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No inventory records found." currentPage={tablePage} onPageChange={setTablePage} />
        )}
      </div>

      <Modal isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} title="Adjust Inventory">
        {selectedItem && (
          <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="card-body" style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{selectedItem.product_name || selectedItem.product}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  SKU: {selectedItem.product_sku || selectedItem.sku || 'N/A'} · {selectedItem.warehouse_name || selectedItem.warehouse || 'Main Hub'} · Available: <strong style={{ color: '#111827' }}>{selectedItem.available_to_allocate ?? selectedItem.quantity_on_hand ?? selectedItem.available ?? 0}</strong>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Adjustment Type</label><select value={adjForm.type} onChange={e => setAdjForm({ ...adjForm, type: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}><option value="Increase">Increase</option><option value="Decrease">Decrease</option></select></div>
              <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Quantity *</label><input type="number" min="1" value={adjForm.quantity} onChange={e => { setAdjForm({ ...adjForm, quantity: e.target.value }); setAdjError(''); }} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
            </div>
            <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Reason</label><select value={adjForm.reason} onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}>{REASONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            {adjError && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 14px', color: '#dc2626', fontSize: '0.875rem' }}>{adjError}</div>}
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
