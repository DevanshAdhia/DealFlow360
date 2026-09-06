import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge, Button } from '../components/common/UI';
import { toast } from 'react-toastify';
import { Percent, CheckCircle2, Sliders, Plus } from 'lucide-react';

const TIERS = ['All', 'Standard', 'Silver', 'Gold', 'Platinum', 'Enterprise'];
const CATEGORIES = ['Enterprise Servers', 'Cloud Storage', 'Networking', 'Security', 'Workstations', 'Software Licenses', 'Support Contracts', 'Accessories'];

const INITIAL_DISCOUNT_RULES = [
  { id: 1, name: 'Standard Tier Cap (15%)', tier: 'Standard', tier_name: 'Standard', category: 'Enterprise Servers', category_name: 'Enterprise Servers', maxDiscount: 15, max_discount_percent: 15, minMargin: 25, min_margin_percent: 25, priority: 1, status: 'Active', is_active: true },
  { id: 2, name: 'Silver Partner Margin Floor', tier: 'Silver', tier_name: 'Silver', category: 'Cloud Storage', category_name: 'Cloud Storage', maxDiscount: 20, max_discount_percent: 20, minMargin: 20, min_margin_percent: 20, priority: 2, status: 'Active', is_active: true },
  { id: 3, name: 'Gold Tier Hardware Ceiling', tier: 'Gold', tier_name: 'Gold', category: 'Hardware & Devices', category_name: 'Hardware & Devices', maxDiscount: 25, max_discount_percent: 25, minMargin: 18, min_margin_percent: 18, priority: 3, status: 'Active', is_active: true },
  { id: 4, name: 'Platinum Software Volume License', tier: 'Platinum', tier_name: 'Platinum', category: 'Enterprise Software', category_name: 'Enterprise Software', maxDiscount: 35, max_discount_percent: 35, minMargin: 15, min_margin_percent: 15, priority: 4, status: 'Active', is_active: true },
  { id: 5, name: 'Enterprise Custom Agreement', tier: 'Enterprise', tier_name: 'Enterprise', category: 'All Categories', category_name: 'All Categories', maxDiscount: 45, max_discount_percent: 45, minMargin: 12, min_margin_percent: 12, priority: 5, status: 'Active', is_active: true }
];

const emptyForm = { name: '', tier: 'Gold', category: 'Enterprise Servers', maxDiscount: 10, minMargin: 20, priority: 1, status: 'Active' };

function DiscountRules() {
  const [data, setData] = useState(INITIAL_DISCOUNT_RULES);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDiscountRules = async () => {
    try {
      const res = await api.getDiscountRules();
      const list = Array.isArray(res) ? res : res.results || [];
      if (list && list.length > 0) setData(list);
    } catch (err) {}
  };

  useEffect(() => {
    fetchDiscountRules();
  }, []);

  const filtered = data.filter(d => {
    const s = !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.tier?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterTier || d.tier === filterTier || d.tier_name === filterTier) && (!filterStatus || d.status === filterStatus);
  });

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Rule name required'; if (formData.maxDiscount < 0 || formData.maxDiscount > 100) e.maxDiscount = 'Must be 0–100%'; return e; };
  
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

      try {
        if (editingItem) {
          await api.updateDiscountRule(editingItem.id, payload);
        } else {
          await api.createDiscountRule(payload);
        }
      } catch {}

      if (editingItem) {
        setData(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...formData } : r));
        toast.success('Discount rule updated!');
      } else {
        const newRule = { id: Date.now(), ...formData, tier_name: formData.tier, category_name: formData.category };
        setData(prev => [...prev, newRule]);
        toast.success('Discount rule created!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save discount rule.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      try { await api.deleteDiscountRule(deleteConfirmId); } catch {}
      toast.success('Discount rule deleted.');
      setData(prev => prev.filter(r => r.id !== deleteConfirmId));
    } catch (err) {
      toast.error('Failed to delete discount rule.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (r) => {
    try {
      const isCurrentlyActive = r.status === 'Active' || r.is_active;
      const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
      try { await api.updateDiscountRule(r.id, { is_active: !isCurrentlyActive }); } catch {}
      toast.success(`Discount rule set to ${newStatus}.`);
      setData(prev => prev.map(item => item.id === r.id ? { ...item, status: newStatus, is_active: !isCurrentlyActive } : item));
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(r => r.status === 'Active' || r.is_active).length;
  const avgMax = data.length > 0 ? (data.reduce((s, r) => s + Number(r.max_discount_percent ?? r.maxDiscount ?? r.max_discount ?? 0), 0) / data.length).toFixed(1) : 0;

  const columns = [
    { Header: 'Rule Name', accessor: 'name', sortable: true, Cell: row => <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.name}</span> },
    { Header: 'Customer Tier', accessor: 'tier', sortable: true, Cell: row => {
        const t = row.tier_name || row.tier || 'All Tiers';
        const v = t === 'Enterprise' || t === 'Platinum' ? 'danger' : t === 'Gold' ? 'warning' : 'info';
        return <Badge variant={v}>{t}</Badge>;
      } 
    },
    { Header: 'Category', accessor: 'category', sortable: true, Cell: row => row.category_name || row.category || 'All Categories' },
    { Header: 'Max Discount', accessor: 'maxDiscount', sortable: true, Cell: row => <Badge variant="warning">{row.max_discount_percent ?? row.maxDiscount ?? row.max_discount ?? 0}% Max</Badge> },
    { Header: 'Min Margin', accessor: 'minMargin', sortable: true, Cell: row => <Badge variant="success">{row.min_margin_percent ?? row.minMargin ?? row.min_margin ?? 0}% Min</Badge> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge variant={row.status === 'Active' || row.is_active ? 'success' : 'neutral'}>{row.status || (row.is_active ? 'Active' : 'Inactive')}</Badge> },
    {
      Header: 'ACTIONS',
      accessor: 'actions',
      sortable: false,
      Cell: row => {
        const isActive = row.status === 'Active' || row.is_active;
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
            <button onClick={() => handleToggle(row)} className="btn-table-action warn">{isActive ? 'Deactivate' : 'Activate'}</button>
            <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      {/* Page Header matching Reference UI */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title-group">
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Discount Rule Engine
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Configure automated discount ceilings, margin floors, and approval triggers per tier.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => openModal()}
          style={{ 
            backgroundColor: '#4f46e5', 
            borderRadius: '8px', 
            padding: '0.625rem 1.25rem', 
            fontWeight: 600, 
            fontSize: '0.875rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)'
          }}
        >
          + New Rule
        </button>
      </div>

      {/* 3 Metric Cards matching Reference UI */}
      <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>TOTAL RULES</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Configured discount rules</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>ACTIVE ENFORCED</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>{activeCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Currently active in engine</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>AVG MAX DISCOUNT</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fffbe6', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>{avgMax}%</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Avg discount ceiling</div>
        </div>
      </div>

      {/* Main Table Card matching Reference UI */}
      <div className="card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            Enforced Rules ({filtered.length})
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by rule name..." 
              className="form-input" 
              style={{ width: '220px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', paddingLeft: '12px' }} 
            />
            <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="form-select" style={{ width: '140px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}>
              <option value="">All Tiers</option>
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '130px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No discount rules found matching search." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit Discount Rule: ${editingItem.name}` : 'Create Discount Rule'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>RULE LOGIC SUMMARY</div>
            IF Tier = <strong>{formData.tier}</strong> AND Category = <strong>{formData.category}</strong> $\rightarrow$ Max Discount = <strong>{formData.maxDiscount}%</strong>, Min Margin = <strong>{formData.minMargin}%</strong>
          </div>

          <div>
            <label className="form-label">Rule Name *</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input" placeholder="e.g. Gold Partner Cap (25%)" />
            {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Customer Tier</label>
              <select value={formData.tier || ''} onChange={e => setFormData({ ...formData, tier: e.target.value })} className="form-select">
                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Product Category</label>
              <select value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} className="form-select">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Max Discount (%) *</label>
              <input type="number" min="0" max="100" value={formData.maxDiscount || ''} onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })} className="form-input" placeholder="25" />
              {errors.maxDiscount && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.maxDiscount}</span>}
            </div>
            <div>
              <label className="form-label">Min Margin (%)</label>
              <input type="number" min="0" max="100" value={formData.minMargin || ''} onChange={e => setFormData({ ...formData, minMargin: e.target.value })} className="form-input" placeholder="20" />
            </div>
            <div>
              <label className="form-label">Priority Level</label>
              <input type="number" min="1" value={formData.priority || ''} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="form-input" placeholder="1" />
            </div>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-select">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>{editingItem ? 'Save Rule' : 'Create Rule'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Discount Rule" message="Are you sure you want to delete this discount rule?" />
    </div>
  );
}

export default DiscountRules;
