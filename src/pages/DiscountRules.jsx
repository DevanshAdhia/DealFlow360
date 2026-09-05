import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal, DataTable, ConfirmDialog } from '../components/common/UI';
import { getDiscountRules, saveEntity, deleteEntity, getCategories } from '../services/storageService';

function DiscountRules() {
  const [rules, setRules] = useState(() => getDiscountRules());
  const [categories] = useState(() => getCategories());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
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
    if (!formData.tier || !formData.category) return toast.error('Tier and Category are required');
    const isNew = !editingRule;
    const entity = { ...formData, id: isNew ? undefined : editingRule.id, maxDiscount: Number(formData.maxDiscount), minMargin: Number(formData.minMargin), priority: Number(formData.priority) };
    const updated = saveEntity('df_discount_rules', entity, isNew);
    setRules(updated);
    toast.success(`Rule ${isNew ? 'created' : 'updated'}`);
    setIsModalOpen(false);
  };

  const executeDelete = () => {
    if (deleteConfirmId) {
      const updated = deleteEntity('df_discount_rules', deleteConfirmId);
      setRules(updated);
      toast.success('Rule deleted');
      setDeleteConfirmId(null);
    }
  };

  const columns = [
    { Header: 'Customer Tier', accessor: 'tier', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.tier}</strong> },
    { Header: 'Category', accessor: 'category', sortable: true },
    { Header: 'Max Discount', accessor: 'maxDiscount', sortable: true, Cell: row => <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{row.maxDiscount}%</span> },
    { Header: 'Min Margin', accessor: 'minMargin', sortable: true, Cell: row => <span style={{ color: 'var(--success)', fontWeight: 600 }}>{row.minMargin}%</span> },
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
        <h1 className="page-title">Discount Rules Engine</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Rule</Button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable columns={columns} data={rules} emptyMessage="No discount rules found." emptyAction={<Button onClick={() => handleOpenModal()}>+ Create Rule</Button>} />
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

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Delete Discount Rule"
        message="Are you sure you want to delete this rule?"
      />
    </div>
  );
}

export default DiscountRules;
