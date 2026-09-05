import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
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
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchRoles = async () => {
    setPageLoading(true);
    try {
      const res = await api.getUserRoles();
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load user roles from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      toast.info('Role definition managed by backend system.');
      setIsModalOpen(false);
      await fetchRoles();
    } catch (err) {
      toast.error(err.message || 'Failed to update role.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    toast.info('Role deletion restricted by system policy.');
    setDeleteConfirmId(null);
  };

  const totalCount = data.length;
  const activeCount = data.length;

  const columns = [
    { Header: 'Role Code', accessor: 'code', sortable: true, Cell: row => row.code || row.name },
    { Header: 'Role Name', accessor: 'name', sortable: true },
    { Header: 'Description', accessor: 'description', sortable: false },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: () => <Badge>Active</Badge> },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => handleOpenModal(row)} className="btn-table-action edit">View Permissions</button>
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
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>System Roles ({data.length})</span>
        </div>
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading roles from backend…</div>
        ) : (
          <DataTable columns={columns} data={data} emptyMessage="No roles found." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Role Detail: ${editingItem.name}` : 'Create New Role'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Role Name *</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} readOnly />
          </div>
          <div>
            <label style={lbl}>Description</label>
            <input value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inp} readOnly />
          </div>
          <div>
            <label style={{ ...lbl, fontWeight: '600' }}>Permissions</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '220px', overflowY: 'auto', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                    style={{ cursor: 'pointer' }}
                  />
                  {perm}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Close</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Role" message="Are you sure you want to delete this role?" />
    </div>
  );
}

export default Roles;
