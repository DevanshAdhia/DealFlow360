import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const TIERS = ['All', 'Standard', 'Silver', 'Gold', 'Platinum', 'Enterprise'];
const CATEGORIES = ['Enterprise Servers', 'Cloud Storage', 'Networking', 'Security', 'Workstations', 'Software Licenses', 'Support Contracts', 'Accessories'];
const emptyForm = { name: '', tier: 'Gold', category: 'Enterprise Servers', maxDiscount: 10, minMargin: 20, priority: 1, status: 'Active' };

function DiscountRules() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchDiscountRules = async () => {
    setPageLoading(true);
    try {
      const res = await api.getDiscountRules();
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load discount rules from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountRules();
  }, []);
  useEffect(() => { setTablePage(1); }, [search, filterStatus]);
  const filtered = data.filter(d => {
    const s = !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.tier?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterTier || d.tier === filterTier) && (!filterStatus || d.status === filterStatus);
  });

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Required'; if (formData.maxDiscount < 0 || formData.maxDiscount > 100) e.maxDiscount = '0–100'; return e; };
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
        max_discount: Number(formData.maxDiscount || formData.max_discount || 0),
        is_active: formData.status === 'Active'
      };

      if (editingItem) {
        await api.updateDiscountRule(editingItem.id, payload);
      } else {
        await api.createDiscountRule(payload);
      }
      toast.success(editingItem ? 'Discount rule updated in database!' : 'Discount rule created in database!');
      setIsModalOpen(false);
      await fetchDiscountRules();
    } catch (err) {
      toast.error(err.message || 'Failed to save discount rule in database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteDiscountRule(deleteConfirmId);
      toast.success('Discount rule deleted successfully!');
      await fetchDiscountRules();
    } catch (err) {
      toast.error(err.message || 'Failed to delete discount rule.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (r) => {
    try {
      const isCurrentlyActive = r.status === 'Active' || r.is_active;
      await api.updateDiscountRule(r.id, { is_active: !isCurrentlyActive });
      toast.success(`Discount rule ${!isCurrentlyActive ? 'activated' : 'deactivated'} successfully!`);
      await fetchDiscountRules();
    } catch (err) {
      toast.error(err.message || 'Failed to update rule status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(r => r.status === 'Active' || r.is_active).length;
  const avgMax = data.length > 0 ? (data.reduce((s, r) => s + Number(r.max_discount_percent ?? r.maxDiscount ?? r.max_discount ?? 0), 0) / data.length).toFixed(1) : 0;

  const columns = [
    { Header: 'Rule Name', accessor: 'name', sortable: true, Cell: row => row.name || (row.tier_name ? `${row.tier_name} Rule` : `Rule #${row.id}`) },
    { Header: 'Customer Tier', accessor: 'tier', sortable: true, Cell: row => row.tier_name || row.tier || 'All Tiers' },
    { Header: 'Category', accessor: 'category', sortable: true, Cell: row => row.category_name || row.category || 'All Categories' },
    { Header: 'Max Discount', accessor: 'maxDiscount', sortable: true, Cell: row => `${row.max_discount_percent ?? row.maxDiscount ?? row.max_discount ?? 0}%` },
    { Header: 'Min Margin', accessor: 'minMargin', sortable: true, Cell: row => `${row.min_margin_percent ?? row.minMargin ?? row.min_margin ?? 0}%` },
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
          <h1 className="page-title">Discount Rule Engine</h1>
          <p className="page-subtitle">Configure automated discount ceilings and margin floors per customer tier and category.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ New Rule</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL RULES</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Configured rules</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">ACTIVE RULES</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Currently enforced</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">AVG MAX DISCOUNT</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>
          </div>
          <div className="metric-value text-warning">{avgMax}%</div>
          <div className="metric-subtitle">Avg ceiling across rules</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>Discount Rules ({filtered.length})</span>
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
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading discount rules from backend…</div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No discount rules configured."
            emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ New Rule</button>} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Discount Rule' : 'Create Discount Rule'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', fontSize: '0.875rem', color: '#374151' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', marginBottom: '6px' }}>RULE LOGIC PREVIEW</div>
            IF Tier = <strong>{formData.tier}</strong> AND Category = <strong>{formData.category}</strong> → Max Discount = <strong>{formData.maxDiscount}%</strong>, Min Margin = <strong>{formData.minMargin}%</strong>
          </div>
          <div><label style={lbl}>Rule Name *</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} />{errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.name}</p>}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Customer Tier</label><select value={formData.tier || ''} onChange={e => setFormData({ ...formData, tier: e.target.value })} style={inp}>{TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={lbl}>Product Category</label><select value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inp}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Max Discount (%)</label><input type="number" min="0" max="100" value={formData.maxDiscount || ''} onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })} style={{ ...inp, borderColor: errors.maxDiscount ? '#ef4444' : '#d1d5db' }} />{errors.maxDiscount && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.maxDiscount}</p>}</div>
            <div><label style={lbl}>Min Margin (%)</label><input type="number" min="0" max="100" value={formData.minMargin || ''} onChange={e => setFormData({ ...formData, minMargin: e.target.value })} style={inp} /></div>
            <div><label style={lbl}>Priority</label><input type="number" min="1" value={formData.priority || ''} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={inp} /></div>
          </div>
          <div><label style={lbl}>Status</label><select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : editingItem ? 'Update Rule' : 'Create Rule'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Rule" message="Delete this discount rule?" />
    </div>
  );
}

export default DiscountRules;
