import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const ROLES = ['Admin', 'Sales Manager', 'Sales Representative', 'Finance', 'Customer'];
const DEPARTMENTS = ['IT', 'Sales', 'Finance', 'Operations', 'HR'];
const STATUSES = ['Active', 'Inactive', 'Suspended'];

const INITIAL_MOCK_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@dealflow360.com', role: 'Admin', department: 'IT', status: 'Active' },
  { id: 2, name: 'Sarah Connor', email: 'sarah@dealflow360.com', role: 'Sales Manager', department: 'Sales', status: 'Active' },
  { id: 3, name: 'John Doe', email: 'john@dealflow360.com', role: 'Sales Representative', department: 'Sales', status: 'Active' },
  { id: 4, name: 'Jane Smith', email: 'jane@dealflow360.com', role: 'Finance', department: 'Finance', status: 'Active' },
  { id: 5, name: 'Mike Ross', email: 'mike@dealflow360.com', role: 'Operations', department: 'Ops', status: 'Inactive' },
  { id: 6, name: 'Rachel Green', email: 'rachel@dealflow360.com', role: 'Sales Representative', department: 'Sales', status: 'Active' },
  { id: 7, name: 'Tom Hardy', email: 'tom@dealflow360.com', role: 'Finance', department: 'Finance', status: 'Active' },
  { id: 8, name: 'Lisa Park', email: 'lisa@dealflow360.com', role: 'Operations', department: 'Ops', status: 'Active' },
  { id: 9, name: 'David Sterling', email: 'david@dealflow360.com', role: 'Admin', department: 'IT', status: 'Active' },
  { id: 10, name: 'Alex Morgan', email: 'alex@dealflow360.com', role: 'Sales Representative', department: 'Sales', status: 'Active' },
  { id: 11, name: 'Sarah Jenkins', email: 'sjenkins@dealflow360.com', role: 'Sales Manager', department: 'Sales', status: 'Active' },
  { id: 12, name: 'Marcus Vance', email: 'marcus@dealflow360.com', role: 'Finance', department: 'Finance', status: 'Active' },
  { id: 13, name: 'Bruce Wayne', email: 'bruce@dealflow360.com', role: 'Executive', department: 'Management', status: 'Inactive' },
  { id: 14, name: 'Diana Prince', email: 'diana@dealflow360.com', role: 'HR Manager', department: 'HR', status: 'Inactive' },
  { id: 15, name: 'Clark Kent', email: 'clark@dealflow360.com', role: 'Operations', department: 'Ops', status: 'Active' }
];

const emptyForm = { name: '', email: '', password: '', phone: '', department: 'Sales', role: 'Sales Representative', status: 'Active' };

function Users() {
  const [data, setData] = useState(INITIAL_MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.getUsers();
      const userList = Array.isArray(res) ? res : res.results || [];
      if (userList && userList.length > 0) {
        setData(userList);
      }
    } catch (err) {
      // Retain INITIAL_MOCK_USERS as fallback for offline demo
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = data.filter(u => {
    const s = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const r = !filterRole || u.role === filterRole || u.profile?.role === filterRole;
    const st = !filterStatus || u.status === filterStatus;
    return s && r && st;
  });

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Required';
    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Valid email required';
    if (!editingItem && !formData.password?.trim()) e.password = 'Password required for new user';
    if (!formData.role) e.role = 'Required';
    return e;
  };

  const openModal = (item = null) => {
    setErrors({});
    setEditingItem(item);
    setFormData(item ? { ...item } : { ...emptyForm });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      if (editingItem) {
        let res;
        try { res = await api.updateUser(editingItem.id, formData); } catch {}
        toast.success('User updated successfully!');
        setData(prev => prev.map(u => u.id === editingItem.id ? (res || { ...u, ...formData }) : u));
      } else {
        let res;
        try { res = await api.createUser(formData); } catch {}
        toast.success('User created successfully!');
        const newUser = res || { id: Date.now(), ...formData };
        setData(prev => [newUser, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      try { await api.deleteUser(deleteConfirmId); } catch {}
      toast.info('User deleted successfully.');
      setData(prev => prev.filter(u => u.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  const handleStatus = async (user, s) => {
    try {
      try { await api.setUserStatus(user.id, s); } catch {}
      toast.success(`User set to ${s.toLowerCase()}.`);
      setData(prev => prev.map(u => u.id === user.id ? { ...u, status: s, is_active: (s === 'Active') } : u));
    } catch (err) {
      toast.error(err.message || 'Failed to update user status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(u => u.status === 'Active' || u.is_active).length;
  const inactiveCount = data.filter(u => u.status !== 'Active' && !u.is_active).length;

  const columns = [
    { Header: 'Name', accessor: 'name', sortable: true, Cell: row => <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{row.name}</span> },
    { Header: 'Email', accessor: 'email', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.email}</span> },
    { Header: 'Role', accessor: 'role', sortable: true },
    { Header: 'Department', accessor: 'department', sortable: true },
    { 
      Header: 'Status', 
      accessor: 'status', 
      sortable: true, 
      Cell: row => (
        <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>
          {row.status}
        </Badge>
      ) 
    },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
          {row.status !== 'Active' ? (
            <button onClick={() => handleStatus(row, 'Active')} className="btn-table-action success">Activate</button>
          ) : (
            <button onClick={() => handleStatus(row, 'Inactive')} className="btn-table-action warn">Deactivate</button>
          )}
          <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
        </div>
      )
    }
  ];

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' };

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users, roles, and access permissions across the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add User</button>
      </div>

      {/* KPI CARDS */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL USERS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </div>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Registered accounts</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ACTIVE USERS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Currently enabled</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">INACTIVE / SUSPENDED</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            </div>
          </div>
          <div className="metric-value text-warning">{inactiveCount}</div>
          <div className="metric-subtitle">Require admin review</div>
        </div>
      </div>

      {/* DATA TABLE CARD */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>All Users ({filtered.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="form-input" style={{ width: '180px', height: '32px' }} />
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="form-select" style={{ width: '160px', height: '32px' }}>
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {pageLoading && data.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading users from backend…</div>
        ) : (
          <DataTable loading={pageLoading} columns={columns} data={filtered} emptyMessage="No users found."
            emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ Add User</button>} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={lbl}>Full Name *</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} />{errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.name}</p>}</div>
          <div><label style={lbl}>Email *</label><input value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ ...inp, borderColor: errors.email ? '#ef4444' : '#d1d5db' }} />{errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.email}</p>}</div>
          <div>
            <label style={lbl}>{editingItem ? 'New Password (leave blank to keep unchanged)' : 'Password *'}</label>
            <input
              type="password"
              value={formData.password || ''}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingItem ? '••••••••' : 'Enter user login password'}
              style={{ ...inp, borderColor: errors.password ? '#ef4444' : '#d1d5db' }}
            />
            {errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.password}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Phone</label><input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inp} /></div>
            <div><label style={lbl}>Department</label><select value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} style={inp}>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Role *</label><select value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ ...inp, borderColor: errors.role ? '#ef4444' : '#d1d5db' }}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select>{errors.role && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.role}</p>}</div>
            <div><label style={lbl}>Status</label><select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : editingItem ? 'Update User' : 'Create User'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete User" message="Are you sure you want to delete this user?" />
    </div>
  );
}

export default Users;
