import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal } from '../components/common/UI';
import { getDiscountRules, saveEntity, deleteEntity, getCategories } from '../services/storageService';

function DiscountRules() {
  const [rules, setRules] = useState(() => getDiscountRules());
  const [categories] = useState(() => getCategories());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({ tier: 'Standard', category: '', maxDiscount: 0, minMargin: 0, priority: 1, status: 'Active' });

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({ ...rule });
    } else {
      setEditingRule(null);
      setFormData({ tier: 'Standard', category: '', maxDiscount: 0, minMargin: 0, priority: 1, status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tier || !formData.category) {
      toast.error('Tier and Category are required');
      return;
    }
    const isNew = !editingRule;
    const entity = { ...formData, id: isNew ? undefined : editingRule.id, maxDiscount: Number(formData.maxDiscount), minMargin: Number(formData.minMargin), priority: Number(formData.priority) };
    const updated = saveEntity('df_discount_rules', entity, isNew);
    setRules(updated);
    toast.success(`Rule ${isNew ? 'created' : 'updated'}`);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this rule?')) {
      const updated = deleteEntity('df_discount_rules', id);
      setRules(updated);
      toast.success('Rule deleted');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Discount Rules Engine</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Rule</Button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Tier</th>
                  <th>Category</th>
                  <th>Max Discount</th>
                  <th>Min Margin</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.tier}</td>
                    <td>{r.category}</td>
                    <td>{r.maxDiscount}%</td>
                    <td>{r.minMargin}%</td>
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
          <Select label="Customer Tier" value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} options={['Standard', 'Silver', 'Gold', 'Platinum', 'Enterprise']} />
          <Select label="Product Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} options={['', ...categories.map(c => c.name)]} required />
          <Input label="Max Discount (%)" type="number" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} />
          <Input label="Min Margin (%)" type="number" value={formData.minMargin} onChange={e => setFormData({...formData, minMargin: e.target.value})} />
          <Input label="Priority (lower = higher priority)" type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} />
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

export default DiscountRules;
