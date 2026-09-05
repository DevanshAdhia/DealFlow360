import React, { useState } from 'react';
import { getPriceLists, saveEntity, deleteEntity, addAuditLog } from '../services/storageService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const TIERS = ['Standard', 'Silver', 'Gold', 'Platinum', 'Enterprise'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
const emptyForm = { name: '', tier: 'Gold', currency: 'INR', effective: '', expiry: '', status: 'Active' };

function PriceLists() {
  const [data, setData] = useState(() => getPriceLists());
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => setData(getPriceLists());
  const filtered = data.filter(pl => {
    const s = !search || pl.name?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterTier || pl.tier === filterTier) && (!filterStatus || pl.status === filterStatus);
  });

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Required'; return e; };
  const openModal = (item = null) => { setErrors({}); setEditingItem(item); setFormData(item ? { ...item } : { ...emptyForm }); setIsModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const isNew = !editingItem;
      saveEntity('df_pricelists', formData, isNew);
      addAuditLog(null, isNew ? 'Created Price List' : 'Updated Price List', 'Price List', `${formData.name}`);
      toast.success(isNew ? 'Price list created!' : 'Price list updated!');
      setIsModalOpen(false); setLoading(false); refresh();
    }, 400);
  };

  const handleDelete = () => {
    const pl = data.find(x => x.id === deleteConfirmId);
    deleteEntity('df_pricelists', deleteConfirmId);
    toast.info('Price list deleted.'); setDeleteConfirmId(null); refresh();
  };

  const handleToggle = (pl) => {
    const ns = pl.status === 'Active' ? 'Inactive' : 'Active';
    saveEntity('df_pricelists', { ...pl, status: ns }, false);
    toast.success(`Price list ${ns.toLowerCase()}.`); refresh();
  };

  const totalCount = data.length;
  const activeCount = data.filter(pl => pl.status === 'Active').length;

  const columns = [
    { Header: 'Name', accessor: 'name', sortable: true },
    { Header: 'Tier', accessor: 'tier', sortable: true },
    { Header: 'Currency', accessor: 'currency', sortable: true },
    { Header: 'Effective', accessor: 'effective', sortable: true },
    { Header: 'Expiry', accessor: 'expiry', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge onChange={s => { saveEntity('df_pricelists', { ...row, status: s }, false); toast.success(`Price list status updated to ${s}`); refresh(); }}>{row.status}</Badge> },
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
          <h1 className="page-title">Price Lists</h1>
          <p className="page-subtitle">Manage tiered pricing structures for different customer segments and currencies.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ New Price List</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL PRICE LISTS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Configured lists</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">ACTIVE LISTS</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Currently in use</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">ARCHIVED</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </div>
          <div className="metric-value text-warning">{totalCount - activeCount}</div>
          <div className="metric-subtitle">Inactive / archived</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>All Price Lists ({filtered.length})</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="form-input" style={{ width: '180px', height: '32px' }} />
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Tiers</option>{TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '130px', height: '32px' }}>
              <option value="">All Statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No price lists found."
          emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ New Price List</button>} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Price List' : 'Create Price List'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={lbl}>Price List Name *</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} />{errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.name}</p>}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Customer Tier</label><select value={formData.tier || ''} onChange={e => setFormData({ ...formData, tier: e.target.value })} style={inp}>{TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={lbl}>Currency</label><select value={formData.currency || ''} onChange={e => setFormData({ ...formData, currency: e.target.value })} style={inp}>{CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Effective Date</label><input type="date" value={formData.effective || ''} onChange={e => setFormData({ ...formData, effective: e.target.value })} style={inp} /></div>
            <div><label style={lbl}>Expiry Date</label><input type="date" value={formData.expiry || ''} onChange={e => setFormData({ ...formData, expiry: e.target.value })} style={inp} /></div>
          </div>
          <div><label style={lbl}>Status</label><select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : editingItem ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Price List" message="Delete this price list?" />
    </div>
  );
}

export default PriceLists;
