import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const emptyForm = { name: '', sku: '', category: '', costPrice: '', basePrice: '', tax: 18, stock: 0, status: 'Active' };

function Products() {
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchProducts = async () => {
    setPageLoading(true);
    try {
      const [prodRes, catRes] = await Promise.allSettled([api.getProducts(), api.getCategories()]);
      if (prodRes.status === 'fulfilled') {
        const list = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value.results || [];
        setData(list);
      } else {
        toast.error(prodRes.reason?.message || 'Failed to load products from backend.');
        setData([]);
      }
      if (catRes.status === 'fulfilled') {
        const catList = Array.isArray(catRes.value) ? catRes.value : catRes.value.results || [];
        setCategories(catList);
      }
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => { setTablePage(1); }, [search, filterCategory, filterStatus]);
  const filtered = data.filter(p => {
    const s = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterCat || p.category === filterCat || p.category_name === filterCat) && (!filterStatus || p.status === filterStatus);
  });

  const margin = formData.basePrice && formData.costPrice
    ? (((Number(formData.basePrice) - Number(formData.costPrice)) / Number(formData.basePrice)) * 100).toFixed(1)
    : null;

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Required';
    if (!formData.sku?.trim()) e.sku = 'Required';
    if (!formData.basePrice || Number(formData.basePrice) <= 0) e.basePrice = 'Must be > 0';
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
    } : { ...emptyForm, category: categories[0]?.id || categories[0]?.name || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix validation errors.'); return; }
    
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
      if (formData.category && typeof formData.category === 'number') {
        payload.category = formData.category;
      }

      if (editingItem) {
        await api.updateProduct(editingItem.id, payload);
      } else {
        await api.createProduct(payload);
      }
      toast.success(editingItem ? 'Product updated successfully!' : 'Product created successfully!');
      setIsModalOpen(false);
      await fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteProduct(deleteConfirmId);
      toast.success('Product deleted successfully!');
      await fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (p) => {
    try {
      const isCurrentlyActive = p.status === 'Active' || p.is_active;
      await api.updateProduct(p.id, { is_active: !isCurrentlyActive });
      toast.success(`Product ${!isCurrentlyActive ? 'activated' : 'deactivated'} successfully!`);
      await fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to update product status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(p => p.status === 'Active' || p.is_active).length;
  const lowStockCount = data.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = data.filter(p => !p.stock || p.stock === 0).length;

  const columns = [
    { Header: 'Product Name', accessor: 'name', sortable: true },
    { Header: 'SKU', accessor: 'sku', sortable: true },
    { Header: 'Category', accessor: 'category', sortable: true, Cell: row => row.category_name || row.category || 'N/A' },
    { Header: 'Base Price', accessor: 'basePrice', sortable: true, Cell: row => `₹${Number(row.basePrice || row.base_price || 0).toLocaleString('en-IN')}` },
    { Header: 'Stock', accessor: 'stock', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status || (row.is_active ? 'Active' : 'Inactive')}</Badge> },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
          <button onClick={() => handleToggle(row)} className="btn-table-action warn">Toggle</button>
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
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Manage product master data, SKUs, pricing structures and stock levels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Product</button>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL PRODUCTS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">In catalog</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">ACTIVE PRODUCTS</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Available for quoting</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">LOW STOCK</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="metric-value text-warning">{lowStockCount}</div>
          <div className="metric-subtitle">&lt; 10 units remaining</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">OUT OF STOCK</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <div className="metric-value text-danger">{outOfStockCount}</div>
          <div className="metric-subtitle">Require restocking</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>All Products ({filtered.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or SKU…" className="form-input" style={{ width: '180px', height: '32px' }} />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="form-select" style={{ width: '150px', height: '32px' }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '130px', height: '32px' }}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading products from backend…</div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No products found."
            emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ Add Product</button>} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Product' : 'Create Product'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={lbl}>Product Name *</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} />{errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.name}</p>}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>SKU *</label><input value={formData.sku || ''} onChange={e => setFormData({ ...formData, sku: e.target.value })} style={{ ...inp, borderColor: errors.sku ? '#ef4444' : '#d1d5db' }} />{errors.sku && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.sku}</p>}</div>
            <div><label style={lbl}>Category</label><select value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inp}>{categories.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Cost Price (₹)</label><input type="number" value={formData.costPrice || ''} onChange={e => setFormData({ ...formData, costPrice: e.target.value })} style={inp} /></div>
            <div><label style={lbl}>Base Price (₹) *</label><input type="number" value={formData.basePrice || ''} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} style={{ ...inp, borderColor: errors.basePrice ? '#ef4444' : '#d1d5db' }} />{errors.basePrice && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.basePrice}</p>}</div>
            <div><label style={lbl}>Tax (%)</label><input type="number" value={formData.tax || ''} onChange={e => setFormData({ ...formData, tax: e.target.value })} style={inp} /></div>
          </div>
          {margin !== null && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 14px', fontSize: '0.875rem', color: '#15803d', fontWeight: '600' }}>
              Margin: ₹{(Number(formData.basePrice) - Number(formData.costPrice)).toLocaleString('en-IN')} ({margin}%)
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Stock</label><input type="number" value={formData.stock || ''} onChange={e => setFormData({ ...formData, stock: e.target.value })} style={inp} /></div>
            <div><label style={lbl}>Status</label><select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : editingItem ? 'Update Product' : 'Create Product'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Product" message="Delete this product from the catalog?" />
    </div>
  );
}

export default Products;
