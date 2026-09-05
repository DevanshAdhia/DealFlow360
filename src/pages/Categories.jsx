import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal } from '../components/common/UI';
import { getCategories, saveEntity, deleteEntity } from '../services/storageService';

function Categories() {
  const [categories, setCategories] = useState(() => getCategories());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' });

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ ...category });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Name is required');
    
    const isNew = !editingCategory;
    const updated = saveEntity('df_categories', { ...formData, id: isNew ? undefined : editingCategory.id }, isNew);
    setCategories(updated);
    toast.success(`Category ${isNew ? 'created' : 'updated'}`);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this category?')) {
      const updated = deleteEntity('df_categories', id);
      setCategories(updated);
      toast.success('Category deleted');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Category Management</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Category</Button>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>All Categories</span>
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td><td>{c.description}</td><td><Badge>{c.status}</Badge></td>
                    <td>
                      <Button variant="secondary" onClick={() => handleOpenModal(c)} style={{marginRight: '0.5rem', padding: '0.25rem 0.5rem'}}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(c.id)} style={{padding: '0.25rem 0.5rem'}}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit}>
          <Input label="Category Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <Select label="Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} options={['Active', 'Inactive']} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Categories;
