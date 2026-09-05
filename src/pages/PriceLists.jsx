import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal, DataTable, ConfirmDialog } from '../components/common/UI';
import { getPriceLists, saveEntity, deleteEntity } from '../services/storageService';

function PriceLists() {
  const [priceLists, setPriceLists] = useState(() => getPriceLists());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
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

  const executeDelete = () => {
    if (deleteConfirmId) {
      const updated = deleteEntity('df_pricelists', deleteConfirmId);
      setPriceLists(updated);
      toast.success('Price list deleted');
      setDeleteConfirmId(null);
    }
  };

  const columns = [
    { Header: 'Name', accessor: 'name', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.name}</strong> },
    { Header: 'Tier', accessor: 'tier', sortable: true, Cell: row => <Badge type={row.tier === 'Enterprise' || row.tier === 'Platinum' ? 'success' : 'default'}>{row.tier}</Badge> },
    { Header: 'Currency', accessor: 'currency', sortable: true },
    { Header: 'Effective', accessor: 'effective', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.effective}</span> },
    { Header: 'Expiry', accessor: 'expiry', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.expiry}</span> },
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
        <h1 className="page-title">Price Lists</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Price List</Button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable columns={columns} data={priceLists} emptyMessage="No price lists configured." emptyAction={<Button onClick={() => handleOpenModal()}>+ Create Price List</Button>} />
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

      <ConfirmDialog 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={executeDelete}
        title="Delete Price List"
        message="Are you sure you want to delete this price list? This may affect pending quotations."
      />
    </div>
  );
}

export default PriceLists;
