import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const emptyForm = { name: '', description: '', status: 'Active' };

function Categories() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchCategories = async () => {
    setPageLoading(true);
    try {
      const res = await api.getCategories();
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load categories from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => { setTablePage(1); }, [search, filterStatus]);
  const filtered = data.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Required'; return e; };

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
      if (editingItem) {
        await api.updateCategory(editingItem.id, payload);
      } else {
        await api.createCategory(payload);
      }
      toast.success(editingItem ? 'Category updated!' : 'Category created!');
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteCategory(deleteConfirmId);
      toast.success('Category deleted successfully!');
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (c) => {
    try {
      const isCurrentlyActive = c.status === 'Active' || c.is_active;
      await api.updateCategory(c.id, { is_active: !isCurrentlyActive });
      toast.success(`Category ${!isCurrentlyActive ? 'activated' : 'deactivated'} successfully!`);
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle category status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(c => c.status === 'Active' || c.is_active).length;

  const columns = [
    { Header: 'Category Name', accessor: 'name', sortable: true },
    { Header: 'Description', accessor: 'description', sortable: false },
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
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span>All Categories ({filtered.length})</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="form-input" style={{ width: '200px', height: '32px' }} />
        </div>
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading categories from backend…</div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No categories found."
            emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ Add Category</button>} />
        )}
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
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Category" message="Delete this category?" />
    </div>
  );
}

export default Categories;
