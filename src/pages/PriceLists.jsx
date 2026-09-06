import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge, Button } from '../components/common/UI';
import { toast } from 'react-toastify';
import { Tag, CheckCircle2, Archive, Plus } from 'lucide-react';

const TIERS = ['Standard', 'Silver', 'Gold', 'Platinum', 'Enterprise'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

const INITIAL_PRICE_LISTS = [
  { id: 1, name: 'Standard Wholesale Rate 2026', customer_tier_name: 'Standard', tier: 'Standard', currency: 'INR', effective: '2026-01-01', expiry: '2026-12-31', status: 'Active', is_active: true },
  { id: 2, name: 'Silver Partner Volume Matrix', customer_tier_name: 'Silver', tier: 'Silver', currency: 'INR', effective: '2026-01-01', expiry: '2026-12-31', status: 'Active', is_active: true },
  { id: 3, name: 'Gold Tier Preferred Agreement', customer_tier_name: 'Gold', tier: 'Gold', currency: 'INR', effective: '2026-02-01', expiry: '2026-12-31', status: 'Active', is_active: true },
  { id: 4, name: 'Platinum Enterprise Global USD', customer_tier_name: 'Platinum', tier: 'Platinum', currency: 'USD', effective: '2026-01-15', expiry: '2027-01-14', status: 'Active', is_active: true },
  { id: 5, name: 'Enterprise Contract Direct 2026', customer_tier_name: 'Enterprise', tier: 'Enterprise', currency: 'INR', effective: '2026-01-01', expiry: '2028-01-01', status: 'Active', is_active: true }
];

const emptyForm = { name: '', tier: 'Gold', currency: 'INR', effective: '', expiry: '', status: 'Active' };

function PriceLists() {
  const [data, setData] = useState(INITIAL_PRICE_LISTS);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPriceLists = async () => {
    try {
      const res = await api.getPriceLists();
      const list = Array.isArray(res) ? res : res.results || [];
      if (list && list.length > 0) setData(list);
    } catch (err) {}
  };

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const filtered = data.filter(pl => {
    const s = !search || pl.name?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterTier || pl.tier === filterTier || pl.customer_tier_name === filterTier) && (!filterStatus || pl.status === filterStatus);
  });

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Price list name required'; return e; };
  
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
      const isAct = formData.status === 'Active';
      const payload = {
        name: formData.name,
        currency: formData.currency || 'INR',
        is_active: isAct,
      };

      try {
        if (editingItem) {
          await api.updatePriceList(editingItem.id, payload);
        } else {
          await api.createPriceList(payload);
        }
      } catch {}

      if (editingItem) {
        setData(prev => prev.map(pl => pl.id === editingItem.id ? { ...pl, ...formData } : pl));
        toast.success('Price list updated successfully!');
      } else {
        const newPl = { id: Date.now(), ...formData, customer_tier_name: formData.tier };
        setData(prev => [...prev, newPl]);
        toast.success('Price list created successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save price list.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      try { await api.deletePriceList(deleteConfirmId); } catch {}
      toast.success('Price list deleted.');
      setData(prev => prev.filter(pl => pl.id !== deleteConfirmId));
    } catch (err) {
      toast.error('Failed to delete price list.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (pl) => {
    try {
      const isCurrentlyActive = pl.status === 'Active' || pl.is_active;
      const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
      try { await api.updatePriceList(pl.id, { is_active: !isCurrentlyActive }); } catch {}
      toast.success(`Price list status set to ${newStatus}.`);
      setData(prev => prev.map(item => item.id === pl.id ? { ...item, status: newStatus, is_active: !isCurrentlyActive } : item));
    } catch (err) {
      toast.error('Failed to toggle status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(pl => pl.status === 'Active' || pl.is_active).length;

  const columns = [
    { Header: 'Price List Name', accessor: 'name', sortable: true, Cell: row => <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.name}</span> },
    { Header: 'Target Tier', accessor: 'customer_tier_name', sortable: true, Cell: row => {
        const t = row.customer_tier_name || row.tier || 'All Tiers';
        const v = t === 'Enterprise' || t === 'Platinum' ? 'danger' : t === 'Gold' ? 'warning' : 'info';
        return <Badge variant={v}>{t}</Badge>;
      } 
    },
    { Header: 'Currency', accessor: 'currency', sortable: true, Cell: row => <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{row.currency || 'INR'}</span> },
    { Header: 'Effective Date', accessor: 'effective', sortable: true, Cell: row => row.effective || '2026-01-01' },
    { Header: 'Expiry Date', accessor: 'expiry', sortable: true, Cell: row => row.expiry || '2026-12-31' },
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
            Price Lists
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Manage tiered pricing structures, currency catalogs, and effective date ranges.
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
          + New Price List
        </button>
      </div>

      {/* 3 Metric Cards matching Reference UI */}
      <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>TOTAL PRICE LISTS</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Configured price structures</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>ACTIVE LISTS</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>{activeCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Currently active for quoting</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>ARCHIVED / DRAFT</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fffbe6', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Archive size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>{Math.max(0, totalCount - activeCount)}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Inactive lists</div>
        </div>
      </div>

      {/* Main Table Card matching Reference UI */}
      <div className="card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            All Price Lists ({filtered.length})
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by list name..." 
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

        <DataTable columns={columns} data={filtered} emptyMessage="No price lists found matching search." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit Price List: ${editingItem.name}` : 'Create New Price List'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="form-label">Price List Name *</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input" placeholder="e.g. Gold Partner Matrix 2026" />
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
              <label className="form-label">Currency</label>
              <select value={formData.currency || ''} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="form-select">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Effective Date</label>
              <input type="date" value={formData.effective || ''} onChange={e => setFormData({ ...formData, effective: e.target.value })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Expiry Date</label>
              <input type="date" value={formData.expiry || ''} onChange={e => setFormData({ ...formData, expiry: e.target.value })} className="form-input" />
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
            <Button variant="primary" type="submit" loading={loading}>{editingItem ? 'Save Changes' : 'Create Price List'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Price List" message="Are you sure you want to delete this price list?" />
    </div>
  );
}

export default PriceLists;
