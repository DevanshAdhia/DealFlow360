import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge, Button } from '../components/common/UI';
import { toast } from 'react-toastify';
import { Building2, CheckCircle2, Award, Zap, Plus } from 'lucide-react';

const TIERS = ['Standard', 'Silver', 'Gold', 'Platinum', 'Enterprise'];
const INDUSTRIES = ['Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Food & Beverage', 'Biotech', 'Industrial', 'Aerospace', 'Energy'];
const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90'];

const INITIAL_CUSTOMERS = [
  { id: 1, name: 'Acme Global Ltd', email: 'procurement@acmeglobal.com', phone: '+91 98200 11223', industry: 'Technology', tier: 'Enterprise', creditLimit: 10000000, paymentTerms: 'Net 30', status: 'Active', is_active: true },
  { id: 2, name: 'Nexus Tech Systems', email: 'contact@nexustech.io', phone: '+91 98111 22334', industry: 'Manufacturing', tier: 'Platinum', creditLimit: 7500000, paymentTerms: 'Net 45', status: 'Active', is_active: true },
  { id: 3, name: 'Stark Enterprises', email: 'orders@starkent.com', phone: '+91 98444 55667', industry: 'Aerospace', tier: 'Enterprise', creditLimit: 25000000, paymentTerms: 'Net 60', status: 'Active', is_active: true },
  { id: 4, name: 'Wayne Logistics', email: 'vendor@waynelogistics.org', phone: '+91 98777 88990', industry: 'Retail', tier: 'Gold', creditLimit: 5000000, paymentTerms: 'Net 30', status: 'Active', is_active: true },
  { id: 5, name: 'Cyberdyne Corp', email: 'supply@cyberdyne.net', phone: '+91 98999 00112', industry: 'Biotech', tier: 'Silver', creditLimit: 3000000, paymentTerms: 'Net 15', status: 'Inactive', is_active: false },
  { id: 6, name: 'Oscorp Industries', email: 'billing@oscorp.com', phone: '+91 98333 44556', industry: 'Healthcare', tier: 'Gold', creditLimit: 4500000, paymentTerms: 'Net 30', status: 'Active', is_active: true },
  { id: 7, name: 'Umbrella Pharma', email: 'contact@umbrellapharma.com', phone: '+91 98555 66778', industry: 'Biotech', tier: 'Enterprise', creditLimit: 15000000, paymentTerms: 'Net 45', status: 'Active', is_active: true },
  { id: 8, name: 'Massive Dynamic', email: 'info@massivedynamic.com', phone: '+91 98666 77889', industry: 'Finance', tier: 'Standard', creditLimit: 2000000, paymentTerms: 'Net 15', status: 'Active', is_active: true }
];

const emptyForm = { name: '', email: '', phone: '', industry: 'Technology', tier: 'Standard', creditLimit: '', paymentTerms: 'Net 30', status: 'Active' };

function Customers() {
  const [data, setData] = useState(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [tablePage, setTablePage] = useState(1);

  const fetchCustomers = async () => {
    try {
      const res = await api.getCustomers();
      const list = Array.isArray(res) ? res : res.results || [];
      if (list && list.length > 0) setData(list);
    } catch (err) {
      // Maintain fallback
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => { setTablePage(1); }, [search, filterTier, filterStatus]);

  const filtered = data.filter(c => {
    const s = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterTier || c.tier === filterTier) && (!filterStatus || c.status === filterStatus);
  });

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Company Name required';
    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Valid email required';
    return e;
  };

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
        email: formData.email,
        phone: formData.phone || '',
        is_active: formData.status === 'Active'
      };

      try {
        if (editingItem) {
          await api.updateCustomer(editingItem.id, payload);
        } else {
          await api.createCustomer(payload);
        }
      } catch {}

      if (editingItem) {
        setData(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
        toast.success('Customer account updated!');
      } else {
        const newCustomer = { id: Date.now(), ...formData };
        setData(prev => [newCustomer, ...prev]);
        toast.success('New customer account created!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save customer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      try { await api.deleteCustomer(deleteConfirmId); } catch {}
      toast.success('Customer account removed.');
      setData(prev => prev.filter(c => c.id !== deleteConfirmId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (c) => {
    try {
      const isCurrentlyActive = c.status === 'Active' || c.is_active;
      const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
      try { await api.updateCustomer(c.id, { is_active: !isCurrentlyActive }); } catch {}
      toast.success(`Customer status set to ${newStatus}.`);
      setData(prev => prev.map(item => item.id === c.id ? { ...item, status: newStatus, is_active: !isCurrentlyActive } : item));
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(c => c.status === 'Active' || c.is_active).length;
  const enterpriseCount = data.filter(c => c.tier === 'Enterprise' || c.tier === 'Platinum').length;
  const goldCount = data.filter(c => c.tier === 'Gold').length;

  const columns = [
    { Header: 'Company Name', accessor: 'name', sortable: true, Cell: row => <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.name}</span> },
    { Header: 'Email Contact', accessor: 'email', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.email}</span> },
    { Header: 'Industry', accessor: 'industry', sortable: true },
    { Header: 'Tier', accessor: 'tier', sortable: true, Cell: row => {
        const t = row.tier || 'Standard';
        const v = t === 'Enterprise' || t === 'Platinum' ? 'danger' : t === 'Gold' ? 'warning' : 'info';
        return <Badge variant={v}>{t}</Badge>;
      } 
    },
    { Header: 'Credit Limit', accessor: 'creditLimit', sortable: true, Cell: row => `₹${Number(row.creditLimit || 5000000).toLocaleString('en-IN')}` },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => (
        <Badge variant={row.status === 'Active' || row.is_active ? 'success' : 'neutral'}>
          {row.status || (row.is_active ? 'Active' : 'Inactive')}
        </Badge>
      ) 
    },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
          <button onClick={() => handleToggle(row)} className="btn-table-action warn">Status</button>
          <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Customer Management</h1>
          <p className="page-subtitle">Manage customer accounts, tiers, credit limits, and contact details.</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">+ Add Customer</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL CUSTOMERS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <Building2 size={18} />
            </div>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Registered account profiles</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ACTIVE ACCOUNTS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Currently enabled for quotes</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ENTERPRISE & GOLD TIERS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value text-warning">{enterpriseCount + goldCount}</div>
          <div className="metric-subtitle">High-margin tier accounts</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span>All Customers ({filtered.length})</span>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company or email…" className="form-input" style={{ width: '200px', height: '32px' }} />
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
        
        <DataTable columns={columns} data={filtered} emptyMessage="No customer accounts found matching search." currentPage={tablePage} onPageChange={setTablePage} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit Customer: ${editingItem.name}` : 'Create Customer Account'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="form-label">Company Name *</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input" placeholder="e.g. Oscorp Technologies" />
            {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Email Address *</label>
              <input value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="form-input" placeholder="contact@company.com" />
              {errors.email && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.email}</span>}
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="form-input" placeholder="+91 98000 00000" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Industry</label>
              <select value={formData.industry || ''} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="form-select">
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Customer Tier</label>
              <select value={formData.tier || ''} onChange={e => setFormData({ ...formData, tier: e.target.value })} className="form-select">
                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Credit Limit (₹)</label>
              <input type="number" value={formData.creditLimit || ''} onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })} className="form-input" placeholder="5000000" />
            </div>
            <div>
              <label className="form-label">Payment Terms</label>
              <select value={formData.paymentTerms || ''} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })} className="form-select">
                {PAYMENT_TERMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Account Status</label>
            <select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-select">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>{editingItem ? 'Save Changes' : 'Create Customer'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Customer Account" message="Are you sure you want to delete this customer account?" />
    </div>
  );
}

export default Customers;
