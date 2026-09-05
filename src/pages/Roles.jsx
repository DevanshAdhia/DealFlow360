import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal, DataTable, ConfirmDialog } from '../components/common/UI';
import { getRoles, saveEntity, deleteEntity } from '../services/storageService';

function Roles() {
  const [roles, setRoles] = useState(() => getRoles());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' });

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, description: role.description, status: role.status });
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Role name is required');
      return;
    }
    
    const isNew = !editingRole;
    const entity = { ...formData, id: isNew ? undefined : editingRole.id };
    const updated = saveEntity('df_roles', entity, isNew);
    setRoles(updated);
    toast.success(`Role ${isNew ? 'created' : 'updated'} successfully`);
    handleCloseModal();
  };

  const columns = [
    { Header: 'Role Name', accessor: 'name', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.name}</strong> },
    { Header: 'Description', accessor: 'description', sortable: false, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.description}</span> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
      <Button variant="secondary" onClick={() => handleOpenModal(row)} style={{ padding: '0.375rem 0.75rem' }}>Edit Permissions</Button>
    )}
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Role Management</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Role</Button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable 
            columns={columns} 
            data={roles} 
            emptyMessage="No roles defined." 
            emptyAction={<Button onClick={() => handleOpenModal()}>+ Create First Role</Button>} 
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingRole ? 'Edit Role' : 'Create Role'}>
        <form onSubmit={handleSubmit}>
          <Input label="Role Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <Select 
            label="Status" 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
            options={['Active', 'Inactive']}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Save Role</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Roles;
