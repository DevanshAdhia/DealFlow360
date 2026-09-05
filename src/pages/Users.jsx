import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal } from '../components/common/UI';
import { getUsers, saveEntity, deleteEntity, getRoles } from '../services/storageService';

function Users() {
  const [users, setUsers] = useState(() => getUsers());
  const [roles] = useState(() => getRoles());
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', role: '', department: '', status: 'Active' });
  const [loading, setLoading] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role, department: user.department, status: user.status });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: '', department: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: '', department: '', status: 'Active' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Name, email, and role are required');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      const isNew = !editingUser;
      const entity = {
        ...formData,
        id: isNew ? undefined : editingUser.id,
        created: isNew ? new Date().toISOString().split('T')[0] : editingUser.created
      };
      
      const updatedUsers = saveEntity('df_users', entity, isNew);
      setUsers(updatedUsers);
      toast.success(`User ${isNew ? 'created' : 'updated'} successfully`);
      setLoading(false);
      handleCloseModal();
    }, 500);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updated = deleteEntity('df_users', id);
      setUsers(updated);
      toast.success('User deleted successfully');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <Button onClick={() => handleOpenModal()}>+ Add User</Button>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>All Users</span>
          <Input 
            placeholder="Search users..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ marginBottom: 0, width: '250px' }}
          />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.department}</td>
                    <td><Badge type="default">{user.status}</Badge></td>
                    <td>{user.created}</td>
                    <td>
                      <Button variant="secondary" onClick={() => handleOpenModal(user)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(user.id)} style={{ padding: '0.25rem 0.5rem' }}>Delete</Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingUser ? 'Edit User' : 'Create User'}
      >
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <Select 
            label="Role" 
            value={formData.role} 
            onChange={e => setFormData({...formData, role: e.target.value})}
            options={['', ...roles.map(r => r.name)]}
            required
          />
          <Input label="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
          <Select 
            label="Status" 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
            options={['Active', 'Inactive', 'Suspended']}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save User'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Users;
