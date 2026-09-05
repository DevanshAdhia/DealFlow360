import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const ROLES = ['Admin', 'Sales Manager', 'Sales Representative', 'Finance', 'Customer'];
const DEPARTMENTS = ['IT', 'Sales', 'Finance', 'Operations', 'HR'];
const STATUSES = ['Active', 'Inactive', 'Suspended'];
const emptyForm = { name: '', email: '', phone: '', department: 'Sales', role: 'Sales Representative', status: 'Active' };

function Users() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchUsers = async () => {
    setPageLoading(true);
    try {
      const res = await api.getUsers();
      const userList = Array.isArray(res) ? res : res.results || [];
      setData(userList);
    } catch (err) {
      toast.error(err.message || 'Failed to load users from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
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
        const res = await api.updateUser(editingItem.id, formData);
        toast.success('User updated successfully!');
        setData(prev => prev.map(u => u.id === editingItem.id ? (res || { ...u, ...formData }) : u));
      } else {
        const res = await api.createUser(formData);
        toast.success('User created successfully!');
        if (res && res.id) {
          setData(prev => [res, ...prev]);
        } else {
          await fetchUsers();
        }
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
      await api.deleteUser(deleteConfirmId);
      toast.info('User deleted successfully.');
      setData(prev => prev.filter(u => u.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  const handleStatus = async (user, s) => {
    try {
      await api.setUserStatus(user.id, s);
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
    { Header: 'Name', accessor: 'name', sortable: true },
    { Header: 'Email', accessor: 'email', sortable: true },
    { Header: 'Role', accessor: 'role', sortable: true },
    { Header: 'Department', accessor: 'department', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge onChange={s => handleStatus(row, s)}>{row.status}</Badge> },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
          {row.status !== 'Active' && <button onClick={() => handleStatus(row, 'Active')} className="btn-table-action success">Activate</button>}
          {row.status === 'Active' && <button onClick={() => handleStatus(row, 'Inactive')} className="btn-table-action warn">Deactivate</button>}
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
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL USERS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Registered accounts</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ACTIVE USERS</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Currently enabled</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">INACTIVE / SUSPENDED</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="metric-value text-warning">{inactiveCount}</div>
          <div className="metric-subtitle">Require admin review</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ROLES DEFINED</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div className="metric-value text-danger">{ROLES.length}</div>
          <div className="metric-subtitle">System roles available</div>
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
