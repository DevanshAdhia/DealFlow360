import React, { useState } from 'react';
import { getWarehouses, saveEntity, deleteEntity, addAuditLog } from '../services/storageService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const emptyForm = { name: '', location: '', manager: '', capacity: '', status: 'Active' };

function Warehouses() {
  const [data, setData] = useState(() => getWarehouses());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => setData(getWarehouses());
  const filtered = data.filter(w => !search || w.name?.toLowerCase().includes(search.toLowerCase()) || w.location?.toLowerCase().includes(search.toLowerCase()));

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Required'; if (!formData.location?.trim()) e.location = 'Required'; return e; };
  const openModal = (item = null) => { setErrors({}); setEditingItem(item); setFormData(item ? { ...item } : { ...emptyForm }); setIsModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const isNew = !editingItem;
      saveEntity('df_warehouses', formData, isNew);
      addAuditLog(null, isNew ? 'Created Warehouse' : 'Updated Warehouse', 'Warehouse', formData.name);
      toast.success(isNew ? 'Warehouse created!' : 'Warehouse updated!');
      setIsModalOpen(false); setLoading(false); refresh();
    }, 400);
  };

  const handleDelete = () => {
    const w = data.find(x => x.id === deleteConfirmId);
    deleteEntity('df_warehouses', deleteConfirmId);
    addAuditLog(null, 'Deleted Warehouse', 'Warehouse', w?.name);
    toast.info('Warehouse deleted.'); setDeleteConfirmId(null); refresh();
  };

  const handleToggle = (w) => {
    const ns = w.status === 'Active' ? 'Inactive' : 'Active';
    saveEntity('df_warehouses', { ...w, status: ns }, false);
    toast.success(`Warehouse ${ns.toLowerCase()}.`); refresh();
  };

  const totalCount = data.length;
  const activeCount = data.filter(w => w.status === 'Active').length;

  const columns = [
    { Header: 'Warehouse', accessor: 'name', sortable: true },
    { Header: 'Location', accessor: 'location', sortable: true },
    { Header: 'Manager', accessor: 'manager', sortable: true },
    { Header: 'Capacity', accessor: 'capacity', sortable: false },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
        <button onClick={() => handleToggle(row)} className="btn-table-action warn">{row.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
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
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">OFFLINE</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </div>
          <div className="metric-value text-warning">{totalCount - activeCount}</div>
          <div className="metric-subtitle">Currently offline</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span>All Warehouses ({filtered.length})</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or location…" className="form-input" style={{ width: '240px', height: '32px' }} />
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No warehouses found."
          emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ Add Warehouse</button>} />
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
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Warehouse" message="Delete this warehouse? All linked inventory may be affected." />
    </div>
  );
}

export default Warehouses;
