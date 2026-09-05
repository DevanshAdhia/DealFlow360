import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal, DataTable, ConfirmDialog } from '../components/common/UI';
import { getCategories, saveEntity, deleteEntity } from '../services/storageService';

function Categories() {
  const [categories, setCategories] = useState(() => getCategories());
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
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

  const executeDelete = () => {
    if (deleteConfirmId) {
      const updated = deleteEntity('df_categories', deleteConfirmId);
      setCategories(updated);
      toast.success('Category deleted');
      setDeleteConfirmId(null);
    }
  };

  const columns = [
    { Header: 'Name', accessor: 'name', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.name}</strong> },
    { Header: 'Description', accessor: 'description', sortable: false, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.description}</span> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => handleOpenModal(row)} style={{ padding: '0.375rem 0.75rem' }}>Edit</Button>
          <Button variant="danger" onClick={() => setDeleteConfirmId(row.id)} style={{ padding: '0.375rem 0.75rem' }}>Delete</Button>
        </div>
      ) 
    }
  ];

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
          <DataTable columns={columns} data={filtered} emptyMessage="No categories found." emptyAction={<Button onClick={() => handleOpenModal()}>+ Create Category</Button>} />
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

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Delete Category"
        message="Are you sure? Ensure no products are currently linked to this category before deleting."
      />
    </div>
  );
}

export default Categories;
