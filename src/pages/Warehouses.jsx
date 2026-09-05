import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const emptyForm = { name: '', location: '', manager: '', capacity: '', status: 'Active' };

function Warehouses() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchWarehouses = async () => {
    setPageLoading(true);
    try {
      const res = await api.getWarehouses();
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load warehouses from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);
  useEffect(() => { setTablePage(1); }, [search]);
  const filtered = data.filter(w => !search || w.name?.toLowerCase().includes(search.toLowerCase()) || w.location?.toLowerCase().includes(search.toLowerCase()));

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Required'; if (!formData.location?.trim()) e.location = 'Required'; return e; };
  const openModal = (item = null) => { 
    setErrors({}); 
    setEditingItem(item); 
    setFormData(item ? { 
      ...item, 
      status: item.status || (item.is_active ? 'Active' : 'Inactive') 
    } : { ...emptyForm }); 
    setIsModalOpen(true); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        location: formData.location || '',
        manager_name: formData.manager || formData.manager_name || '',
        capacity: Number(formData.capacity || 0),
        is_active: formData.status === 'Active'
      };

      if (editingItem) {
        await api.updateWarehouse(editingItem.id, payload);
      } else {
        await api.createWarehouse(payload);
      }
      toast.success(editingItem ? 'Warehouse updated in database!' : 'Warehouse created in database!');
      setIsModalOpen(false);
      await fetchWarehouses();
    } catch (err) {
      toast.error(err.message || 'Failed to save warehouse in database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteWarehouse(deleteConfirmId);
      toast.success('Warehouse deleted successfully!');
      await fetchWarehouses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete warehouse.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (w) => {
    try {
      const isCurrentlyActive = w.status === 'Active' || w.is_active;
      await api.updateWarehouse(w.id, { is_active: !isCurrentlyActive });
      toast.success(`Warehouse ${!isCurrentlyActive ? 'activated' : 'deactivated'} successfully!`);
      await fetchWarehouses();
    } catch (err) {
      toast.error(err.message || 'Failed to update warehouse status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(w => w.status === 'Active' || w.is_active).length;

  const columns = [
    { Header: 'Warehouse', accessor: 'name', sortable: true },
    { Header: 'Location', accessor: 'location', sortable: true },
    { Header: 'Manager', accessor: 'manager', sortable: true, Cell: row => row.manager || row.manager_name || 'Unassigned' },
    { Header: 'Capacity', accessor: 'capacity', sortable: false, Cell: row => row.capacity || 'N/A' },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status || (row.is_active ? 'Active' : 'Inactive')}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
        <button onClick={() => handleToggle(row)} className="btn-table-action warn">Toggle</button>
        <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
      </div>
    }
  ];

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Warehouse Management</h1>
          <p className="page-subtitle">Configure and manage all fulfillment warehouse locations and operations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Warehouse</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL WAREHOUSES</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Fulfillment centers</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">ACTIVE WAREHOUSES</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Operational locations</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span>All Warehouses ({filtered.length})</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or location…" className="form-input" style={{ width: '240px', height: '32px' }} />
        </div>
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading warehouses from backend…</div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No warehouses found."
            emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ Add Warehouse</button>} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Warehouse' : 'Add Warehouse'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={lbl}>Warehouse Name *</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} />{errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.name}</p>}</div>
          <div><label style={lbl}>Location *</label><input value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} style={{ ...inp, borderColor: errors.location ? '#ef4444' : '#d1d5db' }} />{errors.location && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.location}</p>}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Manager</label><input value={formData.manager || ''} onChange={e => setFormData({ ...formData, manager: e.target.value })} style={inp} /></div>
            <div><label style={lbl}>Capacity</label><input value={formData.capacity || ''} onChange={e => setFormData({ ...formData, capacity: e.target.value })} placeholder="e.g. 50,000 sqft" style={inp} /></div>
          </div>
          <div><label style={lbl}>Status</label><select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : editingItem ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Warehouse" message="Delete this warehouse?" />
    </div>
  );
}

export default Warehouses;
