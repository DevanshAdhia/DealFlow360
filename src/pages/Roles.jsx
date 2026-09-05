import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal } from '../components/common/UI';
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Role Management</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Role</Button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id}>
                    <td style={{ fontWeight: 500 }}>{role.name}</td>
                    <td>{role.description}</td>
                    <td><Badge>{role.status}</Badge></td>
                    <td>
                      <Button variant="secondary" onClick={() => handleOpenModal(role)} style={{ padding: '0.25rem 0.5rem' }}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
