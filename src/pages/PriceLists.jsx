import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal } from '../components/common/UI';
import { getPriceLists, saveEntity, deleteEntity } from '../services/storageService';

function PriceLists() {
  const [priceLists, setPriceLists] = useState(() => getPriceLists());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [formData, setFormData] = useState({ name: '', tier: 'Standard', currency: 'USD', effective: '', expiry: '', status: 'Active' });

  const handleOpenModal = (list = null) => {
    if (list) {
      setEditingList(list);
      setFormData({ ...list });
    } else {
      setEditingList(null);
      setFormData({ name: '', tier: 'Standard', currency: 'USD', effective: '', expiry: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Name is required');
    const isNew = !editingList;
    const updated = saveEntity('df_pricelists', { ...formData, id: isNew ? undefined : editingList.id }, isNew);
    setPriceLists(updated);
    toast.success(`Price List ${isNew ? 'created' : 'updated'}`);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this price list?')) {
      const updated = deleteEntity('df_pricelists', id);
      setPriceLists(updated);
      toast.success('Price list deleted');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Price Lists</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Price List</Button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Tier</th><th>Currency</th><th>Effective</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {priceLists.map(pl => (
                  <tr key={pl.id}>
                    <td>{pl.name}</td><td>{pl.tier}</td><td>{pl.currency}</td><td>{pl.effective}</td><td>{pl.expiry}</td><td><Badge>{pl.status}</Badge></td>
                    <td>
                      <Button variant="secondary" onClick={() => handleOpenModal(pl)} style={{marginRight: '0.5rem', padding: '0.25rem 0.5rem'}}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(pl.id)} style={{padding: '0.25rem 0.5rem'}}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingList ? 'Edit Price List' : 'Create Price List'}>
        <form onSubmit={handleSubmit}>
          <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Select label="Tier" value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} options={['Standard', 'Silver', 'Gold', 'Platinum', 'Enterprise']} />
          <Select label="Currency" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} options={['USD', 'EUR', 'GBP']} />
          <Input label="Effective Date" type="date" value={formData.effective} onChange={e => setFormData({...formData, effective: e.target.value})} required />
          <Input label="Expiry Date" type="date" value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} required />
          <Select label="Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} options={['Active', 'Inactive']} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default PriceLists;
