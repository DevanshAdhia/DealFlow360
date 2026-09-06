import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge, Button, Input } from '../components/common/UI';
import { toast } from 'react-toastify';
import { ShieldCheck, Users as UsersIcon, CheckCircle2, Search, Plus } from 'lucide-react';

const ALL_PERMISSIONS = [
  'View Customers', 'Create Customers', 'Edit Customers', 'Delete Customers',
  'View Quotations', 'Create Quotations', 'Approve Quotations', 'Reject Quotations',
  'View Orders', 'Create Orders', 'Cancel Orders',
  'View Inventory', 'Manage Inventory', 'Allocate Inventory',
  'View Billing', 'Manage Billing',
  'View Reports', 'Manage Users', 'Manage Products', 'Manage Rules', 'View Audit Logs'
];

const MOCK_ROLES = [
  { id: 1, name: 'Admin', description: 'Full administrative access across all modules, governance, and system settings.', users: 3, status: 'Active', permissions: ALL_PERMISSIONS },
  { id: 2, name: 'Sales Manager', description: 'Can approve quotations up to ₹1 Crore, manage team pipelines, and view analytics.', users: 4, status: 'Active', permissions: ['View Customers', 'Create Customers', 'Edit Customers', 'View Quotations', 'Create Quotations', 'Approve Quotations', 'View Orders', 'View Reports'] },
  { id: 3, name: 'Sales Representative', description: 'Can create and submit quotations, manage lead pipelines, and view products.', users: 6, status: 'Active', permissions: ['View Customers', 'Create Customers', 'View Quotations', 'Create Quotations', 'View Products'] },
  { id: 4, name: 'Finance', description: 'Can manage billing, invoice generation, tax reconciliation, and payment schedules.', users: 2, status: 'Active', permissions: ['View Quotations', 'View Orders', 'View Billing', 'Manage Billing', 'View Reports'] },
  { id: 5, name: 'Operations', description: 'Manages fulfillment orders, warehouse allocation, and inventory stock.', users: 3, status: 'Active', permissions: ['View Orders', 'View Inventory', 'Manage Inventory', 'Allocate Inventory'] },
  { id: 6, name: 'Customer', description: 'Customer portal access for quote acceptance and negotiation requests.', users: 15, status: 'Active', permissions: ['View Quotations'] }
];

const emptyForm = { name: '', description: '', users: 0, status: 'Active', permissions: [] };

function Roles() {
  const [data, setData] = useState(MOCK_ROLES);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    try {
      const res = await api.getUserRoles();
      const list = Array.isArray(res) ? res : res.results || [];
      if (list && list.length > 0) {
        setData(list);
      }
    } catch (err) {
      // Maintain mock fallback
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filtered = data.filter(r => 
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Role name is required';
    return e;
  };

  const handleOpenModal = (item = null) => {
    setErrors({});
    if (item) { 
      setEditingItem(item); 
      setFormData({ permissions: item.permissions || ALL_PERMISSIONS.slice(0, 4), ...item }); 
    } else { 
      setEditingItem(null); 
      setFormData({ ...emptyForm, permissions: ALL_PERMISSIONS.slice(0, 4) }); 
    }
    setIsModalOpen(true);
  };

  const togglePermission = (perm) => {
    const perms = formData.permissions || [];
    if (perms.includes(perm)) {
      setFormData({ ...formData, permissions: perms.filter(p => p !== perm) });
    } else {
      setFormData({ ...formData, permissions: [...perms, perm] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      if (editingItem) {
        toast.success(`Role "${formData.name}" updated successfully!`);
        setData(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...formData } : r));
      } else {
        toast.success(`New role "${formData.name}" created!`);
        const newRole = { id: Date.now(), ...formData, users: 0 };
        setData(prev => [...prev, newRole]);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update role.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    toast.info('Role deleted successfully.');
    setData(prev => prev.filter(r => (r.id || r.name) !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  const totalCount = data.length;
  const activeCount = data.filter(r => r.status === 'Active' || !r.status).length;
  const assignedUsersCount = data.reduce((acc, r) => acc + (r.users_count || r.users || 0), 0);

  const columns = [
    { Header: 'Role Name', accessor: 'name', sortable: true, Cell: row => <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.name}</span> },
    { Header: 'Description', accessor: 'description', sortable: false, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.description}</span> },
    { Header: 'Users Assigned', accessor: 'users', sortable: true, Cell: row => <Badge variant="info">{row.users_count || row.users || 0} Users</Badge> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>{row.status || 'Active'}</Badge> },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button onClick={() => handleOpenModal(row)} className="btn-table-action edit">Edit Permissions</button>
          <button onClick={() => setDeleteConfirmId(row.id || row.name)} className="btn-table-action danger">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Roles & Permissions</h1>
          <p className="page-subtitle">Configure system access roles, user assignments, and RBAC permissions across DealFlow360.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">+ New Role</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL ROLES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Access control groups</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ACTIVE ROLES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Assignable system roles</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ASSIGNED USERS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <UsersIcon size={18} />
            </div>
          </div>
          <div className="metric-value text-warning">{assignedUsersCount}</div>
          <div className="metric-subtitle">Users assigned across platform</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span>System Roles ({filtered.length})</span>
          <div style={{ width: '220px' }}>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search roles..." 
              className="form-input" 
              style={{ height: '32px' }} 
            />
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No roles found matching search." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit Role: ${editingItem.name}` : 'Create New Role'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="form-label">Role Name *</label>
            <input 
              value={formData.name || ''} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              className="form-input" 
              placeholder="e.g. Finance Approver"
            />
            {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.name}</span>}
          </div>

          <div>
            <label className="form-label">Description</label>
            <input 
              value={formData.description || ''} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              className="form-input"
              placeholder="Describe access responsibilities..."
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <label className="form-label" style={{ margin: 0 }}>Permissions Matrix</label>
              <Badge variant="info">{(formData.permissions || []).length} Selected</Badge>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 'var(--space-2)', 
              maxHeight: '220px', 
              overflowY: 'auto', 
              padding: 'var(--space-3)', 
              backgroundColor: 'var(--surface-secondary)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border)' 
            }}>
              {ALL_PERMISSIONS.map(perm => {
                const isChecked = (formData.permissions || []).includes(perm);
                return (
                  <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(perm)}
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    {perm}
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>{editingItem ? 'Update Role' : 'Create Role'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Role" message="Are you sure you want to delete this role?" />
    </div>
  );
}

export default Roles;
