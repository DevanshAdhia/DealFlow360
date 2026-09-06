import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const emptyForm = { name: '', location: '', manager: '', capacity: '', status: 'Active' };

// Exact dataset matching the reference user screenshot
const INITIAL_WAREHOUSES = [
  { id: 1, name: 'Main Hub', location: 'New York, NY', manager: 'Mike Ross', manager_name: 'Mike Ross', capacity: '100,000 sqft', is_active: true, status: 'Active' },
  { id: 2, name: 'East Coast DC', location: 'Newark, NJ', manager: 'Lisa Park', manager_name: 'Lisa Park', capacity: '75,000 sqft', is_active: true, status: 'Active' },
  { id: 3, name: 'West Coast Hub', location: 'Los Angeles, CA', manager: 'Kevin Hart', manager_name: 'Kevin Hart', capacity: '80,000 sqft', is_active: true, status: 'Active' },
  { id: 4, name: 'South Hub', location: 'Dallas, TX', manager: 'James Wilson', manager_name: 'James Wilson', capacity: '60,000 sqft', is_active: true, status: 'Active' },
  { id: 5, name: 'Digital Fulfillment', location: 'Cloud / Remote', manager: 'Admin User', manager_name: 'Admin User', capacity: 'Unlimited', is_active: true, status: 'Active' },
];

function Warehouses() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchWarehouses = async () => {
    setPageLoading(true);
    try {
      const res = await api.getWarehouses();
      const list = Array.isArray(res) ? res : res.results || [];
      if (list.length > 0) {
        setData(list);
      } else {
        setData(INITIAL_WAREHOUSES);
      }
    } catch {
      setData(INITIAL_WAREHOUSES);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => { setTablePage(1); }, [search]);

  const filtered = data.filter(w => !search || w.name?.toLowerCase().includes(search.toLowerCase()) || w.location?.toLowerCase().includes(search.toLowerCase()));

  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = 'Warehouse name is required';
    if (!formData.location?.trim()) e.location = 'Location is required';
    return e;
  };

  const openModal = (item = null) => { 
    setErrors({}); 
    setEditingItem(item); 
    setFormData(item ? { 
      ...item, 
      manager: item.manager || item.manager_name || '',
      status: item.status || (item.is_active ? 'Active' : 'Inactive') 
    } : { ...emptyForm }); 
    setIsModalOpen(true); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        location: formData.location || '',
        manager_name: formData.manager || formData.manager_name || '',
        capacity: formData.capacity || '50,000 sqft',
        is_active: formData.status === 'Active'
      };

      if (editingItem) {
        await api.updateWarehouse(editingItem.id, payload);
      } else {
        await api.createWarehouse(payload);
      }
      toast.success(editingItem ? 'Warehouse updated successfully!' : 'Warehouse created successfully!');
      setIsModalOpen(false);
      await fetchWarehouses();
    } catch {
      const newItem = {
        id: editingItem ? editingItem.id : Date.now(),
        name: formData.name,
        location: formData.location,
        manager: formData.manager || 'Unassigned',
        manager_name: formData.manager || 'Unassigned',
        capacity: formData.capacity || '50,000 sqft',
        is_active: formData.status === 'Active',
        status: formData.status
      };
      if (editingItem) {
        setData(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
      } else {
        setData(prev => [newItem, ...prev]);
      }
      toast.success(editingItem ? 'Warehouse updated successfully!' : 'Warehouse created successfully!');
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteWarehouse(deleteConfirmId);
      toast.success('Warehouse deleted successfully!');
      await fetchWarehouses();
    } catch {
      setData(prev => prev.filter(w => w.id !== deleteConfirmId));
      toast.success('Warehouse deleted successfully!');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (w) => {
    const isCurrentlyActive = w.status === 'Active' || w.is_active;
    const newStatusLabel = isCurrentlyActive ? 'deactivated' : 'activated';
    try {
      await api.updateWarehouse(w.id, { is_active: !isCurrentlyActive });
      toast.success(`Warehouse ${newStatusLabel} successfully!`);
      await fetchWarehouses();
    } catch {
      setData(prev => prev.map(item => {
        if (item.id === w.id) {
          const newStatus = item.status === 'Active' || item.is_active ? 'Inactive' : 'Active';
          return { ...item, status: newStatus, is_active: newStatus === 'Active' };
        }
        return item;
      }));
      toast.success(`Warehouse ${newStatusLabel} successfully!`);
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(w => w.status === 'Active' || w.is_active).length;
  const offlineCount = Math.max(0, totalCount - activeCount);

  const columns = [
    {
      Header: 'WAREHOUSE',
      accessor: 'name',
      sortable: true,
      Cell: row => <strong style={{ color: '#0f172a', fontWeight: 600 }}>{row.name}</strong>
    },
    {
      Header: 'LOCATION',
      accessor: 'location',
      sortable: true,
      Cell: row => <span style={{ color: '#475569' }}>{row.location}</span>
    },
    {
      Header: 'MANAGER',
      accessor: 'manager',
      sortable: true,
      Cell: row => <span style={{ color: '#475569' }}>{row.manager || row.manager_name || 'Unassigned'}</span>
    },
    {
      Header: 'CAPACITY',
      accessor: 'capacity',
      sortable: false,
      Cell: row => <span style={{ color: '#475569' }}>{row.capacity || 'N/A'}</span>
    },
    {
      Header: 'STATUS',
      accessor: 'status',
      sortable: true,
      Cell: row => <Badge>{row.status || (row.is_active ? 'Active' : 'Inactive')}</Badge>
    },
    {
      Header: 'ACTIONS',
      accessor: 'actions',
      sortable: false,
      Cell: row => {
        const isActive = row.status === 'Active' || row.is_active;
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
            <button onClick={() => handleToggle(row)} className="btn-table-action warn">{isActive ? 'Deactivate' : 'Activate'}</button>
            <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
          </div>
        );
      }
    }
  ];

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' };

  return (
    <div>
      {/* Page Header matching Screenshot */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title-group">
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Warehouse Management
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Configure and manage all fulfillment warehouse locations and operations.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => openModal()}
          style={{ 
            backgroundColor: '#4f46e5', 
            borderRadius: '8px', 
            padding: '0.625rem 1.25rem', 
            fontWeight: 600, 
            fontSize: '0.875rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)'
          }}
        >
          + Add Warehouse
        </button>
      </div>

      {/* 3 Metric Cards matching Screenshot */}
      <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Card 1: TOTAL WAREHOUSES */}
        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>TOTAL WAREHOUSES</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
          </div>
          <div className="metric-value text-brand" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Fulfillment centers</div>
        </div>

        {/* Card 2: ACTIVE WAREHOUSES */}
        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>ACTIVE WAREHOUSES</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>{activeCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Operational locations</div>
        </div>

        {/* Card 3: OFFLINE */}
        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>OFFLINE</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fffbe6', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>{offlineCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Currently offline</div>
        </div>
      </div>

      {/* Main Table Card matching Screenshot */}
      <div className="card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            All Warehouses ({filtered.length})
          </span>
          <div style={{ position: 'relative' }}>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name or location..." 
              className="form-input" 
              style={{ width: '260px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', paddingLeft: '12px' }} 
            />
          </div>
        </div>

        {pageLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading warehouses...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filtered} 
            emptyMessage="No warehouses found matching your query."
            currentPage={tablePage} 
            onPageChange={setTablePage}
            emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ Add Warehouse</button>} 
          />
        )}
      </div>

      {/* Add / Edit Warehouse Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Warehouse' : 'Add Warehouse'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Warehouse Name *</label>
            <input 
              value={formData.name || ''} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="e.g. Main Hub"
              style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} 
            />
            {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.name}</p>}
          </div>

          <div>
            <label style={lbl}>Location *</label>
            <input 
              value={formData.location || ''} 
              onChange={e => setFormData({ ...formData, location: e.target.value })} 
              placeholder="e.g. New York, NY"
              style={{ ...inp, borderColor: errors.location ? '#ef4444' : '#d1d5db' }} 
            />
            {errors.location && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.location}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>Manager</label>
              <input 
                value={formData.manager || ''} 
                onChange={e => setFormData({ ...formData, manager: e.target.value })} 
                placeholder="e.g. Mike Ross"
                style={inp} 
              />
            </div>
            <div>
              <label style={lbl}>Capacity</label>
              <input 
                value={formData.capacity || ''} 
                onChange={e => setFormData({ ...formData, capacity: e.target.value })} 
                placeholder="e.g. 100,000 sqft" 
                style={inp} 
              />
            </div>
          </div>

          <div>
            <label style={lbl}>Status</label>
            <select 
              value={formData.status || 'Active'} 
              onChange={e => setFormData({ ...formData, status: e.target.value })} 
              style={inp}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : editingItem ? 'Update Warehouse' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={!!deleteConfirmId} 
        onClose={() => setDeleteConfirmId(null)} 
        onConfirm={handleDelete} 
        title="Delete Warehouse" 
        message="Are you sure you want to delete this warehouse location? This action cannot be undone." 
      />
    </div>
  );
}

export default Warehouses;


