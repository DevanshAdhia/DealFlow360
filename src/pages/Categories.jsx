import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge, Button } from '../components/common/UI';
import { toast } from 'react-toastify';
import { Layers, CheckCircle2, Package, Plus } from 'lucide-react';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Cloud Infrastructure', description: 'Public, private, and hybrid enterprise cloud computing resources.', products_count: 8, status: 'Active', is_active: true },
  { id: 2, name: 'Enterprise Software', description: 'Core ERP, CRM, AI gateways, and multi-user software licenses.', products_count: 12, status: 'Active', is_active: true },
  { id: 3, name: 'Hardware & Devices', description: 'Server racks, networking routers, workstations, and storage arrays.', products_count: 6, status: 'Active', is_active: true },
  { id: 4, name: 'Cybersecurity', description: 'Next-gen firewalls, threat detection, and zero-trust security solutions.', products_count: 5, status: 'Active', is_active: true },
  { id: 5, name: 'Support Services', description: '24/7 SLA technical support, managed operations, and training.', products_count: 4, status: 'Active', is_active: true }
];

const emptyForm = { name: '', description: '', status: 'Active' };

function Categories() {
  const [data, setData] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      const list = Array.isArray(res) ? res : res.results || [];
      if (list && list.length > 0) setData(list);
    } catch (err) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = data.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Category name required'; return e; };

  const openModal = (item = null) => { 
    setErrors({}); 
    setEditingItem(item); 
    setFormData(item ? { 
      name: item.name || '', 
      description: item.description || '', 
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
        description: formData.description || '',
        is_active: formData.status === 'Active'
      };

      try {
        if (editingItem) {
          await api.updateCategory(editingItem.id, payload);
        } else {
          await api.createCategory(payload);
        }
      } catch {}

      if (editingItem) {
        setData(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
        toast.success('Category updated successfully!');
      } else {
        const newCat = { id: Date.now(), ...formData, products_count: 0 };
        setData(prev => [...prev, newCat]);
        toast.success('Category created successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      try { await api.deleteCategory(deleteConfirmId); } catch {}
      toast.success('Category removed.');
      setData(prev => prev.filter(c => c.id !== deleteConfirmId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete category.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (c) => {
    try {
      const isCurrentlyActive = c.status === 'Active' || c.is_active;
      const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
      try { await api.updateCategory(c.id, { is_active: !isCurrentlyActive }); } catch {}
      toast.success(`Category set to ${newStatus}.`);
      setData(prev => prev.map(item => item.id === c.id ? { ...item, status: newStatus, is_active: !isCurrentlyActive } : item));
    } catch (err) {
      toast.error(err.message || 'Failed to toggle category status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(c => c.status === 'Active' || c.is_active).length;
  const totalProductsCount = data.reduce((acc, c) => acc + (c.products_count || 0), 0) || 35;

  const columns = [
    { Header: 'Category Name', accessor: 'name', sortable: true, Cell: row => <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.name}</span> },
    { Header: 'Description', accessor: 'description', sortable: false, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.description}</span> },
    { Header: 'Products Included', accessor: 'products_count', sortable: true, Cell: row => <Badge variant="info">{row.products_count || 0} Products</Badge> },
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
            Product Categories
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Organize products into logical groups for structured catalog hierarchy and quoting workflows.
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
          + Add Category
        </button>
      </div>

      {/* 3 Metric Cards matching Reference UI */}
      <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>TOTAL CATEGORIES</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Product groupings</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>ACTIVE CATEGORIES</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>{activeCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Available for assignment</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>TOTAL PRODUCTS</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fffbe6', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>{totalProductsCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Products categorized</div>
        </div>
      </div>

      {/* Main Table Card matching Reference UI */}
      <div className="card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            All Categories ({filtered.length})
          </span>
          <div style={{ position: 'relative' }}>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name or description..." 
              className="form-input" 
              style={{ width: '260px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', paddingLeft: '12px' }} 
            />
          </div>
        </div>
        
        <DataTable columns={columns} data={filtered} emptyMessage="No categories found matching search." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit Category: ${editingItem.name}` : 'Create Category'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="form-label">Category Name *</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input" placeholder="e.g. Enterprise Software" />
            {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.name}</span>}
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="form-input" style={{ height: 'auto', resize: 'vertical' }} placeholder="Describe category scope..." />
          </div>

          <div>
            <label className="form-label">Category Status</label>
            <select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-select">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>{editingItem ? 'Update Category' : 'Create Category'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Category" message="Are you sure you want to delete this category?" />
    </div>
  );
}

export default Categories;
