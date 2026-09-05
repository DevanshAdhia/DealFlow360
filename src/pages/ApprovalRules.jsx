import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal } from '../components/common/UI';
import { getApprovalRules, saveEntity, deleteEntity, getRoles } from '../services/storageService';

function ApprovalRules() {
  const [rules, setRules] = useState(() => getApprovalRules());
  const [roles] = useState(() => getRoles());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
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
    if (!formData.name || !formData.role) {
      toast.error('Name and Role are required');
      return;
    }
    const isNew = !editingRule;
    const entity = { ...formData, id: isNew ? undefined : editingRule.id, value: Number(formData.value), priority: Number(formData.priority) };
    const updated = saveEntity('df_approval_rules', entity, isNew);
    setRules(updated);
    toast.success(`Rule ${isNew ? 'created' : 'updated'}`);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this rule?')) {
      const updated = deleteEntity('df_approval_rules', id);
      setRules(updated);
      toast.success('Rule deleted');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Approval Workflow Engine</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Rule</Button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Condition</th>
                  <th>Approver Role</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td><span style={{fontFamily: 'monospace', background: 'var(--surface-secondary)', padding: '2px 6px', borderRadius: '4px'}}>IF {r.condition} {r.operator} {r.value}</span></td>
                    <td>{r.role}</td>
                    <td>{r.priority}</td>
                    <td><Badge>{r.status}</Badge></td>
                    <td>
                      <Button variant="secondary" onClick={() => handleOpenModal(r)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(r.id)} style={{ padding: '0.25rem 0.5rem' }}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  );
}

export default ApprovalRules;
