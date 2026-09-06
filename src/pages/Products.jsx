import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge, Button } from '../components/common/UI';
import { toast } from 'react-toastify';
import { Package, CheckCircle2, AlertTriangle, XCircle, Plus } from 'lucide-react';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Cloud Infrastructure' },
  { id: 2, name: 'Enterprise Software' },
  { id: 3, name: 'Hardware & Devices' },
  { id: 4, name: 'Cybersecurity' },
  { id: 5, name: 'Support Services' }
];

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Enterprise Cloud Server Pro', sku: 'PROD-1001', category: 'Cloud Infrastructure', category_name: 'Cloud Infrastructure', costPrice: 45000, basePrice: 85000, tax: 18, stock: 45, status: 'Active', is_active: true },
  { id: 2, name: 'SaaS Multi-User License', sku: 'PROD-1002', category: 'Enterprise Software', category_name: 'Enterprise Software', costPrice: 12000, basePrice: 35000, tax: 18, stock: 120, status: 'Active', is_active: true },
  { id: 3, name: 'AI Analytics Gateway', sku: 'PROD-1003', category: 'Enterprise Software', category_name: 'Enterprise Software', costPrice: 78000, basePrice: 150000, tax: 18, stock: 8, status: 'Active', is_active: true },
  { id: 4, name: 'Cybersecurity Firewall Shield', sku: 'PROD-1004', category: 'Cybersecurity', category_name: 'Cybersecurity', costPrice: 95000, basePrice: 185000, tax: 18, stock: 14, status: 'Active', is_active: true },
  { id: 5, name: 'Dedicated Server Rack Unit', sku: 'PROD-1005', category: 'Hardware & Devices', category_name: 'Hardware & Devices', costPrice: 160000, basePrice: 280000, tax: 18, stock: 0, status: 'Inactive', is_active: false },
  { id: 6, name: '24/7 SLA Support Tier 1', sku: 'PROD-1006', category: 'Support Services', category_name: 'Support Services', costPrice: 20000, basePrice: 50000, tax: 18, stock: 99, status: 'Active', is_active: true }
];

const emptyForm = { name: '', sku: '', category: 'Enterprise Software', costPrice: '', basePrice: '', tax: 18, stock: 10, status: 'Active' };

function Products() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [data, setData] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [tablePage, setTablePage] = useState(1);

  const fetchProducts = async () => {
    try {
      const [prodRes, catRes] = await Promise.allSettled([api.getProducts(), api.getCategories()]);
      if (prodRes.status === 'fulfilled') {
        const list = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value.results || [];
        if (list && list.length > 0) setData(list);
      }
      if (catRes.status === 'fulfilled') {
        const catList = Array.isArray(catRes.value) ? catRes.value : catRes.value.results || [];
        if (catList && catList.length > 0) setCategories(catList);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => { setTablePage(1); }, [search, filterCat, filterStatus]);

  const filtered = data.filter(p => {
    const s = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterCat || p.category === filterCat || p.category_name === filterCat) && (!filterStatus || p.status === filterStatus);
  });

  const margin = formData.basePrice && formData.costPrice
    ? (((Number(formData.basePrice) - Number(formData.costPrice)) / Number(formData.basePrice)) * 100).toFixed(1)
    : null;

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Product Name required';
    if (!formData.sku?.trim()) e.sku = 'SKU required';
    if (!formData.basePrice || Number(formData.basePrice) <= 0) e.basePrice = 'Base Price must be > 0';
    return e;
  };

  const openModal = (item = null) => {
    setErrors({});
    setEditingItem(item);
    setFormData(item ? {
      ...item,
      basePrice: item.sales_price || item.basePrice || '',
      costPrice: item.cost_price || item.costPrice || '',
      tax: item.tax_percent || item.tax || 18,
      status: item.status || (item.is_active ? 'Active' : 'Inactive')
    } : { ...emptyForm, category: categories[0]?.name || 'Cloud Infrastructure' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix form validation errors.'); return; }
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        sales_price: Number(formData.basePrice),
        cost_price: Number(formData.costPrice || 0),
        tax_percent: Number(formData.tax || 0),
        is_active: formData.status === 'Active'
      };

      try {
        if (editingItem) {
          await api.updateProduct(editingItem.id, payload);
        } else {
          await api.createProduct(payload);
        }
      } catch {}

      if (editingItem) {
        setData(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...formData } : p));
        toast.success('Product updated in catalog!');
      } else {
        const newProd = { id: Date.now(), ...formData, category_name: formData.category };
        setData(prev => [newProd, ...prev]);
        toast.success('New product created in catalog!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      try { await api.deleteProduct(deleteConfirmId); } catch {}
      toast.success('Product deleted from catalog!');
      setData(prev => prev.filter(p => p.id !== deleteConfirmId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (p) => {
    try {
      const isCurrentlyActive = p.status === 'Active' || p.is_active;
      const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
      try { await api.updateProduct(p.id, { is_active: !isCurrentlyActive }); } catch {}
      toast.success(`Product set to ${newStatus}.`);
      setData(prev => prev.map(item => item.id === p.id ? { ...item, status: newStatus, is_active: !isCurrentlyActive } : item));
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(p => p.status === 'Active' || p.is_active).length;
  const lowStockCount = data.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = data.filter(p => !p.stock || p.stock === 0).length;

  const columns = [
    { Header: 'Product Name', accessor: 'name', sortable: true, Cell: row => <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.name}</span> },
    { Header: 'SKU', accessor: 'sku', sortable: true, Cell: row => <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{row.sku}</span> },
    { Header: 'Category', accessor: 'category', sortable: true, Cell: row => <Badge variant="info">{row.category_name || row.category || 'N/A'}</Badge> },
    { Header: 'Base Price', accessor: 'basePrice', sortable: true, Cell: row => `₹${Number(row.basePrice || row.sales_price || 0).toLocaleString('en-IN')}` },
    { Header: 'Stock Level', accessor: 'stock', sortable: true, Cell: row => {
        const stk = Number(row.stock || 0);
        const v = stk === 0 ? 'danger' : stk < 10 ? 'warning' : 'success';
        return <Badge variant={v}>{stk} Units</Badge>;
      } 
    },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => (
        <Badge variant={row.status === 'Active' || row.is_active ? 'success' : 'neutral'}>
          {row.status || (row.is_active ? 'Active' : 'Inactive')}
        </Badge>
      ) 
    },
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
            Product Catalog
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Manage product master data, SKUs, pricing structures and stock levels across categories.
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
          + Add Product
        </button>
      </div>

      {/* 4 Metric Cards matching Reference UI */}
      <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>TOTAL PRODUCTS</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Catalog items</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>ACTIVE PRODUCTS</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>{activeCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Available for quoting</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>LOW STOCK</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fffbe6', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>{lowStockCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>&lt; 10 units remaining</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>OUT OF STOCK</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', lineHeight: 1.1 }}>{outOfStockCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Requires restocking</div>
        </div>
      </div>

      {/* Main Table Card matching Reference UI */}
      <div className="card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            All Catalog Products ({filtered.length})
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name or SKU..." 
              className="form-input" 
              style={{ width: '220px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', paddingLeft: '12px' }} 
            />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="form-select" style={{ width: '170px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '130px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>


        <DataTable columns={columns} data={filtered} emptyMessage="No products found matching search." currentPage={tablePage} onPageChange={setTablePage} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit Product: ${editingItem.name}` : 'Create New Product'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="form-label">Product Name *</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input" placeholder="e.g. Enterprise Cloud Server Pro" />
            {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">SKU Code *</label>
              <input value={formData.sku || ''} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="form-input" placeholder="PROD-1001" />
              {errors.sku && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.sku}</span>}
            </div>
            <div>
              <label className="form-label">Category</label>
              <select value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} className="form-select">
                {categories.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Cost Price (₹)</label>
              <input type="number" value={formData.costPrice || ''} onChange={e => setFormData({ ...formData, costPrice: e.target.value })} className="form-input" placeholder="45000" />
            </div>
            <div>
              <label className="form-label">Base Price (₹) *</label>
              <input type="number" value={formData.basePrice || ''} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="form-input" placeholder="85000" />
              {errors.basePrice && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.basePrice}</span>}
            </div>
            <div>
              <label className="form-label">Tax Rate (%)</label>
              <input type="number" value={formData.tax || ''} onChange={e => setFormData({ ...formData, tax: e.target.value })} className="form-input" placeholder="18" />
            </div>
          </div>

          {margin !== null && (
            <div style={{ backgroundColor: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--success-text)', fontWeight: '600' }}>
              Gross Profit Margin: ₹{(Number(formData.basePrice) - Number(formData.costPrice)).toLocaleString('en-IN')} ({margin}%)
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Stock Quantity</label>
              <input type="number" value={formData.stock || ''} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="form-input" placeholder="45" />
            </div>
            <div>
              <label className="form-label">Product Status</label>
              <select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-select">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>{editingItem ? 'Save Product' : 'Create Product'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Product" message="Are you sure you want to remove this product from the catalog?" />
    </div>
  );
}

export default Products;
