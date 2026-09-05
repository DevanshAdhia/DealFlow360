import React, { useState } from 'react';
import { getRoles, saveEntity, deleteEntity, addAuditLog } from '../services/storageService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const ALL_PERMISSIONS = [
  'View Customers', 'Create Customers', 'Edit Customers', 'Delete Customers',
  'View Quotations', 'Create Quotations', 'Approve Quotations', 'Reject Quotations',
  'View Orders', 'Create Orders', 'Cancel Orders',
  'View Inventory', 'Manage Inventory', 'Allocate Inventory',
  'View Billing', 'Manage Billing',
  'View Reports', 'Manage Users', 'Manage Products', 'Manage Rules', 'View Audit Logs'
];

const emptyForm = { name: '', description: '', users: 0, status: 'Active', permissions: [] };

function Roles() {
  const [data, setData] = useState(() => getRoles());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshData = () => setData(getRoles());

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Role name is required';
    return e;
  };

  const handleOpenModal = (item = null) => {
    setErrors({});
    if (item) { setEditingItem(item); setFormData({ permissions: [], ...item }); }
    else { setEditingItem(null); setFormData({ ...emptyForm }); }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const isNew = !editingItem;
      saveEntity('df_roles', formData, isNew);
      addAuditLog(null, isNew ? 'Created Role' : 'Updated Role', 'Role', `${isNew ? 'Created' : 'Updated'} role: ${formData.name}`);
      toast.success(isNew ? 'Role created!' : 'Role updated!');
      setIsModalOpen(false);
      setLoading(false);
      refreshData();
    }, 400);
  };

  const handleDelete = () => {
    const r = data.find(x => x.id === deleteConfirmId);
    deleteEntity('df_roles', deleteConfirmId);
    addAuditLog(null, 'Deleted Role', 'Role', `Deleted role: ${r?.name}`);
    toast.info('Role deleted.');
    setDeleteConfirmId(null);
    refreshData();
  };

  const totalCount = data.length;
  const activeCount = data.filter(r => r.status === 'Active').length;
  const totalUsers = data.reduce((s, r) => s + (r.users || 0), 0);

  const columns = [
    { Header: 'Role Name', accessor: 'name', sortable: true },
    { Header: 'Description', accessor: 'description', sortable: false },
    { Header: 'Users Assigned', accessor: 'users', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status}</Badge> },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => handleOpenModal(row)} className="btn-table-action edit">Edit Permissions</button>
          <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
        </div>
      )
    }
  ];

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Roles & Permissions</h1>
          <p className="page-subtitle">Configure system access roles, user assignments, and RBAC permissions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ New Role</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL ROLES</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Access control groups</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ACTIVE ROLES</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Assignable roles</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ASSIGNED USERS</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="metric-value text-warning">{totalUsers}</div>
          <div className="metric-subtitle">Total system users</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>System Roles ({data.length})</span>
        </div>
        <DataTable columns={columns} data={data} emptyMessage="No roles found." emptyAction={<button className="btn btn-primary" onClick={() => handleOpenModal()}>+ New Role</button>} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit Role: ${editingItem.name}` : 'Create New Role'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Role Name *</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} />
            {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.name}</p>}
          </div>
          <div>
            <label style={lbl}>Description</label>
            <input value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inp} />
          </div>
          <div>
            <label style={{ ...lbl, fontWeight: '600' }}>Permissions</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '220px', overflowY: 'auto', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={(formData.permissions || []).includes(perm)}
                    onChange={() => togglePermission(perm)}
                    style={{ cursor: 'pointer' }}
                  />
                  {perm}
                </label>
              ))}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>{(formData.permissions || []).length} of {ALL_PERMISSIONS.length} permissions selected</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving…' : editingItem ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Role" message="Are you sure you want to delete this role? Users assigned to this role may lose access." />
    </div>
  );
}

export default Roles;
