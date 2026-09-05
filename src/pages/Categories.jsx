import React, { useState } from 'react';
import { getCategories, getProducts, saveEntity, deleteEntity, addAuditLog } from '../services/storageService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const emptyForm = { name: '', description: '', status: 'Active' };

function Categories() {
  const [data, setData] = useState(() => getCategories());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => setData(getCategories());
  const filtered = data.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Required'; return e; };

  const openModal = (item = null) => { setErrors({}); setEditingItem(item); setFormData(item ? { ...item } : { ...emptyForm }); setIsModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const isNew = !editingItem;
      saveEntity('df_categories', formData, isNew);
      addAuditLog(null, isNew ? 'Created Category' : 'Updated Category', 'Category', `${formData.name}`);
      toast.success(isNew ? 'Category created!' : 'Category updated!');
      setIsModalOpen(false); setLoading(false); refresh();
    }, 400);
  };

  const handleDelete = () => {
    const cat = data.find(x => x.id === deleteConfirmId);
    const products = getProducts();
    if (products.some(p => p.category === cat?.name)) {
      toast.error(`Cannot delete "${cat?.name}" — products are assigned to it.`);
      setDeleteConfirmId(null); return;
    }
    deleteEntity('df_categories', deleteConfirmId);
    addAuditLog(null, 'Deleted Category', 'Category', `Deleted: ${cat?.name}`);
    toast.info('Category deleted.'); setDeleteConfirmId(null); refresh();
  };

  const handleToggle = (c) => {
    const ns = c.status === 'Active' ? 'Inactive' : 'Active';
    saveEntity('df_categories', { ...c, status: ns }, false);
    toast.success(`Category ${ns.toLowerCase()}.`); refresh();
  };

  const totalCount = data.length;
  const activeCount = data.filter(c => c.status === 'Active').length;
  const productCount = getProducts().length;

  const columns = [
    { Header: 'Category Name', accessor: 'name', sortable: true },
    { Header: 'Description', accessor: 'description', sortable: false },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge onChange={s => { saveEntity('df_categories', { ...row, status: s }, false); toast.success(`Category status updated to ${s}`); refresh(); }}>{row.status}</Badge> },
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
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize products into logical groups for structured pricing and quoting workflows.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Category</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL CATEGORIES</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Product groupings</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">ACTIVE CATEGORIES</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Available for assignment</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL PRODUCTS</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div className="metric-value text-warning">{productCount}</div>
          <div className="metric-subtitle">Across all categories</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span>All Categories ({filtered.length})</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="form-input" style={{ width: '200px', height: '32px' }} />
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No categories found."
          emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ Add Category</button>} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={lbl}>Category Name *</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} />{errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.name}</p>}</div>
          <div><label style={lbl}>Description</label><textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
          <div><label style={lbl}>Status</label><select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : editingItem ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Category" message="Delete this category? Will fail if products are assigned to it." />
    </div>
  );
}

export default Categories;
