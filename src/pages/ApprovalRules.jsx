import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal, DataTable, ConfirmDialog } from '../components/common/UI';
import { getApprovalRules, saveEntity, deleteEntity, getRoles } from '../services/storageService';

function ApprovalRules() {
  const [rules, setRules] = useState(() => getApprovalRules());
  const [roles] = useState(() => getRoles());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', condition: 'Discount', operator: 'Greater Than', value: 0, role: '', priority: 1, status: 'Active' });

  const conditions = ['Discount', 'Margin', 'Risk Score', 'Quote Value'];
  const operators = ['Greater Than', 'Less Than', 'Equals'];

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({ ...rule });
    } else {
      setEditingRule(null);
      setFormData({ name: '', condition: 'Discount', operator: 'Greater Than', value: 0, role: '', priority: 1, status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return toast.error('Name and Role are required');
    const isNew = !editingRule;
    const entity = { ...formData, id: isNew ? undefined : editingRule.id, value: Number(formData.value), priority: Number(formData.priority) };
    const updated = saveEntity('df_approval_rules', entity, isNew);
    setRules(updated);
    toast.success(`Rule ${isNew ? 'created' : 'updated'}`);
    setIsModalOpen(false);
  };

  const executeDelete = () => {
    if (deleteConfirmId) {
      const updated = deleteEntity('df_approval_rules', deleteConfirmId);
      setRules(updated);
      toast.success('Rule deleted');
      setDeleteConfirmId(null);
    }
  };

  const columns = [
    { Header: 'Rule Name', accessor: 'name', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.name}</strong> },
    { Header: 'Condition', accessor: 'condition', sortable: false, Cell: row => <span style={{fontFamily: 'monospace', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.875rem'}}>IF {row.condition} {row.operator} {row.value}</span> },
    { Header: 'Approver Role', accessor: 'role', sortable: true },
    { Header: 'Priority', accessor: 'priority', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => handleOpenModal(row)} style={{ padding: '0.375rem 0.75rem' }}>Edit</Button>
          <Button variant="danger" onClick={() => setDeleteConfirmId(row.id)} style={{ padding: '0.375rem 0.75rem' }}>Delete</Button>
        </div>
      ) 
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Approval Workflow Engine</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Rule</Button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable columns={columns} data={rules} emptyMessage="No approval rules configured." emptyAction={<Button onClick={() => handleOpenModal()}>+ Create Rule</Button>} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRule ? 'Edit Rule' : 'Create Rule'}>
        <form onSubmit={handleSubmit}>
          <Input label="Rule Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Select label="Condition" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} options={conditions} />
          <Select label="Operator" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} options={operators} />
          <Input label="Threshold Value" type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} required />
          <Select label="Approval Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} options={['', ...roles.map(r => r.name)]} required />
          <Input label="Priority" type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} />
          <Select label="Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} options={['Active', 'Inactive']} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Rule</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Delete Approval Rule"
        message="Are you sure you want to delete this approval rule? It may change how future quotations are routed."
      />
    </div>
  );
}

export default ApprovalRules;
