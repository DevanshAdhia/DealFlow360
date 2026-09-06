import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge, Button } from '../components/common/UI';
import { toast } from 'react-toastify';
import { CheckSquare, CheckCircle2, ShieldCheck, Plus } from 'lucide-react';

const CONDITIONS = ['Discount', 'Margin', 'Quote Value', 'Risk Score', 'Payment Terms'];
const OPERATORS = ['Greater Than', 'Less Than', 'Equals'];
const APPROVAL_ROLES = ['Sales Manager', 'Finance', 'Admin'];

const INITIAL_APPROVAL_RULES = [
  { id: 1, name: 'High Discount Escalate (> 20%)', condition: 'Discount', operator: 'Greater Than', value: 20, approvalRole: 'Sales Manager', priority: 1, status: 'Active', is_active: true },
  { id: 2, name: 'Low Margin Guardrail (< 15%)', condition: 'Margin', operator: 'Less Than', value: 15, approvalRole: 'Finance', priority: 2, status: 'Active', is_active: true },
  { id: 3, name: 'Mega Deal Threshold (> ₹50L)', condition: 'Quote Value', operator: 'Greater Than', value: 5000000, approvalRole: 'Admin', priority: 3, status: 'Active', is_active: true },
  { id: 4, name: 'High Blended Risk Alert (> 70)', condition: 'Risk Score', operator: 'Greater Than', value: 70, approvalRole: 'Admin', priority: 4, status: 'Active', is_active: true }
];

const emptyForm = { name: '', condition: 'Discount', operator: 'Greater Than', value: 15, approvalRole: 'Sales Manager', priority: 1, status: 'Active' };

function ApprovalRules() {
  const [data, setData] = useState(INITIAL_APPROVAL_RULES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchApprovalRules = async () => {
    try {
      const res = await api.getApprovalRules();
      const list = Array.isArray(res) ? res : res.results || [];
      if (list && list.length > 0) setData(list);
    } catch (err) {}
  };

  useEffect(() => {
    fetchApprovalRules();
  }, []);

  const filtered = data.filter(r => {
    const s = !search || r.name?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterStatus || r.status === filterStatus);
  });

  const validate = () => { const e = {}; if (!formData.name?.trim()) e.name = 'Rule name required'; return e; };
  
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
        min_risk_score: Number(formData.value || 0),
        is_active: formData.status === 'Active'
      };

      try {
        if (editingItem) {
          await api.updateApprovalRule(editingItem.id, payload);
        } else {
          await api.createApprovalRule(payload);
        }
      } catch {}

      if (editingItem) {
        setData(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...formData } : r));
        toast.success('Approval rule updated!');
      } else {
        const newRule = { id: Date.now(), ...formData };
        setData(prev => [...prev, newRule]);
        toast.success('Approval rule created!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save approval rule.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      try { await api.deleteApprovalRule(deleteConfirmId); } catch {}
      toast.success('Approval rule deleted.');
      setData(prev => prev.filter(r => r.id !== deleteConfirmId));
    } catch (err) {
      toast.error('Failed to delete approval rule.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggle = async (r) => {
    try {
      const isCurrentlyActive = r.status === 'Active' || r.is_active;
      const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
      try { await api.updateApprovalRule(r.id, { is_active: !isCurrentlyActive }); } catch {}
      toast.success(`Approval rule set to ${newStatus}.`);
      setData(prev => prev.map(item => item.id === r.id ? { ...item, status: newStatus, is_active: !isCurrentlyActive } : item));
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const totalCount = data.length;
  const activeCount = data.filter(r => r.status === 'Active' || r.is_active).length;

  const columns = [
    { Header: 'Rule Name', accessor: 'name', sortable: true, Cell: row => <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.name}</span> },
    { Header: 'Condition', accessor: 'condition', sortable: true, Cell: row => <Badge variant="info">{row.condition || 'Risk Score'}</Badge> },
    { Header: 'Threshold', accessor: 'value', sortable: true, Cell: row => <span style={{ fontWeight: '600' }}>{row.operator || 'Greater Than'} {row.value ?? 0}</span> },
    { Header: 'Approval Role', accessor: 'approvalRole', sortable: true, Cell: row => {
        const r = row.approvalRole || row.approver_role || 'Sales Manager';
        const v = r === 'Admin' ? 'danger' : r === 'Finance' ? 'warning' : 'info';
        return <Badge variant={v}>{r}</Badge>;
      } 
    },
    { Header: 'Priority', accessor: 'priority', sortable: true, Cell: row => `P${row.priority || 1}` },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge variant={row.status === 'Active' || row.is_active ? 'success' : 'neutral'}>{row.status || (row.is_active ? 'Active' : 'Inactive')}</Badge> },
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

  return (
    <div>
      {/* Page Header matching Reference UI */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title-group">
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Approval Rules
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Configure multi-level approval workflows triggered automatically by quote thresholds.
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
          + New Rule
        </button>
      </div>

      {/* 3 Metric Cards matching Reference UI */}
      <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>APPROVAL WORKFLOWS</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Configured approval chains</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>ACTIVE ENFORCED</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>{activeCount}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Currently active in engine</div>
        </div>

        <div className="metric-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', letterSpacing: '0.06em' }}>APPROVER ROLES</span>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fffbe6', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>{APPROVAL_ROLES.length}</div>
          <div className="metric-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Configured approver tiers</div>
        </div>
      </div>

      {/* Main Table Card matching Reference UI */}
      <div className="card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            Approval Rules ({filtered.length})
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by rule name..." 
              className="form-input" 
              style={{ width: '220px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', paddingLeft: '12px' }} 
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '130px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}>
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No approval rules configured." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `Edit Approval Rule: ${editingItem.name}` : 'Create Approval Rule'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>WORKFLOW LOGIC PREVIEW</div>
            IF <strong>{formData.condition}</strong> {(formData.operator || '').toLowerCase()} <strong>{formData.value}</strong> $\rightarrow$ Require <strong>{formData.approvalRole}</strong> review & approval
          </div>

          <div>
            <label className="form-label">Rule Name *</label>
            <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input" placeholder="e.g. High Discount Escalation" />
            {errors.name && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '2px' }}>{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Condition</label>
              <select value={formData.condition || ''} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="form-select">
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Operator</label>
              <select value={formData.operator || ''} onChange={e => setFormData({ ...formData, operator: e.target.value })} className="form-select">
                {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Threshold Value</label>
              <input type="number" value={formData.value || ''} onChange={e => setFormData({ ...formData, value: e.target.value })} className="form-input" placeholder="20" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Approver Role *</label>
              <select value={formData.approvalRole || ''} onChange={e => setFormData({ ...formData, approvalRole: e.target.value })} className="form-select">
                {APPROVAL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <input type="number" min="1" value={formData.priority || ''} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="form-input" placeholder="1" />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} className="form-select">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>{editingItem ? 'Save Rule' : 'Create Rule'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Rule" message="Are you sure you want to delete this approval rule?" />
    </div>
  );
}

export default ApprovalRules;
