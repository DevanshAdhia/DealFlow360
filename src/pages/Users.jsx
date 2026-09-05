import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, DataTable, ConfirmDialog } from '../components/common/UI';
import { getUsers, saveEntity, deleteEntity } from '../services/storageService';

function Users() {
  const [users, setUsers] = useState(() => getUsers());
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    setUserToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    const updated = deleteEntity('df_users', userToDelete);
    setUsers(updated);
    toast.success("User deleted successfully.");
    setShowConfirm(false);
  };

  const columns = [
    { Header: 'Name', accessor: 'name', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.name}</strong> },
    { Header: 'Email', accessor: 'email', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.email}</span> },
    { Header: 'Role', accessor: 'role', sortable: true },
    { Header: 'Department', accessor: 'department', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge type={row.status === 'Active' ? 'success' : row.status === 'Inactive' ? 'default' : 'danger'}>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" style={{ padding: '0.375rem 0.75rem' }}>Edit</Button>
          <Button variant="danger" style={{ padding: '0.375rem 0.75rem' }} onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">User Administration</h1>
          <p className="page-subtitle">Manage system access, roles, and departmental assignments across the organization.</p>
        </div>
        <Button className="btn-primary">+ Add New User</Button>
      </div>

      <div className="metric-grid">
        <div className="metric-card active">
          <div className="metric-header">
            <span className="metric-title">TOTAL USERS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div className="metric-value text-brand">{users.length}</div>
          <div className="metric-subtitle">Active accounts across system</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ACTIVE</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{users.filter(u=>u.status==='Active').length}</div>
          <div className="metric-subtitle">Currently logged in: 12</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">SUSPENDED</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div className="metric-value text-danger">{users.filter(u=>u.status==='Suspended').length}</div>
          <div className="metric-subtitle">Requires administrator review</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">SYSTEM ADMINS</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4V6a2 2 0 012-2h2a2 2 0 012 2v2l4 4" /></svg>
          </div>
          <div className="metric-value text-warning">{users.filter(u=>u.role==='Admin').length}</div>
          <div className="metric-subtitle">Full access granted</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <svg className="filter-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            className="filter-search-input"
            placeholder="Search by Name, Email, or Role..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select className="filter-select">
          <option>Role: All Roles</option>
        </select>
        
        <select className="filter-select">
          <option>Status: All</option>
        </select>
        
        <select className="filter-select">
          <option>Department: All</option>
        </select>

        <div className="view-toggles">
          <button className="view-toggle-btn active">
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
          <button className="view-toggle-btn">
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <div className="empty-state" style={{ minHeight: '250px', border: 'none', backgroundColor: 'transparent' }}>
            <div className="empty-state-icon-container">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="empty-state-title">No Users Found</h3>
            <p className="empty-state-desc">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you absolutely sure you want to delete this user? This action cannot be undone and will remove all their access privileges."
      />
    </div>
  );
}

export default Users;
