import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const CONDITIONS = ['Discount', 'Margin', 'Quote Value', 'Risk Score', 'Payment Terms'];
const OPERATORS = ['Greater Than', 'Less Than', 'Equals'];
const APPROVAL_ROLES = ['Sales Manager', 'Finance', 'Admin'];
const emptyForm = { name: '', condition: 'Discount', operator: 'Greater Than', value: 15, approvalRole: 'Sales Manager', priority: 1, status: 'Active' };

function ApprovalRules() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchApprovalRules = async () => {
    setPageLoading(true);
    try {
      const res = await api.getApprovalRules();
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load approval rules from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalRules();
  }, []);
  useEffect(() => { setTablePage(1); }, [search, filterStatus]);
  const filtered = data.filter(r => {
    const s = !search || r.name?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterStatus || r.status === filterStatus);
  });

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Required'; return e; };
  const openModal = (item = null) => { 
    setErrors({}); 
    setEditingItem(item); 
    setFormData(item ? { 
      ...item, 
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
        min_risk_score: Number(formData.min_risk_score || formData.minRiskScore || 0),
        is_active: formData.status === 'Active'
      };

      if (editingItem) {
        await api.updateApprovalRule(editingItem.id, payload);
      } else {
        await api.createApprovalRule(payload);
      }
      toast.success(editingItem ? 'Approval rule updated in database!' : 'Approval rule created in database!');
      setIsModalOpen(false);
      await fetchApprovalRules();
    } catch (err) {
      toast.error(err.message || 'Failed to save approval rule in database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteApprovalRule(deleteConfirmId);
      toast.success('Approval rule deleted successfully!');
      await fetchApprovalRules();
    } catch (err) {
      toast.error(err.message || 'Failed to delete approval rule.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (r) => {
    try {
      const isCurrentlyActive = r.status === 'Active' || r.is_active;
      await api.updateApprovalRule(r.id, { is_active: !isCurrentlyActive });
      toast.success(`Approval rule ${!isCurrentlyActive ? 'activated' : 'deactivated'} successfully!`);
      await fetchApprovalRules();
    } catch (err) {
      toast.error(err.message || 'Failed to update approval rule status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(r => r.status === 'Active' || r.is_active).length;

  const columns = [
    { Header: 'Rule Name', accessor: 'name', sortable: true },
    { Header: 'Condition', accessor: 'condition', sortable: true, Cell: row => row.condition || `Risk Score Range: ${row.min_risk_score ?? 0} - ${row.max_risk_score ?? 100}` },
    { Header: 'Threshold', accessor: 'value', sortable: true, Cell: row => row.value ? `${row.operator || ''} ${row.value}` : `Score ${row.min_risk_score ?? 0}–${row.max_risk_score ?? 100}` },
    { Header: 'Approval Role', accessor: 'approvalRole', sortable: true, Cell: row => row.approvalRole || row.approver_role || 'Sales Manager' },
    { Header: 'Priority', accessor: 'priority', sortable: true, Cell: row => row.priority || `P${row.id}` },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status || (row.is_active ? 'Active' : 'Inactive')}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => openModal(row)} className="btn-table-action edit">Edit</button>
        <button onClick={() => handleToggle(row)} className="btn-table-action warn">Toggle</button>
        <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
      </div>
    }
  ];

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Approval Rules</h1>
          <p className="page-subtitle">Configure multi-level approval workflows triggered automatically by quote conditions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ New Rule</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL RULES</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">Configured workflows</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">ACTIVE RULES</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{activeCount}</div>
          <div className="metric-subtitle">Currently enforced</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>Approval Rules ({filtered.length})</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="form-input" style={{ width: '200px', height: '32px' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '130px', height: '32px' }}>
              <option value="">All Statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading approval rules from backend…</div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No approval rules configured."
            emptyAction={<button className="btn btn-primary" onClick={() => openModal()}>+ New Rule</button>} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Approval Rule' : 'Create Approval Rule'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', fontSize: '0.875rem', color: '#374151' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', marginBottom: '6px' }}>RULE LOGIC PREVIEW</div>
            IF <strong>{formData.condition}</strong> {(formData.operator || '').toLowerCase()} <strong>{formData.value}</strong> → Require <strong>{formData.approvalRole}</strong> approval
          </div>
          <div><label style={lbl}>Rule Name *</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ ...inp, borderColor: errors.name ? '#ef4444' : '#d1d5db' }} />{errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '3px 0 0' }}>{errors.name}</p>}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Condition</label><select value={formData.condition || ''} onChange={e => setFormData({ ...formData, condition: e.target.value })} style={inp}>{CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label style={lbl}>Operator</label><select value={formData.operator || ''} onChange={e => setFormData({ ...formData, operator: e.target.value })} style={inp}>{OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            <div><label style={lbl}>Threshold</label><input type="number" value={formData.value || ''} onChange={e => setFormData({ ...formData, value: e.target.value })} style={inp} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>Approval Role *</label><select value={formData.approvalRole || ''} onChange={e => setFormData({ ...formData, approvalRole: e.target.value })} style={inp}>{APPROVAL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div><label style={lbl}>Priority</label><input type="number" min="1" value={formData.priority || ''} onChange={e => setFormData({ ...formData, priority: e.target.value })} style={inp} /></div>
            <div><label style={lbl}>Status</label><select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inp}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Saving…' : editingItem ? 'Update Rule' : 'Create Rule'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Rule" message="Delete this approval rule?" />
    </div>
  );
}

export default ApprovalRules;
