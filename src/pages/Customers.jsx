import React, { useState } from 'react';
import { getCustomers, saveEntity, deleteEntity, addAuditLog } from '../services/storageService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const TIERS = ['Standard', 'Silver', 'Gold', 'Platinum', 'Enterprise'];
const INDUSTRIES = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Food & Beverage', 'Biotech', 'Industrial', 'Aerospace', 'Energy'];
const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90'];
const emptyForm = { name: '', email: '', phone: '', industry: 'Technology', tier: 'Standard', creditLimit: '', paymentTerms: 'Net 30', status: 'Active' };

function Customers() {
  const [data, setData] = useState(() => getCustomers());
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => setData(getCustomers());

  const filtered = data.filter(c => {
    const s = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterTier || c.tier === filterTier) && (!filterStatus || c.status === filterStatus);
  });

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Required';
    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Valid email required';
    return e;
  };

  const openModal = (item = null) => { setErrors({}); setEditingItem(item); setFormData(item ? { ...item } : { ...emptyForm }); setIsModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const isNew = !editingItem;
      saveEntity('df_customers', formData, isNew);
      addAuditLog(null, isNew ? 'Created Customer' : 'Updated Customer', 'Customer', `${isNew ? 'Created' : 'Updated'}: ${formData.name}`);
      toast.success(isNew ? 'Customer created!' : 'Customer updated!');
      setIsModalOpen(false); setLoading(false); refresh();
    }, 400);
  };

  const handleDelete = () => {
    const c = data.find(x => x.id === deleteConfirmId);
    deleteEntity('df_customers', deleteConfirmId);
    addAuditLog(null, 'Deleted Customer', 'Customer', `Deleted: ${c?.name}`);
    toast.info('Customer removed.'); setDeleteConfirmId(null); refresh();
  };

  const handleToggle = (c) => {
    const ns = c.status === 'Active' ? 'Inactive' : 'Active';
    saveEntity('df_customers', { ...c, status: ns }, false);
    toast.success(`Customer ${ns.toLowerCase()}.`); refresh();
  };

  const totalCount = data.length;
  const activeCount = data.filter(c => c.status === 'Active').length;
  const enterpriseCount = data.filter(c => c.tier === 'Enterprise' || c.tier === 'Platinum').length;
  const newThisMonth = data.filter(c => c.tier === 'Gold').length;

  const columns = [
    { Header: 'Company', accessor: 'name', sortable: true },
    { Header: 'Email', accessor: 'email', sortable: true },
    { Header: 'Industry', accessor: 'industry', sortable: true },
    { Header: 'Tier', accessor: 'tier', sortable: true, Cell: row => <Badge>{row.tier}</Badge> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge onChange={s => { saveEntity('df_customers', { ...row, status: s }, false); toast.success(`Customer status updated to ${s}`); refresh(); }}>{row.status}</Badge> },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
          <button onClick={() => handleToggle(row)} className="btn-table-action warn">{row.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
          <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
        </div>
      )
    }
  ];

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Customer Directory</h1>
          <p className="page-subtitle">Manage B2B customer accounts, tiers, credit limits and payment profiles.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL CUSTOMERS</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div className="metric-value text-success">{totalCount}</div>
          <div className="metric-subtitle">Registered accounts</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ACTIVE CUSTOMERS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-brand">{activeCount}</div>
          <div className="metric-subtitle">Currently buying</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ENTERPRISE / PLATINUM</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          </div>
          <div className="metric-value text-warning">{enterpriseCount}</div>
          <div className="metric-subtitle">High-value tier accounts</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">GOLD TIER</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div className="metric-value text-danger">{newThisMonth}</div>
          <div className="metric-subtitle">Gold tier accounts</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>All Customers ({filtered.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="form-input" style={{ width: '180px', height: '32px' }} />
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Tiers</option>
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No customers found." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Customer">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={lbl}>Company Name *</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} />{errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.name}</p>}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Email *</label><input value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ ...inp, borderColor: errors.email ? '#ef4444' : '#d1d5db' }} />{errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.email}</p>}</div>
            <div><label style={lbl}>Phone</label><input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inp} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Industry</label><select value={formData.industry || ''} onChange={e => setFormData({ ...formData, industry: e.target.value })} style={inp}>{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
            <div><label style={lbl}>Customer Tier</label><select value={formData.tier || ''} onChange={e => setFormData({ ...formData, tier: e.target.value })} style={inp}>{TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Credit Limit (₹)</label><input type="number" value={formData.creditLimit || ''} onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })} style={inp} /></div>
            <div><label style={lbl}>Payment Terms</label><select value={formData.paymentTerms || ''} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })} style={inp}>{PAYMENT_TERMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
          <div><label style={lbl}>Status</label><select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : 'Update Customer'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Customer" message="Permanently remove this customer?" />
    </div>
  );
}

export default Customers;
