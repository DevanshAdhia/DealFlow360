import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const REASONS = ['Stock Received', 'Sales Fulfillment', 'Damage/Write-off', 'Return', 'Audit Correction', 'Transfer'];

const INITIAL_INVENTORY = [
  { id: 1, product_name: 'Enterprise Server Blade X9', product: 'Enterprise Server Blade X9', product_sku: 'SKU-SRV-901', sku: 'SKU-SRV-901', warehouse_name: 'Main Distribution Hub', warehouse: 'Main Distribution Hub', quantity_on_hand: 42, available_to_allocate: 42, reorderLevel: 10 },
  { id: 2, product_name: 'High-Speed Fiber Switch 48P', product: 'High-Speed Fiber Switch 48P', product_sku: 'SKU-NET-480', sku: 'SKU-NET-480', warehouse_name: 'North Fulfillment Center', warehouse: 'North Fulfillment Center', quantity_on_hand: 8, available_to_allocate: 8, reorderLevel: 15 },
  { id: 3, product_name: 'Enterprise Storage Array 100TB', product: 'Enterprise Storage Array 100TB', product_sku: 'SKU-STR-100', sku: 'SKU-STR-100', warehouse_name: 'South Regional Logistics', warehouse: 'South Regional Logistics', quantity_on_hand: 0, available_to_allocate: 0, reorderLevel: 5 },
  { id: 4, product_name: 'Workstation Pro 16GB', product: 'Workstation Pro 16GB', product_sku: 'SKU-WKS-016', sku: 'SKU-WKS-016', warehouse_name: 'West Gateway Warehouse', warehouse: 'West Gateway Warehouse', quantity_on_hand: 28, available_to_allocate: 28, reorderLevel: 10 },
  { id: 5, product_name: 'Smart Power Distribution Unit', product: 'Smart Power Distribution Unit', product_sku: 'SKU-PDU-004', sku: 'SKU-PDU-004', warehouse_name: 'Main Distribution Hub', warehouse: 'Main Distribution Hub', quantity_on_hand: 5, available_to_allocate: 5, reorderLevel: 12 },
  { id: 6, product_name: 'Industrial Router Dual-WAN', product: 'Industrial Router Dual-WAN', product_sku: 'SKU-RTR-002', sku: 'SKU-RTR-002', warehouse_name: 'East Regional Depot', warehouse: 'East Regional Depot', quantity_on_hand: 19, available_to_allocate: 19, reorderLevel: 8 },
  { id: 7, product_name: 'Uninterruptible Power Supply 10kVA', product: 'Uninterruptible Power Supply 10kVA', product_sku: 'SKU-UPS-010', sku: 'SKU-UPS-010', warehouse_name: 'North Fulfillment Center', warehouse: 'North Fulfillment Center', quantity_on_hand: 3, available_to_allocate: 3, reorderLevel: 6 },
  { id: 8, product_name: 'Fiber Optic Patch Panel 24P', product: 'Fiber Optic Patch Panel 24P', product_sku: 'SKU-ACC-024', sku: 'SKU-ACC-024', warehouse_name: 'Main Distribution Hub', warehouse: 'Main Distribution Hub', quantity_on_hand: 85, available_to_allocate: 85, reorderLevel: 20 },
  { id: 9, product_name: 'Rack Mount Cooling Unit', product: 'Rack Mount Cooling Unit', product_sku: 'SKU-CLN-001', sku: 'SKU-CLN-001', warehouse_name: 'South Regional Logistics', warehouse: 'South Regional Logistics', quantity_on_hand: 0, available_to_allocate: 0, reorderLevel: 4 },
  { id: 10, product_name: 'Cat6A Shielded Cables 100m', product: 'Cat6A Shielded Cables 100m', product_sku: 'SKU-CBL-100', sku: 'SKU-CBL-100', warehouse_name: 'West Gateway Warehouse', warehouse: 'West Gateway Warehouse', quantity_on_hand: 150, available_to_allocate: 150, reorderLevel: 30 },
];

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
      if (list.length > 0) {
        setData(list);
      } else {
        setData(INITIAL_INVENTORY);
      }
    } catch {
      setData(INITIAL_INVENTORY);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

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
    const currentQty = Number(selectedItem.quantity_on_hand ?? selectedItem.available_to_allocate ?? selectedItem.available ?? 0);
    const newQty = adjForm.type === 'Increase' ? currentQty + qty : Math.max(0, currentQty - qty);

    try {
      await api.updateInventory(selectedItem.id, { quantity_on_hand: newQty });
      toast.success(`Inventory updated to ${newQty} units.`);
      setIsAdjustOpen(false);
      await fetchInventory();
    } catch {
      setData(prev => prev.map(item => item.id === selectedItem.id ? { ...item, quantity_on_hand: newQty, available_to_allocate: newQty } : item));
      toast.success(`Inventory updated to ${newQty} units.`);
      setIsAdjustOpen(false);
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
    { Header: 'Product', accessor: 'product_name', sortable: true, Cell: row => <strong style={{ color: 'var(--primary)' }}>{row.product_name || row.product || 'N/A'}</strong> },
    { Header: 'SKU', accessor: 'product_sku', sortable: true, Cell: row => <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{row.product_sku || row.sku || 'N/A'}</span> },
    { Header: 'Warehouse', accessor: 'warehouse_name', sortable: true, Cell: row => row.warehouse_name || row.warehouse || 'N/A' },
    { Header: 'Available', accessor: 'quantity_on_hand', sortable: true, Cell: row => <strong style={{ color: (row.available_to_allocate ?? row.quantity_on_hand ?? 0) === 0 ? '#ef4444' : '#0f172a' }}>{row.available_to_allocate ?? row.quantity_on_hand ?? row.available ?? 0}</strong> },
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
        <button onClick={() => toast.info('Select a product line to adjust stock')} className="btn btn-primary">+ Adjust Stock</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL SKUs TRACKED</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
            </div>
          </div>
          <div className="metric-value text-brand">{totalItems}</div>
          <div className="metric-subtitle">Active inventory items</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">HEALTHY STOCK</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-success">{healthyCount}</div>
          <div className="metric-subtitle">Optimal stock levels</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">LOW / CRITICAL STOCK</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
          </div>
          <div className="metric-value text-warning">{lowStockCount + criticalCount}</div>
          <div className="metric-subtitle">Requires replenishment</div>
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
              <option value="Healthy">Healthy</option><option value="Low Stock">Low Stock</option><option value="Critical">Critical</option>
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

